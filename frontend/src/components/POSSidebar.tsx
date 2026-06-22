import React, { useState, useEffect } from "react";
import { PC, Product } from "../types";
import { formatCurrency, formatDuration, calculateDurationMs, calculateTimeCost } from "../utils";
import {
  ShoppingBag, Trash2, Search, Plus, RotateCw, Lock, Unlock,
  ShoppingCart, UtensilsCrossed, MonitorSmartphone
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
  selectedPC, products, onAddProductToCart, onRemoveProductFromCart,
  onTriggerCheckout, onLockPC, onUnlockPC, onRebootPC,
}: POSSidebarProps) {
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<"bar" | "session">("bar");
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
    setTimeout(() => setActionFeedback(null), 2500);
  };

  if (!selectedPC) {
    return (
      <aside className="w-[380px] lg:w-[440px] glass-panel flex flex-col items-center justify-center text-center h-full p-8 border-l border-white/5">
        <ShoppingCart className="w-10 h-10 text-white/10 mb-5" />
        <h3 className="text-white/70 font-medium tracking-wide">No Station Selected</h3>
        <p className="text-xs text-white/30 mt-2 leading-relaxed">
          Click any station card to manage its session and bar orders.
        </p>
      </aside>
    );
  }

  const isOccupied = selectedPC.status === "Occupied";

  let elapsedStr = "00:00:00";
  let activeGameCost = 0;
  let unpaidSnackCost = 0;
  let paidNowTotal = 0;

  if (isOccupied && selectedPC.session) {
    const elapsedMs = calculateDurationMs(selectedPC.session.startTime, currentTimeMs);
    elapsedStr = formatDuration(elapsedMs);
    activeGameCost = calculateTimeCost(selectedPC.session.startTime, selectedPC.ratePerHour, currentTimeMs);
  }

  selectedPC.cart.forEach((item) => {
    if (item.paidInstant) paidNowTotal += item.price * item.quantity;
    else unpaidSnackCost += item.price * item.quantity;
  });

  const totalOutstanding = activeGameCost + unpaidSnackCost;

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const unpaidCartItems = selectedPC.cart.filter((i) => !i.paidInstant);
  const tabCartCount = unpaidCartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <aside className="w-[380px] lg:w-[440px] glass-panel flex flex-col h-full text-slate-300 border-l border-white/5">

      {/* ── Sticky Header ── */}
      <div className="p-5 border-b border-white/5 shrink-0 bg-[#0a0a0a]/60">
        {/* PC identity row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">
              {selectedPC.type} · {selectedPC.ipAddress}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-none">{selectedPC.name}</h2>
          </div>
          <span className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider rounded-md shrink-0 mt-1 ${
            isOccupied ? "bg-white text-black" : "bg-white/10 text-white/50"
          }`}>
            {isOccupied ? "Active" : "Idle"}
          </span>
        </div>

        {isOccupied && selectedPC.session ? (
          <>
            {/* Player + time */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Player</p>
                <p className="text-white font-semibold text-sm mt-0.5">{selectedPC.session.user}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Duration</p>
                <p className="text-white font-mono font-semibold text-sm mt-0.5">{elapsedStr}</p>
              </div>
            </div>

            {/* Running total — the big number */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white/50 text-xs uppercase tracking-wider">Due Total</span>
              <span className="text-2xl font-bold font-mono text-white">{formatCurrency(totalOutstanding)}</span>
            </div>
          </>
        ) : (
          <div className="py-5 text-center text-sm text-white/30 border border-dashed border-white/10 rounded-xl">
            Station is idle — no active session.
          </div>
        )}

        {/* Feedback toast */}
        {actionFeedback && (
          <div className="mt-3 text-[11px] font-mono text-center text-white bg-white/10 py-1.5 px-3 rounded-lg">
            {actionFeedback}
          </div>
        )}
      </div>

      {/* ── Tab switcher ── */}
      {isOccupied && (
        <div className="flex border-b border-white/5 shrink-0 bg-[#0a0a0a]/40">
          <button
            onClick={() => setActiveTab("bar")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === "bar"
                ? "text-white border-white"
                : "text-white/30 border-transparent hover:text-white/60"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Bar
            {tabCartCount > 0 && (
              <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {tabCartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("session")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === "session"
                ? "text-white border-white"
                : "text-white/30 border-transparent hover:text-white/60"
            }`}
          >
            <MonitorSmartphone className="w-3.5 h-3.5" />
            Station
          </button>
        </div>
      )}

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* BAR TAB */}
        {(!isOccupied || activeTab === "bar") && (
          <div className="p-5 space-y-5">
            {isOccupied ? (
              <>
                {/* Product Catalog */}
                <div>
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Catalog</h3>

                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-white/30 text-white placeholder-white/20 transition-colors"
                    />
                  </div>

                  <div className="flex gap-1.5 mb-3">
                    {(["ALL", "Drinks", "Snacks", "Mains"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[10px] px-3 py-1.5 rounded-lg transition-colors shrink-0 font-semibold ${
                          selectedCategory === cat ? "bg-white text-black" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                          onClick={() => {
                            onAddProductToCart(selectedPC.id, p.id, cartQuantity, paidInstantToggle);
                            triggerFeedback(`Added ${cartQuantity}× ${p.name}`);
                          }}
                        >
                          <div>
                            <p className="text-white/90 text-sm font-medium">{p.name}</p>
                            <p className="text-white/30 text-[10px] font-mono mt-0.5">
                              {formatCurrency(p.price)} · {p.stock} left
                            </p>
                          </div>
                          <Plus className="w-4 h-4 text-white/30 shrink-0" />
                        </button>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="p-6 text-center text-sm text-white/20">No items found.</div>
                      )}
                    </div>
                  </div>

                  {/* Qty + Tab/Paid toggle */}
                  <div className="flex items-center justify-between mt-3 bg-white/5 rounded-xl p-2 border border-white/5">
                    <div className="flex items-center gap-1.5 pl-1">
                      <button onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-lg">−</button>
                      <span className="w-6 text-center text-sm font-semibold text-white">{cartQuantity}</span>
                      <button onClick={() => setCartQuantity(Math.min(10, cartQuantity + 1))} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-lg">+</button>
                    </div>
                    <div className="flex items-center gap-2 pr-2 border-l border-white/10 pl-3">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${!paidInstantToggle ? "text-white" : "text-white/20"}`}>Tab</span>
                      <button
                        onClick={() => setPaidInstantToggle(!paidInstantToggle)}
                        className={`w-9 h-5 rounded-full relative transition-colors focus:outline-none ${paidInstantToggle ? "bg-emerald-500/40" : "bg-white/10"}`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-transform duration-200 ${paidInstantToggle ? "translate-x-4 left-0.5 bg-emerald-400" : "translate-x-0 left-0.5 bg-white"}`} />
                      </button>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${paidInstantToggle ? "text-emerald-400" : "text-white/20"}`}>Paid</span>
                    </div>
                  </div>
                </div>

                {/* Current Order */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Order</h3>
                    <span className="text-xs text-white/20">{selectedPC.cart.length} items</span>
                  </div>
                  <div className="border border-white/10 rounded-xl overflow-hidden">
                    {selectedPC.cart.length > 0 ? (
                      <div className="max-h-[240px] overflow-y-auto divide-y divide-white/5">
                        {selectedPC.cart.map((item, idx) => (
                          <div key={idx} className="px-4 py-3 flex items-center gap-3 hover:bg-white/3 transition-colors group">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-white/90 truncate">
                                  {item.quantity}× {item.name}
                                </span>
                                <span className="text-sm font-mono text-white/70 shrink-0">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                              <span className={`text-[10px] uppercase tracking-widest font-semibold mt-0.5 block ${item.paidInstant ? "text-emerald-400/70" : "text-amber-400/70"}`}>
                                {item.paidInstant ? "Paid Now" : "On Tab"}
                              </span>
                            </div>
                            <button
                              onClick={() => { onRemoveProductFromCart(selectedPC.id, idx); triggerFeedback(`Removed ${item.name}`); }}
                              className="p-1.5 text-white/10 hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 flex flex-col items-center justify-center text-white/20">
                        <ShoppingBag className="w-7 h-7 mb-3 opacity-50" />
                        <span className="text-xs">Cart is empty</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-white/20 text-sm">
                Start a session to add bar items.
              </div>
            )}
          </div>
        )}

        {/* SESSION TAB */}
        {isOccupied && activeTab === "session" && (
          <div className="p-5 space-y-5">
            {/* Session details */}
            {selectedPC.session && (
              <div>
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Session Details</h3>
                <div className="border border-white/10 rounded-xl divide-y divide-white/5">
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-white/40">Started</span>
                    <span className="text-white font-mono">
                      {new Date(selectedPC.session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-white/40">Duration</span>
                    <span className="text-white font-mono">{elapsedStr}</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-white/40">Rate</span>
                    <span className="text-white font-mono">{formatCurrency(selectedPC.ratePerHour)}/hr</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-white/40">Time cost</span>
                    <span className="text-white font-mono font-semibold">{formatCurrency(activeGameCost)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* LAN Controls */}
            <div>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">LAN Controls</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Lock",   Icon: Lock,    action: () => { onLockPC(selectedPC.id);   triggerFeedback("Lock signal sent."); } },
                  { label: "Unlock", Icon: Unlock,  action: () => { onUnlockPC(selectedPC.id); triggerFeedback("Unlock signal sent."); } },
                  { label: "Reboot", Icon: RotateCw,action: () => { onRebootPC(selectedPC.id); triggerFeedback("Reboot dispatched."); } },
                ].map(({ label, Icon, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-white text-[11px] font-semibold uppercase tracking-wider transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-white/20 font-mono text-center mt-2">
                Commands sent via LAN to {selectedPC.ipAddress}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Footer ── */}
      <div className="border-t border-white/5 p-5 shrink-0 bg-[#0a0a0a]">
        {isOccupied && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Session time</span>
              <span className="text-white/80 font-mono">{formatCurrency(activeGameCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Tab items</span>
              <span className="text-amber-400/80 font-mono">{formatCurrency(unpaidSnackCost)}</span>
            </div>
            {paidNowTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/20">Paid at counter</span>
                <span className="text-emerald-400/50 font-mono line-through">{formatCurrency(paidNowTotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
              <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">Due Total</span>
              <span className="text-2xl font-bold font-mono text-white">{formatCurrency(totalOutstanding)}</span>
            </div>
          </div>
        )}

        {isOccupied ? (
          <button
            onClick={onTriggerCheckout}
            className="w-full bg-white hover:bg-white/90 active:bg-white/80 text-black font-bold text-sm py-4 rounded-xl transition-colors tracking-wide"
          >
            Checkout & Close Session
          </button>
        ) : (
          <button disabled className="w-full bg-white/5 text-white/20 font-medium text-sm py-4 rounded-xl cursor-not-allowed">
            No Active Session
          </button>
        )}
      </div>
    </aside>
  );
}
