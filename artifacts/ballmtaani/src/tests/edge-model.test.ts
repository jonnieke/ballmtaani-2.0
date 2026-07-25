/**
 * BallMtaani Edge Phase 3 — Prediction Engine Core Unit & Integration Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  calculateExpectedEloWinProb,
  calculateGoalDifferenceMultiplier,
  processMatchEloUpdate,
} from "../lib/edge/engine/elo-engine";
import {
  calculateTimeDecayWeight,
  estimateTeamStrengthParameters,
} from "../lib/edge/engine/team-strength";
import { solveDixonColesModel } from "../lib/edge/engine/dixon-coles-solver";
import { evaluateModelConfidenceScore } from "../lib/edge/engine/confidence-risk";
import { generateFixturePrediction } from "../lib/edge/engine/prediction-generator";

test("1. Elo Engine — Expected Win Probability & Home Advantage", () => {
  const p1 = calculateExpectedEloWinProb(1500, 1500, true, false); // +65 home adv
  assert.ok(p1 > 0.55, "Home team with +65 advantage should have > 55% expected win probability");

  const p2 = calculateExpectedEloWinProb(1500, 1500, true, true); // neutral venue
  assert.equal(Math.round(p2 * 100), 50, "Equal teams on neutral venue should have 50% expected win probability");
});

test("2. Elo Engine — Goal Difference Multiplier Scaling", () => {
  const m1 = calculateGoalDifferenceMultiplier(2, 1, 0); // 1 goal diff
  assert.equal(m1, 1.0, "1 goal difference should have 1.0 multiplier");

  const m3 = calculateGoalDifferenceMultiplier(4, 0, 0); // 4 goal diff
  assert.ok(m3 > 1.4, "4 goal difference should scale multiplier > 1.4");
});

test("3. Elo Engine — Match Result Rating Updates", () => {
  const update = processMatchEloUpdate(1600, 1500, 2, 0);
  assert.ok(update.homeChange > 0, "Winning home team should gain Elo points");
  assert.equal(update.homeChange, -update.awayChange, "Elo changes must be zero-sum");
  assert.equal(update.newHomeRating, 1600 + update.homeChange, "New rating must equal old + change");
});

test("4. Team Strength Solver — Time Decay & Bayesian Shrinkage", () => {
  const w1 = calculateTimeDecayWeight("2026-07-24T00:00:00Z", "2026-07-24T00:00:00Z", 180);
  assert.equal(w1, 1.0, "Same day match weight should be 1.0");

  const w2 = calculateTimeDecayWeight("2026-01-25T00:00:00Z", "2026-07-24T00:00:00Z", 180);
  assert.ok(w2 < 0.55, "180-day old match weight should decay to approximately 0.5");

  const str = estimateTeamStrengthParameters([3, 2, 4], [0, 1, 0], [true, true, false]);
  assert.ok(str.attackStrength > 1.0, "High scoring team should have attack strength > 1.0");
  assert.ok(str.defenceStrength < 1.0, "Low conceding team should have defence strength < 1.0");
});

test("5. Dixon-Coles Solver — Probability Matrix & Totals Validation", () => {
  const sol = solveDixonColesModel({
    homeElo: 1620,
    awayElo: 1610,
    homeAttack: 1.35,
    homeDefence: 0.95,
    awayAttack: 1.25,
    awayDefence: 1.05,
  });

  const sum1X2 = sol.homeWinProb + sol.drawProb + sol.awayWinProb;
  assert.ok(Math.abs(sum1X2 - 1.0) < 0.005, `1X2 probabilities must sum to 1.0 (got ${sum1X2})`);

  const sumOU = sol.over25Prob + sol.under25Prob;
  assert.ok(Math.abs(sumOU - 1.0) < 0.005, `Over/Under probabilities must sum to 1.0 (got ${sumOU})`);

  const sumBTTS = sol.bttsYesProb + sol.bttsNoProb;
  assert.ok(Math.abs(sumBTTS - 1.0) < 0.005, `BTTS probabilities must sum to 1.0 (got ${sumBTTS})`);

  assert.equal(sol.topScorelines.length, 3, "Should extract top 3 scorelines");
});

test("6. Confidence Engine & Deterministic Risk Factors", () => {
  const conf1 = evaluateModelConfidenceScore({
    homeMatchesCount: 15,
    awayMatchesCount: 15,
    dataQualityScore: 90,
    homeWinProb: 0.60,
    drawProb: 0.25,
    awayWinProb: 0.15,
    homeRestDays: 7,
    awayRestDays: 7,
    isPromotedTeam: false,
    isEarlySeason: false,
  });

  assert.equal(conf1.confidenceLabel, "High", "Established teams with high quality data should classify as High confidence");

  const conf2 = evaluateModelConfidenceScore({
    homeMatchesCount: 2,
    awayMatchesCount: 2,
    dataQualityScore: 60,
    homeWinProb: 0.35,
    drawProb: 0.35,
    awayWinProb: 0.30,
    homeRestDays: 2,
    awayRestDays: 7,
    isPromotedTeam: true,
    isEarlySeason: true,
  });

  assert.equal(conf2.confidenceLabel, "Low", "Promoted team with short rest & early season should classify as Low confidence");
  assert.ok(conf2.riskFactors.length >= 2, "Low confidence match should generate deterministic risk factors");
});

test("7. Combined Prediction Generator & Model Sanity Check", () => {
  const pred = generateFixturePrediction({
    fixtureId: "test-101",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    competition: "Premier League",
    kickoffAt: "2026-07-26T19:30:00Z",
    homeElo: 1620,
    awayElo: 1610,
    homeAttack: 1.35,
    homeDefence: 0.95,
    awayAttack: 1.25,
    awayDefence: 1.05,
    homeMatchesCount: 12,
    awayMatchesCount: 12,
  });

  assert.equal(pred.homeTeam, "Arsenal");
  assert.equal(pred.modelVersion, "ballmtaani-edge-statistical-v1");
  assert.ok(pred.expectedHomeGoals > 0 && pred.expectedHomeGoals < 4.5, "Expected goals must lie in realistic bounds");
  assert.ok(pred.topScorelines[0].probability > pred.topScorelines[1].probability, "Likely scorelines must be sorted by descending probability");
});
