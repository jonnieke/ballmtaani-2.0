import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Clock3,
  Radio,
  RotateCw,
  Search,
  Table2,
  Trophy,
  X,
} from "lucide-react";
import { useMatches, useRecentMatches, useUpcomingFixtures, useStandings, useFixtureDetail } from "../hooks/useData";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";
import DataFreshnessChip from "../components/DataFreshnessChip";
import { formatFreshnessLabel } from "../lib/freshness";
import type { TournamentStandingEntry } from "../lib/football-api";
import AfricanFootballWidget from "../components/AfricanFootballWidget";

type HubView = "all" | "live" | "results" | "fixtures" | "africa" | "tables";

// ── League logo registry ──────────────────────────────────────────────────────
const LEAGUE_LOGOS: Record<string, string> = {
  "Premier League":       "https://media.api-sports.io/football/leagues/39.png",
  "La Liga":              "https://media.api-sports.io/football/leagues/140.png",
  "Serie A":              "https://media.api-sports.io/football/leagues/135.png",
  "Bundesliga":           "https://media.api-sports.io/football/leagues/78.png",
  "Ligue 1":              "https://media.api-sports.io/football/leagues/61.png",
  "UEFA Champions League":"https://media.api-sports.io/football/leagues/2.png",
  "Champions League":     "https://media.api-sports.io/football/leagues/2.png",
  "UEFA Europa League":   "https://media.api-sports.io/football/leagues/3.png",
  "Europa League":        "https://media.api-sports.io/football/leagues/3.png",
  "World Cup 2026":       "https://media.api-sports.io/football/leagues/1.png",
  "FIFA World Cup":       "https://media.api-sports.io/football/leagues/1.png",
  "AFCON":                "https://media.api-sports.io/football/leagues/12.png",
  "Africa Cup of Nations":"https://media.api-sports.io/football/leagues/12.png",
  "CAF Champions League": "https://media.api-sports.io/football/leagues/20.png",
  "KPL":                  "https://media.api-sports.io/football/leagues/357.png",
  "Kenyan Premier League":"https://media.api-sports.io/football/leagues/357.png",
};

// ── Fallback fixture data ─────────────────────────────────────────────────────
const WC26_OPENING_FIXTURES = [
  { home: "Mexico",    away: "South Africa", date: "Jun 11", time: "22:00", kickoff: "22:00", league: "World Cup 2026", id: "wc26-1" },
  { home: "USA",       away: "Colombia",     date: "Jun 12", time: "01:00", kickoff: "01:00", league: "World Cup 2026", id: "wc26-2" },
  { home: "Canada",    away: "Venezuela",    date: "Jun 12", time: "16:00", kickoff: "16:00", league: "World Cup 2026", id: "wc26-3" },
  { home: "Brazil",    away: "Germany",      date: "Jun 13", time: "19:00", kickoff: "19:00", league: "World Cup 2026", id: "wc26-4" },
  { home: "Argentina", away: "Morocco",      date: "Jun 14", time: "22:00", kickoff: "22:00", league: "World Cup 2026", id: "wc26-5" },
  { home: "France",    away: "England",      date: "Jun 14", time: "01:00", kickoff: "01:00", league: "World Cup 2026", id: "wc26-6" },
];

