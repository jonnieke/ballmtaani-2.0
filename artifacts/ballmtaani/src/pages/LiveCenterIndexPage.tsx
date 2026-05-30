import { useMemo, useState } from "react";
import { useMatches } from "../hooks/useData";
import { Link } from "wouter";
import TeamLogo from "../components/TeamLogo";
import { SkeletonMatch } from "../components/Skeletons";
import AdBanner from "../components/AdBanner";
import { AD_STRATEGY, shouldShowFeedAd } from "../lib/adStrategy";

export default function LiveCenterIndexPage() {
  const { data: liveMatches = [], isLoading } = useMatches();
  const [leagueFilter, setLeagueFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<"minute" | "goals">("minute");

  const availableLeagues = useMemo(
    () => Array.from(new Set(liveMatches.map((m: any) => m.league))).filter(Boolean),
    [liveMatches]
  );
  const filteredMatches = useMemo(() => {
    const filtered = liveMatches.filter((m: any) => leagueFilter === "all" || m.league === leagueFilter);
    return [...filtered].sort((a: any, b: any) => {
      if (sortMode === "goals") return (b.homeScore + b.awayScore) - (a.homeScore + a.awayScore);
      const ma = parseInt(String(a.minute || "").replace("'", ""), 10);
      const mb = parseInt(String(b.minute || "").replace("'", ""), 10);
      return (Number.isNaN(mb) ? -1 : mb) - (Number.isNaN(ma) ? -1 : ma);
    });
  }, [liveMatches, leagueFilter, sortMode]);
  const totalGoals = useMemo(
    () => filteredMatches.reduce((sum: number, m: any) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0),
    [filteredMatches]
  );

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-3 py-6 md:px-4 md:py-10">
      {/* Header — data-first, no meaningless tiles */}
      <div className="mb-6 flex flex-col gap-1 md:mb-8">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Matchday Live</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              Live <span className="text-primary">Center</span>
            </h1>
            <p className="text-[11px] text-white/35 font-semibold">
              {isLoading ? "Loading…" : filteredMatches.length > 0
                ? `${filteredMatches.length} match${filteredMatches.length > 1 ? "es" : ""} live · ${totalGoals} goal${totalGoals !== 1 ? "s" : ""} so far`
                : "No live matches right now"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 md:mb-6">
        <AdBanner label="Live Center Sponsor" type="horizontal" />
      </div>

      <div className="mb-6 flex flex-col gap-2 md:mb-8">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setLeagueFilter("all")}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${leagueFilter === "all" ? "bg-white/10 border-white/30 text-white" : "bg-[#111] border-white/10 text-gray-500"}`}
          >
            All Leagues
          </button>
          {availableLeagues.map((league) => (
            <button
              key={league}
              onClick={() => setLeagueFilter(league)}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${leagueFilter === league ? "bg-white/10 border-white/30 text-white" : "bg-[#111] border-white/10 text-gray-500"}`}
            >
              {league}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setSortMode("minute")}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${sortMode === "minute" ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-500"}`}
          >
            Latest Minute
          </button>
          <button
            onClick={() => setSortMode("goals")}
            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${sortMode === "goals" ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-500"}`}
          >
            Most Goals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <SkeletonMatch key={i} />)
        ) : filteredMatches.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <span className="text-sm font-black opacity-50">LIVE</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">No Matches In This View</h3>
            <p className="text-gray-500 font-bold">Try another league filter or check back later for live action.</p>
          </div>
        ) : (
          filteredMatches.map((match: any, index: number) => (
            <div key={match.id} className="contents">
              <Link href={`/live-center/${match.id}`} className="block group h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-[#111111] p-3.5 shadow-2xl transition-all hover:border-primary/30 hover:bg-[#161616] hover:shadow-primary/20 sm:rounded-2xl sm:p-4 md:p-5 lg:p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors"></div>

                <div className="mb-4 flex items-center justify-between md:mb-6">
                  <span className="line-clamp-1 pr-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{match.league}</span>
                  <span className="bg-primary text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-[0_0_10px_rgba(179,0,0,0.5)] flex items-center gap-1.5 shrink-0 border border-[#ff4444]/30">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {match.minute}
                  </span>
                </div>

                <div className="mb-4 flex flex-1 items-center justify-between md:mb-6">
                  <div className="flex flex-col items-center gap-3 w-[35%]">
                    <TeamLogo logo={match.homeLogo} initial={match.homeInitial} color={match.homeColor} size="lg" shadow />
                    <span className="w-full truncate text-center text-xs font-black leading-tight sm:text-sm">{match.home}</span>
                  </div>

                  <div className="flex items-center justify-center w-[30%] gap-3">
                    <span className="text-3xl font-black drop-shadow-md sm:text-4xl">{match.homeScore}</span>
                    <span className="text-xl font-black text-primary">-</span>
                    <span className="text-3xl font-black drop-shadow-md sm:text-4xl">{match.awayScore}</span>
                  </div>

                  <div className="flex flex-col items-center gap-3 w-[35%]">
                    <TeamLogo logo={match.awayLogo} initial={match.awayInitial} color={match.awayColor} size="lg" shadow />
                    <span className="w-full truncate text-center text-xs font-black leading-tight sm:text-sm">{match.away}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-300 shadow-md transition-all hover:border-primary hover:bg-primary hover:text-white group-hover:shadow-[0_0_15px_rgba(179,0,0,0.4)] sm:rounded-xl sm:py-3 sm:text-xs">
                    Enter Live Center
                  </button>
                </div>
                </div>
              </Link>
              {shouldShowFeedAd(index, AD_STRATEGY.liveCenterFeedInterval, filteredMatches.length) ? (
                <div className="md:col-span-2 lg:col-span-3">
                  <AdBanner label="Live Match Partner" type="horizontal" />
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
