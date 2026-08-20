import { useState } from "react";
import { Sparkles, ChevronRight, X, Bot, Flame, ShieldAlert, Award } from "lucide-react";
import { askMchambuziHalisi } from "../lib/mchambuzi-halisi";

interface MchambuziInsightChipProps {
  matchOrTopic: string;
  shortSummary?: string;
  contextType?: "match" | "news" | "league";
  homeTeam?: string;
  awayTeam?: string;
}

export default function MchambuziInsightChip({
  matchOrTopic,
  shortSummary,
  contextType = "match",
  homeTeam,
  awayTeam,
}: MchambuziInsightChipProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const defaultTake = shortSummary || (homeTeam && awayTeam 
    ? `${homeTeam} vs ${awayTeam}: Expect tactical press battles. Watch for key set-piece opportunities in the 2nd half.` 
    : `Mchambuzi AI: Analysis calibrating for ${matchOrTopic}.`);

  const handleOpenInsight = async () => {
    setOpen(true);
    if (analysis) return;

    setLoading(true);
    try {
      const prompt = contextType === "match" && homeTeam && awayTeam
        ? `Provide a quick 3-bullet tactical breakdown and fan perspective for ${homeTeam} vs ${awayTeam}.`
        : `Provide quick tactical context for ${matchOrTopic}.`;
      const res = await askMchambuziHalisi(prompt);
      setAnalysis(res.answer || defaultTake);
    } catch {
      setAnalysis(defaultTake);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* INLINE CHIP */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpenInsight();
        }}
        className="group flex w-full items-center justify-between gap-2 rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/8 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#FFD700] transition-all hover:border-[#FFD700]/60 hover:bg-[#FFD700]/15"
      >
        <span className="flex items-center gap-1.5 min-w-0 truncate">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#FFD700] animate-pulse" />
          <span className="truncate text-white/90">{defaultTake}</span>
        </span>
        <span className="flex items-center gap-0.5 shrink-0 text-[#FFD700]">
          <span>AI TAKE</span>
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </button>

      {/* POPUP MODAL */}
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#FFD700]/30 bg-[#0c0d12] p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/40">
                  <Bot className="h-4 w-4 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Mchambuzi AI Tactical Take</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{matchOrTopic}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Analysis Content */}
            <div className="my-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#FFD700]" />
                  <p className="text-xs font-black uppercase tracking-widest text-[#FFD700]">Mchambuzi is analyzing form &amp; stats...</p>
                </div>
              ) : (
                <div className="space-y-3 text-sm leading-relaxed text-white/80">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-white">{analysis}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 pt-2">
                    <Award className="h-3.5 w-3.5 text-[#FFD700]" />
                    <span>Calibrated for African Football Context</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="flex justify-end border-t border-white/10 pt-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-[#FFD700] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-[#ffe033] transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
