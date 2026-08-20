/**
 * BallMtaani Edge — Elo Rating Engine
 * Evaluates dynamic team strength, home advantage, goal difference scaling, and rating updates.
 */

export interface EloConfig {
  defaultRating: number;
  homeAdvantage: number;
  kFactor: number;
}

export const DEFAULT_ELO_CONFIG: EloConfig = {
  defaultRating: 1500,
  homeAdvantage: 65,
  kFactor: 32,
};

/**
 * Calculates expected outcome probability for Team A vs Team B.
 */
export function calculateExpectedEloOutcome(
  ratingA: number,
  ratingB: number,
  isHomeA: boolean = false,
  homeAdvantage: number = DEFAULT_ELO_CONFIG.homeAdvantage
): number {
  const adjustedRatingA = isHomeA ? ratingA + homeAdvantage : ratingA;
  return 1 / (1 + Math.pow(10, (ratingB - adjustedRatingA) / 400));
}

/**
 * Goal difference multiplier for Elo updates.
 * High margin victories carry more weight, but with diminishing returns.
 */
export function getGoalDifferenceMultiplier(homeGoals: number, awayGoals: number): number {
  const gd = Math.abs(homeGoals - awayGoals);
  if (gd <= 1) return 1.0;
  if (gd === 2) return 1.5;
  if (gd === 3) return 1.75;
  return 1.75 + (gd - 3) / 8;
}

export interface EloUpdateResult {
  newHomeRating: number;
  newAwayRating: number;
  homeChange: number;
  awayChange: number;
  expectedHomeProb: number;
  expectedAwayProb: number;
}

/**
 * Calculates post-match Elo ratings given final score and competition modifier.
 */
export function updateEloRatings(
  homeRating: number,
  awayRating: number,
  homeGoals: number,
  awayGoals: number,
  competitionStrength: number = 1.0,
  config: EloConfig = DEFAULT_ELO_CONFIG
): EloUpdateResult {
  const expHome = calculateExpectedEloOutcome(homeRating, awayRating, true, config.homeAdvantage);
  const expAway = 1 - expHome;

  let actualHome = 0.5;
  if (homeGoals > awayGoals) actualHome = 1.0;
  else if (homeGoals < awayGoals) actualHome = 0.0;

  const gdMultiplier = getGoalDifferenceMultiplier(homeGoals, awayGoals);
  const k = config.kFactor * competitionStrength;

  const homeChange = k * gdMultiplier * (actualHome - expHome);
  const awayChange = -homeChange;

  return {
    newHomeRating: Math.round((homeRating + homeChange) * 10) / 10,
    newAwayRating: Math.round((awayRating + awayChange) * 10) / 10,
    homeChange: Math.round(homeChange * 10) / 10,
    awayChange: Math.round(awayChange * 10) / 10,
    expectedHomeProb: expHome,
    expectedAwayProb: expAway,
  };
}
