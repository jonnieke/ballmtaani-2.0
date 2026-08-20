import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Zap, ArrowLeft, ShieldAlert } from "lucide-react";
import { MOCK_PUBLISHED_PREDICTIONS } from "../../lib/edge/public/public-api-service";
import { MatchPredictionOutput } from "../../lib/edge/types";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeLitePage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-md mx-auto font-mono">
      <RouteSEO path="/edge/lite" />

      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-sm">BALLMTAANI EDGE LITE</span>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Low-Data</Badge>
      </div>

      <div className="space-y-4">
        {MOCK_PUBLISHED_PREDICTIONS.map((pred: MatchPredictionOutput) => (
          <div key={pred.fixtureId} className="border border-gray-800 p-3 rounded bg-gray-950 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400 text-[10px]">
              <span>{pred.competition}</span>
              <span className="text-emerald-400 font-bold">{pred.predictionStatus}</span>
            </div>

            <div className="font-bold text-sm text-white">
              {pred.homeTeam} vs {pred.awayTeam}
            </div>

            <div className="grid grid-cols-3 gap-1 bg-black p-2 rounded text-center text-[11px]">
              <div>
                <span className="text-gray-500 block text-[9px]">HOME</span>
                <span className="font-bold text-emerald-400">{Math.round(pred.homeWinProb * 100)}%</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">DRAW</span>
                <span className="font-bold text-gray-300">{Math.round(pred.drawProb * 100)}%</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px]">AWAY</span>
                <span className="font-bold text-gray-300">{Math.round(pred.awayWinProb * 100)}%</span>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-900">
              <span>xG: {pred.expectedHomeGoals} - {pred.expectedAwayGoals}</span>
              <span>Conf: {pred.confidence}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-900 text-[10px] text-gray-500 text-center space-y-1">
        <p>Probabilities for informational purposes only. No guaranteed win claims.</p>
        <p>BallMtaani Statistical Model v1.0</p>
      </div>
    </div>
  );
}
