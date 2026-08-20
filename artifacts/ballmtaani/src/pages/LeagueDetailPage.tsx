/**
 * BallMtaani League Detail Page (/leagues/:leagueSlug)
 * Supports sub-views: /leagues/:leagueSlug/fixtures & /leagues/:leagueSlug/table
 */

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import SEO from "../components/SEO";
import { getLeagueBySlug } from "../config/football-catalog";
import { useMatches, useRecentMatches, useStandings, useUpcomingFixtures } from "../hooks/useData";
import { formatKenyanTime, formatMatchDateHeader } from "../lib/date-utils";
import { generateLeagueSchema } from "../lib/jsonld";
import { fetchLeagueFixtures } from "../lib/football-api";

interface Props {
  subView?: "main" | "fixtures" | "table";
}

export default function LeagueDetailPage({ subView = "main" }: Props) {
  const [, params1] = useRoute("/leagues/:leagueSlug");
  const [, params2] = useRoute("/leagues/:leagueSlug/fixtures");
  const [, params3] = useRoute("/leagues/:leagueSlug/table");
  const [, params4] = useRoute("/leagues/:leagueSlug/*?");

  const leagueSlug = params1?.leagueSlug || params2?.leagueSlug || params3?.leagueSlug || params4?.leagueSlug || "";
  const isFixturesPath = Boolean(params2);
  const isTablePath = Boolean(params3);

  const league = getLeagueBySlug(leagueSlug);
  const leagueId = league?.id;
  const { data: rawMatches, isLoading: matchesLoading } = useMatches();
  const { data: rawUpcomingFixtures = [], isLoading: upcomingLoading } = useUpcomingFixtures();
  const { data: rawRecentMatches = [], isLoading: recentLoading } = useRecentMatches();
  const { data: rawStandingsMap, isLoading: standingsLoading } = useStandings();
  const { data: leagueFixtures = [], isLoading: leagueFixturesLoading } = useQuery({
    queryKey: ["league-fixtures", league?.id, league?.currentSeason],
    queryFn: async () => {
      if (!league) return [];
      return fetchLeagueFixtures(league.id, league.currentSeason, 10);
    },
    enabled: !!league,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const fixturesLoading = matchesLoading || upcomingLoading || recentLoading;

  const matches = useMemo(() => {
    const pool = [...(rawMatches || []), ...rawRecentMatches, ...rawUpcomingFixtures, ...leagueFixtures];
    if (!leagueId) return [];

    const deduped = new Map<string, any>();
    for (const item of pool) {
      if (Number(item?.leagueId) !== Number(leagueId)) continue;
      if (!item?.id) continue;
      deduped.set(String(item.id), item);
    }

    return [...deduped.values()].sort((a, b) => (a.kickoffAt || 0) - (b.kickoffAt || 0));
  }, [leagueId, leagueFixtures, rawMatches, rawRecentMatches, rawUpcomingFixtures]);
  const allFixturesLoading = fixturesLoading || leagueFixturesLoading;
  const standings = league && rawStandingsMap ? rawStandingsMap[String(league.id)] || [] : [];

  const [activeTab, setActiveTab] = useState<"overview" | "fixtures" | "table">(
    subView === "table" || isTablePath ? "table" : subView === "fixtures" || isFixturesPath ? "fixtures" : "overview"
  );

  if (!league) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center p-6 text-center">
        <SEO title="League Not Found | BallMtaani" description="The requested league does not exist." noindex />
        <h1 className="text-4xl font-black uppercase text-[#B30000] mb-2">404 — OFF-SIDE</h1>
        <p className="text-white/60 mb-6 max-w-md">We couldn't find a competition matching "{leagueSlug}". Check out our active league hubs.</p>
        <Link href="/leagues" className="px-6 py-3 rounded-xl bg-[#B30000] text-white font-bold hover:bg-red-700 transition-colors">
          RETURN TO LEAGUE CENTRES
        </Link>
      </div>
    );
  }

  const leagueSchema = generateLeagueSchema({
    name: league.officialName,
    slug: league.slug,
    description: league.seoDescription,
    country: league.country,
    season: league.currentSeason,
  });

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#E0E0E0] pb-16">
      <SEO
        title={league.seoTitle}
        description={league.seoDescription}
        canonicalUrl={`/leagues/${league.slug}`}
        jsonLd={leagueSchema}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#181a24] to-[#0B0B0B] border-b border-white/10 pt-8 pb-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white p-2 flex items-center justify-center shadow-xl border border-white/20 shrink-0">
              <img src={league.logo} alt={league.officialName} className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFD700] mb-1">
                <span>{league.country}</span> • <span>{league.currentSeason} Season</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black uppercase text-white tracking-tight">
                {league.officialName}
              </h1>
              <p className="text-xs md:text-sm text-white/70 mt-1 max-w-2xl">
                {league.kenyanDescription}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/predictions" className="px-4 py-2.5 rounded-xl bg-[#B30000] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors">
              Make Predictions
            </Link>
            <Link href="/debates" className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors border border-white/10">
              Join Debates
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto flex items-center gap-6 border-t border-white/10 mt-6 pt-3">
          <Link
            href={`/leagues/${league.slug}`}
            onClick={() => setActiveTab("overview")}
            className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-colors ${
              activeTab === "overview" ? "border-[#FFD700] text-[#FFD700]" : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Overview
          </Link>
          <Link
            href={`/leagues/${league.slug}/fixtures`}
            onClick={() => setActiveTab("fixtures")}
            className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-colors ${
              activeTab === "fixtures" ? "border-[#FFD700] text-[#FFD700]" : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Fixtures & Results
          </Link>
          <Link
            href={`/leagues/${league.slug}/table`}
            onClick={() => setActiveTab("table")}
            className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-colors ${
              activeTab === "table" ? "border-[#FFD700] text-[#FFD700]" : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            Standings Table
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Tab Views */}
        {activeTab === "table" ? (
          <div className="bg-[#111319] rounded-2xl border border-white/10 p-5 shadow-lg">
            <h2 className="text-base font-black uppercase tracking-wider text-[#FFD700] mb-4">
              {league.officialName} Standings ({league.currentSeason})
            </h2>
            {standingsLoading ? (
              <div className="py-8 text-center text-xs text-white/40">Loading standings table...</div>
            ) : standings && standings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">
                    <tr>
                      <th className="py-2 px-2">Pos</th>
                      <th className="py-2 px-2">Club</th>
                      <th className="py-2 px-2 text-center">P</th>
                      <th className="py-2 px-2 text-center">W</th>
                      <th className="py-2 px-2 text-center">D</th>
                      <th className="py-2 px-2 text-center">L</th>
                      <th className="py-2 px-2 text-center">GD</th>
                      <th className="py-2 px-2 text-center font-bold text-[#FFD700]">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings.map((row: any) => (
                      <tr key={row.rank} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-2 font-bold text-white/70">{row.rank}</td>
                        <td className="py-2.5 px-2 font-bold text-white flex items-center gap-2">
                          {row.team.logo && <img src={row.team.logo} alt={row.team.name} className="w-5 h-5 object-contain" />}
                          <Link href={`/teams/${row.team.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="hover:text-[#FFD700] transition-colors">
                            {row.team.name}
                          </Link>
                        </td>
                        <td className="py-2.5 px-2 text-center text-white/80">{row.all.played}</td>
                        <td className="py-2.5 px-2 text-center text-white/80">{row.all.win}</td>
                        <td className="py-2.5 px-2 text-center text-white/80">{row.all.draw}</td>
                        <td className="py-2.5 px-2 text-center text-white/80">{row.all.lose}</td>
                        <td className="py-2.5 px-2 text-center text-white/80">{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</td>
                        <td className="py-2.5 px-2 text-center font-black text-[#FFD700]">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-white/50 bg-white/5 rounded-xl border border-white/5">
                Standings for the {league.currentSeason} season are being updated. Check back shortly.
              </div>
            )}
          </div>
        ) : (
          /* Overview / Fixtures View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Fixtures Card */}
              <div className="bg-[#111319] rounded-2xl border border-white/10 p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#FFD700]">
                    Matchday Fixtures & Results
                  </h2>
                  <span className="text-[10px] text-white/40 font-semibold">Africa/Nairobi (EAT)</span>
                </div>
                {allFixturesLoading ? (
                  <div className="py-8 text-center text-xs text-white/40">Fetching live match schedule...</div>
                ) : matches && matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.slice(0, 10).map((m: any) => {
                      const homeName = m?.teams?.home?.name;
                      const awayName = m?.teams?.away?.name;
                      const fixtureDate = m?.fixture?.date;
                      const fixtureId = m?.fixture?.id;
                      const isFullTime = m?.fixture?.status?.short === "FT";
                      const homeGoals = m?.goals?.home ?? "-";
                      const awayGoals = m?.goals?.away ?? "-";
                      if (!homeName || !awayName || !fixtureDate || !fixtureId) return null;
                      const matchSlug = `${homeName}-v-${awayName}-${fixtureDate.slice(0, 10)}-${fixtureId}`
                        .toLowerCase()
                        .replace(/[^a-z0-9-]+/g, "-");
                      return (
                        <Link
                          key={fixtureId}
                          href={`/matches/${matchSlug}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#161822] hover:bg-[#1d202e] border border-white/5 hover:border-[#FFD700]/40 transition-all"
                        >
                          <div className="flex items-center gap-3 w-5/12 justify-end">
                            <span className="text-xs font-bold text-white text-right truncate">{homeName}</span>
                            {m?.teams?.home?.logo && <img src={m.teams.home.logo} alt={homeName} className="w-6 h-6 object-contain shrink-0" />}
                          </div>
                          <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-center shrink-0 min-w-[70px]">
                            {isFullTime ? (
                              <span className="text-xs font-black text-[#FFD700]">{homeGoals} - {awayGoals}</span>
                            ) : (
                              <span className="text-[11px] font-bold text-white/90">{formatKenyanTime(fixtureDate, false)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 w-5/12">
                            {m?.teams?.away?.logo && <img src={m.teams.away.logo} alt={awayName} className="w-6 h-6 object-contain shrink-0" />}
                            <span className="text-xs font-bold text-white truncate">{awayName}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-white/50 bg-white/5 rounded-xl border border-white/5">
                    No fixtures or results are available for this competition window yet.
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* About League */}
              <div className="bg-[#111319] rounded-2xl border border-white/10 p-5 shadow-lg">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#FFD700] mb-3">
                  About {league.officialName}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  {league.kenyanDescription}
                </p>
                <div className="space-y-2 text-xs text-white/60 pt-3 border-t border-white/5">
                  <div className="flex justify-between"><span>Country / Region:</span> <strong className="text-white">{league.country}</strong></div>
                  <div className="flex justify-between"><span>Current Season:</span> <strong className="text-white">{league.currentSeason}</strong></div>
                  <div className="flex justify-between"><span>Data Attribution:</span> <strong className="text-[#FFD700]">API-Football</strong></div>
                  <div className="flex justify-between"><span>Timezone:</span> <strong className="text-white">Africa/Nairobi (EAT)</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Attribution Footer */}
        <div className="mt-12 p-4 rounded-xl bg-[#161720] border border-white/10 text-xs text-white/40 text-center">
          Match schedules, results and league standings powered by API-Football. Last synced: {new Date().toLocaleTimeString()} EAT.
        </div>
      </div>
    </div>
  );
}
