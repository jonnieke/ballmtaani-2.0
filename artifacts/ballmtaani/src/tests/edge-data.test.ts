/**
 * BallMtaani Edge Phase 2 — Data Foundation Core Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { COMPETITION_REGISTRY, getSupportedCompetitionsList } from "../lib/edge/data/competitions-config";
import { normalizeMatchStatus } from "../lib/edge/data/mappers";
import { normalizeTeamName, resolveTeamAlias } from "../lib/edge/data/team-normalizer";
import { calculateFixtureDataQualityScore } from "../lib/edge/data/data-quality-scorer";
import { evaluateCompetitionReadiness, generateCompetitionCoverageReport } from "../lib/edge/data/coverage-reporter";

test("1. Central Competition Registry", () => {
  const list = getSupportedCompetitionsList();
  assert.equal(list.length, 5, "Registry should contain 5 initial competitions");

  const epl = COMPETITION_REGISTRY.epl;
  assert.equal(epl.providerId, 39, "EPL provider ID should be 39");
  assert.equal(epl.predictionEnabled, true, "EPL should be prediction enabled");

  const kpl = COMPETITION_REGISTRY.kpl;
  assert.equal(kpl.predictionEnabled, false, "KPL should be prediction disabled until dataset completeness is met");
});

test("2. Canonical Match Status Normalization", () => {
  assert.equal(normalizeMatchStatus("NS"), "scheduled", "NS -> scheduled");
  assert.equal(normalizeMatchStatus("1H"), "first_half", "1H -> first_half");
  assert.equal(normalizeMatchStatus("HT"), "halftime", "HT -> halftime");
  assert.equal(normalizeMatchStatus("2H"), "second_half", "2H -> second_half");
  assert.equal(normalizeMatchStatus("FT"), "completed", "FT -> completed");
  assert.equal(normalizeMatchStatus("AET"), "completed", "AET -> completed");
  assert.equal(normalizeMatchStatus("PPD"), "postponed", "PPD -> postponed");
  assert.equal(normalizeMatchStatus("CANC"), "cancelled", "CANC -> cancelled");
});

test("3. Team Name Normalization & Alias Lookup", () => {
  const norm1 = normalizeTeamName("Manchester United FC");
  assert.equal(norm1, "manchester united", "Should strip FC suffix and lowercase");

  const norm2 = normalizeTeamName("  Paris  Saint-Germain FC ");
  assert.equal(norm2, "paris saint germain", "Should handle hyphens and extra whitespace");

  const alias1 = resolveTeamAlias("spurs");
  assert.equal(alias1, "tottenham hotspur", "Should resolve spurs to tottenham hotspur");
});

test("4. Fixture Data Quality Scoring Engine (0-100)", () => {
  const completeInput = {
    hasCompetition: true,
    hasSeason: true,
    hasHomeTeam: true,
    hasAwayTeam: true,
    hasProviderId: true,

    hasKickoffAt: true,
    hasTimezone: true,
    hasValidStatus: true,
    hasMatchweekOrRound: true,

    isCompleted: true,
    hasHomeScore: true,
    hasAwayScore: true,
    hasHalftimeScore: true,

    hasShots: true,
    hasShotsOnTarget: true,
    hasPossession: true,
    hasCorners: true,
    hasCards: true,
    hasExpectedGoals: true,

    hasVenue: true,
    hasReferee: true,
  };

  const res1 = calculateFixtureDataQualityScore(completeInput);
  assert.equal(res1.score, 100, "Complete match should score 100");
  assert.equal(res1.label, "Excellent", "Score 100 should classify as Excellent");

  const incompleteInput = {
    ...completeInput,
    hasShots: false,
    hasShotsOnTarget: false,
    hasPossession: false,
    hasCorners: false,
    hasCards: false,
    hasExpectedGoals: false,
  };

  const res2 = calculateFixtureDataQualityScore(incompleteInput);
  assert.ok(res2.score < 75, "Missing statistics should lower quality score");
});

test("5. Competition Coverage & Phase 3 Readiness Check", () => {
  const notReady = evaluateCompetitionReadiness(20, 100, 100, 85, 0);
  assert.equal(notReady.isReady, false, "Fewer than 50 completed matches should not be Phase 3 ready");

  const ready = evaluateCompetitionReadiness(100, 100, 80, 85, 0);
  assert.equal(ready.isReady, true, "100 completed matches with 80% stats should be Phase 3 ready");
});
