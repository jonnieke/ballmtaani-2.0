/**
 * Service for interacting with the Football API (API-Sports).
 * All endpoints filter by major leagues to ensure data accuracy.
 */
import { getLeagueById } from "../config/football-catalog";

// Route all football API calls through our server-side proxy.
// Direct browser → api-sports.io is blocked by CORS in production.
// The proxy at /api/football/[...path] forwards requests server-side
// and keeps the API key out of the browser bundle.
const API_BASE_URL = '/api/football';
const API_KEY = 'proxied'; // actual key lives on the server only

// ─── Request throttle: max N concurrent + 150ms gap ─────────
// API-Sports Ultra allows 500 req/min but bursting 16 parallel
// requests on page load still trips the per-second guard.
// This helper runs tasks in batches of `concurrency` with a small
// inter-batch delay so we never flood the API in one tick.
async function throttledAll<T>(
  tasks: (() => Promise<T>)[],
  concurrency = 3,
  delayMs = 150
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(t => t()));
    results.push(...batchResults);
    if (i + concurrency < tasks.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}

// ─── Major League IDs (API-Football) ────────────────────────
export const MAJOR_LEAGUE_IDS = {
  "FIFA World Cup": 1,
  "Premier League": 39,
  "La Liga": 140,
  "Serie A": 135,
  "Bundesliga": 78,
  "Ligue 1": 61,
  "UEFA Champions League": 2,
  "UEFA Europa League": 3,
  // African Leagues
  "CAF Champions League": 12,
  // Country-validated East African competitions. Never restore 686: it is not Kenya.
  "FKF Premier League": 276,
  "Kenya Super League": 277,
  "Uganda Premier League": 585,
  "Tanzania Ligi Kuu Bara": 567,
  "Rwanda National Soccer League": 405,
  "South Africa PSL": 288,
  "Nigeria NPFL": 332,
};

const ALL_LEAGUE_IDS = Object.values(MAJOR_LEAGUE_IDS);

// Current season (API-Football uses the year the season started)
function getCurrentSeasonStartYear(now = new Date()): number {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  return month >= 7 ? year : year - 1;
}
const CURRENT_SEASON = getCurrentSeasonStartYear();
const SEASON_CANDIDATES = [CURRENT_SEASON, CURRENT_SEASON - 1, CURRENT_SEASON + 1];
const FIXTURE_TEAM_CACHE_TTL_MS = 5 * 60 * 1000;
const LIVE_SUMMARY_CACHE_TTL_MS = 15 * 1000;
const fixtureTeamCache = new Map<string, { homeTeamId: number | null; awayTeamId: number | null; expiresAt: number }>();
const liveSummaryCache = new Map<string, { value: LiveEventSummary; expiresAt: number }>();
const liveSummaryInflight = new Map<string, Promise<LiveEventSummary>>();
const apiResponseCache = new Map<string, { value: any; expiresAt: number }>();
const apiResponseInflight = new Map<string, Promise<any>>();
const STORAGE_PREFIX = "ballmtaani:football-api:";
const STORAGE_MAX_AGE_MS = 60 * 60 * 1000; // keep last known good football data for one hour

type PersistedApiResponse = {
  value: any;
  savedAt: number;
};

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function storageKey(endpoint: string) {
  return `${STORAGE_PREFIX}${endpoint}`;
}

