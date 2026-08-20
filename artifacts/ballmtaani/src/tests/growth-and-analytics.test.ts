import assert from "node:assert";
import { test } from "node:test";
import { trackEvent, sanitizePayload } from "../lib/analytics-events";
import { generateReferralCode, getReferralShareUrl } from "../lib/referrals";

test("1. Analytics Event Tracking & PII Sanitization", () => {
  const payload = {
    clubId: "arsenal",
    email: "user@example.com", // PII to be stripped
    phone: "+254700000000",   // PII to be stripped
  };

  const clean = sanitizePayload(payload);
  assert.strictEqual(clean.clubId, "arsenal");
  assert.strictEqual(clean.email, undefined, "Email PII must be stripped");
  assert.strictEqual(clean.phone, undefined, "Phone PII must be stripped");

  const tracked = trackEvent("club_selected", { clubId: "arsenal" });
  assert.strictEqual(tracked.event, "club_selected");
  assert.ok(tracked.timestamp);
});

test("2. Referral Code & Share Link Building", () => {
  const refCode = generateReferralCode("usr_555");
  assert.ok(refCode.startsWith("BM-REF-"));

  const shareUrl = getReferralShareUrl(refCode);
  assert.ok(shareUrl.includes("ref=BM-REF-"));
});
