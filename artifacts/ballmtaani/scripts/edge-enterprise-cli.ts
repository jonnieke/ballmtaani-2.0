/**
 * BallMtaani Edge CLI — Mobile, African League Expansion & Enterprise Operations
 * Usage: npx tsx scripts/edge-enterprise-cli.ts [mobile|onboarding|tenant|health]
 */

import { MobileApiClient } from "../src/lib/edge/mobile/mobile-api-client";
import { evaluateCompetitionReadiness } from "../src/lib/edge/enterprise/competition-onboarding-engine";
import { TenantIsolationService } from "../src/lib/edge/enterprise/tenant-isolation-service";
import { OperationalHealthService } from "../src/lib/edge/enterprise/operational-health-service";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "mobile";

  console.log("\n=======================================================");
  console.log("  BALLMTAANI EDGE — ENTERPRISE & OPERATIONS CLI");
  console.log("=======================================================\n");

  if (command === "mobile") {
    const res = await MobileApiClient.fetchPredictions("token-101", { lowDataMode: true, cacheTtlMs: 3600000 });
    console.log("Typed Mobile API Client Prediction Fetch:");
    console.log(` - Predictions Returned: ${res.data.length}`);
    console.log(` - Is From Offline Cache: ${res.isFromCache}`);
    console.log(` - Freshness Label: ${res.freshnessLabel}`);
    console.log(` - Low-Data Mode Active: ${res.lowDataMode}`);

    const deepLink = MobileApiClient.parseDeepLink("ballmtaani://edge/match/epl-201");
    console.log(`\n Deep Link Route Evaluation: Route = ${deepLink.route}, Fixture = ${deepLink.fixtureId}`);
    return;
  }

  if (command === "onboarding") {
    const pslRes = evaluateCompetitionReadiness({
      competitionName: "South African Premier Division",
      country: "South Africa",
      seasonsAvailable: 3,
      dataQualityAvg: 92,
      walkForwardBrierScore: 0.4820,
      walkForwardLogLoss: 0.8150,
      hasLicensingApproval: true,
    });

    console.log("African League Competition Readiness Evaluation:");
    console.log(` - League: ${pslRes.competitionName}`);
    console.log(` - Readiness Score: ${pslRes.readinessScore} / 100`);
    console.log(` - Decision Status: ${pslRes.status.toUpperCase()}`);
    console.log(` - Recommendation: ${pslRes.recommendation}`);
    return;
  }

  if (command === "tenant") {
    const tenant = TenantIsolationService.resolveTenantByDomain("standardmedia.co.ke");
    console.log("Multi-Tenant Context Resolution:");
    console.log(` - Tenant Name: ${tenant.name}`);
    console.log(` - Primary Domain: ${tenant.primaryDomain}`);
    console.log(` - Primary Color Token: ${tenant.branding.primaryColor}`);
    console.log(` - Allowed Competitions: ${tenant.allowedCompetitions.join(", ")}`);
    return;
  }

  if (command === "health") {
    const health = OperationalHealthService.getSystemHealth();
    console.log("Operational Health Status Check:");
    console.log(` - Overall Status: ${health.status.toUpperCase()}`);
    console.log(` - Active Model: ${health.activeModelVersion}`);
    console.log(` - SLA Availability (MTD): ${health.slaAvailabilityPercentage}% (Target: 99.9%)`);
    return;
  }

  console.log(`Unknown command '${command}'. Use: mobile, onboarding, tenant, health.`);
}

main().catch((err) => {
  console.error("CLI Error:", err);
  process.exit(1);
});