function readPersistedResponse(endpoint: string): PersistedApiResponse | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(storageKey(endpoint));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedApiResponse;
    if (!parsed || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > STORAGE_MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedResponse(endpoint: string, value: any) {
  if (!canUseStorage()) return;

  try {
    const payload: PersistedApiResponse = { value, savedAt: Date.now() };
    window.localStorage.setItem(storageKey(endpoint), JSON.stringify(payload));
  } catch {
    // Ignore storage quota / serialization issues.
  }
}

function getEndpointCacheTtl(endpoint: string): number {
  if (endpoint.includes("/fixtures?live=all")) return 15 * 1000;
  if (endpoint.includes("_sub=statistics") || endpoint.includes("_sub=events") || endpoint.includes("_sub=lineups") || endpoint.includes("/fixtures?id=") || endpoint.includes("/fixtures?fixture=")) return 60 * 1000;
  if (endpoint.includes("/fixtures?date=") || endpoint.includes("&next=") || endpoint.includes("&from=") || endpoint.includes("&to=")) return 60 * 1000;
  if (endpoint.includes("/standings?")) return 5 * 60 * 1000;
  if (endpoint.includes("/teams/statistics?")) return 10 * 60 * 1000;
  return 30 * 1000;
}


// ─── Shared fetch helper ────────────────────────────────────
async function apiFetch(endpoint: string): Promise<any> {
  const now = Date.now();
  const cached = apiResponseCache.get(endpoint);
  if (cached && cached.expiresAt > now) return cached.value;

  const inflight = apiResponseInflight.get(endpoint);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      // Calls /api/football/... ??? no auth header needed, proxy adds it server-side
      const response = await fetch(`${API_BASE_URL}${endpoint}`);

      if (!response.ok) {
        console.error(`[Football API] HTTP Error ${response.status} for ${endpoint}`);
        return null;
      }

      const data = await response.json();

      // Check for API-Football logic errors in 200 responses
      if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
        console.error(`[Football API] Logic Error in ${endpoint}:`, data.errors);
        return null;
      }

      const value = data.response || [];
      apiResponseCache.set(endpoint, { value, expiresAt: Date.now() + getEndpointCacheTtl(endpoint) });
      writePersistedResponse(endpoint, value);
      return value;
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
      const persisted = readPersistedResponse(endpoint);
      const stale = apiResponseCache.get(endpoint)?.value ?? persisted?.value;
      if (stale !== undefined) return stale;
      return null;
    } finally {
      apiResponseInflight.delete(endpoint);
    }
  })();

  apiResponseInflight.set(endpoint, request);
  return request;
}

export interface LiveMatch {
  id: string;
  homeTeamId?: number;
  awayTeamId?: number;
  home: string;
  homeLogo: string;
  homeColor: string;
  homeInitial: string;
  away: string;
  awayLogo: string;
  awayColor: string;
  awayInitial: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  league: string;
  leagueId: number;
  leagueLogo: string;
  possession?: string;
  scorers?: string;
  status: string;
  venue?: string;
  time?: string;
  date?: string;
  kickoffAt?: number;
}

export interface StandingEntry {
  rank: number;
  team: string;
  logo: string;
  points: number;
  played: number;
  gd: string;
  form: string[];
  won: number;
  draw: number;
  lost: number;
}

async function fetchWithSeasonFallback(
  buildEndpoint: (season: number) => string,
  seasons: number[] = SEASON_CANDIDATES,
): Promise<any[]> {
  for (const season of seasons) {
    const data = await apiFetch(buildEndpoint(season));
    if (Array.isArray(data) && data.length > 0) return data;
  }
  return [];
}

export interface TournamentStandingEntry extends StandingEntry {
  group: string;
  goalsFor: number;
  goalsAgainst: number;
}

export interface FixtureEvent {
  min: number;
  type: string;
  team: 'home' | 'away';
  player: string;
  assist?: string;
  detail?: string;
  playerIn?: string;
  playerOut?: string;
}

export interface LiveEventSummary {
  goals: number;
  cards: number;
  reds: number;
  subs: number;
}

export interface FixtureStat {
  label: string;
  home: number;
  away: number;
  unit?: string;
}

export interface PlayerLineup {
  pos: string;
  name: string;
  number: number;
  rating: number;
}

export interface TeamLineup {
  formation: string;
  players: PlayerLineup[];
}

export interface TeamSeasonStats {
  team: string;
  logo: string;
  league: string;
  fixtures: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
  };
  goals: {
    for: number;
    against: number;
  };
  cleanSheets: {
    total: number;
    home: number;
    away: number;
  };
  failedToScore: {
    total: number;
    home: number;
    away: number;
  };
}

