import React from "react";

export interface ProbabilityBarProps {
  homeProb: number; // e.g. 0.43
  drawProb: number; // e.g. 0.27
  awayProb: number; // e.g. 0.30
  homeTeamName?: string;
  awayTeamName?: string;
}

export default function ProbabilityBar({
  homeProb,
  drawProb,
  awayProb,
  homeTeamName = "Home",
  awayTeamName = "Away",
}: ProbabilityBarProps) {
  const hPct = Math.round(homeProb * 100);
  const dPct = Math.round(drawProb * 100);
  const aPct = Math.round(awayProb * 100);

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
        <span className="text-emerald-400 font-bold">{homeTeamName} ({hPct}%)</span>
        <span className="text-gray-400 font-medium">Draw ({dPct}%)</span>
        <span className="text-blue-400 font-bold">{awayTeamName} ({aPct}%)</span>
      </div>

      <div className="h-3 w-full rounded-full overflow-hidden flex bg-white/10 p-0.5 border border-white/10">
        <div
          style={{ width: `${hPct}%` }}
          className="h-full bg-emerald-500 rounded-l transition-all duration-500"
          title={`${homeTeamName}: ${hPct}%`}
        />
        <div
          style={{ width: `${dPct}%` }}
          className="h-full bg-amber-500/80 transition-all duration-500"
          title={`Draw: ${dPct}%`}
        />
        <div
          style={{ width: `${aPct}%` }}
          className="h-full bg-blue-500 rounded-r transition-all duration-500"
          title={`${awayTeamName}: ${aPct}%`}
        />
      </div>
    </div>
  );
}
