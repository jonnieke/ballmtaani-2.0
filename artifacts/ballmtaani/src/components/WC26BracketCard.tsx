import { useState } from "react";
import { X, MessageCircle, Twitter, Copy, CheckCheck, Share2, Trophy } from "lucide-react";

interface WC26Question {
  id: string;
  emoji: string;
  title: string;
  mtc: number;
}

interface Props {
  picks: Record<string, string>;
  consensus: Record<string, Record<string, number>>;
  questions: WC26Question[];
  onClose: () => void;
}

function consensusPct(consensus: Record<string, Record<string, number>>, qId: string, pick: string): number {
  const counts = consensus[qId] || {};
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  if (!total) return 0;
  return Math.round(((counts[pick] || 0) / total) * 100);
}

export function WC26BracketCard({ picks, consensus, questions, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const filled = questions.filter(q => picks[q.id]);
  const totalMtc = filled.reduce((s, q) => s + q.mtc, 0);

  const lines = filled.map(q => `${q.emoji} ${q.title}: ${picks[q.id]}`).join("\n");
  const shareText = `🏆 My WC26 Bold Calls on BallMtaani\n\n${lines}\n\n${totalMtc.toLocaleString()} MTC on the line — can you top me?\n👉 https://ballmtaani.com/predictions`;

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const shareTwitter  = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const nativeShare = () =>
    navigator.share({ title: "My WC26 Bold Calls — BallMtaani", text: shareText, url: "https://ballmtaani.com/predictions" });

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

        {/* ── THE CARD — designed to look great as a screenshot ── */}
        <div className="relative overflow-hidden rounded-3xl border border-[#FFD700]/30 shadow-[0_0_80px_rgba(255,215,0,0.18)]">
          <div className="absolute inset-0 bg-[#07090f]" />
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#FFD700]/10 blur-[90px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#B30000]/8 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10 p-6">
            {/* Brand header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#B30000] rounded flex items-center justify-center text-[9px] font-black text-white">B</div>
                <span className="text-white font-black text-xs uppercase tracking-[0.28em] opacity-55">BallMtaani</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-[#FFD700]/70" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]/70">WC26 Bold Calls</span>
              </div>
            </div>

            <div className="mb-4 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />

            {/* Picks list */}
            <div className="space-y-2 mb-5">
              {filled.map(q => {
                const pct = consensusPct(consensus, q.id, picks[q.id]);
                const majority = pct >= 50;
                return (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.035] px-3 py-2.5"
                  >
                    <span className="text-base w-6 text-center shrink-0 leading-none">{q.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider truncate">{q.title}</div>
                      <div className="text-[13px] font-black text-[#FFD700] leading-tight truncate">{picks[q.id]}</div>
                    </div>
                    {pct > 0 && (
                      <div
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black tabular-nums ${
                          majority
                            ? "bg-[#FFD700]/15 text-[#FFD700]"
                            : "bg-white/6 text-white/35"
                        }`}
                      >
                        {majority ? "✓ " : ""}{pct}% agree
                      </div>
                    )}
                  </div>
                );
              })}

              {filled.length === 0 && (
                <div className="py-6 text-center text-sm text-white/25">Lock in picks to generate your card.</div>
              )}
            </div>

            {/* Footer */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/15 to-transparent mb-4" />
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[#FFD700] font-black text-xl tabular-nums">{totalMtc.toLocaleString()} MTC</div>
                <div className="text-[9px] text-white/25 font-semibold uppercase tracking-wider">on the line</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/25">ballmtaani.com</div>
                <div className="text-[8px] text-white/15 mt-0.5">Kenyan fans. Big match banter.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Share buttons ── */}
        <p className="mt-3 mb-2 text-center text-[9px] font-black uppercase tracking-widest text-white/25">
          Screenshot the card above · or share the link
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-2xl py-4 transition-all hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
            <span className="text-[#25D366] text-[10px] font-black uppercase tracking-wider">WhatsApp</span>
          </button>

          <button
            onClick={shareTwitter}
            className="flex flex-col items-center gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-2xl py-4 transition-all hover:scale-105 active:scale-95"
          >
            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
            <span className="text-[#1DA1F2] text-[10px] font-black uppercase tracking-wider">Twitter/X</span>
          </button>

          <button
            onClick={copyText}
            className={`flex flex-col items-center gap-2 border rounded-2xl py-4 transition-all hover:scale-105 active:scale-95 ${
              copied ? "bg-green-500/10 border-green-500/30" : "bg-white/5 hover:bg-white/10 border-white/10"
            }`}
          >
            {copied
              ? <CheckCheck className="w-6 h-6 text-green-400" />
              : <Copy className="w-6 h-6 text-gray-400" />
            }
            <span className={`text-[10px] font-black uppercase tracking-wider ${copied ? "text-green-400" : "text-gray-400"}`}>
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </div>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={nativeShare}
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
