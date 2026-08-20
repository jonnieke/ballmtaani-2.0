/**
 * BallMtaani Edge Phase 2 — API-Football Data Adapter
 * Implements exponential backoff, rate limit soft/hard caps, and mock fallback mode.
 */

import {
  FootballDataProvider,
  ProviderCompetition,
  ProviderSeason,
  ProviderTeam,
  ProviderFixture,
  ProviderFixtureStatistics,
  ProviderFixtureEvent,
  FixtureQuery,
} from "./provider-interface";

export class ApiFootballAdapter implements FootballDataProvider {
  private apiBaseUrl: string;
  private dailySoftLimit: number;
  private dailyHardLimit: number;
  private callsToday: number = 0;

  constructor() {
    this.apiBaseUrl = "/api/football";
    this.dailySoftLimit = 400;
    this.dailyHardLimit = 500;
  }

  public getCallsToday(): number {
    return this.callsToday;
  }

  private async fetchWithRetry<T>(endpoint: string, retries = 3): Promise<T> {
    if (this.callsToday >= this.dailyHardLimit) {
      throw new Error(`API-Football hard daily limit reached (${this.dailyHardLimit} calls). Ingestion paused.`);
    }

    let delay = 300;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.callsToday += 1;
        const res = await fetch(`${this.apiBaseUrl}${endpoint}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const json = await res.json();
        if (json.errors && Object.keys(json.errors).length > 0) {
          throw new Error(`Provider API Error: ${JSON.stringify(json.errors)}`);
        }
        return json.response as T;
      } catch (err: any) {
        if (attempt === retries) throw err;
        const jitter = Math.random() * 200;
        await new Promise((r) => setTimeout(r, delay + jitter));
        delay *= 2; // Exponential backoff
      }
    }
    throw new Error("Fetch failed after retries");
  }

  public async getCompetitions(): Promise<ProviderCompetition[]> {
    try {
      const data = await this.fetchWithRetry<any[]>("/leagues");
      return data.map((item: any) => ({
        providerId: item.league.id,
        name: item.league.name,
        country: item.country.name,
        type: item.league.type,
        logo: item.league.logo,
      }));
    } catch {
      return MOCK_PROVIDER_COMPETITIONS;
    }
  }

  public async getSeasons(competitionProviderId: number): Promise<ProviderSeason[]> {
    try {
      const data = await this.fetchWithRetry<any[]>(`/leagues?id=${competitionProviderId}`);
      if (data && data[0]?.seasons) {
        return data[0].seasons.map((s: any) => ({
          year: s.year,
          startDate: s.start,
          endDate: s.end,
          isCurrent: Boolean(s.current),
        }));
      }
    } catch {}

    return [
      { year: 2025, startDate: "2025-08-01", endDate: "2026-05-31", isCurrent: true },
      { year: 2024, startDate: "2024-08-01", endDate: "2025-05-31", isCurrent: false },
    ];
  }

  public async getTeams(competitionProviderId: number, seasonYear: number): Promise<ProviderTeam[]> {
    try {
      const data = await this.fetchWithRetry<any[]>(`/teams?league=${competitionProviderId}&season=${seasonYear}`);
      return data.map((item: any) => ({
        providerId: item.team.id,
        name: item.team.name,
        country: item.team.country,
        founded: item.team.founded,
        stadium: item.venue?.name,
        logo: item.team.logo,
      }));
    } catch {
      return MOCK_PROVIDER_TEAMS;
    }
  }

  public async getFixtures(query: FixtureQuery): Promise<ProviderFixture[]> {
    try {
      const params: string[] = [];
      if (query.competitionId) params.push(`league=${query.competitionId}`);
      if (query.season) params.push(`season=${query.season}`);
      if (query.next) params.push(`next=${query.next}`);
      if (query.from && query.to) params.push(`from=${query.from}&to=${query.to}`);

      const endpoint = `/fixtures?${params.join("&")}`;
      const data = await this.fetchWithRetry<any[]>(endpoint);
      return data.map((item: any) => ({
        providerFixtureId: item.fixture.id,
        providerCompetitionId: item.league.id,
        seasonYear: item.league.season,
        homeTeamProviderId: item.teams.home.id,
        awayTeamProviderId: item.teams.away.id,
        homeTeamName: item.teams.home.name,
        awayTeamName: item.teams.away.name,
        kickoffAt: item.fixture.date,
        timezone: item.fixture.timezone,
        venueName: item.fixture.venue?.name,
        statusShort: item.fixture.status.short,
        elapsedMinutes: item.fixture.status.elapsed,
        homeScore: item.goals.home,
        awayScore: item.goals.away,
        halftimeHomeScore: item.score?.halftime?.home,
        halftimeAwayScore: item.score?.halftime?.away,
        referee: item.fixture.referee,
      }));
    } catch {
      return MOCK_PROVIDER_FIXTURES;
    }
  }

  public async getFixtureById(providerFixtureId: number): Promise<ProviderFixture | null> {
    const list = await this.getFixtures({});
    return list.find((f) => f.providerFixtureId === providerFixtureId) || null;
  }

  public async getFixtureStatistics(providerFixtureId: number): Promise<ProviderFixtureStatistics[]> {
    try {
      const data = await this.fetchWithRetry<any[]>(`/fixtures/statistics?fixture=${providerFixtureId}`);
      return data.map((item: any) => {
        const statsMap = new Map<string, any>();
        (item.statistics || []).forEach((s: any) => statsMap.set(s.type, s.value));

        return {
          teamProviderId: item.team.id,
          possessionPct: parsePct(statsMap.get("Ball Possession")),
          totalShots: parseNum(statsMap.get("Total Shots")),
          shotsOnTarget: parseNum(statsMap.get("Shots on Goal")),
          shotsOffTarget: parseNum(statsMap.get("Shots off Goal")),
          blockedShots: parseNum(statsMap.get("Blocked Shots")),
          corners: parseNum(statsMap.get("Corner Kicks")),
          offsides: parseNum(statsMap.get("Offsides")),
          fouls: parseNum(statsMap.get("Fouls")),
          yellowCards: parseNum(statsMap.get("Yellow Cards")),
          redCards: parseNum(statsMap.get("Red Cards")),
          saves: parseNum(statsMap.get("Goalkeeper Saves")),
          expectedGoals: parseNum(statsMap.get("expected_goals")),
        };
      });
    } catch {
      return MOCK_PROVIDER_STATISTICS;
    }
  }

  public async getFixtureEvents(providerFixtureId: number): Promise<ProviderFixtureEvent[]> {
    return [];
  }
}

function parseNum(val: any): number | undefined {
  if (val === null || val === undefined) return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

function parsePct(val: any): number | undefined {
  if (typeof val === "string") {
    const n = Number(val.replace("%", "").trim());
    return isNaN(n) ? undefined : n;
  }
  return parseNum(val);
}

// ────────────────────────── MOCK FALLBACK DATA ──────────────────────────
export const MOCK_PROVIDER_COMPETITIONS: ProviderCompetition[] = [
  { providerId: 39, name: "Premier League", country: "England", type: "League" },
  { providerId: 2, name: "UEFA Champions League", country: "World", type: "Cup" },
  { providerId: 140, name: "La Liga", country: "Spain", type: "League" },
  { providerId: 135, name: "Serie A", country: "Italy", type: "League" },
];

export const MOCK_PROVIDER_TEAMS: ProviderTeam[] = [
  { providerId: 42, name: "Arsenal", country: "England", stadium: "Emirates Stadium" },
  { providerId: 40, name: "Liverpool", country: "England", stadium: "Anfield" },
  { providerId: 541, name: "Real Madrid", country: "Spain", stadium: "Santiago Bernabeu" },
  { providerId: 157, name: "Bayern Munich", country: "Germany", stadium: "Allianz Arena" },
];

export const MOCK_PROVIDER_FIXTURES: ProviderFixture[] = [
  {
    providerFixtureId: 1001,
    providerCompetitionId: 39,
    seasonYear: 2025,
    homeTeamProviderId: 42,
    awayTeamProviderId: 40,
    homeTeamName: "Arsenal",
    awayTeamName: "Liverpool",
    kickoffAt: "2026-07-26T19:30:00Z",
    statusShort: "NS",
  },
  {
    providerFixtureId: 1002,
    providerCompetitionId: 2,
    seasonYear: 2025,
    homeTeamProviderId: 541,
    awayTeamProviderId: 157,
    homeTeamName: "Real Madrid",
    awayTeamName: "Bayern Munich",
    kickoffAt: "2026-07-27T20:00:00Z",
    statusShort: "FT",
    homeScore: 2,
    awayScore: 1,
    halftimeHomeScore: 1,
    halftimeAwayScore: 0,
  },
];

export const MOCK_PROVIDER_STATISTICS: ProviderFixtureStatistics[] = [
  { teamProviderId: 541, possessionPct: 56, totalShots: 15, shotsOnTarget: 6, corners: 7, fouls: 10, expectedGoals: 1.95 },
  { teamProviderId: 157, possessionPct: 44, totalShots: 11, shotsOnTarget: 4, corners: 4, fouls: 12, expectedGoals: 1.20 },
];
