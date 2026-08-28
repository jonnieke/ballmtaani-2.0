import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Filter, Search } from "lucide-react";
import { getPublishedUpcomingPredictions } from "../../lib/edge/public/public-api-service";
import PredictionCard from "../../components/edge/PredictionCard";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeMatchListingPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComp, setSelectedComp] = useState<string>("all");
  const { data: predictions = [], isLoading } = useQuery({ queryKey: ["published-edge-predictions"], queryFn: getPublishedUpcomingPredictions, staleTime: 5 * 60 * 1000 });

  const title = location.includes("today")
    ? "Today's Predictions"
    : location.includes("tomorrow")
    ? "Tomorrow's Predictions"
    : "Upcoming Match Intelligence";

  const filtered = predictions.filter((p) => {
    const matchesSearch =
      p.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesComp = selectedComp === "all" || p.competition.toLowerCase().includes(selectedComp.toLowerCase());
    return matchesSearch && matchesComp;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path={location} />

      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/edge">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Edge Overview
            </Button>
          </Link>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active Predictions</Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{title}</h1>
          <p className="text-xs text-gray-400">Match probabilities, expected goals, and model confidence for upcoming fixtures.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121212] p-4 rounded-xl border border-white/10">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> League:
            </span>
            <select
              value={selectedComp}
              onChange={(e) => setSelectedComp(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all" className="bg-black text-white">All Leagues</option>
              <option value="premier league" className="bg-black text-white">Premier League</option>
              <option value="champions league" className="bg-black text-white">Champions League</option>
              <option value="la liga" className="bg-black text-white">La Liga</option>
              <option value="serie a" className="bg-black text-white">Serie A</option>
            </select>
          </div>
        </div>

        {/* Grid of Prediction Cards */}
        {isLoading ? <div className="border border-white/10 bg-[#121212] py-16 text-center text-sm text-white/45">Loading published model output...</div> : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((pred) => (
              <PredictionCard key={pred.fixtureId} prediction={pred} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#121212] rounded-xl border border-white/10 space-y-3">
            <p className="text-sm font-semibold text-gray-300">{predictions.length ? "No predictions match your current search criteria." : "No verified predictions are published for this window."}</p>
            {!predictions.length && <p className="mx-auto max-w-lg text-xs leading-5 text-gray-500">BallMtaani does not replace missing model output with demo fixtures or estimated probabilities.</p>}
            <Button size="sm" onClick={() => { setSearchQuery(""); setSelectedComp("all"); }} className="bg-emerald-600 text-xs text-white font-bold">
              Reset Search Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
