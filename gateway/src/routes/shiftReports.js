import { Router } from "express";
import db from "../db.js";

const router = Router();

function rowToReport(row) {
  return {
    id: row.id,
    shiftId: row.shift_id,
    operatorId: row.operator_id,
    operatorName: row.operator_name,
    startTime: row.start_time,
    endTime: row.end_time,
    totalReceipts: row.total_receipts,
    totalRevenue: row.total_revenue,
    expectedCash: row.expected_cash,
    expectedCard: row.expected_card,
    expectedClubBalance: row.expected_club_balance,
    actualCash: row.actual_cash,
    cashVariance: row.cash_variance,
    reviewed: row.reviewed === 1,
  };
}

// GET /api/shift-reports
router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM shift_reports ORDER BY start_time DESC").all().map(rowToReport));
});

// POST /api/shift-reports  — submit a new report
router.post("/", (req, res) => {
  const r = req.body;
  if (!r.id || !r.shiftId || !r.operatorId) {
    return res.status(400).json({ error: "id, shiftId, and operatorId are required" });
  }
  db.prepare(`
    INSERT INTO shift_reports
      (id, shift_id, operator_id, operator_name, start_time, end_time,
       total_receipts, total_revenue, expected_cash, expected_card, expected_club_balance,
       actual_cash, cash_variance, reviewed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    r.id, r.shiftId, r.operatorId, r.operatorName, r.startTime, r.endTime,
    r.totalReceipts ?? 0, r.totalRevenue ?? 0,
    r.expectedCash ?? 0, r.expectedCard ?? 0, r.expectedClubBalance ?? 0,
    r.actualCash ?? 0, r.cashVariance ?? 0
  );
  res.status(201).json(rowToReport(db.prepare("SELECT * FROM shift_reports WHERE id = ?").get(r.id)));
});

// PATCH /api/shift-reports/:id/reviewed
router.patch("/:id/reviewed", (req, res) => {
  const info = db.prepare("UPDATE shift_reports SET reviewed = 1 WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "Shift report not found" });
  res.json(rowToReport(db.prepare("SELECT * FROM shift_reports WHERE id = ?").get(req.params.id)));
});

export default router;
