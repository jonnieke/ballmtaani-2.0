import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Globe, ArrowLeft, CheckCircle, TrendingUp } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";
import { ExpansionScorecardEngine } from "../../lib/edge/expansion/expansion-scorecard-engine";

export default function ExpansionScorecardsPage() {
  const compScore = ExpansionScorecardEngine.evaluateExpansionCandidate("French Ligue 1", "competition");
  const countryScore = ExpansionScorecardEngine.evaluateExpansionCandidate("Tanzania", "country");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/admin/edge/expansion" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/edge">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Edge Control Panel
              </Button>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400" /> Competition & Country Expansion Scorecards
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs">
            PMF Status: Demonstrated in Kenya
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Market & Competition Expansion Scorecards</h1>
          <p className="text-xs text-gray-400">Score proposed expansion opportunities across audience demand, model readiness, compliance, and contribution economics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Target Competition: {compScore.targetName}</h3>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                {compScore.recommendedDecision.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Audience Demand</span>
                <span className="font-bold text-emerald-400">{compScore.audienceDemandScore} / 100</span>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Model Readiness</span>
                <span className="font-bold text-emerald-400">{compScore.modelReadinessScore} / 100</span>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Compliance Quality</span>
                <span className="font-bold text-emerald-400">{compScore.complianceScore} / 100</span>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Overall Score</span>
                <span className="font-bold text-emerald-400">{compScore.overallScore} / 100</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Target Country: {countryScore.targetName}</h3>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                {countryScore.recommendedDecision.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Audience Demand</span>
                <span className="font-bold text-emerald-400">{countryScore.audienceDemandScore} / 100</span>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Model Readiness</span>
                <span className="font-bold text-emerald-400">{countryScore.modelReadinessScore} / 100</span>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Compliance Quality</span>
                <span className="font-bold text-emerald-400">{countryScore.complianceScore} / 100</span>
              </div>
              <div className="bg-black/40 p-2 rounded">
                <span className="text-gray-400 block text-[10px]">Overall Score</span>
                <span className="font-bold text-emerald-400">{countryScore.overallScore} / 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
