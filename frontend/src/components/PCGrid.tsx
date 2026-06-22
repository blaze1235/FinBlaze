import React, { useEffect, useState } from "react";
import { PC, PCStatus, PCType } from "../types";
import { formatCurrency, formatDuration, calculateDurationMs, calculateTimeCost } from "../utils";
import { Monitor, ShieldAlert, Zap, Award, Sparkles, CheckCircle2, AlertTriangle, AlertCircle, Play, Terminal } from "lucide-react";

interface PCGridProps {
  pcs: PC[];
  selectedPCId: string | null;
  onSelectPC: (pc: PC) => void;
  onStartQuickSession: (pcId: string, username: string) => void;
}

export default function PCGrid({ pcs, selectedPCId, onSelectPC, onStartQuickSession }: PCGridProps) {
  // Local active timer tickers
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());
  const [filterType, setFilterType] = useState<PCType | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<PCStatus | "ALL">("ALL");
  const [quickUserInputs, setQuickUserInputs] = useState<{ [key: string]: string }>({});

  // Regular clock tick for accumulators and timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter logic
  const filteredPCs = pcs.filter((pc) => {
    if (filterType !== "ALL" && pc.type !== filterType) return false;
    if (filterStatus !== "ALL" && pc.status !== filterStatus) return false;
    return true;
  });

  return (
    <div id="pc-grid-connector" className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Upper header section for grid, filters & statistics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 tracking-tight drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Active Matrix Monitor</h2>
          <p className="text-xs text-cyan-50/50 mt-1">
            Real-time telemetry showing live computers, game clock state, and active snack tabs.
          </p>
        </div>

        {/* Counter badges */}
        <div className="flex items-center gap-3 font-mono text-[11px] leading-none shrink-0">
          <div className="glass-panel border-emerald-500/30 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <span className="text-slate-300">AVAILABLE:</span>
            <span className="text-emerald-400 font-bold">{pcs.filter((p) => p.status === "Available").length}</span>
          </div>

          <div className="glass-panel border-fuchsia-500/30 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-[0_0_10px_rgba(217,70,239,0.1)]">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_8px_rgba(217,70,239,0.8)]"></span>
            <span className="text-slate-300">ACTIVE:</span>
            <span className="text-fuchsia-400 font-bold">{pcs.filter((p) => p.status === "Occupied").length}</span>
          </div>

          <div className="glass-panel rounded-xl px-3 py-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span className="text-slate-400">OFFLINE:</span>
            <span className="text-white/50 font-bold">{pcs.filter((p) => p.status === "Maintenance").length}</span>
          </div>
        </div>
      </div>

      {/* Advanced filtering tabs row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div id="pc-grid-filters" className="flex flex-wrap items-center gap-3">
          {/* Zone filters */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
            {(["ALL", "Standard", "VIP", "Streaming"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterType === t
                    ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                    : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
                }`}
              >
                {t === "ALL" ? "All Zones" : `${t} Zone`}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
            {(["ALL", "Available", "Occupied", "Maintenance"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterStatus === s
                    ? "bg-fuchsia-500/20 text-fuchsia-100 border border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                    : "text-slate-400 hover:text-fuchsia-300 hover:bg-white/5"
                }`}
              >
                {s === "ALL" ? "All States" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Informational Hint */}
        <div className="text-[11px] font-mono text-cyan-400/70 flex items-center gap-1.5 px-3 py-1.5 glass-panel !bg-cyan-500/10 rounded-xl border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Click any card to load its billing & order controls</span>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPCs.map((pc) => {
          const isSelected = selectedPCId === pc.id;
          const isOccupied = pc.status === "Occupied";
          const isOffline = pc.status === "Maintenance";
          const isAvailable = pc.status === "Available";

          // Calculate running live aggregates for occupied PCs
          let elapsedStr = "00:00:00";
          let currentAccCost = 0;
          let hasUnpaidGoods = false;
          let unpaidCount = 0;

          if (isOccupied && pc.session) {
            const currentDuration = calculateDurationMs(pc.session.startTime, currentTimeMs);
            elapsedStr = formatDuration(currentDuration);
            currentAccCost = calculateTimeCost(pc.session.startTime, pc.ratePerHour, currentTimeMs);

            // Calculate unpaid goods indicators
            const unpaidCartItems = pc.cart.filter((item) => !item.paidInstant);
            if (unpaidCartItems.length > 0) {
              hasUnpaidGoods = true;
              unpaidCount = unpaidCartItems.reduce((acc, curr) => acc + curr.quantity, 0);
            }
          }

          // Card borders and background styling
          let cardBorderClass = "glass-panel transition-colors hover:bg-white/5";
          let shadowClass = "";

          if (isSelected) {
            cardBorderClass = "glass-panel bg-white/10 !ring-1 !ring-white/20";
          } else if (isOccupied) {
            cardBorderClass = "glass-panel bg-white/5 border-white/10 hover:bg-white/10";
          } else if (isAvailable) {
            cardBorderClass = "glass-panel border-white/5 hover:border-white/20";
          } else if (isOffline) {
            cardBorderClass = "glass-panel bg-black/40 border-white/5 opacity-50";
          }

          return (
            <div
              key={pc.id}
              onClick={() => onSelectPC(pc)}
              className={`rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px] group ${cardBorderClass} ${shadowClass}`}
            >
              {/* Card top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md transition-all duration-300 ${
                    isOccupied 
                      ? "bg-white text-black" 
                      : isAvailable 
                      ? "bg-white/10 text-white" 
                      : "bg-white/5 text-white/30"
                  }`}>
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-white flex items-center gap-1.5 leading-tight">
                      {pc.name}
                      {pc.type !== "Standard" && (
                        <span className="text-[9px] font-mono tracking-wider uppercase text-white/50 border border-white/10 px-1 py-0.5 rounded-sm">
                          {pc.type}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      Rate: {formatCurrency(pc.ratePerHour)}/hr
                    </p>
                  </div>
                </div>

                {/* Corner Status Badge */}
                <div className="flex items-center gap-1 font-mono text-[9px] font-medium tracking-wide uppercase">
                  {isAvailable && (
                    <span className="text-white/60 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-sm">
                      Available
                    </span>
                  )}
                  {isOccupied && (
                    <span className="text-white bg-white/10 border border-white/20 px-1.5 py-0.5 rounded-sm">
                      Active
                    </span>
                  )}
                  {isOffline && (
                    <span className="text-white/30 bg-black/40 border border-white/5 px-1.5 py-0.5 rounded-sm">
                      Offline
                    </span>
                  )}
                </div>
              </div>

              {/* Card middle info details */}
              <div className="my-3 flex-1 flex flex-col justify-center">
                {isOccupied && pc.session ? (
                  <div className="space-y-1.5">
                    {/* User identifier */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50 font-medium">Gamer:</span>
                      <span className="text-white font-mono font-medium bg-white/10 px-1.5 py-0.5 rounded-sm border border-white/5">
                        {pc.session.user}
                      </span>
                    </div>

                    {/* Clock Running accumulator */}
                    <div className="flex items-center justify-between font-mono text-xs text-white/50">
                      <span>Played time:</span>
                      <span className="text-white font-mono font-medium">
                        {elapsedStr}
                      </span>
                    </div>

                    {/* Cost Accumulator */}
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-xs text-white/50">Current bill:</span>
                      <span className="text-sm font-semibold text-white font-mono">
                        {formatCurrency(currentAccCost)}
                      </span>
                    </div>
                  </div>
                ) : isAvailable ? (
                  <div className="py-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const user = quickUserInputs[pc.id]?.trim() || "Guest_PC";
                        onStartQuickSession(pc.id, user);
                        setQuickUserInputs({ ...quickUserInputs, [pc.id]: "" });
                      }}
                      onClick={(e) => e.stopPropagation()} // retain clicks inside form
                      className="space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative"
                    >
                      <input
                        type="text"
                        placeholder="Username..."
                        value={quickUserInputs[pc.id] || ""}
                        onChange={(e) =>
                          setQuickUserInputs({ ...quickUserInputs, [pc.id]: e.target.value })
                        }
                        className="w-full text-xs font-mono bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!quickUserInputs[pc.id]?.trim()}
                        className="absolute right-1 top-0 bottom-0 flex items-center justify-center p-1 text-white/50 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-all"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs font-mono text-white/30">
                    Station is currently offline.
                  </div>
                )}
              </div>

              {/* Card bottom details */}
              <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[10px] font-mono">
                <div>
                  {isOccupied && (
                    <span className="text-white/40 font-medium">
                      Started: {new Date(pc.session!.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  )}
                  {isAvailable && <span className="text-white/30">Ready for check-in</span>}
                  {isOffline && <span className="text-white/30">Locked remotely</span>}
                </div>

                {/* Unpaid products warning marker */}
                {isOccupied && hasUnpaidGoods && (
                  <div className="flex items-center gap-1 bg-white/10 text-white px-2 py-0.5 rounded-sm border border-white/20 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>+{unpaidCount} TAB</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {filteredPCs.length === 0 && (
        <div className="py-12 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-white/30">
          <Terminal className="w-8 h-8 text-white/10 mb-2" />
          <p className="text-xs font-mono">No stations matched the filters.</p>
        </div>
      )}
    </div>
  );
}
