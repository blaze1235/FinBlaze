import { PC, Product, HistoricReceipt } from "./types";
import { RATES } from "./config";

export const INITIAL_PRODUCTS: Product[] = [
  { id: "p1",  name: "Coca-Cola 0.5L",         category: "Drinks",  price: 10000, stock: 45 },
  { id: "p2",  name: "Red Bull Energy",          category: "Drinks",  price: 28000, stock: 24 },
  { id: "p3",  name: "Flash Up Energy",          category: "Drinks",  price: 16000, stock: 32 },
  { id: "p4",  name: "Lays Potato Chips",        category: "Snacks",  price: 14000, stock: 40 },
  { id: "p5",  name: "Club Sandwich VIP",        category: "Mains",   price: 32000, stock: 15 },
  { id: "p6",  name: "Pepperoni Pizza Slice",    category: "Mains",   price: 18000, stock: 12 },
  { id: "p7",  name: "Snickers Double",          category: "Snacks",  price: 11000, stock: 35 },
  { id: "p8",  name: "Choco Pie Box",            category: "Snacks",  price: 15000, stock: 20 },
  { id: "p9",  name: "HyperX Headset Rental",   category: "Devices", price: 15000, stock: 5  },
  { id: "p10", name: "Razer Deathadder Rental",  category: "Devices", price: 12000, stock: 4  },
];

export function getInitialPCs(): PC[] {
  const now = Date.now();

  return [
    // --- Standard Zone (192.168.1.50–149) ---
    {
      id: "pc-01", name: "PC 01", type: "Standard", ipAddress: "192.168.1.50",
      ratePerHour: RATES.Standard, status: "Occupied",
      session: { startTime: new Date(now - 125 * 60 * 1000).toISOString(), user: "Sardor_Gamer" },
      cart: [
        { id: "p1", name: "Coca-Cola 0.5L",   price: 10000, quantity: 1, paidInstant: false, timestamp: new Date(now - 5 * 60 * 1000).toISOString() },
        { id: "p4", name: "Lays Potato Chips", price: 14000, quantity: 1, paidInstant: true,  timestamp: new Date(now - 4 * 60 * 1000).toISOString() },
      ],
    },
    {
      id: "pc-02", name: "PC 02", type: "Standard", ipAddress: "192.168.1.51",
      ratePerHour: RATES.Standard, status: "Available", cart: [],
    },
    {
      id: "pc-03", name: "PC 03", type: "Standard", ipAddress: "192.168.1.52",
      ratePerHour: RATES.Standard, status: "Occupied",
      session: { startTime: new Date(now - 45 * 60 * 1000).toISOString(), user: "Rustam_UZB" },
      cart: [
        { id: "p3", name: "Flash Up Energy", price: 16000, quantity: 2, paidInstant: false, timestamp: new Date(now - 40 * 60 * 1000).toISOString() },
      ],
    },
    {
      id: "pc-04", name: "PC 04", type: "Standard", ipAddress: "192.168.1.53",
      ratePerHour: RATES.Standard, status: "Occupied",
      session: { startTime: new Date(now - 210 * 60 * 1000).toISOString(), user: "Javohir_CS2" },
      cart: [
        { id: "p1", name: "Coca-Cola 0.5L",    price: 10000, quantity: 2, paidInstant: false, timestamp: new Date(now - 180 * 60 * 1000).toISOString() },
        { id: "p5", name: "Club Sandwich VIP",  price: 32000, quantity: 1, paidInstant: false, timestamp: new Date(now - 120 * 60 * 1000).toISOString() },
        { id: "p2", name: "Red Bull Energy",    price: 28000, quantity: 1, paidInstant: true,  timestamp: new Date(now - 90  * 60 * 1000).toISOString() },
      ],
    },
    {
      id: "pc-05", name: "PC 05", type: "Standard", ipAddress: "192.168.1.54",
      ratePerHour: RATES.Standard, status: "Available", cart: [],
    },
    {
      id: "pc-06", name: "PC 06", type: "Standard", ipAddress: "192.168.1.55",
      ratePerHour: RATES.Standard, status: "Maintenance", cart: [],
    },
    {
      id: "pc-07", name: "PC 07", type: "Standard", ipAddress: "192.168.1.56",
      ratePerHour: RATES.Standard, status: "Available", cart: [],
    },
    {
      id: "pc-08", name: "PC 08", type: "Standard", ipAddress: "192.168.1.57",
      ratePerHour: RATES.Standard, status: "Available", cart: [],
    },

    // --- VIP Zone (192.168.1.150–199) ---
    {
      id: "vip-01", name: "VIP 01", type: "VIP", ipAddress: "192.168.1.150",
      ratePerHour: RATES.VIP, status: "Occupied",
      session: { startTime: new Date(now - 85 * 60 * 1000).toISOString(), user: "Timur_Pro" },
      cart: [
        { id: "p2", name: "Red Bull Energy", price: 28000, quantity: 1, paidInstant: false, timestamp: new Date(now - 80 * 60 * 1000).toISOString() },
      ],
    },
    {
      id: "vip-02", name: "VIP 02", type: "VIP", ipAddress: "192.168.1.151",
      ratePerHour: RATES.VIP, status: "Occupied",
      session: { startTime: new Date(now - 15 * 60 * 1000).toISOString(), user: "LoverBoy77" },
      cart: [],
    },
    {
      id: "vip-03", name: "VIP 03", type: "VIP", ipAddress: "192.168.1.152",
      ratePerHour: RATES.VIP, status: "Available", cart: [],
    },
    {
      id: "vip-04", name: "VIP 04", type: "VIP", ipAddress: "192.168.1.153",
      ratePerHour: RATES.VIP, status: "Maintenance", cart: [],
    },

    // --- Streaming Zone (separate IPs, outside standard ranges) ---
    {
      id: "stream-01", name: "STREAM 01", type: "Streaming", ipAddress: "192.168.1.160",
      ratePerHour: RATES.Streaming, status: "Available", cart: [],
    },
    {
      id: "stream-02", name: "STREAM 02", type: "Streaming", ipAddress: "192.168.1.161",
      ratePerHour: RATES.Streaming, status: "Occupied",
      session: { startTime: new Date(now - 310 * 60 * 1000).toISOString(), user: "Streamer_UZ" },
      cart: [
        { id: "p1", name: "Coca-Cola 0.5L",   price: 10000, quantity: 3, paidInstant: true, timestamp: new Date(now - 280 * 60 * 1000).toISOString() },
        { id: "p5", name: "Club Sandwich VIP", price: 32000, quantity: 1, paidInstant: true, timestamp: new Date(now - 200 * 60 * 1000).toISOString() },
      ],
    },
  ];
}

