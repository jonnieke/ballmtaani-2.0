import React, { useState } from "react";
import { Badge } from "../ui/badge";
import { Info } from "lucide-react";
import { ConfidenceLevel } from "../../lib/edge/types";

export interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  let bgClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  let explanation = "High confidence: Strong historical match coverage and model consensus.";

  if (confidence === "Medium") {
    bgClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
    explanation = "Medium confidence: Clear model direction, with moderate variance or early form volatility.";
  } else if (confidence === "Low") {
    bgClass = "bg-red-500/20 text-red-400 border-red-500/30";
    explanation = "Low confidence: Limited recent match sample or team composition changes.";
  }

  return (
    <div className="relative inline-flex items-center gap-1">
      <Badge className={`text-[11px] font-bold px-2 py-0.5 border ${bgClass}`}>
        Confidence: {confidence}
      </Badge>

      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="text-gray-400 hover:text-white transition-colors p-0.5"
        aria-label="Confidence Info"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full mb-1 left-0 z-50 w-56 rounded-md bg-[#1E1E1E] border border-white/20 p-2.5 shadow-xl text-[11px] text-gray-200">
          <p className="font-semibold text-white mb-1">Model Confidence</p>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}
