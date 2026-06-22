import React, { useState, useEffect } from "react";
import { PC, Product, CartItem } from "../types";
import { formatCurrency, formatDuration, calculateDurationMs, calculateTimeCost } from "../utils";
import {
  ShoppingBag, Trash2, Search, Plus, CheckCircle2,
  RotateCw, Lock, Unlock, AlertCircle, ShoppingCart
} from "lucide-react";

interface POSSidebarProps {
  selectedPC: PC | null;
  products: Product[];
  onAddProductToCart: (pcId: string, productId: string, quantity: number, paidInstant: boolean) => void;
  onRemoveProductFromCart: (pcId: string, cartItemIndex: number) => void;
  onTriggerCheckout: () => void;
  onLockPC: (pcId: string) => void;
  onUnlockPC: (pcId: string) => void;
  onRebootPC: (pcId: string) => void;
  onSendMessageToClient: (pcId: string, message: string) => void;
}

export default function POSSidebar({
  selectedPC,
  products,
  onAddProductToCart,
  onRemoveProductFromCart,
  onTriggerCheckout,
  onLockPC,
  onUnlockPC,
  onRebootPC,
}: POSSidebarProps) {
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "Drinks" | "Snacks" | "Mains">("ALL");
  const [cartQuantity, setCartQuantity] = useState(1);
  const [paidInstantToggle, setPaidInstantToggle] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTimeMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  if (!selectedPC) {
    return (
      <aside className="w-[360px] lg:w-[400px] glass-panel flex flex-col items-center justify-center text-center text-slate-400 h-full p-8 border-l border-white/5">
        <ShoppingCart className="w-8 h-8 text-white/20 mb-4" />
        <h3 className="text-white/80 font-medium tracking-wide">No Station Selected</h3>
        <p className="text-xs text-white/40 mt-2">
          Select an active station from the grid to manage its session and orders.
        </p>
      </aside>
    );
  }

  const isOccupied = selectedPC.status === "Occupied";

  let elapsedStr = "00:00:00";
  let activeGameCost = 0;
  let unpaidSnackCost = 0;
  let paidNowSnackReferenceCost = 0;

  if (isOccupied && selectedPC.session) {
    const elapsedMs = calculateDurationMs(selectedPC.session.startTime, currentTimeMs);
    elapsedStr = formatDuration(elapsedMs);
    activeGameCost = calculateTimeCost(selectedPC.session.startTime, selectedPC.ratePerHour, currentTimeMs);
  }

  selectedPC.cart.forEach((item) => {
    if (item.paidInstant) {
      paidNowSnackReferenceCost += item.price * item.quantity;
    } else {
      unpaidSnackCost += item.price * item.quantity;
    }
  });

  const totalOutstanding = activeGameCost + unpaidSnackCost;

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <aside className="w-[360px] lg:w-[420px] glass-panel flex flex-col h-full text-slate-300 border-l border-white/5 bg-[#0a0a0a]/80">

      {/* Header */}
      <div className="p-5 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono font-medium text-white/50 uppercase tracking-wider mb-1">
              {selectedPC.type} Station
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">{selectedPC.name}</h2>
            <p className="text-[10px] font-mono text-white/30 mt-0.5">{selectedPC.ipAddress}</p>
          </div>
          <div className="text-right">
            <span className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md ${isOccupied ? "bg-white text-black" : "bg-white/10 text-white/60"}`}>
              {isOccupied ? "Active" : "Available"}
            </span>
          </div>
        </div>

        {isOccupied && selectedPC.session ? (
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/50">Player</span>
              <span className="text-white font-medium">{selectedPC.session.user}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/50">Started</span>
              <span className="text-white/80 font-mono">
                {new Date(selectedPC.session.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-white/50">Duration</span>
              <span className="text-white font-mono font-medium">{elapsedStr}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-white/40 border border-dashed border-white/10 rounded-lg mt-4">
            Station is idle.
          </div>
        )}

        {actionFeedback && (
          <div className="mt-4 text-[11px] font-mono text-center text-white bg-white/10 py-2 px-3 rounded-md">
            {actionFeedback}
          </div>
        )}

        {/* LAN Control buttons */}
        {isOccupied && (
          <div className="flex gap-2 pt-5">
            <button
              onClick={() => { onLockPC(selectedPC.id); triggerFeedback("Lock signal sent to station."); }}
              className="flex-1 flex flex-col items-center justify-center py-2.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white text-[10px] font-medium transition-colors"
            >
              <Lock className="w-4 h-4 mb-1" />
              Lock
            </button>
            <button
              onClick={() => { onUnlockPC(selectedPC.id); triggerFeedback("Unlock signal sent to station."); }}
              className="flex-1 flex flex-col items-center justify-center py-2.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white text-[10px] font-medium transition-colors"
            >
              <Unlock className="w-4 h-4 mb-1" />
              Unlock
            </button>
            <button
              onClick={() => { onRebootPC(selectedPC.id); triggerFeedback("Reboot command dispatched."); }}
              className="flex-1 flex flex-col items-center justify-center py-2.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white text-[10px] font-medium transition-colors"
            >
              <RotateCw className="w-4 h-4 mb-1" />
              Reboot
            </button>
          </div>
        )}
      </div>

      {/* Cart & Products Area */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        {isOccupied ? (
          <div className="space-y-6">
            {/* Add Items */}
            <div>
              <h3 className="text-xs font-semibold text-white/70 tracking-wide uppercase mb-3">Add Items</h3>

              <div className="relative mb-3">
                <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-white/30 text-white placeholder-white/30 transition-colors"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-1">
                {(["ALL", "Drinks", "Snacks", "Mains"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] px-3 py-1.5 rounded-md transition-colors shrink-0 font-medium ${
                      selectedCategory === cat ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="border border-white/10 rounded-lg overflow-hidden">
                <div className="max-h-[160px] overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="px-3 py-2.5 flex items-center justify-between text-sm hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0"
                      onClick={() => {
                        onAddProductToCart(selectedPC.id, p.id, cartQuantity, paidInstantToggle);
                        triggerFeedback(`Added ${cartQuantity}× ${p.name}`);
                      }}
                    >
                      <div>
                        <div className="text-white/90 font-medium">{p.name}</div>
                        <div className="text-xs text-white/40 mt-0.5">
                          {formatCurrency(p.price)} · stock: {p.stock}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-white/30 shrink-0" />
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-6 text-center text-sm text-white/30">No matching items.</div>
                  )}
                </div>
              </div>

              {/* Quantity + Paid/Tab toggle */}
              <div className="flex items-center justify-between mt-4 bg-white/5 rounded-lg p-1.5 border border-white/5">
                <div className="flex items-center gap-1 px-2">
                  <button onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded">-</button>
                  <span className="w-6 text-center text-sm font-medium text-white">{cartQuantity}</span>
                  <button onClick={() => setCartQuantity(Math.min(10, cartQuantity + 1))} className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded">+</button>
                </div>

                <div className="flex items-center gap-2 pr-2 border-l border-white/10 pl-3">
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${!paidInstantToggle ? "text-white" : "text-white/30"}`}>Tab</span>
                  <button
                    onClick={() => setPaidInstantToggle(!paidInstantToggle)}
                    className="w-8 h-4 rounded-full bg-white/10 relative transition-colors focus:outline-none"
                  >
                    <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${paidInstantToggle ? "translate-x-4.5 left-0" : "translate-x-0.5 left-0"}`} />
                  </button>
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${paidInstantToggle ? "text-white" : "text-white/30"}`}>Paid</span>
                </div>
              </div>
            </div>

            {/* Current Order */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-white/70 tracking-wide uppercase">Current Order</h3>
                <span className="text-xs text-white/40">{selectedPC.cart.length} items</span>
              </div>

              <div className="border border-white/10 rounded-lg">
                {selectedPC.cart.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto">
                    {selectedPC.cart.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                        <div className="flex-1">
                          <div className="flex justify-between items-center pr-3">
                            <span className="text-sm font-medium text-white/90">
                              {item.quantity}× {item.name}
                            </span>
                            <span className="text-sm text-white/70 font-mono">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                            {item.paidInstant ? (
                              <span className="text-emerald-400/70">Paid Now</span>
                            ) : (
                              <span className="text-amber-400/70">On Tab</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => { onRemoveProductFromCart(selectedPC.id, idx); triggerFeedback(`Removed ${item.name}`); }}
                          className="p-1.5 text-white/20 hover:text-white/80 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-white/30">
                    <ShoppingBag className="w-8 h-8 mb-3 opacity-50" />
                    <span className="text-sm">Cart is empty</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer: totals + checkout */}
      <div className="p-5 border-t border-white/5 flex-shrink-0 bg-[#0a0a0a]">
        {isOccupied && (
          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Session Time</span>
              <span className="text-white font-mono">{formatCurrency(activeGameCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Unpaid Items (Tab)</span>
              <span className="text-amber-400 font-mono">{formatCurrency(unpaidSnackCost)}</span>
            </div>
            {paidNowSnackReferenceCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/30">Already Paid</span>
                <span className="text-emerald-400/60 font-mono line-through">{formatCurrency(paidNowSnackReferenceCost)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-3 border-t border-white/10">
              <span className="text-base font-medium text-white/80 tracking-wide uppercase">Due Total</span>
              <div className="text-xl font-bold font-mono text-white tracking-tight">
                {formatCurrency(totalOutstanding)}
              </div>
            </div>
          </div>
        )}

        {isOccupied ? (
          <button
            onClick={onTriggerCheckout}
            className="w-full bg-white hover:bg-white/90 active:bg-white/80 text-black font-semibold text-sm py-3.5 rounded-lg transition-colors"
          >
            Checkout & Close Session
          </button>
        ) : (
          <button className="w-full bg-white/5 text-white/30 font-medium text-sm py-3.5 rounded-lg cursor-not-allowed">
            No Active Session
          </button>
        )}
      </div>
    </aside>
  );
}