// ─── 1. LIVE MATCHES (filtered to major leagues) ────────────
export async function fetchLiveMatches(): Promise<LiveMatch[]> {
  const raw = await apiFetch('/fixtures?live=all');
  if (!raw) return [];

  // Filter to major leagues only
  const majorLeagueMatches = raw.filter(
    (item: any) => ALL_LEAGUE_IDS.includes(item.league.id)
  );

  return majorLeagueMatches.map((item: any) => ({
    id: String(item.fixture.id),
    homeTeamId: item.teams.home.id,
    awayTeamId: item.teams.away.id,
    home: item.teams.home.name,
    homeLogo: item.teams.home.logo,
    homeColor: "#555",
    homeInitial: item.teams.home.name.substring(0, 3).toUpperCase(),
    away: item.teams.away.name,
    awayLogo: item.teams.away.logo,
    awayColor: "#777",
    awayInitial: item.teams.away.name.substring(0, 3).toUpperCase(),
    homeScore: item.goals.home ?? 0,
    awayScore: item.goals.away ?? 0,
    minute: item.fixture.status.elapsed ? `${item.fixture.status.elapsed}'` : "Live",
    league: item.league.name,
    leagueId: item.league.id,
    leagueLogo: item.league.logo,
    status: item.fixture.status.short,
    possession: "N/A",
    scorers: "",
    venue: [item.fixture.venue?.name, item.fixture.venue?.city].filter(Boolean).join(", "),
  }));
}

// ─── 2a. TODAY'S FIXTURES — all major league matches today by date ───────────
// Uses /fixtures?date=YYYY-MM-DD — most reliable way to get today's matches
export async function fetchFixturesByDate(dateKey: string): Promise<LiveMatch[]> {
  const raw = await apiFetch(`/fixtures?date=${dateKey}&timezone=Africa/Nairobi`);
  if (!raw || !raw.length) return [];

  // Includes only country-validated East African IDs. 686 is not a Kenyan competition.
  const majorLeagues = new Set([1, 2, 3, 12, 39, 140, 135, 78, 61, 276, 277, 585, 567, 405]);

  return raw
    .filter((item: any) => majorLeagues.has(item.league?.id))
    .map((item: any) => ({
      id: String(item.fixture.id),
      homeTeamId: item.teams.home.id,
      awayTeamId: item.teams.away.id,
      home: item.teams.home.name,
      homeLogo: item.teams.home.logo,
      homeColor: "#555",
      homeInitial: item.teams.home.name.substring(0, 3).toUpperCase(),
      away: item.teams.away.name,
      awayLogo: item.teams.away.logo,
      awayColor: "#777",
      awayInitial: item.teams.away.name.substring(0, 3).toUpperCase(),
      homeScore: item.goals?.home ?? 0,
      awayScore: item.goals?.away ?? 0,
      minute: item.fixture.status?.elapsed ? `${item.fixture.status.elapsed}'` : "",
      time: new Date(item.fixture.date).toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Africa/Nairobi',
      }),
      league: item.league.name,
      leagueId: item.league.id,
      leagueLogo: item.league.logo,
      status: item.fixture.status?.short || 'NS',
      venue: [item.fixture.venue?.name, item.fixture.venue?.city].filter(Boolean).join(", "),
      date: dateKey,
      kickoffAt: new Date(item.fixture.date).getTime(),
    }))
    .sort((a: any, b: any) => {
      const priority: Record<number, number> = { 276:0, 277:1, 585:2, 567:3, 405:4, 12:5, 39:6, 2:7, 3:8, 140:9, 135:10, 78:11, 61:12, 1:13 };
      const pa = priority[a.leagueId] ?? 99;
      const pb = priority[b.leagueId] ?? 99;
      if (pa !== pb) return pa - pb;
      return a.kickoffAt - b.kickoffAt;
    });
}

export async function fetchTodaysFixtures(): Promise<LiveMatch[]> {
  const todayEAT = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
  return fetchFixturesByDate(todayEAT);
}

// ─── 2. UPCOMING FIXTURES (next matches from major leagues) ─
const WC26_LIVE_START = new Date("2026-06-11T17:00:00Z").getTime();
const WC26_LIVE_END   = new Date("2026-07-20T00:00:00Z").getTime();

