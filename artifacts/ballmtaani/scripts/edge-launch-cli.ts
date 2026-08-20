/**
 * BallMtaani Edge CLI — Launch Readiness, Compliance, Attribution & Investor Metrics
 * Usage: npx tsx scripts/edge-launch-cli.ts [launch|compliance|attribution|financial|dataroom]
 */

import { LaunchControlService } from "../src/lib/edge/launch/launch-control-service";
import { ComplianceRegistryService } from "../src/lib/edge/compliance/compliance-registry-service";
import { AcquisitionAttributionEngine } from "../src/lib/edge/growth/acquisition-attribution-engine";
import { FinancialLedgerEngine } from "../src/lib/edge/finance/financial-ledger-engine";
import { InvestorDataRoomService } from "../src/lib/edge/finance/investor-data-room-service";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "launch";

  console.log("\n=======================================================");
  console.log("  BALLMTAANI EDGE — COMMERCIAL LAUNCH & GOVERNANCE CLI");
  console.log("=======================================================\n");

  if (command === "launch") {
    const readiness = LaunchControlService.evaluateLaunchReadiness("paid_beta");
    console.log("Commercial Launch Readiness Evaluation:");
    console.log(` - Target Stage: ${readiness.stage.toUpperCase()}`);
    console.log(` - Is Ready for Launch: ${readiness.isReadyForLaunch}`);
    console.log(` - Passed Gates Count: ${readiness.gates.filter((g) => g.passed).length} / ${readiness.gates.length}`);
    return;
  }

  if (command === "compliance") {
    const compliantTest = ComplianceRegistryService.validateMarketingCopy("Discover probability-driven match intelligence for Premier League fixtures.");
    console.log("Marketing Asset Copy Compliance Check (Compliant):");
    console.log(` - Is Compliant: ${compliantTest.isCompliant}`);
    console.log(` - Recommendation: ${compliantTest.recommendation}`);

    const prohibitedTest = ComplianceRegistryService.validateMarketingCopy("Join today for a guaranteed win and secret betting formula!");
    console.log("\n Marketing Asset Copy Compliance Check (Prohibited):");
    console.log(` - Is Compliant: ${prohibitedTest.isCompliant}`);
    console.log(` - Recommendation: ${prohibitedTest.recommendation}`);
    return;
  }

  if (command === "attribution") {
    AcquisitionAttributionEngine.recordTouchpoint({ userId: "usr-growth-10", channel: "telecom_bundle", campaign: "safaricom_promo_v1", occurredAt: new Date().toISOString() });
    const attribution = AcquisitionAttributionEngine.getAttributionForUser("usr-growth-10");

    console.log("Multi-Touch Acquisition Channel Attribution:");
    console.log(` - User ID: ${attribution.userId}`);
    console.log(` - First Touch Channel: ${attribution.firstTouchChannel}`);
    console.log(` - Last Touch Channel: ${attribution.lastTouchChannel}`);
    console.log(` - Conversion State: ${attribution.conversionState}`);
    return;
  }

  if (command === "financial") {
    const ledger = FinancialLedgerEngine.calculatePeriodProfitability();
    console.log("Financial Ledger & Contribution Margin Report:");
    console.log(` - Gross Revenue: KES ${ledger.grossRevenueKes.toLocaleString()}`);
    console.log(` - Total Variable Costs: KES ${ledger.totalVariableCostKes.toLocaleString()}`);
    console.log(` - Net Contribution Margin: KES ${ledger.contributionMarginKes.toLocaleString()}`);
    console.log(` - Contribution Margin %: ${ledger.contributionMarginPercentage}%`);
    return;
  }

  if (command === "dataroom") {
    const docs = InvestorDataRoomService.getAvailableDataRoomDocuments();
    console.log("Investor Data Room Registry & Signed Link Generator:");
    console.log(` - Audited Documents Available: ${docs.length}`);
    const link = InvestorDataRoomService.generateTemporarySignedAccessUrl(docs[0].id, "investor@venturefund.com");
    console.log(` - Sample Signed URL: ${link.signedUrl}`);
    console.log(` - Expiration: ${link.expiresAt}`);
    return;
  }

  console.log(`Unknown command '${command}'. Use: launch, compliance, attribution, financial, dataroom.`);
}

main().catch((err) => {
  console.error("CLI Error:", err);
  process.exit(1);
});
