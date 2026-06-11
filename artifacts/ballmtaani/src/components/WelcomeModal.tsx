/**
 * WelcomeModal
 *
 * Shows ONCE after a new fan signs up via Google.
 * Shown only when:
 *   - User is logged in
 *   - localStorage key "mtaani_welcomed" is not set
 *
 * Guides them to:
 *   1. Make their 6 WC26 bold calls
 *   2. Join the WhatsApp community
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { X, Trophy, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const WHATSAPP_GROUP = "https://chat.whatsapp.com/FYadWQJ4KgjC0HS4AUihmm";
const STORAGE_KEY = "mtaani_welcomed_v1";

export default function WelcomeModal() {
  const { isLoggedIn, username } = useAuth();
  const [, setLocation] = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    const welcomed = localStorage.getItem(STORAGE_KEY);
    if (!welcomed) {
      // Small delay so the page settles first
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isLoggedIn]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const goToPredictions = () => {
    dismiss();
    setLocation("/predictions");
  };

  const joinWhatsApp = () => {
    window.open(WHATSAPP_GROUP, "_blank");
  };

  if (!show) return null;

  const firstName = username?.split(" ")[0] || "Fan";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0f14] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#1a1200] to-[#0a0c14] px-5 py-5 border-b border-white/8">
          <button onClick={dismiss} className="absolute right-4 top-4 text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="text-2xl mb-2">🎉</div>
          <h2 className="text-lg font-black uppercase tracking-widest text-white">
            Welcome, {firstName}!
          </h2>
          <p className="text-[11px] text-white/40 mt-1">
            You're in. WC26 kicks off in 9 days — don't miss out.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-3">

          {/* Primary — WC26 Predictions */}
          <button
            onClick={goToPredictions}
            className="w-full flex items-center gap-3 rounded-xl bg-[#FFD700] px-4 py-3.5 text-left transition-all hover:bg-yellow-400 active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-black">Make Your WC26 Calls</p>
              <p className="text-[10px] text-black/60 mt-0.5">6 bold predictions · 1,700 MTC on the line</p>
            </div>
          </button>

          {/* Secondary — WhatsApp community */}
          <button
            onClick={joinWhatsApp}
            className="w-full flex items-center gap-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/8 px-4 py-3.5 text-left transition-all hover:bg-[#25D366]/15 active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#25D366]/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#25D366]">Join WC26 WhatsApp Group</p>
              <p className="text-[10px] text-white/30 mt-0.5">Live match reactions · Score alerts · Fan debates</p>
            </div>
          </button>

          {/* Skip */}
          <button
            onClick={dismiss}
            className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors py-1"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
