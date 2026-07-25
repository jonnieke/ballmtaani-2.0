/**
 * BallMtaani Edge Phase 13 — Scaled Growth, Self-Service Partners,
 * Regional Expansion and Portfolio Optimization Test Suite
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import { ScaleProgrammeService } from "../lib/edge/growth/scale-programme-service";
import { PartnerApplicationService } from "../lib/edge/partnerships/partner-application-service";
import { TenantProvisioningService } from "../lib/edge/enterprise/tenant-provisioning-service";
import { SelfServiceApiService } from "../lib/edge/partnerships/self-service-api-service";
import { B2bBillingService } from "../lib/edge/billing/b2b-billing-service";
import { CustomerSuccessService } from "../lib/edge/commercial/customer-success-service";
import { RegionalMarketService } from "../lib/edge/expansion/regional-market-service";
import { PortfolioOptimizationService } from "../lib/edge/commercial/portfolio-optimization-service";
import { RevenueRetentionService } from "../lib/edge/finance/revenue-retention-service";
import { CapitalAllocationService } from "../lib/edge/finance/capital-allocation-service";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCALE PROGRAMME STAGE GATES & CEILING ENFORCEMENT
// ─────────────────────────────────────────────────────────────────────────────
test("1. Scale Programme Stage Gate Enforcement — All Gates Pass", () => {
  const reqs = ScaleProgrammeService.getStageRequirements("pilot");
  assert.equal(reqs.stage, "pilot");
  assert.equal(reqs.maxUsers, 500);
  assert.equal(reqs.requiresComplianceSign, true);
  assert.equal(reqs.requiresExecutiveSign, false);

  const programme = { id:"p1", key:"ke_consumer", name:"KE Consumer", scaleType:"consumer" as const, targetScope:"kenya", currentStage:"pilot" as const, proposedStage:null, status:"active" as const, owner:"CEO", userLimit:500, partnerLimit:5, successCriteria:[], stopConditions:[], rollbackPlan:"Pause and revert" };
  const result = ScaleProgrammeService.evaluateScaleReadiness(programme, {
    currentUsers: 420, currentPartners: 4, modelAccuracy: 0.56, contributionPct: 50,
    complianceSigned: true, executiveSigned: false, paymentSuccessRate: 0.95, supportBacklogDays: 1, refundRatePct: 2,
  });
  assert.equal(result.canAdvance, true);
  assert.equal(result.gatesFailed.length, 0);
});

test("1b. Scale Programme Stage Gate — Ceiling Exceeded Blocks Advance", () => {
  const programme = { id:"p2", key:"ke_consumer_2", name:"KE Consumer 2", scaleType:"consumer" as const, targetScope:"kenya", currentStage:"pilot" as const, proposedStage:null, status:"active" as const, owner:"CEO", userLimit:500, partnerLimit:5, successCriteria:[], stopConditions:[], rollbackPlan:"Pause" };
  const result = ScaleProgrammeService.evaluateScaleReadiness(programme, {
    currentUsers: 800, // exceeds 500 ceiling
    currentPartners: 3, modelAccuracy: 0.56, contributionPct: 50,
    complianceSigned: true, executiveSigned: false, paymentSuccessRate: 0.95, supportBacklogDays: 1, refundRatePct: 2,
  });
  assert.equal(result.canAdvance, false);
  assert.ok(result.blockers.some(b => b.includes("exceed")));
});

test("1c. Stage Advance — Cannot Skip Stages", () => {
  const programme = { id:"p3", key:"ke_pub", name:"KE Publisher", scaleType:"publisher" as const, targetScope:"KE", currentStage:"pilot" as const, proposedStage:null, status:"proposed" as const, owner:"CEO", userLimit:null, partnerLimit:null, successCriteria:[], stopConditions:[], rollbackPlan:"Pause" };
  const res = ScaleProgrammeService.proposeStageAdvance(programme, "limited_scale", "CEO");
  assert.equal(res.valid, false);
  assert.ok(res.error?.includes("Cannot skip"));
});

test("1d. Channel Scaling Decision — All Criteria Pass → Scale", () => {
  const decision = ScaleProgrammeService.evaluateChannelScaling("Creator Partnerships", {
    attributionConfidence: 0.88, cpaPaidKes: 180, cpaBenchmarkKes: 200, contributionPct: 55,
    refundRatePct: 1.5, retentionVsBaselineDelta: 2, fraudCasesPerMille: 0.5,
    supportTicketsPerMille: 15, complianceIssues: 0,
  });
  assert.equal(decision.decision, "Scale");
});

test("1e. Channel Scaling Decision — Compliance Issue → Restrict", () => {
  const decision = ScaleProgrammeService.evaluateChannelScaling("Paid Social", {
    attributionConfidence: 0.85, cpaPaidKes: 190, cpaBenchmarkKes: 200, contributionPct: 50,
    refundRatePct: 2, retentionVsBaselineDelta: 1, fraudCasesPerMille: 1,
    supportTicketsPerMille: 20, complianceIssues: 2, // fail
  });
  assert.ok(["Restrict","Pause","Stop"].includes(decision.decision));
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PARTNER APPLICATION RISK SCORING & WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────
test("2. Partner Risk Score — Low Risk Creator → Auto Approve", () => {
  const result = PartnerApplicationService.scoreRisk({
    partnerType: "creator", market: "KE", requestedScopes: ["referral","public_predictions"],
    expectedMonthlyRequests: 100, websiteProvided: true, paymentVerified: true,
    priorAccountHistory: "clean", intendedUseCategories: ["fan engagement"], fraudSignals: 0, complianceRisk: "low",
  });
  assert.ok(result.score <= 20);
  assert.equal(result.outcome, "auto_approve");
});

test("2b. Partner Risk Score — Prohibited Use Claim → Reject", () => {
  const result = PartnerApplicationService.scoreRisk({
    partnerType: "publisher", market: "KE", requestedScopes: ["public_predictions"],
    expectedMonthlyRequests: 500, websiteProvided: true, paymentVerified: true,
    priorAccountHistory: "none", intendedUseCategories: ["sure bet service", "guaranteed wins platform"],
    fraudSignals: 0, complianceRisk: "low",
  });
  assert.equal(result.outcome, "reject");
  assert.ok(result.score === 100);
  assert.ok(result.warnings.some(w => w.includes("prohibited_use")));
});

test("2c. Verification Level Requirements — Publisher Needs Domain Verification", () => {
  const check = PartnerApplicationService.checkVerificationRequirements("publisher", ["email_verified"]);
  assert.equal(check.satisfied, false);
  assert.ok(check.missing.includes("domain_verified"));
  assert.ok(check.missing.includes("organization_verified"));
});

test("2d. Premium Scope → Manual Approval Required", () => {
  assert.equal(PartnerApplicationService.requiresManualApprovalForScopes(["raw_model_probabilities"]), true);
  assert.equal(PartnerApplicationService.requiresManualApprovalForScopes(["public_predictions"]), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. TENANT AUTO-PROVISIONING (IDEMPOTENCY & RESUME)
// ─────────────────────────────────────────────────────────────────────────────
test("3. Tenant Provisioning — Successful Full Run", () => {
  const plan = { applicationId:"app-001", partnerType:"publisher", organizationName:"The Score KE", ownerUserId:"usr-001", planKey:"publisher", allowedScopes:["public_predictions","widget_embed"], usageLimits:{ api_requests_monthly: 10000 }, featureFlags:{}, isTrial:false, trialDurationDays:null, market:"KE" };
  const result = TenantProvisioningService.executeProvisioning(plan);
  assert.equal(result.status, "completed");
  assert.equal(result.failedStep, null);
  assert.equal(result.completedSteps.length, 10);
});

test("3b. Provisioning — Invalid Plan Key → Failed at apply_plan Step", () => {
  const plan = { applicationId:"app-002", partnerType:"developer", organizationName:"BadCo", ownerUserId:"usr-002", planKey:"nonexistent_plan", allowedScopes:["sandbox_api"], usageLimits:{}, featureFlags:{}, isTrial:false, trialDurationDays:null, market:"KE" };
  const result = TenantProvisioningService.executeProvisioning(plan);
  assert.equal(result.status, "failed");
  assert.equal(result.failedStep, "apply_plan");
});

test("3c. Provisioning Idempotency — Skips Already-Completed Steps", () => {
  const existingProgress = TenantProvisioningService.initProvisioningProgress("app-003");
  existingProgress.steps["create_tenant"] = "completed";
  existingProgress.steps["assign_owner"] = "completed";
  existingProgress.tenantId = "tnt_app003xx";

  const plan = { applicationId:"app-003", partnerType:"publisher", organizationName:"MediaCo", ownerUserId:"usr-003", planKey:"publisher", allowedScopes:["public_predictions"], usageLimits:{}, featureFlags:{}, isTrial:false, trialDurationDays:null, market:"KE" };
  const result = TenantProvisioningService.executeProvisioning(plan, existingProgress);
  assert.equal(result.status, "completed");
  // Should have re-used the existing tenantId prefix
  assert.ok(result.tenantId.startsWith("tnt_"));
});

test("3d. Trial Provisioning — Zero Duration → Fails", () => {
  const plan = { applicationId:"app-004", partnerType:"publisher", organizationName:"TrialCo", ownerUserId:"usr-004", planKey:"publisher", allowedScopes:["public_predictions"], usageLimits:{}, featureFlags:{}, isTrial:true, trialDurationDays:0, market:"KE" };
  const result = TenantProvisioningService.executeProvisioning(plan);
  assert.equal(result.status, "failed");
  assert.equal(result.failedStep, "set_trial_expiry");
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SELF-SERVICE API KEYS — HASHING, SCOPE ENFORCEMENT
// ─────────────────────────────────────────────────────────────────────────────
test("4. API Key Generation — Key is Never Stored in Plaintext", () => {
  const result = SelfServiceApiService.createApiClient({
    tenantId: "tnt-001", name: "Production Client", requestedScopes: ["public_predictions","widget_embed"],
    planKey: "publisher",
  });
  assert.ok(!("error" in result));
  if (!("error" in result)) {
    // Plaintext key is returned once
    assert.ok(result.plaintextKey.startsWith("bme_live_"));
    assert.ok(result.plaintextKey.length > 20);
    // Only hash is stored — never the plaintext
    assert.equal(result.client.keyHash.length, 64); // SHA-256 hex = 64 chars
    assert.ok(!result.client.keyHash.includes("bme_")); // hash must not contain the raw key prefix
  }
});

test("4b. API Key Verification — Correct Key Passes, Wrong Key Fails", () => {
  const result = SelfServiceApiService.createApiClient({ tenantId:"tnt-002", name:"Test Client", requestedScopes:["public_predictions"], planKey:"publisher" });
  assert.ok(!("error" in result));
  if (!("error" in result)) {
    assert.equal(SelfServiceApiService.verifyApiKey(result.plaintextKey, result.client.keyHash), true);
    assert.equal(SelfServiceApiService.verifyApiKey("wrong_key_1234567890", result.client.keyHash), false);
  }
});

test("4c. Scope Enforcement — Out-of-Plan Scope Rejected", () => {
  const result = SelfServiceApiService.createApiClient({
    tenantId: "tnt-003", name: "Overreach Client",
    requestedScopes: ["lineup_revisions" as any], // not in publisher plan
    planKey: "publisher",
  });
  assert.ok("error" in result);
  assert.ok((result as any).error.includes("not permitted"));
});

test("4d. Premium Scope Self-Service Blocked", () => {
  const result = SelfServiceApiService.createApiClient({
    tenantId: "tnt-004", name: "Premium Attempt",
    requestedScopes: ["raw_model_probabilities" as any],
    planKey: "pro_publisher",
  });
  assert.ok("error" in result);
  assert.ok((result as any).error.includes("manual approval"));
});

test("4e. Widget Attribution Cannot Be Disabled", () => {
  const result = SelfServiceApiService.createWidget({
    tenantId: "tnt-005", name: "Test Widget", widgetType: "match_prediction",
    allowedDomain: "thescore.ke", theme: "dark", language: "sw",
  });
  assert.ok(!("error" in result));
  if (!("error" in result)) {
    assert.equal((result as any).attributionVisible, true);
  }
});

test("4f. Widget — Localhost Domain Rejected", () => {
  const result = SelfServiceApiService.createWidget({
    tenantId: "tnt-006", name: "Dev Widget", widgetType: "match_prediction",
    allowedDomain: "localhost:3000",
  });
  assert.ok("error" in result);
});

test("4g. Widget Embed Code Contains Attribution and Disclaimer", () => {
  const widgetResult = SelfServiceApiService.createWidget({
    tenantId: "tnt-007", name: "Live Widget", widgetType: "upcoming_fixture",
    allowedDomain: "media.ke",
  });
  assert.ok(!("error" in widgetResult));
  if (!("error" in widgetResult)) {
    const config = SelfServiceApiService.generateEmbedCode(widgetResult as any);
    assert.ok(config.attributionLine.includes("BallMtaani"));
    assert.ok(config.disclaimer.length > 0);
    assert.ok(!config.disclaimer.toLowerCase().includes("guaranteed"));
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. B2B BILLING — USAGE LEDGER, INVOICING, DISPUTES
// ─────────────────────────────────────────────────────────────────────────────
test("5. Usage Event — Valid Record Accepted", () => {
  const evt = B2bBillingService.recordUsageEvent({
    tenantId:"tnt-001", subscriptionId:"sub-001", usageType:"api_request",
    quantity:500, eventKey:"ke-score-api-2026-07-24-001",
    occurredAt:new Date().toISOString(), billingPeriod:"2026-07", apiClientId:undefined, pricing_version_id:undefined, source_reference:undefined,
  } as any);
  assert.ok(!("error" in evt));
  assert.equal((evt as any).status, "recorded");
});

test("5b. Usage Event — Missing Event Key Rejected", () => {
  const evt = B2bBillingService.recordUsageEvent({
    tenantId:"tnt-001", subscriptionId:"sub-001", usageType:"api_request",
    quantity:100, eventKey:"", occurredAt:new Date().toISOString(), billingPeriod:"2026-07",
  } as any);
  assert.ok("error" in evt);
});

test("5c. Usage Event — Invalid Period Rejected", () => {
  const evt = B2bBillingService.recordUsageEvent({
    tenantId:"tnt-001", subscriptionId:"sub-001", usageType:"api_request",
    quantity:100, eventKey:"valid-key-001", occurredAt:new Date().toISOString(), billingPeriod:"July2026",
  } as any);
  assert.ok("error" in evt);
});

test("5d. Usage Aggregation — Deduplicates Repeated Event Keys", () => {
  const events = [
    { id:"e1", tenantId:"t1", subscriptionId:"s1", usageType:"api_request" as const, quantity:500, eventKey:"key-001", occurredAt:"", billingPeriod:"2026-07", status:"recorded" as const },
    { id:"e2", tenantId:"t1", subscriptionId:"s1", usageType:"api_request" as const, quantity:500, eventKey:"key-001", occurredAt:"", billingPeriod:"2026-07", status:"recorded" as const }, // duplicate
    { id:"e3", tenantId:"t1", subscriptionId:"s1", usageType:"widget_view" as const, quantity:1000, eventKey:"key-002", occurredAt:"", billingPeriod:"2026-07", status:"recorded" as const },
  ];
  const summary = B2bBillingService.aggregatePeriodUsage(events);
  assert.equal(summary.deduplicatedEvents, 1);
  assert.equal(summary.byType["api_request"], 500); // not 1000
  assert.equal(summary.byType["widget_view"], 1000);
});

test("5e. Invoice Generation — Correct Totals and Sanity Checks", () => {
  const invoice = B2bBillingService.generateDraftInvoice({
    tenantId:"tnt-001", subscriptionId:"sub-001", billingPeriod:"2026-07",
    planKey:"publisher", baseMonthlyMinor:500_00, currency:"KES",
    includedApiRequests:10_000, includedWidgetViews:500_000,
    overageApiPricePerThousandMinor:50_00, overageWidgetPricePer10kMinor:20_00,
    actualApiRequests:12_500, actualWidgetViews:480_000, // 2500 overage on API, no widget overage
    taxRatePct:16, pricingVersion:"v2026-07",
  });
  assert.equal(invoice.currency, "KES");
  assert.ok(invoice.totalMinor > invoice.subtotalMinor); // tax added
  assert.equal(invoice.sanityChecks.find(c => c.label === "currency_consistent")?.passed, true);
  assert.equal(invoice.lineItems.some(l => l.lineType === "api_overage"), true);
  assert.equal(invoice.lineItems.some(l => l.lineType === "widget_view_overage"), false); // no widget overage
  // All line items must use the same currency
  const currencies = new Set(invoice.lineItems.map(l => l.currency));
  assert.equal(currencies.size, 1);
  assert.ok(currencies.has("KES"));
});

test("5f. Invoice — Negative Quantity Triggers Warning", () => {
  const invoice = B2bBillingService.generateDraftInvoice({
    tenantId:"tnt-002", subscriptionId:"sub-002", billingPeriod:"2026-07",
    planKey:"developer", baseMonthlyMinor:250_00, currency:"KES",
    includedApiRequests:5000, includedWidgetViews:0,
    overageApiPricePerThousandMinor:30_00, overageWidgetPricePer10kMinor:0,
    actualApiRequests:-100, actualWidgetViews:0, // invalid
    taxRatePct:0, pricingVersion:"v2026-07",
  });
  assert.ok(invoice.warnings.some(w => w.includes("Negative API")));
});

test("5g. Billing Dispute — Opens Without Modifying Ledger", () => {
  const dispute = B2bBillingService.openDispute({ invoiceId:"inv-001", tenantId:"tnt-001", reason:"API requests are double-counted", openedBy:"admin@thescore.ke" });
  assert.equal(dispute.status, "open");
  assert.equal(dispute.invoiceId, "inv-001");
});

test("5h. Usage Adjustment — Requires Approver", () => {
  assert.throws(() => {
    B2bBillingService.createUsageAdjustment({ originalEventId:"evt-001", adjustmentType:"credit", quantityDelta:-200, reason:"Double count", approvedBy:"" });
  }, /Approver is required/);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. CUSTOMER SUCCESS HEALTH SCORING & RENEWAL FORECASTING
// ─────────────────────────────────────────────────────────────────────────────
test("6. Customer Success — Healthy Account Scores 75+", () => {
  const { score, label } = CustomerSuccessService.calculateHealthScore({
    apiUsagePct:75, widgetUsagePct:60, activeSeats:8, totalSeats:10,
    featuresAdopted:6, totalFeatures:8, openSupportIssues:1, criticalSupportIssues:0,
    billingStatus:"current", daysToRenewal:180, errorRatePct:0.5, slaBreaches:0, lastEngagementDays:5,
  });
  assert.ok(score >= 75);
  assert.equal(label, "Healthy");
});

test("6b. Customer Success — Critical Account (billing disputed + overdue renewal)", () => {
  const { label } = CustomerSuccessService.calculateHealthScore({
    apiUsagePct:5, widgetUsagePct:10, activeSeats:1, totalSeats:10,
    featuresAdopted:1, totalFeatures:8, openSupportIssues:10, criticalSupportIssues:3,
    billingStatus:"disputed", daysToRenewal:15, errorRatePct:12, slaBreaches:5, lastEngagementDays:90,
  });
  assert.equal(label, "Critical");
});

test("6c. Renewal Forecast — Healthy Account → Likely", () => {
  const account = { id:"cs-001", tenantId:"tnt-001", segment:"publisher" as const, lifecycleStage:"healthy" as const, healthScore:80, healthLabel:"Healthy" as const, renewalDate:"2027-01-01", contractValueMinor:1_200_000_00, contractCurrency:"KES", riskStatus:"none" as const, nextReviewAt:null };
  const input = { apiUsagePct:75, widgetUsagePct:60, activeSeats:8, totalSeats:10, featuresAdopted:6, totalFeatures:8, openSupportIssues:1, criticalSupportIssues:0, billingStatus:"current" as const, daysToRenewal:180, errorRatePct:0.5, slaBreaches:0, lastEngagementDays:5 };
  const forecast = CustomerSuccessService.forecastRenewal(account, input);
  assert.equal(forecast.forecast, "Likely");
});

test("6d. Expansion Opportunities — High API Usage Surfaces Upgrade Opportunity", () => {
  const account = { id:"cs-002", tenantId:"tnt-002", segment:"api_customer" as const, lifecycleStage:"healthy" as const, healthScore:82, healthLabel:"Healthy" as const, renewalDate:null, contractValueMinor:500_000_00, contractCurrency:"KES", riskStatus:"none" as const, nextReviewAt:null };
  const input = { apiUsagePct:90, widgetUsagePct:30, activeSeats:5, totalSeats:10, featuresAdopted:4, totalFeatures:8, openSupportIssues:0, criticalSupportIssues:0, billingStatus:"current" as const, daysToRenewal:null, errorRatePct:0.3, slaBreaches:0, lastEngagementDays:2 };
  const opps = CustomerSuccessService.identifyExpansionOpportunities(account, input);
  assert.ok(opps.some(o => o.opportunityType === "api_upgrade"));
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. REGIONAL MARKET SERVICE — LIFECYCLE, PRICING, LEGAL DOCS
// ─────────────────────────────────────────────────────────────────────────────
test("7. Market Readiness — Weighted Score Calculation", () => {
  const score = RegionalMarketService.calculateOverallScore({
    audienceScore:80, competitionScore:75, modelScore:70, paymentScore:82,
    complianceScore:85, dataProtectionScore:78, localizationScore:65,
    supportScore:70, partnerScore:60, costScore:72, revenueScore:68,
  });
  assert.ok(score >= 60 && score <= 100);
});

test("7b. Market Stage Gate — Cannot Skip Stages", () => {
  const assessment = { id:"ma-001", countryCode:"TZ", marketName:"Tanzania", status:"market_research" as const, audienceScore:80, competitionScore:75, modelScore:70, paymentScore:82, complianceScore:85, dataProtectionScore:78, localizationScore:65, supportScore:70, partnerScore:60, costScore:72, revenueScore:68, overallScore:74, owner:"CEO", reviewedAt:null, decision:null };
  const { canAdvance, blockers } = RegionalMarketService.evaluateStageReadiness(assessment, "commercial_pilot");
  assert.equal(canAdvance, false);
  assert.ok(blockers.some(b => b.includes("Cannot skip")));
});

test("7c. Market Stage Gate — Score Below Threshold Blocks Launch", () => {
  const assessment = { id:"ma-002", countryCode:"NG", marketName:"Nigeria", status:"closed_beta" as const, audienceScore:50, competitionScore:55, modelScore:50, paymentScore:55, complianceScore:60, dataProtectionScore:50, localizationScore:45, supportScore:50, partnerScore:45, costScore:55, revenueScore:50, overallScore:52, owner:"CEO", reviewedAt:null, decision:null };
  const { canAdvance, blockers } = RegionalMarketService.evaluateStageReadiness(assessment, "limited_launch");
  assert.equal(canAdvance, false);
  assert.ok(blockers.some(b => b.includes("below required")));
});

test("7d. Multi-Currency — Minor Units Must Be Integers", () => {
  const valid = RegionalMarketService.validateMarketPrice({ planKey:"publisher", priceMinor:500_00, currencyCode:"TZS", pricingVersion:"v2026-07", billingCycle:"monthly" });
  assert.equal(valid.valid, true);

  const invalid = RegionalMarketService.validateMarketPrice({ planKey:"publisher", priceMinor:500.50, currencyCode:"TZS", pricingVersion:"v2026-07" }); // float
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some(e => e.includes("integer")));
});

test("7e. Currency Formatting — UGX Has Zero Decimal Places", () => {
  const formatted = RegionalMarketService.formatMinorAmount(5000, "UGX");
  assert.ok(!formatted.includes("."));
});

test("7f. Legal Document Must Be Active Before Market Launch", () => {
  const approvedDoc = { countryCode:"TZ", languageCode:"sw", docType:"terms", version:"v1.0", effectiveDate:"2026-07-01", approvalStatus:"active" as const, approvedBy:"Legal Team", contentUrl:"/docs/tz-terms-v1.pdf" };
  assert.equal(RegionalMarketService.isLegalDocumentReady(approvedDoc), true);

  const draftDoc = { ...approvedDoc, approvalStatus:"draft" as const, approvedBy:null };
  assert.equal(RegionalMarketService.isLegalDocumentReady(draftDoc as any), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. PORTFOLIO OPTIMIZATION — COMPETITION & PARTNER SCORING
// ─────────────────────────────────────────────────────────────────────────────
test("8. Competition Portfolio Score — High-Scoring Competition Classified as Core", () => {
  const score = PortfolioOptimizationService.scoreCompetition({
    competitionKey:"epl", name:"English Premier League",
    modelPerformance:80, dataQuality:85, providerReliability:90, userDemand:95,
    subscriberConversion:78, retentionImpact:82, revenueMinor:500_000_00,
    directCostMinor:80_000_00, strategicValue:90, complianceRisk:10, supportBurden:20,
  });
  assert.equal(score.classification, "core");
  assert.ok(score.overallScore >= 75);
});

test("8b. Competition Portfolio — Negative Contribution → Paused Classification", () => {
  const score = PortfolioOptimizationService.scoreCompetition({
    competitionKey:"low-comp", name:"Test League",
    modelPerformance:40, dataQuality:35, providerReliability:40, userDemand:30,
    subscriberConversion:20, retentionImpact:25, revenueMinor:20_000_00,
    directCostMinor:50_000_00, // loss-making
    strategicValue:20, complianceRisk:15, supportBurden:40,
  });
  assert.ok(["paused", "experimental"].includes(score.classification));
});

test("8c. Portfolio Recommendation — High Growth + Good Margin → Invest", () => {
  const { recommendation } = PortfolioOptimizationService.recommendPortfolioStatus({
    revenueMinor: 1_000_000_00, variableCostMinor: 300_000_00, // 70% margin
    contributionMinor: 700_000_00, growthRatePct: 45, strategicValue: 85,
    operationalComplexity: 40, complianceRisk: 10, supportBurden: 20,
  });
  assert.equal(recommendation, "invest");
});

test("8d. Partner Classification — Compliance Issue → Compliance Concern", () => {
  const classification = PortfolioOptimizationService.classifyPartner({
    contributionMinor: 500_000, contractValueMinor: 2_000_000, apiUsagePct: 60,
    supportTicketsMonthly: 5, complianceIssues: 2, renewalLikelihood: "Likely", strategic: false,
  });
  assert.equal(classification, "Compliance concern");
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. REVENUE RETENTION — GRR, NRR, CONSUMER RENEWAL
// ─────────────────────────────────────────────────────────────────────────────
test("9. Consumer Revenue Retention — Correct Renewal Rate", () => {
  const report = RevenueRetentionService.calculateConsumerRetention({
    period:"2026-07", startingPaidUsers:4000, renewedUsers:3360, expiredUsers:640, reactivatedUsers:120,
    upgrades:80, downgrades:30, repeatPassPurchases:1200,
    avgMonthlyRevenuePerUserMinor:299_00, avgPassRevenueMinor:99_00, currency:"KES",
  });
  assert.equal(report.renewalRatePct, 84.0);
  assert.ok(report.revenueRetentionPct > 0);
  assert.ok(report.lostRevenueMinor > 0);
});

test("9b. B2B GRR Cannot Exceed 100%", () => {
  const report = RevenueRetentionService.calculateB2bRetention({
    period:"2026-07", startingRecurringValueMinor:360_000_00,
    renewedValueMinor:360_000_00, expansionValueMinor:50_000_00,
    contractionValueMinor:0, churnedValueMinor:0,
    startingApiRequests:100_000, endingApiRequests:115_000,
    startingSeats:20, endingSeats:22, currency:"KES",
  });
  assert.ok(report.grossRevenueRetentionPct <= 100);
  assert.ok(report.netRevenueRetentionPct > 100); // NRR can exceed 100 with expansion
});

test("9c. NRR > GRR When There is Expansion", () => {
  const report = RevenueRetentionService.calculateB2bRetention({
    period:"2026-07", startingRecurringValueMinor:500_000_00,
    renewedValueMinor:450_000_00, expansionValueMinor:80_000_00,
    contractionValueMinor:20_000_00, churnedValueMinor:30_000_00,
    startingApiRequests:50_000, endingApiRequests:60_000,
    startingSeats:10, endingSeats:12, currency:"KES",
  });
  assert.ok(report.netRevenueRetentionPct > report.grossRevenueRetentionPct);
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. CAPITAL ALLOCATION — INVESTMENT SCORING & CAPACITY
// ─────────────────────────────────────────────────────────────────────────────
test("10. Investment Proposal — High Strategic + Low Risk → Approve", () => {
  const proposal = { id:"ip-001", title:"ML Ensemble v3", investmentType:"model" as const, description:"Upgrade ensemble", requestedAmountMinor:800_000_00, currency:"KES", expectedRevenueMinor:2_500_000_00, expectedCostSavingsMinor:200_000_00, expectedContributionMinor:1_900_000_00, strategicValue:90, riskLevel:25, reversibility:70, timeToValueMonths:6, paybackPeriodMonths:8, status:"review" as const, owner:"CTO" };
  const score = CapitalAllocationService.scoreInvestment(proposal);
  assert.equal(score.recommendation, "approve");
  assert.equal(score.paybackRating, "good");
});

test("10b. Investment Proposal — Very High Risk → Reject", () => {
  const proposal = { id:"ip-002", title:"Risky Bet", investmentType:"marketing" as const, description:"Speculative", requestedAmountMinor:5_000_000_00, currency:"KES", expectedRevenueMinor:500_000_00, expectedCostSavingsMinor:0, expectedContributionMinor:-500_000_00, strategicValue:20, riskLevel:95, reversibility:5, timeToValueMonths:24, paybackPeriodMonths:null, status:"review" as const, owner:"CMO" };
  const score = CapitalAllocationService.scoreInvestment(proposal);
  assert.equal(score.recommendation, "reject");
});

test("10c. Capacity Utilisation — 95%+ Utilisation → Critical Risk", () => {
  const snapshot = CapitalAllocationService.calculateCapacityUtilization({ period:"2026-07", functionName:"model_operations", availableCapacity:100, committedCapacity:97, backlog:"2 drift alerts pending", riskLevel:"low" as const, owner:"CTO" });
  assert.equal(snapshot.riskLevel, "critical");
  assert.ok(snapshot.utilization >= 95);
});

test("10d. Hiring Trigger — Multiple Signals → hire_now Urgency", () => {
  const evaluation = CapitalAllocationService.evaluateHiringTriggers({
    functionName:"customer_support", supportBacklogDays:5, openPartnerIntegrations:5,
    complianceWorkloadPct:90, mobileCrashReportsWeekly:80, currentUtilizationPct:95,
  });
  assert.equal(evaluation.triggered, true);
  assert.ok(["hire_soon","hire_now"].includes(evaluation.urgency));
  assert.ok(evaluation.recommendedHeadcount >= 1);
});
