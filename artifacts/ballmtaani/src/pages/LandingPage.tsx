import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Goal,
  Home,
  ListChecks,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import SEO from "../components/SEO";
import TeamLogo from "../components/TeamLogo";
import OddspediaCredit from "../components/OddspediaCredit";
import DataFreshnessChip from "../components/DataFreshnessChip";
import {
  fetchFixtureEvents,
  fetchFixtureLineups,
  fetchFixtureStats,
  fetchLeagueFixtures,
  fetchLiveMatches,
  fetchRecentMatches,
  fetchStandings,
  fetchTeamSeasonStats,
  fetchUpcomingFixtures,
  type FixtureEvent,
  type FixtureStat,
  type LiveMatch,
  type StandingEntry,
  type TeamLineup,
  type TeamSeasonStats,
} from "../lib/football-api";

type DisplayMatch = {
  id: string;
  homeTeamId?: number;
  awayTeamId?: number;
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  homeInitial?: string;
  awayInitial?: string;
  homeScore?: number;
  awayScore?: number;
  league: string;
  leagueLogo?: string;
  date?: string;
  time?: string;
  kickoff?: string;
  status: string;
  leagueId?: number;
};

type MatchCenterTab = "scores" | "table" | "match" | "lineups" | "season";

const DATA_LEAGUES = [
  { id: 39,  name: "Premier League", short: "EPL",       season: 2025 },
  { id: 140, name: "La Liga",        short: "La Liga",   season: 2025 },
  { id: 135, name: "Serie A",        short: "Serie A",   season: 2025 },
  { id: 78,  name: "Bundesliga",     short: "Bundesliga",season: 2025 },
  { id: 61,  name: "Ligue 1",        short: "Ligue 1",   season: 2025 },
  { id: 2,   name: "Champions League", short: "UCL",     season: 2025 },
  // KPL (686) removed — API-Football returns Czech teams instead of Kenya
  // TODO: Restore when correct KPL league ID is confirmed
];

const FEATURE_LINKS = [
  { href: "/matches", label: "Data Center", sub: "Fixtures, tables, results", icon: BarChart3 },
  { href: "/live-center", label: "Live Center", sub: "Match pulse", icon: Radio },
  { href: "/world-cup-2026", label: "WC26", sub: "Groups, venues, fixtures", icon: Trophy },
  { href: "/mchambuzi-halisi", label: "Mchambuzi", sub: "Ask the analyst", icon: Sparkles },
  { href: "/predictions", label: "Predictions", sub: "Make your call", icon: Goal },
  { href: "/market-watch", label: "Market Watch", sub: "Signals, not betting", icon: ShieldCheck },
  { href: "/rapid-fire", label: "Rapid Fire", sub: "Fan votes", icon: Zap },
  { href: "/fan-zones", label: "Fan Zones", sub: "Club rooms", icon: Users },
];

const CENTER_TABS: { id: MatchCenterTab; label: string; icon: typeof Activity }[] = [
  { id: "scores", label: "Scores", icon: Activity },
  { id: "table", label: "Tables", icon: Table2 },
  { id: "match", label: "Stats", icon: BarChart3 },
  { id: "lineups", label: "Events", icon: ListChecks },
  { id: "season", label: "Season", icon: ShieldCheck },
];

// Removed WC_FALLBACK — never show fake data on sports app
// Only show real World Cup fixtures from API, or empty state

function normalizeMatchStatus(status?: string) {
  const s = (status || "").toUpperCase();
  if (!s) return "NS";
  if (["1H", "2H", "HT", "ET", "P", "BT"].includes(s)) return "LIVE";
  if (["FT", "AET", "PEN"].includes(s)) return "FT";
  return s;
}

