/**
 * BallMtaani Edge — Dixon-Coles Poisson Model
 * Generates expected goals, scoreline probabilities, 1X2 outcomes, Over/Under 2.5, and Both Teams To Score (BTTS).
 */

import { ScorelineProbability } from "./types";

/**
 * Calculates Poisson probability P(X = k; lambda)
 */
export function poissonProbability(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let factorial = 1;
  for (let i = 2; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

/**
 * Dixon-Coles low score adjustment factor tau(x, y; lambda, mu, rho)
 */
export function dixonColesTau(x: number, y: number, lambda: number, mu: number, rho: number = -0.08): number {
  if (x === 0 && y === 0) return 1 - lambda * mu * rho;
  if (x === 1 && y === 0) return 1 + mu * rho;
  if (x === 0 && y === 1) return 1 + lambda * rho;
  if (x === 1 && y === 1) return 1 - rho;
  return 1.0;
}

export interface DixonColesOutput {
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  over25Prob: number;
  under25Prob: number;
  bttsYesProb: number;
  bttsNoProb: number;
  scorelineGrid: number[][]; // 10x10 grid (0-9 goals)
  topScorelines: ScorelineProbability[];
}

/**
 * Computes match probabilities from attack/defense parameters and Elo differential.
 */
export function calculateDixonColesProbabilities(
  homeElo: number,
  awayElo: number,
  homeAttackingForm: number = 1.35, // Average goals scored per match
  awayAttackingForm: number = 1.15,
  homeDefensiveForm: number = 1.10, // Average goals conceded per match
  awayDefensiveForm: number = 1.40,
  rho: number = -0.08,
  maxGoals: number = 9
): DixonColesOutput {
  // Elo rating difference impact on expected goals
  const eloDiff = homeElo - awayElo + 65; // +65 home advantage
  const eloFactor = Math.pow(10, eloDiff / 400);

  // Baseline expected goals (xG)
  const leagueAvgGoals = 1.35;
  let expectedHomeGoals = (homeAttackingForm / leagueAvgGoals) * (awayDefensiveForm / leagueAvgGoals) * leagueAvgGoals * Math.sqrt(eloFactor);
  let expectedAwayGoals = (awayAttackingForm / leagueAvgGoals) * (homeDefensiveForm / leagueAvgGoals) * leagueAvgGoals * (1 / Math.sqrt(eloFactor));

  // Cap xG within realistic limits (0.20 to 4.5)
  expectedHomeGoals = Math.max(0.20, Math.min(4.5, expectedHomeGoals));
  expectedAwayGoals = Math.max(0.20, Math.min(4.5, expectedAwayGoals));

  const grid: number[][] = Array.from({ length: maxGoals + 1 }, () => Array(maxGoals + 1).fill(0));
  let totalGridMass = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const pHome = poissonProbability(h, expectedHomeGoals);
      const pAway = poissonProbability(a, expectedAwayGoals);
      const tau = dixonColesTau(h, a, expectedHomeGoals, expectedAwayGoals, rho);
      const pMatch = Math.max(0, pHome * pAway * tau);
      grid[h][a] = pMatch;
      totalGridMass += pMatch;
    }
  }

  // Normalize grid
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  let over25Prob = 0;
  let under25Prob = 0;
  let bttsYesProb = 0;
  let bttsNoProb = 0;

  const scorelineList: ScorelineProbability[] = [];

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = grid[h][a] / totalGridMass;
      grid[h][a] = p;

      if (h > a) homeWinProb += p;
      else if (h === a) drawProb += p;
      else awayWinProb += p;

      if (h + a > 2.5) over25Prob += p;
      else under25Prob += p;

      if (h > 0 && a > 0) bttsYesProb += p;
      else bttsNoProb += p;

      scorelineList.push({
        homeGoals: h,
        awayGoals: a,
        probability: p,
        formattedScore: `${h} - ${a}`,
      });
    }
  }

  // Sort scorelines by probability descending
  scorelineList.sort((x, y) => y.probability - x.probability);
  const topScorelines = scorelineList.slice(0, 3);

  return {
    expectedHomeGoals: Math.round(expectedHomeGoals * 100) / 100,
    expectedAwayGoals: Math.round(expectedAwayGoals * 100) / 100,
    homeWinProb: Math.round(homeWinProb * 10000) / 10000,
    drawProb: Math.round(drawProb * 10000) / 10000,
    awayWinProb: Math.round(awayWinProb * 10000) / 10000,
    over25Prob: Math.round(over25Prob * 10000) / 10000,
    under25Prob: Math.round(under25Prob * 10000) / 10000,
    bttsYesProb: Math.round(bttsYesProb * 10000) / 10000,
    bttsNoProb: Math.round(bttsNoProb * 10000) / 10000,
    scorelineGrid: grid,
    topScorelines,
  };
}
