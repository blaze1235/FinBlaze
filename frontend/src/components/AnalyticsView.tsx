import React from "react";
import { HistoricReceipt, ShiftReport, UserRole } from "../types";
import { formatCurrency } from "../utils";
import {
  BarChart3, DollarSign, Users, Award,
  FileSpreadsheet, RotateCcw, Printer, Bell, CheckCircle2, AlertTriangle
} from "lucide-react";

interface AnalyticsViewProps {
  receipts: HistoricReceipt[];
  shiftReports: ShiftReport[];
  role: UserRole;
  onClearReceiptsLog: () => void;
  onMarkShiftReportReviewed: (reportId: string) => void;
}

export default function AnalyticsView({
  receipts, shiftReports, role, onClearReceiptsLog, onMarkShiftReportReviewed,
}: AnalyticsViewProps) {
  const isOwner = role === "owner";

  const totalRevenue   = receipts.reduce((s, r) => s + r.totalCollected, 0);
  const timeRevenue    = receipts.reduce((s, r) => s + r.timeCost, 0);
  const snacksRevenue  = receipts.reduce((s, r) => s + r.unpaidItemsCost + r.paidItemsCost, 0);
  const totalCount     = receipts.length;
  const vipCount       = receipts.filter((r) => r.pcName.startsWith("VIP")).length;
  const standardCount  = receipts.filter((r) => r.pcName.startsWith("PC")).length;

  const pendingReports = shiftReports.filter((r) => !r.reviewed);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent text-slate-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300 tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            {isOwner ? "Financial Ledger" : "My Shift"}
          </h2>
          <p className="text-xs text-white/40 mt-1">
            {isOwner
              ? "All transactions across all shifts and operators."
              : "Transactions recorded during your active shift only."}
          </p>
        </div>
        <button
          onClick={onClearReceiptsLog}
          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-mono font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          {isOwner ? "Reset Ledger" : "Clear Shift Log"}
        </button>
      </div>

      {/* Pending shift reports (owner only) */}
      {isOwner && pendingReports.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
              Pending Shift Reports ({pendingReports.length})
            </h3>
          </div>
          <div className="space-y-3">
            {pendingReports.map((report) => {
              const start = new Date(report.startTime);
              const end   = new Date(report.endTime);
              const durH  = Math.floor((end.getTime() - start.getTime()) / 3600000);
              const durM  = Math.floor(((end.getTime() - start.getTime()) % 3600000) / 60000);
              const hasVariance = report.cashVariance !== 0;

              return (
                <div key={report.id} className="glass-panel rounded-xl p-4 border-amber-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold text-sm">{report.operatorName}</p>
                      <p className="text-white/30 text-[10px] font-mono mt-0.5">
                        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {durH}h {durM}m
                      </p>
                    </div>
                    <span className="text-white font-mono font-bold text-sm">{formatCurrency(report.totalRevenue)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono mb-3">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-white/30">Expected cash</p>
                      <p className="text-white font-semibold mt-0.5">{formatCurrency(report.expectedCash)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-white/30">Actual cash</p>
                      <p className="text-white font-semibold mt-0.5">{formatCurrency(report.actualCash)}</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${hasVariance ? "bg-red-500/10 border border-red-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                      <p className={`${hasVariance ? "text-red-400/60" : "text-emerald-400/60"}`}>Variance</p>
                      <p className={`font-bold mt-0.5 ${hasVariance ? "text-red-400" : "text-emerald-400"}`}>
                        {report.cashVariance >= 0 ? "+" : ""}{formatCurrency(report.cashVariance)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasVariance && (
                      <div className="flex items-center gap-1.5 text-[10px] text-red-400/70 font-mono flex-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Cash discrepancy detected
                      </div>
                    )}
                    {!hasVariance && (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/70 font-mono flex-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cash balanced
                      </div>
                    )}
                    <button
                      onClick={() => onMarkShiftReportReviewed(report.id)}
                      className="text-[10px] font-semibold font-mono text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Mark Reviewed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="space-y-1.5 z-10 relative">
            <span className="text-[10px] font-mono font-semibold text-emerald-300/70 uppercase tracking-widest block">Total Collected</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{formatCurrency(totalRevenue)}</span>
            <span className="text-[9px] text-emerald-400/50 font-mono block">{totalCount} sessions</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform relative z-10">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel border-cyan-500/20 rounded-2xl p-5 flex items-center justify-between overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
          <div className="space-y-1.5 z-10 relative">
            <span className="text-[10px] font-mono font-semibold text-cyan-300/70 uppercase tracking-widest block">Game Time</span>
            <span className="text-xl font-bold text-white font-mono">{formatCurrency(timeRevenue)}</span>
            <div className="flex gap-2 text-[9px] font-mono text-white/30 mt-0.5">
              <span>Bar:</span>
              <span className="text-fuchsia-300 font-bold">{formatCurrency(snacksRevenue)}</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform relative z-10">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel border-fuchsia-500/20 rounded-2xl p-5 flex items-center justify-between overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent" />
          <div className="space-y-1.5 z-10 relative">
            <span className="text-[10px] font-mono font-semibold text-fuchsia-300/70 uppercase tracking-widest block">Sessions</span>
            <span className="text-xl font-bold text-white font-mono">{totalCount}</span>
            <span className="text-[9px] text-white/30 font-mono block">
              Avg {totalCount ? formatCurrency(totalRevenue / totalCount) : "0 UZS"}
            </span>
          </div>
          <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-400 border border-fuchsia-500/20 group-hover:scale-110 transition-transform relative z-10">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
          <div className="space-y-1.5 z-10 relative">
            <span className="text-[10px] font-mono font-semibold text-yellow-300/70 uppercase tracking-widest block">Top Zone</span>
            <span className="text-lg font-bold text-yellow-400 font-mono">
              {vipCount >= standardCount ? "VIP" : "Standard"}
            </span>
            <p className="text-[9px] text-white/30 font-mono">
              VIP {totalCount ? Math.round((vipCount / totalCount) * 100) : 0}% of sessions
            </p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20 group-hover:scale-110 transition-transform relative z-10">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Transaction log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider font-mono flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            {isOwner ? "All Transactions" : "Shift Transactions"}
          </h3>
          <span className="text-[10px] font-mono text-white/20">{totalCount} records</span>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/5 text-white/40 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Station</th>
                  <th className="p-4">Player</th>
                  {isOwner && <th className="p-4">Operator</th>}
                  <th className="p-4">Time</th>
                  <th className="p-4">Bar</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Method</th>
                  <th className="p-4 text-right">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {receipts.map((r, idx) => (
                  <tr key={idx} className="hover:bg-cyan-500/5 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded-lg">
                        {r.id}
                      </span>
                    </td>
                    <td className="p-4 text-white font-semibold">{r.pcName}</td>
                    <td className="p-4 font-mono text-white/50">{r.user}</td>
                    {isOwner && (
                      <td className="p-4 font-mono text-white/30 text-[10px]">{r.operatorId || "—"}</td>
                    )}
                    <td className="p-4 font-mono text-white/40">{formatCurrency(r.timeCost)}</td>
                    <td className="p-4 font-mono text-fuchsia-300/70">+{formatCurrency(r.unpaidItemsCost)}</td>
                    <td className="p-4 text-right font-mono text-emerald-400 font-bold">{formatCurrency(r.totalCollected)}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-white/10 border border-white/15 text-white font-semibold">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`Print: ${r.id}`)}
                        className="inline-flex items-center gap-1 p-1.5 bg-white/5 hover:bg-cyan-500/20 text-white/30 hover:text-cyan-300 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {receipts.length === 0 && (
                  <tr>
                    <td colSpan={isOwner ? 9 : 8} className="p-10 text-center text-white/20 font-mono text-xs">
                      No transactions recorded yet.
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