function getCurrentSeason(now = new Date()) {
  const month = now.getUTCMonth() + 1;
  return month >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

// ─── Live Now Card — shows actual live matches ────────────────
function LiveNowCard({ matches }: { matches: DisplayMatch[] }) {
  const live = matches.filter((m) => m.status === "LIVE");
  if (!live.length) return null;
  return (
    <section className="overflow-hidden rounded-xl border border-primary/40 bg-[#0d0608]/95 shadow-[0_0_24px_rgba(179,0,0,0.15)]">
      <div className="flex items-center gap-2 border-b border-primary/20 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Live Now</span>
        <span className="ml-auto text-[10px] font-semibold text-primary/60">{live.length} match{live.length > 1 ? "es" : ""}</span>
      </div>
      {live.map((m) => {
        const hasScore = typeof m.homeScore === "number" && typeof m.awayScore === "number";
        return (
          <div key={m.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/6 px-3 py-3 last:border-0">
            <div className="flex min-w-0 items-center gap-2">
              <TeamLogo logo={m.homeLogo} initial={m.homeInitial || m.home.slice(0,3)} color="#1a0608" size="sm" />
              <span className="truncate text-sm font-bold text-white">{m.home}</span>
            </div>
            <div className="text-center">
              {hasScore ? (
                <span className="text-base font-black text-primary tabular-nums">{m.homeScore} – {m.awayScore}</span>
              ) : (
                <span className="text-xs font-bold text-white/40">vs</span>
              )}
              <div className="text-[9px] font-semibold uppercase tracking-widest text-white/35 mt-0.5">{m.league}</div>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2">
              <span className="truncate text-sm font-bold text-white text-right">{m.away}</span>
              <TeamLogo logo={m.awayLogo} initial={m.awayInitial || m.away.slice(0,3)} color="#1a0608" size="sm" />
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ─── Today's Matches Card — shows all matches today ───────────
function TodaysMatchesCard({ matches }: { matches: DisplayMatch[] }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = matches
    .filter((m) => {
      const isLive = m.status === "LIVE";
      const isToday = m.kickoff?.slice(0, 10) === todayStr || m.date?.includes(todayStr);
      return isLive || isToday;
    })
    .sort((a, b) => {
      // Live first, then by kickoff time, then by league priority
      if (a.status === "LIVE" && b.status !== "LIVE") return -1;
      if (b.status === "LIVE" && a.status !== "LIVE") return 1;
      const pa = LEAGUE_PRIORITY[a.leagueId ?? 0] ?? 99;
      const pb = LEAGUE_PRIORITY[b.leagueId ?? 0] ?? 99;
      return pa - pb;
    })
    .slice(0, 5);

  if (!today.length) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#090d14]/95">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <CalendarDays className="h-3.5 w-3.5 text-white/50" />
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/70">Today's Matches</span>
      </div>
      {today.map((m) => {
        const isLive = m.status === "LIVE";
        const hasScore = typeof m.homeScore === "number" && typeof m.awayScore === "number";
        const time = m.kickoff?.slice(11, 16) || m.time || m.date || "TBC";
        return (
          <div key={m.id} className={`grid grid-cols-[44px_1fr_auto_1fr] items-center gap-2 border-b border-white/6 px-3 py-2.5 last:border-0 ${isLive ? "bg-primary/5" : ""}`}>
            <div className="text-center">
              {isLive ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-primary">
                  <span className="h-1 w-1 rounded-full bg-primary animate-ping" />Live
                </span>
              ) : (
                <span className="text-xs font-bold text-white/50 tabular-nums">{time}</span>
              )}
              <div className="truncate text-[9px] text-white/30 mt-0.5">{m.league?.replace("UEFA ", "").replace(" League", "")}</div>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <TeamLogo logo={m.homeLogo} initial={m.homeInitial || m.home.slice(0,3)} color="#182333" size="sm" />
              <span className="truncate text-sm font-semibold text-white">{m.home}</span>
            </div>
            <div className="px-1 text-center">
              {hasScore ? (
                <span className={`text-sm font-black tabular-nums ${isLive ? "text-primary" : "text-white/70"}`}>{m.homeScore}–{m.awayScore}</span>
              ) : (
                <span className="text-[10px] font-bold text-white/30">vs</span>
              )}
            </div>
            <div className="flex min-w-0 items-center justify-end gap-1.5">
              <span className="truncate text-right text-sm font-semibold text-white">{m.away}</span>
              <TeamLogo logo={m.awayLogo} initial={m.awayInitial || m.away.slice(0,3)} color="#182333" size="sm" />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function MatchStrip({
  match,
  active,
  onClick,
}: {
  match: DisplayMatch;
  active: boolean;
  onClick: () => void;
}) {
  const hasScore = typeof match.homeScore === "number" && typeof match.awayScore === "number";

  return (
    <button
      onClick={onClick}
      className={`grid w-full grid-cols-[52px_1fr_46px] items-center gap-3 border-b border-white/7 px-3 py-2.5 text-left last:border-0 ${
        active ? "bg-primary/12" : "bg-[#0d141e] hover:bg-[#121b28]"
      }`}
    >
      <div>
        <div className={`text-[10px] font-bold uppercase ${match.status === "LIVE" ? "text-primary" : "text-white/45"}`}>
          {match.status}
        </div>
        <div className="mt-1 text-[10px] font-medium text-white/42">{match.time || match.kickoff || match.date || "TBC"}</div>
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo logo={match.homeLogo} initial={match.homeInitial || match.home.slice(0, 3)} color="#182333" size="sm" />
          <span className="truncate text-sm font-semibold text-white">{match.home}</span>
        </div>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <TeamLogo logo={match.awayLogo} initial={match.awayInitial || match.away.slice(0, 3)} color="#182333" size="sm" />
          <span className="truncate text-sm font-medium text-white/70">{match.away}</span>
        </div>
        <div className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.1em] text-white/35">{match.league}</div>
      </div>
      <div className="text-right">
        {hasScore ? (
          <>
            <div className="text-lg font-semibold text-primary">{match.homeScore}</div>
            <div className="text-lg font-semibold text-white">{match.awayScore}</div>
          </>
        ) : (
          <ChevronRight className="ml-auto h-4 w-4 text-white/35" />
        )}
      </div>
    </button>
  );
}

function ScoreboardList({
  matches,
  selectedMatchId,
  onSelect,
  loading,
}: {
  matches: DisplayMatch[];
  selectedMatchId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  if (loading && !matches.length) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-8 text-center">
        <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">Loading matches...</div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-8 text-center">
        <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">No match board loaded yet.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080d14]">
      {matches.map((match) => {
        const active = selectedMatchId === match.id;
        const hasScore = typeof match.homeScore === "number" && typeof match.awayScore === "number";
        const live = match.status === "LIVE";
        return (
          <button
            key={`${match.id}-${match.status}-scoreboard`}
            onClick={() => onSelect(match.id)}
            className={`grid w-full grid-cols-[76px_1fr_48px] items-center gap-3 border-b border-white/7 px-3 py-3 text-left last:border-0 md:grid-cols-[96px_1fr_64px] ${
              active ? "bg-primary/12" : "bg-[#0d141e] hover:bg-[#121b28]"
            }`}
          >
            <div>
              <div className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${live ? "bg-primary/16 text-primary" : "bg-white/7 text-white/52"}`}>
                {match.status}
              </div>
              <div className="mt-2 text-[11px] font-medium text-white/42">{match.time || match.kickoff || match.date || "TBC"}</div>
            </div>

            <div className="min-w-0">
              <div className="mb-2 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-white/32">{match.league}</div>
              <div className="grid gap-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <TeamLogo logo={match.homeLogo} initial={match.homeInitial || match.home.slice(0, 3)} color="#182333" size="sm" />
                  <span className="truncate text-sm font-semibold text-white md:text-base">{match.home}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <TeamLogo logo={match.awayLogo} initial={match.awayInitial || match.away.slice(0, 3)} color="#182333" size="sm" />
                  <span className="truncate text-sm font-medium text-white/72 md:text-base">{match.away}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {hasScore ? (
                <>
                  <div className="text-xl font-semibold text-primary">{match.homeScore}</div>
                  <div className="text-xl font-semibold text-white">{match.awayScore}</div>
                </>
              ) : (
                <ChevronRight className="ml-auto h-5 w-5 text-white/32" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FixtureBoard({
  fixtures,
  leagueName,
  selectedMatchId,
  onSelect,
  loading,
}: {
  fixtures: DisplayMatch[];
  leagueName: string;
  selectedMatchId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  if (loading && !fixtures.length) {
    return <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Loading fixtures...</div>;
  }

  if (!fixtures.length) {
    return <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">No fixtures loaded for {leagueName} yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080d14]">
      {fixtures.slice(0, 8).map((match) => (
        <button
          key={`${match.id}-fixture-board`}
          onClick={() => onSelect(match.id)}
          className={`grid w-full grid-cols-[72px_1fr_28px] items-center gap-2 border-b border-white/7 px-3 py-2.5 text-left last:border-0 ${
            selectedMatchId === match.id ? "bg-primary/12" : "bg-[#0d141e] hover:bg-[#121b28]"
          }`}
        >
          <div>
            <div className="text-[11px] font-semibold text-white/58">{match.time || match.kickoff || "TBC"}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/34">{match.date || match.status}</div>
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <TeamLogo logo={match.homeLogo} initial={match.homeInitial || match.home.slice(0, 3)} color="#182333" size="sm" />
              <span className="truncate text-sm font-semibold text-white">{match.home}</span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <TeamLogo logo={match.awayLogo} initial={match.awayInitial || match.away.slice(0, 3)} color="#182333" size="sm" />
              <span className="truncate text-sm font-medium text-white/70">{match.away}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-white/28" />
        </button>
      ))}
    </div>
  );
}

function StandingsTable({ rows, leagueName, loading }: { rows: StandingEntry[]; leagueName: string; loading: boolean }) {
  if (loading && !rows.length) {
    return <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Loading table...</div>;
  }

  if (!rows.length) {
    return <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">No table loaded for {leagueName} yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080d14]">
      <div className="grid grid-cols-[34px_1fr_34px_34px_44px_44px] border-b border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
        <span>#</span>
        <span>Club</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">GD</span>
        <span className="text-center">Pts</span>
      </div>
      {rows.slice(0, 10).map((row) => (
        <div key={`${leagueName}-${row.rank}-${row.team}`} className="grid grid-cols-[34px_1fr_34px_34px_44px_44px] items-center border-b border-white/6 px-3 py-2 text-sm last:border-0">
          <span className="text-white/42">{row.rank}</span>
          <span className="flex min-w-0 items-center gap-2">
            <img src={row.logo} alt={row.team} className="h-5 w-5 shrink-0 object-contain" />
            <span className="truncate font-medium text-white">{row.team}</span>
          </span>
          <span className="text-center text-white/45">{row.played}</span>
          <span className="text-center text-white/45">{row.won}</span>
          <span className="text-center text-white/45">{row.gd}</span>
          <span className="text-center font-semibold text-primary">{row.points}</span>
        </div>
      ))}
    </div>
  );
}

function MatchRoomCard({
  match,
  stats,
  events,
  lineups,
  teamStats,
  loading,
  onOpenStats,
}: {
  match: DisplayMatch | undefined;
  stats: FixtureStat[];
  events: FixtureEvent[];
  lineups: { home: TeamLineup | null; away: TeamLineup | null };
  teamStats: { home: TeamSeasonStats | null; away: TeamSeasonStats | null };
  loading: boolean;
  onOpenStats: (tab: MatchCenterTab) => void;
}) {
  if (!match) {
    return (
      <section className="rounded-xl border border-white/10 bg-[#090d14]/95 p-5 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">Match Room</h2>
        <p className="mt-3 text-sm text-white/42">Pick a match to open the scoreboard, teams and timeline.</p>
      </section>
    );
  }

  const hasScore = typeof match.homeScore === "number" && typeof match.awayScore === "number";
  const homeForm = teamStats.home
    ? `${teamStats.home.fixtures.wins}W ${teamStats.home.fixtures.draws}D ${teamStats.home.fixtures.losses}L`
    : "Season form pending";
  const awayForm = teamStats.away
    ? `${teamStats.away.fixtures.wins}W ${teamStats.away.fixtures.draws}D ${teamStats.away.fixtures.losses}L`
    : "Season form pending";

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#090d14]/95">
      <div className="border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">Match Room</h2>
            <p className="mt-0.5 truncate text-[11px] text-white/42">{match.league}</p>
          </div>
          <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase ${match.status === "LIVE" ? "bg-primary/16 text-primary" : "bg-white/8 text-white/55"}`}>
            {match.status}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="min-w-0 text-center">
              <TeamLogo logo={match.homeLogo} initial={match.homeInitial || match.home.slice(0, 3)} color="#182333" size="lg" className="mx-auto mb-2" />
              <div className="truncate text-sm font-semibold text-white">{match.home}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/35">{homeForm}</div>
            </div>
            <div className="text-center">
              {hasScore ? (
                <div className="text-3xl font-semibold text-white">
                  <span className="text-primary">{match.homeScore}</span>
                  <span className="mx-2 text-white/28">-</span>
                  <span>{match.awayScore}</span>
                </div>
              ) : (
                <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/42">VS</div>
              )}
              <div className="mt-2 text-[11px] font-medium text-white/42">{match.time || match.kickoff || match.date || "Kickoff TBC"}</div>
            </div>
            <div className="min-w-0 text-center">
              <TeamLogo logo={match.awayLogo} initial={match.awayInitial || match.away.slice(0, 3)} color="#182333" size="lg" className="mx-auto mb-2" />
              <div className="truncate text-sm font-semibold text-white">{match.away}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/35">{awayForm}</div>
            </div>
          </div>
        </div>

        {/* Only show stats/events/lineups buttons when there's actual data */}
        {(stats.length > 0 || events.length > 0 || lineups.home || lineups.away) && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button onClick={() => onOpenStats("match")} className="rounded-lg border border-white/8 bg-white/[0.03] p-3 text-left hover:border-primary/40">
              <div className="text-lg font-semibold text-white">{loading ? "..." : stats.length}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">Stats</div>
            </button>
            <button onClick={() => onOpenStats("lineups")} className="rounded-lg border border-white/8 bg-white/[0.03] p-3 text-left hover:border-primary/40">
              <div className="text-lg font-semibold text-white">{loading ? "..." : events.length}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">Events</div>
            </button>
            <button onClick={() => onOpenStats("season")} className="rounded-lg border border-white/8 bg-white/[0.03] p-3 text-left hover:border-primary/40">
              <div className="text-lg font-semibold text-white">{lineups.home || lineups.away ? "XI" : "-"}</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">Lineups</div>
            </button>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {events.slice(0, 3).map((event, index) => (
            <div key={`${event.min}-${event.player}-${index}-room`} className="flex items-center gap-3 rounded-lg bg-black/24 px-3 py-2">
              <span className="text-xs font-semibold text-primary">{event.min}'</span>
              <span className="min-w-0 truncate text-xs font-medium text-white/72">{event.player || event.detail || event.type}</span>
            </div>
          ))}
          {!events.length ? (
            <div className="rounded-lg bg-black/24 px-3 py-3 text-xs font-medium text-white/38">
              Timeline opens when goals, cards and substitutions arrive.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StandingMiniRow({ row }: { row: StandingEntry }) {
  return (
    <div className="grid grid-cols-[28px_1fr_40px_40px] items-center border-b border-white/6 px-3 py-2 text-sm last:border-0">
      <span className="text-white/42">{row.rank}</span>
      <span className="flex min-w-0 items-center gap-2">
        <img src={row.logo} alt={row.team} className="h-5 w-5 shrink-0 object-contain" />
        <span className="truncate font-medium text-white">{row.team}</span>
      </span>
      <span className="text-center text-white/45">{row.played}</span>
      <span className="text-center font-semibold text-primary">{row.points}</span>
    </div>
  );
}

function StatBar({ stat }: { stat: FixtureStat }) {
  const total = Math.max(stat.home + stat.away, 1);
  const homeWidth = Math.round((stat.home / total) * 100);
  const awayWidth = 100 - homeWidth;
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-white">{stat.home}{stat.unit || ""}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{stat.label}</span>
        <span className="font-semibold text-white">{stat.away}{stat.unit || ""}</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/8">
        <div className="bg-primary" style={{ width: `${homeWidth}%` }} />
        <div className="bg-blue-400" style={{ width: `${awayWidth}%` }} />
      </div>
    </div>
  );
}

function EventFeed({ events }: { events: FixtureEvent[] }) {
  if (!events.length) {
    return <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Events appear here when the match opens up.</div>;
  }

  return (
    <div className="space-y-2">
      {events.slice(0, 12).map((event, index) => (
        <div key={`${event.min}-${event.player}-${index}`} className="grid grid-cols-[42px_1fr] gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
          <div className="text-sm font-semibold text-primary">{event.min}'</div>
          <div>
            <div className="text-sm font-semibold text-white">{event.player || event.detail || event.type}</div>
            <div className="text-[11px] uppercase tracking-[0.1em] text-white/38">{event.type}{event.assist ? ` | ${event.assist}` : ""}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LineupBlock({ title, lineup }: { title: string; lineup: TeamLineup | null }) {
  if (!lineup) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{title}</h3>
        <p className="mt-3 text-sm text-white/42">Lineup not released yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{title}</h3>
        <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-semibold text-white/50">{lineup.formation}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {lineup.players.slice(0, 11).map((player) => (
          <div key={`${title}-${player.number}-${player.name}`} className="rounded-lg bg-black/24 px-2 py-2">
            <div className="truncate text-xs font-semibold text-white">{player.number}. {player.name}</div>
            <div className="text-[10px] uppercase tracking-[0.1em] text-white/35">{player.pos}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSeasonCard({ stats }: { stats: TeamSeasonStats | null }) {
  if (!stats) {
    return <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Season card loading...</div>;
  }

  const items = [
    ["Played", stats.fixtures.played],
    ["Wins", stats.fixtures.wins],
    ["Draws", stats.fixtures.draws],
    ["Losses", stats.fixtures.losses],
    ["Goals For", stats.goals.for],
    ["Goals Against", stats.goals.against],
    ["Clean Sheets", stats.cleanSheets.total],
    ["Failed to Score", stats.failedToScore.total],
  ];

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center gap-3">
        <img src={stats.logo} alt={stats.team} className="h-10 w-10 object-contain" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{stats.team}</h3>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/38">{stats.league}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-black/24 p-2">
            <div className="text-lg font-semibold text-white">{value}</div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorldCupRow({ match }: { match: DisplayMatch }) {
  return (
    <Link
      href="/world-cup-2026"
      className="grid grid-cols-[66px_1fr_62px_1fr] items-center gap-2 border-b border-[#ffd700]/10 px-3 py-2.5 last:border-0 hover:bg-[#ffd700]/8"
    >
      <div className="text-[10px] font-semibold uppercase leading-tight text-white/45">{match.date}</div>
      <div className="flex min-w-0 items-center gap-2">
        <TeamLogo logo={match.homeLogo} initial={match.home.slice(0, 3)} color="#172033" size="sm" />
        <span className="truncate text-sm font-semibold text-white">{match.home}</span>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-white">{match.time}</div>
        <div className="text-[9px] font-bold uppercase text-[#ffd700]">{match.status}</div>
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className="truncate text-right text-sm font-semibold text-white">{match.away}</span>
        <TeamLogo logo={match.awayLogo} initial={match.away.slice(0, 3)} color="#172033" size="sm" />
      </div>
    </Link>
  );
}

// ─── League priority for featured match ordering ─────────────
const LEAGUE_PRIORITY: Record<number, number> = {
  2: 1,   // UEFA Champions League
  3: 2,   // UEFA Europa League
  39: 3,  // Premier League
  140: 4, // La Liga
  135: 5, // Serie A
  78: 6,  // Bundesliga
  61: 7,  // Ligue 1
  12: 8,  // CAF Champions League
};


// ─── Visibility Control Hook ─────────────────────────────────
// Stagger section visibility during initial load for better UX
function useDelayedVisibility(condition: boolean, delayMs: number): boolean {
  const [show, setShow] = useState(!condition);
  useEffect(() => {
    if (!condition) { setShow(true); return; }
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [condition, delayMs]);
  return show;
}

// ─── WC26 Hero ───────────────────────────────────────────────
const WC26_START = new Date("2026-06-11T17:00:00Z"); // 8pm EAT
const WC26_END   = new Date("2026-07-20T00:00:00Z");

function getWC26Countdown() {
  const diff = WC26_START.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:  Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins:  Math.floor((diff % 3600000) / 60000),
    secs:  Math.floor((diff % 60000) / 1000),
  };
}

function CountBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        key={value}
        className="relative overflow-hidden rounded-xl border border-[#FFD700]/25 bg-black/55 px-3 py-2.5 min-w-[58px] text-center shadow-[inset_0_1px_0_rgba(255,214,0,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
      >
        <span className="block text-3xl font-black tabular-nums leading-none text-white md:text-5xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#FFD700]/65">{label}</span>
    </div>
  );
}

function WC26HeroBanner() {
  const now = Date.now();
  const isOver = now > WC26_END.getTime();
  const isActive = now >= WC26_START.getTime();
  const [cd, setCd] = useState(getWC26Countdown());

  useEffect(() => {
    if (isActive || isOver) return;
    const tick = setInterval(() => setCd(getWC26Countdown()), 1000);
    return () => clearInterval(tick);
  }, [isActive, isOver]);

  if (isOver) return null;

  return (
    <section className="relative mb-4 overflow-hidden rounded-2xl border border-[#FFD700]/18">
      {/* ── Gemini Imagen 3 generated hero ── */}
      <div className="absolute inset-0">
        <img
          src="/wc26-hero.jpg"
          alt=""
          className="h-full w-full object-cover object-center"
        />
        {/* Cinematic grade: darken edges, lift the gold centre, deepen bottom for text */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_20%,rgba(3,7,16,0.55)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#05070b]" />
        {/* Live pulse overlay */}
        {isActive && (
          <div className="absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_at_50%_50%,rgba(179,0,0,0.06),transparent_70%)]" />
        )}
        {/* Top gold shimmer */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />
        {/* Host nation strip */}
        <div className="absolute bottom-0 left-0 right-0 flex h-[3px]">
          <div className="flex-1 bg-[#3C3B6E]" />
          <div className="flex-1 bg-white/30" />
          <div className="flex-1 bg-[#B22234]" />
          <div className="flex-1 bg-[#B22234]" />
          <div className="flex-1 bg-white/30" />
          <div className="flex-1 bg-[#B22234]" />
          <div className="flex-1 bg-[#006847]" />
          <div className="flex-1 bg-white/30" />
          <div className="flex-1 bg-[#CE1126]" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-8 text-center md:py-12">
        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 px-4 py-1.5 backdrop-blur-sm">
          {isActive && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
          <Trophy className="h-3.5 w-3.5 text-[#FFD700]" />
          <span className="text-[10px] font-black uppercase tracking-[0.26em] text-[#FFD700]">
            {isActive ? "World Cup 2026 — Underway" : "FIFA World Cup 2026 · USA · Canada · Mexico"}
          </span>
          <Trophy className="h-3.5 w-3.5 text-[#FFD700]" />
        </div>

        {/* Headline — 3D extruded gold */}
        <h2
          className="mb-3 max-w-3xl text-5xl font-black italic leading-[0.88] tracking-tight md:text-7xl lg:text-8xl"
          style={{
            color: "#FFE033",
            WebkitTextStroke: "1.5px #C47200",
            textShadow: [
              "0 -1px 0 #FFF9C4",       // bright top-edge highlight
              "1px  1px 0 #EAA800",     // extrusion step 1
              "2px  2px 0 #D09000",     // step 2
              "3px  3px 0 #B87800",     // step 3
              "4px  4px 0 #A06200",     // step 4
              "5px  5px 0 #884E00",     // step 5
              "6px  6px 0 #703C00",     // step 6
              "7px  7px 0 #582A00",     // step 7
              "8px  8px 0 #401A00",     // step 8
              "9px  9px 16px rgba(0,0,0,0.95)", // deep black base shadow
              "0 0 50px rgba(255,215,0,0.35)",  // golden halo glow
            ].join(", "),
            filter: "drop-shadow(0 6px 24px rgba(255,180,0,0.5))",
          }}
        >
          {isActive ? (
            <>THE WORLD CUP<br />IS LIVE</>
          ) : (
            <>THE BIGGEST<br />WORLD CUP EVER</>
          )}
        </h2>
        <p className="mb-7 rounded-full border border-white/20 bg-black/65 px-5 py-2 text-sm font-bold text-white backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.7)] md:text-base">
          48 nations · 104 matches · {isActive ? "Running until Jul 19 · All times EAT" : "Jun 11 – Jul 19 · All times EAT"}
        </p>

        {/* Countdown */}
        {cd && (
          <div className="mb-8 flex items-end gap-2 md:gap-4">
            <CountBlock value={cd.days}  label="Days" />
            <span className="mb-7 text-2xl font-black text-[#FFD700]/50 md:text-4xl">:</span>
            <CountBlock value={cd.hours} label="Hours" />
            <span className="mb-7 text-2xl font-black text-[#FFD700]/50 md:text-4xl">:</span>
            <CountBlock value={cd.mins}  label="Min" />
            <span className="mb-7 text-2xl font-black text-[#FFD700]/50 md:text-4xl">:</span>
            <CountBlock value={cd.secs}  label="Sec" />
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/predictions"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-5 py-3 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[0_0_28px_rgba(255,214,0,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,214,0,0.7)] active:scale-95"
          >
            {isActive ? "Call the Scoreline" : "Make Your Group Stage Call"}
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/world-cup-2026"
            className="inline-flex items-center gap-2 rounded-xl border border-[#FFD700]/35 bg-black/40 px-5 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#FFD700] backdrop-blur-sm transition-all hover:border-[#FFD700]/70 hover:bg-[#FFD700]/10"
          >
            {isActive ? "Live Groups & Scores" : "Groups & Fixtures"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [live, setLive] = useState<LiveMatch[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  // Standings keyed by league ID — all leagues fetched upfront
  const [allStandings, setAllStandings] = useState<Record<number, StandingEntry[]>>({});
  const [worldCup, setWorldCup] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeLeagueId, setActiveLeagueId] = useState(DATA_LEAGUES[0].id);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MatchCenterTab>("scores");
  const [fixtureStats, setFixtureStats] = useState<FixtureStat[]>([]);
  const [fixtureEvents, setFixtureEvents] = useState<FixtureEvent[]>([]);
  const [fixtureLineups, setFixtureLineups] = useState<{ home: TeamLineup | null; away: TeamLineup | null }>({ home: null, away: null });
  const [teamStats, setTeamStats] = useState<{ home: TeamSeasonStats | null; away: TeamSeasonStats | null }>({ home: null, away: null });
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Derived: standings for currently selected league
  const standings = allStandings[activeLeagueId] || [];
  // EPL standings for sidebar snapshot (always EPL)
  const eplStandings = allStandings[39] || [];

  // ─── Staggered visibility for sidebars during loading ────────────────────────
  const showLeftSidebar = useDelayedVisibility(loading && !live.length && !worldCup.length, 1500);
  const showRightSidebar = useDelayedVisibility(loading && Object.keys(allStandings).length === 0, 3000);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        // Fetch standings for ALL DATA_LEAGUES in parallel — no more "empty" on switch
        const standingsResults = await Promise.all(
          DATA_LEAGUES.map((league) => fetchStandings(league.id))
        );
        const standingsMap: Record<number, StandingEntry[]> = {};
        DATA_LEAGUES.forEach((league, idx) => {
          if (Array.isArray(standingsResults[idx]) && standingsResults[idx].length > 0) {
            standingsMap[league.id] = standingsResults[idx];
          }
        });

        const [liveData, recentData, upcomingData, wcData] = await Promise.all([
          fetchLiveMatches(),
          fetchRecentMatches(),
          fetchUpcomingFixtures(),
          fetchLeagueFixtures(1, 2026, 8),
        ]);
        if (!mounted) return;
        setLive(Array.isArray(liveData) ? liveData.slice(0, 10) : []);
        setRecent(Array.isArray(recentData) ? recentData.slice(0, 8) : []);
        setUpcoming(Array.isArray(upcomingData) ? upcomingData.slice(0, 14) : []);
        setAllStandings(standingsMap);
        setWorldCup(Array.isArray(wcData) ? wcData.slice(0, 4) : []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Live Hub fetch failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
    const timer = window.setInterval(run, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const matches: DisplayMatch[] = useMemo(() => {
    const liveRows = live.map((m) => ({ ...m, status: normalizeMatchStatus(m.status || "LIVE") }));
    const resultRows = recent.map((m: any) => ({ ...m, status: "FT" }));
    const fixtureRows = upcoming.map((m: any) => ({ ...m, status: "NS" }));
    return [...liveRows, ...resultRows, ...fixtureRows].slice(0, 12);
  }, [live, recent, upcoming]);

  useEffect(() => {
    if (!selectedMatchId && matches.length) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches, selectedMatchId]);

  const selectedMatch = matches.find((match) => match.id === selectedMatchId) || matches[0];
  const activeLeague = DATA_LEAGUES.find((league) => league.id === activeLeagueId) || DATA_LEAGUES[0];
  const activeLeagueFixtures: DisplayMatch[] = useMemo(
    () => upcoming.filter((match: any) => match.leagueId === activeLeague.id || match.league === activeLeague.name).slice(0, 8),
    [upcoming, activeLeague.id, activeLeague.name],
  );
  // Only use real World Cup data — never fallback to fake matches
  const wcMatches: DisplayMatch[] = (worldCup.length > 0 ? worldCup : []).slice(0, 3);
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const timeLabel = today.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true });
  const matchroomLabel = useMemo(() => {
    if (!lastUpdated) return "Matchroom is warming up";
    const mins = Math.max(0, Math.floor((Date.now() - lastUpdated.getTime()) / 60000));
    return mins <= 0 ? "Matchroom refreshed now" : `Matchroom refreshed ${mins} min ago`;
  }, [lastUpdated]);

  useEffect(() => {
    if (!selectedMatch?.id) return;
    let mounted = true;
    const run = async () => {
      setDetailsLoading(true);
      try {
        const leagueId = selectedMatch.leagueId || activeLeague.id;
        const [stats, events, lineups, homeSeason, awaySeason] = await Promise.all([
          fetchFixtureStats(selectedMatch.id),
          fetchFixtureEvents(selectedMatch.id),
          fetchFixtureLineups(selectedMatch.id),
          selectedMatch.homeTeamId ? fetchTeamSeasonStats(selectedMatch.homeTeamId, leagueId, activeLeague.season) : Promise.resolve(null),
          selectedMatch.awayTeamId ? fetchTeamSeasonStats(selectedMatch.awayTeamId, leagueId, activeLeague.season) : Promise.resolve(null),
        ]);
        if (!mounted) return;
        setFixtureStats(stats);
        setFixtureEvents(events);
        setFixtureLineups(lineups);
        setTeamStats({ home: homeSeason, away: awaySeason });
      } catch (error) {
        console.error("Match room details failed:", error);
        if (mounted) {
          setFixtureStats([]);
          setFixtureEvents([]);
          setFixtureLineups({ home: null, away: null });
          setTeamStats({ home: null, away: null });
        }
      } finally {
        if (mounted) setDetailsLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [selectedMatch?.id, selectedMatch?.homeTeamId, selectedMatch?.awayTeamId, selectedMatch?.leagueId, activeLeague.id, activeLeague.season]);

  return (
    <div className="min-h-screen bg-[#05070b] pb-24 text-white">
      <SEO
        title="BallMtaani Live Hub | Football Match Center Kenya"
        description="BallMtaani Live Hub is a dark-mode football data center for Kenyan fans with live scores, fixtures, standings, match details, World Cup 2026 and fan intelligence routes."
        keywords={[
          "BallMtaani Live Hub",
          "football match center Kenya",
          "API-Football live scores",
          "football widgets",
          "Premier League standings Kenya",
          "World Cup 2026 tracker",
        ]}
        path="/"
        breadcrumbs={[{ name: "BallMtaani Live Hub", url: "/" }]}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            "name": "BallMtaani Live Hub",
            "sport": "Football",
            "url": "https://ballmtaani.com/",
            "areaServed": "Kenya",
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "BallMtaani match center modules",
            "itemListElement": FEATURE_LINKS.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "url": `https://ballmtaani.com${item.href}`,
            })),
          },
        ]}
      />

      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2000&q=85"
          alt=""
          className={`h-full w-full object-cover transition-opacity duration-1000 ${live.length > 0 ? "opacity-40" : "opacity-28"}`}
        />
        <div className={`absolute inset-0 transition-all duration-1000 ${live.length > 0 ? "bg-[radial-gradient(circle_at_78%_10%,rgba(239,35,48,0.65),transparent_22%),radial-gradient(circle_at_18%_15%,rgba(30,111,255,0.3),transparent_24%),linear-gradient(180deg,rgba(5,7,11,0.48),#05070b_46%,#05070b)]" : "bg-[radial-gradient(circle_at_78%_10%,rgba(239,35,48,0.5),transparent_22%),radial-gradient(circle_at_18%_15%,rgba(30,111,255,0.3),transparent_24%),linear-gradient(180deg,rgba(5,7,11,0.56),#05070b_46%,#05070b)]"}`} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />
        {live.length > 0 && (
          <div className="absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_at_50%_0%,rgba(179,0,0,0.12),transparent_60%)]" />
        )}
      </div>

      <main className="relative z-10 mx-auto max-w-[1480px] px-3 py-3 md:px-5 md:py-5">
        <WC26HeroBanner />

        <header className={`mb-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 backdrop-blur-xl transition-all duration-700 ${live.length > 0 ? "border-primary/30 bg-black/50 shadow-[0_0_30px_rgba(179,0,0,0.15)]" : "border-white/10 bg-black/38"}`}>
          <div className="flex items-center gap-2">
            <Link href="/home" aria-label="Open home" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 hover:text-white">
              <Home className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold italic tracking-tight md:text-3xl">
                  BallMtaani <span className="text-primary">Live Hub</span>
                </h1>
                {live.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary shadow-[0_0_12px_rgba(179,0,0,0.4)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    {live.length} Live
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/48">
                <span>Football match center</span>
                <span>|</span>
                <span>{today.toLocaleDateString("en-KE", { weekday: "long", day: "2-digit", month: "short" })}</span>
                <span>|</span>
                <span>{timeLabel} EAT</span>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <DataFreshnessChip label={matchroomLabel} />
            <Link href="/matches" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Full Match Desk <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <button aria-label="Alerts" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
        </header>

        {/* Data-first match cards — only render when real data exists */}
        <div className="mb-3 grid gap-3 lg:grid-cols-2">
          <LiveNowCard matches={matches} />
          <TodaysMatchesCard matches={matches} />
        </div>

        <div className="grid gap-3 lg:grid-cols-[330px_minmax(0,1fr)_360px]">
          {showLeftSidebar && (
            <aside className={`space-y-3 transition-all duration-300 ${live.length > 0 || worldCup.length > 0 ? 'opacity-100' : 'opacity-75'}`}>
              <section className={`overflow-hidden rounded-xl border bg-[#090d14]/95 transition-all duration-700 ${live.length > 0 ? "border-primary/30 shadow-[0_0_20px_rgba(179,0,0,0.12)]" : "border-white/10"}`}>
              <div className={`flex items-center justify-between border-b px-3 py-2.5 transition-colors duration-700 ${live.length > 0 ? "border-primary/20" : "border-white/10"}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">Match Queue</h2>
                    {live.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.14em] text-primary">
                        <span className="h-1 w-1 rounded-full bg-primary animate-ping" />
                        {live.length} live
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-white/42">Live, finished and upcoming</p>
                </div>
                <Search className="h-4 w-4 text-white/35" />
              </div>
              <div className="max-h-[540px] overflow-y-auto">
                {loading && !matches.length ? (
                  <div className="px-4 py-8 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Loading the match list...</div>
                ) : matches.length ? (
                  matches.map((match) => (
                    <MatchStrip
                      key={`${match.id}-${match.status}`}
                      match={match}
                      active={selectedMatch?.id === match.id}
                      onClick={() => setSelectedMatchId(match.id)}
                    />
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">No matches loaded yet.</div>
                )}
              </div>
            </section>

            {wcMatches.length > 0 ? (
              <section className="overflow-hidden rounded-xl border border-[#ffd700]/20 bg-[#111006]/92">
                <div className="flex items-center justify-between border-b border-[#ffd700]/12 px-3 py-2.5">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">WC26 Watch</h2>
                    <p className="text-[11px] text-[#ffd700]/65">World Cup route</p>
                  </div>
                  <Link href="/world-cup-2026" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ffd700]">
                    Guide
                  </Link>
                </div>
                <div>{wcMatches.map((match) => <WorldCupRow key={match.id} match={match} />)}</div>
              </section>
            ) : null}
            </aside>
          )}

          <section className="space-y-3">
            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#090d14]/95">
              <div className="border-b border-white/10 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold uppercase tracking-[0.08em] text-white">Match Center</h2>
                    <p className="mt-1 text-sm text-white/46">
                      Scores, tables, match stats, events, lineups and season form in one place.
                    </p>
                  </div>
                  {selectedMatch ? (
                    <div className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-right">
                      <div className="text-xs font-semibold uppercase text-primary">{selectedMatch.status}</div>
                      <div className="text-sm font-semibold text-white">{selectedMatch.home} vs {selectedMatch.away}</div>
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {CENTER_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
                          active ? "border-primary bg-primary/16 text-white" : "border-white/10 bg-white/[0.03] text-white/48 hover:text-white"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3">
                {activeTab === "scores" ? (
                  <ScoreboardList
                    matches={matches}
                    selectedMatchId={selectedMatchId}
                    onSelect={setSelectedMatchId}
                    loading={loading}
                  />
                ) : null}

                {activeTab === "table" ? (
                  <div className="space-y-3">
                    {/* League Selector — inline inside Tables tab */}
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {DATA_LEAGUES.map((league) => (
                        <button
                          key={league.id}
                          onClick={() => setActiveLeagueId(league.id)}
                          className={`rounded-lg border px-2 py-2 text-left transition-colors ${
                            activeLeagueId === league.id
                              ? "border-primary bg-primary/14 text-white"
                              : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-semibold uppercase truncate">{league.short}</div>
                          <div className="mt-0.5 truncate text-[10px] text-white/38 hidden sm:block">{league.name}</div>
                        </button>
                      ))}
                    </div>
                    {/* Fixtures + Standings for selected league */}
                    <div className="grid gap-3 lg:grid-cols-2">
                      <section className="rounded-xl border border-white/10 bg-[#090d14] p-3">
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{activeLeague.short} Fixtures</h3>
                          <p className="mt-1 text-[11px] text-white/44">{activeLeague.name}: today, next up and recent games.</p>
                        </div>
                        <FixtureBoard
                          fixtures={activeLeagueFixtures}
                          leagueName={activeLeague.name}
                          selectedMatchId={selectedMatchId}
                          onSelect={setSelectedMatchId}
                          loading={loading}
                        />
                      </section>
                      <section className="rounded-xl border border-white/10 bg-[#090d14] p-3">
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">{activeLeague.short} Standings</h3>
                          <p className="mt-1 text-[11px] text-white/44">Table position, form, points and goal difference.</p>
                        </div>
                        <StandingsTable rows={standings} leagueName={activeLeague.name} loading={loading} />
                      </section>
                    </div>
                  </div>
                ) : null}

                {activeTab === "match" ? (
                  <div className="space-y-3">
                    {!selectedMatch ? (
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Pick a match from the queue to open the numbers.</div>
                    ) : detailsLoading ? (
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Opening the match book...</div>
                    ) : fixtureStats.length ? (
                      <div className="grid gap-2">
                        {fixtureStats.map((stat) => <StatBar key={stat.label} stat={stat} />)}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Advanced match stats will appear when the feed has them.</div>
                    )}
                  </div>
                ) : null}

                {activeTab === "lineups" ? (
                  !selectedMatch ? (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Pick a match to see events and lineups.</div>
                  ) : (
                    <div className="grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
                      <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-white">Match Events</h3>
                        <EventFeed events={fixtureEvents} />
                      </div>
                      <div className="grid gap-3 lg:grid-cols-2">
                        <LineupBlock title={selectedMatch?.home || "Home"} lineup={fixtureLineups.home} />
                        <LineupBlock title={selectedMatch?.away || "Away"} lineup={fixtureLineups.away} />
                      </div>
                    </div>
                  )
                ) : null}

                {activeTab === "season" ? (
                  !selectedMatch ? (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/38">Pick a match to compare team season form.</div>
                  ) : (
                    <div className="grid gap-3 lg:grid-cols-2">
                      <TeamSeasonCard stats={teamStats.home} />
                      <TeamSeasonCard stats={teamStats.away} />
                    </div>
                  )
                ) : null}
              </div>
            </section>
          </section>

          {showRightSidebar && (
            <aside className={`space-y-3 transition-all duration-300 ${eplStandings.length > 0 ? 'opacity-100' : 'opacity-75'}`}>
            {/* KPL standings hidden — API-Football returns incorrect (Czech) data for league 686 */}
            {/* TODO: Fix KPL league ID mapping with API-Football or use alternate data source */}

            {eplStandings.length > 0 && (
              <section className="overflow-hidden rounded-xl border border-white/10 bg-[#090d14]/95">
                <div className="border-b border-white/10 px-3 py-2.5">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">Premier League Snapshot</h2>
                  <p className="mt-0.5 text-[11px] text-white/42">Title race, form and points at a glance</p>
                </div>
                {eplStandings.slice(0, 6).map((row) => <StandingMiniRow key={row.team} row={row} />)}
              </section>
            )}

              <MatchRoomCard
                match={selectedMatch}
                stats={fixtureStats}
                events={fixtureEvents}
                lineups={fixtureLineups}
                teamStats={teamStats}
                loading={detailsLoading}
                onOpenStats={setActiveTab}
              />
            </aside>
          )}
        </div>

        <section className="mt-4">
          <div className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Your matchday tools
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
            {FEATURE_LINKS.map((item, idx) => {
              const Icon = item.icon;
              // WC26 gets gold treatment; first item (Data Center) gets a subtle blue; rest are standard
              const isWC = item.href === "/world-cup-2026";
              const isPrimary = idx === 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                    isWC
                      ? "border-[#FFD700]/30 bg-[#111006]/92 hover:border-[#FFD700]/70 hover:shadow-[#FFD700]/15"
                      : isPrimary
                      ? "border-primary/25 bg-[#0f0a0a]/92 hover:border-primary/55 hover:shadow-primary/15"
                      : "border-white/10 bg-[#0b1119]/92 hover:border-primary/45 hover:shadow-primary/10"
                  }`}
                >
                  {/* glow spot */}
                  <div className={`absolute -right-4 -top-4 h-12 w-12 rounded-full blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${isWC ? "bg-[#FFD700]/20" : "bg-primary/20"}`} />
                  <Icon className={`relative mb-2.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isWC ? "text-[#FFD700]" : "text-primary"}`} />
                  <div className="relative text-xs font-bold uppercase tracking-[0.06em] text-white">{item.label}</div>
                  <div className="relative mt-0.5 text-[11px] leading-4 text-white/40 group-hover:text-white/60 transition-colors">{item.sub}</div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto max-w-[1480px] px-3 pb-6 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-white/38 md:px-5">
        <div>BallMtaani match center for fans who want the full picture.</div>
        <div className="mt-3">
          <OddspediaCredit />
        </div>
      </footer>
    </div>
  );
}
