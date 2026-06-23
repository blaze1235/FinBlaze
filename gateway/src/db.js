import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "..", process.env.DB_PATH || "./data/finblaze.db");

const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS pcs (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    type          TEXT NOT NULL,
    ip_address    TEXT NOT NULL,
    rate_per_hour INTEGER NOT NULL,
    status        TEXT NOT NULL DEFAULT 'Available'
  );

  CREATE TABLE IF NOT EXISTS sessions (
    pc_id      TEXT PRIMARY KEY REFERENCES pcs(id),
    start_time TEXT NOT NULL,
    username   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    pc_id        TEXT NOT NULL REFERENCES pcs(id),
    product_id   TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price        INTEGER NOT NULL,
    quantity     INTEGER NOT NULL,
    paid_instant INTEGER NOT NULL DEFAULT 0,
    timestamp    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    category TEXT NOT NULL,
    price    INTEGER NOT NULL,
    stock    INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS receipts (
    id                TEXT PRIMARY KEY,
    pc_name           TEXT NOT NULL,
    username          TEXT NOT NULL,
    start_time        TEXT NOT NULL,
    end_time          TEXT NOT NULL,
    duration_ms       INTEGER NOT NULL,
    time_cost         INTEGER NOT NULL,
    unpaid_items_cost INTEGER NOT NULL,
    paid_items_cost   INTEGER NOT NULL,
    total_collected   INTEGER NOT NULL,
    payment_method    TEXT NOT NULL,
    operator_id       TEXT NOT NULL,
    shift_id          TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS receipt_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_id   TEXT NOT NULL REFERENCES receipts(id),
    product_id   TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price        INTEGER NOT NULL,
    quantity     INTEGER NOT NULL,
    paid_instant INTEGER NOT NULL DEFAULT 0,
    timestamp    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id            TEXT PRIMARY KEY,
    operator_id   TEXT NOT NULL,
    operator_name TEXT NOT NULL,
    start_time    TEXT NOT NULL,
    end_time      TEXT
  );

  CREATE TABLE IF NOT EXISTS shift_reports (
    id                    TEXT PRIMARY KEY,
    shift_id              TEXT NOT NULL,
    operator_id           TEXT NOT NULL,
    operator_name         TEXT NOT NULL,
    start_time            TEXT NOT NULL,
    end_time              TEXT NOT NULL,
    total_receipts        INTEGER NOT NULL,
    total_revenue         INTEGER NOT NULL,
    expected_cash         INTEGER NOT NULL,
    expected_card         INTEGER NOT NULL,
    expected_club_balance INTEGER NOT NULL,
    actual_cash           INTEGER NOT NULL,
    cash_variance         INTEGER NOT NULL,
    reviewed              INTEGER NOT NULL DEFAULT 0
  );
`);

// Synchronous transaction helper (mirrors better-sqlite3's db.transaction())
export function transaction(fn) {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export default db;
