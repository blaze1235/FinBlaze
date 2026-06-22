import { User } from "./types";

// Adjustable rate constants — change these to match your club's pricing
export const RATES = {
  Standard: 15000,   // UZS per hour
  VIP: 25000,        // UZS per hour
  Streaming: 35000,  // UZS per hour
} as const;

// Local gateway server URL (the Node.js backend running on the admin PC)
export const GATEWAY_URL = "http://192.168.1.10:3001";

// IP ranges (for reference/display — actual assignment is per-PC in initialData)
export const IP_RANGES = {
  standard: { start: "192.168.1.50", end: "192.168.1.149" },
  vip: { start: "192.168.1.150", end: "192.168.1.199" },
};

// Staff user accounts — change PINs before deploying
export const USERS: User[] = [
  { id: "owner-1", name: "Owner",   role: "owner", pin: "1234" },
  { id: "admin-1", name: "Admin 1", role: "admin", pin: "0001" },
  { id: "admin-2", name: "Admin 2", role: "admin", pin: "0002" },
];
