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

test("2. Public API Service Layer — Server-Side Published Predictions Retrieval", async () => {
  const predictions = await getPublishedUpcomingPredictions();
  assert.ok(predictions.length >= 2, "Must return at least 2 published upcoming predictions");

  const single = await getPublishedPredictionById("epl-201");
  assert.ok(single !== null, "Must retrieve valid published prediction by fixtureId");
  assert.equal(single?.homeTeam, "Arsenal");
  assert.ok(single?.homeWinProb && single.homeWinProb > 0, "Published prediction must contain valid home win probability");
});

test("3. Probability Sum & Market Consistency", async () => {
  const pred = await getPublishedPredictionById("epl-201");
  assert.ok(pred !== null);

  const probSum = pred!.homeWinProb + pred!.drawProb + pred!.awayWinProb;
  assert.ok(Math.abs(probSum - 1.0) < 0.005, "1X2 probabilities must total 1.0");

  const ouSum = pred!.over25Prob + pred!.under25Prob;
  assert.ok(Math.abs(ouSum - 1.0) < 0.005, "Over/Under probabilities must total 1.0");
});
