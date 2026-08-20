/**
 * BallMtaani Edge — Core Unit & Mathematical Tests
 * Verifies Elo rating, Dixon-Coles Poisson solver, value calculations, and backtesting.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { calculateExpectedEloOutcome, updateEloRatings } from "../lib/edge/elo";
import { calculateDixonColesProbabilities, poissonProbability } from "../lib/edge/dixon-coles";
import {
  calculateFairOdds,
  removeBookmakerMargin,
  calculateExpectedValue,
  classifyEdgeRecommendation,
} from "../lib/edge/value-calculator";
import { runWalkForwardBacktest, calculateBrierScore, calculateLogLoss } from "../lib/edge/backtest-engine";
import { evaluateDataQuality, evaluateModelConfidence } from "../lib/edge/data-quality";
import { generateTemplateExplanation } from "../lib/edge/template-explanations";

test("1. Elo Rating Calculations", () => {
  const expHome = calculateExpectedEloOutcome(1600, 1500, true, 65);
  assert.ok(expHome > 0.5, "Home team with higher Elo + home advantage should have >50% win probability");

  const update = updateEloRatings(1600, 1500, 2, 0, 1.0);
  assert.ok(update.newHomeRating > 1600, "Home team rating should increase after 2-0 win");
  assert.ok(update.newAwayRating < 1500, "Away team rating should decrease after loss");
});

test("2. Dixon-Coles Poisson Model Probabilities Sum to 100%", () => {
  const res = calculateDixonColesProbabilities(1600, 1500, 1.8, 1.2, 1.0, 1.4);
  const probSum = res.homeWinProb + res.drawProb + res.awayWinProb;

  assert.ok(Math.abs(probSum - 1.0) < 0.005, `1X2 probabilities must sum to approximately 1.0 (got ${probSum})`);
  assert.ok(res.expectedHomeGoals > 0, "Expected home goals must be positive");
  assert.ok(res.topScorelines.length === 3, "Should return top 3 scorelines");
});

test("3. Fair Odds & Bookmaker Margin Removal", () => {
  const fairOdds = calculateFairOdds(0.50);
  assert.equal(fairOdds, 2.0, "Fair odds for 50% probability should be 2.0");

  const rawOdds = [2.0, 3.5, 4.0]; // Implied: 0.5 + 0.2857 + 0.25 = 1.0357 (3.57% margin)
  const normalized = removeBookmakerMargin(rawOdds);
  const normSum = normalized.reduce((a, c) => a + c, 0);

  assert.ok(Math.abs(normSum - 1.0) < 0.005, "Normalized market probabilities must sum to 1.0");
});

test("4. Expected Value & Edge Classification", () => {
  const ev = calculateExpectedValue(0.524, 2.10); // EV = 0.524 * 2.10 - 1 = +0.1004 (+10.04%)
  assert.ok(ev > 0.08, "Expected value should be above 8%");

  const recStrong = classifyEdgeRecommendation(0.10, "High", "Excellent");
  assert.equal(recStrong, "Strong Edge", "EV >= 8% should classify as Strong Edge");

  const recNoEdge = classifyEdgeRecommendation(0.01, "Medium", "Good");
  assert.equal(recNoEdge, "No Edge", "EV < 3% should classify as No Edge");
});

test("5. Walk-Forward Backtesting Engine", () => {
  const preds = [0.60, 0.70, 0.20];
  const outcomes = [1, 1, 0];

  const brier = calculateBrierScore(preds, outcomes);
  const logLoss = calculateLogLoss(preds, outcomes);

  assert.ok(brier >= 0 && brier <= 1, "Brier score should be within [0, 1]");
  assert.ok(logLoss >= 0, "Log loss should be non-negative");

  const backtest = runWalkForwardBacktest([
    {
      fixtureId: "test-1",
      matchDate: "2026-06-01",
      competition: "Premier League",
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      actualHomeScore: 2,
      actualAwayScore: 0,
      predictedHomeWinProb: 0.55,
      predictedDrawProb: 0.25,
      predictedAwayWinProb: 0.20,
      predictedOver25Prob: 0.50,
      predictedBttsProb: 0.50,
      marketHomeOdds: 2.10,
      recommendation: "Strong Edge",
      marketSelection: "HOME",
    },
  ]);

  assert.equal(backtest.totalMatches, 1, "Backtest should process 1 match");
  assert.equal(backtest.accuracy, 100, "1 correct prediction out of 1 should yield 100% accuracy");
});

test("6. Deterministic Template Explanation", () => {
  const text = generateTemplateExplanation({
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    homeWinProb: 0.52,
    drawProb: 0.26,
    awayWinProb: 0.22,
    expectedHomeGoals: 1.85,
    expectedAwayGoals: 1.15,
    confidence: "High",
    dataQuality: "Excellent",
    recommendation: "Strong Edge",
    primarySelection: "HOME",
    primaryProbability: 0.52,
    edgePercentage: 10.04,
    riskFactor: "Standard match volatility applies.",
  });

  assert.ok(text.includes("Arsenal"), "Explanation should mention home team");
  assert.ok(text.includes("Strong Edge"), "Explanation should mention recommendation status");
});
