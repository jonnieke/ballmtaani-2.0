import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ShieldCheck, ArrowLeft, Activity, Lock, BookOpen, AlertCircle } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function PublicTrustCentrePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/edge/trust" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/edge">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Edge Overview
              </Button>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> BallMtaani Edge Trust Centre
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Transparent AI Governance</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Statistical Transparency & Data Principles</h1>
          <p className="text-xs text-gray-400 mt-1">Our commitment to open probabilities, walk-forward backtesting, calibration, and responsible usage.</p>
        </div>

        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" /> 1. Mathematically Valid Probabilities
            </h3>
            <p>
              BallMtaani Edge generates probabilities using Poisson goal-rate modeling (Dixon-Coles) combined with gradient boosting and Elo ratings. We never use generative AI to guess outcomes or make promises.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" /> 2. Immutable Prediction Revision Ledger
            </h3>
            <p>
              Once a prediction is published, its probability values cannot be altered retroactively. All revisions (e.g. following confirmed lineup news) are saved as new revision records.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-emerald-400" /> 3. Responsible Use & Uncertainty Disclaimer
            </h3>
            <p>
              Football matches inherently contain high variance. Predictions are provided purely for informational and match-intelligence purposes. BallMtaani Edge does not promote guaranteed bets or sure wins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
