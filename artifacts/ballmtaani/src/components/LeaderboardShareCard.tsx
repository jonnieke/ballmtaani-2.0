import { useState } from "react";
import { X, MessageCircle, Twitter, Copy, CheckCheck, Share2, Trophy } from "lucide-react";

interface Props {
  rank: number;
  username: string;
  pts: number | string;
  streak: number;
  tab: string;
  onClose: () => void;
}

const RANK_LABELS: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };
const RANK_COLORS: Record<number, string> = {
  1: "text-[#FFD700]",
  2: "text-gray-300",
  3: "text-[#CD7F32]",
};

export function LeaderboardShareCard({ rank, username, pts, streak, tab, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const tabLabel = tab === "wc26" ? "WC26 Calls" : tab === "weekly" ? "Weekly" : "Global";
  const rankLabel = RANK_LABELS[rank] ?? `#${rank}`;
  const rankColor = RANK_COLORS[rank] ?? "text-white";

  const shareText = [
    `🏆 I'm ${rankLabel} on the BallMtaani ${tabLabel} Leaderboard!`,
    ``,
    `${pts} MTC status points${streak > 0 ? ` · 🔥 ${streak} streak` : ""}`,
    ``,
    `Can you beat me? → https://ballmtaani.com/leaderboard`,
  ].join("\n");

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const shareTwitter  = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* ── Card ── */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FFD700]/30 shadow-[0_0_80px_rgba(255,215,0,0.15)]">
          <div className="absolute inset-0 bg-[#07090f]" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FFD700]/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10 p-6 text-center">
            {/* Brand */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="w-5 h-5 bg-[#B30000] rounded flex items-center justify-center text-[9px] font-black text-white">B</div>
              <span className="text-white font-black text-xs uppercase tracking-[0.28em] opacity-55">BallMtaani</span>
            </div>

            {/* Rank badge */}
            <div className={`text-7xl font-black mb-1 tabular-nums ${rankColor}`} style={{ lineHeight: 1 }}>
              {rankLabel}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30 mb-5">{tabLabel} Leaderboard</div>

            {/* Username */}
            <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Fan</div>
              <div className="text-xl font-black text-white">{username}</div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-0.5">MTC Points</div>
                <div className="text-lg font-black text-[#FFD700] tabular-nums">{Number(pts).toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/[0.03] px-3 py-3">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-0.5">Streak</div>
                <div className="text-lg font-black text-white">
                  {streak > 0 ? `🔥 ${streak}` : "–"}
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/15 to-transparent mb-4" />
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">ballmtaani.com</div>
          </div>
        </div>

        <p className="mt-3 mb-2 text-center text-[9px] font-black uppercase tracking-widest text-white/25">
          Screenshot the card · or share the link
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={shareWhatsApp}
            className="flex flex-col items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-2xl py-4 transition-all hover:scale-105 active:scale-95">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
            <span className="text-[#25D366] text-[10px] font-black uppercase tracking-wider">WhatsApp</span>
          </button>
          <button onClick={shareTwitter}
            className="flex flex-col items-center gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-2xl py-4 transition-all hover:scale-105 active:scale-95">
            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
            <span className="text-[#1DA1F2] text-[10px] font-black uppercase tracking-wider">Twitter/X</span>
          </button>
          <button onClick={copyText}
            className={`flex flex-col items-center gap-2 border rounded-2xl py-4 transition-all hover:scale-105 active:scale-95 ${copied ? "bg-green-500/10 border-green-500/30" : "bg-white/5 hover:bg-white/10 border-white/10"}`}>
            {copied ? <CheckCheck className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6 text-gray-400" />}
            <span className={`text-[10px] font-black uppercase tracking-wider ${copied ? "text-green-400" : "text-gray-400"}`}>
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </div>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={() => navigator.share({ title: "BallMtaani Leaderboard", text: shareText, url: "https://ballmtaani.com/leaderboard" })}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-3 transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-xs font-black uppercase tracking-widest">Share via...</span>
          </button>
        )}
      </div>
    </div>
  );
}
