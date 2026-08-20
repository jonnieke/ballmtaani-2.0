/**
 * BallMtaani Permanent Match Detail Page (/matches/:matchSlug)
 * Evergreen result & matchday intelligence page for individual fixtures.
 */

import React from "react";
import { Link, useRoute } from "wouter";
import SEO from "../components/SEO";
import { parseMatchSlug } from "../config/football-catalog";
import { formatKenyanDateTime, formatKenyanTime } from "../lib/date-utils";
import { generateMatchSchema } from "../lib/jsonld";

import { MchambuziHypeMeter } from "../components/MchambuziHypeMeter";

export default function MatchDetailPage() {
  const [, params] = useRoute("/matches/:matchSlug");
  const matchSlug = params?.matchSlug || "";

  // Deconstruct slug details (e.g. "arsenal-v-chelsea-2026-09-06-123456")
  const { fixtureId } = parseMatchSlug(matchSlug);
  
  // Format readable title from slug
  const slugParts = matchSlug.split("-v-");
  const homeName = slugParts[0] ? slugParts[0].replace(/-/g, " ").toUpperCase() : "HOME TEAM";
  const rest = slugParts[1] || "";
  const awayName = rest.split("-202")[0] ? rest.split("-202")[0].replace(/-/g, " ").toUpperCase() : "AWAY TEAM";

  const matchTitle = `${homeName} vs ${awayName}`;
  const isFinished = matchSlug.includes("ft") || false;

  const matchSchema = generateMatchSchema({
    matchSlug,
    homeTeam: homeName,
    awayTeam: awayName,
    startDateISO: new Date().toISOString(),
    status: isFinished ? "finished" : "scheduled",
    leagueName: "Football Match",
  });

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#E0E0E0] pb-16">
      <SEO
        title={`${matchTitle} Live Score, Prediction & Matchday Intelligence | BallMtaani`}
        description={`Follow ${matchTitle} live scores, kickoff time in Africa/Nairobi (EAT), prediction ratios, Mchambuzi AI analysis and fan debates on BallMtaani.`}
        canonicalUrl={`/matches/${matchSlug}`}
        jsonLd={matchSchema}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-b from-[#181b28] to-[#0B0B0B] border-b border-white/10 pt-8 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-[#B30000]/40 text-[#FFD700] text-xs font-bold uppercase tracking-wider mb-4">
            <span>⚡</span> Matchday Intelligence Center
          </div>

          {/* Teams Header */}
          <div className="flex items-center justify-center gap-6 my-4">
            <div className="flex-1 text-right">
              <h1 className="text-2xl md:text-4xl font-black text-white uppercase">{homeName}</h1>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#111319] border border-white/15 shadow-xl text-center shrink-0">
              {isFinished ? (
                <span className="text-xl md:text-3xl font-black text-[#FFD700]">FT</span>
              ) : (
                <span className="text-xs md:text-sm font-bold text-white/80">{formatKenyanTime(new Date())}</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <h1 className="text-2xl md:text-4xl font-black text-white uppercase">{awayName}</h1>
            </div>
          </div>

          <div className="text-xs text-white/60 font-semibold">
            {formatKenyanDateTime(new Date())} • Africa/Nairobi (EAT)
          </div>
        </div>
      </div>

      {/* Match Content */}
      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Prediction Card */}
        <div className="bg-[#111319] rounded-2xl border border-white/10 p-6 shadow-xl text-center">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#FFD700] mb-2">
            FAN PREDICTION PULSE
          </h2>
          <p className="text-xs text-white/60 mb-4">
            Make your call for {matchTitle}. Correct score predictions earn MTC points.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-4">
            <button className="py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#FFD700] font-bold text-xs text-white transition-all">
              1 ({homeName})
            </button>
            <button className="py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#FFD700] font-bold text-xs text-white transition-all">
              X (DRAW)
            </button>
            <button className="py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#FFD700] font-bold text-xs text-white transition-all">
              2 ({awayName})
            </button>
          </div>

          <Link href="/predictions" className="inline-block px-6 py-2.5 rounded-xl bg-[#B30000] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-md">
            Submit Prediction Receipt
          </Link>
        </div>

        {/* Mchambuzi Hype & Drama Meter */}
        <MchambuziHypeMeter
          homeTeam={homeName}
          awayTeam={awayName}
          homeRatio={52}
          drawRatio={20}
          awayRatio={28}
          dramaLevel="HIGH DRAMA"
          verdict={`Tactical clash between ${homeName} and ${awayName}. High line pressing, midfield energy and fast transitions expected.`}
        />

        {/* Footnote / Data Attribution */}
        <div className="p-4 rounded-xl bg-[#161720] border border-white/10 text-xs text-white/40 text-center">
          Permanent Match Record ID #{fixtureId || "LIVE"}. Powered by API-Football & BallMtaani Engine. All times in <strong>Africa/Nairobi (EAT)</strong>.
        </div>
      </div>
    </div>
  );
}
