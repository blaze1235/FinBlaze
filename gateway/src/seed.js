import db, { transaction } from "./db.js";

const RATES = { Standard: 15000, VIP: 25000, Streaming: 35000 };

const PRODUCTS = [
  { id: "p1",  name: "Coca-Cola 0.5L",        category: "Drinks",  price: 10000, stock: 45 },
  { id: "p2",  name: "Red Bull Energy",         category: "Drinks",  price: 28000, stock: 24 },
  { id: "p3",  name: "Flash Up Energy",         category: "Drinks",  price: 16000, stock: 32 },
  { id: "p4",  name: "Lays Potato Chips",       category: "Snacks",  price: 14000, stock: 40 },
  { id: "p5",  name: "Club Sandwich VIP",       category: "Mains",   price: 32000, stock: 15 },
  { id: "p6",  name: "Pepperoni Pizza Slice",   category: "Mains",   price: 18000, stock: 12 },
  { id: "p7",  name: "Snickers Double",         category: "Snacks",  price: 11000, stock: 35 },
  { id: "p8",  name: "Choco Pie Box",           category: "Snacks",  price: 15000, stock: 20 },
  { id: "p9",  name: "HyperX Headset Rental",  category: "Devices", price: 15000, stock: 5  },
  { id: "p10", name: "Razer Deathadder Rental", category: "Devices", price: 12000, stock: 4  },
];

const PCS = [
  { id: "pc-01",     name: "PC 01",     type: "Standard",  ipAddress: "192.168.1.50",  ratePerHour: RATES.Standard,  status: "Available" },
  { id: "pc-02",     name: "PC 02",     type: "Standard",  ipAddress: "192.168.1.51",  ratePerHour: RATES.Standard,  status: "Available" },
  { id: "pc-03",     name: "PC 03",     type: "Standard",  ipAddress: "192.168.1.52",  ratePerHour: RATES.Standard,  status: "Available" },
  { id: "pc-04",     name: "PC 04",     type: "Standard",  ipAddress: "192.168.1.53",  ratePerHour: RATES.Standard,  status: "Available" },
  { id: "pc-05",     name: "PC 05",     type: "Standard",  ipAddress: "192.168.1.54",  ratePerHour: RATES.Standard,  status: "Available" },
  { id: "pc-06",     name: "PC 06",     type: "Standard",  ipAddress: "192.168.1.55",  ratePerHour: RATES.Standard,  status: "Maintenance" },
  { id: "pc-07",     name: "PC 07",     type: "Standard",  ipAddress: "192.168.1.56",  ratePerHour: RATES.Standard,  status: "Available" },
  { id: "pc-08",     name: "PC 08",     type: "Standard",  ipAddress: "192.168.1.57",  ratePerHour: RATES.Standard,  status: "Available" },
  { id: "vip-01",    name: "VIP 01",    type: "VIP",       ipAddress: "192.168.1.150", ratePerHour: RATES.VIP,       status: "Available" },
  { id: "vip-02",    name: "VIP 02",    type: "VIP",       ipAddress: "192.168.1.151", ratePerHour: RATES.VIP,       status: "Available" },
  { id: "vip-03",    name: "VIP 03",    type: "VIP",       ipAddress: "192.168.1.152", ratePerHour: RATES.VIP,       status: "Available" },
  { id: "vip-04",    name: "VIP 04",    type: "VIP",       ipAddress: "192.168.1.153", ratePerHour: RATES.VIP,       status: "Maintenance" },
  { id: "stream-01", name: "STREAM 01", type: "Streaming", ipAddress: "192.168.1.160", ratePerHour: RATES.Streaming, status: "Available" },
  { id: "stream-02", name: "STREAM 02", type: "Streaming", ipAddress: "192.168.1.161", ratePerHour: RATES.Streaming, status: "Available" },
];

export function seed() {
  const pcCount = db.prepare("SELECT COUNT(*) as n FROM pcs").get().n;
  if (pcCount > 0) return;

  const insertPC = db.prepare(
    "INSERT INTO pcs (id, name, type, ip_address, rate_per_hour, status) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertProduct = db.prepare(
    "INSERT INTO products (id, name, category, price, stock) VALUES (?, ?, ?, ?, ?)"
  );

  transaction(() => {
    for (const pc of PCS) {
      insertPC.run(pc.id, pc.name, pc.type, pc.ipAddress, pc.ratePerHour, pc.status);
    }
    for (const p of PRODUCTS) {
      insertProduct.run(p.id, p.name, p.category, p.price, p.stock);
    }
  });
  console.log(`[seed] Inserted ${PCS.length} PCs and ${PRODUCTS.length} products.`);
}
