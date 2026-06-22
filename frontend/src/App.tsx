import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import PCGrid from "./components/PCGrid";
import POSSidebar from "./components/POSSidebar";
import CheckoutModal from "./components/CheckoutModal";
import InventoryView from "./components/InventoryView";
import AnalyticsView from "./components/AnalyticsView";

import { PC, Product, HistoricReceipt, CartItem, WanStatus } from "./types";
import { getInitialPCs, INITIAL_PRODUCTS, INITIAL_RECEIPTS } from "./initialData";
import { Menu, X, ShoppingCart } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const [pcs, setPcs] = useState<PC[]>(() => {
    try {
      const saved = localStorage.getItem("finblaze_pcs");
      return saved ? JSON.parse(saved) : getInitialPCs();
    } catch {
      return getInitialPCs();
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("finblaze_products");
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [receipts, setReceipts] = useState<HistoricReceipt[]>(() => {
    try {
      const saved = localStorage.getItem("finblaze_receipts");
      return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
    } catch {
      return INITIAL_RECEIPTS;
    }
  });

  const [selectedPCId, setSelectedPCId] = useState<string | null>(null);
  const [checkoutPC, setCheckoutPC] = useState<PC | null>(null);
  const [wanStatus, setWanStatus] = useState<WanStatus>("offline"); // will be "online" when gateway is connected
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileBillingOpen, setIsMobileBillingOpen] = useState(false);

  useEffect(() => { localStorage.setItem("finblaze_pcs",      JSON.stringify(pcs));      }, [pcs]);
  useEffect(() => { localStorage.setItem("finblaze_products",  JSON.stringify(products));  }, [products]);
  useEffect(() => { localStorage.setItem("finblaze_receipts",  JSON.stringify(receipts));  }, [receipts]);

  const currentSelectedPC = pcs.find((pc) => pc.id === selectedPCId) || null;

  const unpaidPCCount = pcs.filter(
    (pc) => pc.status === "Occupied" && pc.cart.some((item) => !item.paidInstant)
  ).length;

  // --- Handlers ---

  const handleSelectPC = (pc: PC) => {
    setSelectedPCId(pc.id);
    setIsMobileBillingOpen(true);
  };

  const handleStartQuickSession = (pcId: string, username: string) => {
    setPcs((prev) =>
      prev.map((pc) =>
        pc.id === pcId
          ? { ...pc, status: "Occupied", session: { startTime: new Date().toISOString(), user: username }, cart: [] }
          : pc
      )
    );
    setSelectedPCId(pcId);
  };

  const handleAddProductToCart = (pcId: string, productId: string, quantity: number, paidInstant: boolean) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (product.stock < quantity) {
      alert(`Warning: Requested quantity (${quantity}) exceeds current stock (${product.stock}).`);
    }

    setProducts((prev) =>
      prev.map((p) => p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p)
    );

    setPcs((prev) =>
      prev.map((pc) => {
        if (pc.id !== pcId) return pc;
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          paidInstant,
          timestamp: new Date().toISOString(),
        };
        return { ...pc, cart: [...pc.cart, newItem] };
      })
    );
  };

  const handleRemoveProductFromCart = (pcId: string, cartItemIndex: number) => {
    const targetPC = pcs.find((pc) => pc.id === pcId);
    if (!targetPC) return;
    const item = targetPC.cart[cartItemIndex];
    if (!item) return;

    setProducts((prev) =>
      prev.map((p) => p.id === item.id ? { ...p, stock: p.stock + item.quantity } : p)
    );

    setPcs((prev) =>
      prev.map((pc) => {
        if (pc.id !== pcId) return pc;
        const nextCart = [...pc.cart];
        nextCart.splice(cartItemIndex, 1);
        return { ...pc, cart: nextCart };
      })
    );
  };

  // LAN control stubs — these will call gateway API in Phase 2
  const handleLockPC = (pcId: string) => {
    console.log(`[LAN] LOCK → ${pcs.find(p => p.id === pcId)?.ipAddress}:8888`);
  };

  const handleUnlockPC = (pcId: string) => {
    console.log(`[LAN] UNLOCK → ${pcs.find(p => p.id === pcId)?.ipAddress}:8888`);
  };

  const handleRebootPC = (pcId: string) => {
    console.log(`[LAN] REBOOT → ${pcs.find(p => p.id === pcId)?.ipAddress}:8888`);
  };

  const handleSendMessageToClient = (pcId: string, message: string) => {
    console.log(`[LAN] MSG → ${pcs.find(p => p.id === pcId)?.ipAddress}: "${message}"`);
  };

  const handleTriggerCheckout = () => {
    if (currentSelectedPC) setCheckoutPC(currentSelectedPC);
  };

  const handleConfirmCheckout = (
    paymentMethod: string,
    rawCosts: { timeCost: number; unpaidItemsCost: number; paidItemsCost: number; totalCollected: number }
  ) => {
    if (!checkoutPC || !checkoutPC.session) return;

    const newReceipt: HistoricReceipt = {
      id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      pcName: checkoutPC.name,
      user: checkoutPC.session.user,
      startTime: checkoutPC.session.startTime,
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(checkoutPC.session.startTime).getTime(),
      timeCost: rawCosts.timeCost,
      unpaidItemsCost: rawCosts.unpaidItemsCost,
      paidItemsCost: rawCosts.paidItemsCost,
      totalCollected: rawCosts.totalCollected,
      paymentMethod,
      items: checkoutPC.cart,
    };

    setReceipts((prev) => [newReceipt, ...prev]);

    setPcs((prev) =>
      prev.map((pc) =>
        pc.id === checkoutPC.id ? { ...pc, status: "Available", session: undefined, cart: [] } : pc
      )
    );

    setCheckoutPC(null);
    setSelectedPCId(null);
    setIsMobileBillingOpen(false);
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) =>
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, price: newPrice } : p));

  const handleUpdateProductStock = (productId: string, newStock: number) =>
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stock: newStock } : p));

  const handleAddNewProductGroup = (newProd: Product) =>
    setProducts((prev) => [newProd, ...prev]);

  const handleClearReceiptsLog = () => {
    if (confirm("Clear the shift receipt log? This cannot be undone.")) setReceipts([]);
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-black relative font-sans antialiased text-slate-100 selection:bg-white/30 selection:text-white">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full z-10 glass-panel">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unpaidPCCount={unpaidPCCount}
          wanStatus={wanStatus}
        />
      </div>

      <div className="flex flex-col flex-1 h-full overflow-hidden relative z-10">

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 glass-panel !z-20 h-14 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-300 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-xs tracking-wider text-white uppercase font-mono">FinBlaze POS</h1>
          </div>

          <div className="flex items-center gap-2">
            {currentSelectedPC && activeTab === "dashboard" && (
              <button
                onClick={() => setIsMobileBillingOpen(true)}
                className="bg-white/10 border border-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 min-h-[44px] cursor-pointer hover:bg-white/20 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="font-mono font-bold text-[10px]">BILL ({currentSelectedPC.name})</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex min-h-0 bg-transparent">

          {activeTab === "dashboard" && (
            <PCGrid
              pcs={pcs}
              selectedPCId={selectedPCId}
              onSelectPC={handleSelectPC}
              onStartQuickSession={handleStartQuickSession}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryView
              products={products}
              onUpdateInventoryPrice={handleUpdateProductPrice}
              onUpdateInventoryStock={handleUpdateProductStock}
              onAddNewProduct={handleAddNewProductGroup}
            />
          )}

          {activeTab === "financials" && (
            <AnalyticsView
              receipts={receipts}
              onClearReceiptsLog={handleClearReceiptsLog}
            />
          )}

          {/* Desktop POS Sidebar */}
          {activeTab === "dashboard" && (
            <div className="hidden xl:block shrink-0 h-full z-20 glass-panel">
              <POSSidebar
                selectedPC={currentSelectedPC}
                products={products}
                onAddProductToCart={handleAddProductToCart}
                onRemoveProductFromCart={handleRemoveProductFromCart}
                onTriggerCheckout={handleTriggerCheckout}
                onLockPC={handleLockPC}
                onUnlockPC={handleUnlockPC}
                onRebootPC={handleRebootPC}
                onSendMessageToClient={handleSendMessageToClient}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden flex">
          <div className="w-64 h-full glass-panel flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">FinBlaze POS</span>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 hover:bg-white/10 rounded text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {(["dashboard", "inventory", "financials"] as const).map((tabId) => {
                  const labels: Record<string, string> = {
                    dashboard: "Stations Matrix",
                    inventory: "Inventory",
                    financials: "Financials",
                  };
                  return (
                    <button
                      key={tabId}
                      onClick={() => { setActiveTab(tabId); setIsMobileNavOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === tabId ? "bg-white text-black" : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {labels[tabId]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/5 text-[10px] font-mono text-white/50 text-center">
              Administrator • Main Desk
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileNavOpen(false)} />
        </div>
      )}

      {/* Mobile Billing Drawer */}
      {isMobileBillingOpen && currentSelectedPC && activeTab === "dashboard" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-45 xl:hidden flex justify-end">
          <div className="flex-1" onClick={() => setIsMobileBillingOpen(false)} />
          <div className="w-full max-w-md h-full glass-panel flex flex-col">
            <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">Station Console</span>
              <button
                onClick={() => setIsMobileBillingOpen(false)}
                className="p-1 hover:bg-white/10 rounded text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <POSSidebar
                selectedPC={currentSelectedPC}
                products={products}
                onAddProductToCart={handleAddProductToCart}
                onRemoveProductFromCart={handleRemoveProductFromCart}
                onTriggerCheckout={handleTriggerCheckout}
                onLockPC={handleLockPC}
                onUnlockPC={handleUnlockPC}
                onRebootPC={handleRebootPC}
                onSendMessageToClient={handleSendMessageToClient}
              />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutPC && (
        <CheckoutModal
          pc={checkoutPC}
          onClose={() => setCheckoutPC(null)}
          onConfirmCheckout={handleConfirmCheckout}
        />
      )}
    </div>
  );
}
