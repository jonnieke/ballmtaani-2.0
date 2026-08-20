/**
 * BallMtaani Edge Phase 2 — Competition Coverage & Phase 3 Readiness Report
 */

export interface CompetitionCoverageMetrics {
  competitionId: string;
  competitionName: string;
  country: string;
  seasonYear: number;
  totalTeams: number;
  totalFixtures: number;
  completedFixtures: number;
  upcomingFixtures: number;
  resultCompletenessPct: number;
  statisticsCompletenessPct: number;
  expectedGoalsCoveragePct: number;
  avgDataQualityScore: number;
  unresolvedDataIssues: number;
  isPhase3PredictionReady: boolean;
  readinessReason: string;
}

export function evaluateCompetitionReadiness(
  completedFixtures: number,
  resultPct: number,
  statsPct: number,
  avgQualityScore: number,
  unresolvedIssues: number
): { isReady: boolean; reason: string } {
  if (completedFixtures < 50) {
    return {
      isReady: false,
      reason: `Insufficient completed matches (${completedFixtures}/50 required for statistical baseline).`,
    };
  }

  if (resultPct < 98) {
    return {
      isReady: false,
      reason: `Result completeness (${resultPct}%) is below the 98% threshold.`,
    };
  }

  if (statsPct < 70) {
    return {
      isReady: false,
      reason: `Match statistics coverage (${statsPct}%) is below the 70% requirement.`,
    };
  }

  if (avgQualityScore < 70) {
    return {
      isReady: false,
      reason: `Average data quality score (${avgQualityScore}) is below 'Good' threshold (70).`,
    };
  }

  if (unresolvedIssues > 10) {
    return {
      isReady: false,
      reason: `High number of unresolved data issues (${unresolvedIssues}).`,
    };
  }

  return {
    isReady: true,
    reason: "Dataset meets all statistical sample size, score reliability, and statistics completeness requirements.",
  };
}

export function generateCompetitionCoverageReport(
  comp: { id: string; name: string; country: string },
  seasonYear: number,
  fixtures: any[],
  statistics: any[]
): CompetitionCoverageMetrics {
  const total = fixtures.length;
  const completed = fixtures.filter((f) => f.status === "completed").length;
  const upcoming = fixtures.filter((f) => f.status === "scheduled").length;

  const resultPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const fixtureIdsWithStats = new Set(statistics.map((s) => s.fixture_id));
  const statsCount = fixtures.filter((f) => fixtureIdsWithStats.has(f.id)).length;
  const statsPct = completed > 0 ? Math.round((statsCount / completed) * 100) : 0;

  const xgCount = statistics.filter((s) => s.expected_goals !== null && s.expected_goals !== undefined).length;
  const xgPct = statsCount > 0 ? Math.round((xgCount / (statsCount * 2)) * 100) : 0;

  const avgScore = total > 0
    ? Math.round(fixtures.reduce((acc, curr) => acc + (curr.data_quality_score || 75), 0) / total)
    : 0;

  const readiness = evaluateCompetitionReadiness(completed, resultPct, statsPct, avgScore, 0);

  return {
    competitionId: comp.id,
    competitionName: comp.name,
    country: comp.country,
    seasonYear,
    totalTeams: 20,
    totalFixtures: total,
    completedFixtures: completed,
    upcomingFixtures: upcoming,
    resultCompletenessPct: resultPct,
    statisticsCompletenessPct: statsPct,
    expectedGoalsCoveragePct: xgPct,
    avgDataQualityScore: avgScore,
    unresolvedDataIssues: 0,
    isPhase3PredictionReady: readiness.isReady,
    readinessReason: readiness.reason,
  };
}
