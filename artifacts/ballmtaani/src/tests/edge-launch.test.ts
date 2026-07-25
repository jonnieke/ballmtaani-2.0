/**
 * BallMtaani Edge Phase 11 — Market Launch, Compliance, Attribution, Financial Ledger & Investor Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { LaunchControlService } from "../lib/edge/launch/launch-control-service";
import { ComplianceRegistryService } from "../lib/edge/compliance/compliance-registry-service";
import { AcquisitionAttributionEngine } from "../lib/edge/growth/acquisition-attribution-engine";
import { FinancialLedgerEngine } from "../lib/edge/finance/financial-ledger-engine";
import { InvestorDataRoomService } from "../lib/edge/finance/investor-data-room-service";

test("1. Commercial Launch Stage & Mandatory Gate Evaluation", () => {
  const readiness = LaunchControlService.evaluateLaunchReadiness("paid_beta");
  assert.equal(readiness.isReadyForLaunch, true, "All mandatory launch gates must pass");
  assert.equal(readiness.gates.length, 8, "Must check 8 mandatory launch gates");

  const rollback = LaunchControlService.triggerLaunchRollback("Severe payment callback latency");
  assert.equal(rollback.rollbackExecuted, true);
  assert.equal(rollback.activeStage, "internal_alpha");
});

test("2. Responsible Copy Compliance Validator & Prohibited Claims Filter", () => {
  const compliant = ComplianceRegistryService.validateMarketingCopy("Transparent statistical football intelligence for EPL matches.");
  assert.equal(compliant.isCompliant, true);

  const prohibited = ComplianceRegistryService.validateMarketingCopy("Join now for a guaranteed win and sure bet!");
  assert.equal(prohibited.isCompliant, false);
  assert.ok(prohibited.prohibitedMatchesFound.includes("guaranteed win"));
  assert.ok(prohibited.prohibitedMatchesFound.includes("sure bet"));
});

test("3. Multi-Touch Acquisition Channel Attribution Engine", () => {
  AcquisitionAttributionEngine.recordTouchpoint({ userId: "usr-test-99", channel: "organic", occurredAt: new Date().toISOString() });
  AcquisitionAttributionEngine.recordTouchpoint({ userId: "usr-test-99", channel: "telecom_bundle", campaign: "safaricom_promo", occurredAt: new Date().toISOString() });

  const attribution = AcquisitionAttributionEngine.getAttributionForUser("usr-test-99");
  assert.equal(attribution.firstTouchChannel, "organic");
  assert.equal(attribution.lastTouchChannel, "telecom_bundle");
});

test("4. Financial Ledger & Net Contribution Margin Engine", () => {
  const ledger = FinancialLedgerEngine.calculatePeriodProfitability();
  assert.ok(ledger.grossRevenueKes > 0);
  assert.ok(ledger.contributionMarginKes > 0);
  assert.ok(ledger.contributionMarginPercentage >= 70.0, "Contribution margin must be healthy (>= 70%)");
  assert.equal(ledger.totalVariableCostKes, ledger.variableCosts.dataCostKes + ledger.variableCosts.paymentFeesKes + ledger.variableCosts.messagingCostKes + ledger.variableCosts.partnerShareKes);
});

test("5. Investor Data Room & Signed Access Link Generator", () => {
  const docs = InvestorDataRoomService.getAvailableDataRoomDocuments();
  assert.ok(docs.length >= 3, "Must expose audited data room documents");

  const signed = InvestorDataRoomService.generateTemporarySignedAccessUrl(docs[0].id, "investor@test.com");
  assert.ok(signed.signedUrl.includes("token=signed_investor_key_101"));
  assert.ok(new Date(signed.expiresAt).getTime() > Date.now());
});
