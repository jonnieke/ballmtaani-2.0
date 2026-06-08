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
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";
import DataFreshnessChip from "../components/DataFreshnessChip";
import { formatFreshnessLabel } from "../lib/freshness";
import type { TournamentStandingEntry } from "../lib/football-api";
import AfricanFootballWidget from "../components/AfricanFootballWidget";

type HubView = "overview" | "live" | "fixtures" | "results" | "tables" | "africa";

const FEATURE_LINKS = [
  { href: "/live-center", label: "Live Center", sub: "Open match pulse", icon: Radio, tone: "text-primary border-primary/35 bg-primary/10" },
  { href: "/market-watch", label: "Market Watch", sub: "Football signals", icon: BarChart3, tone: "text-green-300 border-green-400/35 bg-green-500/10" },
  { href: "/world-cup-2026", label: "WC26", sub: "Road to 2026", icon: Trophy, tone: "text-[#FFD700] border-[#FFD700]/35 bg-[#FFD700]/10" },
  { href: "/predictions", label: "Predictions", sub: "Make your call", icon: Goal, tone: "text-cyan-300 border-cyan-400/35 bg-cyan-500/10" },
];

const TOP_LEAGUES = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "KPL", "World Cup 2026"];

const WC26_OPENING_FIXTURES = [
  { home: "Mexico", away: "South Africa", date: "Jun 11", time: "10:00 PM", league: "World Cup 2026", id: "wc26-1" },
  { home: "USA", away: "Colombia", date: "Jun 12", time: "1:00 AM", league: "World Cup 2026", id: "wc26-2" },
  { home: "Canada", away: "Venezuela", date: "Jun 12", time: "4:00 PM", league: "World Cup 2026", id: "wc26-3" },
  { home: "Brazil", away: "Germany", date: "Jun 13", time: "7:00 PM", league: "World Cup 2026", id: "wc26-4" },
  { home: "Argentina", away: "Morocco", date: "Jun 14", time: "10:00 PM", league: "World Cup 2026", id: "wc26-5" },
  { home: "France", away: "England", date: "Jun 14", time: "1:00 AM", league: "World Cup 2026", id: "wc26-6" },
];

