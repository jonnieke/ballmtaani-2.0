import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Clock3,
  Goal,
  LayoutGrid,
  Radio,
  RotateCw,
  Search,
  Table2,
  Trophy,
} from "lucide-react";
import { useMatches, useRecentMatches, useUpcomingFixtures, useStandings } from "../hooks/useData";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";
import DataFreshnessChip from "../components/DataFreshnessChip";
import { formatFreshnessLabel } from "../lib/freshness";
import type { TournamentStandingEntry } from "../lib/football-api";
import AfricanFootballWidget from "../components/AfricanFootballWidget";

type HubView = "overview" | "live" | "fixtures" | "results" | "tables" | "africa";

const LEAGUE_LOGOS: Record<string, string> = {
  "Premier League": "https://media.api-sports.io/football/leagues/39.png",
  "La Liga": "https://media.api-sports.io/football/leagues/140.png",
  "Serie A": "https://media.api-sports.io/football/leagues/135.png",
  "Bundesliga": "https://media.api-sports.io/football/leagues/78.png",
  "Ligue 1": "https://media.api-sports.io/football/leagues/61.png",
  "UEFA Champions League": "https://media.api-sports.io/football/leagues/2.png",
  "Champions League": "https://media.api-sports.io/football/leagues/2.png",
  "UEFA Europa League": "https://media.api-sports.io/football/leagues/3.png",
  "Europa League": "https://media.api-sports.io/football/leagues/3.png",
  "World Cup 2026": "https://media.api-sports.io/football/leagues/1.png",
  "FIFA World Cup": "https://media.api-sports.io/football/leagues/1.png",
  "AFCON": "https://media.api-sports.io/football/leagues/12.png",
  "Africa Cup of Nations": "https://media.api-sports.io/football/leagues/12.png",
  "CAF Champions League": "https://media.api-sports.io/football/leagues/20.png",
  "KPL": "https://media.api-sports.io/football/leagues/357.png",
  "Kenyan Premier League": "https://media.api-sports.io/football/leagues/357.png",
};

const FEATURE_LINKS = [
  { href: "/live-center",    label: "Live Center",   sub: "Open match pulse",   icon: Radio,    tone: "text-primary border-primary/30 bg-primary/8" },
  { href: "/market-watch",   label: "Market Watch",  sub: "Football signals",   icon: BarChart3, tone: "text-emerald-300 border-emerald-400/30 bg-emerald-500/8" },
  { href: "/world-cup-2026", label: "WC26",          sub: "Road to 2026",       icon: Trophy,   tone: "text-[#FFD700] border-[#FFD700]/30 bg-[#FFD700]/8" },
  { href: "/predictions",    label: "Predictions",   sub: "Make your call",     icon: Goal,     tone: "text-cyan-300 border-cyan-400/30 bg-cyan-500/8" },
];

const TOP_LEAGUES = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "KPL", "World Cup 2026"];

