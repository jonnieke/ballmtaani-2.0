import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Copy, Check, Users, Coins } from "lucide-react";

const BASE_URL = "https://ballmtaani20.vercel.app";

export function InviteWidget() {
  const { username, isLoggedIn } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isLoggedIn) return null;

  const inviteCode = username?.toLowerCase().replace(/\s+/g, '') || 'fan';
  const inviteLink = `${BASE_URL}/?ref=${inviteCode}`;

  const invitesSent = parseInt(localStorage.getItem(`mtaani_invites_sent_${inviteCode}`) || '0', 10);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      const current = parseInt(localStorage.getItem(`mtaani_invites_sent_${inviteCode}`) || '0', 10);
      localStorage.setItem(`mtaani_invites_sent_${inviteCode}`, (current + 1).toString());
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(
      `🔥 I'm on BallMtaani — Africa's #1 Football Hub!\n\nJoin me to predict scores, debate tactics, and earn coins. We BOTH get 500 MTC when you sign up! 🏆\n\n👉 ${inviteLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
    const current = parseInt(localStorage.getItem(`mtaani_invites_sent_${inviteCode}`) || '0', 10);
    localStorage.setItem(`mtaani_invites_sent_${inviteCode}`, (current + 1).toString());
  };

  return (
    <div className="bg-[#111] border border-[#FFD700]/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFD700]/10 to-transparent border-b border-[#FFD700]/10 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-[#FFD700]" />
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-widest text-white">Invite Friends</h3>
          <p className="text-[10px] text-[#FFD700] font-bold">You & your friend BOTH earn 500 MTC</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Reward info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="text-[#FFD700] font-black text-lg">500</span>
            </div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">You earn</p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="text-[#FFD700] font-black text-lg">500</span>
            </div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">They earn</p>
          </div>
        </div>

        {/* Invite link */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <span className="text-[11px] text-gray-400 font-mono flex-1 truncate">{inviteLink}</span>
          <button
            onClick={copyLink}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* WhatsApp share */}
        <button
          onClick={shareToWhatsApp}
          className="w-full py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-black uppercase tracking-widest rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.2)]"
        >
          📲 Share via WhatsApp
        </button>

        {invitesSent > 0 && (
          <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {invitesSent} invite{invitesSent !== 1 ? 's' : ''} sent so far 🙌
          </p>
        )}
      </div>
    </div>
  );
}
