/**
 * BallMtaani Club Detail Page (/teams/:teamSlug)
 * Dedicated landing page for football clubs (e.g. Arsenal, Man United, Gor Mahia).
 */

import React from "react";
import { Link, useRoute } from "wouter";
import SEO from "../components/SEO";
import { generateClubSchema } from "../lib/jsonld";

// Known club mappings for premier clubs
const KNOWN_CLUBS: Record<string, { id: number; name: string; country: string; venue: string; league: string; logo: string; desc: string }> = {
  "arsenal": {
    id: 42,
    name: "Arsenal",
    country: "England",
    venue: "Emirates Stadium",
    league: "Premier League",
    logo: "https://media.api-sports.io/football/teams/42.png",
    desc: "Arsenal FC — Kenya's most passionate Premier League supporter base. Follow live matchday action, fixtures, predictions, Mchambuzi AI tactical breakdowns and fan debates.",
  },
  "manchester-united": {
    id: 33,
    name: "Manchester United",
    country: "England",
    venue: "Old Trafford",
    league: "Premier League",
    logo: "https://media.api-sports.io/football/teams/33.png",
    desc: "Manchester United FC — Old Trafford drama and matchday analysis. Follow Red Devils fixtures, live scores, predictions, MTC rewards and Kenyan fan banter.",
  },
  "chelsea": {
    id: 49,
    name: "Chelsea",
    country: "England",
    venue: "Stamford Bridge",
    league: "Premier League",
    logo: "https://media.api-sports.io/football/teams/49.png",
    desc: "Chelsea FC — Blues matchday hub in Nairobi. Live scores, transfer updates, match stats, prediction receipts and community debates.",
  },
  "liverpool": {
    id: 40,
    name: "Liverpool",
    country: "England",
    venue: "Anfield",
    league: "Premier League",
    logo: "https://media.api-sports.io/football/teams/40.png",
    desc: "Liverpool FC — Anfield noise and high-tempo football. Live match coverage, player stats, predictions and Kenyan fan discussions.",
  },
  "gor-mahia": {
    id: 4920,
    name: "Gor Mahia",
    country: "Kenya",
    venue: "City Stadium / Nyayo Stadium",
    league: "FKF Premier League",
    logo: "/logo.png",
    desc: "Gor Mahia FC (K'Ogalo) — 21-time Kenyan champions. Tracking K'Ogalo matchday fixtures, local derby updates, standings and Mtaa Daily original reporting.",
  },
  "afc-leopards": {
    id: 4921,
    name: "AFC Leopards",
    country: "Kenya",
    venue: "Nyayo National Stadium",
    league: "FKF Premier League",
    logo: "/logo.png",
    desc: "AFC Leopards (Ingwe) — Pride of Kenyan football. Fixtures, derby action, standings, fan predictions and Kenyan football spotlight.",
  },
  "real-madrid": {
    id: 541,
    name: "Real Madrid",
    country: "Spain",
    venue: "Santiago Bernabéu",
    league: "La Liga",
    logo: "https://media.api-sports.io/football/teams/541.png",
    desc: "Real Madrid CF — Los Blancos Champions League royalty and La Liga battles. Live scores, predictions, and squad analysis.",
  },
  "barcelona": {
    id: 529,
    name: "FC Barcelona",
    country: "Spain",
    venue: "Spotify Camp Nou",
    league: "La Liga",
    logo: "https://media.api-sports.io/football/teams/529.png",
    desc: "FC Barcelona — Catalan football flair, La Liga updates, El Clasico predictions and tactical breakdowns.",
  },
};

