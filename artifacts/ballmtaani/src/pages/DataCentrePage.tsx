import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Radio, Calendar, ChevronRight, TrendingUp, Target, Trophy, Clock, BarChart2 } from "lucide-react";
import { useMatches, useUpcomingFixtures, useRecentMatches, useStandings } from "../hooks/useData";
import { fetchTodaysFixtures, fetchWC26TopScorers } from "../lib/football-api";
import TeamLogo from "../components/TeamLogo";
import { SkeletonMatch } from "../components/Skeletons";
import SEO from "../components/SEO";
import DataFreshnessChip from "../components/DataFreshnessChip";
import { formatFreshnessLabel } from "../lib/freshness";

const STANDING_TABS = ["WC26", "Premier League", "La Liga", "Serie A", "Bundesliga", "UCL"];

const LEAGUE_KEY_MAP: Record<string, string> = {
  "WC26":           "FIFA World Cup",
  "Premier League": "Premier League",
  "La Liga":        "La Liga",
  "Serie A":        "Serie A",
  "Bundesliga":     "Bundesliga",
  "UCL":            "UEFA Champions League",
};

function SectionHead({ label, sub, href, hrefLabel }: { label: string; sub?: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="border-l-4 border-[#B30000] pl-3 text-base font-black uppercase tracking-wide text-white">{label}</h2>
        {sub && <p className="ml-3 mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#B30000] hover:underline">
          {hrefLabel || "More"} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function progressPct(status: string, minute: string) {
  const m = parseInt(minute) || 0;
  if (status === "HT") return 50;
  if (status === "1H") return Math.min((m / 45) * 50, 50);
  if (status === "2H") return Math.min(50 + ((m - 45) / 45) * 50, 100);
  if (["ET", "P"].includes(status)) return 100;
  return 0;
}

export default function DataCentrePage() {
  const { data: liveMatches = [], isLoading: liveLoading } = useMatches();
  const { data: upcomingFixtures = [], isLoading: upcomingLoading } = useUpcomingFixtures();
  const { data: recentMatches = [], isLoading: recentLoading } = useRecentMatches();
  const { data: allStandings = {}, isLoading: standingsLoading } = useStandings();

  const [todaysFixtures, setTodaysFixtures] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [standingTab, setStandingTab] = useState("WC26");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    fetchTodaysFixtures().then(f => setTodaysFixtures(f || []));
    fetchWC26TopScorers().then(s => setTopScorers((s || []).slice(0, 8)));
  }, []);

  useEffect(() => {
    if (liveMatches.length || upcomingFixtures.length || recentMatches.length) setLastUpdated(new Date());
  }, [liveMatches, upcomingFixtures, recentMatches]);

  useEffect(() => {
    const t = setInterval(() => setClockTick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const freshnessLabel = useMemo(() => formatFreshnessLabel(lastUpdated), [lastUpdated, clockTick]);

  const liveStatuses = new Set(["1H", "2H", "HT", "ET", "P", "BT", "LIVE"]);
  const todayUpcoming = todaysFixtures.filter(m => !liveStatuses.has(m.status));

  const byLeague = todayUpcoming.reduce((acc: Record<string, any[]>, m) => {
    const k = m.league || "Other";
    if (!acc[k]) acc[k] = [];
    acc[k].push(m);
    return acc;
  }, {});

  const activeStandingsKey = LEAGUE_KEY_MAP[standingTab] || standingTab;
  const standingsRows = (allStandings as any)[activeStandingsKey] || [];

  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  return (
    <>
      <SEO
        title="Data Centre | BallMtaani — Live Scores, Fixtures & Standings"
        description="Live football scores, today's fixtures, league standings, recent results and WC26 top scorers — all in one place on BallMtaani Data Centre."
        path="/data-centre"
      />

      <div className="min-h-screen bg-[#060810] pb-24">

        {/* ── HEADER ── */}
        <div className="border-b border-white/8 bg-[#04060c]">
          <div className="mx-auto max-w-6xl px-4 py-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-[#1E6FFF]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1E6FFF]">BallMtaani</span>
                  <span className="text-white/15">·</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">{today}</span>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">Data Centre</h1>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Live Scores · Fixtures · Standings · Form
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {liveMatches.length > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full border border-[#B30000]/40 bg-[#B30000]/12 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#B30000]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#B30000]">
                      {liveMatches.length} Live Now
                    </span>
                  </div>
                )}
                {lastUpdated && <DataFreshnessChip label={freshnessLabel} />}
              </div>
            </div>

            {/* Platform doors */}
            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
              {[
                { href: "/news",       label: "📰 Mtaa Daily",    active: false },
                { href: "/data-centre",label: "📊 Data Centre",   active: true  },
                { href: "/fun-zone",   label: "🎮 Fun Zone",      active: false },
                { href: "/predictions",label: "🎯 My Calls",      active: false },
                { href: "/world-cup-2026", label: "🏆 WC26 Hub", active: false },
              ].map(({ href, label, active }) => (
                <Link key={href} href={href}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    active
                      ? "bg-[#1E6FFF]/20 text-[#1E6FFF] border border-[#1E6FFF]/40"
                      : "border border-white/8 bg-white/[0.03] text-white/40 hover:text-white hover:border-white/16"
                  }`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">

            {/* ── MAIN COLUMN ── */}
            <div className="space-y-10">

              {/* LIVE NOW */}
              {(liveLoading || liveMatches.length > 0) && (
                <section>
                  <SectionHead label="Live Now" sub="Updating every 60s" href="/matches" hrefLabel="All Matches" />
                  <div className="overflow-hidden rounded-xl border border-[#B30000]/30 bg-[#0d0608]/96 shadow-[0_0_20px_rgba(179,0,0,0.1)]">
                    {liveLoading ? (
                      <div className="p-4"><SkeletonMatch /></div>
                    ) : liveMatches.map((m: any) => {
                      const pct = progressPct(m.status, m.minute);
                      const isHT = m.status === "HT";
                      return (
                        <Link key={m.id} href={`/live-center/${m.id}`}
                          className="block border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.02]">
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 pt-3 pb-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <TeamLogo logo={m.homeLogo} initial={m.homeInitial} color="#1a0608" size="sm" />
                              <span className="truncate text-sm font-bold text-white">{m.home}</span>
                            </div>
                            <span className="text-lg font-black tabular-nums text-[#B30000]">{m.homeScore} – {m.awayScore}</span>
                            <div className="flex min-w-0 items-center justify-end gap-2">
                              <span className="truncate text-right text-sm font-bold text-white">{m.away}</span>
                              <TeamLogo logo={m.awayLogo} initial={m.awayInitial} color="#1a0608" size="sm" />
                            </div>
                          </div>
                          <div className="px-4 pb-3">
                            <div className="mb-1 flex justify-between">
                              <span className="text-[9px] font-semibold uppercase tracking-widest text-white/28">{m.league}</span>
                              <span className={`text-[9px] font-black uppercase tracking-widest ${isHT ? "text-yellow-400" : "text-[#B30000]"}`}>
                                {isHT ? "Half Time" : m.minute ? `${m.minute}'` : "Live"}
                              </span>
                            </div>
                            <div className="h-1 overflow-hidden rounded-full bg-white/8">
                              <div className={`h-full rounded-full transition-all duration-1000 ${isHT ? "bg-yellow-400" : "bg-[#B30000]"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* TODAY'S FIXTURES */}
              <section>
                <SectionHead label="Today's Fixtures" sub={today} href="/matches" hrefLabel="Full Desk" />
                {todayUpcoming.length === 0 ? (
                  <div className="rounded-xl border border-white/6 bg-white/[0.02] py-10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No more fixtures today</p>
                    <Link href="/matches" className="mt-2 block text-[10px] text-[#B30000] hover:underline">See upcoming →</Link>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-white/8 bg-[#090d14]/96">
                    {Object.entries(byLeague).map(([league, matches]: [string, any[]]) => (
                      <div key={league}>
                        <div className="flex items-center gap-2 border-b border-white/6 bg-white/[0.02] px-4 py-2">
                          {matches[0]?.leagueLogo && <img src={matches[0].leagueLogo} alt="" className="h-4 w-4 object-contain opacity-60" loading="lazy" />}
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{league}</span>
                        </div>
                        {matches.map((m: any) => (
                          <div key={m.id} className="grid grid-cols-[48px_1fr_24px_1fr] items-center gap-2 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/[0.02]">
                            <span className="text-xs font-black tabular-nums text-[#FFD700]/70">{m.time || "TBC"}</span>
                            <div className="flex min-w-0 items-center gap-2">
                              <TeamLogo logo={m.homeLogo} initial={m.homeInitial || m.home?.slice(0,3)} color="#182333" size="sm" />
                              <span className="truncate text-sm font-semibold text-white">{m.home}</span>
                            </div>
                            <span className="text-center text-[10px] font-bold text-white/20">vs</span>
                            <div className="flex min-w-0 items-center justify-end gap-2">
                              <span className="truncate text-right text-sm font-semibold text-white">{m.away}</span>
                              <TeamLogo logo={m.awayLogo} initial={m.awayInitial || m.away?.slice(0,3)} color="#182333" size="sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* UPCOMING */}
              {upcomingFixtures.length > 0 && (
                <section>
                  <SectionHead label="Upcoming" sub="Next fixtures" href="/predictions" hrefLabel="Make Your Call" />
                  <div className="space-y-2">
                    {upcomingFixtures.slice(0, 6).map((m: any) => (
                      <Link key={m.id} href="/predictions"
                        className="group flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-[#090d14] px-4 py-3 transition-all hover:border-white/12 hover:bg-[#0c1018]">
                        <div className="flex min-w-0 items-center gap-2">
                          <TeamLogo logo={m.homeLogo} initial={m.homeInitial} color="#182333" size="sm" />
                          <span className="truncate text-sm font-bold text-white">{m.home}</span>
                        </div>
                        <div className="shrink-0 text-center">
                          <div className="text-[9px] font-black uppercase tracking-widest text-white/20">VS</div>
                          {m.time && <div className="text-[9px] font-black tabular-nums text-[#FFD700]/70">{m.date ? `${m.date} ` : ""}{m.time}</div>}
                        </div>
                        <div className="flex min-w-0 items-center justify-end gap-2">
                          <span className="truncate text-right text-sm font-bold text-white">{m.away}</span>
                          <TeamLogo logo={m.awayLogo} initial={m.awayInitial} color="#182333" size="sm" />
                        </div>
                        <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-[#B30000] opacity-0 transition-opacity group-hover:opacity-100">
                          Predict →
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* RECENT RESULTS */}
              <section>
                <SectionHead label="Recent Results" sub="Full time" href="/matches" hrefLabel="All Results" />
                {recentLoading ? (
                  <SkeletonMatch />
                ) : recentMatches.length === 0 ? (
                  <p className="text-[10px] text-white/25">No recent results</p>
                ) : (
                  <div className="space-y-2">
                    {recentMatches.slice(0, 6).map((m: any) => (
                      <div key={m.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-[#090d14] px-4 py-3">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <TeamLogo logo={m.homeLogo} initial={m.homeInitial} color="#182333" size="sm" />
                          <span className="truncate text-sm font-bold text-white/80">{m.home}</span>
                        </div>
                        <div className="shrink-0 text-center">
                          <span className="text-base font-black tabular-nums text-white">{m.homeScore} – {m.awayScore}</span>
                          <div className="text-[8px] font-black uppercase tracking-widest text-white/25">FT</div>
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                          <span className="truncate text-right text-sm font-bold text-white/80">{m.away}</span>
                          <TeamLogo logo={m.awayLogo} initial={m.awayInitial} color="#182333" size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>

            {/* ── SIDEBAR ── */}
            <div className="space-y-8">

              {/* STANDINGS */}
              <section>
                <SectionHead label="Standings" />
                {/* Tab row */}
                <div className="mb-3 flex gap-1 overflow-x-auto no-scrollbar">
                  {STANDING_TABS.map(tab => (
                    <button key={tab} onClick={() => setStandingTab(tab)}
                      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                        standingTab === tab
                          ? "bg-[#B30000] text-white"
                          : "bg-white/[0.04] text-white/30 hover:text-white hover:bg-white/8"
                      }`}>
                      {tab}
                    </button>
                  ))}
                </div>

                {standingsLoading ? (
                  <div className="animate-pulse rounded-xl bg-white/[0.04] h-48" />
                ) : standingsRows.length === 0 ? (
                  <div className="rounded-xl border border-white/6 bg-white/[0.02] py-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No standings data</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-white/8 bg-[#090d14]">
                    {/* Header */}
                    <div className="grid grid-cols-[auto_1fr_repeat(4,28px)] gap-2 border-b border-white/6 bg-white/[0.03] px-3 py-2 text-[8px] font-black uppercase tracking-widest text-white/25">
                      <span className="w-5">#</span>
                      <span>Club</span>
                      <span className="text-center">P</span>
                      <span className="text-center">W</span>
                      <span className="text-center">GD</span>
                      <span className="text-center">Pts</span>
                    </div>
                    {standingsRows.slice(0, 10).map((row: any, i: number) => (
                      <div key={row.team || i}
                        className="grid grid-cols-[auto_1fr_repeat(4,28px)] items-center gap-2 border-b border-white/[0.04] px-3 py-2.5 last:border-0">
                        <span className={`w-5 text-[10px] font-black ${i < 4 ? "text-[#1E6FFF]" : i < 6 ? "text-[#FFD700]/70" : "text-white/25"}`}>
                          {row.rank || i + 1}
                        </span>
                        <div className="flex min-w-0 items-center gap-1.5">
                          {row.logo && <img src={row.logo} alt="" className="h-4 w-4 object-contain" loading="lazy" />}
                          <span className="truncate text-[11px] font-bold text-white">{row.team}</span>
                        </div>
                        <span className="text-center text-[10px] tabular-nums text-white/40">{row.played ?? row.mp ?? "—"}</span>
                        <span className="text-center text-[10px] tabular-nums text-white/40">{row.win ?? row.w ?? "—"}</span>
                        <span className="text-center text-[10px] tabular-nums text-white/40">{row.goalsDiff ?? row.gd ?? "—"}</span>
                        <span className="text-center text-[10px] font-black tabular-nums text-white">{row.points ?? row.pts ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* WC26 TOP SCORERS */}
              {topScorers.length > 0 && (
                <section>
                  <SectionHead label="WC26 Golden Boot" />
                  <div className="overflow-hidden rounded-xl border border-white/8 bg-[#090d14]">
                    {topScorers.map((s: any, i: number) => (
                      <div key={s.player?.id || i}
                        className="flex items-center gap-3 border-b border-white/[0.04] px-3 py-2.5 last:border-0">
                        <span className={`w-5 shrink-0 text-[10px] font-black ${i === 0 ? "text-[#FFD700]" : "text-white/22"}`}>
                          {i + 1}
                        </span>
                        {s.player?.photo && (
                          <img src={s.player.photo} alt={s.player?.name} className="h-7 w-7 shrink-0 rounded-full object-cover" loading="lazy" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-black text-white">{s.player?.name}</p>
                          <p className="text-[9px] text-white/30">{s.statistics?.[0]?.team?.name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-black text-[#FFD700]">{s.statistics?.[0]?.goals?.total ?? 0}</span>
                          <p className="text-[8px] text-white/25">goals</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* PREDICT CTA */}
              <section>
                <Link href="/predictions"
                  className="group flex items-center gap-4 rounded-xl border border-[#B30000]/25 bg-[#0d0608]/80 px-4 py-4 transition-all hover:border-[#B30000]/45">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B30000]/12">
                    <Target className="h-5 w-5 text-[#B30000]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-white">Make Your Call</p>
                    <p className="mt-0.5 text-[10px] text-white/38">Predict scores, earn MTC, keep the receipt</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#B30000]/50 transition-colors group-hover:text-[#B30000]" />
                </Link>

                <Link href="/live-center"
                  className="mt-2 group flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-4 transition-all hover:border-white/16">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <Radio className="h-5 w-5 text-white/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-white">Live Center</p>
                    <p className="mt-0.5 text-[10px] text-white/38">Stats, events &amp; commentary in real time</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/25 transition-colors group-hover:text-white/60" />
                </Link>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
