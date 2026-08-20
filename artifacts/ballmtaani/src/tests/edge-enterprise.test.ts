/**
 * BallMtaani Edge Phase 9 — Mobile Apps, African League Expansion & Enterprise Operations Unit Tests
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { MobileApiClient } from "../lib/edge/mobile/mobile-api-client";
import { evaluateCompetitionReadiness } from "../lib/edge/enterprise/competition-onboarding-engine";
import { TenantIsolationService } from "../lib/edge/enterprise/tenant-isolation-service";
import { OperationalHealthService } from "../lib/edge/enterprise/operational-health-service";

test("1. Typed Mobile API Client & Offline Cache Layer", async () => {
  const firstCall = await MobileApiClient.fetchPredictions("token-1", { lowDataMode: true, cacheTtlMs: 3600000 });
  assert.ok(firstCall.data.length > 0, "Mobile API client must return predictions");
  assert.equal(firstCall.lowDataMode, true, "Low-data mode flag must be respected");

  const secondCall = await MobileApiClient.fetchPredictions("token-1", { lowDataMode: true, cacheTtlMs: 3600000 });
  assert.equal(secondCall.isFromCache, true, "Subsequent prediction fetch must be served from offline cache");

  const deepLink = MobileApiClient.parseDeepLink("ballmtaani://edge/match/epl-201");
  assert.equal(deepLink.route, "match_detail");
  assert.equal(deepLink.fixtureId, "epl-201");
});

test("2. African League Competition Readiness Scoring Engine", () => {
  const readyLeague = evaluateCompetitionReadiness({
    competitionName: "South African Premier Division",
    country: "South Africa",
    seasonsAvailable: 3,
    dataQualityAvg: 92,
    walkForwardBrierScore: 0.4820,
    walkForwardLogLoss: 0.8150,
    hasLicensingApproval: true,
  });

  assert.ok(readyLeague.readinessScore >= 85, "High quality historical league must score >= 85 readiness");
  assert.equal(readyLeague.status, "supported");

  const unpreparedLeague = evaluateCompetitionReadiness({
    competitionName: "New Regional League",
    country: "Test Region",
    seasonsAvailable: 1,
    dataQualityAvg: 50,
    walkForwardBrierScore: 0.5500,
    walkForwardLogLoss: 0.9500,
    hasLicensingApproval: false,
  });

  assert.ok(unpreparedLeague.readinessScore < 55);
  assert.equal(unpreparedLeague.status, "rejected");
});

test("3. Multi-Tenant Domain Resolution & Row-Level Isolation", () => {
  const tenant = TenantIsolationService.resolveTenantByDomain("standardmedia.co.ke");
  assert.equal(tenant.tenantKey, "standard_media");
  assert.equal(tenant.branding.primaryColor, "#B30000");

  const sameTenantAccess = TenantIsolationService.validateTenantAccess("t-002", "t-002");
  assert.equal(sameTenantAccess, true, "Same tenant access must pass validation");

  const crossTenantAccess = TenantIsolationService.validateTenantAccess("t-001", "t-002");
  assert.equal(crossTenantAccess, false, "Cross tenant access must be rejected");
});

test("4. Operational Health & SLA Monitoring Engine", () => {
  const health = OperationalHealthService.getSystemHealth();
  assert.equal(health.status, "healthy");
  assert.equal(health.databaseConnected, true);
  assert.equal(health.predictionEngineReady, true);

  const targetMet = OperationalHealthService.calculateSlaTargetMet(99.94, 99.9);
  assert.equal(targetMet, true, "SLA target met must return true when 99.94% >= 99.9%");
});
