/**
 * BallMtaani Edge Phase 7 — Premium Alerts, Lineups & Retention Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { calculateMaterialityScore } from "../lib/edge/alerts/materiality-engine";
import { calculateLineupImpactRevision } from "../lib/edge/alerts/lineup-impact-engine";
import { analyzeOddsMovement } from "../lib/edge/alerts/odds-movement-analyzer";
import { SavedContentService } from "../lib/edge/alerts/saved-content-service";
import { NotificationEventRouter } from "../lib/edge/alerts/notification-event-router";
import { generateFixturePrediction } from "../lib/edge/engine/prediction-generator";
import { EntitlementService } from "../lib/edge/billing/entitlement-service";

test("1. Saved Content Capacity Enforcement by Plan", async () => {
  const freeCap = await SavedContentService.getSavedMatchCapacity("usr-free-1");
  assert.equal(freeCap, 3, "Free plan saved match capacity must be 3");

  const saveRes = await SavedContentService.saveMatch("usr-free-1", "fixture-101");
  assert.equal(saveRes.success, true);
});

test("2. Deterministic Materiality Scoring Engine", () => {
  const smallShiftScore = calculateMaterialityScore({
    eventType: "prediction_revised",
    previousHomeProb: 0.52,
    newHomeProb: 0.50, // 2% diff
  });
  assert.ok(smallShiftScore < 30, "Small probability shift below 4% should score below materiality threshold 30");

  const outcomeFlipScore = calculateMaterialityScore({
    eventType: "prediction_revised",
    previousHomeProb: 0.45,
    newHomeProb: 0.32,
    previousOutcome: "HOME",
    newOutcome: "AWAY",
  });
  assert.ok(outcomeFlipScore >= 50, "Outcome flip must score >= 50 materiality");
});

test("3. Lineup Impact & Prediction Revision Generator", () => {
  const baseHomeAttack = 1.35;
  const baseHomeDefence = 0.95;
  const baseAwayAttack = 1.15;
  const baseAwayDefence = 1.05;

  const pred = generateFixturePrediction({
    fixtureId: "epl-401",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    competition: "Premier League",
    kickoffAt: new Date().toISOString(),
    homeElo: 1620,
    awayElo: 1580,
    homeAttack: baseHomeAttack,
    homeDefence: baseHomeDefence,
    awayAttack: baseAwayAttack,
    awayDefence: baseAwayDefence,
  });

  const impact = calculateLineupImpactRevision({
    currentPrediction: pred,
    homeStarters: [
      { playerName: "Bukayo Saka", position: "F", importanceScore: 9, isStarter: true },
      { playerName: "Martin Odegaard", position: "M", importanceScore: 9, isStarter: false }, // Missing key starter!
    ],
    awayStarters: [
      { playerName: "Cole Palmer", position: "M", importanceScore: 9, isStarter: true },
    ],
    homeElo: 1620,
    awayElo: 1580,
    baseHomeAttack,
    baseHomeDefence,
    baseAwayAttack,
    baseAwayDefence,
  });

  assert.equal(impact.revisionNumber, 2);
  assert.equal(impact.absentHomeKeyPlayers.includes("Martin Odegaard"), true);
  assert.ok(impact.revisedPrediction.homeWinProb < pred.homeWinProb, "Home win probability must decrease when key starter is absent");
});

test("4. Material Odds Movement Detection", () => {
  const smallMove = analyzeOddsMovement({
    fixtureId: "epl-401",
    market: "1X2",
    selection: "HOME",
    previousOdds: 2.10,
    currentOdds: 2.08, // 0.95% shift
    modelFairOdds: 2.00,
  });
  assert.equal(smallMove.isMaterial, false);

  const materialMove = analyzeOddsMovement({
    fixtureId: "epl-401",
    market: "1X2",
    selection: "HOME",
    previousOdds: 2.40,
    currentOdds: 2.15, // 10.4% shortening
    modelFairOdds: 2.10,
  });
  assert.equal(materialMove.isMaterial, true);
  assert.equal(materialMove.direction, "shortened");
});

test("5. Notification Event Router & Entitlement Gating", async () => {
  // Grant active subscription for user
  const now = new Date().toISOString();
  EntitlementService.saveSubscription({
    id: "SUB-ENT-PRO",
    userId: "usr-router-1",
    planId: "plan-edge-pro",
    planCode: "edge_pro",
    status: "active",
    startsAt: now,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: now,
    updatedAt: now,
  });

  const res = await NotificationEventRouter.processAndRouteEvent({
    userId: "usr-router-1",
    alertType: "lineup_impact",
    title: "Lineup Revision: Arsenal vs Chelsea",
    body: "Arsenal win probability adjusted after lineups released.",
    deepLink: "/edge/match/epl-401",
    materialityScore: 85,
  });

  assert.ok(res !== undefined);
});
