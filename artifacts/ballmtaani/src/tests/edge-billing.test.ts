/**
 * BallMtaani Edge Phase 6 — Subscriptions, M-Pesa Payments & Entitlements Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { LAUNCH_SUBSCRIPTION_PLANS, getPlanByCode } from "../lib/edge/billing/plan-catalog";
import { normalizeKenyanPhoneNumber, maskPhoneNumber } from "../lib/edge/billing/mpesa-adapter";
import { MockPaymentAdapter } from "../lib/edge/billing/mock-payment-adapter";
import { EntitlementService } from "../lib/edge/billing/entitlement-service";
import {
  SubscriptionRecord,
  transitionSubscriptionStatus,
  calculateSubscriptionExpiry,
} from "../lib/edge/billing/subscription-state-machine";
import { shapePredictionResponseForUser } from "../lib/edge/billing/response-shaping";
import { evaluatePaymentReconciliation } from "../lib/edge/billing/reconciliation-service";
import { generateFixturePrediction } from "../lib/edge/engine/prediction-generator";

test("1. Central Plan Catalogue Initialization", () => {
  assert.equal(LAUNCH_SUBSCRIPTION_PLANS.length, 4, "Must configure 4 launch subscription plans");

  const freePlan = getPlanByCode("free");
  assert.equal(freePlan?.priceAmount, 0);

  const matchdayPlan = getPlanByCode("matchday_pass");
  assert.equal(matchdayPlan?.priceAmount, 20);
  assert.equal(matchdayPlan?.durationHours, 24);

  const weeklyPlan = getPlanByCode("weekly_edge");
  assert.equal(weeklyPlan?.priceAmount, 99);
  assert.equal(weeklyPlan?.durationHours, 168);

  const proPlan = getPlanByCode("edge_pro");
  assert.equal(proPlan?.priceAmount, 399);
  assert.equal(proPlan?.durationHours, 720);
});

test("2. Kenyan Phone Number Normalization & Masking", () => {
  assert.equal(normalizeKenyanPhoneNumber("0712345678"), "254712345678");
  assert.equal(normalizeKenyanPhoneNumber("0112345678"), "254112345678");
  assert.equal(normalizeKenyanPhoneNumber("254712345678"), "254712345678");

  assert.equal(maskPhoneNumber("0712345678"), "2547***5678");

  assert.throws(() => {
    normalizeKenyanPhoneNumber("12345");
  }, /Invalid Kenyan phone number format/);
});

test("3. M-Pesa STK Push Initiation & Idempotency Key", async () => {
  const adapter = new MockPaymentAdapter("success");
  const res = await adapter.initiatePayment({
    userId: "usr-test-101",
    planCode: "matchday_pass",
    phoneNumber: "0712345678",
  });

  assert.equal(res.status, "pending");
  assert.equal(res.amount, 20);
  assert.equal(res.phoneNumberMasked, "2547***5678");
  assert.ok(res.internalReference.length > 5);
});

test("4. Subscription State Machine & Lifecycle Transitions", () => {
  const now = new Date().toISOString();
  const sub: SubscriptionRecord = {
    id: "SUB-101",
    userId: "usr-test-101",
    planId: "plan-weekly-edge",
    planCode: "weekly_edge",
    status: "pending",
    startsAt: now,
    expiresAt: calculateSubscriptionExpiry(168),
    createdAt: now,
    updatedAt: now,
  };

  const { updatedSubscription, event } = transitionSubscriptionStatus(sub, "active", "Payment confirmed");
  assert.equal(updatedSubscription.status, "active");
  assert.equal(event.eventType, "activated");

  const { updatedSubscription: expiredSub } = transitionSubscriptionStatus(updatedSubscription, "expired", "Period ended");
  assert.equal(expiredSub.status, "expired");

  assert.throws(() => {
    transitionSubscriptionStatus(expiredSub, "grace");
  }, /Invalid subscription status transition/);
});

test("5. Server-Side Entitlement Evaluation", async () => {
  const freeAccess = await EntitlementService.evaluateAccess(null, "edge.basic_predictions");
  assert.equal(freeAccess.allowed, true);

  const anonGoalsAccess = await EntitlementService.evaluateAccess(null, "edge.goals_markets");
  assert.equal(anonGoalsAccess.allowed, false);

  // Grant active weekly subscription to user
  const now = new Date().toISOString();
  EntitlementService.saveSubscription({
    id: "SUB-PRO-99",
    userId: "usr-paid-99",
    planId: "plan-weekly-edge",
    planCode: "weekly_edge",
    status: "active",
    startsAt: now,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: now,
    updatedAt: now,
  });

  const userGoalsAccess = await EntitlementService.evaluateAccess("usr-paid-99", "edge.goals_markets");
  assert.equal(userGoalsAccess.allowed, true);
});

test("6. Server-Side Response Shaping (Locked Field Removal)", async () => {
  const pred = generateFixturePrediction({
    fixtureId: "epl-77",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    competition: "Premier League",
    kickoffAt: new Date().toISOString(),
  });

  // Free user response shaping
  const freeShaped = await shapePredictionResponseForUser(pred, null);
  assert.equal(freeShaped.isLocked, true);
  assert.equal(freeShaped.shapedPrediction.over25Prob, undefined, "Over 2.5 goals market must be removed for free users");
  assert.equal(freeShaped.shapedPrediction.bttsYesProb, undefined, "BTTS market must be removed for free users");

  // Premium user response shaping
  const premShaped = await shapePredictionResponseForUser(pred, "usr-paid-99");
  assert.equal(premShaped.isLocked, false);
  assert.ok(premShaped.shapedPrediction.over25Prob !== undefined, "Over 2.5 goals market must be present for premium users");
});

test("7. Payment Status Reconciliation", () => {
  const rec = evaluatePaymentReconciliation({
    id: "PAY-101",
    expectedAmount: 99,
    receivedAmount: 99,
    internalStatus: "pending",
    providerStatus: "successful",
  });

  assert.ok(rec !== null);
  assert.equal(rec?.reconciliationType, "unconfirmed_callback");
  assert.equal(rec?.resolutionStatus, "resolved_auto");
});
