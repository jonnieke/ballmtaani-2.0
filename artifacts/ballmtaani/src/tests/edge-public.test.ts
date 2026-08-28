/**
 * BallMtaani Edge Phase 5 & 6 — Public Experience & Component Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { getEdgeFeatureFlag } from "../lib/edge/public/feature-flags";
import { getPublishedUpcomingPredictions, getPublishedPredictionById } from "../lib/edge/public/public-api-service";

test("1. Central Feature Flag Evaluation", () => {
  const publicEnabled = getEdgeFeatureFlag("EDGE_PUBLIC_ENABLED");
  assert.equal(publicEnabled, true, "EDGE_PUBLIC_ENABLED must default to true");

  const premiumEnabled = getEdgeFeatureFlag("EDGE_PREMIUM_ENABLED");
  assert.equal(premiumEnabled, true, "EDGE_PREMIUM_ENABLED is enabled for Phase 6 monetization");
});

test("2. Public API Service Layer never invents records when the database is unavailable", async () => {
  const predictions = await getPublishedUpcomingPredictions();
  assert.ok(Array.isArray(predictions));
  assert.equal(predictions.some((prediction) => String(prediction.fixtureId).startsWith("epl-")), false, "Demo fixture IDs must not leak into production retrieval");

  const missing = await getPublishedPredictionById("fixture-that-does-not-exist");
  assert.equal(missing, null, "A missing fixture must not fall back to a different prediction");
});

test("3. Probability Sum & Market Consistency", async () => {
  const predictions = await getPublishedUpcomingPredictions();
  for (const pred of predictions) {
    const probSum = pred.homeWinProb + pred.drawProb + pred.awayWinProb;
    assert.ok(Math.abs(probSum - 1.0) < 0.02, "1X2 probabilities must total 1.0");
    const ouSum = pred.over25Prob + pred.under25Prob;
    assert.ok(Math.abs(ouSum - 1.0) < 0.02, "Over/Under probabilities must total 1.0");
  }
});
