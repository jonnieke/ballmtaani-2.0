/**
 * BallMtaani Edge Phase 10 — Advanced Ensembles, Automated Drift, Telecom & Commercial Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { FeatureStoreService } from "../lib/edge/ensemble/feature-store-service";
import { AdvancedEnsembleEngine } from "../lib/edge/ensemble/advanced-ensemble-engine";
import { ChampionChallengerEngine } from "../lib/edge/ensemble/champion-challenger-engine";
import { AutomatedDriftMonitor } from "../lib/edge/ensemble/automated-drift-monitor";
import { TelecomDistributionService } from "../lib/edge/telecom/telecom-distribution-service";
import { UnitEconomicsEngine } from "../lib/edge/commercial/unit-economics-engine";

test("1. Versioned Feature Store & Point-In-Time Feature Retrieval", () => {
  const features = FeatureStoreService.getPointInTimeFeatures("epl-2026-001", new Date().toISOString());
  assert.equal(features.elo_diff_v1, 145.5, "Must retrieve point-in-time Elo difference");
  assert.equal(features.rest_days_v1, 6, "Must retrieve rest days feature");
});

test("2. Multi-Model Probability Ensemble Blending & Sum Normalization", () => {
  const result = AdvancedEnsembleEngine.solve1X2Ensemble({
    dixonColes: { homeProb: 0.524, drawProb: 0.258, awayProb: 0.218 },
    lightGbm: { homeProb: 0.540, drawProb: 0.245, awayProb: 0.215 },
    eloModel: { homeProb: 0.510, drawProb: 0.260, awayProb: 0.230 },
    logistic: { homeProb: 0.495, drawProb: 0.275, awayProb: 0.230 },
  });

  const sum = Math.round((result.homeProb + result.drawProb + result.awayProb) * 100) / 100;
  assert.equal(sum, 1.0, "Blended ensemble probabilities must sum to exactly 1.0");
  assert.ok(result.homeProb > 0.50, "Blended home win probability must reflect consensus favorite");
});

test("3. Champion / Challenger Shadow Prediction Framework", () => {
  const rec = ChampionChallengerEngine.createShadowPrediction("epl-2026-001", 0.524, 0.548);
  assert.equal(rec.fixtureId, "epl-2026-001");
  assert.equal(rec.differencePct, 2.4, "Shadow prediction discrepancy must be 2.4%");
});

test("4. Automated Model Drift Monitoring & Health Triggers", () => {
  const normalRun = AutomatedDriftMonitor.evaluateModelHealth({
    modelVersion: "ballmtaani-edge-ensemble-v2",
    rollingSampleCount: 100,
    baselineBrierScore: 0.4850,
    currentBrierScore: 0.4880,
    baselineEce: 0.0320,
    currentEce: 0.0340,
  });

  assert.equal(normalRun.status, "normal");

  const driftedRun = AutomatedDriftMonitor.evaluateModelHealth({
    modelVersion: "ballmtaani-edge-ensemble-v2",
    rollingSampleCount: 100,
    baselineBrierScore: 0.4850,
    currentBrierScore: 0.5500, // +0.065 Brier drift
    baselineEce: 0.0320,
    currentEce: 0.0800,  // +0.048 ECE drift
  });

  assert.equal(driftedRun.status, "rollback_triggered", "Severe drift must trigger automatic rollback status");
});

test("5. Telecom Distribution & Sponsored Access Grants", () => {
  const grant = TelecomDistributionService.grantSponsoredAccess({
    partnerKey: "safaricom_ke",
    subscriberHash: "hash-msisdn-254712345678",
    durationHours: 24,
  });

  assert.equal(grant.success, true);
  assert.ok(grant.grantId.startsWith("grant-"));

  const rev = TelecomDistributionService.calculateRevenueShare(100000, 0.30);
  assert.equal(rev.partnerShareKes, 30000);
  assert.equal(rev.platformNetKes, 70000);
});

test("6. Unit Economics & Commercial Scale-Up Metrics Engine", () => {
  const metrics = UnitEconomicsEngine.calculateCommercialMetrics();
  assert.ok(metrics.mrrUsd > 0, "MRR must be positive");
  assert.ok(metrics.ltvCacRatio >= 3.0, "LTV:CAC ratio must be sustainable (>= 3.0x)");
  assert.equal(metrics.grossMarginPercentage, 84.5);
});
