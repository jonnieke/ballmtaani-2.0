/**
 * BallMtaani Edge Phase 2 — Data Normalization Layer & Mappers
 */

import {
  ProviderCompetition,
  ProviderSeason,
  ProviderTeam,
  ProviderFixture,
  ProviderFixtureStatistics,
} from "./providers/provider-interface";
import { normalizeTeamName } from "./team-normalizer";

export type InternalFixtureStatus =
  | "scheduled"
  | "first_half"
  | "halftime"
  | "second_half"
  | "extra_time"
  | "penalties"
  | "completed"
  | "postponed"
  | "cancelled"
  | "abandoned"
  | "unknown";

/**
 * Maps raw provider short status codes into canonical internal statuses.
 */
export function normalizeMatchStatus(statusShort: string): InternalFixtureStatus {
  switch (statusShort?.toUpperCase()) {
    case "NS":
    case "TBD":
      return "scheduled";
    case "1H":
      return "first_half";
    case "HT":
      return "halftime";
    case "2H":
      return "second_half";
    case "ET":
      return "extra_time";
    case "P":
    case "PEN":
      return "penalties";
    case "FT":
    case "AET":
      return "completed";
    case "PPD":
    case "POSTP":
      return "postponed";
    case "CANC":
    case "ABBR":
      return "cancelled";
    case "ABD":
      return "abandoned";
    default:
      return "unknown";
  }
}

export function mapProviderCompetitionToDb(p: ProviderCompetition) {
  return {
    provider: "api-football",
    provider_competition_id: p.providerId,
    name: p.name,
    country: p.country,
    competition_type: p.type?.toLowerCase() || "league",
    logo_url: p.logo,
    last_synced_at: new Date().toISOString(),
  };
}

export function mapProviderTeamToDb(p: ProviderTeam) {
  return {
    provider: "api-football",
    provider_team_id: p.providerId,
    name: p.name,
    normalized_name: normalizeTeamName(p.name),
    country: p.country || null,
    stadium_name: p.stadium || null,
    logo_url: p.logo || null,
    is_active: true,
  };
}

export function mapProviderFixtureToDb(
  f: ProviderFixture,
  competitionId: string,
  seasonId: string,
  homeTeamId: string,
  awayTeamId: string
) {
  const canonicalStatus = normalizeMatchStatus(f.statusShort);

  return {
    provider: "api-football",
    provider_fixture_id: f.providerFixtureId,
    competition_id: competitionId,
    season_id: seasonId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    kickoff_at: f.kickoffAt,
    timezone: f.timezone || "UTC",
    venue_name: f.venueName || null,
    status: canonicalStatus,
    status_short: f.statusShort,
    elapsed_minutes: f.elapsedMinutes || null,
    home_score: f.homeScore ?? null,
    away_score: f.awayScore ?? null,
    halftime_home_score: f.halftimeHomeScore ?? null,
    halftime_away_score: f.halftimeAwayScore ?? null,
    referee: f.referee || null,
    last_synced_at: new Date().toISOString(),
  };
}

export function mapProviderStatisticsToDb(
  fixtureId: string,
  teamId: string,
  stats: ProviderFixtureStatistics
) {
  return {
    fixture_id: fixtureId,
    team_id: teamId,
    possession_percentage: stats.possessionPct ?? null,
    total_shots: stats.totalShots ?? null,
    shots_on_target: stats.shotsOnTarget ?? null,
    shots_off_target: stats.shotsOffTarget ?? null,
    blocked_shots: stats.blockedShots ?? null,
    corners: stats.corners ?? null,
    offsides: stats.offsides ?? null,
    fouls: stats.fouls ?? null,
    yellow_cards: stats.yellowCards ?? null,
    red_cards: stats.redCards ?? null,
    goalkeeper_saves: stats.saves ?? null,
    expected_goals: stats.expectedGoals ?? null,
    source: "api-football",
    source_updated_at: new Date().toISOString(),
  };
}
