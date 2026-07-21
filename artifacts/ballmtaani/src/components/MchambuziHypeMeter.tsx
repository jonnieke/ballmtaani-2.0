/**
 * BallMtaani Mchambuzi Hype & Drama Meter
 * Phase 3 component: Visualizes matchday sentiment, drama index, and Kenyan fan prediction consensus.
 */

import React from "react";

interface Props {
  homeTeam: string;
  awayTeam: string;
  homeRatio?: number; // 0 - 100
  drawRatio?: number;
  awayRatio?: number;
  dramaLevel?: "HIGH DRAMA" | "TITLE DECIDER" | "LOCAL DERBY" | "TACTICAL BATTLE";
  verdict?: string;
}

export function MchambuziHypeMeter({
  homeTeam,
  awayTeam,
  homeRatio = 48,
  drawRatio = 22,
  awayRatio = 30,
  dramaLevel = "HIGH DRAMA",
  verdict = "Nairobi base sentiment predicts a fierce midfield battle with late drama in the second half.",
}: Props) {
  return (
    <div className="rounded-2xl bg-[#111319] border border-white/10 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">
            MCHAMBUZI HYPE & DRAMA METER
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-red-950/80 border border-[#B30000]/60 text-[10px] font-black uppercase tracking-wider text-[#FFD700]">
          {dramaLevel}
        </span>
      </div>

      {/* Fan Pulse Ratio Bar */}
      <div>
        <div className="flex justify-between text-xs font-bold text-white/80 mb-1.5">
          <span>{homeTeam} ({homeRatio}%)</span>
          <span className="text-white/50">DRAW ({drawRatio}%)</span>
          <span>{awayTeam} ({awayRatio}%)</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden flex">
          <div className="bg-[#B30000] h-full transition-all duration-500" style={{ width: `${homeRatio}%` }} />
          <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${drawRatio}%` }} />
          <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${awayRatio}%` }} />
        </div>
      </div>

      {/* Tactical Verdict */}
      <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80 leading-relaxed flex items-start gap-2.5">
        <span className="text-sm shrink-0">💬</span>
        <div>
          <strong className="text-[#FFD700] block mb-0.5 uppercase tracking-wider text-[10px]">
            Mchambuzi Tactical Verdict:
          </strong>
          {verdict}
        </div>
      </div>

      {/* WhatsApp Viral Receipt CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
        <span className="text-white/50 text-[10px] uppercase font-bold">Keep Receipts on WhatsApp</span>
        <button
          onClick={() => {
            const text = `🔥 BallMtaani Matchday Pulse: ${homeTeam} (${homeRatio}%) vs ${awayTeam} (${awayRatio}%)\n\n"Mchambuzi Verdict: ${verdict}"\n\nWe predict. We debate. We keep receipts.\nhttps://ballmtaani.com/matches`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
          }}
          className="px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5"
        >
          <span>📱</span> Share Receipt
        </button>
      </div>
    </div>
  );
}
