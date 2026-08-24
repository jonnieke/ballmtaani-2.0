import React, { useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, ShieldCheck, Clock, Activity, Cpu, Lock, Heart, Share2, Sparkles, AlertCircle, ShieldAlert } from "lucide-react";
import { MOCK_PUBLISHED_PREDICTIONS } from "../../lib/edge/public/public-api-service";
import ProbabilityBar from "../../components/edge/ProbabilityBar";
import ConfidenceBadge from "../../components/edge/ConfidenceBadge";
import DataQualityBadge from "../../components/edge/DataQualityBadge";
import LikelyScorelines from "../../components/edge/LikelyScorelines";
import RiskFactorsList from "../../components/edge/RiskFactorsList";
import PredictionTimeline from "../../components/edge/PredictionTimeline";
import LineupImpactBanner from "../../components/edge/LineupImpactBanner";
import FanModelPulse from "../../components/edge/FanModelPulse";
import MatchReceiptModal from "../../components/edge/MatchReceiptModal";
import { SavedContentService } from "../../lib/edge/alerts/saved-content-service";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeMatchDetailPage() {
  const { fixtureId } = useParams();
  const prediction = MOCK_PUBLISHED_PREDICTIONS.find((p) => String(p.fixtureId) === String(fixtureId)) || MOCK_PUBLISHED_PREDICTIONS[0];

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  const kickoffDate = new Date(prediction.kickoffAt).toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });

  const handleToggleSave = async () => {
    if (isSaved) {
      await SavedContentService.unsaveMatch("user-current", String(prediction.fixtureId));
      setIsSaved(false);
      setSaveMessage("Match removed from your watchlist.");
    } else {
      const res = await SavedContentService.saveMatch("user-current", String(prediction.fixtureId));
      if (res.success) {
        setIsSaved(true);
        setSaveMessage(res.message);
      } else {
        setSaveMessage(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path={`/edge/match/${prediction.fixtureId}`} />

      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/edge/today">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Predictions
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowReceipt(true)}
              variant="outline"
              size="sm"
              className="text-xs font-bold border-white/20 text-emerald-400 hover:bg-white/10"
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share Receipt
            </Button>

            <Button
              onClick={handleToggleSave}
              variant="outline"
              size="sm"
              className={`text-xs font-bold ${isSaved ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-white/20 text-gray-300"}`}
            >
              <Heart className={`mr-1.5 h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {saveMessage && (
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs text-center font-semibold">
            {saveMessage}
          </div>
        )}

        {/* Match Header Panel */}
        <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <Badge variant="outline" className="text-xs font-bold text-gray-300 border-white/20">
              {prediction.competition}
            </Badge>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {kickoffDate} (EAT)
            </span>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{prediction.homeTeam}</h1>
              <span className="text-xs text-emerald-400 font-mono font-semibold">Home Team</span>
            </div>

            <div className="text-center px-4">
              <span className="text-xs text-gray-400 font-mono block">VS</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {prediction.expectedHomeGoals} - {prediction.expectedAwayGoals}
              </span>
              <span className="text-[10px] text-gray-500 block">Expected Goals</span>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{prediction.awayTeam}</h1>
              <span className="text-xs text-blue-400 font-mono font-semibold">Away Team</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <ConfidenceBadge confidence={prediction.confidence} />
            <DataQualityBadge label={prediction.dataQuality} />
          </div>
        </div>

        {/* Lineup Impact Banner (If Revision > 1) */}
        {prediction.revisionNumber > 1 && (
          <LineupImpactBanner
            revisionNumber={prediction.revisionNumber}
            homeTeam={prediction.homeTeam}
            awayTeam={prediction.awayTeam}
            absentHomeKeyPlayers={["Gabriel Martinelli"]}
            absentAwayKeyPlayers={[]}
            originalHomeProb={0.45}
            revisedHomeProb={prediction.homeWinProb}
            originalAwayProb={0.27}
            revisedAwayProb={prediction.awayWinProb}
            impactDescription="Confirmed lineups released. Key attacker Gabriel Martinelli is starting on the bench for Arsenal, adjusting model home expectation."
          />
        )}

        {/* Mtaa Tactical Briefing Box */}
        {prediction.storylines && (
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-[#141414] to-[#121212] p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="h-4 w-4 text-[#FFD700]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Mtaa Tactical Briefing &amp; Match Context</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-4 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">🟢 Key Home Strength</span>
                <p className="text-xs text-gray-300 leading-relaxed">{prediction.storylines.strength}</p>
              </div>

              <div className="rounded-lg bg-red-950/20 border border-red-500/20 p-4 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">🔴 Away Threat / Risk Factor</span>
                <p className="text-xs text-gray-300 leading-relaxed">{prediction.storylines.vulnerability}</p>
              </div>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-xs">
              <strong className="text-[#FFD700] uppercase tracking-wider block mb-1">🎯 Street Verdict:</strong>
              <p className="text-gray-200 leading-relaxed">{prediction.storylines.mtaaVerdict}</p>
            </div>
          </div>
        )}

        {/* The Street vs The Model Community Pulse */}
        <FanModelPulse prediction={prediction} />

        {/* Win Probabilities & Market Matrix */}
        <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">1X2 Match Probabilities</h3>
          <ProbabilityBar
            homeProb={prediction.homeWinProb}
            drawProb={prediction.drawProb}
            awayProb={prediction.awayWinProb}
            homeTeamName={prediction.homeTeam}
            awayTeamName={prediction.awayTeam}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 block">Over / Under 2.5 Goals</span>
              <div className="flex justify-between items-center font-mono">
                <span className="text-sm text-white">Over 2.5: <strong className="text-emerald-400">{Math.round(prediction.over25Prob * 100)}%</strong></span>
                <span className="text-sm text-white">Under 2.5: <strong className="text-blue-400">{Math.round(prediction.under25Prob * 100)}%</strong></span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 block">Both Teams to Score (BTTS)</span>
              <div className="flex justify-between items-center font-mono">
                <span className="text-sm text-white">Yes: <strong className="text-emerald-400">{Math.round(prediction.bttsYesProb * 100)}%</strong></span>
                <span className="text-sm text-white">No: <strong className="text-blue-400">{Math.round(prediction.bttsNoProb * 100)}%</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Deterministic Explanation & Top Scorelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Model Analysis & Reasoning</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {prediction.templateExplanation} The Dixon-Coles solver projects a total match expectation of {(prediction.expectedHomeGoals + prediction.expectedAwayGoals).toFixed(2)} goals.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#121212] p-6">
            <LikelyScorelines scorelines={prediction.topScorelines} />
          </div>
        </div>

        {/* Risk Factors */}
        <div className="rounded-xl border border-white/10 bg-[#121212] p-6">
          <RiskFactorsList riskFactors={prediction.riskFactors} />
        </div>

        {/* Prediction Timeline */}
        <div className="rounded-xl border border-white/10 bg-[#121212] p-6">
          <PredictionTimeline
            revisions={[
              {
                revisionNumber: 1,
                publishedAt: prediction.publishedAt,
                reason: "Initial model publication from team Elo ratings & historical Dixon-Coles parameters.",
                homeProb: prediction.homeWinProb,
                drawProb: prediction.drawProb,
                awayProb: prediction.awayWinProb,
              },
            ]}
          />
        </div>

        {/* Responsible Use Disclaimer */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 text-center">
          <ShieldCheck className="h-4 w-4 text-emerald-400 inline-block mr-1.5" />
          <span>
            BallMtaani Edge predictions are generated statistically for match intelligence. Football outcomes remain uncertain, and no outcome is guaranteed. Please play responsibly. (18+)
          </span>
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
