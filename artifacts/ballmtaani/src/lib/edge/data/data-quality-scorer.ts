/**
 * BallMtaani Edge Phase 2 — Fixture Data Quality Scorer (0–100 Scale)
 */

export interface FixtureQualityInput {
  hasCompetition: boolean;
  hasSeason: boolean;
  hasHomeTeam: boolean;
  hasAwayTeam: boolean;
  hasProviderId: boolean;

  hasKickoffAt: boolean;
  hasTimezone: boolean;
  hasValidStatus: boolean;
  hasMatchweekOrRound: boolean;

  isCompleted: boolean;
  hasHomeScore: boolean;
  hasAwayScore: boolean;
  hasHalftimeScore: boolean;

  hasShots: boolean;
  hasShotsOnTarget: boolean;
  hasPossession: boolean;
  hasCorners: boolean;
  hasCards: boolean;
  hasExpectedGoals: boolean;

  hasVenue: boolean;
  hasReferee: boolean;
}

export interface DataQualityScoreResult {
  score: number; // 0 to 100
  label: "Excellent" | "Good" | "Limited" | "Insufficient";
  breakdown: {
    identityScore: number; // max 25
    schedulingScore: number; // max 15
    resultScore: number; // max 20
    statisticsScore: number; // max 30
    contextScore: number; // max 10
  };
}

export function calculateFixtureDataQualityScore(input: FixtureQualityInput): DataQualityScoreResult {
  // 1. Identity Score (max 25)
  let identity = 0;
  if (input.hasCompetition) identity += 5;
  if (input.hasSeason) identity += 5;
  if (input.hasHomeTeam) identity += 5;
  if (input.hasAwayTeam) identity += 5;
  if (input.hasProviderId) identity += 5;

  // 2. Scheduling Score (max 15)
  let scheduling = 0;
  if (input.hasKickoffAt) scheduling += 5;
  if (input.hasTimezone) scheduling += 3;
  if (input.hasValidStatus) scheduling += 4;
  if (input.hasMatchweekOrRound) scheduling += 3;

  // 3. Result Score (max 20)
  let result = 0;
  if (input.isCompleted) {
    if (input.hasHomeScore) result += 7;
    if (input.hasAwayScore) result += 7;
    if (input.hasHalftimeScore) result += 6;
  } else {
    // Scheduled match gets full result score allocation by default
    result = 20;
  }

  // 4. Statistics Score (max 30)
  let statistics = 0;
  if (input.hasShots) statistics += 5;
  if (input.hasShotsOnTarget) statistics += 5;
  if (input.hasPossession) statistics += 5;
  if (input.hasCorners) statistics += 5;
  if (input.hasCards) statistics += 5;
  if (input.hasExpectedGoals) statistics += 5;

  // 5. Context Score (max 10)
  let context = 0;
  if (input.hasVenue) context += 5;
  if (input.hasReferee) context += 5;

  const totalScore = Math.min(100, identity + scheduling + result + statistics + context);

  let label: "Excellent" | "Good" | "Limited" | "Insufficient" = "Insufficient";
  if (totalScore >= 85) label = "Excellent";
  else if (totalScore >= 70) label = "Good";
  else if (totalScore >= 50) label = "Limited";

  return {
    score: totalScore,
    label,
    breakdown: {
      identityScore: identity,
      schedulingScore: scheduling,
      resultScore: result,
      statisticsScore: statistics,
      contextScore: context,
    },
  };
}