const WC26_OPENING_FIXTURES = [
  { home: "Mexico",    away: "South Africa", date: "Jun 11", time: "10:00 PM", league: "World Cup 2026", id: "wc26-1" },
  { home: "USA",       away: "Colombia",     date: "Jun 12", time: "1:00 AM",  league: "World Cup 2026", id: "wc26-2" },
  { home: "Canada",    away: "Venezuela",    date: "Jun 12", time: "4:00 PM",  league: "World Cup 2026", id: "wc26-3" },
  { home: "Brazil",    away: "Germany",      date: "Jun 13", time: "7:00 PM",  league: "World Cup 2026", id: "wc26-4" },
  { home: "Argentina", away: "Morocco",      date: "Jun 14", time: "10:00 PM", league: "World Cup 2026", id: "wc26-5" },
  { home: "France",    away: "England",      date: "Jun 14", time: "1:00 AM",  league: "World Cup 2026", id: "wc26-6" },
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

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function getPositionZoneClass(rank: number, total: number): string {
  if (rank <= 4)        return "bg-emerald-500";
  if (rank <= 6)        return "bg-blue-500";
  if (rank === 7)       return "bg-sky-400";
  if (rank >= total - 2) return "bg-red-500";
  return "bg-transparent";
}

// ── Team logo with graceful fallback ────────────────────────────────────────
function Crest({ src, name, size = "md" }: { src?: string; name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-16 w-16 sm:h-20 sm:w-20" : size === "md" ? "h-12 w-12" : "h-8 w-8";
  const imgDim = size === "lg" ? "h-12 w-12 sm:h-16 sm:w-16" : size === "md" ? "h-9 w-9" : "h-6 w-6";
  const [failed, setFailed] = useState(false);
  return (
    <div className={`${dim} mx-auto flex shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10`}>
      {src && !failed ? (
        <img src={src} alt={name} className={`${imgDim} object-contain`} onError={() => setFailed(true)} />
      ) : (
        <span className={`font-black text-white/35 ${size === "lg" ? "text-base" : size === "md" ? "text-xs" : "text-[9px]"}`}>
          {String(name || "?").slice(0, 3).toUpperCase()}
        </span>
      )}
    </div>
  );
}

// ── Featured match banner (live or last result shown large) ─────────────────
function FeaturedMatchBanner({ match, variant }: { match: any; variant: "live" | "result" }) {
  const isLive = variant === "live";
  const homeScore = Number(match.homeScore ?? 0);
  const awayScore = Number(match.awayScore ?? 0);
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const leagueLogo = LEAGUE_LOGOS[match.league];

  return (
    <div className="relative mb-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1d2e] via-[#0a1220] to-[#060c14]">
      {isLive && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-900/15 via-transparent to-transparent" />
      )}
      {/* subtle background team hint */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.02),transparent_50%),radial-gradient(ellipse_at_80%_50%,rgba(255,255,255,0.02),transparent_50%)]" />

      <div className="relative px-5 py-7 sm:px-8 sm:py-9">
        {/* League bar */}
        <div className="mb-6 flex items-center gap-3">
          {leagueLogo && (
            <img src={leagueLogo} alt={match.league} className="h-7 w-7 object-contain opacity-80" />
          )}
          <span className="text-xs font-black uppercase tracking-widest text-white/45">
            {match.league || "Football"}
          </span>
          {isLive ? (
            <div className="ml-auto flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-black text-red-400">
                {match.minute ? `${match.minute}'` : "LIVE"}
              </span>
            </div>
          ) : (
            <span className="ml-auto rounded bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
              FT
            </span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          <div className="text-center">
            <Crest src={match.homeLogo} name={match.home} size="lg" />
            <p className={`mt-3 truncate text-base font-black tracking-tight sm:text-xl ${homeWins ? "text-white" : isLive ? "text-white" : "text-white/50"}`}>
              {match.home}
            </p>
          </div>

          <div className="text-center">
            <div className="text-5xl font-black leading-none tracking-tighter sm:text-6xl">
              <span className={homeWins ? "text-white" : awayWins ? "text-white/25" : "text-white"}>
                {match.homeScore ?? 0}
              </span>
              <span className="mx-2 text-white/12">—</span>
              <span className={awayWins ? "text-white" : homeWins ? "text-white/25" : "text-white"}>
                {match.awayScore ?? 0}
              </span>
            </div>
            {match.date && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/25">
                {match.date}
              </p>
            )}
          </div>

          <div className="text-center">
            <Crest src={match.awayLogo} name={match.away} size="lg" />
            <p className={`mt-3 truncate text-base font-black tracking-tight sm:text-xl ${awayWins ? "text-white" : isLive ? "text-white" : "text-white/50"}`}>
              {match.away}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href={isLive ? `/live-center/${match.id}` : "/live-center"}
            className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/25"
          >
            {isLive ? "Watch Live" : "Full Match"} <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Score widget card ────────────────────────────────────────────────────────
function MatchWidget({ match, variant = "fixture" }: { match: any; variant?: "live" | "fixture" | "result" }) {
  const isResult  = variant === "result";
  const isLive    = variant === "live";
  const homeScore = Number(match.homeScore ?? 0);
  const awayScore = Number(match.awayScore ?? 0);
  const homeWins  = (isResult || isLive) && homeScore > awayScore;
  const awayWins  = (isResult || isLive) && awayScore > homeScore;
  const leagueLogo = LEAGUE_LOGOS[match.league];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-[#0d1824] to-[#08101a] transition-all duration-200 hover:border-white/18 hover:shadow-xl hover:shadow-black/60">
      {/* Live glow */}
      {isLive && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-500/8 to-transparent" />
      )}

      {/* ── League header ── */}
      <div className="flex items-center justify-between gap-3 border-b border-white/6 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {leagueLogo ? (
            <img src={leagueLogo} alt={match.league} className="h-4 w-4 shrink-0 object-contain opacity-75" />
          ) : (
            <div className="h-4 w-4 shrink-0 rounded-sm bg-white/10" />
          )}
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white/38">
            {match.league || "Football"}
          </span>
        </div>

        {/* Status pill */}
        {isLive ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[11px] font-black text-red-400">
              {match.minute ? `${match.minute}'` : "LIVE"}
            </span>
          </div>
        ) : isResult ? (
          <span className="shrink-0 rounded bg-white/6 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/38">
            FT
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-bold text-white/55">
            {match.kickoff || match.time || match.date || "TBD"}
          </span>
        )}
      </div>

      {/* ── Teams + Score ── */}
      <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-5">
        {/* Home */}
        <div className="min-w-0 text-center">
          <Crest src={match.homeLogo} name={match.home} size="md" />
          <p className={`mt-2.5 truncate text-[13px] font-bold leading-tight ${homeWins ? "text-white" : (isResult || isLive) ? "text-white/45" : "text-white/90"}`}>
            {match.home}
          </p>
        </div>

        {/* Score */}
        <div className="shrink-0 min-w-[70px] text-center">
          {isResult || isLive ? (
            <div className="text-4xl font-black leading-none tracking-tighter">
              <span className={homeWins ? "text-white" : awayWins ? "text-white/28" : "text-white/80"}>
                {match.homeScore ?? 0}
              </span>
              <span className="mx-1 text-white/14">:</span>
              <span className={awayWins ? "text-white" : homeWins ? "text-white/28" : "text-white/80"}>
                {match.awayScore ?? 0}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                <span className="text-[15px] font-black text-white/18">VS</span>
              </div>
              {match.date && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/22">{match.date}</span>
              )}
            </div>
          )}
        </div>

        {/* Away */}
        <div className="min-w-0 text-center">
          <Crest src={match.awayLogo} name={match.away} size="md" />
          <p className={`mt-2.5 truncate text-[13px] font-bold leading-tight ${awayWins ? "text-white" : (isResult || isLive) ? "text-white/45" : "text-white/90"}`}>
            {match.away}
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-white/5 bg-black/15 px-3 py-2">
        <span className="text-[10px] font-medium text-white/25">{match.date || "Matchday"}</span>
        <Link
          href={isLive ? `/live-center/${match.id}` : "/live-center"}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary opacity-0 transition-opacity group-hover:opacity-100"
        >
          Open <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ── Standings widget with zone indicators + form dots ───────────────────────
