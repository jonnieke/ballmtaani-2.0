/**
 * BallMtaani League Centre (/leagues)
 * Overview of all major competitions covered by BallMtaani.
 */

import React from "react";
import { Link } from "wouter";
import SEO from "../components/SEO";
import { COMPETITIONS, CompetitionConfig } from "../config/football-catalog";

function CategoryGrid({ title, items }: { title: string; items: CompetitionConfig[] }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-black uppercase tracking-widest text-[#FFD700] mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
        <span>🏆</span> {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(comp => (
          <Link
            key={comp.id}
            href={`/leagues/${comp.slug}`}
            className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#111319] border border-white/10 hover:border-[#FFD700]/60 hover:bg-[#161b26] transition-all duration-300 shadow-lg overflow-hidden"
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md border border-white/20">
                <img src={comp.logo} alt={comp.officialName} className="max-h-full max-w-full object-contain" />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-[#FFD700] transition-colors">
                  {comp.officialName}
                </h3>
                <span className="text-xs text-white/50 font-semibold">{comp.country} • {comp.currentSeason} Season</span>
              </div>
            </div>
            <p className="text-xs text-white/70 line-clamp-2 mb-4 leading-normal">
              {comp.kenyanDescription}
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-[#FFD700] pt-3 border-t border-white/5">
              <span>VIEW LEAGUE CENTRE</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function LeagueCentrePage() {
  const mostFollowed = COMPETITIONS.filter(c => c.category === "most-followed");
  const kenyan = COMPETITIONS.filter(c => c.category === "kenyan");
  const european = COMPETITIONS.filter(c => c.category === "european");
  const african = COMPETITIONS.filter(c => c.category === "african");

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-16">
      <SEO
        title="Football League Centres | Premier League, KPL & Champions League Kenya"
        description="Browse Premier League, FKF Premier League, UEFA Champions League, La Liga and African football hubs on BallMtaani. Live scores, standings, fixtures and fan debates."
        canonicalUrl="/leagues"
      />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-[#B30000]/40 text-[#FFD700] text-xs font-bold uppercase tracking-wider mb-3">
            <span>⚽</span> BallMtaani Competition Hubs
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#FFD700] mb-3">
            LEAGUE CENTRES
          </h1>
          <p className="text-white/70 max-w-2xl text-sm md:text-base leading-relaxed">
            Choose your competition to track live scores, current standings, upcoming fixtures, fan debates, and Mchambuzi AI tactical insights.
          </p>
        </div>

        <CategoryGrid title="Most Followed Competitions" items={mostFollowed} />
        <CategoryGrid title="Kenyan Football" items={kenyan} />
        <CategoryGrid title="European Leagues" items={european} />
        <CategoryGrid title="African Competitions" items={african} />

        {/* Footnote / Source Attribution */}
        <div className="mt-12 p-4 rounded-xl bg-[#161720] border border-white/10 text-xs text-white/50 text-center">
          Data provided by API-Football & Mtaa Daily editorial team. All kickoffs shown in <strong>Africa/Nairobi (EAT)</strong> time.
        </div>
      </div>
    </div>
  );
}
