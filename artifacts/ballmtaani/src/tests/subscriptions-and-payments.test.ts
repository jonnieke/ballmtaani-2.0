import assert from "node:assert";
import { test } from "node:test";
import { hasFeatureAccess, getAiQuotaLimit } from "../lib/entitlements";
import { initiatePayment, verifyServerCallback } from "../lib/payment-engine";

test("1. Product Tier Feature Access Evaluation", () => {
  assert.strictEqual(hasFeatureAccess("free", "live_scores"), true);
  assert.strictEqual(hasFeatureAccess("free", "advanced_analysis"), false);
  assert.strictEqual(hasFeatureAccess("ballmtaani_plus", "advanced_analysis"), true);
  assert.strictEqual(hasFeatureAccess("ballmtaani_pro", "creator_analytics"), true);
});

test("2. AI Question Quota Evaluation", () => {
  assert.strictEqual(getAiQuotaLimit("free"), 10);
  assert.strictEqual(getAiQuotaLimit("ballmtaani_plus"), 50);
  assert.strictEqual(getAiQuotaLimit("ballmtaani_pro"), -1);
});

test("3. Payment Initiation & Idempotency Key Generation", () => {
  const result = initiatePayment({
    userId: "usr_100",
    planId: "ballmtaani_plus",
    amount: 299,
    currency: "KES",
    provider: "mpesa",
  });

  assert.ok(result.transactionId.startsWith("TX-"));
  assert.ok(result.idempotencyKey.startsWith("IDEM-"));
  assert.strictEqual(result.status, "pending");
});

test("4. Server Callback Verification", () => {
  assert.strictEqual(verifyServerCallback("IDEM-123", "sig_valid_999"), true);
  assert.strictEqual(verifyServerCallback("", ""), false);
});