const WC26_GROUPS: Record<string, TournamentStandingEntry[]> = {
  "Group A": [
    { rank: 1, team: "Mexico",       logo: "https://media.api-sports.io/flags/mx.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 2, team: "South Africa", logo: "https://media.api-sports.io/flags/za.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 3, team: "USA",          logo: "https://media.api-sports.io/flags/us.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 4, team: "Colombia",     logo: "https://media.api-sports.io/flags/co.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
  ],
  "Group B": [
    { rank: 1, team: "Canada",     logo: "https://media.api-sports.io/flags/ca.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 2, team: "Venezuela",  logo: "https://media.api-sports.io/flags/ve.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 3, team: "Spain",      logo: "https://media.api-sports.io/flags/es.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 4, team: "Costa Rica", logo: "https://media.api-sports.io/flags/cr.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
  ],
  "Group C": [
    { rank: 1, team: "Brazil",  logo: "https://media.api-sports.io/flags/br.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 2, team: "Germany", logo: "https://media.api-sports.io/flags/de.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 3, team: "Japan",   logo: "https://media.api-sports.io/flags/jp.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 4, team: "Morocco", logo: "https://media.api-sports.io/flags/ma.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
  ],
  "Group D": [
    { rank: 1, team: "Argentina", logo: "https://media.api-sports.io/flags/ar.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 2, team: "Uruguay",   logo: "https://media.api-sports.io/flags/uy.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 3, team: "Paraguay",  logo: "https://media.api-sports.io/flags/py.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 4, team: "Egypt",     logo: "https://media.api-sports.io/flags/eg.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
  ],
  "Group E": [
    { rank: 1, team: "France",   logo: "https://media.api-sports.io/flags/fr.svg",     points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 2, team: "England",  logo: "https://media.api-sports.io/flags/gb-eng.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 3, team: "Belgium",  logo: "https://media.api-sports.io/flags/be.svg",     points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 4, team: "Slovakia", logo: "https://media.api-sports.io/flags/sk.svg",     points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
  ],
  "Group F": [
    { rank: 1, team: "Netherlands", logo: "https://media.api-sports.io/flags/nl.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 2, team: "Sweden",      logo: "https://media.api-sports.io/flags/se.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 3, team: "Austria",     logo: "https://media.api-sports.io/flags/at.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 4, team: "Cameroon",    logo: "https://media.api-sports.io/flags/cm.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
  ],
  "Group G": [
    { rank: 1, team: "Spain",   logo: "https://media.api-sports.io/flags/es.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 2, team: "Italy",   logo: "https://media.api-sports.io/flags/it.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 3, team: "Denmark", logo: "https://media.api-sports.io/flags/dk.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 4, team: "Serbia",  logo: "https://media.api-sports.io/flags/rs.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
  ],
  "Group H": [
    { rank: 1, team: "Portugal",       logo: "https://media.api-sports.io/flags/pt.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 2, team: "Poland",         logo: "https://media.api-sports.io/flags/pl.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 3, team: "Czech Republic", logo: "https://media.api-sports.io/flags/cz.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 4, team: "Senegal",        logo: "https://media.api-sports.io/flags/sn.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
  ],
};

function groupByLeague(matches: any[]): [string, any[]][] {
  const map: Record<string, any[]> = {};
  for (const m of matches) {
    const key = m.league || "Other";
    if (!map[key]) map[key] = [];
    map[key].push(m);
  }
  return Object.entries(map);
}

function getPositionZoneClass(rank: number, total: number): string {
  if (rank <= 4)          return "bg-emerald-500";
  if (rank <= 6)          return "bg-blue-500";
  if (rank >= total - 2)  return "bg-red-500";
  return "bg-transparent";
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ match, variant }: { match: any; variant: "live" | "fixture" | "result" }) {
  if (variant === "live") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <span className="text-[10px] font-black leading-none text-red-400 tabular-nums">
          {match.minute ? `${match.minute}'` : "LIVE"}
        </span>
      </div>
    );
  }
  if (variant === "result") {
    return (
      <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/35">
        FT
      </span>
    );
  }
  return (
    <span className="text-[11px] font-bold tabular-nums text-white/55 leading-none">
      {match.kickoff || match.time || "--:--"}
    </span>
  );
}

// ── Compact match row — home | score | away horizontal layout ─────────────────
function TeamCrest({ logo, name, wins, dimmed }: { logo?: string; name: string; wins: boolean; dimmed: boolean }) {
  const [err, setErr] = useState(false);
  return (
    <div className="flex items-center gap-2 min-w-0">
      {!err && logo ? (
        <img src={logo} alt="" className="h-6 w-6 shrink-0 object-contain" onError={() => setErr(true)} />
      ) : (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[8px] font-black text-white/40">
          {String(name || "?").slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className={`truncate text-[13px] leading-tight transition-colors ${
        wins ? "font-bold text-white" : dimmed ? "text-white/38" : "font-medium text-white/80"
      }`}>
        {name}
      </span>
    </div>
  );
}

function MatchRow({
  match,
  variant,
  isSelected,
  onClick,
}: {
  match: any;
  variant: "live" | "fixture" | "result";
  isSelected: boolean;
  onClick: () => void;
}) {
  const isResult  = variant === "result";
  const isLive    = variant === "live";
  const hasScore  = isResult || isLive;
  const homeScore = Number(match.homeScore ?? 0);
  const awayScore = Number(match.awayScore ?? 0);
  const homeWins  = hasScore && homeScore > awayScore;
  const awayWins  = hasScore && awayScore > homeScore;

  return (
    <Link
      href={`/live-center/${match.id}`}
      onClick={onClick}
      className={`group flex items-center border-b border-white/[0.04] transition-colors last:border-0 ${
        isSelected
          ? "border-l-2 border-l-primary bg-primary/8"
          : isLive
          ? "hover:bg-red-950/30"
          : "hover:bg-white/[0.03]"
      }`}
    >
      {/* Status column — fixed 58px */}
      <div className="flex w-[58px] shrink-0 flex-col items-center justify-center gap-0.5 border-r border-white/[0.04] py-3.5 px-2">
        <StatusBadge match={match} variant={variant} />
      </div>

      {/* Home team — right-aligned, flex-1 */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 px-3 py-3">
        <TeamCrest logo={match.homeLogo} name={match.home} wins={homeWins} dimmed={hasScore && !homeWins} />
      </div>

      {/* Score / vs — fixed center, 72px */}
      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center py-3">
        {hasScore ? (
          <>
            <span className={`text-[17px] font-black leading-none tabular-nums tracking-tight ${
              homeWins ? "text-white" : awayWins ? "text-white/28" : "text-white/75"
            }`}>
              {match.homeScore ?? 0}
            </span>
            <span className="my-0.5 text-[9px] font-black text-white/18">—</span>
            <span className={`text-[17px] font-black leading-none tabular-nums tracking-tight ${
              awayWins ? "text-white" : homeWins ? "text-white/28" : "text-white/75"
            }`}>
              {match.awayScore ?? 0}
            </span>
          </>
        ) : (
          <span className="text-[11px] font-bold tracking-widest text-white/20">vs</span>
        )}
      </div>

      {/* Away team — left-aligned, flex-1 */}
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-3">
        <TeamCrest logo={match.awayLogo} name={match.away} wins={awayWins} dimmed={hasScore && !awayWins} />
      </div>

      {/* Chevron */}
      <div className="flex shrink-0 items-center pr-3">
        <ChevronRight className="h-3.5 w-3.5 text-white/12 transition-colors group-hover:text-white/30" />
      </div>
    </Link>
  );
}

// ── League group header (sticky) ──────────────────────────────────────────────
function LeagueHeader({
  league,
  count,
  onStandings,
}: {
  league: string;
  count: number;
  onStandings?: () => void;
}) {
  const logo = LEAGUE_LOGOS[league];
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-white/[0.06] bg-[#0c1828] px-3 py-2">
      {logo ? (
        <img src={logo} alt={league} className="h-5 w-5 shrink-0 object-contain" />
      ) : (
        <div className="h-5 w-5 shrink-0 rounded-sm bg-white/10" />
      )}
      <span className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-white/55">
        {league}
      </span>
      <span className="shrink-0 text-[10px] text-white/22">({count})</span>
      {onStandings && (
        <button
          onClick={(e) => { e.stopPropagation(); onStandings(); }}
          className="ml-auto shrink-0 text-[10px] font-bold text-primary hover:text-red-300 transition-colors"
        >
          Standings →
        </button>
      )}
    </div>
  );
}

// ── Left league sidebar ───────────────────────────────────────────────────────
function LeagueSidebar({
  leagues,
  activeLeague,
  onSelect,
  query,
  onQuery,
}: {
  leagues: { name: string; count: number }[];
  activeLeague: string;
  onSelect: (l: string) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <div className="hidden w-[210px] shrink-0 flex-col overflow-hidden border-r border-white/8 lg:flex">
      {/* Search */}
      <div className="shrink-0 border-b border-white/8 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/28" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search team or league…"
            className="h-8 w-full rounded-lg border border-white/8 bg-white/[0.03] pl-8 pr-2 text-[12px] text-white outline-none placeholder:text-white/22 focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* ALL */}
      <button
        onClick={() => onSelect("all")}
        className={`shrink-0 flex items-center gap-2 border-b border-white/[0.045] px-4 py-2.5 text-left transition-colors ${
          activeLeague === "all"
            ? "bg-primary/10 text-primary"
            : "text-white/45 hover:bg-white/[0.03] hover:text-white/75"
        }`}
      >
        <span className="text-[11px] font-black uppercase tracking-wider">All Leagues</span>
      </button>

      {/* League list */}
      <div className="flex-1 overflow-y-auto">
        {leagues.map(({ name, count }) => {
          const logo = LEAGUE_LOGOS[name];
          const active = activeLeague === name;
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`flex w-full items-center gap-2.5 border-b border-white/[0.035] px-3 py-2.5 text-left transition-colors last:border-0 ${
                active
                  ? "border-l-2 border-l-primary bg-primary/8 text-white"
                  : "text-white/48 hover:bg-white/[0.03] hover:text-white/75"
              }`}
            >
              {logo ? (
                <img src={logo} alt={name} className="h-5 w-5 shrink-0 object-contain" />
              ) : (
                <div className="h-5 w-5 shrink-0 rounded-sm bg-white/10" />
              )}
              <span className="min-w-0 truncate text-[12px] font-medium">{name}</span>
              <span className="ml-auto shrink-0 text-[10px] text-white/28">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Right detail panel ────────────────────────────────────────────────────────
function MatchDetailPanel({
  match,
  variant,
  standings,
  onClose,
}: {
  match: any | null;
  variant?: "live" | "fixture" | "result";
  standings: Record<string, any[]>;
  onClose: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useFixtureDetail(match?.id);

  if (!match) {
    return (
      <div className="hidden w-[300px] shrink-0 flex-col items-center justify-center border-l border-white/8 xl:flex">
        <div className="px-8 text-center">
          <div className="mb-3 text-5xl opacity-10">⚽</div>
          <p className="text-sm font-semibold text-white/18">Select a match</p>
          <p className="mt-1 text-xs text-white/10">Click any row to see details</p>
        </div>
      </div>
    );
  }

  const isResult   = variant === "result";
  const isLive     = variant === "live";
  const isFixture  = variant === "fixture";
  const homeScore  = Number(match.homeScore ?? 0);
  const awayScore  = Number(match.awayScore ?? 0);
  const homeWins   = (isResult || isLive) && homeScore > awayScore;
  const awayWins   = (isResult || isLive) && awayScore > homeScore;
  const leagueLogo = LEAGUE_LOGOS[match.league];
  const leagueRows = standings[match.league] || [];

  const goalEvents = (detail?.events || []).filter((e: any) => e.type === "goal");
  const cardEvents = (detail?.events || []).filter((e: any) => e.type === "yellow" || e.type === "red");
  const keyStats   = (detail?.stats  || []).slice(0, 5);
  const homeForm   = detail?.lineups?.home?.formation;
  const awayForm   = detail?.lineups?.away?.formation;
  const homePlayers = detail?.lineups?.home?.players || [];
  const awayPlayers = detail?.lineups?.away?.players || [];

  return (
    <div className="hidden w-[300px] shrink-0 flex-col border-l border-white/8 xl:flex overflow-y-auto">
      {/* League bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/8 bg-[#0c1828] px-4 py-2.5">
        {leagueLogo && <img src={leagueLogo} alt={match.league} className="h-5 w-5 object-contain" />}
        <span className="min-w-0 truncate text-[10px] font-black uppercase tracking-widest text-white/42">
          {match.league}
        </span>
        <button onClick={onClose} className="ml-auto shrink-0 text-white/22 transition-colors hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Score block */}
      <div className="shrink-0 px-5 pb-4 pt-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {/* Home */}
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
              {match.homeLogo ? (
                <img src={match.homeLogo} alt={match.home} className="h-9 w-9 object-contain" />
              ) : (
                <span className="text-[10px] font-black text-white/30">{String(match.home || "H").slice(0, 3)}</span>
              )}
            </div>
            <p className={`text-[12px] font-bold leading-tight ${homeWins ? "text-white" : (isResult || isLive) ? "text-white/42" : "text-white/80"}`}>
              {match.home}
            </p>
            {homeForm && <p className="mt-0.5 text-[9px] text-white/22">{homeForm}</p>}
          </div>

          {/* Score / time */}
          <div className="text-center">
            {isResult || isLive ? (
              <>
                <div className="text-3xl font-black leading-none tracking-tight">
                  <span className={homeWins ? "text-white" : awayWins ? "text-white/25" : "text-white/75"}>{match.homeScore ?? 0}</span>
                  <span className="mx-1 text-white/14">-</span>
                  <span className={awayWins ? "text-white" : homeWins ? "text-white/25" : "text-white/75"}>{match.awayScore ?? 0}</span>
                </div>
                {isLive ? (
                  <div className="mt-1.5 flex items-center justify-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                    </span>
                    <span className="text-[10px] font-black text-red-400">{match.minute ? `${match.minute}'` : "LIVE"}</span>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400/60">Full Time</p>
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="text-sm font-black text-white/50">{match.kickoff || match.time || "TBD"}</div>
                <p className="mt-0.5 text-[9px] text-white/22">Kick-off</p>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
              {match.awayLogo ? (
                <img src={match.awayLogo} alt={match.away} className="h-9 w-9 object-contain" />
              ) : (
                <span className="text-[10px] font-black text-white/30">{String(match.away || "A").slice(0, 3)}</span>
              )}
            </div>
            <p className={`text-[12px] font-bold leading-tight ${awayWins ? "text-white" : (isResult || isLive) ? "text-white/42" : "text-white/80"}`}>
              {match.away}
            </p>
            {awayForm && <p className="mt-0.5 text-[9px] text-white/22">{awayForm}</p>}
          </div>
        </div>

        {match.date && <p className="mt-2.5 text-center text-[10px] text-white/22">{match.date}</p>}

        {/* CTA — context-aware routing */}
        <Link
          href={`/live-center/${match.id}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/15 py-2.5 text-[11px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/25"
        >
          {isLive ? "Watch Live" : isResult ? "Match Report" : "Match Preview"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── Goal events ─────────────────────────────────────────── */}
      {(isResult || isLive) && (
        <div className="shrink-0 border-t border-white/8">
          <div className="flex items-center gap-2 border-b border-white/[0.045] px-4 py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/28">Goals</span>
            {detailLoading && <RotateCw className="ml-auto h-3 w-3 animate-spin text-white/20" />}
          </div>
          {goalEvents.length === 0 && !detailLoading ? (
            <p className="px-4 py-3 text-[11px] text-white/22">{isLive ? "Waiting for goals…" : "No goals recorded"}</p>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {goalEvents.map((e: any, i: number) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 ${e.team === "away" ? "flex-row-reverse" : ""}`}>
                  <span className="shrink-0 text-[9px] font-black tabular-nums text-white/28">{e.min}'</span>
                  <span className="shrink-0 text-[11px]">⚽</span>
                  <div className={`min-w-0 flex-1 ${e.team === "away" ? "text-right" : ""}`}>
                    <p className="truncate text-[11px] font-bold text-white">{e.player}</p>
                    {e.assist && <p className="truncate text-[9px] text-white/30">{e.assist}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Match stats bars ─────────────────────────────────────── */}
      {(isResult || isLive) && keyStats.length > 0 && (
        <div className="shrink-0 border-t border-white/8">
          <div className="border-b border-white/[0.045] px-4 py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/28">Match Stats</span>
          </div>
          <div className="divide-y divide-white/[0.03] px-4 py-0.5">
            {keyStats.map((s: any) => {
              const total  = (s.home + s.away) || 1;
              const homePct = Math.round((s.home / total) * 100);
              return (
                <div key={s.label} className="py-2">
                  <div className="mb-1 flex justify-between text-[9px]">
                    <span className="font-black tabular-nums text-white/60">{s.home}{s.unit}</span>
                    <span className="text-white/22">{s.label}</span>
                    <span className="font-black tabular-nums text-white/60">{s.away}{s.unit}</span>
                  </div>
                  <div className="flex h-[5px] overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-l-full bg-primary/65 transition-all" style={{ width: `${homePct}%` }} />
                    <div className="h-full flex-1 rounded-r-full bg-white/18" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bookings ─────────────────────────────────────────────── */}
      {(isResult || isLive) && cardEvents.length > 0 && (
        <div className="shrink-0 border-t border-white/8">
          <div className="border-b border-white/[0.045] px-4 py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/28">Bookings</span>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {cardEvents.map((e: any, i: number) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 ${e.team === "away" ? "flex-row-reverse" : ""}`}>
                <span className="shrink-0 text-[9px] font-black tabular-nums text-white/28">{e.min}'</span>
                <div className={`shrink-0 h-3.5 w-2.5 rounded-sm ${e.type === "red" ? "bg-red-500" : "bg-yellow-400"}`} />
                <p className={`min-w-0 flex-1 truncate text-[11px] text-white/65 ${e.team === "away" ? "text-right" : ""}`}>{e.player}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lineups ──────────────────────────────────────────────── */}
      {(homePlayers.length > 0 || awayPlayers.length > 0) && (
        <div className="shrink-0 border-t border-white/8">
          <div className="border-b border-white/[0.045] px-4 py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/28">Lineups</span>
          </div>
          <div className="grid grid-cols-2 gap-0 divide-x divide-white/[0.045] px-0 py-2">
            {[
              { name: match.home, form: homeForm, players: homePlayers, align: "left" },
              { name: match.away, form: awayForm, players: awayPlayers, align: "right" },
            ].map(({ name, form, players, align }) => (
              <div key={name} className={`px-3 ${align === "right" ? "text-right" : ""}`}>
                <p className="truncate text-[9px] font-black uppercase tracking-wider text-white/30">{name}</p>
                {form && <p className="text-[14px] font-black text-white/70">{form}</p>}
                <div className="mt-1.5 space-y-0.5">
                  {players.slice(0, 11).map((p: any, i: number) => (
                    <p key={i} className="truncate text-[9px] text-white/40">
                      <span className="font-bold text-white/25">{p.number} </span>{p.name}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mini standings ───────────────────────────────────────── */}
      {leagueRows.length > 0 && (
        <div className="shrink-0 border-t border-white/8">
          <div className="flex items-center gap-2 border-b border-white/[0.045] px-4 py-2">
            {leagueLogo && <img src={leagueLogo} alt="" className="h-4 w-4 object-contain" />}
            <span className="text-[9px] font-black uppercase tracking-widest text-white/28">Standings</span>
            <button
              onClick={() => {/* parent can wire this up */}}
              className="ml-auto text-[9px] font-bold text-primary/60 hover:text-primary transition-colors"
            >
              Full →
            </button>
          </div>
          {leagueRows.slice(0, 6).map((team: any) => {
            const isHome = team.team === match.home;
            const isAway = team.team === match.away;
            return (
              <div
                key={`${team.rank}-${team.team}`}
                className={`flex items-center gap-2 border-b border-white/[0.03] px-4 py-1.5 last:border-0 ${isHome || isAway ? "bg-white/[0.025]" : "hover:bg-white/[0.015]"}`}
              >
                <span className="w-4 shrink-0 text-[10px] text-white/25">{team.rank}</span>
                <img src={team.logo} alt="" className="h-4 w-4 shrink-0 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className={`min-w-0 flex-1 truncate text-[11px] ${isHome || isAway ? "font-bold text-white/90" : "text-white/55"}`}>{team.team}</span>
                <span className={`shrink-0 text-[11px] font-black ${isHome || isAway ? "text-white" : "text-white/60"}`}>{team.points}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Full standings table ───────────────────────────────────────────────────────
function FullStandings({ rows, league }: { rows: any[]; league: string }) {
  const total = rows.length;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead className="border-b border-white/8 bg-[#0c1828]">
          <tr className="text-[9px] font-black uppercase tracking-widest text-white/28">
            <th className="w-1" />
            <th className="px-3 py-2.5 text-center">#</th>
            <th className="px-3 py-2.5 text-left">Club</th>
            <th className="px-3 py-2.5 text-center">MP</th>
            <th className="px-3 py-2.5 text-center">W</th>
            <th className="px-3 py-2.5 text-center">D</th>
            <th className="px-3 py-2.5 text-center">L</th>
            <th className="px-3 py-2.5 text-center">+/-</th>
            <th className="px-3 py-2.5 text-center">Pts</th>
            <th className="px-4 py-2.5 text-left">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((team: any) => {
            const gd = Number(team.gd);
            return (
              <tr key={`${team.rank}-${team.team}`} className="group border-b border-white/[0.04] last:border-0 hover:bg-white/[0.025] transition-colors">
                <td className="py-0 pl-0.5">
                  <div className={`my-0.5 h-full w-[3px] rounded-full ${getPositionZoneClass(team.rank, total)}`} style={{ minHeight: 34 }} />
                </td>
                <td className="px-3 py-2.5 text-center text-[11px] text-white/28">{team.rank}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <img src={team.logo} alt={team.team} className="h-6 w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-[13px] font-medium text-white/85">{team.team}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center text-[12px] text-white/40">{team.played}</td>
                <td className="px-3 py-2.5 text-center text-[12px] text-white/40">{team.won}</td>
                <td className="px-3 py-2.5 text-center text-[12px] text-white/40">{team.draw}</td>
                <td className="px-3 py-2.5 text-center text-[12px] text-white/40">{team.lost}</td>
                <td className={`px-3 py-2.5 text-center text-[12px] font-bold ${gd > 0 ? "text-emerald-400/75" : gd < 0 ? "text-red-400/75" : "text-white/40"}`}>
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-3 py-2.5 text-center text-[14px] font-black text-white">{team.points}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    {(team.form || []).slice(-5).map((f: string, i: number) => (
                      <span
                        key={i}
                        className={`flex h-5 w-5 items-center justify-center rounded text-[8px] font-black ${
                          f === "W" ? "bg-emerald-500/25 text-emerald-400" :
                          f === "D" ? "bg-white/10 text-white/45" :
                          "bg-red-500/25 text-red-400"
                        }`}
                      >{f}</span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Zone legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-white/[0.04] bg-[#0c1828] px-4 py-2.5">
        {[
          { cls: "bg-emerald-500", label: "Champions League" },
          { cls: "bg-blue-500",    label: "Europa League" },
          { cls: "bg-red-500",     label: "Relegation" },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-3 w-[3px] rounded-full ${cls}`} />
            <span className="text-[9px] font-bold text-white/25">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-3 text-4xl opacity-15">⚽</div>
      <p className="text-sm font-black uppercase tracking-wider text-white/30">{title}</p>
      <p className="mt-2 text-xs text-white/18">{body}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MatchesPage() {
  const [view, setView] = useState<HubView>(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "africa")   return "africa";
    if (tab === "live")     return "live";
    if (tab === "tables")   return "tables";
    if (tab === "results")  return "results";
    if (tab === "fixtures") return "fixtures";
    return "all";
  });
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("search") || "");
  const [tableLeague, setTableLeague] = useState("Premier League");
  const [selected, setSelected] = useState<{ match: any; variant: "live" | "fixture" | "result" } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [clockTick, setClockTick] = useState(0);

  const { data: liveMatches = [],     isFetching: liveFetching }     = useMatches();
  const { data: recentMatches = [],    isFetching: recentFetching }   = useRecentMatches();
  const { data: upcomingFixtures = [], isFetching: upcomingFetching } = useUpcomingFixtures();
  const { data: standings = {} as Record<string, any[]>, isFetching: standingsFetching } = useStandings();

  const fixturesWithFallback = useMemo(() => upcomingFixtures.length ? upcomingFixtures : WC26_OPENING_FIXTURES, [upcomingFixtures]);
  const standingsWithFallback = useMemo(() => Object.keys(standings).length ? standings : WC26_GROUPS, [standings]);
  const hasApiData = liveMatches.length || recentMatches.length || upcomingFixtures.length || Object.keys(standings).length;
  const fetching   = liveFetching || recentFetching || upcomingFetching || standingsFetching;

  const freshnessLabelSafe = useMemo(() => formatFreshnessLabel(lastUpdated), [lastUpdated, clockTick]);

  useEffect(() => {
    if (hasApiData || (!upcomingFetching && !standingsFetching)) setLastUpdated(new Date());
  }, [hasApiData, upcomingFetching, standingsFetching]);
  useEffect(() => {
    const t = window.setInterval(() => setClockTick(c => c + 1), 60000);
    return () => window.clearInterval(t);
  }, []);

  // Build pool for current view tab
  const liveSet = useMemo(() => new Set(liveMatches.map((m: any) => m.id)), [liveMatches]);
  const resultSet = useMemo(() => new Set(recentMatches.map((m: any) => m.id)), [recentMatches]);

  const getVariant = (m: any): "live" | "fixture" | "result" =>
    liveSet.has(m.id) ? "live" : resultSet.has(m.id) ? "result" : "fixture";

  const basePool = useMemo(() => {
    if (view === "live")     return liveMatches;
    if (view === "results")  return recentMatches;
    if (view === "fixtures") return fixturesWithFallback;
    return [...liveMatches, ...recentMatches, ...fixturesWithFallback];
  }, [view, liveMatches, recentMatches, fixturesWithFallback]);

  const filteredPool = useMemo(() =>
    basePool.filter(m => {
      const matchesLeague = leagueFilter === "all" || m.league === leagueFilter;
      const hay = `${m.home || ""} ${m.away || ""} ${m.league || ""}`.toLowerCase();
      const matchesQ = !query.trim() || hay.includes(query.toLowerCase());
      return matchesLeague && matchesQ;
    }), [basePool, leagueFilter, query]);

  const groups = useMemo(() => groupByLeague(filteredPool), [filteredPool]);

  // Sidebar league list (all matches)
  const sidebarLeagues = useMemo(() => {
    const allMatches = [...liveMatches, ...recentMatches, ...fixturesWithFallback];
    const counts: Record<string, number> = {};
    for (const m of allMatches) {
      if (m.league) counts[m.league] = (counts[m.league] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [liveMatches, recentMatches, fixturesWithFallback]);

  // Table data
  const tableEntries = Object.entries(standingsWithFallback).filter(([, r]) => r?.length > 0);
  const selectedStandings = standingsWithFallback[tableLeague] || [];

  const TOP_LEAGUES = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "KPL", "World Cup 2026"];

  const navItems = [
    { id: "all" as HubView,      label: "All",      count: liveMatches.length + recentMatches.length + fixturesWithFallback.length },
    { id: "live" as HubView,     label: "Live",     count: liveMatches.length },
    { id: "results" as HubView,  label: "Results",  count: recentMatches.length },
    { id: "fixtures" as HubView, label: "Fixtures", count: fixturesWithFallback.length },
    { id: "africa" as HubView,   label: "Africa",   count: 0 },
    { id: "tables" as HubView,   label: "Standings",count: tableEntries.length },
  ];

  return (
    <div
      className="flex flex-col bg-[#080d16] text-white"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      <SEO
        title="Live Football Scores & Fixtures | Premier League, WC26, KPL — BallMtaani"
        description="BallMtaani live football data center — real-time scores, fixtures, results, league standings, World Cup 2026 and Africa coverage for Kenyan fans."
        keywords={["live football scores Kenya", "Premier League live", "World Cup 2026 scores", "KPL fixtures", "BallMtaani matches"]}
        path="/matches"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "Matches", url: "/matches" }]}
      />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-white/8 bg-[#080d16]">
        <div className="flex items-center gap-4 px-4 py-2.5">
          <div>
            <h1 className="text-[13px] font-black uppercase tracking-widest text-white">Football Hub</h1>
            <DataFreshnessChip label={freshnessLabelSafe} className="mt-0.5" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {liveMatches.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/12 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-black text-red-400">{liveMatches.length} Live</span>
              </div>
            )}
            {fetching && (
              <div className="flex items-center gap-1.5 text-[10px] text-white/28">
                <RotateCw className="h-3 w-3 animate-spin" /> Syncing
              </div>
            )}
            <Link href="/live-center" className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/42 transition-colors hover:text-white">
              <Radio className="h-3 w-3" /> Live Center
            </Link>
            <Link href="/world-cup-2026" className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#FFD700]/20 px-3 py-1.5 text-[10px] font-bold text-[#FFD700]/60 transition-colors hover:text-[#FFD700]">
              <Trophy className="h-3 w-3" /> WC26
            </Link>
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex items-center overflow-x-auto border-t border-white/[0.05] px-1 scrollbar-none">
          {navItems.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors ${
                view === id
                  ? "border-primary text-white"
                  : "border-transparent text-white/35 hover:text-white/65"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${view === id ? "bg-primary/20 text-primary" : "bg-white/8 text-white/35"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main 3-column area ────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left sidebar */}
        <LeagueSidebar
          leagues={sidebarLeagues}
          activeLeague={leagueFilter}
          onSelect={setLeagueFilter}
          query={query}
          onQuery={setQuery}
        />

        {/* Center — scrollable match list (or other views) */}
        <div className="flex-1 overflow-y-auto min-w-0">

          {/* Africa view */}
          {view === "africa" && (
            <div className="p-4">
              <AfricanFootballWidget compact={false} />
            </div>
          )}

          {/* Tables / Standings view */}
          {view === "tables" && (
            <div>
              {/* League selector */}
              <div className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto border-b border-white/8 bg-[#0c1828] px-3 py-2.5 scrollbar-none">
                {[...TOP_LEAGUES, ...Object.keys(standingsWithFallback).filter(n => !TOP_LEAGUES.includes(n))]
                  .slice(0, 12)
                  .map(league => {
                    const logo = LEAGUE_LOGOS[league];
                    const active = tableLeague === league;
                    return (
                      <button
                        key={league}
                        onClick={() => setTableLeague(league)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                          active
                            ? "border-primary bg-primary/15 text-white"
                            : "border-white/10 bg-white/[0.02] text-white/38 hover:text-white"
                        }`}
                      >
                        {logo && <img src={logo} alt="" className="h-3.5 w-3.5 object-contain" />}
                        {league}
                      </button>
                    );
                  })}
              </div>

              {selectedStandings.length ? (
                <FullStandings rows={selectedStandings} league={tableLeague} />
              ) : (
                <EmptyState title="No table loaded" body="Choose another league or wait for the data feed." />
              )}
            </div>
          )}

          {/* Match list (all / live / results / fixtures) */}
          {view !== "africa" && view !== "tables" && (
            <>
              {/* Mobile search bar (sidebar hidden on mobile) */}
              <div className="flex items-center gap-2 border-b border-white/[0.05] px-3 py-2 lg:hidden">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/28" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="h-8 w-full rounded-lg border border-white/8 bg-white/[0.03] pl-8 pr-2 text-[12px] text-white outline-none placeholder:text-white/22 focus:border-primary/50"
                  />
                </div>
                <select
                  value={leagueFilter}
                  onChange={e => setLeagueFilter(e.target.value)}
                  className="h-8 rounded-lg border border-white/8 bg-[#0d1824] px-2 text-[11px] text-white/60 outline-none"
                >
                  <option value="all">All leagues</option>
                  {sidebarLeagues.map(({ name }) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>

              {/* Ad strip */}
              <div className="border-b border-white/[0.04]">
                <AdBanner label="Data Partner" type="horizontal" />
              </div>

              {groups.length > 0 ? (
                groups.map(([league, matches]) => (
                  <div key={league}>
                    <LeagueHeader
                      league={league}
                      count={matches.length}
                      onStandings={
                        standingsWithFallback[league]
                          ? () => { setTableLeague(league); setView("tables"); }
                          : undefined
                      }
                    />
                    {matches.map(m => {
                      const variant = getVariant(m);
                      return (
                        <MatchRow
                          key={m.id}
                          match={m}
                          variant={variant}
                          isSelected={selected?.match?.id === m.id}
                          onClick={() => setSelected(prev =>
                            prev?.match?.id === m.id ? null : { match: m, variant }
                          )}
                        />
                      );
                    })}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No matches found"
                  body={query ? "Clear your search or try a different league." : "The data feed is refreshing — try again in a moment."}
                />
              )}
            </>
          )}
        </div>

        {/* Right detail panel */}
        <MatchDetailPanel
          match={selected?.match || null}
          variant={selected?.variant}
          standings={standingsWithFallback}
          onClose={() => setSelected(null)}
        />
      </div>
    </div>
  );
}