const WC26_GROUPS: Record<string, TournamentStandingEntry[]> = {
  "Group A": [
    { rank: 1, team: "Mexico", logo: "https://media.api-sports.io/flags/mx.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 2, team: "South Africa", logo: "https://media.api-sports.io/flags/za.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 3, team: "USA", logo: "https://media.api-sports.io/flags/us.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
    { rank: 4, team: "Colombia", logo: "https://media.api-sports.io/flags/co.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "A" },
  ],
  "Group B": [
    { rank: 1, team: "Canada", logo: "https://media.api-sports.io/flags/ca.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 2, team: "Venezuela", logo: "https://media.api-sports.io/flags/ve.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 3, team: "Spain", logo: "https://media.api-sports.io/flags/es.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
    { rank: 4, team: "Costa Rica", logo: "https://media.api-sports.io/flags/cr.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "B" },
  ],
  "Group C": [
    { rank: 1, team: "Brazil", logo: "https://media.api-sports.io/flags/br.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 2, team: "Germany", logo: "https://media.api-sports.io/flags/de.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 3, team: "Japan", logo: "https://media.api-sports.io/flags/jp.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
    { rank: 4, team: "Morocco", logo: "https://media.api-sports.io/flags/ma.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "C" },
  ],
  "Group D": [
    { rank: 1, team: "Argentina", logo: "https://media.api-sports.io/flags/ar.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 2, team: "Uruguay", logo: "https://media.api-sports.io/flags/uy.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 3, team: "Paraguay", logo: "https://media.api-sports.io/flags/py.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
    { rank: 4, team: "Egypt", logo: "https://media.api-sports.io/flags/eg.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "D" },
  ],
  "Group E": [
    { rank: 1, team: "France", logo: "https://media.api-sports.io/flags/fr.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 2, team: "England", logo: "https://media.api-sports.io/flags/gb-eng.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 3, team: "Belgium", logo: "https://media.api-sports.io/flags/be.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
    { rank: 4, team: "Slovakia", logo: "https://media.api-sports.io/flags/sk.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "E" },
  ],
  "Group F": [
    { rank: 1, team: "Netherlands", logo: "https://media.api-sports.io/flags/nl.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 2, team: "Sweden", logo: "https://media.api-sports.io/flags/se.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 3, team: "Austria", logo: "https://media.api-sports.io/flags/at.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
    { rank: 4, team: "Cameroon", logo: "https://media.api-sports.io/flags/cm.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "F" },
  ],
  "Group G": [
    { rank: 1, team: "Spain", logo: "https://media.api-sports.io/flags/es.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 2, team: "Italy", logo: "https://media.api-sports.io/flags/it.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 3, team: "Denmark", logo: "https://media.api-sports.io/flags/dk.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
    { rank: 4, team: "Serbia", logo: "https://media.api-sports.io/flags/rs.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "G" },
  ],
  "Group H": [
    { rank: 1, team: "Portugal", logo: "https://media.api-sports.io/flags/pt.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 2, team: "Poland", logo: "https://media.api-sports.io/flags/pl.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 3, team: "Czech Republic", logo: "https://media.api-sports.io/flags/cz.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
    { rank: 4, team: "Senegal", logo: "https://media.api-sports.io/flags/sn.svg", points: 0, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, gd: "0", form: [], group: "H" },
  ],
};

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function StatPill({ icon: Icon, value, label, tone }: { icon: typeof Activity; value: string | number; label: string; tone: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-[#0d131c]/86 p-3 md:p-4 ${tone}`}>
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-current/10 blur-2xl" />
      <Icon className="relative mb-2 h-5 w-5" />
      <div className="relative text-2xl font-bold text-white md:text-3xl">{value}</div>
      <div className="relative mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{label}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.03] p-6 text-center">
      <div className="text-sm font-bold uppercase tracking-[0.18em] text-white">{title}</div>
      <p className="mt-2 text-sm text-white/48">{body}</p>
    </div>
  );
}

function MatchCard({ match, variant = "fixture" }: { match: any; variant?: "live" | "fixture" | "result" }) {
  const isResult = variant === "result";
  const isLive = variant === "live";
  const status = isLive ? match.minute || match.status || "LIVE" : isResult ? "FT" : match.date || "Upcoming";
  const time = match.kickoff || match.time || "";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101721]/88 p-2.5 transition-colors hover:border-primary/45 hover:bg-[#121d2a] md:p-3">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">{match.league || "Football"}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            {isLive ? <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_currentColor]" /> : null}
            {status}
          </div>
        </div>
        {time ? <div className="shrink-0 text-right text-[11px] font-bold text-white/62">{time}</div> : null}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <div className="min-w-0 text-center">
          <TeamLogo logo={match.homeLogo} initial={match.homeInitial || String(match.home || "H").slice(0, 3)} color={match.homeColor || "#182333"} size="sm" className="mx-auto mb-1.5" />
          <div className="truncate text-sm font-semibold text-white">{match.home}</div>
        </div>
        <div className="min-w-[58px] text-center">
          {isResult || isLive ? (
            <div className="text-2xl font-bold text-white">
              <span className={Number(match.homeScore) > Number(match.awayScore) ? "text-primary" : ""}>{match.homeScore ?? 0}</span>
              <span className="mx-1 text-white/25">-</span>
              <span className={Number(match.awayScore) > Number(match.homeScore) ? "text-primary" : ""}>{match.awayScore ?? 0}</span>
            </div>
          ) : (
            <div className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/44">VS</div>
          )}
        </div>
        <div className="min-w-0 text-center">
          <TeamLogo logo={match.awayLogo} initial={match.awayInitial || String(match.away || "A").slice(0, 3)} color={match.awayColor || "#182333"} size="sm" className="mx-auto mb-1.5" />
          <div className="truncate text-sm font-semibold text-white">{match.away}</div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-white/8 pt-2.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">{match.date || "Matchday"}</div>
        <Link href={isLive ? `/live-center/${match.id}` : "/live-center"} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          Details <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function StandingMiniTable({ league, rows }: { league: string; rows: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c]/88">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold uppercase text-white">{league}</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">Top table</p>
        </div>
        <Table2 className="h-5 w-5 text-primary" />
      </div>
      <div className="px-3 py-2">
        {rows.slice(0, 5).map((team: any) => (
          <div key={`${league}-${team.rank}-${team.team}`} className="grid grid-cols-[26px_1fr_36px_42px] items-center border-b border-white/6 py-2 text-sm last:border-0">
            <span className="text-white/40">{team.rank}</span>
            <span className="flex min-w-0 items-center gap-2">
              <TeamLogo
                logo={team.logo}
                initial={String(team.team || "T").slice(0, 2)}
                color="#182333"
                size="sm"
                className="shrink-0"
              />
              <span className="truncate font-medium text-white">{team.team}</span>
            </span>
            <span className="text-center text-white/42">{team.played}</span>
            <span className="text-center font-bold text-primary">{team.points}</span>
          </div>
        ))}
      </div>
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

  const { data: liveMatches = [], isFetching: liveFetching } = useMatches();
  const { data: recentMatches = [], isFetching: recentFetching } = useRecentMatches();
  const { data: upcomingFixtures = [], isFetching: upcomingFetching } = useUpcomingFixtures();
  const { data: standings = {} as Record<string, any[]>, isFetching: standingsFetching } = useStandings();

  const hasApiData = liveMatches.length || recentMatches.length || upcomingFixtures.length || Object.keys(standings).length;
  const fixturesWithFallback = useMemo(() => {
    if (upcomingFixtures.length) return upcomingFixtures;
    return WC26_OPENING_FIXTURES;
  }, [upcomingFixtures]);

  const standingsWithFallback = useMemo(() => {
    if (Object.keys(standings).length) return standings;
    return WC26_GROUPS;
  }, [standings]);

  // Declare derived values BEFORE any effects that reference them
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
    if (hasApiData || !upcomingFetching && !standingsFetching) {
      setLastUpdated(new Date());
    }
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

  const live = useMemo(() => filtered(liveMatches), [liveMatches, leagueFilter, query]);
  const fixtures = useMemo(() => filtered(fixturesWithFallback), [fixturesWithFallback, leagueFilter, query]);
  const results = useMemo(() => filtered(recentMatches), [recentMatches, leagueFilter, query]);
  const selectedStandings = standingsWithFallback[tableLeague] || [];
  const fetching = liveFetching || recentFetching || upcomingFetching || standingsFetching;

  const featuredFixtures = fixtures.slice(0, 6);
  const featuredResults = results.slice(0, 4);
  const overviewSpotlight =
    live.length > 0
      ? live.slice(0, 4).map((m: any) => ({ ...m, _variant: "live" }))
      : featuredResults.length > 0
        ? featuredResults.map((m: any) => ({ ...m, _variant: "result" }))
        : featuredFixtures.slice(0, 4).map((m: any) => ({ ...m, _variant: "fixture" }));
  const tableEntries = Object.entries(standingsWithFallback).filter(([, rows]) => rows?.length > 0);

  const navItems: { id: HubView; label: string; icon: typeof Activity; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "africa", label: "Africa", icon: Trophy },
    { id: "live", label: "Live", icon: Activity, count: live.length },
    { id: "fixtures", label: "Fixtures", icon: CalendarDays, count: fixtures.length },
    { id: "results", label: "Results", icon: Clock3, count: results.length },
    { id: "tables", label: "Tables", icon: Table2, count: tableEntries.length },
  ];

  return (
    <div className="min-h-screen bg-[#070a0f] pb-[24rem] text-white md:pb-24">
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

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src="https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg"
            alt=""
            className="h-full w-full object-cover object-center opacity-45"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(239,35,48,0.48),transparent_24%),linear-gradient(180deg,rgba(7,10,15,0.35),#070a0f_82%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-9">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-primary">BallMtaani data center</p>
              <h1 className="max-w-3xl text-3xl font-bold italic leading-none md:text-5xl">Every match route in one place.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/66 md:text-base md:leading-7">
                Live scores, fixtures, recent results, league tables, WC26 and match detail paths, built for fans who do not want to leave the site for basic football data.
              </p>
              <DataFreshnessChip label={freshnessLabelSafe} className="mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <StatPill icon={Activity} value={live.length} label="Live Now" tone="border-primary/45 text-primary" />
              <StatPill icon={CalendarDays} value={fixtures.length} label="Upcoming" tone="border-blue-400/45 text-blue-300" />
              <StatPill icon={Clock3} value={results.length} label="Recent Results" tone="border-green-400/45 text-green-300" />
              <StatPill icon={Table2} value={tableEntries.length} label="Tables" tone="border-purple-400/45 text-purple-300" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <div className="sticky top-24 z-30 mb-4 grid gap-3 rounded-2xl border border-white/8 bg-[#070a0f]/92 px-3 py-3 backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                    active ? "border-primary bg-primary/18 text-white" : "border-white/10 bg-white/[0.03] text-white/48 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {typeof item.count === "number" ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{item.count}</span> : null}
                </button>
              );
            })}
          </div>

          <div className="grid gap-2 sm:flex">
            <div className="relative min-w-0 flex-1 sm:min-w-[220px] lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/32" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search team or league"
                className="h-10 w-full rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-primary/60"
              />
            </div>
            <select
              value={leagueFilter}
              onChange={(e) => setLeagueFilter(e.target.value)}
              className="h-10 w-full rounded-full border border-white/10 bg-[#101721] px-3 text-xs font-bold uppercase tracking-[0.12em] text-white/70 outline-none focus:border-primary/60 sm:w-auto"
            >
              <option value="all">All leagues</option>
              {availableLeagues.map((league) => (
                <option key={league} value={league}>
                  {league}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-5 hidden gap-3 md:grid md:grid-cols-4">
          {FEATURE_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`rounded-2xl border p-4 transition-transform hover:-translate-y-0.5 ${item.tone}`}>
                <Icon className="mb-3 h-6 w-6" />
                <div className="text-sm font-bold uppercase text-white">{item.label}</div>
                <div className="mt-1 text-xs text-white/48">{item.sub}</div>
              </Link>
            );
          })}
        </div>

        <div className="mb-5">
          <AdBanner label="Matchday Data Partner" type="horizontal" />
        </div>

        {fetching ? (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
            <RotateCw className="h-3.5 w-3.5 animate-spin" />
            Syncing football data
          </div>
        ) : null}

        {view === "overview" && (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl border border-white/10 bg-[#0b1119]/88 p-2.5 md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold uppercase">Live and latest</h2>
                  <p className="text-xs text-white/44">Open live center when a match needs deeper data.</p>
                </div>
                <button onClick={() => setView(live.length ? "live" : "results")} className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  View all
                </button>
              </div>
              <div className="grid gap-2.5 md:grid-cols-2">
                {overviewSpotlight.map((match: any) => (
                  <MatchCard key={`${match._variant}-${match.id}`} match={match} variant={match._variant} />
                ))}
              </div>
              {!overviewSpotlight.length ? <EmptyState title="No latest matches" body="The feed is empty right now. Try fixtures or tables while the API refreshes." /> : null}
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#0b1119]/88 p-2.5 md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold uppercase">Next fixtures</h2>
                  <p className="text-xs text-white/44">Upcoming matches across the main leagues.</p>
                </div>
                <button onClick={() => setView("fixtures")} className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  More
                </button>
              </div>
              <div className="space-y-3">
                {featuredFixtures.length ? featuredFixtures.map((match: any) => <MatchCard key={match.id} match={match} variant="fixture" />) : <EmptyState title="No fixtures" body="Upcoming fixtures will appear here as the data feed updates." />}
              </div>
            </section>

            <section className="xl:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase">League tables at a glance</h2>
                <button onClick={() => setView("tables")} className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Full tables
                </button>
              </div>
              {tableEntries.length ? (
                <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                  {tableEntries.slice(0, 3).map(([league, rows]) => <StandingMiniTable key={league} league={league} rows={rows} />)}
                </div>
              ) : (
                <EmptyState
                  title="No table data yet"
                  body="Standings will appear here as soon as the API feed brings them in."
                />
              )}
            </section>
          </div>
        )}

        {view === "africa" && (
          <section>
            <AfricanFootballWidget compact={false} />
          </section>
        )}

        {view === "live" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase">Live matches</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Auto refreshes</span>
            </div>
            {live.length ? (
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                {live.map((match: any) => <MatchCard key={match.id} match={match} variant="live" />)}
              </div>
            ) : (
              <EmptyState title="No live matches right now" body="Fans can still check fixtures, results, tables and WC26 from this page." />
            )}
          </section>
        )}

        {view === "fixtures" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase">Upcoming fixtures</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{fixtures.length} matches</span>
            </div>
            {fixtures.length ? (
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                {fixtures.map((match: any) => <MatchCard key={match.id} match={match} variant="fixture" />)}
              </div>
            ) : (
              <EmptyState title="No upcoming fixtures" body="Try a different league filter or clear your search." />
            )}
          </section>
        )}

        {view === "results" && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase">Recent results</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{results.length} results</span>
            </div>
            {results.length ? (
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                {results.map((match: any) => <MatchCard key={match.id} match={match} variant="result" />)}
              </div>
            ) : (
              <EmptyState title="No recent results" body="Try a different league filter or clear your search." />
            )}
          </section>
        )}

        {view === "tables" && (
          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              {[...TOP_LEAGUES, ...Object.keys(standingsWithFallback).filter((name) => !TOP_LEAGUES.includes(name))].slice(0, 10).map((league) => (
                <button
                  key={league}
                  onClick={() => setTableLeague(league)}
                  className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    tableLeague === league ? "border-primary bg-primary/18 text-white" : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }`}
                >
                  {league}
                </button>
              ))}
            </div>
            {selectedStandings.length ? (
              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0b1119]/90">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-white/10 bg-black/24">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">
                      <th className="p-3 text-center">#</th>
                      <th className="p-3 text-left">Club</th>
                      <th className="p-3 text-center">P</th>
                      <th className="p-3 text-center">W</th>
                      <th className="p-3 text-center">D</th>
                      <th className="p-3 text-center">L</th>
                      <th className="p-3 text-center">GD</th>
                      <th className="p-3 text-center">Pts</th>
                      <th className="p-3 text-left">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStandings.map((team: any) => (
                      <tr key={`${team.rank}-${team.team}`} className="border-b border-white/6 last:border-0 hover:bg-white/[0.03]">
                        <td className="p-3 text-center text-sm text-white/45">{team.rank}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img src={team.logo} alt={team.team} className="h-6 w-6 object-contain" />
                            <span className="font-semibold text-white">{team.team}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-sm text-white/50">{team.played}</td>
                        <td className="p-3 text-center text-sm text-white/50">{team.won}</td>
                        <td className="p-3 text-center text-sm text-white/50">{team.draw}</td>
                        <td className="p-3 text-center text-sm text-white/50">{team.lost}</td>
                        <td className="p-3 text-center text-sm text-white/50">{team.gd}</td>
                        <td className="p-3 text-center text-base font-bold text-primary">{team.points}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {(team.form || []).slice(-5).map((f: string, idx: number) => (
                              <span key={`${team.rank}-${idx}`} className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${f === "W" ? "bg-green-600/20 text-green-300" : f === "D" ? "bg-white/10 text-white/55" : "bg-red-600/20 text-red-300"}`}>
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No table loaded" body="Choose another league or wait for the standings feed to refresh." />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

