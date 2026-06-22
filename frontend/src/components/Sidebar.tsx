import React, { useEffect, useState } from "react";
import { LayoutGrid, ShoppingBag, BarChart3, Terminal, Wifi, WifiOff, RefreshCw, LogOut, Menu, X, Clock } from "lucide-react";
import { WanStatus, User, Shift } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unpaidPCCount: number;
  wanStatus: WanStatus;
  currentUser: User;
  activeShift: Shift | null;
  pendingReviewCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  onCloseShift: () => void;
}

export default function Sidebar({
  activeTab, setActiveTab, unpaidPCCount, wanStatus,
  currentUser, activeShift, pendingReviewCount,
  isCollapsed, onToggleCollapse, onLogout, onCloseShift,
}: SidebarProps) {
  const [shiftElapsed, setShiftElapsed] = useState("");

  useEffect(() => {
    if (!activeShift) return;
    const tick = () => {
      const ms = Date.now() - new Date(activeShift.startTime).getTime();
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setShiftElapsed(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeShift]);

  const isOwner = currentUser.role === "owner";

  const menuItems = [
    { id: "dashboard",  label: "Stations",   icon: LayoutGrid, badge: unpaidPCCount > 0 ? unpaidPCCount : null },
    { id: "inventory",  label: "Inventory",  icon: ShoppingBag, badge: null },
    { id: "financials", label: isOwner ? "Financials" : "My Shift", icon: BarChart3, badge: isOwner && pendingReviewCount > 0 ? pendingReviewCount : null },
  ];

  const wanCfg = {
    online:  { Icon: Wifi,      label: "Cloud Sync", dot: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.6)]",  text: "text-emerald-400" },
    offline: { Icon: WifiOff,   label: "Local Mode", dot: "bg-slate-500",   glow: "",                                        text: "text-slate-400"   },
    syncing: { Icon: RefreshCw, label: "Syncing",    dot: "bg-amber-400",   glow: "shadow-[0_0_8px_rgba(251,191,36,0.6)]",  text: "text-amber-400"   },
  }[wanStatus];

  const { Icon: WanIcon } = wanCfg;

  return (
    <aside
      className={`glass-panel flex flex-col h-full text-slate-300 transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand + burger */}
      <div className={`border-b border-white/5 flex items-center shrink-0 ${isCollapsed ? "p-3 justify-center" : "p-5 justify-between"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/5 rounded-md border border-white/10 shrink-0">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm tracking-wide text-white uppercase truncate">FinBlaze POS</h1>
              <p className="text-[10px] text-white/40 font-mono tracking-widest mt-0.5">v1.0.0</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${isCollapsed ? "p-2" : "p-4"} space-y-1`}>
        {!isCollapsed && (
          <p className="px-3 py-2 text-[10px] font-medium text-white/30 uppercase tracking-widest font-mono mb-2">
            Overview
          </p>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-lg font-medium transition-all ${
                isCollapsed ? "justify-center p-3" : "justify-between px-3 py-2.5"
              } text-sm ${
                isActive ? "bg-white text-black" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? "" : "gap-3"} relative`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-white/40"}`} />
                {!isCollapsed && <span>{item.label}</span>}
                {/* Badge on icon when collapsed */}
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              {!isCollapsed && item.badge && (
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isActive ? "bg-black/10 text-black" : "bg-white/10 text-white"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/5 shrink-0 ${isCollapsed ? "p-2 space-y-2" : "p-4 space-y-3"}`}>
        {/* WAN status */}
        {isCollapsed ? (
          <div className="flex justify-center" title={wanCfg.label}>
            <WanIcon className={`w-4 h-4 ${wanCfg.text} ${wanStatus === "syncing" ? "animate-spin" : ""}`} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${wanCfg.dot} ${wanCfg.glow}`} />
            <WanIcon className={`w-3.5 h-3.5 shrink-0 ${wanCfg.text} ${wanStatus === "syncing" ? "animate-spin" : ""}`} />
            <span className={`text-[10px] font-mono font-medium ${wanCfg.text}`}>{wanCfg.label}</span>
          </div>
        )}

        {/* Shift timer (admin only) */}
        {!isOwner && activeShift && !isCollapsed && (
          <div className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Shift</span>
              </div>
              <span className="text-[11px] font-mono text-white font-semibold">{shiftElapsed}</span>
            </div>
            <button
              onClick={onCloseShift}
              className="w-full text-[10px] font-semibold text-red-400 hover:text-red-300 uppercase tracking-wider font-mono py-1 hover:bg-red-500/10 rounded transition-colors"
            >
              Close Shift
            </button>
          </div>
        )}

        {/* Collapsed shift indicator */}
        {!isOwner && activeShift && isCollapsed && (
          <button onClick={onCloseShift} title="Close Shift" className="w-full flex justify-center p-2 rounded-lg hover:bg-red-500/10 transition-colors">
            <Clock className="w-4 h-4 text-red-400" />
          </button>
        )}

        {/* User info + logout */}
        {isCollapsed ? (
          <button
            onClick={onLogout}
            title="Log out"
            className="w-full flex justify-center p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-white/40 font-mono capitalize">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
