export type PCStatus = "Available" | "Occupied" | "Maintenance";

export type PCType = "Standard" | "VIP" | "Streaming";

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
}

export type WanStatus = "online" | "offline" | "syncing";
