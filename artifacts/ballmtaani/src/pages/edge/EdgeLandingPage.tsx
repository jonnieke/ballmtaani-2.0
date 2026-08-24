import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ChevronRight, ShieldCheck, BarChart2, Cpu, Lock, AlertCircle } from "lucide-react";
import { MOCK_PUBLISHED_PREDICTIONS } from "../../lib/edge/public/public-api-service";
import PredictionCard from "../../components/edge/PredictionCard";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeLandingPage() {
  const [selectedComp, setSelectedComp] = React.useState<string>("all");

  const filteredPredictions = React.useMemo(() => {
    if (selectedComp === "all") return MOCK_PUBLISHED_PREDICTIONS;
    if (selectedComp === "kenya") return MOCK_PUBLISHED_PREDICTIONS.filter(p => p.competition.includes("FKF") || p.competition.includes("AFCON"));
    if (selectedComp === "epl") return MOCK_PUBLISHED_PREDICTIONS.filter(p => p.competition === "Premier League");
    if (selectedComp === "ucl") return MOCK_PUBLISHED_PREDICTIONS.filter(p => p.competition.includes("Champions League"));
    return MOCK_PUBLISHED_PREDICTIONS;
  }, [selectedComp]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/edge" />

      {/* Hero Section */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-[#121212] via-[#0A0A0A] to-[#0A0A0A] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-5 text-center sm:space-y-6">
          <Badge className="mx-auto inline-flex max-w-full flex-wrap justify-center border-[#B30000]/30 bg-[#B30000]/20 px-3 py-1 text-xs font-bold leading-none text-[#B30000]">
            BallMtaani Edge — Kenyan &amp; Global Match Intelligence Engine
          </Badge>

          <h1 className="mx-auto max-w-3xl text-[clamp(2rem,8vw,3.75rem)] font-extrabold tracking-tight text-white leading-[1.02] sm:leading-tight">
            Smarter football predictions,
            <span className="mt-2 block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              powered by statistical data.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-6 text-gray-300 sm:text-base sm:leading-relaxed">
            From the FKF Premier League Mashemeji Derby to the English Premier League and Champions League. Explore win probabilities, expected goals (xG), model scorelines, and public performance history.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link href="/edge/today">
              <Button size="lg" className="h-11 w-full bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700 sm:w-auto">
                View Today's Matches <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/edge/performance">
              <Button size="lg" variant="outline" className="h-11 w-full border-white/20 px-5 text-sm font-bold text-white hover:bg-white/10 sm:w-auto">
                See Model Performance <BarChart2 className="ml-2 h-4 w-4 text-emerald-400" />
              </Button>
            </Link>
          </div>

          {/* Responsible Use Disclaimer Banner */}
          <div className="mx-auto max-w-2xl pt-4 sm:pt-6">
            <div className="flex items-start justify-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-left text-[11px] leading-5 text-gray-400 sm:items-center sm:text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="min-w-0">
                <strong>Informational Notice:</strong> BallMtaani Edge provides statistical analysis for match intelligence. Football outcomes are uncertain, and no prediction is guaranteed.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Competition Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedComp("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedComp === "all"
                ? "bg-emerald-600 text-white"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            All Matches ({MOCK_PUBLISHED_PREDICTIONS.length})
          </button>
          <button
            onClick={() => setSelectedComp("kenya")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedComp === "kenya"
                ? "bg-[#B30000] text-white"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            🇰🇪 FKF-PL &amp; African Fixtures
          </button>
          <button
            onClick={() => setSelectedComp("epl")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedComp === "epl"
                ? "bg-purple-700 text-white"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
          </button>
          <button
            onClick={() => setSelectedComp("ucl")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedComp === "ucl"
                ? "bg-blue-700 text-white"
                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            🇪🇺 Champions League
          </button>
        </div>

        {/* Today's Featured Predictions Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Featured Match Intelligence</h2>
              <p className="text-xs text-gray-400">Model version ballmtaani-edge-statistical-v1 with Dixon-Coles Poisson calculations</p>
            </div>

            <Link href="/edge/upcoming">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-400 hover:text-emerald-300">
                View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPredictions.map((pred) => (
              <PredictionCard key={pred.fixtureId} prediction={pred} />
            ))}
          </div>
        </div>

        {/* How It Works Overview */}
        <div className="rounded-xl border border-white/10 bg-[#121212] p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-white">How BallMtaani Edge Works</h2>
            <p className="text-xs text-gray-400">Transparent mathematical modelling, zero generative AI fabrications, and public performance tracking.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2 text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto font-bold font-mono">1</div>
              <h3 className="font-bold text-white text-sm">Elo Rating Ledger</h3>
              <p className="text-xs text-gray-400">Chronological team rating updates scaling for goal margins, opposition strength, and home advantage.</p>
            </div>

            <div className="space-y-2 text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto font-bold font-mono">2</div>
              <h3 className="font-bold text-white text-sm">Dixon-Coles Poisson</h3>
              <p className="text-xs text-gray-400">Time-decay attack/defence fitting calculating expected goals and 8x8 scoreline probability matrices.</p>
            </div>

            <div className="space-y-2 text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto font-bold font-mono">3</div>
              <h3 className="font-bold text-white text-sm">Transparent Audit</h3>
              <p className="text-xs text-gray-400">Every published prediction is immutable, timestamped, and scored publicly on our performance ledger.</p>
            </div>
          </div>
        </div>

        {/* Pricing Preview Banner */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 to-[#121212] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Preview Access</Badge>
            <h3 className="text-xl font-bold text-white">Looking for Premium Edge Subscriptions?</h3>
            <p className="text-xs text-gray-300">Explore future Match-Day Passes (KES 20), Weekly Edge (KES 99), and Edge Pro packages in our preview guide.</p>
          </div>

          <Link href="/edge/pricing-preview">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0">
              Explore Pricing Preview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
