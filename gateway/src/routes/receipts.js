import { Router } from "express";
import db, { transaction } from "../db.js";

const router = Router();

function buildReceipt(row) {
  const items = db.prepare(
    "SELECT product_id, product_name, price, quantity, paid_instant, timestamp FROM receipt_items WHERE receipt_id = ? ORDER BY id ASC"
  ).all(row.id);

  return {
    id: row.id,
    pcName: row.pc_name,
    user: row.username,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMs: row.duration_ms,
    timeCost: row.time_cost,
    unpaidItemsCost: row.unpaid_items_cost,
    paidItemsCost: row.paid_items_cost,
    totalCollected: row.total_collected,
    paymentMethod: row.payment_method,
    operatorId: row.operator_id,
    shiftId: row.shift_id,
    items: items.map((i) => ({
      id: i.product_id,
      name: i.product_name,
      price: i.price,
      quantity: i.quantity,
      paidInstant: i.paid_instant === 1,
      timestamp: i.timestamp,
    })),
  };
}

// GET /api/receipts?shiftId=...
router.get("/", (req, res) => {
  const { shiftId } = req.query;
  const rows = shiftId
    ? db.prepare("SELECT * FROM receipts WHERE shift_id = ? ORDER BY end_time DESC").all(shiftId)
    : db.prepare("SELECT * FROM receipts ORDER BY end_time DESC").all();
  res.json(rows.map(buildReceipt));
});

// DELETE /api/receipts  — clear entire log
router.delete("/", (req, res) => {
  const info = transaction(() => {
    db.prepare("DELETE FROM receipt_items").run();
    return db.prepare("DELETE FROM receipts").run();
  });
  res.json({ deleted: info.changes });
});

export default router;