export const INITIAL_RECEIPTS: HistoricReceipt[] = [
  {
    id: "REC-9381",
    pcName: "PC 03",
    user: "Doniyor66",
    startTime: new Date(Date.now() - 420 * 60 * 1000).toISOString(),
    endTime:   new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    durationMs: 120 * 60 * 1000,
    timeCost: RATES.Standard * 2,
    unpaidItemsCost: 24000,
    paidItemsCost: 10000,
    totalCollected: RATES.Standard * 2 + 24000,
    paymentMethod: "Uzcard/Humo",
    operatorId: "owner-1",
    shiftId: "shift-demo",
    items: [
      { id: "p4", name: "Lays Potato Chips", price: 14000, quantity: 1, paidInstant: false, timestamp: "" },
      { id: "p1", name: "Coca-Cola 0.5L",    price: 10000, quantity: 1, paidInstant: false, timestamp: "" },
      { id: "p1", name: "Coca-Cola 0.5L",    price: 10000, quantity: 1, paidInstant: true,  timestamp: "" },
    ],
  },
  {
    id: "REC-9380",
    pcName: "VIP 02",
    user: "Asadbek_Gamer",
    startTime: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    endTime:   new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    durationMs: 70 * 60 * 1000,
    timeCost: Math.round(RATES.VIP * (70 / 60)),
    unpaidItemsCost: 28000,
    paidItemsCost: 0,
    totalCollected: Math.round(RATES.VIP * (70 / 60)) + 28000,
    paymentMethod: "Cash",
    operatorId: "owner-1",
    shiftId: "shift-demo",
    items: [
      { id: "p2", name: "Red Bull Energy", price: 28000, quantity: 1, paidInstant: false, timestamp: "" },
    ],
  },
];
