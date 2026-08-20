import { useState } from "react";
import { Flame, Users, ShieldAlert, Award } from "lucide-react";

interface MatchHypeBarometerProps {
  homeTeam: string;
  awayTeam: string;
  homeRatio?: number;
  drawRatio?: number;
  awayRatio?: number;
  totalVotes?: number;
  heatLevel?: "HIGH" | "MEDIUM" | "DERBY";
}

export default function MatchHypeBarometer({
  homeTeam,
  awayTeam,
  homeRatio = 62,
  drawRatio = 18,
  awayRatio = 20,
  totalVotes = 1240,
  heatLevel = "HIGH",
}: MatchHypeBarometerProps) {
  const [userVote, setUserVote] = useState<"1" | "X" | "2" | null>(null);

  const isDerby = heatLevel === "DERBY" || (homeTeam.toLowerCase().includes("gor") && awayTeam.toLowerCase().includes("leopards"));

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#0d1017] p-4 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="flex items-center gap-1 text-[#ff5a5a]">
          <Flame className="h-3.5 w-3.5 fill-[#ff5a5a]" />
          <span>{isDerby ? "🔥 DERBY HYPE HEAT — 98%" : "FAN PULSE BAROMETER"}</span>
        </span>
        <span className="flex items-center gap-1 text-white/50">
          <Users className="h-3 w-3" />
          <span>{totalVotes.toLocaleString()} Kenyan Calls</span>
        </span>
      </div>

      {/* Ratios Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex h-3.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/40 p-0.5">
          <div
            style={{ width: `${homeRatio}%` }}
            className="h-full rounded-l-full bg-[#B30000] transition-all duration-500"
            title={`${homeTeam}: ${homeRatio}%`}
          />
          <div
            style={{ width: `${drawRatio}%` }}
            className="h-full bg-[#FFD700] transition-all duration-500"
            title={`Draw: ${drawRatio}%`}
          />
          <div
            style={{ width: `${awayRatio}%` }}
            className="h-full rounded-r-full bg-[#1E6FFF] transition-all duration-500"
            title={`${awayTeam}: ${awayRatio}%`}
          />
        </div>

        {/* Percentage Labels */}
        <div className="flex items-center justify-between text-[10px] font-black text-white/70">
          <span className="text-[#ff5a5a]">{homeTeam}: {homeRatio}%</span>
          <span className="text-[#FFD700]">Draw: {drawRatio}%</span>
          <span className="text-[#60a5fa]">{awayTeam}: {awayRatio}%</span>
        </div>
      </div>

      {/* Quick Vote Controls */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={() => setUserVote("1")}
          className={`rounded-xl border py-2 text-center text-xs font-black transition-all ${
            userVote === "1"
              ? "border-[#B30000] bg-[#B30000] text-white"
              : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
          }`}
        >
          1 ({homeTeam.slice(0, 3).toUpperCase()})
        </button>
        <button
          onClick={() => setUserVote("X")}
          className={`rounded-xl border py-2 text-center text-xs font-black transition-all ${
            userVote === "X"
              ? "border-[#FFD700] bg-[#FFD700] text-black"
              : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
          }`}
        >
          X (DRAW)
        </button>
        <button
          onClick={() => setUserVote("2")}
          className={`rounded-xl border py-2 text-center text-xs font-black transition-all ${
            userVote === "2"
              ? "border-[#1E6FFF] bg-[#1E6FFF] text-white"
              : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
          }`}
        >
          2 ({awayTeam.slice(0, 3).toUpperCase()})
        </button>
      </div>
    </div>
  );
}
