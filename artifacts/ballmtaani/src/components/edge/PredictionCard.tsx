import React, { useState } from "react";
import { Link } from "wouter";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChevronRight, Calendar, Share2, Sparkles } from "lucide-react";
import { MatchPredictionOutput } from "../../lib/edge/types";
import ProbabilityBar from "./ProbabilityBar";
import ConfidenceBadge from "./ConfidenceBadge";
import DataQualityBadge from "./DataQualityBadge";
import MatchReceiptModal from "./MatchReceiptModal";

export interface PredictionCardProps {
  prediction: MatchPredictionOutput;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const [showReceipt, setShowReceipt] = useState(false);

  const kickoffDate = new Date(prediction.kickoffAt).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });

  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] hover:border-emerald-500/40 transition-all duration-300 p-5 space-y-4 shadow-lg flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Header: Competition & Kickoff */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] font-semibold border-white/20 text-gray-300">
              {prediction.competition}
            </Badge>
            <DataQualityBadge label={prediction.dataQuality} />
          </div>
          <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {kickoffDate} (EAT)
          </span>
        </div>

        {/* Teams & Expected Goals (xG) */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">{prediction.homeTeam}</h3>
            <h3 className="text-lg font-bold text-white tracking-tight">{prediction.awayTeam}</h3>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-mono">Model xG</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              {prediction.expectedHomeGoals} - {prediction.expectedAwayGoals}
            </span>
          </div>
        </div>

        {/* Probability Bar */}
        <ProbabilityBar
          homeProb={prediction.homeWinProb}
          drawProb={prediction.drawProb}
          awayProb={prediction.awayWinProb}
          homeTeamName={prediction.homeTeam}
          awayTeamName={prediction.awayTeam}
        />

        {/* Mtaa Tactical Angle / Storyline */}
        {prediction.storylines && (
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-1 text-xs">
            <div className="flex items-center gap-1 text-[#FFD700] font-bold text-[11px]">
              <Sparkles className="h-3 w-3" /> Mtaa Verdict
            </div>
            <p className="text-gray-300 leading-relaxed text-[11px]">
              {prediction.storylines.mtaaVerdict}
            </p>
          </div>
        )}

        {/* Markets Summary (Over 2.5 & BTTS) */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 p-2.5 rounded-lg border border-white/5">
          <div>
            <span className="text-gray-400 text-[11px] block">Over 2.5 Goals</span>
            <span className="font-bold text-white font-mono">{Math.round(prediction.over25Prob * 100)}%</span>
          </div>
          <div>
            <span className="text-gray-400 text-[11px] block">BTTS (Yes)</span>
            <span className="font-bold text-white font-mono">{Math.round(prediction.bttsYesProb * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Footer: Confidence & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-2">
        <ConfidenceBadge confidence={prediction.confidence} />

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowReceipt(true)}
            size="sm"
            variant="outline"
            className="h-8 border-white/15 text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-1 px-2.5"
          >
            <Share2 className="h-3 w-3 text-emerald-400" /> Share
          </Button>

          <Link href={`/edge/match/${prediction.fixtureId}`}>
            <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3">
              Analysis <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </Link>
        </div>
      </div>

      <MatchReceiptModal
        prediction={prediction}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
}
