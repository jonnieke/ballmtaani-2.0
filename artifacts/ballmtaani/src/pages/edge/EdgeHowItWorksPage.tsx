import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeHowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/edge/how-it-works" />

      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/edge">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Edge Overview
            </Button>
          </Link>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Model Methodology</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">How BallMtaani Edge Works</h1>
          <p className="text-xs text-gray-400">A transparent explanation of our mathematical modelling, Elo rating updates, and backtesting.</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-2">
            <h2 className="text-lg font-bold text-emerald-400">1. Football Data Ingestion</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              We ingest historical results, fixtures, referee details, venue information, and match statistics from supported leagues into our normalized PostgreSQL database.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-2">
            <h2 className="text-lg font-bold text-emerald-400">2. Dynamic Elo Team Ratings</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every team receives a dynamic Elo rating (1500 base) updated chronologically after completed matches. Ratings scale for goal difference margins and opposition strength.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-2">
            <h2 className="text-lg font-bold text-emerald-400">3. Dixon-Coles Poisson Score Matrix</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Relative attack and defence strengths are fitted using exponential time-decay weighting (exp(-decay * days)). A bivariate Poisson solver calculates expected goals and applies low-score correction (rho = -0.08) for 0-0, 1-0, 0-1, and 1-1 scores.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-2">
            <h2 className="text-lg font-bold text-emerald-400">4. Walk-Forward Backtesting & Calibration</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Models are evaluated using strict chronological walk-forward simulation without future data leakage. Brier score, Log loss, and Expected Calibration Error (ECE) are published transparently on our performance ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
