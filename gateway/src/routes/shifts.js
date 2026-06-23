import { Router } from "express";
import db from "../db.js";

const router = Router();

function rowToShift(row) {
  return {
    id: row.id,
    operatorId: row.operator_id,
    operatorName: row.operator_name,
    startTime: row.start_time,
    endTime: row.end_time ?? undefined,
  };
}

// GET /api/shifts
router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM shifts ORDER BY start_time DESC").all().map(rowToShift));
});

// POST /api/shifts  — open new shift
router.post("/", (req, res) => {
  const { id, operatorId, operatorName, startTime } = req.body;
  if (!id || !operatorId || !operatorName || !startTime) {
    return res.status(400).json({ error: "id, operatorId, operatorName, and startTime are required" });
  }
  db.prepare("INSERT INTO shifts (id, operator_id, operator_name, start_time) VALUES (?, ?, ?, ?)").run(
    id, operatorId, operatorName, startTime
  );
  res.status(201).json(rowToShift(db.prepare("SELECT * FROM shifts WHERE id = ?").get(id)));
});

// PATCH /api/shifts/:id/close  — set endTime
router.patch("/:id/close", (req, res) => {
  const { endTime } = req.body;
  if (!endTime) return res.status(400).json({ error: "endTime is required" });

  const info = db.prepare("UPDATE shifts SET end_time = ? WHERE id = ?").run(endTime, req.params.id);
  if (!info.changes) return res.status(404).json({ error: "Shift not found" });
  res.json(rowToShift(db.prepare("SELECT * FROM shifts WHERE id = ?").get(req.params.id)));
});

export default router;
