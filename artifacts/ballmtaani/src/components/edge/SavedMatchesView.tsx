import React from "react";
import { Link } from "wouter";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Heart, Trash2, ChevronRight, Calendar } from "lucide-react";
import type { MatchPredictionOutput } from "../../lib/edge/types";

export default function SavedMatchesView() {
  const savedPredictions: MatchPredictionOutput[] = [];

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Saved Matches & Watchlist</h2>
          <p className="text-xs text-gray-400">Fixtures you are tracking for lineup revisions and odds alerts.</p>
        </div>

        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-mono">
          {savedPredictions.length} / 25 Saved Capacity
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!savedPredictions.length && <div className="col-span-full border border-white/10 bg-[#121212] px-5 py-10 text-center text-sm text-white/45">No saved production matches yet. Demo watchlist entries have been removed.</div>}
        {savedPredictions.map((pred) => (
          <div key={pred.fixtureId} className="p-4 rounded-xl border border-white/10 bg-[#121212] space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] text-gray-300 border-white/20">
                {pred.competition}
              </Badge>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Active Watchlist</span>
            </div>

            <div className="font-bold text-white text-base">
              {pred.homeTeam} vs {pred.awayTeam}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>Expected Goals: {pred.expectedHomeGoals} - {pred.expectedAwayGoals}</span>
              <span className="text-emerald-400">{Math.round(pred.homeWinProb * 100)}% H Win</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <Button size="sm" variant="ghost" className="text-xs text-red-400 hover:text-red-300 p-0 h-auto">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Unsave Match
              </Button>

              <Link href={`/edge/match/${pred.fixtureId}`}>
                <Button size="sm" variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300 p-0 h-auto">
                  View Analysis <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
