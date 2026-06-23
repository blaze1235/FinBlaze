import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /api/products
router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM products ORDER BY category, name").all());
});

// POST /api/products
router.post("/", (req, res) => {
  const { id, name, category, price, stock } = req.body;
  if (!id || !name || !category || price == null || stock == null) {
    return res.status(400).json({ error: "id, name, category, price, and stock are required" });
  }
  const validCategories = ["Drinks", "Snacks", "Mains", "Devices"];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${validCategories.join(", ")}` });
  }
  try {
    db.prepare("INSERT INTO products (id, name, category, price, stock) VALUES (?, ?, ?, ?, ?)").run(
      id, name, category, price, stock
    );
    res.status(201).json(db.prepare("SELECT * FROM products WHERE id = ?").get(id));
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_PRIMARYKEY") {
      return res.status(409).json({ error: "Product with this id already exists" });
    }
    throw err;
  }
});

// PATCH /api/products/:id  — update price and/or stock
router.patch("/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const price = req.body.price != null ? req.body.price : product.price;
  const stock = req.body.stock != null ? req.body.stock : product.stock;

  db.prepare("UPDATE products SET price = ?, stock = ? WHERE id = ?").run(price, stock, req.params.id);
  res.json(db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id));
});

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "Product not found" });
  res.json({ deleted: req.params.id });
});

export default router;
