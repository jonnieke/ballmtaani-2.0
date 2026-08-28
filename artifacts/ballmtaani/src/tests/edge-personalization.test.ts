/**
 * BallMtaani Edge Phase 8 — Personalization, Kiswahili/Sheng Intelligence, Referrals & B2B Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { rankPersonalizedRecommendations } from "../lib/edge/personalization/recommendation-engine";
import { generateMultilingualExplanation } from "../lib/edge/personalization/multilingual-explanation-engine";
import { ReferralService } from "../lib/edge/personalization/referral-service";
import { B2BApiService } from "../lib/edge/personalization/b2b-api-service";
import { WidgetDeliveryService } from "../lib/edge/personalization/widget-delivery-service";
import { MOCK_PUBLISHED_PREDICTIONS } from "../lib/edge/public/public-api-service";

test("1. Deterministic Recommendation Feed Engine", () => {
  const ranked = rankPersonalizedRecommendations(MOCK_PUBLISHED_PREDICTIONS, {
    userId: "usr-test-1",
    followedTeams: ["Arsenal"],
    followedCompetitions: ["Premier League"],
    savedFixtureIds: [],
    mutedTeams: [],
    mutedCompetitions: [],
  });

  assert.ok(ranked.length > 0, "Must return candidate recommendations");
  assert.equal(ranked[0].prediction.homeTeam, "Arsenal", "Followed team Arsenal must be ranked #1 in feed");
  assert.ok(ranked[0].score >= 90, "Followed team candidate must receive high recommendation score");
});

test("2. Multilingual Match Explanation Generator (EN / SW / SH)", () => {
  const pred = MOCK_PUBLISHED_PREDICTIONS[0];

  const en = generateMultilingualExplanation(pred, "en");
  assert.equal(en.language, "en");
  assert.ok(en.summary.includes(pred.homeTeam) || en.summary.includes(pred.awayTeam), "English summary must include the favoured team name");

  const sw = generateMultilingualExplanation(pred, "sw");
  assert.equal(sw.language, "sw");
  assert.ok(sw.summary.includes("asilimia"), "Kiswahili summary must preserve percentage wording");

  const sh = generateMultilingualExplanation(pred, "sh");
  assert.equal(sh.language, "sh");
  assert.ok(sh.summary.includes("chance"), "Sheng summary must use natural football Sheng");
});

test("3. Referral Code Generation & Anti-Fraud Rules", () => {
  const code = ReferralService.getOrCreateReferralCode("usr-ref-1");
  assert.ok(code.startsWith("EDGE-"), "Referral code must use standard EDGE- prefix");

  const selfRef = ReferralService.trackReferralRegistration("usr-ref-1", "usr-ref-1", code);
  assert.equal(selfRef.success, false, "Self-referrals must be rejected");

  const validRef = ReferralService.trackReferralRegistration("usr-ref-1", "usr-new-2", code);
  assert.equal(validRef.success, true, "Valid referral registration must succeed");

  const payRes = ReferralService.processQualifyingPayment("usr-new-2", 99);
  assert.equal(payRes.qualified, true, "Qualifying payment must trigger reward grant");
  assert.equal(payRes.bonusHoursGranted, 24, "Must grant 24 bonus access hours");
});

test("4. B2B API Key Generation, Hashing & Domain Authentication", () => {
  const key = B2BApiService.generateApiKey("client-test", ["sportsnews.co.ke"]);
  assert.ok(key.rawKey.startsWith("bm_live_"));

  const validAuth = B2BApiService.authenticateApiKey(key.rawKey, "sportsnews.co.ke");
  assert.equal(validAuth.authenticated, true);

  const invalidDomainAuth = B2BApiService.authenticateApiKey(key.rawKey, "unauthorized.com");
  assert.equal(invalidDomainAuth.authenticated, false);
});

test("5. Embeddable Widget Delivery & Domain Allowlist", () => {
  const widget = WidgetDeliveryService.generateMatchCardWidget(MOCK_PUBLISHED_PREDICTIONS[0], "sportsnews.co.ke", ["sportsnews.co.ke"]);
  assert.ok("widgetType" in widget, "Must return valid widget payload for allowed domain");

  const blockedWidget = WidgetDeliveryService.generateMatchCardWidget(MOCK_PUBLISHED_PREDICTIONS[0], "unauthorized.com", ["sportsnews.co.ke"]);
  assert.ok("error" in blockedWidget, "Must block widget payload for unauthorized domain");
});
