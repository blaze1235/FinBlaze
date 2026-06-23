import { Router } from "express";
import db, { transaction } from "../db.js";
import { sendLanCommand, lanErrorToHttp } from "../tcp.js";

const router = Router();

// ── Helpers ────────────────────────────────────────────────────────────────

function buildPC(pcRow) {
  const session = db.prepare("SELECT start_time, username FROM sessions WHERE pc_id = ?").get(pcRow.id);
  const cartRows = db.prepare(
    "SELECT id, product_id, product_name, price, quantity, paid_instant, timestamp FROM cart_items WHERE pc_id = ? ORDER BY id ASC"
  ).all(pcRow.id);

  return {
    id: pcRow.id,
    name: pcRow.name,
    type: pcRow.type,
    ipAddress: pcRow.ip_address,
    ratePerHour: pcRow.rate_per_hour,
    status: pcRow.status,
    session: session ? { startTime: session.start_time, user: session.username } : undefined,
    cart: cartRows.map((row) => ({
      id: row.product_id,
      name: row.product_name,
      price: row.price,
      quantity: row.quantity,
      paidInstant: row.paid_instant === 1,
      timestamp: row.timestamp,
    })),
  };
}

function getAllPCs() {
  return db.prepare("SELECT * FROM pcs ORDER BY id ASC").all().map(buildPC);
}

// ── Routes ────────────────────────────────────────────────────────────────

// GET /api/pcs
router.get("/", (req, res) => {
  res.json(getAllPCs());
});

// GET /api/pcs/:id
router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM pcs WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "PC not found" });
  res.json(buildPC(row));
});

// PATCH /api/pcs/:id/status  — set Available or Maintenance
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!["Available", "Maintenance"].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Use Available or Maintenance." });
  }
  const info = db.prepare("UPDATE pcs SET status = ? WHERE id = ?").run(status, req.params.id);
  if (!info.changes) return res.status(404).json({ error: "PC not found" });
  res.json(buildPC(db.prepare("SELECT * FROM pcs WHERE id = ?").get(req.params.id)));
});

// POST /api/pcs/:id/session  — start a new session
router.post("/:id/session", (req, res) => {
  const { username } = req.body;
  if (!username?.trim()) return res.status(400).json({ error: "username is required" });

  const pc = db.prepare("SELECT * FROM pcs WHERE id = ?").get(req.params.id);
  if (!pc) return res.status(404).json({ error: "PC not found" });
  if (pc.status === "Occupied") return res.status(409).json({ error: "PC already has an active session" });

  transaction(() => {
    db.prepare("DELETE FROM cart_items WHERE pc_id = ?").run(pc.id);
    db.prepare("DELETE FROM sessions WHERE pc_id = ?").run(pc.id);
    db.prepare("INSERT INTO sessions (pc_id, start_time, username) VALUES (?, ?, ?)").run(
      pc.id, new Date().toISOString(), username.trim()
    );
    db.prepare("UPDATE pcs SET status = 'Occupied' WHERE id = ?").run(pc.id);
  });

  res.json(buildPC(db.prepare("SELECT * FROM pcs WHERE id = ?").get(pc.id)));
});

// DELETE /api/pcs/:id/session  — emergency end session (no receipt)
router.delete("/:id/session", (req, res) => {
  const pc = db.prepare("SELECT * FROM pcs WHERE id = ?").get(req.params.id);
  if (!pc) return res.status(404).json({ error: "PC not found" });

  transaction(() => {
    const cartRows = db.prepare("SELECT product_id, quantity FROM cart_items WHERE pc_id = ?").all(pc.id);
    for (const item of cartRows) {
      db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?").run(item.quantity, item.product_id);
    }
    db.prepare("DELETE FROM cart_items WHERE pc_id = ?").run(pc.id);
    db.prepare("DELETE FROM sessions WHERE pc_id = ?").run(pc.id);
    db.prepare("UPDATE pcs SET status = 'Available' WHERE id = ?").run(pc.id);
  });

  res.json(buildPC(db.prepare("SELECT * FROM pcs WHERE id = ?").get(pc.id)));
});

// POST /api/pcs/:id/cart  — add item to cart
router.post("/:id/cart", (req, res) => {
  const { productId, quantity, paidInstant } = req.body;
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: "productId and quantity >= 1 are required" });
  }

  const pc = db.prepare("SELECT * FROM pcs WHERE id = ?").get(req.params.id);
  if (!pc) return res.status(404).json({ error: "PC not found" });

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  transaction(() => {
    const newStock = Math.max(0, product.stock - quantity);
    db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(newStock, productId);
    db.prepare(
      "INSERT INTO cart_items (pc_id, product_id, product_name, price, quantity, paid_instant, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(pc.id, product.id, product.name, product.price, quantity, paidInstant ? 1 : 0, new Date().toISOString());
  });

  res.json(buildPC(db.prepare("SELECT * FROM pcs WHERE id = ?").get(pc.id)));
});

