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
};

const ALL_LEAGUE_IDS = Object.values(MAJOR_LEAGUE_IDS);

// Current season (API-Football uses the year the season started)
const CURRENT_SEASON = 2025;

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
  // Fetch next 10 fixtures for each major league
  const leagueIds = [39, 140, 135, 78, 61]; // Top 5 domestic
  const allFixtures: any[] = [];

  for (const leagueId of leagueIds) {
    const raw = await apiFetch(`/fixtures?league=${leagueId}&season=${CURRENT_SEASON}&next=5`);
    if (raw && raw.length > 0) {
      const mapped = raw.map((item: any) => ({
        id: String(item.fixture.id),
        home: item.teams.home.name,
        homeLogo: item.teams.home.logo,
        homeColor: "#555",
        homeInitial: item.teams.home.name.substring(0, 3).toUpperCase(),
        away: item.teams.away.name,
        awayLogo: item.teams.away.logo,
        awayColor: "#777",
        awayInitial: item.teams.away.name.substring(0, 3).toUpperCase(),
        time: new Date(item.fixture.date).toLocaleTimeString('en-KE', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Africa/Nairobi'
        }) + ' EAT',
        league: item.league.name,
        leagueLogo: item.league.logo,
        date: formatRelativeDate(item.fixture.date)
      }));
      allFixtures.push(...mapped);
    }
  }

  // Sort by date (soonest first)
  return allFixtures.sort((a: any, b: any) => {
    const dateA = new Date(a.date === "Today" ? Date.now() : a.date === "Tomorrow" ? Date.now() + 86400000 : Date.now());
    return 0; // Keep API order which is already chronological
  });
}

function formatRelativeDate(dateStr: string): string {
  const matchDate = new Date(dateStr);
  const now = new Date();
  const diff = matchDate.getTime() - now.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (daysDiff <= 0) return "Today";
  if (daysDiff === 1) return "Tomorrow";
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
    const raw = await apiFetch(`/fixtures?league=${leagueId}&season=${CURRENT_SEASON}&from=${fromStr}&to=${toStr}&status=FT-AET-PEN`);
    if (raw && raw.length > 0) {
      const mapped = raw.map((item: any) => ({
        id: String(item.fixture.id),
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
        leagueLogo: item.league.logo,
        date: new Date(item.fixture.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
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
  const raw = await apiFetch(`/standings?league=${leagueId}&season=${CURRENT_SEASON}`);
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

  return raw.map((event: any) => {
    let type = "other";
    if (event.type === "Goal") type = "goal";
    else if (event.type === "Card" && event.detail === "Yellow Card") type = "yellow";
    else if (event.type === "Card" && event.detail === "Red Card") type = "red";
    else if (event.type === "subst") type = "sub";

    return {
      min: event.time.elapsed || 0,
      type,
      team: event.team.id === raw[0]?.team?.id ? "home" as const : "away" as const, // Rough heuristic
      player: event.player?.name || "",
      assist: event.assist?.name || "",
      detail: event.detail,
      playerIn: type === "sub" ? event.assist?.name : undefined,
      playerOut: type === "sub" ? event.player?.name : undefined
    };
  });
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
