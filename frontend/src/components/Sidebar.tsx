import React from "react";
import { LayoutGrid, ShoppingBag, BarChart3, Terminal, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { WanStatus } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unpaidPCCount: number;
  wanStatus: WanStatus;
}

export default function Sidebar({ activeTab, setActiveTab, unpaidPCCount, wanStatus }: SidebarProps) {
  const menuItems = [
    { id: "dashboard",  label: "Stations Matrix", icon: LayoutGrid },
    { id: "inventory",  label: "Inventory",        icon: ShoppingBag },
    { id: "financials", label: "Financials",       icon: BarChart3 },
  ];

  const wanConfig = {
    online:  { icon: Wifi,       label: "Cloud Sync",  dot: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.6)]",  text: "text-emerald-400" },
    offline: { icon: WifiOff,    label: "Local Mode",  dot: "bg-slate-500",   glow: "",                                        text: "text-slate-400"   },
    syncing: { icon: RefreshCw,  label: "Syncing...",  dot: "bg-amber-400",   glow: "shadow-[0_0_8px_rgba(251,191,36,0.6)]",  text: "text-amber-400"   },
  }[wanStatus];

  const WanIcon = wanConfig.icon;

  return (
    <aside className="w-64 glass-panel flex flex-col justify-between h-full text-slate-300">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-md border border-white/10">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide text-white uppercase">FinBlaze POS</h1>
            <p className="text-[10px] text-white/40 font-mono tracking-widest mt-0.5">v1.0.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="px-3 py-2 text-[10px] font-medium text-white/30 uppercase tracking-widest font-mono mb-2">
            Overview
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-white text-black" : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-white/40"}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === "dashboard" && unpaidPCCount > 0 && (
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isActive ? "bg-black/10 text-black" : "bg-white/10 text-white"}`}>
                    {unpaidPCCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: WAN status + user */}
      <div className="p-5 border-t border-white/5 space-y-4">
        {/* WAN sync status */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${wanConfig.dot} ${wanConfig.glow}`} />
          <WanIcon className={`w-3.5 h-3.5 shrink-0 ${wanConfig.text} ${wanStatus === "syncing" ? "animate-spin" : ""}`} />
          <span className={`text-[10px] font-mono font-medium ${wanConfig.text}`}>{wanConfig.label}</span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">
            AD
          </div>
          <div>
            <p className="text-sm font-medium text-white">Administrator</p>
            <p className="text-[10px] text-white/40 font-mono">Main Desk</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
