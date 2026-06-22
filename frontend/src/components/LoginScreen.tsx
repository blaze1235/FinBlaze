import React, { useState } from "react";
import { User } from "../types";
import { USERS } from "../config";
import { Terminal, Delete, ChevronLeft } from "lucide-react";

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setPin("");
    setError(false);
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);

    if (next.length === 4) {
      setTimeout(() => verifyPin(next), 100);
    }
  };

  const handleClear = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const verifyPin = (enteredPin: string) => {
    if (!selectedUser) return;
    if (enteredPin === selectedUser.pin) {
      onLogin(selectedUser);
    } else {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  };

  const PAD_KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="fixed inset-0 bg-[#0B0F19] flex items-center justify-center z-50">
      {/* Background grid texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-4">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-white font-bold text-xl tracking-wide uppercase">FinBlaze POS</h1>
          <p className="text-white/30 text-xs font-mono mt-1">Shift Access Required</p>
        </div>

        {!selectedUser ? (
          /* Step 1: Select staff member */
          <div>
            <p className="text-white/50 text-xs font-mono uppercase tracking-widest text-center mb-4">
              Who are you?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="glass-panel px-5 py-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">{user.name}</p>
                      <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">{user.role}</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-white/20 rotate-180 group-hover:text-white/60 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: PIN pad */
          <div>
            <button
              onClick={() => { setSelectedUser(null); setPin(""); setError(false); }}
              className="flex items-center gap-2 text-white/30 hover:text-white/60 text-xs font-mono mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white mx-auto mb-3">
                {selectedUser.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-white font-semibold">{selectedUser.name}</p>
              <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">{selectedUser.role}</p>
            </div>

            {/* PIN dots */}
            <div className={`flex justify-center gap-3 mb-8 ${shake ? "animate-[shake_0.4s_ease]" : ""}`}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-150 ${
                    i < pin.length
                      ? error ? "bg-red-400" : "bg-white"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-red-400 text-xs font-mono mb-4">Incorrect PIN. Try again.</p>
            )}

            {/* PIN pad */}
            <div className="grid grid-cols-3 gap-2">
              {PAD_KEYS.map((key, idx) => {
                if (key === "") return <div key={idx} />;
                if (key === "⌫") return (
                  <button
                    key={idx}
                    onClick={handleClear}
                    className="h-14 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                );
                return (
                  <button
                    key={idx}
                    onClick={() => handleDigit(key)}
                    className="h-14 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-semibold text-lg transition-all active:scale-95"
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
