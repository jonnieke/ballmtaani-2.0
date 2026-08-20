/**
 * BallMtaani Edge — Walk-Forward Backtesting Engine
 * Calculates Brier score, log loss, 10-bucket calibration, ROI simulation, drawdown, and win/loss sequences.
 */

import { BacktestFixtureRecord, BacktestSummary, CalibrationBucket } from "./types";

export function calculateBrierScore(predictions: number[], outcomes: number[]): number {
  if (predictions.length === 0 || predictions.length !== outcomes.length) return 0;
  let sum = 0;
  for (let i = 0; i < predictions.length; i++) {
    const diff = predictions[i] - outcomes[i];
    sum += diff * diff;
  }
  return Math.round((sum / predictions.length) * 10000) / 10000;
}

export function calculateLogLoss(predictions: number[], outcomes: number[]): number {
  if (predictions.length === 0 || predictions.length !== outcomes.length) return 0;
  let sum = 0;
  const eps = 1e-15; // clip boundary
  for (let i = 0; i < predictions.length; i++) {
    const p = Math.max(eps, Math.min(1 - eps, predictions[i]));
    const y = outcomes[i];
    sum += y * Math.log(p) + (1 - y) * Math.log(1 - p);
  }
  return Math.round((-sum / predictions.length) * 10000) / 10000;
}

export function generateCalibrationBuckets(predictions: number[], outcomes: number[]): CalibrationBucket[] {
  const buckets: CalibrationBucket[] = [];
  const bucketStep = 0.10;

  for (let b = 0; b < 10; b++) {
    const minProb = b * bucketStep;
    const maxProb = (b + 1) * bucketStep;
    const bucketLabel = `${Math.round(minProb * 100)}% - ${Math.round(maxProb * 100)}%`;

    const matchedPreds: number[] = [];
    const matchedOutcomes: number[] = [];

    for (let i = 0; i < predictions.length; i++) {
      const p = predictions[i];
      if (p >= minProb && (b === 9 ? p <= maxProb : p < maxProb)) {
        matchedPreds.push(p);
        matchedOutcomes.push(outcomes[i]);
      }
    }

    const count = matchedPreds.length;
    const avgPred = count > 0 ? matchedPreds.reduce((a, c) => a + c, 0) / count : 0;
    const actualFreq = count > 0 ? matchedOutcomes.reduce((a, c) => a + c, 0) / count : 0;
    const calError = count > 0 ? Math.abs(avgPred - actualFreq) : 0;

    buckets.push({
      bucketRange: bucketLabel,
      minProb,
      maxProb,
      predictionCount: count,
      avgPredictedProb: Math.round(avgPred * 1000) / 1000,
      actualWinFrequency: Math.round(actualFreq * 1000) / 1000,
      calibrationError: Math.round(calError * 1000) / 1000,
    });
  }

  return buckets;
}

export function runWalkForwardBacktest(
  records: BacktestFixtureRecord[],
  modelVersion: string = "v1.0.0"
): BacktestSummary {
  // Sort chronologically ascending
  const sorted = [...records].sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  const homePreds: number[] = [];
  const homeOutcomes: number[] = [];

  let correctCount = 0;
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentLossStreak = 0;
  let maxLossStreak = 0;

  let cumulativeProfit = 0;
  let peakProfit = 0;
  let maxDrawdown = 0;
  let betsPlaced = 0;

  const leagueStats: Record<string, { matches: number; profit: number; brierSum: number }> = {};

  for (const match of sorted) {
    let actualOutcome = "DRAW";
    if (match.actualHomeScore > match.actualAwayScore) actualOutcome = "HOME";
    else if (match.actualHomeScore < match.actualAwayScore) actualOutcome = "AWAY";

    const isHomeActualWin = actualOutcome === "HOME" ? 1 : 0;
    homePreds.push(match.predictedHomeWinProb);
    homeOutcomes.push(isHomeActualWin);

    // Track league level performance
    if (!leagueStats[match.competition]) {
      leagueStats[match.competition] = { matches: 0, profit: 0, brierSum: 0 };
    }
    leagueStats[match.competition].matches += 1;
    const brierSingle = Math.pow(match.predictedHomeWinProb - isHomeActualWin, 2);
    leagueStats[match.competition].brierSum += brierSingle;

    // Simulate 1 unit fixed bet on Edge recommendations
    if (match.recommendation === "Strong Edge" || match.recommendation === "Moderate Edge") {
      betsPlaced += 1;
      const selection = match.marketSelection || "HOME";
      const isWon = selection === actualOutcome;

      let odds = 2.0;
      if (selection === "HOME" && match.marketHomeOdds) odds = match.marketHomeOdds;
      else if (selection === "DRAW" && match.marketDrawOdds) odds = match.marketDrawOdds;
      else if (selection === "AWAY" && match.marketAwayOdds) odds = match.marketAwayOdds;

      if (isWon) {
        correctCount += 1;
        currentWinStreak += 1;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
        const profit = odds - 1;
        cumulativeProfit += profit;
        leagueStats[match.competition].profit += profit;
      } else {
        currentLossStreak += 1;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
        const profit = -1;
        cumulativeProfit += profit;
        leagueStats[match.competition].profit += profit;
      }

      if (cumulativeProfit > peakProfit) {
        peakProfit = cumulativeProfit;
      }
      const drawdown = peakProfit - cumulativeProfit;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
  }

  const brierScore = calculateBrierScore(homePreds, homeOutcomes);
  const logLoss = calculateLogLoss(homePreds, homeOutcomes);
  const calibrationBuckets = generateCalibrationBuckets(homePreds, homeOutcomes);

  const accuracy = betsPlaced > 0 ? Math.round((correctCount / betsPlaced) * 1000) / 10 : 0;
  const roiPct = betsPlaced > 0 ? Math.round((cumulativeProfit / betsPlaced) * 10000) / 100 : 0;
  const maxDrawdownPct = peakProfit > 0 ? Math.round((maxDrawdown / peakProfit) * 10000) / 100 : 0;

  const formattedLeagueBreakdown: Record<string, { matches: number; roi: number; brier: number }> = {};
  for (const [league, stat] of Object.entries(leagueStats)) {
    formattedLeagueBreakdown[league] = {
      matches: stat.matches,
      roi: stat.matches > 0 ? Math.round((stat.profit / stat.matches) * 10000) / 100 : 0,
      brier: stat.matches > 0 ? Math.round((stat.brierSum / stat.matches) * 1000) / 1000 : 0,
    };
  }

  return {
    modelVersion,
    totalMatches: sorted.length,
    totalPredictions: betsPlaced,
    brierScore,
    logLoss,
    accuracy,
    calibrationBuckets,
    simulatedRoiPercentage: roiPct,
    totalHypotheticalUnitsProfit: Math.round(cumulativeProfit * 100) / 100,
    longestWinningStreak: maxWinStreak,
    longestLosingStreak: maxLossStreak,
    maxDrawdownPercentage: maxDrawdownPct,
    sampleSizeWarning: sorted.length < 50,
    leagueBreakdown: formattedLeagueBreakdown,
  };
}
