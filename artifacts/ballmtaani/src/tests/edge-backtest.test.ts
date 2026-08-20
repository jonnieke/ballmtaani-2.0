/**
 * BallMtaani Edge Phase 4 — Backtesting & Calibration Core Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { validateHistoricalDataLeakage } from "../lib/edge/backtest/leakage-validator";
import { calculateProbabilisticMetrics } from "../lib/edge/backtest/probabilistic-scorer";
import { analyzeProbabilityCalibration } from "../lib/edge/backtest/calibration-analyzer";
import { generateBenchmarkComparisonMatrix } from "../lib/edge/backtest/benchmark-comparator";
import { simulateHypotheticalFlatRoi } from "../lib/edge/backtest/roi-simulator";
import { evaluateModelAcceptanceGates } from "../lib/edge/backtest/model-acceptance-gates";
import { executeWalkForwardBacktest } from "../lib/edge/backtest/walk-forward-engine";

test("1. Leakage Validator — Timestamp & Post-Match Data Protection", () => {
  const valid = validateHistoricalDataLeakage({
    fixtureKickoff: "2026-07-26T19:30:00Z",
    predictionCutoff: "2026-07-25T19:30:00Z",
    featureTimestamp: "2026-07-25T18:00:00Z",
    trainingCutoff: "2026-07-25T19:30:00Z",
  });
  assert.equal(valid.isValid, true, "Point-in-time features prior to cutoff must pass leakage validation");

  const invalid = validateHistoricalDataLeakage({
    fixtureKickoff: "2026-07-26T19:30:00Z",
    predictionCutoff: "2026-07-26T20:00:00Z", // After kickoff
    featureTimestamp: "2026-07-26T20:00:00Z",
    trainingCutoff: "2026-07-26T20:00:00Z",
  });
  assert.equal(invalid.isValid, false, "Features generated after kickoff must trigger leakage failure");
});

test("2. Probabilistic Scorer — Multi-class Brier Score & Log Loss", () => {
  const res = calculateProbabilisticMetrics([
    { homeProb: 0.60, drawProb: 0.25, awayProb: 0.15, actualResult: "home_win" },
    { homeProb: 0.30, drawProb: 0.45, awayProb: 0.25, actualResult: "draw" },
  ]);

  assert.ok(res.brierScore < 0.50, "Accurate probabilistic predictions must produce Brier score < 0.50");
  assert.ok(res.logLoss < 1.0, "Log loss should be less than 1.0");
  assert.equal(res.accuracy, 100, "Both top choices correct = 100% accuracy");
});

test("3. Calibration Analyzer — ECE & 10-Bucket Grouping", () => {
  const probs = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85];
  const actuals = [0, 0, 0, 0, 1, 1, 1, 1];

  const cal = analyzeProbabilityCalibration(probs, actuals);
  assert.equal(cal.buckets.length, 10, "Must create 10 probability buckets");
  assert.ok(cal.expectedCalibrationError < 0.35, "ECE must calculate finite value < 0.35");
});

test("4. Benchmark Comparator Matrix", () => {
  const matrix = generateBenchmarkComparisonMatrix(0.4850, 0.8200, 52.0, 0.045);
  assert.equal(matrix.length, 4, "Must compare 4 model entries");
  assert.equal(matrix[0].isModelSuperiorToUniform, true, "Statistical v1 must beat uniform benchmark Brier score");
});

test("5. Hypothetical ROI & Drawdown Simulator", () => {
  const roi = simulateHypotheticalFlatRoi([
    { fixtureId: "1", predictedProbability: 0.55, decimalOdds: 2.10, isWon: true },
    { fixtureId: "2", predictedProbability: 0.60, decimalOdds: 1.85, isWon: false },
    { fixtureId: "3", predictedProbability: 0.50, decimalOdds: 2.20, isWon: true },
  ]);

  assert.equal(roi.totalStaked, 3.0, "Total staked must equal 3 units");
  assert.equal(roi.netUnits, 1.3, "Net units returned must equal 1.3");
  assert.ok(roi.roiPercentage > 0, "Positive net returns must yield positive ROI%");
  assert.equal(roi.longestLosingStreak, 1, "Longest losing streak should be 1");
});

test("6. Model Acceptance Gates Evaluator", () => {
  const dec1 = evaluateModelAcceptanceGates({
    modelKey: "ballmtaani-edge-statistical",
    modelVersion: "v1",
    brierScore: 0.4850,
    logLoss: 0.8200,
    expectedCalibrationError: 0.045,
    leakageStatus: "passed",
    sampleSize: 100,
  });

  assert.equal(dec1.decision, "accepted_for_beta", "Model satisfying all gates must be accepted_for_beta");

  const dec2 = evaluateModelAcceptanceGates({
    modelKey: "ballmtaani-edge-statistical",
    modelVersion: "v1",
    brierScore: 0.4850,
    logLoss: 0.8200,
    expectedCalibrationError: 0.045,
    leakageStatus: "failed", // Leakage failure
    sampleSize: 100,
  });

  assert.equal(dec2.decision, "rejected", "Model with data leakage must be rejected");
});

test("7. Full Walk-Forward Backtest Simulation Execution", () => {
  const run = executeWalkForwardBacktest({
    name: "Full Test Suite Walk-Forward",
    modelVersion: "ballmtaani-edge-statistical-v1",
    evaluationMode: "expanding",
    trainingWindowDays: 730,
    competitions: ["epl", "ucl"],
    retrainingFrequency: "weekly",
  });

  assert.equal(run.status, "completed");
  assert.equal(run.leakageStatus, "passed");
  assert.ok(run.totalFixturesProcessed >= 50, "Should evaluate at least 50 historical fixtures");
  assert.ok(["accepted_for_beta", "needs_recalibration"].includes(run.decision.decision), "Walk-forward decision should be valid");
});
