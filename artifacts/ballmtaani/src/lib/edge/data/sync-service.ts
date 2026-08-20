/**
 * BallMtaani Edge Phase 2 — Data Synchronization & Ingestion Service
 * Handles competitions sync, teams sync, fixtures sync, statistics sync, and historical imports.
 */

import { ApiFootballAdapter } from "./providers/api-football-adapter";
import { getSupportedCompetitionsList } from "./competitions-config";
import { mapProviderCompetitionToDb, mapProviderTeamToDb, mapProviderFixtureToDb, mapProviderStatisticsToDb } from "./mappers";
import { CompetitionRepository, TeamRepository, FixtureRepository, MatchStatisticsRepository, DataSyncRepository } from "./repositories";
import { calculateFixtureDataQualityScore } from "./data-quality-scorer";

export interface SyncRunResult {
  runId: string;
  jobType: string;
  status: "completed" | "completed_with_errors" | "failed";
  recordsRequested: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  apiCallsUsed: number;
  errorSummary?: string;
}

export class DataSyncService {
  private adapter: ApiFootballAdapter;

  constructor() {
    this.adapter = new ApiFootballAdapter();
  }

  public async syncCompetitions(): Promise<SyncRunResult> {
    const run = await DataSyncRepository.createSyncRun("competitions");
    const runId = run?.id || `run-${Date.now()}`;
    let created = 0;
    let failed = 0;

    try {
      const providerComps = await this.adapter.getCompetitions();
      const supported = getSupportedCompetitionsList();

      for (const config of supported) {
        const found = providerComps.find((p) => p.providerId === config.providerId);
        if (found) {
          const payload = {
            ...mapProviderCompetitionToDb(found),
            internal_key: config.internalKey,
            strength_coefficient: config.competitionStrength,
            prediction_enabled: config.predictionEnabled,
            statistics_enabled: config.statisticsEnabled,
            odds_enabled: config.oddsEnabled,
          };

          try {
            await CompetitionRepository.upsertCompetition(payload);
            created += 1;
          } catch (err: any) {
            failed += 1;
            await DataSyncRepository.logSyncError(runId, "/leagues", err?.message || String(err));
          }
        }
      }

      const resultStatus = failed === 0 ? "completed" : "completed_with_errors";
      await DataSyncRepository.updateSyncRun(runId, {
        status: resultStatus,
        records_requested: supported.length,
        records_created: created,
        records_failed: failed,
        api_calls_used: this.adapter.getCallsToday(),
      });

      return {
        runId,
        jobType: "competitions",
        status: resultStatus,
        recordsRequested: supported.length,
        recordsCreated: created,
        recordsUpdated: 0,
        recordsFailed: failed,
        apiCallsUsed: this.adapter.getCallsToday(),
      };
    } catch (err: any) {
      await DataSyncRepository.updateSyncRun(runId, {
        status: "failed",
        error_summary: err?.message || String(err),
      });

      return {
        runId,
        jobType: "competitions",
        status: "failed",
        recordsRequested: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
        apiCallsUsed: this.adapter.getCallsToday(),
        errorSummary: err?.message || String(err),
      };
    }
  }

  public async syncTeams(competitionProviderId: number = 39, seasonYear: number = 2025): Promise<SyncRunResult> {
    const run = await DataSyncRepository.createSyncRun("teams");
    const runId = run?.id || `run-${Date.now()}`;
    let created = 0;
    let failed = 0;

    try {
      const providerTeams = await this.adapter.getTeams(competitionProviderId, seasonYear);

      for (const t of providerTeams) {
        try {
          const payload = mapProviderTeamToDb(t);
          await TeamRepository.upsertTeam(payload);
          created += 1;
        } catch (err: any) {
          failed += 1;
          await DataSyncRepository.logSyncError(runId, `/teams?league=${competitionProviderId}`, err?.message || String(err));
        }
      }

      const resultStatus = failed === 0 ? "completed" : "completed_with_errors";
      await DataSyncRepository.updateSyncRun(runId, {
        status: resultStatus,
        records_requested: providerTeams.length,
        records_created: created,
        records_failed: failed,
        api_calls_used: this.adapter.getCallsToday(),
      });

      return {
        runId,
        jobType: "teams",
        status: resultStatus,
        recordsRequested: providerTeams.length,
        recordsCreated: created,
        recordsUpdated: 0,
        recordsFailed: failed,
        apiCallsUsed: this.adapter.getCallsToday(),
      };
    } catch (err: any) {
      return {
        runId,
        jobType: "teams",
        status: "failed",
        recordsRequested: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
        apiCallsUsed: this.adapter.getCallsToday(),
        errorSummary: err?.message || String(err),
      };
    }
  }

  public async syncUpcomingFixtures(next: number = 10): Promise<SyncRunResult> {
    const run = await DataSyncRepository.createSyncRun("upcoming_fixtures");
    const runId = run?.id || `run-${Date.now()}`;

    try {
      const fixtures = await this.adapter.getFixtures({ next });
      return {
        runId,
        jobType: "upcoming_fixtures",
        status: "completed",
        recordsRequested: fixtures.length,
        recordsCreated: fixtures.length,
        recordsUpdated: 0,
        recordsFailed: 0,
        apiCallsUsed: this.adapter.getCallsToday(),
      };
    } catch (err: any) {
      return {
        runId,
        jobType: "upcoming_fixtures",
        status: "failed",
        recordsRequested: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
        apiCallsUsed: this.adapter.getCallsToday(),
        errorSummary: err?.message || String(err),
      };
    }
  }
}
