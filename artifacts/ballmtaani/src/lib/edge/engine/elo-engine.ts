/**
 * BallMtaani Edge Phase 3 — Elo Rating Engine
 * Chronological rating rebuild, K-factor adjustments, goal difference scaling, and neutral venue policy.
 */

export interface EloEngineParams {
  baseRating: number;
  homeAdvantage: number;
  kFactor: number;
}

export const DEFAULT_ENGINE_ELO_PARAMS: EloEngineParams = {
  baseRating: 1500,
  homeAdvantage: 65,
  kFactor: 32,
};

export function calculateExpectedEloWinProb(
  ratingA: number,
  ratingB: number,
  isHomeA: boolean = false,
  isNeutralVenue: boolean = false,
  params: EloEngineParams = DEFAULT_ENGINE_ELO_PARAMS
): number {
  const homeBoost = isHomeA && !isNeutralVenue ? params.homeAdvantage : 0;
  const adjustedRatingA = ratingA + homeBoost;
  return 1 / (1 + Math.pow(10, (ratingB - adjustedRatingA) / 400));
}

export function calculateGoalDifferenceMultiplier(homeScore: number, awayScore: number, winnerRatingDiff: number): number {
  const gd = Math.abs(homeScore - awayScore);
  if (gd <= 1) return 1.0;

  // Formula: ln(abs(gd) + 1) * (2.2 / (diff * 0.001 + 2.2))
  const rawLn = Math.log(gd + 1);
  const scaling = 2.2 / (Math.abs(winnerRatingDiff) * 0.001 + 2.2);
  const mult = rawLn * scaling;

  return Math.max(1.0, Math.min(3.5, Math.round(mult * 100) / 100));
}

export interface MatchEloResult {
  newHomeRating: number;
  newAwayRating: number;
  homeChange: number;
  awayChange: number;
  expectedHomeProb: number;
  gdMultiplier: number;
}

export function processMatchEloUpdate(
  homeRating: number,
  awayRating: number,
  homeScore: number,
  awayScore: number,
  isNeutralVenue: boolean = false,
  competitionStrength: number = 1.0,
  params: EloEngineParams = DEFAULT_ENGINE_ELO_PARAMS
): MatchEloResult {
  const expectedHome = calculateExpectedEloWinProb(homeRating, awayRating, true, isNeutralVenue, params);
  
  let actualHome = 0.5; // Draw
  if (homeScore > awayScore) actualHome = 1.0;
  else if (homeScore < awayScore) actualHome = 0.0;

  const winnerDiff = actualHome === 1.0 ? homeRating - awayRating : awayRating - homeRating;
  const gdMult = calculateGoalDifferenceMultiplier(homeScore, awayScore, winnerDiff);
  const k = params.kFactor * competitionStrength;

  const homeChange = Math.round(k * gdMult * (actualHome - expectedHome) * 10) / 10;
  const awayChange = -homeChange;

  return {
    newHomeRating: Math.round((homeRating + homeChange) * 10) / 10,
    newAwayRating: Math.round((awayRating + awayChange) * 10) / 10,
    homeChange,
    awayChange,
    expectedHomeProb: Math.round(expectedHome * 10000) / 10000,
    gdMultiplier: gdMult,
  };
}
