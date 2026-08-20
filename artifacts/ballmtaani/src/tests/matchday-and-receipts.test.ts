import assert from "node:assert";
import { test } from "node:test";
import { normalizeMatchStatus, isMatchActive, isMatchLocked } from "../lib/match-lifecycle";
import { generateReceiptCode, formatWhatsAppReceiptText, PredictionReceipt } from "../lib/prediction-receipts";

test("1. Normalize Upstream Match Status Codes", () => {
  assert.strictEqual(normalizeMatchStatus("1H"), "live");
  assert.strictEqual(normalizeMatchStatus("HT"), "halftime");
  assert.strictEqual(normalizeMatchStatus("FT"), "finished");
  assert.strictEqual(normalizeMatchStatus("PST"), "postponed");
  assert.strictEqual(normalizeMatchStatus("CANC"), "cancelled");
  assert.strictEqual(normalizeMatchStatus("NS"), "scheduled");
});

test("2. Match Active State & Kickoff Lock Logic", () => {
  assert.ok(isMatchActive("live"));
  assert.ok(isMatchActive("halftime"));
  assert.strictEqual(isMatchActive("finished"), false);

  const pastKickoff = new Date(Date.now() - 3600000).toISOString();
  assert.ok(isMatchLocked("scheduled", pastKickoff), "Match past kickoff time must be locked");
});

test("3. Prediction Receipt Code Format", () => {
  const code = generateReceiptCode("usr_123", "match_456");
  assert.ok(code.startsWith("BM-REC-"), "Receipt code must begin with BM-REC-");
  assert.ok(code.length >= 10, "Receipt code must be non-enumerable and adequately long");
});

test("4. WhatsApp Share Text Formatting", () => {
  const receipt: PredictionReceipt = {
    receiptCode: "BM-REC-TEST99",
    fanDisplayName: "K'OgaloFan",
    homeTeam: "Gor Mahia",
    awayTeam: "AFC Leopards",
    competition: "FKF PL",
    predictedScore: "2-0",
    submittedAtISO: new Date().toISOString(),
    kickoffTimeISO: new Date().toISOString(),
    status: "correct",
    pointsAwarded: 50,
    visibility: "public",
  };

  const text = formatWhatsAppReceiptText(receipt);
  assert.ok(text.includes("BM-REC-TEST99"));
  assert.ok(text.includes("Gor Mahia vs AFC Leopards"));
  assert.ok(text.includes("https://ballmtaani.com/receipts/BM-REC-TEST99"));
});
