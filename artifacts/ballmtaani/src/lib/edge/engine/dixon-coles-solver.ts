/**
 * BallMtaani Edge Phase 3 — Dixon-Coles Poisson Solver
 * Generates expected goals, score probability matrix, low-score rho corrections, and tail probability normalization.
 */

import { poissonProbability, dixonColesTau } from "../dixon-coles";
import { ScorelineProbability } from "../types";

export interface DixonColesSolverInput {
  homeElo: number;
  awayElo: number;
  homeAttack: number;
  homeDefence: number;
  awayAttack: number;
  awayDefence: number;
  leagueAvgGoals?: number; // default 1.35
  rho?: number; // default -0.08
  maxGoals?: number; // default 7
}

export interface DixonColesSolverResult {
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  scoreMatrix: number[][]; // 8x8 matrix
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  over25Prob: number;
  under25Prob: number;
  bttsYesProb: number;
  bttsNoProb: number;
  topScorelines: ScorelineProbability[];
}

export function solveDixonColesModel(input: DixonColesSolverInput): DixonColesSolverResult {
  const leagueAvg = input.leagueAvgGoals || 1.35;
  const rho = input.rho ?? -0.08;
  const maxGoals = input.maxGoals || 7;

  // Elo rating differential modifier
  const eloDiff = input.homeElo - input.awayElo + 65; // +65 home advantage
  const eloFactor = Math.pow(10, eloDiff / 400);

  let xG_H = input.homeAttack * input.awayDefence * leagueAvg * Math.sqrt(eloFactor);
  let xG_A = input.awayAttack * input.homeDefence * leagueAvg * (1 / Math.sqrt(eloFactor));

  // Clamp xG to realistic bounds [0.20, 4.50]
  xG_H = Math.max(0.20, Math.min(4.50, Math.round(xG_H * 100) / 100));
  xG_A = Math.max(0.20, Math.min(4.50, Math.round(xG_A * 100) / 100));

  const matrix: number[][] = Array.from({ length: maxGoals + 1 }, () => Array(maxGoals + 1).fill(0));
  let totalMass = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const pH = poissonProbability(h, xG_H);
      const pA = poissonProbability(a, xG_A);
      const tau = dixonColesTau(h, a, xG_H, xG_A, rho);
      const p = Math.max(0, pH * pA * tau);
      matrix[h][a] = p;
      totalMass += p;
    }
  }

  // Tail normalization
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over25 = 0;
  let under25 = 0;
  let bttsYes = 0;
  let bttsNo = 0;

  const scorelines: ScorelineProbability[] = [];

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const normP = matrix[h][a] / totalMass;
      matrix[h][a] = Math.round(normP * 10000) / 10000;

      if (h > a) homeWin += normP;
      else if (h === a) draw += normP;
      else awayWin += normP;

      if (h + a > 2.5) over25 += normP;
      else under25 += normP;

      if (h > 0 && a > 0) bttsYes += normP;
      else bttsNo += normP;

      scorelines.push({
        homeGoals: h,
        awayGoals: a,
        probability: Math.round(normP * 10000) / 10000,
        formattedScore: `${h} - ${a}`,
      });
    }
  }

  scorelines.sort((x, y) => y.probability - x.probability);
  const topScorelines = scorelines.slice(0, 3);

  return {
    expectedHomeGoals: xG_H,
    expectedAwayGoals: xG_A,
    scoreMatrix: matrix,
    homeWinProb: Math.round(homeWin * 10000) / 10000,
    drawProb: Math.round(draw * 10000) / 10000,
    awayWinProb: Math.round(awayWin * 10000) / 10000,
    over25Prob: Math.round(over25 * 10000) / 10000,
    under25Prob: Math.round(under25 * 10000) / 10000,
    bttsYesProb: Math.round(bttsYes * 10000) / 10000,
    bttsNoProb: Math.round(bttsNo * 10000) / 10000,
    topScorelines,
  };
}
