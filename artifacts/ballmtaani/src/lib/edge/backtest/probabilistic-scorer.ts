/**
 * BallMtaani Edge Phase 4 — Probabilistic Scorer
 * Multi-class Brier score, Multi-class Log Loss, and Top-Choice Accuracy calculations.
 */

export interface PredictionOutcomePair {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  actualResult: "home_win" | "draw" | "away_win";
  over25Prob?: number;
  actualOver25?: boolean;
}

export interface ProbabilisticScoringMetrics {
  brierScore: number;
  logLoss: number;
  accuracy: number; // 0 to 100%
  sampleSize: number;
  homeWinAccuracy: number;
  drawAccuracy: number;
  awayWinAccuracy: number;
}

const EPSILON = 1e-15;

export function calculateProbabilisticMetrics(pairs: PredictionOutcomePair[]): ProbabilisticScoringMetrics {
  const n = pairs.length;
  if (n === 0) {
    return {
      brierScore: 0,
      logLoss: 0,
      accuracy: 0,
      sampleSize: 0,
      homeWinAccuracy: 0,
      drawAccuracy: 0,
      awayWinAccuracy: 0,
    };
  }

  let totalBrier = 0;
  let totalLogLoss = 0;
  let correctTopChoices = 0;

  let homeTotal = 0, homeCorrect = 0;
  let drawTotal = 0, drawCorrect = 0;
  let awayTotal = 0, awayCorrect = 0;

  for (const item of pairs) {
    const yH = item.actualResult === "home_win" ? 1 : 0;
    const yD = item.actualResult === "draw" ? 1 : 0;
    const yA = item.actualResult === "away_win" ? 1 : 0;

    // 1. Multi-class Brier score: (pH - yH)^2 + (pD - yD)^2 + (pA - yA)^2
    const brierComponent = Math.pow(item.homeProb - yH, 2) + Math.pow(item.drawProb - yD, 2) + Math.pow(item.awayProb - yA, 2);
    totalBrier += brierComponent;

    // 2. Multi-class Log Loss: -ln(p_actual)
    let pActual = EPSILON;
    if (item.actualResult === "home_win") pActual = Math.max(EPSILON, item.homeProb);
    else if (item.actualResult === "draw") pActual = Math.max(EPSILON, item.drawProb);
    else if (item.actualResult === "away_win") pActual = Math.max(EPSILON, item.awayProb);

    totalLogLoss += -Math.log(pActual);

    // 3. Top choice accuracy
    let predictedChoice: "home_win" | "draw" | "away_win" = "home_win";
    if (item.drawProb >= item.homeProb && item.drawProb >= item.awayProb) predictedChoice = "draw";
    else if (item.awayProb >= item.homeProb && item.awayProb >= item.drawProb) predictedChoice = "away_win";

    const isCorrect = predictedChoice === item.actualResult;
    if (isCorrect) correctTopChoices += 1;

    if (item.actualResult === "home_win") { homeTotal++; if (isCorrect) homeCorrect++; }
    if (item.actualResult === "draw") { drawTotal++; if (isCorrect) drawCorrect++; }
    if (item.actualResult === "away_win") { awayTotal++; if (isCorrect) awayCorrect++; }
  }

  const avgBrier = Math.round((totalBrier / n) * 10000) / 10000;
  const avgLogLoss = Math.round((totalLogLoss / n) * 10000) / 10000;
  const accuracy = Math.round((correctTopChoices / n) * 10000) / 100;

  return {
    brierScore: avgBrier,
    logLoss: avgLogLoss,
    accuracy,
    sampleSize: n,
    homeWinAccuracy: homeTotal > 0 ? Math.round((homeCorrect / homeTotal) * 100) : 0,
    drawAccuracy: drawTotal > 0 ? Math.round((drawCorrect / drawTotal) * 100) : 0,
    awayWinAccuracy: awayTotal > 0 ? Math.round((awayCorrect / awayTotal) * 100) : 0,
  };
}
