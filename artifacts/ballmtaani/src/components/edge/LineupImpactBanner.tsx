import React from "react";
import { Badge } from "../ui/badge";
import { Users, AlertTriangle, Activity } from "lucide-react";

export interface LineupImpactBannerProps {
  revisionNumber: number;
  homeTeam: string;
  awayTeam: string;
  absentHomeKeyPlayers: string[];
  absentAwayKeyPlayers: string[];
  originalHomeProb: number;
  revisedHomeProb: number;
  originalAwayProb: number;
  revisedAwayProb: number;
  impactDescription: string;
}

export default function LineupImpactBanner({
  revisionNumber,
  homeTeam,
  awayTeam,
  absentHomeKeyPlayers,
  absentAwayKeyPlayers,
  originalHomeProb,
  revisedHomeProb,
  originalAwayProb,
  revisedAwayProb,
  impactDescription,
}: LineupImpactBannerProps) {
  const homeDiff = Math.round((revisedHomeProb - originalHomeProb) * 100);
  const awayDiff = Math.round((revisedAwayProb - originalAwayProb) * 100);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-[#121212] to-[#121212] p-5 space-y-4 shadow-lg text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
            <Users className="h-3 w-3 mr-1" /> Confirmed Lineup Impact — Revision #{revisionNumber}
          </Badge>
        </div>
        <span className="text-[10px] text-gray-400 font-mono">Model Revision</span>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">{impactDescription}</p>

      {/* Probability Shift Comparison */}
      <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
        <div>
          <span className="text-gray-400 block font-sans text-[10px]">{homeTeam} Win Probability</span>
          <span className="text-white font-bold">{Math.round(originalHomeProb * 100)}% → </span>
          <span className={homeDiff < 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
            {Math.round(revisedHomeProb * 100)}% ({homeDiff > 0 ? "+" : ""}{homeDiff}%)
          </span>
        </div>

        <div>
          <span className="text-gray-400 block font-sans text-[10px]">{awayTeam} Win Probability</span>
          <span className="text-white font-bold">{Math.round(originalAwayProb * 100)}% → </span>
          <span className={awayDiff < 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
            {Math.round(revisedAwayProb * 100)}% ({awayDiff > 0 ? "+" : ""}{awayDiff}%)
          </span>
        </div>
      </div>
    </div>
  );
}
