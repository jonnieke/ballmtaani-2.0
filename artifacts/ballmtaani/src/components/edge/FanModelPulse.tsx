import React, { useState } from "react";
import { MatchPredictionOutput } from "../../lib/edge/types";
import { Users, Cpu, CheckCircle } from "lucide-react";

interface FanModelPulseProps {
  prediction: MatchPredictionOutput;
}

export default function FanModelPulse({ prediction }: FanModelPulseProps) {
  const initialFan = prediction.fanVote || {
    homeVotes: 1200,
    drawVotes: 300,
    awayVotes: 500,
    totalVotes: 2000,
  };

  const [votes, setVotes] = useState(initialFan);
  const [userVote, setUserVote] = useState<"home" | "draw" | "away" | null>(null);

  const handleVote = (choice: "home" | "draw" | "away") => {
    if (userVote) return;
    setUserVote(choice);
    setVotes((prev) => ({
      ...prev,
      homeVotes: choice === "home" ? prev.homeVotes + 1 : prev.homeVotes,
      drawVotes: choice === "draw" ? prev.drawVotes + 1 : prev.drawVotes,
      awayVotes: choice === "away" ? prev.awayVotes + 1 : prev.awayVotes,
      totalVotes: prev.totalVotes + 1,
    }));
  };

  const fanHomePct = Math.round((votes.homeVotes / votes.totalVotes) * 100);
  const fanDrawPct = Math.round((votes.drawVotes / votes.totalVotes) * 100);
  const fanAwayPct = Math.round((votes.awayVotes / votes.totalVotes) * 100);

  const modelHomePct = Math.round(prediction.homeWinProb * 100);
  const modelDrawPct = Math.round(prediction.drawProb * 100);
  const modelAwayPct = Math.round(prediction.awayWinProb * 100);

  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#FFD700]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">The Street vs The Model</h3>
        </div>
        <span className="text-[11px] font-mono text-gray-400">
          {votes.totalVotes.toLocaleString()} Kenyan Fans Polled
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Probabilities */}
        <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
            <Cpu className="h-3.5 w-3.5" /> Edge Model Projection
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>{prediction.homeTeam}</span>
              <strong className="text-emerald-400 font-mono">{modelHomePct}%</strong>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${modelHomePct}%` }} />
            </div>

            <div className="flex justify-between text-gray-300 pt-1">
              <span>Draw</span>
              <strong className="text-yellow-400 font-mono">{modelDrawPct}%</strong>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${modelDrawPct}%` }} />
            </div>

            <div className="flex justify-between text-gray-300 pt-1">
              <span>{prediction.awayTeam}</span>
              <strong className="text-blue-400 font-mono">{modelAwayPct}%</strong>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${modelAwayPct}%` }} />
            </div>
          </div>
        </div>

        {/* Fan Consensus */}
        <div className="rounded-lg bg-amber-950/20 border border-amber-500/20 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[#FFD700] font-bold text-xs">
            <Users className="h-3.5 w-3.5" /> Mtaa Community Pulse
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>{prediction.homeTeam}</span>
              <strong className="text-[#FFD700] font-mono">{fanHomePct}%</strong>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#FFD700] h-1.5 rounded-full" style={{ width: `${fanHomePct}%` }} />
            </div>

            <div className="flex justify-between text-gray-300 pt-1">
              <span>Draw</span>
              <strong className="text-yellow-400 font-mono">{fanDrawPct}%</strong>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${fanDrawPct}%` }} />
            </div>

            <div className="flex justify-between text-gray-300 pt-1">
              <span>{prediction.awayTeam}</span>
              <strong className="text-blue-400 font-mono">{fanAwayPct}%</strong>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${fanAwayPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Fan Voting Buttons */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <span className="text-[11px] font-semibold text-gray-400 block text-center">
          {userVote ? "Receipt recorded! Your vote is locked in." : "Where do you stand? Cast your prediction vote:"}
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleVote("home")}
            disabled={Boolean(userVote)}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              userVote === "home"
                ? "bg-emerald-600 text-white border border-emerald-400"
                : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {prediction.homeTeam}
          </button>
          <button
            onClick={() => handleVote("draw")}
            disabled={Boolean(userVote)}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              userVote === "draw"
                ? "bg-yellow-600 text-white border border-yellow-400"
                : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            Draw
          </button>
          <button
            onClick={() => handleVote("away")}
            disabled={Boolean(userVote)}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              userVote === "away"
                ? "bg-blue-600 text-white border border-blue-400"
                : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {prediction.awayTeam}
          </button>
        </div>
      </div>
    </div>
  );
}
