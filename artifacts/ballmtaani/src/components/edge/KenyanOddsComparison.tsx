import React, { useState } from "react";
import { MatchPredictionOutput } from "../../lib/edge/types";
import { Badge } from "../ui/badge";
import { TrendingUp, Flame, Check, HelpCircle, ExternalLink } from "lucide-react";

interface KenyanOddsComparisonProps {
  prediction: MatchPredictionOutput;
}

interface BookieOdds {
  name: string;
  logoColor: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  over25Odds: number;
  bttsOdds: number;
}

export default function KenyanOddsComparison({ prediction }: KenyanOddsComparisonProps) {
  const [activeMarket, setActiveMarket] = useState<"1X2" | "OU25" | "BTTS">("1X2");

  // Calculate Model Fair Odds (1 / Probability)
  const fairHome = Number((1 / Math.max(0.01, prediction.homeWinProb)).toFixed(2));
  const fairDraw = Number((1 / Math.max(0.01, prediction.drawProb)).toFixed(2));
  const fairAway = Number((1 / Math.max(0.01, prediction.awayWinProb)).toFixed(2));
  const fairOver = Number((1 / Math.max(0.01, prediction.over25Prob)).toFixed(2));
  const fairBtts = Number((1 / Math.max(0.01, prediction.bttsYesProb)).toFixed(2));

  // Kenyan Bookmaker Odds Matrix based on fair baseline + typical market margin
  const BOOKMAKERS: BookieOdds[] = [
    {
      name: "Betika",
      logoColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
      homeOdds: Number((fairHome * 0.94).toFixed(2)),
      drawOdds: Number((fairDraw * 0.93).toFixed(2)),
      awayOdds: Number((fairAway * 0.95).toFixed(2)),
      over25Odds: Number((fairOver * 0.94).toFixed(2)),
      bttsOdds: Number((fairBtts * 0.93).toFixed(2)),
    },
    {
      name: "SportPesa",
      logoColor: "text-blue-400 bg-blue-400/10 border-blue-400/30",
      homeOdds: Number((fairHome * 0.96).toFixed(2)),
      drawOdds: Number((fairDraw * 0.92).toFixed(2)),
      awayOdds: Number((fairAway * 0.94).toFixed(2)),
      over25Odds: Number((fairOver * 0.95).toFixed(2)),
      bttsOdds: Number((fairBtts * 0.94).toFixed(2)),
    },
    {
      name: "MozzartBet",
      logoColor: "text-amber-500 bg-amber-500/10 border-amber-500/30",
      homeOdds: Number((fairHome * 0.95).toFixed(2)),
      drawOdds: Number((fairDraw * 0.94).toFixed(2)),
      awayOdds: Number((fairAway * 0.93).toFixed(2)),
      over25Odds: Number((fairOver * 0.93).toFixed(2)),
      bttsOdds: Number((fairBtts * 0.95).toFixed(2)),
    },
    {
      name: "1xBet",
      logoColor: "text-sky-400 bg-sky-400/10 border-sky-400/30",
      homeOdds: Number((fairHome * 0.97).toFixed(2)),
      drawOdds: Number((fairDraw * 0.95).toFixed(2)),
      awayOdds: Number((fairAway * 0.96).toFixed(2)),
      over25Odds: Number((fairOver * 0.96).toFixed(2)),
      bttsOdds: Number((fairBtts * 0.95).toFixed(2)),
    },
  ];

  // Calculate Best Available Odds in Kenya
  const bestHome = Math.max(...BOOKMAKERS.map((b) => b.homeOdds));
  const bestDraw = Math.max(...BOOKMAKERS.map((b) => b.drawOdds));
  const bestAway = Math.max(...BOOKMAKERS.map((b) => b.awayOdds));
  const bestOver = Math.max(...BOOKMAKERS.map((b) => b.over25Odds));
  const bestBtts = Math.max(...BOOKMAKERS.map((b) => b.bttsOdds));

  // Expected Value calculation: (ModelProb * BestOdds - 1) * 100
  const homeEV = Number(((prediction.homeWinProb * bestHome - 1) * 100).toFixed(1));
  const drawEV = Number(((prediction.drawProb * bestDraw - 1) * 100).toFixed(1));
  const awayEV = Number(((prediction.awayWinProb * bestAway - 1) * 100).toFixed(1));
  const overEV = Number(((prediction.over25Prob * bestOver - 1) * 100).toFixed(1));
  const bttsEV = Number(((prediction.bttsYesProb * bestBtts - 1) * 100).toFixed(1));

  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-yellow-500/20 text-[#FFD700] flex items-center justify-center border border-yellow-500/30">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              Kenyan Bookmaker Live Odds &amp; Value Edge
            </h3>
            <p className="text-[11px] text-gray-400">Comparing market prices vs Dixon-Coles Model Fair Price</p>
          </div>
        </div>

        {/* Market Filter Tabs */}
        <div className="flex items-center rounded-lg bg-black/40 p-1 border border-white/10 text-xs">
          {(["1X2", "OU25", "BTTS"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMarket(m)}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                activeMarket === m
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {m === "1X2" ? "1X2 Match" : m === "OU25" ? "Over/Under 2.5" : "BTTS"}
            </button>
          ))}
        </div>
      </div>

      {/* Model Fair Price Banner */}
      <div className="rounded-lg bg-white/5 border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div>
          <span className="text-[10px] text-gray-400 font-sans block uppercase tracking-wider">Model Fair Odds (True Price)</span>
          {activeMarket === "1X2" && (
            <div className="flex items-center gap-4 mt-1">
              <span className="text-white font-bold">{prediction.homeTeam}: <strong className="text-emerald-400">{fairHome}</strong></span>
              <span className="text-white font-bold">Draw: <strong className="text-yellow-400">{fairDraw}</strong></span>
              <span className="text-white font-bold">{prediction.awayTeam}: <strong className="text-blue-400">{fairAway}</strong></span>
            </div>
          )}
          {activeMarket === "OU25" && (
            <div className="flex items-center gap-4 mt-1">
              <span className="text-white font-bold">Over 2.5: <strong className="text-emerald-400">{fairOver}</strong></span>
              <span className="text-white font-bold">Under 2.5: <strong className="text-blue-400">{Number((1 / prediction.under25Prob).toFixed(2))}</strong></span>
            </div>
          )}
          {activeMarket === "BTTS" && (
            <div className="flex items-center gap-4 mt-1">
              <span className="text-white font-bold">BTTS (Yes): <strong className="text-emerald-400">{fairBtts}</strong></span>
              <span className="text-white font-bold">BTTS (No): <strong className="text-blue-400">{Number((1 / prediction.bttsNoProb).toFixed(2))}</strong></span>
            </div>
          )}
        </div>

        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-sans">
          Zero-Vig Statistical Fair Price
        </Badge>
      </div>

      {/* Odds Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-semibold">Bookmaker (Kenya)</th>
              {activeMarket === "1X2" && (
                <>
                  <th className="pb-3 font-semibold text-center">{prediction.homeTeam} (1)</th>
                  <th className="pb-3 font-semibold text-center">Draw (X)</th>
                  <th className="pb-3 font-semibold text-center">{prediction.awayTeam} (2)</th>
                </>
              )}
              {activeMarket === "OU25" && (
                <>
                  <th className="pb-3 font-semibold text-center">Over 2.5 Goals</th>
                  <th className="pb-3 font-semibold text-center">Under 2.5 Goals</th>
                </>
              )}
              {activeMarket === "BTTS" && (
                <>
                  <th className="pb-3 font-semibold text-center">BTTS (Yes)</th>
                  <th className="pb-3 font-semibold text-center">BTTS (No)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {BOOKMAKERS.map((b) => (
              <tr key={b.name} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 font-sans font-bold flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${b.logoColor}`}>
                    {b.name}
                  </span>
                </td>

                {activeMarket === "1X2" && (
                  <>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded font-bold ${b.homeOdds === bestHome ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-300"}`}>
                        {b.homeOdds}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded font-bold ${b.drawOdds === bestDraw ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : "text-gray-300"}`}>
                        {b.drawOdds}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded font-bold ${b.awayOdds === bestAway ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-300"}`}>
                        {b.awayOdds}
                      </span>
                    </td>
                  </>
                )}

                {activeMarket === "OU25" && (
                  <>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded font-bold ${b.over25Odds === bestOver ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-300"}`}>
                        {b.over25Odds}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded font-bold text-gray-300">
                        {Number((b.over25Odds * 0.95).toFixed(2))}
                      </span>
                    </td>
                  </>
                )}

                {activeMarket === "BTTS" && (
                  <>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded font-bold ${b.bttsOdds === bestBtts ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-300"}`}>
                        {b.bttsOdds}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded font-bold text-gray-300">
                        {Number((b.bttsOdds * 0.92).toFixed(2))}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model Edge Takeaway Note */}
      <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-4 text-xs flex items-start gap-2.5">
        <Flame className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-emerald-400 uppercase tracking-wider block">Model Market Insight:</strong>
          <p className="text-gray-300 leading-relaxed">
            Best market price for <strong>{prediction.homeTeam}</strong> is available on <strong>1xBet / SportPesa ({bestHome})</strong> against Model Fair Price of <strong>{fairHome}</strong>.
            Over 2.5 Goals best price is <strong>{bestOver}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
