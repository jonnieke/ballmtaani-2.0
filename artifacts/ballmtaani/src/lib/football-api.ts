/**
 * Service for interacting with the Football API (API-Sports).
 */

const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

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
  possession?: string;
  scorers?: string;
}

export async function fetchLiveMatches(): Promise<LiveMatch[]> {
  if (!API_KEY) {
    console.warn("Football API key missing.");
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fixtures?live=all`, {
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("Football API errors:", data.errors);
      return [];
    }

    return (data.response || []).map((item: any) => ({
      id: String(item.fixture.id),
      home: item.teams.home.name,
      homeLogo: item.teams.home.logo,
      homeColor: "#555", // API doesn't provide colors
      homeInitial: item.teams.home.name.substring(0, 1),
      away: item.teams.away.name,
      awayLogo: item.teams.away.logo,
      awayColor: "#777", // API doesn't provide colors
      awayInitial: item.teams.away.name.substring(0, 1),
      homeScore: item.goals.home ?? 0,
      awayScore: item.goals.away ?? 0,
      minute: item.fixture.status.elapsed ? `${item.fixture.status.elapsed}'` : "Live",
      league: item.league.name,
      possession: "N/A", // Available in statistics endpoint if needed
      scorers: "" // Available in events endpoint if needed
    }));
  } catch (err) {
    console.error("Failed to fetch live matches:", err);
    return [];
  }
}