export async function fetchUpcomingFixtures(): Promise<any[]> {
  const now = Date.now();
  const wc26IsLive = now >= WC26_LIVE_START && now < WC26_LIVE_END;

  // July 20 → Aug 21: WC26 done, leagues not started yet — query pre-season friendlies + early UCL qualifiers
  const WC26_END_MS = WC26_LIVE_END;
  const PL_START_MS = new Date("2026-08-21T19:00:00Z").getTime();
  const isPreSeasonGap = now >= WC26_END_MS && now < PL_START_MS;

  const leagueSeasons: [number, number][] = wc26IsLive
    ? [
        [1, 2026],   // World Cup 2026
        [12, 2025],  // CAF Champions League (final runs to July)
      ]
    : isPreSeasonGap
    ? [
        [567, 2026], // Tanzania Ligi Kuu Bara - verified East Africa coverage
        [667, 2026], // Pre-Season Friendlies 2026
        [2, 2026],   // UCL qualifying rounds
        [12, CURRENT_SEASON],  // CAF Champions League
        [39, CURRENT_SEASON],  // Premier League opening fixtures
      ]
    : [
        [567, CURRENT_SEASON], // Tanzania Ligi Kuu Bara
        [2, CURRENT_SEASON],   // UCL
        [3, CURRENT_SEASON],   // UEL
        [12, CURRENT_SEASON],  // CAF Champions League
        [39, CURRENT_SEASON],  // Premier League
        [140, CURRENT_SEASON], // La Liga
        [135, CURRENT_SEASON], // Serie A
        [78, CURRENT_SEASON],  // Bundesliga
        [61, CURRENT_SEASON],  // Ligue 1
      ];

  // Throttle to 3 concurrent + 150ms between batches — avoids per-second
  // rate-limit on API-Sports even on the Ultra plan.
  const results = await throttledAll(
    leagueSeasons.map(([leagueId, season]) =>
      () => apiFetch(`/fixtures?league=${leagueId}&season=${season}&next=5`).catch(() => null)
    ),
    3,
    150
  );

  const allFixtures: any[] = [];
  for (const raw of results) {
    if (!raw || !raw.length) continue;
    const mapped = raw.map((item: any) => ({
      id: String(item.fixture.id),
      homeTeamId: item.teams.home.id,
      awayTeamId: item.teams.away.id,
      home: item.teams.home.name,
      homeLogo: item.teams.home.logo,
      homeColor: "#555",
      homeInitial: item.teams.home.name.substring(0, 3).toUpperCase(),
      away: item.teams.away.name,
      awayLogo: item.teams.away.logo,
      awayColor: "#777",
      awayInitial: item.teams.away.name.substring(0, 3).toUpperCase(),
      time: new Date(item.fixture.date).toLocaleTimeString('en-KE', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Africa/Nairobi'
      }) + ' EAT',
      league: item.league.name,
      leagueId: item.league.id,
      leagueLogo: item.league.logo,
      date: formatRelativeDate(item.fixture.date),
      kickoffAt: new Date(item.fixture.date).getTime(),
      venue: [item.fixture.venue?.name, item.fixture.venue?.city].filter(Boolean).join(", "),
    }));
    allFixtures.push(...mapped);
  }

  return allFixtures.sort((a: any, b: any) => (a.kickoffAt || 0) - (b.kickoffAt || 0));
}

export async function fetchLeagueFixtures(leagueId: number, season: number, next = 8): Promise<any[]> {
  const raw = await apiFetch(`/fixtures?league=${leagueId}&season=${season}&next=${next}`);
  if (!raw || raw.length === 0) return [];

  return raw.map((item: any) => ({
    id: String(item.fixture.id),
    homeTeamId: item.teams.home.id,
    awayTeamId: item.teams.away.id,
    home: item.teams.home.name,
    homeLogo: item.teams.home.logo,
    homeColor: "#555",
    homeInitial: item.teams.home.name.substring(0, 3).toUpperCase(),
    away: item.teams.away.name,
    awayLogo: item.teams.away.logo,
    awayColor: "#777",
    awayInitial: item.teams.away.name.substring(0, 3).toUpperCase(),
    time: new Date(item.fixture.date).toLocaleTimeString('en-KE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi'
    }),
    league: item.league.name,
    leagueId: item.league.id,
    leagueLogo: item.league.logo,
    date: new Date(item.fixture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    group: item.league.round || "World Cup 2026",
    timestamp: new Date(item.fixture.date).getTime(),
  }));
}

