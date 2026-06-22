import React, { useState } from "react";
import { Shift, HistoricReceipt, ShiftReport, User } from "../types";
import { formatCurrency } from "../utils";
import { X, Banknote, CreditCard, ShieldCheck, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface ShiftCloseModalProps {
  shift: Shift;
  currentUser: User;
  receipts: HistoricReceipt[]; // already filtered to this shift
  onConfirm: (report: ShiftReport) => void;
  onCancel: () => void;
}

export default function ShiftCloseModal({ shift, currentUser, receipts, onConfirm, onCancel }: ShiftCloseModalProps) {
  const [actualCash, setActualCash] = useState("");

  const now = new Date();
  const startTime = new Date(shift.startTime);
  const durationMs = now.getTime() - startTime.getTime();
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);

  const cashReceipts   = receipts.filter((r) => r.paymentMethod === "Cash");
  const cardReceipts   = receipts.filter((r) => r.paymentMethod === "Uzcard/Humo");
  const clubReceipts   = receipts.filter((r) => r.paymentMethod === "Club Balance");

  const expectedCash  = cashReceipts.reduce((s, r) => s + r.totalCollected, 0);
  const expectedCard  = cardReceipts.reduce((s, r) => s + r.totalCollected, 0);
  const expectedClub  = clubReceipts.reduce((s, r) => s + r.totalCollected, 0);
  const totalRevenue  = receipts.reduce((s, r) => s + r.totalCollected, 0);

  const parsedActualCash = parseInt(actualCash.replace(/\D/g, ""), 10) || 0;
  const cashVariance = parsedActualCash - expectedCash;

  const canSubmit = actualCash.trim() !== "";

  const handleConfirm = () => {
    const report: ShiftReport = {
      id: `SR-${Date.now()}`,
      shiftId: shift.id,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      startTime: shift.startTime,
      endTime: now.toISOString(),
      totalReceipts: receipts.length,
      totalRevenue,
      expectedCash,
      expectedCard,
      expectedClubBalance: expectedClub,
      actualCash: parsedActualCash,
      cashVariance,
      reviewed: false,
    };
    onConfirm(report);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wide uppercase">Close Shift</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5">{currentUser.name} · Started {startTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-[#050505]">

          {/* Shift duration summary */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-white/40" />
              <div>
                <p className="text-white font-semibold text-sm">{hours}h {minutes}m shift</p>
                <p className="text-white/40 text-[10px] font-mono">{receipts.length} transactions · {formatCurrency(totalRevenue)} total</p>
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div>
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider font-mono mb-3">Payment Breakdown</h4>
            <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Banknote className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-white/80 text-sm font-medium">Cash</p>
                    <p className="text-white/30 text-[10px] font-mono">{cashReceipts.length} transactions</p>
                  </div>
                </div>
                <span className="text-white font-mono font-semibold text-sm">{formatCurrency(expectedCash)}</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-white/80 text-sm font-medium">UzCard / HUMO</p>
                    <p className="text-white/30 text-[10px] font-mono">{cardReceipts.length} transactions</p>
                  </div>
                </div>
                <span className="text-white font-mono font-semibold text-sm">{formatCurrency(expectedCard)}</span>
              </div>
              {expectedClub > 0 && (
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-white/40" />
                    <div>
                      <p className="text-white/80 text-sm font-medium">Club Balance</p>
                      <p className="text-white/30 text-[10px] font-mono">{clubReceipts.length} transactions</p>
                    </div>
                  </div>
                  <span className="text-white font-mono font-semibold text-sm">{formatCurrency(expectedClub)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cash count input */}
          <div>
            <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider font-mono mb-3">Cash Count</h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Expected cash in drawer</span>
                <span className="text-white font-mono">{formatCurrency(expectedCash)}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-white/50 text-sm shrink-0">Actual cash counted</label>
                <input
                  type="number"
                  placeholder="0"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-right focus:outline-none focus:border-white/40 transition-colors"
                />
              </div>
              {actualCash !== "" && (
                <div className={`flex justify-between text-sm pt-2 border-t border-white/10 ${cashVariance === 0 ? "text-emerald-400" : cashVariance > 0 ? "text-blue-400" : "text-red-400"}`}>
                  <div className="flex items-center gap-2">
                    {cashVariance === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>Variance</span>
                  </div>
                  <span className="font-mono font-semibold">
                    {cashVariance >= 0 ? "+" : ""}{formatCurrency(cashVariance)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-[#050505]">
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="w-full py-3.5 bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 text-black font-semibold rounded-xl transition-colors text-sm"
          >
            Submit & Close Shift
          </button>
          <p className="text-center text-[10px] text-white/20 font-mono mt-3">
            This will notify the owner and log your shift report.
          </p>
        </div>

      </div>
    </div>
  );
}
