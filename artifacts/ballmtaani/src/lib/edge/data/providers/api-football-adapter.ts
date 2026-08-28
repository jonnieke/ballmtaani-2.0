/**
 * BallMtaani Edge Phase 2 — API-Football Data Adapter
 * Implements exponential backoff and rate-limit caps. Provider failures are
 * explicit so an ingestion job can never persist demo football records.
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
    } catch (error) {
      throw error;
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
    } catch (error) {
      throw error;
    }

    return [];
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
    } catch (error) {
      throw error;
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
    } catch (error) {
      throw error;
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
    } catch (error) {
      throw error;
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