export async function fetchTournamentFixtures(leagueId: number, season: number): Promise<any[]> {
  const raw = await apiFetch(`/fixtures?league=${leagueId}&season=${season}`);
  if (!raw || raw.length === 0) return [];

  return raw.map((item: any) => ({
    id: String(item.fixture.id),
    home: item.teams.home.name,
    homeLogo: item.teams.home.logo,
    homeInitial: item.teams.home.name.substring(0, 3).toUpperCase(),
    away: item.teams.away.name,
    awayLogo: item.teams.away.logo,
    awayInitial: item.teams.away.name.substring(0, 3).toUpperCase(),
    homeScore: item.goals?.home ?? null,
    awayScore: item.goals?.away ?? null,
    minute: item.fixture.status?.elapsed ?? null,
    time: new Date(item.fixture.date).toLocaleTimeString('en-KE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi'
    }),
    date: new Date(item.fixture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    venue: item.fixture.venue?.name || "Venue TBC",
    city: item.fixture.venue?.city || "",
    status: item.fixture.status?.short || "NS",
    round: item.league.round || "World Cup 2026",
    timestamp: new Date(item.fixture.date).getTime(),
  })).sort((a: any, b: any) => a.timestamp - b.timestamp);
}

export async function fetchWC26TopScorers(): Promise<any[]> {
  // Uses a direct fetch (not apiFetch) so plan-limited 404s are silent —
  // top scorers is a bonus display and should never error the console.
  try {
    const res = await fetch(`${API_BASE_URL}/players/topscorers?league=1&season=2026`);
    if (!res.ok) return [];
    const json = await res.json();
    const raw = json?.response;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.slice(0, 10).map((item: any) => ({
      name: item.player?.name || "Unknown",
      photo: item.player?.photo || "",
      nationality: item.player?.nationality || "",
      team: item.statistics?.[0]?.team?.name || "",
      teamLogo: item.statistics?.[0]?.team?.logo || "",
      goals: item.statistics?.[0]?.goals?.total ?? 0,
      assists: item.statistics?.[0]?.goals?.assists ?? 0,
      played: item.statistics?.[0]?.games?.appearences ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function fetchTournamentStandings(leagueId: number, season: number): Promise<Record<string, TournamentStandingEntry[]>> {
  const raw = await apiFetch(`/standings?league=${leagueId}&season=${season}`);
  if (!raw || raw.length === 0) return {};

  const groups = raw[0]?.league?.standings || [];
  if (leagueId === 1 && season === 2026 && !hasTrustedWorldCupGroups(groups)) {
    console.warn("API-Football returned untrusted World Cup 2026 standings; suppressing tables.");
    return {};
  }

  const result: Record<string, TournamentStandingEntry[]> = {};

  groups.forEach((groupRows: any[]) => {
    groupRows.forEach((entry: any) => {
      const groupName = entry.group || "World Cup";
      if (!result[groupName]) result[groupName] = [];
      result[groupName].push({
        rank: entry.rank,
        team: entry.team.name,
        logo: entry.team.logo,
        points: entry.points,
        played: entry.all.played,
        gd: entry.goalsDiff > 0 ? `+${entry.goalsDiff}` : String(entry.goalsDiff),
        form: (entry.form || "").split("").slice(-5),
        won: entry.all.win,
        draw: entry.all.draw,
        lost: entry.all.lose,
        group: groupName,
        goalsFor: entry.all.goals?.for ?? 0,
        goalsAgainst: entry.all.goals?.against ?? 0,
      });
    });
  });

  return result;
}

function hasTrustedWorldCupGroups(groups: any[]): boolean {
  // Require at least one group with at least one entry that has the
  // minimum structure the renderer needs.  The pre-tournament guard that
  // demanded exactly 12 groups × 4 teams was suppressing real in-progress
  // data from API-Football (logos missing, group count != 12 mid-draw, etc.)
  if (!Array.isArray(groups) || groups.length === 0) return false;

  for (const groupRows of groups) {
    if (!Array.isArray(groupRows) || groupRows.length === 0) return false;
    for (const entry of groupRows) {
      if (!entry?.team?.name) return false;
      if (!entry?.all || typeof entry.all.played !== "number") return false;
    }
  }

  return true;
}

function formatRelativeDate(dateStr: string): string {
  const matchDate = new Date(dateStr);
  const now = new Date();
  const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const localMatch = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
  const diffDays = Math.round((localMatch.getTime() - localNow.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ─── 2b. RECENT MATCHES (past 5 days from major leagues) ─────
export async function fetchRecentMatches(): Promise<any[]> {
  // Was: sequential loop × 3 season fallbacks = 15 API calls
  // Now: parallel Promise.all = 5 API calls simultaneously
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 5);
  const fromStr = fromDate.toISOString().split('T')[0];
  const toStr = toDate.toISOString().split('T')[0];

  // During WC26: only WC26+CAF have live matches — skip off-season European leagues.
  const wc26IsLive = Date.now() >= WC26_LIVE_START && Date.now() < WC26_LIVE_END;
  const leagueSeasons: [number, number][] = wc26IsLive
    ? [
        [1, 2026],   // World Cup 2026
        [12, 2025],  // CAF Champions League
      ]
    : [
        [1, 2026],   // World Cup 2026
        [39, CURRENT_SEASON],  // Premier League
        [140, CURRENT_SEASON], // La Liga
        [135, CURRENT_SEASON], // Serie A
        [78, CURRENT_SEASON],  // Bundesliga
        [61, CURRENT_SEASON],  // Ligue 1
      ];

  const results = await throttledAll(
    leagueSeasons.map(([leagueId, season]) =>
      () => apiFetch(`/fixtures?league=${leagueId}&season=${season}&from=${fromStr}&to=${toStr}&status=FT-AET-PEN`).catch(() => null)
    ),
    3,
    150
  );

  const allFixtures: any[] = [];
  for (const raw of results) {
    if (!raw || !raw.length) continue;
    const mapped = raw.map((item: any) => ({
      id: String(item.fixture.id),
      homeTeamId: item.teams.home.id,
      awayTeamId: item.teams.away.id,
      home: item.teams.home.name,
      homeLogo: item.teams.home.logo,
      homeColor: "#555",
      homeInitial: item.teams.home.name.substring(0, 3).toUpperCase(),
      away: item.teams.away.name,
      awayLogo: item.teams.away.logo,
      awayColor: "#777",
      awayInitial: item.teams.away.name.substring(0, 3).toUpperCase(),
      homeScore: item.goals.home ?? 0,
      awayScore: item.goals.away ?? 0,
      league: item.league.name,
      leagueId: item.league.id,
      leagueLogo: item.league.logo,
      date: new Date(item.fixture.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      kickoff: new Date(item.fixture.date).toLocaleTimeString('en-KE', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Africa/Nairobi'
      }),
      status: item.fixture.status?.short || "FT",
      venue: [item.fixture.venue?.name, item.fixture.venue?.city].filter(Boolean).join(", "),
      timestamp: new Date(item.fixture.date).getTime()
    }));
    allFixtures.push(...mapped);
  }

  return allFixtures.sort((a, b) => b.timestamp - a.timestamp);
}

// ─── 3. STANDINGS (per league) ──────────────────────────────
export async function fetchStandings(leagueId: number): Promise<StandingEntry[]> {
  const season = getLeagueById(leagueId)?.currentSeason ?? CURRENT_SEASON;
  const raw = await apiFetch(`/standings?league=${leagueId}&season=${season}`);
  if (!raw || raw.length === 0) return [];

  const league = raw[0]?.league;
  if (!league?.standings?.[0]) return [];

  return league.standings[0].map((entry: any) => ({
    rank: entry.rank,
    team: entry.team.name,
    logo: entry.team.logo,
    points: entry.points,
    played: entry.all.played,
    gd: entry.goalsDiff > 0 ? `+${entry.goalsDiff}` : String(entry.goalsDiff),
    form: (entry.form || "").split("").slice(-5), // Last 5 results as array: ["W","D","L",...]
    won: entry.all.win,
    draw: entry.all.draw,
    lost: entry.all.lose
  }));
}

export async function fetchAllStandings(): Promise<Record<string, StandingEntry[]>> {
  const leagueMap: Record<string, number> = {
    "Premier League": 39,
    "La Liga": 140,
    "Serie A": 135,
    "Bundesliga": 78,
    "Ligue 1": 61,
    // KPL (686) removed — returns Czech teams, not Kenya Premier League
    // SA PSL and Nigeria NPFL excluded — standings data unreliable mid-season
  };

  const result: Record<string, StandingEntry[]> = {};

  // Throttle standings — 5 leagues, 3 at a time to stay under rate limit
  const entries = Object.entries(leagueMap);
  const standings = await throttledAll(
    entries.map(([, id]) => () => fetchStandings(id)),
    3,
    150
  );

  entries.forEach(([name], idx) => {
    if (standings[idx] && standings[idx].length > 0) {
      result[name] = standings[idx];
    }
  });

  // WC26 group standings — fetched separately (tournament format, multi-group)
  try {
    const wc26Groups = await fetchTournamentStandings(1, 2026);
    Object.assign(result, wc26Groups);
  } catch {
    // Suppress — WC26 groups are shown via static fallback in the UI
  }

  return result;
}

// ─── 4. FIXTURE DETAIL (stats, events, lineups) ─────────────
export async function fetchFixtureStats(fixtureId: string): Promise<FixtureStat[]> {
  const raw = await apiFetch(`/fixtures?fixture=${fixtureId}&_sub=statistics`);
  if (!raw || raw.length < 2) return [];

  const homeStats = raw[0]?.statistics || [];
  const awayStats = raw[1]?.statistics || [];

  const STAT_LABELS: Record<string, { label: string; unit?: string }> = {
    "Ball Possession": { label: "Possession", unit: "%" },
    "Total Shots": { label: "Shots" },
    "Shots on Goal": { label: "Shots on Target" },
    "Corner Kicks": { label: "Corners" },
    "Fouls": { label: "Fouls" },
    "Total passes": { label: "Passes" },
    "Passes accurate": { label: "Pass Accuracy", unit: "%" },
    "expected_goals": { label: "xG" },
  };

  return homeStats
    .map((hs: any, idx: number) => {
      const as = awayStats[idx];
      const config = STAT_LABELS[hs.type];
      if (!config) return null;

      const homeVal = parseInt(String(hs.value).replace('%', '')) || 0;
      const awayVal = parseInt(String(as?.value).replace('%', '')) || 0;

      return {
        label: config.label,
        home: homeVal,
        away: awayVal,
        unit: config.unit
      };
    })
    .filter(Boolean) as FixtureStat[];
}

export async function fetchFixtureEvents(fixtureId: string): Promise<FixtureEvent[]> {
  const raw = await apiFetch(`/fixtures?fixture=${fixtureId}&_sub=events`);
  if (!raw || raw.length === 0) return [];

  const now = Date.now();
  const cached = fixtureTeamCache.get(fixtureId);
  let homeTeamId: number | null = null;
  let awayTeamId: number | null = null;

  if (cached && cached.expiresAt > now) {
    homeTeamId = cached.homeTeamId;
    awayTeamId = cached.awayTeamId;
  } else {
    const fixtureDetails = await apiFetch(`/fixtures?id=${fixtureId}`);
    const fixture = fixtureDetails && fixtureDetails.length > 0 ? fixtureDetails[0] : null;
    homeTeamId = fixture?.teams?.home?.id ?? null;
    awayTeamId = fixture?.teams?.away?.id ?? null;
    fixtureTeamCache.set(fixtureId, {
      homeTeamId,
      awayTeamId,
      expiresAt: now + FIXTURE_TEAM_CACHE_TTL_MS
    });
  }

  return raw.map((event: any) => {
    let type = "other";
    if (event.type === "Goal") type = "goal";
    else if (event.type === "Card" && event.detail === "Yellow Card") type = "yellow";
    else if (event.type === "Card" && event.detail === "Red Card") type = "red";
    else if (event.type === "subst") type = "sub";

    const eventTeamId = event.team?.id ?? null;
    let side: 'home' | 'away' = "home";
    if (eventTeamId !== null && awayTeamId !== null && eventTeamId === awayTeamId) side = "away";
    if (eventTeamId !== null && homeTeamId !== null && eventTeamId === homeTeamId) side = "home";
    if (homeTeamId === null && awayTeamId === null) {
      side = eventTeamId === raw[0]?.team?.id ? "home" : "away";
    }

    return {
      min: event.time.elapsed || 0,
      type,
      team: side,
      player: event.player?.name || "",
      assist: event.assist?.name || "",
      detail: event.detail,
      playerIn: type === "sub" ? event.assist?.name : undefined,
      playerOut: type === "sub" ? event.player?.name : undefined
    };
  });
}

export async function fetchLiveEventSummary(fixtureId: string): Promise<LiveEventSummary> {
  const now = Date.now();
  const cached = liveSummaryCache.get(fixtureId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inflight = liveSummaryInflight.get(fixtureId);
  if (inflight) return inflight;

  const job = (async () => {
    const events = await fetchFixtureEvents(fixtureId);
    if (!events || events.length === 0) {
      const empty = { goals: 0, cards: 0, reds: 0, subs: 0 };
      liveSummaryCache.set(fixtureId, { value: empty, expiresAt: now + LIVE_SUMMARY_CACHE_TTL_MS });
      return empty;
    }

    let goals = 0;
    let cards = 0;
    let reds = 0;
    let subs = 0;

    for (const event of events) {
      if (event.type === "goal") goals += 1;
      if (event.type === "yellow") cards += 1;
      if (event.type === "red") reds += 1;
      if (event.type === "sub") subs += 1;
    }

    const summary = { goals, cards, reds, subs };
    liveSummaryCache.set(fixtureId, { value: summary, expiresAt: Date.now() + LIVE_SUMMARY_CACHE_TTL_MS });
    return summary;
  })();

  liveSummaryInflight.set(fixtureId, job);
  try {
    return await job;
  } finally {
    liveSummaryInflight.delete(fixtureId);
  }
}

export async function fetchFixtureLineups(fixtureId: string): Promise<{ home: TeamLineup | null; away: TeamLineup | null }> {
  const raw = await apiFetch(`/fixtures?fixture=${fixtureId}&_sub=lineups`);
  if (!raw || raw.length < 2) return { home: null, away: null };

  const mapLineup = (team: any): TeamLineup => ({
    formation: team.formation || "4-3-3",
    players: (team.startXI || []).map((p: any) => ({
      pos: p.player.pos || "??",
      name: p.player.name?.split(' ').pop() || p.player.name || "Unknown",
      number: p.player.number || 0,
      rating: 7.0 // API doesn't provide live ratings in this endpoint
    }))
  });

  return {
    home: mapLineup(raw[0]),
    away: mapLineup(raw[1])
  };
}

export async function fetchTeamSeasonStats(
  teamId: number | string,
  leagueId: number | string,
  season = CURRENT_SEASON,
): Promise<TeamSeasonStats | null> {
  let stats: any = null;
  for (const year of [season, CURRENT_SEASON, CURRENT_SEASON - 1]) {
    const raw = await apiFetch(`/teams/statistics?team=${teamId}&league=${leagueId}&season=${year}`);
    if (raw?.team && raw?.fixtures) {
      stats = raw;
      break;
    }
  }
  if (!stats?.team || !stats?.fixtures) return null;

  return {
    team: stats.team.name,
    logo: stats.team.logo,
    league: stats.league?.name || "League",
    fixtures: {
      played: stats.fixtures?.played?.total ?? 0,
      wins: stats.fixtures?.wins?.total ?? 0,
      draws: stats.fixtures?.draws?.total ?? 0,
      losses: stats.fixtures?.loses?.total ?? 0,
    },
    goals: {
      for: stats.goals?.for?.total?.total ?? 0,
      against: stats.goals?.against?.total?.total ?? 0,
    },
    cleanSheets: {
      total: stats.clean_sheet?.total ?? 0,
      home: stats.clean_sheet?.home ?? 0,
      away: stats.clean_sheet?.away ?? 0,
    },
    failedToScore: {
      total: stats.failed_to_score?.total ?? 0,
      home: stats.failed_to_score?.home ?? 0,
      away: stats.failed_to_score?.away ?? 0,
    },
  };
}
