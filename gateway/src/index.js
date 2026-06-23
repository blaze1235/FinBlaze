import "dotenv/config";
import express from "express";
import cors from "cors";

import db from "./db.js"; // initializes schema
import { seed } from "./seed.js";

import pcsRouter         from "./routes/pcs.js";
import productsRouter    from "./routes/products.js";
import receiptsRouter    from "./routes/receipts.js";
import shiftsRouter      from "./routes/shifts.js";
import shiftReportsRouter from "./routes/shiftReports.js";

seed();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://192.168.1.10:5173",
    "http://192.168.1.10:3000",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));

app.use(express.json());

app.use("/api/pcs",           pcsRouter);
app.use("/api/products",      productsRouter);
app.use("/api/receipts",      receiptsRouter);
app.use("/api/shifts",        shiftsRouter);
app.use("/api/shift-reports", shiftReportsRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("[gateway error]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, () => console.log(`[gateway] Listening on http://localhost:${PORT}`));

export default app;
