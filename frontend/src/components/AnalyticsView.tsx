import React from "react";
import { HistoricReceipt } from "../types";
import { formatCurrency } from "../utils";
import { 
  BarChart3, Calendar, DollarSign, Users, Award, 
  Sparkles, CheckCircle, FileSpreadsheet, RotateCcw, ArrowRight, Printer 
} from "lucide-react";

interface AnalyticsViewProps {
  receipts: HistoricReceipt[];
  onClearReceiptsLog: () => void;
}

export default function AnalyticsView({ receipts, onClearReceiptsLog }: AnalyticsViewProps) {
  
  // Compute analytics from receipts
  const totalReceived = receipts.reduce((acc, r) => acc + r.totalCollected, 0);
  const timeRevenue = receipts.reduce((acc, r) => acc + r.timeCost, 0);
  const snacksRevenue = receipts.reduce((acc, r) => acc + r.unpaidItemsCost + r.paidItemsCost, 0);
  const totalCount = receipts.length;
  
  // Find VIP proportion
  const vipCount = receipts.filter(r => r.pcName.startsWith("VIP")).length;
  const standardCount = receipts.filter(r => r.pcName.startsWith("PC")).length;

  return (
    <div id="financial-reports-view" className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent text-slate-300 backdrop-blur-sm">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">Financial & Session Ledger</h2>
          <p className="text-xs text-white/50 mt-1">
            Performance figures, aggregated cash desks, and historic checkout invoice documents.
          </p>
        </div>

        {/* Clear Logs button */}
        <button
          onClick={onClearReceiptsLog}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-mono font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="drop-shadow-sm">Reset Financial Desk</span>
        </button>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Total Earnings */}
        <div className="glass-panel border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between overflow-hidden group shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
          <div className="space-y-1.5 z-10 w-full relative">
            <span className="text-[10px] font-mono font-semibold text-emerald-300/80 uppercase tracking-widest block drop-shadow-md">Gross Desk Collected</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">{formatCurrency(totalReceived)}</span>
            <span className="text-[9px] text-emerald-400/60 font-mono block">Shift registry: 100% Settle</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.2)] group-hover:scale-110 transition-transform relative z-10">
            <DollarSign className="w-6 h-6 drop-shadow-md" />
          </div>
        </div>

        {/* Metric 2: Time vs Snacks */}
        <div className="glass-panel border-cyan-500/20 rounded-2xl p-5 flex items-center justify-between overflow-hidden group shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
          <div className="space-y-1.5 z-10 relative">
            <span className="text-[10px] font-mono font-semibold text-cyan-300/80 uppercase tracking-widest block drop-shadow-md">Game Rent portion</span>
            <span className="text-xl font-bold text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{formatCurrency(timeRevenue)}</span>
            <div className="flex gap-2 text-[9px] font-mono text-cyan-200/60 mt-1">
              <span>Snacks:</span>
              <span className="text-fuchsia-300 font-bold drop-shadow-[0_0_3px_rgba(217,70,239,0.5)]">{formatCurrency(snacksRevenue)}</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform relative z-10">
            <BarChart3 className="w-6 h-6 drop-shadow-md" />
          </div>
        </div>

        {/* Metric 3: Total closed players */}
        <div className="glass-panel border-fuchsia-500/20 rounded-2xl p-5 flex items-center justify-between overflow-hidden group shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent"></div>
          <div className="space-y-1.5 z-10 relative">
            <span className="text-[10px] font-mono font-semibold text-fuchsia-300/80 uppercase tracking-widest block drop-shadow-md">Resolved Gamers</span>
            <span className="text-xl font-bold text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{totalCount} checkout sessions</span>
            <span className="text-[9px] text-fuchsia-200/60 font-mono block">Avg checkout: {totalCount ? formatCurrency(totalReceived / totalCount) : "0 UZS"}</span>
          </div>
          <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.2)] group-hover:scale-110 transition-transform relative z-10">
            <Users className="w-6 h-6 drop-shadow-md" />
          </div>
        </div>

        {/* Metric 4: Traffic hotspot Ratio */}
        <div className="glass-panel border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between overflow-hidden group shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent"></div>
          <div className="space-y-1.5 z-10 relative">
            <span className="text-[10px] font-mono font-semibold text-yellow-300/80 uppercase tracking-widest block drop-shadow-md">Console Traffic Hotspot</span>
            <span className="text-lg font-bold text-yellow-400 font-mono drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">{vipCount >= standardCount ? "VIP SECTORS" : "STANDARD SECTORS"}</span>
            <p className="text-[9px] text-yellow-200/60 font-mono">
              VIP prop: {totalCount ? Math.round((vipCount / totalCount) * 100) : 0}%
            </p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.2)] group-hover:scale-110 transition-transform relative z-10">
            <Award className="w-6 h-6 drop-shadow-md" />
          </div>
        </div>

      </div>

      {/* Receipts Logs and physical desk list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider font-mono flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" /> Close-of-Shift Checkout Journals
          </h3>
          <span className="text-[10.5px] font-mono text-cyan-500/50">
            Auto-archived locally
          </span>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 text-white/50 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                  <th className="p-4">Session Invoice ID</th>
                  <th className="p-4">PC Context</th>
                  <th className="p-4">User Profile</th>
                  <th className="p-4">Time Play Cost</th>
                  <th className="p-4">Unpaid Snacks</th>
                  <th className="p-4 text-right">Sum Collected</th>
                  <th className="p-4 text-center">Payment System</th>
                  <th className="p-4 text-right">Print Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {receipts.map((r, idx) => (
                  <tr key={idx} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-2.5 py-1 rounded-lg shadow-[0_0_8px_rgba(34,211,238,0.15)]">
                        {r.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white text-[12.5px]">{r.pcName}</span>
                    </td>
                    <td className="p-4 font-mono text-white/60">
                      {r.user}
                    </td>
                    <td className="p-4 font-mono text-white/50">
                      {formatCurrency(r.timeCost)}
                    </td>
                    <td className="p-4 font-mono text-fuchsia-300/80 drop-shadow-[0_0_3px_rgba(217,70,239,0.3)]">
                      + {formatCurrency(r.unpaidItemsCost)}
                    </td>
                    <td className="p-4 text-right font-mono text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
                      {formatCurrency(r.totalCollected)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] bg-white/10 border border-white/20 text-white font-bold font-sans shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`Re-spooling invoice data package for ${r.id}...`)}
                        className="inline-flex items-center gap-1.5 p-2 bg-white/5 hover:bg-cyan-500/20 text-white/50 hover:text-cyan-300 rounded-xl border border-white/10 hover:border-cyan-500/40 text-[10px] font-mono cursor-pointer transition-all shadow-sm hover:shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Duplicat</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {receipts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-white/30 font-mono italic">
                      No cleared shift registers found on current cycle. Checkout some machines to spool logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