// DELETE /api/pcs/:id/cart/:itemIndex  — remove cart item by index (0-based), restore stock
router.delete("/:id/cart/:itemIndex", (req, res) => {
  const pc = db.prepare("SELECT * FROM pcs WHERE id = ?").get(req.params.id);
  if (!pc) return res.status(404).json({ error: "PC not found" });

  const cartRows = db.prepare("SELECT * FROM cart_items WHERE pc_id = ? ORDER BY id ASC").all(pc.id);
  const idx = parseInt(req.params.itemIndex, 10);
  if (isNaN(idx) || idx < 0 || idx >= cartRows.length) {
    return res.status(400).json({ error: "Invalid item index" });
  }

  const item = cartRows[idx];
  transaction(() => {
    db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?").run(item.quantity, item.product_id);
    db.prepare("DELETE FROM cart_items WHERE id = ?").run(item.id);
  });

  res.json(buildPC(db.prepare("SELECT * FROM pcs WHERE id = ?").get(pc.id)));
});

// POST /api/pcs/:id/checkout  — atomic checkout
router.post("/:id/checkout", (req, res) => {
  const { paymentMethod, timeCost, unpaidItemsCost, paidItemsCost, totalCollected, operatorId, shiftId } = req.body;
  if (!paymentMethod || totalCollected == null) {
    return res.status(400).json({ error: "paymentMethod and totalCollected are required" });
  }

  const pc = db.prepare("SELECT * FROM pcs WHERE id = ?").get(req.params.id);
  if (!pc) return res.status(404).json({ error: "PC not found" });

  const session = db.prepare("SELECT * FROM sessions WHERE pc_id = ?").get(pc.id);
  if (!session) return res.status(409).json({ error: "No active session on this PC" });

  const cartRows = db.prepare("SELECT * FROM cart_items WHERE pc_id = ? ORDER BY id ASC").all(pc.id);

  const receiptId = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
  const endTime = new Date().toISOString();
  const durationMs = Date.now() - new Date(session.start_time).getTime();

  const receipt = transaction(() => {
    db.prepare(`
      INSERT INTO receipts (id, pc_name, username, start_time, end_time, duration_ms,
        time_cost, unpaid_items_cost, paid_items_cost, total_collected, payment_method, operator_id, shift_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      receiptId, pc.name, session.username, session.start_time, endTime, durationMs,
      timeCost ?? 0, unpaidItemsCost ?? 0, paidItemsCost ?? 0, totalCollected,
      paymentMethod, operatorId ?? "owner-1", shiftId ?? "owner-direct"
    );

    const insertItem = db.prepare(`
      INSERT INTO receipt_items (receipt_id, product_id, product_name, price, quantity, paid_instant, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of cartRows) {
      insertItem.run(receiptId, item.product_id, item.product_name, item.price, item.quantity, item.paid_instant, item.timestamp);
    }

    db.prepare("DELETE FROM cart_items WHERE pc_id = ?").run(pc.id);
    db.prepare("DELETE FROM sessions WHERE pc_id = ?").run(pc.id);
    db.prepare("UPDATE pcs SET status = 'Available' WHERE id = ?").run(pc.id);

    return {
      id: receiptId,
      pcName: pc.name,
      user: session.username,
      startTime: session.start_time,
      endTime,
      durationMs,
      timeCost: timeCost ?? 0,
      unpaidItemsCost: unpaidItemsCost ?? 0,
      paidItemsCost: paidItemsCost ?? 0,
      totalCollected,
      paymentMethod,
      operatorId: operatorId ?? "owner-1",
      shiftId: shiftId ?? "owner-direct",
      items: cartRows.map((r) => ({
        id: r.product_id,
        name: r.product_name,
        price: r.price,
        quantity: r.quantity,
        paidInstant: r.paid_instant === 1,
        timestamp: r.timestamp,
      })),
    };
  });

  res.json({ receipt, pc: buildPC(db.prepare("SELECT * FROM pcs WHERE id = ?").get(pc.id)) });
});

// ── LAN Commands ──────────────────────────────────────────────────────────

async function lanCommand(req, res, command) {
  const pc = db.prepare("SELECT ip_address FROM pcs WHERE id = ?").get(req.params.id);
  if (!pc) return res.status(404).json({ error: "PC not found" });

  try {
    const ack = await sendLanCommand(pc.ip_address, command);
    res.json({ ack });
  } catch (err) {
    const { status, error, detail } = lanErrorToHttp(err);
    res.status(status).json({ error, detail });
  }
}

router.post("/:id/lan/lock",    (req, res) => lanCommand(req, res, "LOCK"));
router.post("/:id/lan/unlock",  (req, res) => lanCommand(req, res, "UNLOCK"));
router.post("/:id/lan/reboot",  (req, res) => lanCommand(req, res, "REBOOT"));
router.post("/:id/lan/message", async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "message is required" });
  lanCommand(req, res, `MSG:${message.trim()}`);
});

export default router;
