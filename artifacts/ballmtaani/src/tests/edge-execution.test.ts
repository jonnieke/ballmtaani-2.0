/**
 * BallMtaani Edge Phase 12 — Controlled Launch, Partnerships, Activation & Expansion Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { LaunchWaveService } from "../lib/edge/waves/launch-wave-service";
import { SocialCardGenerator } from "../lib/edge/marketing/social-card-generator";
import { PartnershipPipelineService } from "../lib/edge/partnerships/partnership-pipeline-service";
import { UserActivationEngine } from "../lib/edge/activation/user-activation-engine";
import { ExpansionScorecardEngine } from "../lib/edge/expansion/expansion-scorecard-engine";

test("1. Launch Wave Status & Server-Side Subscriber Ceiling Enforcement", () => {
  const wave = LaunchWaveService.getActiveLaunchWave();
  assert.ok(wave.subscriberLimit >= 1000, "Launch wave must have a valid subscriber ceiling");
  assert.ok(wave.currentSubscriberCount <= wave.subscriberLimit, "Current count must not exceed ceiling");

  const eligible = LaunchWaveService.checkSubscriberEnrolmentEligibility("usr-within-limit");
  assert.equal(eligible.isEligible, true, "User within ceiling should be eligible");
});

test("2. Social Prediction Card Generator — Probabilities, Confidence & Disclaimer", () => {
  const card = SocialCardGenerator.generateSocialCard({
    fixtureId: "fix-epl-001",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeWinProb: 0.55,
    drawProb: 0.25,
    awayWinProb: 0.20,
    confidence: "HIGH",
  });

  assert.equal(card.homeTeam, "Arsenal");
  assert.equal(card.awayTeam, "Chelsea");
  assert.ok(card.modelVersion.includes("BallMtaani"), "Card must include model attribution");
  assert.ok(card.disclaimer.length > 0, "Card must include responsible-use disclaimer");
  assert.ok(!card.disclaimer.toLowerCase().includes("guaranteed"), "Disclaimer must not contain 'guaranteed'");
});

test("3. Strategic Partnership Pipeline — Opportunity Scoring & Proposal Margin Validation", () => {
  const opp = PartnershipPipelineService.evaluateOpportunity("Safaricom SuperApp", "telecom");
  assert.ok(opp.overallStrategicScore >= 50, "Strategic score must be meaningful");
  assert.equal(opp.partnerType, "telecom");

  const proposal = PartnershipPipelineService.generateCommercialProposal(opp.id, 50000);
  assert.ok(proposal.proposedMonthlyPriceKes > 0, "Proposal must have positive monthly price");
  assert.ok(proposal.estimatedContributionKes > 0, "Estimated contribution must be positive");
  assert.ok(proposal.revenueSharePct > 0 && proposal.revenueSharePct < 100, "Revenue share must be a valid percentage");
});

test("4. User Activation Milestone Tracker & Subscriber Health Scoring Engine", () => {
  const activation = UserActivationEngine.evaluateUserActivation("usr-test-activation");
  assert.equal(typeof activation.isFullyActivated, "boolean");
  assert.equal(typeof activation.viewedFirstPremiumMatch, "boolean");
  assert.equal(typeof activation.savedFirstTeam, "boolean");
  assert.equal(typeof activation.enabledFirstAlert, "boolean");

  const health = UserActivationEngine.calculateSubscriberHealthScore("usr-test-health");
  const validCategories = ["new", "activated", "engaged", "at_risk"];
  assert.ok(validCategories.includes(health.healthCategory), "Health category must be one of the valid lifecycle states");
  assert.ok(health.score >= 0 && health.score <= 100, "Health score must be between 0 and 100");
});

test("5. Expansion Scorecard Engine — Competition & Country Candidate Scoring", () => {
  const compScore = ExpansionScorecardEngine.evaluateExpansionCandidate("French Ligue 1", "competition");
  assert.ok(compScore.overallScore >= 0 && compScore.overallScore <= 100, "Overall score must be 0-100");
  assert.ok(["approve_pilot", "defer", "reject"].includes(compScore.recommendedDecision), "Decision must be a valid option");
  assert.equal(compScore.expansionType, "competition");

  const countryScore = ExpansionScorecardEngine.evaluateExpansionCandidate("Tanzania", "country");
  assert.ok(countryScore.overallScore >= 0 && countryScore.overallScore <= 100);
  assert.ok(countryScore.complianceScore > 0, "Compliance score must be evaluated");
});