export default function TeamDetailPage() {
  const [, params] = useRoute("/teams/:teamSlug");
  const teamSlug = (params?.teamSlug || "").toLowerCase();
  const club = KNOWN_CLUBS[teamSlug];

  if (!club) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-6 text-center">
        <SEO title="Club Not Found | BallMtaani" description="The requested football club page was not found." noindex />
        <h1 className="text-4xl font-black uppercase text-[#B30000] mb-2">404 — CLUB NOT FOUND</h1>
        <p className="text-white/60 mb-6 max-w-md">We couldn't find a dedicated club hub for "{teamSlug}". Browse active league centres to find your team.</p>
        <Link href="/leagues" className="px-6 py-3 rounded-xl bg-[#B30000] text-white font-bold hover:bg-red-700 transition-colors">
          EXPLORE LEAGUES & CLUBS
        </Link>
      </div>
    );
  }

  const clubSchema = generateClubSchema({
    name: club.name,
    slug: teamSlug,
    country: club.country,
    logo: club.logo,
    leagueName: club.league,
  });

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#E0E0E0] pb-16">
      <SEO
        title={`${club.name} Live Scores, Fixtures & Predictions | BallMtaani`}
        description={club.desc}
        canonicalUrl={`/teams/${teamSlug}`}
        jsonLd={clubSchema}
      />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#1a1c28] to-[#0B0B0B] border-b border-white/10 pt-8 pb-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-xl border border-white/20 shrink-0">
            <img src={club.logo} alt={club.name} className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFD700] mb-1">
              <span>{club.country}</span> • <span>{club.league}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mb-2">
              {club.name}
            </h1>
            <p className="text-xs md:text-sm text-white/70 max-w-2xl leading-relaxed">
              {club.desc}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-white/60 mt-4 pt-3 border-t border-white/10">
              <div>Home Grounds: <strong className="text-white">{club.venue}</strong></div>
              <div>Competition: <strong className="text-white">{club.league}</strong></div>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
            <Link href="/predictions" className="px-5 py-3 rounded-xl bg-[#B30000] text-white text-xs font-bold uppercase tracking-wider text-center hover:bg-red-700 transition-colors shadow-md">
              Predict {club.name} Matches
            </Link>
            <Link href="/mchambuzi-halisi" className="px-5 py-3 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider text-center hover:bg-white/20 transition-colors border border-white/10">
              Ask Mchambuzi AI About {club.name}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Matchday Companion Card */}
          <div className="bg-[#111319] rounded-2xl border border-white/10 p-5 shadow-lg">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#FFD700] mb-3">
              {club.name} Matchday Companion
            </h2>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Get real-time match stats, score updates, fan pulse prediction ratios, and tactical takeaways for all {club.name} fixtures.
            </p>
            <div className="p-4 rounded-xl bg-[#171a26] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FFD700] tracking-widest block mb-1">UPCOMING FIXTURE</span>
                <h3 className="text-sm font-bold text-white">{club.name} vs Opponent</h3>
                <span className="text-xs text-white/50">Africa/Nairobi (EAT) Matchday Schedule</span>
              </div>
              <Link href="/matches" className="px-3 py-1.5 rounded-lg bg-[#B30000] text-white text-xs font-bold uppercase hover:bg-red-700 transition-colors">
                View Match
              </Link>
            </div>
          </div>

          {/* Mtaa Daily Club News */}
          <div className="bg-[#111319] rounded-2xl border border-white/10 p-5 shadow-lg">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#FFD700] mb-3">
              Latest {club.name} News & Debates
            </h2>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Join the debate on {club.name}'s lineup decisions, tactical shape, transfer window moves, and receipt-keeping prediction threads.
            </p>
            <div className="flex gap-3">
              <Link href="/debates" className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#FFD700]/50 text-center transition-colors">
                <span className="text-xs font-bold text-white block">Join Fan Debates</span>
                <span className="text-[10px] text-[#FFD700]">Earn MTC points</span>
              </Link>
              <Link href="/news" className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#FFD700]/50 text-center transition-colors">
                <span className="text-xs font-bold text-white block">Read Mtaa Daily</span>
                <span className="text-[10px] text-[#FFD700]">Original Analysis</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#111319] rounded-2xl border border-white/10 p-5 shadow-lg">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#FFD700] mb-3">
              Club Summary
            </h3>
            <div className="space-y-2.5 text-xs text-white/70">
              <div className="flex justify-between border-b border-white/5 pb-2"><span>Club Name:</span> <strong className="text-white">{club.name}</strong></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>League:</span> <strong className="text-white">{club.league}</strong></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>Country:</span> <strong className="text-white">{club.country}</strong></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>Stadium:</span> <strong className="text-white">{club.venue}</strong></div>
              <div className="flex justify-between"><span>Data Source:</span> <strong className="text-[#FFD700]">API-Football & BallMtaani</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
