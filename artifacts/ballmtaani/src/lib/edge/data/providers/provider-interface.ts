/**
 * BallMtaani Edge Phase 2 — Provider Data Architecture Interfaces
 */

export interface ProviderCompetition {
  providerId: number;
  name: string;
  country: string;
  type: string;
  logo?: string;
}

export interface ProviderSeason {
  year: number;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface ProviderTeam {
  providerId: number;
  name: string;
  country?: string;
  founded?: number;
  stadium?: string;
  logo?: string;
}

export interface ProviderFixture {
  providerFixtureId: number;
  providerCompetitionId: number;
  seasonYear: number;
  homeTeamProviderId: number;
  awayTeamProviderId: number;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  timezone?: string;
  venueName?: string;
  statusShort: string;
  elapsedMinutes?: number;
  homeScore?: number | null;
  awayScore?: number | null;
  halftimeHomeScore?: number | null;
  halftimeAwayScore?: number | null;
  referee?: string;
}

export interface ProviderFixtureStatistics {
  teamProviderId: number;
  possessionPct?: number;
  totalShots?: number;
  shotsOnTarget?: number;
  shotsOffTarget?: number;
  blockedShots?: number;
  corners?: number;
  offsides?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  saves?: number;
  expectedGoals?: number;
}

export interface ProviderFixtureEvent {
  teamProviderId: number;
  playerName?: string;
  eventType: string;
  minute: number;
  detail?: string;
}

export interface FixtureQuery {
  competitionId?: number;
  season?: number;
  from?: string;
  to?: string;
  status?: string;
  next?: number;
}

export interface FootballDataProvider {
  getCompetitions(): Promise<ProviderCompetition[]>;
  getSeasons(competitionProviderId: number): Promise<ProviderSeason[]>;
  getTeams(competitionProviderId: number, seasonYear: number): Promise<ProviderTeam[]>;
  getFixtures(query: FixtureQuery): Promise<ProviderFixture[]>;
  getFixtureById(providerFixtureId: number): Promise<ProviderFixture | null>;
  getFixtureStatistics(providerFixtureId: number): Promise<ProviderFixtureStatistics[]>;
  getFixtureEvents(providerFixtureId: number): Promise<ProviderFixtureEvent[]>;
}
