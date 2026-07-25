/**
 * BallMtaani Edge Phase 2 — Data Repositories Layer
 */

import { supabase } from "../../supabase";

export class CompetitionRepository {
  public static async getAllCompetitions() {
    const { data, error } = await supabase.from("competitions").select("*").order("name");
    if (error) throw error;
    return data || [];
  }

  public static async upsertCompetition(comp: any) {
    const { data, error } = await supabase.from("competitions").upsert(comp, { onConflict: "provider,provider_competition_id" }).select();
    if (error) throw error;
    return data?.[0];
  }
}

export class TeamRepository {
  public static async upsertTeam(team: any) {
    const { data, error } = await supabase.from("teams").upsert(team, { onConflict: "provider,provider_team_id" }).select();
    if (error) throw error;
    return data?.[0];
  }

  public static async getTeamByProviderId(providerTeamId: number) {
    const { data } = await supabase.from("teams").select("*").eq("provider_team_id", providerTeamId).single();
    return data;
  }
}

export class FixtureRepository {
  public static async upsertFixture(fixture: any) {
    const { data, error } = await supabase.from("fixtures").upsert(fixture, { onConflict: "provider,provider_fixture_id" }).select();
    if (error) throw error;
    return data?.[0];
  }

  public static async getFixturesByCompetition(competitionId: string) {
    const { data, error } = await supabase.from("fixtures").select("*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)").eq("competition_id", competitionId).order("kickoff_at");
    if (error) throw error;
    return data || [];
  }
}

export class MatchStatisticsRepository {
  public static async upsertStatistics(stats: any) {
    const { data, error } = await supabase.from("match_statistics").upsert(stats, { onConflict: "fixture_id,team_id" }).select();
    if (error) throw error;
    return data?.[0];
  }
}

export class DataSyncRepository {
  public static async createSyncRun(jobType: string, competitionId?: string) {
    const { data, error } = await supabase.from("data_sync_runs").insert({
      job_type: jobType,
      provider: "api-football",
      competition_id: competitionId || null,
      status: "running",
      started_at: new Date().toISOString(),
    }).select();
    if (error) return { id: `local-run-${Date.now()}` };
    return data?.[0];
  }

  public static async updateSyncRun(runId: string, payload: any) {
    await supabase.from("data_sync_runs").update({
      ...payload,
      completed_at: new Date().toISOString(),
    }).eq("id", runId);
  }

  public static async logSyncError(runId: string, endpoint: string, message: string, payloadExcerpt?: string) {
    await supabase.from("data_sync_errors").insert({
      sync_run_id: runId,
      provider_endpoint: endpoint,
      error_message: message,
      payload_excerpt: payloadExcerpt || null,
    });
  }
}
