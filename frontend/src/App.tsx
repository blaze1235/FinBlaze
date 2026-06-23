import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import PCGrid from "./components/PCGrid";
import POSSidebar from "./components/POSSidebar";
import CheckoutModal from "./components/CheckoutModal";
import InventoryView from "./components/InventoryView";
import AnalyticsView from "./components/AnalyticsView";
import LoginScreen from "./components/LoginScreen";
import ShiftCloseModal from "./components/ShiftCloseModal";

import { PC, Product, HistoricReceipt, WanStatus, User, Shift, ShiftReport } from "./types";
import { Menu, X, ShoppingCart } from "lucide-react";
import { api } from "./api";

export default function App() {
  // ── Auth & Shift ──────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeShift, setActiveShift]  = useState<Shift | null>(null);
  const [shiftReports, setShiftReports] = useState<ShiftReport[]>([]);
  const [showShiftClose, setShowShiftClose] = useState(false);

  // ── Navigation ─────────────────────────────────────────────────
  const [activeTab, setActiveTab]           = useState<string>("dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen]       = useState(false);
  const [isMobileBillingOpen, setIsMobileBillingOpen] = useState(false);

  // ── Data ───────────────────────────────────────────────────────
  const [pcs, setPcs]           = useState<PC[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<HistoricReceipt[]>([]);
  const [wanStatus, setWanStatus] = useState<WanStatus>("offline");

  const [selectedPCId, setSelectedPCId] = useState<string | null>(null);
  const [checkoutPC, setCheckoutPC]     = useState<PC | null>(null);

  // ── Load data from gateway on mount ───────────────────────────
  useEffect(() => {
    Promise.all([
      api.pcs.list(),
      api.products.list(),
      api.receipts.list(),
      api.shiftReports.list(),
    ])
      .then(([pcsData, productsData, receiptsData, reportsData]) => {
        setPcs(pcsData);
        setProducts(productsData);
        setReceipts(receiptsData);
        setShiftReports(reportsData);
        setWanStatus("online");
      })
      .catch(() => setWanStatus("offline"));
  }, []);

  // ── Derived ────────────────────────────────────────────────────
  const currentSelectedPC = pcs.find((pc) => pc.id === selectedPCId) || null;

  const unpaidPCCount = pcs.filter(
    (pc) => pc.status === "Occupied" && pc.cart.some((item) => !item.paidInstant)
  ).length;

  const pendingReviewCount = shiftReports.filter((r) => !r.reviewed).length;

  const visibleReceipts = currentUser?.role === "admin" && activeShift
    ? receipts.filter((r) => r.shiftId === activeShift.id)
    : receipts;

  const shiftReceipts = activeShift
    ? receipts.filter((r) => r.shiftId === activeShift.id)
    : [];

  // ── Auth handlers ──────────────────────────────────────────────
  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    if (user.role === "admin") {
      const shift: Shift = {
        id: `shift-${Date.now()}`,
        operatorId: user.id,
        operatorName: user.name,
        startTime: new Date().toISOString(),
      };
      try {
        const saved = await api.shifts.open(shift);
        setActiveShift(saved);
      } catch {
        setActiveShift(shift);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveShift(null);
    setSelectedPCId(null);
    setCheckoutPC(null);
  };

  const handleCloseShiftRequest = () => setShowShiftClose(true);

  const handleConfirmShiftClose = async (report: ShiftReport) => {
    try {
      const [savedReport] = await Promise.all([
        api.shiftReports.submit(report),
        activeShift ? api.shifts.close(activeShift.id, report.endTime) : Promise.resolve(),
      ]);
      setShiftReports((prev) => [...prev, savedReport]);
    } catch {
      setShiftReports((prev) => [...prev, report]);
    }
    setShowShiftClose(false);
    handleLogout();
  };

  const handleMarkReportReviewed = async (reportId: string) => {
    try {
      const updated = await api.shiftReports.markReviewed(reportId);
      setShiftReports((prev) => prev.map((r) => r.id === reportId ? updated : r));
    } catch {
      setShiftReports((prev) => prev.map((r) => r.id === reportId ? { ...r, reviewed: true } : r));
    }
  };

  // ── PC / session handlers ──────────────────────────────────────
  const handleSelectPC = (pc: PC) => {
    setSelectedPCId(pc.id);
    setIsMobileBillingOpen(true);
  };

  const handleStartQuickSession = async (pcId: string, username: string) => {
    try {
      const updated = await api.pcs.startSession(pcId, username);
      setPcs((prev) => prev.map((pc) => pc.id === pcId ? updated : pc));
      setSelectedPCId(pcId);
    } catch (err: any) {
      alert(err.message ?? "Failed to start session");
    }
  };

  const handleAddProductToCart = async (pcId: string, productId: string, quantity: number, paidInstant: boolean) => {
    try {
      const updated = await api.pcs.addToCart(pcId, productId, quantity, paidInstant);
      setPcs((prev) => prev.map((pc) => pc.id === pcId ? updated : pc));
      const prod = await api.products.list();
      setProducts(prod);
    } catch (err: any) {
      alert(err.message ?? "Failed to add item");
    }
  };

  const handleRemoveProductFromCart = async (pcId: string, idx: number) => {
    try {
      const updated = await api.pcs.removeFromCart(pcId, idx);
      setPcs((prev) => prev.map((pc) => pc.id === pcId ? updated : pc));
      const prod = await api.products.list();
      setProducts(prod);
    } catch (err: any) {
      alert(err.message ?? "Failed to remove item");
    }
  };

  // LAN control — wired to gateway
  const handleLockPC   = async (pcId: string) => {
    try { await api.pcs.lan.lock(pcId); }
    catch (err: any) { alert(`Lock failed: ${err.message}`); }
  };
  const handleUnlockPC = async (pcId: string) => {
    try { await api.pcs.lan.unlock(pcId); }
    catch (err: any) { alert(`Unlock failed: ${err.message}`); }
  };
  const handleRebootPC = async (pcId: string) => {
    try { await api.pcs.lan.reboot(pcId); }
    catch (err: any) { alert(`Reboot failed: ${err.message}`); }
  };
  const handleSendMsg = async (pcId: string, msg: string) => {
    try { await api.pcs.lan.message(pcId, msg); }
    catch (err: any) { alert(`Message failed: ${err.message}`); }
  };

  const handleTriggerCheckout = () => { if (currentSelectedPC) setCheckoutPC(currentSelectedPC); };

  const handleConfirmCheckout = async (
    paymentMethod: string,
    rawCosts: { timeCost: number; unpaidItemsCost: number; paidItemsCost: number; totalCollected: number }
  ) => {
    if (!checkoutPC || !checkoutPC.session || !currentUser) return;

    try {
      const { receipt, pc } = await api.pcs.checkout(checkoutPC.id, {
        paymentMethod,
        ...rawCosts,
        operatorId: currentUser.id,
        shiftId: activeShift?.id ?? "owner-direct",
      });
      setReceipts((prev) => [receipt, ...prev]);
      setPcs((prev) => prev.map((p) => p.id === pc.id ? pc : p));
    } catch (err: any) {
      alert(err.message ?? "Checkout failed");
      return;
    }

    setCheckoutPC(null);
    setSelectedPCId(null);
    setIsMobileBillingOpen(false);
  };

  // ── Inventory handlers ─────────────────────────────────────────
  const handleUpdateProductPrice = async (id: string, price: number) => {
    try {
      const updated = await api.products.update(id, { price });
      setProducts((prev) => prev.map((p) => p.id === id ? updated : p));
    } catch {}
  };

  const handleUpdateProductStock = async (id: string, stock: number) => {
    try {
      const updated = await api.products.update(id, { stock });
      setProducts((prev) => prev.map((p) => p.id === id ? updated : p));
    } catch {}
  };

  const handleAddNewProduct = async (prod: Product) => {
    try {
      const saved = await api.products.add(prod);
      setProducts((prev) => [saved, ...prev]);
    } catch (err: any) {
      alert(err.message ?? "Failed to add product");
    }
  };

  const handleClearReceiptsLog = async () => {
    if (!confirm("Clear the receipt log? This cannot be undone.")) return;
    try {
      await api.receipts.clearAll();
      setReceipts([]);
    } catch {}
  };

  // ── Render ─────────────────────────────────────────────────────
  if (!currentUser) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-black relative font-sans antialiased text-slate-100 selection:bg-white/30 selection:text-white">

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full z-10">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unpaidPCCount={unpaidPCCount}
          wanStatus={wanStatus}
          currentUser={currentUser}
          activeShift={activeShift}
          pendingReviewCount={pendingReviewCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          onLogout={handleLogout}
          onCloseShift={handleCloseShiftRequest}
        />
      </div>

      <div className="flex flex-col flex-1 h-full overflow-hidden relative z-10">

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 glass-panel !z-20 h-14 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileNavOpen(true)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-xs tracking-wider text-white uppercase font-mono">FinBlaze POS</h1>
          </div>
          {currentSelectedPC && activeTab === "dashboard" && (
            <button onClick={() => setIsMobileBillingOpen(true)} className="bg-white/10 border border-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 min-h-[44px] cursor-pointer hover:bg-white/20 transition-all">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-mono font-bold text-[10px]">BILL ({currentSelectedPC.name})</span>
            </button>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex min-h-0">

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
              role={currentUser.role}
              onUpdateInventoryPrice={handleUpdateProductPrice}
              onUpdateInventoryStock={handleUpdateProductStock}
              onAddNewProduct={handleAddNewProduct}
            />
          )}

          {activeTab === "financials" && (
            <AnalyticsView
              receipts={visibleReceipts}
              shiftReports={shiftReports}
              role={currentUser.role}
              onClearReceiptsLog={handleClearReceiptsLog}
              onMarkShiftReportReviewed={handleMarkReportReviewed}
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
                onSendMessageToClient={handleSendMsg}
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
                <button onClick={() => setIsMobileNavOpen(false)} className="p-1 hover:bg-white/10 rounded text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {(["dashboard", "inventory", "financials"] as const).map((tabId) => {
                  const labels: Record<string, string> = {
                    dashboard: "Stations",
                    inventory: "Inventory",
                    financials: currentUser.role === "owner" ? "Financials" : "My Shift",
                  };
                  return (
                    <button key={tabId} onClick={() => { setActiveTab(tabId); setIsMobileNavOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === tabId ? "bg-white text-black" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                      {labels[tabId]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-white/5 text-[10px] font-mono text-white/40 text-center">
              {currentUser.name} · {currentUser.role}
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
              <button onClick={() => setIsMobileBillingOpen(false)} className="p-1 hover:bg-white/10 rounded text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <POSSidebar
                selectedPC={currentSelectedPC}
                products={products}
                onAddProductToCart={handleAddProductToCart}
                onRemoveProductFromCart={handleRemoveProductFromCart}
                onTriggerCheckout={handleTriggerCheckout}
                onLockPC={handleLockPC}
                onUnlockPC={handleUnlockPC}
                onRebootPC={handleRebootPC}
                onSendMessageToClient={handleSendMsg}
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

      {/* Shift Close Modal */}
      {showShiftClose && activeShift && currentUser && (
        <ShiftCloseModal
          shift={activeShift}
          currentUser={currentUser}
          receipts={shiftReceipts}
          onConfirm={handleConfirmShiftClose}
          onCancel={() => setShowShiftClose(false)}
        />
      )}
    </div>
  );
}
