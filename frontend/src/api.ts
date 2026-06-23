import { GATEWAY_URL } from "./config";
import { PC, Product, HistoricReceipt, Shift, ShiftReport, CartItem } from "./types";

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── PCs ──────────────────────────────────────────────────────────────────────

export const api = {
  pcs: {
    list: ()                => req<PC[]>("/api/pcs"),
    setStatus: (id: string, status: string) =>
      req<PC>(`/api/pcs/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    startSession: (id: string, username: string) =>
      req<PC>(`/api/pcs/${id}/session`, { method: "POST", body: JSON.stringify({ username }) }),
    endSession: (id: string) =>
      req<PC>(`/api/pcs/${id}/session`, { method: "DELETE" }),
    addToCart: (id: string, productId: string, quantity: number, paidInstant: boolean) =>
      req<PC>(`/api/pcs/${id}/cart`, { method: "POST", body: JSON.stringify({ productId, quantity, paidInstant }) }),
    removeFromCart: (id: string, itemIndex: number) =>
      req<PC>(`/api/pcs/${id}/cart/${itemIndex}`, { method: "DELETE" }),
    checkout: (
      id: string,
      payload: { paymentMethod: string; timeCost: number; unpaidItemsCost: number; paidItemsCost: number; totalCollected: number; operatorId: string; shiftId: string }
    ) => req<{ receipt: HistoricReceipt; pc: PC }>(`/api/pcs/${id}/checkout`, { method: "POST", body: JSON.stringify(payload) }),
    lan: {
      lock:    (id: string) => req<{ ack: string }>(`/api/pcs/${id}/lan/lock`,    { method: "POST" }),
      unlock:  (id: string) => req<{ ack: string }>(`/api/pcs/${id}/lan/unlock`,  { method: "POST" }),
      reboot:  (id: string) => req<{ ack: string }>(`/api/pcs/${id}/lan/reboot`,  { method: "POST" }),
      message: (id: string, message: string) => req<{ ack: string }>(`/api/pcs/${id}/lan/message`, { method: "POST", body: JSON.stringify({ message }) }),
    },
  },

  products: {
    list: ()                           => req<Product[]>("/api/products"),
    add:  (prod: Product)              => req<Product>("/api/products", { method: "POST", body: JSON.stringify(prod) }),
    update: (id: string, patch: Partial<Pick<Product, "price" | "stock">>) =>
      req<Product>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    remove: (id: string)               => req<{ deleted: string }>(`/api/products/${id}`, { method: "DELETE" }),
  },

  receipts: {
    list: (shiftId?: string) =>
      req<HistoricReceipt[]>(`/api/receipts${shiftId ? `?shiftId=${shiftId}` : ""}`),
    clearAll: () => req<{ deleted: number }>("/api/receipts", { method: "DELETE" }),
  },

  shifts: {
    list: ()             => req<Shift[]>("/api/shifts"),
    open: (shift: Shift) => req<Shift>("/api/shifts", { method: "POST", body: JSON.stringify(shift) }),
    close: (id: string, endTime: string) =>
      req<Shift>(`/api/shifts/${id}/close`, { method: "PATCH", body: JSON.stringify({ endTime }) }),
  },

  shiftReports: {
    list: ()                    => req<ShiftReport[]>("/api/shift-reports"),
    submit: (report: ShiftReport) => req<ShiftReport>("/api/shift-reports", { method: "POST", body: JSON.stringify(report) }),
    markReviewed: (id: string)  => req<ShiftReport>(`/api/shift-reports/${id}/reviewed`, { method: "PATCH" }),
  },
};
