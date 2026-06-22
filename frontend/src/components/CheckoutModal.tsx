import React, { useState } from "react";
import { PC, CartItem } from "../types";
import { formatCurrency, formatDuration, calculateDurationMs, calculateTimeCost } from "../utils";
import { X, CreditCard, Banknote, ShieldCheck, Printer, Check, ShoppingBag, Clock } from "lucide-react";

interface CheckoutModalProps {
  pc: PC | null;
  onClose: () => void;
  onConfirmCheckout: (paymentMethod: string, rawCosts: {
    timeCost: number;
    unpaidItemsCost: number;
    paidItemsCost: number;
    totalCollected: number;
  }) => void;
}

export default function CheckoutModal({ pc, onClose, onConfirmCheckout }: CheckoutModalProps) {
  if (!pc || !pc.session) return null;

  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [isReceiptPrinting, setIsReceiptPrinting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Calculate costs final tick
  const nowMs = Date.now();
  const durationMs = calculateDurationMs(pc.session.startTime, nowMs);
  const timeCost = calculateTimeCost(pc.session.startTime, pc.ratePerHour, nowMs);

  // Parse items
  const unpaidItems = pc.cart.filter((item) => !item.paidInstant);
  const paidItems = pc.cart.filter((item) => item.paidInstant);

  const unpaidItemsCost = unpaidItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const paidItemsCost = paidItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const totalToCollect = timeCost + unpaidItemsCost;

  // Breakdown duration details
  const totalMinutes = Math.floor(durationMs / (1000 * 60));
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const handleConfirm = () => {
    // Perform simulated invoice processing
    onConfirmCheckout(paymentMethod, {
      timeCost,
      unpaidItemsCost,
      paidItemsCost,
      totalCollected: totalToCollect
    });
  };

  const paymentMethodsList = [
    { id: "Cash", label: "Cash UZS", icon: Banknote, desc: "Physical bills in register" },
    { id: "Uzcard/Humo", label: "UzCard / HUMO", icon: CreditCard, desc: "Fast local terminal lookup" },
    { id: "Club Balance", label: "Club Balance", icon: ShieldCheck, desc: "Pre-paid personal gamer profile" }
  ];

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div>
               <h3 className="text-white font-semibold text-sm tracking-wide uppercase">Final Invoice</h3>
               <p className="text-[10px] text-white/50 font-mono mt-0.5">Reference: {pc.name} - {pc.session.user}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 hover:text-white rounded-lg text-white/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-[#050505]">
          
          {/* Quick Stats overview panel */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-medium text-white/50 tracking-wider block uppercase">Total Invoice Collected</span>
              <span className="text-2xl font-semibold text-white font-mono tracking-tight">{formatCurrency(totalToCollect)}</span>
            </div>
            
            <div className="text-right text-[11px] font-mono text-white/50">
              <p>Active Duration:</p>
              <p className="font-semibold text-white text-xs mt-0.5">{hrs} hrs {mins} mins</p>
              <p className="text-[9px] text-white/30 mt-0.5">Rate: {formatCurrency(pc.ratePerHour)}/hr</p>
            </div>
          </div>

          {/* Itemized Invoice Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider font-mono">Invoice Breakdown</h4>
            
            <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 bg-white/5">
              {/* Computer Session Cost Row */}
              <div className="p-4 flex items-start justify-between text-xs transition-colors hover:bg-white/5">
                <div className="flex gap-3">
                  <Clock className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-white">Station Play Time</p>
                    <p className="text-[10px] text-white/50 font-mono mt-0.5">
                      {hrs} hr {mins} min @ {formatCurrency(pc.ratePerHour)}/hr
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-white font-mono">{formatCurrency(timeCost)}</span>
              </div>

              {/* Unpaid items rows */}
              {unpaidItems.map((item, idx) => (
                <div key={`unpaid-${idx}`} className="p-4 flex items-start justify-between text-xs transition-colors hover:bg-white/5">
                  <div className="flex gap-3">
                     <ShoppingBag className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-[10px] text-white/50 font-mono mt-0.5">
                        Inventory • {item.quantity} units x {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-white font-mono">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              {/* Paid items (Reference only, zeroed out) */}
              {paidItems.map((item, idx) => (
                <div key={`paid-${idx}`} className="p-4 flex items-start justify-between text-xs bg-white/5 transition-colors opacity-60">
                  <div className="flex gap-3">
                    <Check className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-white/50 line-through">{item.name}</p>
                      <p className="text-[10px] text-white/30 font-mono mt-0.5">
                        Inventory • Instantly Paid • {item.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-white/30 line-through text-[11px] block">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <span className="text-[9px] font-semibold text-white/50 uppercase font-mono tracking-wider">
                      Settled
                    </span>
                  </div>
                </div>
              ))}

              {unpaidItems.length === 0 && (
                <div className="p-4 text-center text-[11px] text-white/30 font-mono italic">
                  No unpaid items.
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider font-mono">
              Payment Method
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paymentMethodsList.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                      active
                        ? "border-white bg-white/10"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`w-5 h-5 ${active ? "text-white" : "text-white/40"}`} />
                      {active && (
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <span className={`font-medium text-sm block mt-2 ${active ? "text-white" : "text-white/80"}`}>{m.label}</span>
                      <span className="text-[9px] text-white/40 leading-relaxed font-mono truncate max-w-full block mt-0.5">
                        {m.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer actions */}
        <div className="p-5 bg-[#050505] border-t border-white/5 flex flex-col gap-3">
          
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-white hover:bg-white/90 active:bg-white/80 text-black font-semibold tracking-wide rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm"
          >
            <Check className="w-5 h-5 shrink-0" />
            <span>Confirm Payment & Clear Session</span>
          </button>

          <div className="flex gap-2 justify-between text-[10px] text-white/40 font-mono px-2 mt-1">
            <button
              onClick={() => {
                setIsReceiptPrinting(true);
                setTimeout(() => setIsReceiptPrinting(false), 2000);
              }}
              className="hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-white/30" />
              <span>{isReceiptPrinting ? "Printing..." : "Print Bill"}</span>
            </button>
            <span>JD • Administrator</span>
          </div>
        </div>

      </div>
    </div>
  );
}
