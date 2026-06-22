export type PCStatus = "Available" | "Occupied" | "Maintenance";

export type PCType = "Standard" | "VIP" | "Streaming";

export type UserRole = "owner" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string; // 4-digit PIN
}

export interface Shift {
  id: string;
  operatorId: string;
  operatorName: string;
  startTime: string; // ISO
  endTime?: string;  // ISO — set when shift is closed
}

export interface ShiftReport {
  id: string;
  shiftId: string;
  operatorId: string;
  operatorName: string;
  startTime: string;
  endTime: string;
  totalReceipts: number;
  totalRevenue: number;
  expectedCash: number;
  expectedCard: number;
  expectedClubBalance: number;
  actualCash: number;
  cashVariance: number; // actualCash - expectedCash
  reviewed: boolean;    // set to true when owner marks as reviewed
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  paidInstant: boolean; // true = paid at counter, false = added to session tab
  timestamp: string;
}

export interface Session {
  startTime: string; // ISO string
  user: string;
}

export interface PC {
  id: string;
  name: string;
  type: PCType;
  ipAddress: string;   // static LAN IP (e.g. 192.168.1.50)
  ratePerHour: number; // UZS/hr — sourced from RATES config
  status: PCStatus;
  session?: Session;
  cart: CartItem[];
}

export interface Product {
  id: string;
  name: string;
  category: "Drinks" | "Snacks" | "Mains" | "Devices";
  price: number; // in UZS
  stock: number;
}

export interface HistoricReceipt {
  id: string;
  pcName: string;
  user: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  timeCost: number;
  unpaidItemsCost: number;
  paidItemsCost: number;
  totalCollected: number;
  paymentMethod: string;
  items: CartItem[];
  operatorId: string;  // who processed the checkout
  shiftId: string;     // which shift this belongs to
}

export type WanStatus = "online" | "offline" | "syncing";
