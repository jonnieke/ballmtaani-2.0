/**
 * Service for interacting with the Football API (API-Sports).
 * All endpoints filter by major leagues to ensure data accuracy.
 */

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

// ─── Major League IDs (API-Football) ────────────────────────
export const MAJOR_LEAGUE_IDS = {
  "Premier League": 39,
  "La Liga": 140,
  "Serie A": 135,
  "Bundesliga": 78,
  "Ligue 1": 61,
  "UEFA Champions League": 2,
  "UEFA Europa League": 3,
  // African Leagues
  "CAF Champions League": 12,
  // "Kenya Premier League": 686,  // REMOVED — API-Football ID 686 returns Czech teams, not KPL
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

// ─── Shared fetch helper ────────────────────────────────────
async function apiFetch(endpoint: string): Promise<any> {
  if (!API_KEY) {
    console.warn("Football API key missing.");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'x-apisports-key': API_KEY }
    });

    if (!response.ok) {
      console.error(`[Football API] HTTP Error ${response.status} for ${endpoint}`);
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for API-Football logic errors in 200 responses
    if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
      console.error(`[Football API] Logic Error in ${endpoint}:`, data.errors);
      return null;
    }

    return data.response || [];
  } catch (err) {
    console.error(`Failed to fetch ${endpoint}:`, err);
    return null;
  }
}

// ─── Types ──────────────────────────────────────────────────
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
    scorers: ""
  }));
}

// ─── 2. UPCOMING FIXTURES (next matches from major leagues) ─
export async function fetchUpcomingFixtures(): Promise<any[]> {
  // UCL + UEL first (cup finals happen end of season when domestics are done)
  const leagueIds = [2, 3, 12, 39, 140, 135, 78, 61];
  const allFixtures: any[] = [];

  for (const leagueId of leagueIds) {
    const raw = await fetchWithSeasonFallback(
      (season) => `/fixtures?league=${leagueId}&season=${season}&next=5`
    );
    if (raw && raw.length > 0) {
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
      }));
      allFixtures.push(...mapped);
    }
  }

  // Sort by kickoff timestamp (soonest first)
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

export async function fetchTournamentStandings(leagueId: number, season: number): Promise<Record<string, TournamentStandingEntry[]>> {
  const raw = await apiFetch(`/standings?league=${leagueId}&season=${season}`);
  if (!raw || raw.length === 0) return {};

  const groups = raw[0]?.league?.standings || [];
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
  const leagueIds = [39, 140, 135, 78, 61]; // Top 5 domestic
  const allFixtures: any[] = [];
  
  // Get date range: Today back to 5 days ago
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 5);
  
  const fromStr = fromDate.toISOString().split('T')[0];
  const toStr = toDate.toISOString().split('T')[0];

  for (const leagueId of leagueIds) {
    const raw = await fetchWithSeasonFallback(
      (season) => `/fixtures?league=${leagueId}&season=${season}&from=${fromStr}&to=${toStr}&status=FT-AET-PEN`
    );
    if (raw && raw.length > 0) {
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
        timestamp: new Date(item.fixture.date).getTime()
      }));
      allFixtures.push(...mapped);
    }
  }

  // Sort by date descending (latest first)
  return allFixtures.sort((a, b) => b.timestamp - a.timestamp);
}

// ─── 3. STANDINGS (per league) ──────────────────────────────
export async function fetchStandings(leagueId: number): Promise<StandingEntry[]> {
  const raw = await fetchWithSeasonFallback(
    (season) => `/standings?league=${leagueId}&season=${season}`
  );
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
    // African leagues
    "KPL": 686,
    "SA PSL": 288,
  };

  const result: Record<string, StandingEntry[]> = {};

  // Fetch all 5 leagues in parallel
  const entries = Object.entries(leagueMap);
  const standings = await Promise.all(
    entries.map(([, id]) => fetchStandings(id))
  );

  entries.forEach(([name], idx) => {
    if (standings[idx] && standings[idx].length > 0) {
      result[name] = standings[idx];
    }
  });

  return result;
}

// ─── 4. FIXTURE DETAIL (stats, events, lineups) ─────────────
export async function fetchFixtureStats(fixtureId: string): Promise<FixtureStat[]> {
  const raw = await apiFetch(`/fixtures/statistics?fixture=${fixtureId}`);
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
  const raw = await apiFetch(`/fixtures/events?fixture=${fixtureId}`);
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
  const raw = await apiFetch(`/fixtures/lineups?fixture=${fixtureId}`);
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