function StandingsWidget({ league, rows }: { league: string; rows: any[] }) {
  const leagueLogo = LEAGUE_LOGOS[league];
  const total = rows.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-[#0d1824] to-[#080f18]">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-3">
        {leagueLogo ? (
          <img src={leagueLogo} alt={league} className="h-6 w-6 object-contain" />
        ) : (
          <Table2 className="h-5 w-5 text-white/30" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black uppercase tracking-wide text-white">{league}</h3>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Table</span>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-[3px_20px_1fr_30px_30px_36px_42px] items-center gap-0 border-b border-white/5 px-3.5 py-1.5">
        <div />
        <div />
        <div className="text-[9px] font-black uppercase tracking-widest text-white/20 pl-2">Club</div>
        <div className="text-center text-[9px] font-black uppercase tracking-widest text-white/20">P</div>
        <div className="text-center text-[9px] font-black uppercase tracking-widest text-white/20">W</div>
        <div className="text-center text-[9px] font-black uppercase tracking-widest text-white/20">GD</div>
        <div className="text-right text-[9px] font-black uppercase tracking-widest text-white/20 pr-0.5">Pts</div>
      </div>

      {/* Rows */}
      {rows.slice(0, 6).map((team: any) => {
        const zoneClass = getPositionZoneClass(team.rank, total);
        const gd = Number(team.gd);
        return (
          <div
            key={`${league}-${team.rank}-${team.team}`}
            className="grid grid-cols-[3px_20px_1fr_30px_30px_36px_42px] items-center gap-0 border-b border-white/5 px-3.5 last:border-0 hover:bg-white/[0.025] transition-colors"
          >
            {/* Zone strip */}
            <div className={`my-1.5 h-7 w-0.5 rounded-full ${zoneClass}`} />

            {/* Rank */}
            <span className="text-[11px] font-bold text-white/30">{team.rank}</span>

            {/* Team */}
            <div className="flex min-w-0 items-center gap-2 py-2 pl-2">
              <div className="h-6 w-6 shrink-0 flex items-center justify-center">
                <img
                  src={team.logo}
                  alt={team.team}
                  className="h-5 w-5 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <span className="truncate text-[12px] font-semibold text-white/90">{team.team}</span>
            </div>

            {/* P */}
            <span className="text-center text-[11px] text-white/38">{team.played}</span>

            {/* W */}
            <span className="text-center text-[11px] text-white/38">{team.won}</span>

            {/* GD */}
            <span className={`text-center text-[11px] font-bold ${gd > 0 ? "text-emerald-400/70" : gd < 0 ? "text-red-400/70" : "text-white/38"}`}>
              {gd > 0 ? `+${gd}` : gd}
            </span>

            {/* Points */}
            <span className="text-right text-[13px] font-black text-white pr-0.5">{team.points}</span>
          </div>
        );
      })}

      {/* Form guide (top team) */}
      {(rows[0]?.form || []).length > 0 && (
        <div className="flex items-center gap-2 border-t border-white/6 bg-black/10 px-4 py-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Form</span>
          {(rows[0].form || []).slice(-5).map((f: string, i: number) => (
            <span
              key={i}
              className={`flex h-4 w-4 items-center justify-center rounded text-[8px] font-black ${
                f === "W" ? "bg-emerald-500/25 text-emerald-400" :
                f === "D" ? "bg-white/10 text-white/45" :
                "bg-red-500/25 text-red-400"
              }`}
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Zone legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 bg-black/10 px-4 py-2">
        {[
          { cls: "bg-emerald-500", label: "Top 4" },
          { cls: "bg-blue-500",    label: "UEL" },
          { cls: "bg-red-500",     label: "Relegation" },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-0.5 rounded-full ${cls}`} />
            <span className="text-[9px] font-bold text-white/20">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Full standings table (tables tab) ───────────────────────────────────────
function FullStandingsTable({ league, rows }: { league: string; rows: any[] }) {
  const total = rows.length;
  return (
    <div className="overflow-x-auto rounded-3xl border border-white/8 bg-gradient-to-b from-[#0d1824] to-[#080f18]">
      <table className="w-full min-w-[760px]">
        <thead className="border-b border-white/8">
          <tr className="text-[10px] font-black uppercase tracking-[0.16em] text-white/28">
            <th className="w-1.5" />
            <th className="px-4 py-3 text-center">#</th>
            <th className="px-4 py-3 text-left">Club</th>
            <th className="px-3 py-3 text-center">P</th>
            <th className="px-3 py-3 text-center">W</th>
            <th className="px-3 py-3 text-center">D</th>
            <th className="px-3 py-3 text-center">L</th>
            <th className="px-3 py-3 text-center">GD</th>
            <th className="px-3 py-3 text-center">Pts</th>
            <th className="px-4 py-3 text-left">Form</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((team: any) => {
            const gd = Number(team.gd);
            const zoneClass = getPositionZoneClass(team.rank, total);
            return (
              <tr key={`${team.rank}-${team.team}`} className="group border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                {/* Zone strip */}
                <td className="py-0 pl-0.5 pr-0">
                  <div className={`h-full w-0.5 rounded-full py-3 ${zoneClass}`} style={{ minHeight: 40 }} />
                </td>
                <td className="px-4 py-3 text-center text-sm text-white/35">{team.rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={team.logo} alt={team.team} className="h-7 w-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="font-semibold text-white/90">{team.team}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-sm text-white/45">{team.played}</td>
                <td className="px-3 py-3 text-center text-sm text-white/45">{team.won}</td>
                <td className="px-3 py-3 text-center text-sm text-white/45">{team.draw}</td>
                <td className="px-3 py-3 text-center text-sm text-white/45">{team.lost}</td>
                <td className={`px-3 py-3 text-center text-sm font-bold ${gd > 0 ? "text-emerald-400/80" : gd < 0 ? "text-red-400/80" : "text-white/45"}`}>
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-3 py-3 text-center text-[15px] font-black text-white">{team.points}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(team.form || []).slice(-5).map((f: string, idx: number) => (
                      <span
                        key={`${team.rank}-${idx}`}
                        className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-black ${
                          f === "W" ? "bg-emerald-500/25 text-emerald-400" :
                          f === "D" ? "bg-white/10 text-white/50" :
                          "bg-red-500/25 text-red-400"
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatPill({ icon: Icon, value, label, tone }: { icon: typeof Activity; value: string | number; label: string; tone: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-[#0a1018]/90 p-3 md:p-4 ${tone}`}>
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-current/10 blur-2xl" />
      <Icon className="relative mb-2 h-4 w-4" />
      <div className="relative text-2xl font-black text-white md:text-3xl">{value}</div>
      <div className="relative mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{label}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <div className="text-2xl mb-2">⚽</div>
      <div className="text-sm font-black uppercase tracking-[0.18em] text-white/60">{title}</div>
      <p className="mt-2 text-sm text-white/35">{body}</p>
    </div>
  );
}

// ── Section header with optional league logo ─────────────────────────────────
function SectionHeader({ title, sub, action, actionLabel, leagueName }: {
  title: string; sub?: string; action?: () => void; actionLabel?: string; leagueName?: string;
}) {
  const logo = leagueName ? LEAGUE_LOGOS[leagueName] : null;
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {logo && <img src={logo} alt={leagueName} className="h-6 w-6 object-contain opacity-70" />}
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">{title}</h2>
          {sub && <p className="text-xs text-white/38">{sub}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={action}
          className="flex shrink-0 items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-red-300 transition-colors"
        >
          {actionLabel || "View all"} <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default function MatchesPage() {
  const [view, setView] = useState<HubView>(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "africa") return "africa";
    return "overview";
  });
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("search") || "");
  const [tableLeague, setTableLeague] = useState("Premier League");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [clockTick, setClockTick] = useState(0);

  const { data: liveMatches = [],    isFetching: liveFetching }     = useMatches();
  const { data: recentMatches = [],   isFetching: recentFetching }   = useRecentMatches();
  const { data: upcomingFixtures = [], isFetching: upcomingFetching } = useUpcomingFixtures();
  const { data: standings = {} as Record<string, any[]>, isFetching: standingsFetching } = useStandings();

  const hasApiData = liveMatches.length || recentMatches.length || upcomingFixtures.length || Object.keys(standings).length;
  const fixturesWithFallback = useMemo(() => upcomingFixtures.length ? upcomingFixtures : WC26_OPENING_FIXTURES, [upcomingFixtures]);
  const standingsWithFallback = useMemo(() => Object.keys(standings).length ? standings : WC26_GROUPS, [standings]);

  const availableLeagues = useMemo(() => {
    const names = [
      ...liveMatches.map((m: any) => m.league),
      ...fixturesWithFallback.map((m: any) => m.league),
      ...recentMatches.map((m: any) => m.league),
      ...Object.keys(standingsWithFallback),
    ].filter(Boolean);
    return Array.from(new Set(names));
  }, [liveMatches, fixturesWithFallback, recentMatches, standingsWithFallback]);

  const freshnessLabelSafe = useMemo(() => formatFreshnessLabel(lastUpdated), [lastUpdated, clockTick]);

  useEffect(() => {
    if (hasApiData || (!upcomingFetching && !standingsFetching)) setLastUpdated(new Date());
  }, [hasApiData, upcomingFetching, standingsFetching]);

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((t) => t + 1), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!standingsWithFallback[tableLeague]?.length && availableLeagues.length) {
      setTableLeague(availableLeagues[0]);
    }
  }, [tableLeague, standingsWithFallback, availableLeagues]);

  const filtered = (items: any[]) =>
    items.filter((item) => {
      const matchesLeague = leagueFilter === "all" || item.league === leagueFilter;
      const haystack = `${item.home || ""} ${item.away || ""} ${item.league || ""}`;
      const matchesQuery = !query.trim() || normalizeText(haystack).includes(normalizeText(query));
      return matchesLeague && matchesQuery;
    });

  const live     = useMemo(() => filtered(liveMatches),        [liveMatches, leagueFilter, query]);
  const fixtures = useMemo(() => filtered(fixturesWithFallback), [fixturesWithFallback, leagueFilter, query]);
  const results  = useMemo(() => filtered(recentMatches),       [recentMatches, leagueFilter, query]);
  const selectedStandings = standingsWithFallback[tableLeague] || [];
  const fetching = liveFetching || recentFetching || upcomingFetching || standingsFetching;

  const tableEntries = Object.entries(standingsWithFallback).filter(([, rows]) => rows?.length > 0);

  // Overview: featured = top live OR top result
  const featuredMatch = live[0] || recentMatches[0] || null;
  const featuredVariant: "live" | "result" = live.length > 0 ? "live" : "result";
  // Rest after featured
  const overviewCards = live.length > 0
    ? live.slice(1, 5).map((m: any) => ({ ...m, _variant: "live" }))
    : results.slice(0, 4).map((m: any) => ({ ...m, _variant: "result" }));

  const navItems: { id: HubView; label: string; icon: typeof Activity; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "africa",   label: "Africa",   icon: Trophy },
    { id: "live",     label: "Live",     icon: Activity, count: live.length },
    { id: "fixtures", label: "Fixtures", icon: CalendarDays, count: fixtures.length },
    { id: "results",  label: "Results",  icon: Clock3,    count: results.length },
    { id: "tables",   label: "Tables",   icon: Table2,   count: tableEntries.length },
  ];

  return (
    <div className="min-h-screen bg-[#060c14] pb-[24rem] text-white md:pb-24">
      <SEO
        title="Football Data Center Kenya | Live Scores, Fixtures and Tables"
        description="BallMtaani Matches is a one-stop football data center for Kenyan fans with live matches, fixtures, results, standings, World Cup 2026 routes and match intelligence."
        keywords={[
          "football data center Kenya",
          "live football scores Kenya",
          "Premier League fixtures Kenya",
          "football standings",
          "World Cup 2026 fixtures",
          "BallMtaani matches",
        ]}
        path="/matches"
        breadcrumbs={[
          { name: "BallMtaani", url: "/" },
          { name: "Football Data Center", url: "/matches" },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "BallMtaani match data sections",
          "itemListElement": navItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "url": "https://ballmtaani.com/matches",
          })),
        }}
      />

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0">
          <img
            src="https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg"
            alt=""
            className="h-full w-full object-cover object-center opacity-30"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(179,0,0,0.35),transparent_50%),linear-gradient(180deg,rgba(6,12,20,0.2),#060c14_80%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-9">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.26em] text-primary">BallMtaani · Data Center</p>
              <h1 className="max-w-xl text-3xl font-black italic leading-none md:text-5xl">
                Every match. One place.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55 md:text-base">
                Live scores, fixtures, results, league tables and WC26 — real-time football data built for fans who never leave the site.
              </p>
              <DataFreshnessChip label={freshnessLabelSafe} className="mt-3" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <StatPill icon={Activity}    value={live.length}     label="Live Now"       tone="border-primary/40 text-primary" />
              <StatPill icon={CalendarDays} value={fixtures.length} label="Upcoming"       tone="border-blue-400/40 text-blue-300" />
              <StatPill icon={Clock3}      value={results.length}  label="Recent Results" tone="border-emerald-400/40 text-emerald-300" />
              <StatPill icon={Table2}      value={tableEntries.length} label="Tables"    tone="border-purple-400/40 text-purple-300" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        {/* ── Sticky nav + search ────────────────────────────────────────── */}
        <div className="sticky top-24 z-30 mb-5 rounded-2xl border border-white/8 bg-[#060c14]/96 px-3 py-3 backdrop-blur-xl lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-3">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-all ${
                    active
                      ? "border-primary bg-primary/15 text-white shadow-[0_0_12px_rgba(179,0,0,0.25)]"
                      : "border-white/10 bg-white/[0.02] text-white/42 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  {typeof item.count === "number" && item.count > 0 ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${active ? "bg-white/20 text-white" : "bg-white/8 text-white/50"}`}>
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2 lg:mt-0">
            <div className="relative min-w-0 flex-1 sm:w-52 lg:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/28" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search team or league"
                className="h-9 w-full rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/24 focus:border-primary/50"
              />
            </div>
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="h-9 rounded-full border border-white/10 bg-[#0d1824] px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60 outline-none focus:border-primary/50"
            >
              <option value="all">All leagues</option>
              {availableLeagues.map((league) => (
                <option key={league} value={league}>{league}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature links (desktop) */}
        <div className="mb-5 hidden gap-3 md:grid md:grid-cols-4">
          {FEATURE_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 ${item.tone}`}
              >
                <Icon className="mb-3 h-5 w-5 transition-transform group-hover:scale-110" />
                <div className="text-sm font-black uppercase text-white">{item.label}</div>
                <div className="mt-0.5 text-xs text-white/42">{item.sub}</div>
              </Link>
            );
          })}
        </div>

        <div className="mb-5">
          <AdBanner label="Matchday Data Partner" type="horizontal" />
        </div>

        {fetching && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
            <RotateCw className="h-3.5 w-3.5 animate-spin" />
            Syncing football data
          </div>
        )}

        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        {view === "overview" && (
          <div className="space-y-6">
            {/* Featured match */}
            {featuredMatch && (
              <FeaturedMatchBanner match={featuredMatch} variant={featuredVariant} />
            )}

            {/* Live / latest grid */}
            {overviewCards.length > 0 && (
              <section>
                <SectionHeader
                  title={live.length > 0 ? "More live now" : "Latest results"}
                  sub={live.length > 0 ? "Auto-refreshing" : undefined}
                  action={() => setView(live.length > 0 ? "live" : "results")}
                  actionLabel="View all"
                />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {overviewCards.map((match: any) => (
                    <MatchWidget key={`${match._variant}-${match.id}`} match={match} variant={match._variant} />
                  ))}
                </div>
              </section>
            )}

            {/* Fixtures preview */}
            <section>
              <SectionHeader
                title="Next fixtures"
                sub="Upcoming across top leagues"
                action={() => setView("fixtures")}
                actionLabel="All fixtures"
              />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {fixtures.slice(0, 6).length
                  ? fixtures.slice(0, 6).map((m: any) => <MatchWidget key={m.id} match={m} variant="fixture" />)
                  : <EmptyState title="No fixtures yet" body="Upcoming fixtures will load here as the data feed updates." />
                }
              </div>
            </section>

            {/* Tables mini */}
            {tableEntries.length > 0 && (
              <section>
                <SectionHeader
                  title="Standings"
                  sub="Top tables at a glance"
                  action={() => setView("tables")}
                  actionLabel="Full tables"
                />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {tableEntries.slice(0, 3).map(([league, rows]) => (
                    <StandingsWidget key={league} league={league} rows={rows} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── AFRICA ────────────────────────────────────────────────────── */}
        {view === "africa" && (
          <section>
            <AfricanFootballWidget compact={false} />
          </section>
        )}

        {/* ── LIVE ──────────────────────────────────────────────────────── */}
        {view === "live" && (
          <section>
            <SectionHeader title="Live now" sub="Auto-refreshes every 60 s" />
            {live.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {live.map((m: any) => <MatchWidget key={m.id} match={m} variant="live" />)}
              </div>
            ) : (
              <EmptyState title="No live matches right now" body="Check fixtures for upcoming kick-offs or browse results." />
            )}
          </section>
        )}

        {/* ── FIXTURES ──────────────────────────────────────────────────── */}
        {view === "fixtures" && (
          <section>
            <SectionHeader title="Upcoming fixtures" sub={`${fixtures.length} matches scheduled`} />
            {fixtures.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {fixtures.map((m: any) => <MatchWidget key={m.id} match={m} variant="fixture" />)}
              </div>
            ) : (
              <EmptyState title="No upcoming fixtures" body="Try a different league filter or clear your search." />
            )}
          </section>
        )}

        {/* ── RESULTS ───────────────────────────────────────────────────── */}
        {view === "results" && (
          <section>
            <SectionHeader title="Recent results" sub={`${results.length} results`} />
            {results.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {results.map((m: any) => <MatchWidget key={m.id} match={m} variant="result" />)}
              </div>
            ) : (
              <EmptyState title="No recent results" body="Try a different league filter or clear your search." />
            )}
          </section>
        )}

        {/* ── TABLES ────────────────────────────────────────────────────── */}
        {view === "tables" && (
          <section>
            {/* League selector chips with logos */}
            <div className="mb-5 flex flex-wrap gap-2">
              {[...TOP_LEAGUES, ...Object.keys(standingsWithFallback).filter((n) => !TOP_LEAGUES.includes(n))]
                .slice(0, 10)
                .map((league) => {
                  const logo = LEAGUE_LOGOS[league];
                  const active = tableLeague === league;
                  return (
                    <button
                      key={league}
                      onClick={() => setTableLeague(league)}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-all ${
                        active
                          ? "border-primary bg-primary/15 text-white shadow-[0_0_12px_rgba(179,0,0,0.2)]"
                          : "border-white/10 bg-white/[0.02] text-white/40 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {logo && <img src={logo} alt={league} className="h-4 w-4 object-contain" />}
                      {league}
                    </button>
                  );
                })}
            </div>

            {selectedStandings.length ? (
              <FullStandingsTable league={tableLeague} rows={selectedStandings} />
            ) : (
              <EmptyState title="No table loaded" body="Choose another league or wait for the standings feed to refresh." />
            )}

            {/* Zone legend */}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {[
                { cls: "bg-emerald-500", label: "Champions League" },
                { cls: "bg-blue-500",    label: "Europa League" },
                { cls: "bg-sky-400",     label: "Conference League" },
                { cls: "bg-red-500",     label: "Relegation" },
              ].map(({ cls, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`h-3 w-1 rounded-full ${cls}`} />
                  <span className="text-[10px] font-bold text-white/30">{label}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
