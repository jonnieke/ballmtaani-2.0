import React from "react";
import { Clock, History } from "lucide-react";

export interface PredictionRevisionEntry {
  revisionNumber: number;
  publishedAt: string;
  reason: string;
  homeProb: number;
  drawProb: number;
  awayProb: number;
}

export interface PredictionTimelineProps {
  revisions: PredictionRevisionEntry[];
}

export default function PredictionTimeline({ revisions }: PredictionTimelineProps) {
  if (!revisions || revisions.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        <History className="h-3.5 w-3.5" /> Prediction Revision History
      </h4>
      <div className="space-y-2">
        {revisions.map((rev) => (
          <div key={rev.revisionNumber} className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-white block">Revision #{rev.revisionNumber} — {rev.reason}</span>
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" /> {new Date(rev.publishedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}
              </span>
            </div>
            <div className="text-right font-mono text-gray-300">
              <span>H {Math.round(rev.homeProb * 100)}% | D {Math.round(rev.drawProb * 100)}% | A {Math.round(rev.awayProb * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
