import React from "react";
import { ScorelineProbability } from "../../lib/edge/types";

export interface LikelyScorelinesProps {
  scorelines: ScorelineProbability[];
}

export default function LikelyScorelines({ scorelines }: LikelyScorelinesProps) {
  if (!scorelines || scorelines.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Likely Scorelines</h4>
      <div className="grid grid-cols-3 gap-2">
        {scorelines.slice(0, 3).map((item, idx) => (
          <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
            <span className="text-sm font-extrabold text-white font-mono block">{item.formattedScore}</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">
              {Math.round(item.probability * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
