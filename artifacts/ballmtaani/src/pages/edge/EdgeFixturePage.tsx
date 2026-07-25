import React, { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { fetchEdgePredictionById } from "../../lib/edge/edge-data-service";
import { MatchPredictionOutput } from "../../lib/edge/types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ShieldAlert, ArrowLeft, Lock, Info, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeFixturePage() {
  const [, params] = useRoute("/edge/match/:fixtureId");
  const fixtureId = params?.fixtureId || "";
  const [prediction, setPrediction] = useState<MatchPredictionOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubscriber, setIsSubscriber] = useState<boolean>(false);

  useEffect(() => {
    async function loadFixture() {
      setLoading(true);
      const data = await fetchEdgePredictionById(fixtureId);
      setPrediction(data);
      setLoading(false);
    }
    loadFixture();
  }, [fixtureId]);

  if (loading || !prediction) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#B30000]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <RouteSEO path="/edge" />

      {/* Navigation Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/edge">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edge
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Model: {prediction.modelVersion}</span>
            <span>•</span>
            <span>Updated: {new Date(prediction.generatedAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Match Header Hero */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 sm:p-8 mb-8 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <Badge className="bg-white/10 text-white">{prediction.competition}</Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-semibold">
              {prediction.predictionStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-3 items-center text-center py-4">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{prediction.homeTeam}</h2>
              <span className="text-xs text-gray-400 mt-1 block">Home Team</span>
            </div>
            <div>
              <span className="text-sm font-mono text-gray-400 block mb-1">KICKOFF</span>
              <span className="text-xs font-semibold text-white bg-white/10 px-3 py-1 rounded-full">
                {new Date(prediction.kickoffAt).toLocaleDateString("en-KE", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{prediction.awayTeam}</h2>
              <span className="text-xs text-gray-400 mt-1 block">Away Team</span>
            </div>
          </div>
        </div>

        {/* Probabilities & Expected Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Outcome Probabilities */}
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#121212] p-6">
            <h3 className="text-lg font-bold text-white mb-4">Outcome Probabilities</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Home Win ({prediction.homeTeam})</span>
                  <span className="font-mono font-bold text-white">{Math.round(prediction.homeWinProb * 100)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div style={{ width: `${prediction.homeWinProb * 100}%` }} className="h-full bg-[#B30000]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Draw</span>
                  <span className="font-mono font-bold text-white">{Math.round(prediction.drawProb * 100)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div style={{ width: `${prediction.drawProb * 100}%` }} className="h-full bg-amber-500" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Away Win ({prediction.awayTeam})</span>
                  <span className="font-mono font-bold text-white">{Math.round(prediction.awayWinProb * 100)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div style={{ width: `${prediction.awayWinProb * 100}%` }} className="h-full bg-blue-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
              <div>
                <span className="text-gray-400 block">Over 2.5 Goals</span>
                <span className="text-base font-bold text-white font-mono">{Math.round(prediction.over25Prob * 100)}%</span>
              </div>
              <div>
                <span className="text-gray-400 block">Both Teams to Score (BTTS)</span>
                <span className="text-base font-bold text-white font-mono">{Math.round(prediction.bttsYesProb * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Expected Goals & Top Scorelines */}
          <div className="rounded-xl border border-white/10 bg-[#121212] p-6">
            <h3 className="text-lg font-bold text-white mb-4">Expected Goals & Scorelines</h3>
            <div className="mb-6 rounded-lg bg-white/5 p-4 text-center">
              <span className="text-xs text-gray-400 block">Expected Match Score (xG)</span>
              <span className="text-2xl font-extrabold font-mono text-[#B30000] mt-1 block">
                {prediction.expectedHomeGoals} - {prediction.expectedAwayGoals}
              </span>
            </div>

            <h4 className="text-xs font-semibold text-gray-400 mb-3">Top 3 Likely Scorelines</h4>
            <div className="space-y-2">
              {prediction.topScorelines.map((score, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-white/5 font-mono">
                  <span className="text-white font-bold">{score.formattedScore}</span>
                  <span className="text-gray-300">{Math.round(score.probability * 100)}% prob</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Value & Fair Odds Section */}
        <div className="rounded-xl border border-white/10 bg-[#121212] p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Market Value & Fair Odds Breakdown</h3>

          {isSubscriber ? (
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="text-white">Market</TableHead>
                  <TableHead className="text-white">Selection</TableHead>
                  <TableHead className="text-white">Model Prob</TableHead>
                  <TableHead className="text-white">Fair Odds</TableHead>
                  <TableHead className="text-white">Market Odds</TableHead>
                  <TableHead className="text-white">Edge %</TableHead>
                  <TableHead className="text-white">Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prediction.markets.map((m, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-white">{m.market}</TableCell>
                    <TableCell className="font-mono text-gray-300">{m.selection}</TableCell>
                    <TableCell className="font-mono text-gray-300">{Math.round(m.modelProbability * 100)}%</TableCell>
                    <TableCell className="font-mono text-emerald-400 font-bold">{m.fairOdds}</TableCell>
                    <TableCell className="font-mono text-white">{m.marketOdds || "N/A"}</TableCell>
                    <TableCell className="font-mono font-bold text-emerald-400">
                      {m.edgePercentage ? `+${m.edgePercentage}%` : "No Edge"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/20 text-emerald-400">{m.recommendation}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg bg-black/60 border border-white/10 p-8 text-center">
              <Lock className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-white mb-1">Fair Odds & Edge Percentage Locked</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                Subscribe to BallMtaani Edge Pro to reveal fair odds, market margin calculations, and expected value percentages.
              </p>
              <Link href="/edge/pricing">
                <Button className="bg-[#B30000] hover:bg-[#800000] text-white font-bold">
                  Unlock Edge Pro (KES 399/mo)
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Model Explanation & Risk Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl border border-white/10 bg-[#121212] p-6">
            <h3 className="text-lg font-bold text-white mb-3">Model Reason & Analysis</h3>
            <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
              {prediction.templateExplanation}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#121212] p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" /> Model Risk Factors
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              {prediction.riskFactors.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white/5 p-2.5 rounded">
                  <span className="text-amber-400">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Responsible Play Disclaimer Footer */}
        <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-center text-xs text-gray-400">
          <p className="font-semibold text-gray-300 mb-1">18+ Responsible Play Notice</p>
          <p>BallMtaani Edge provides statistical football analysis for informational purposes. Match outcomes are uncertain, and no prediction is guaranteed.</p>
        </div>
      </div>
    </div>
  );
}
