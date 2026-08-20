/**
 * BallMtaani Edge CLI — Subscriptions, Payments & Entitlements Management
 * Usage: npx tsx scripts/edge-billing-cli.ts [plans|checkout|simulate-callback|maintenance|reconcile]
 */

import { LAUNCH_SUBSCRIPTION_PLANS, getPlanByCode } from "../src/lib/edge/billing/plan-catalog";
import { MockPaymentAdapter } from "../src/lib/edge/billing/mock-payment-adapter";
import { normalizeKenyanPhoneNumber, maskPhoneNumber } from "../src/lib/edge/billing/mpesa-adapter";
import { EntitlementService } from "../src/lib/edge/billing/entitlement-service";
import {
  SubscriptionRecord,
  transitionSubscriptionStatus,
  calculateSubscriptionExpiry,
} from "../src/lib/edge/billing/subscription-state-machine";
import { runSubscriptionMaintenanceJob } from "../src/lib/edge/billing/subscription-maintenance-job";
import { evaluatePaymentReconciliation } from "../src/lib/edge/billing/reconciliation-service";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "plans";

  console.log("\n=======================================================");
  console.log("  BALLMTAANI EDGE — BILLING & SUBSCRIPTIONS ENGINE CLI");
  console.log("=======================================================\n");

  if (command === "plans") {
    console.log("Registered Launch Subscription Plans:");
    LAUNCH_SUBSCRIPTION_PLANS.forEach((plan) => {
      console.log(` - [${plan.code.toUpperCase()}] ${plan.name}: KES ${plan.priceAmount} (${plan.durationHours ? `${plan.durationHours / 24} Days` : "Perpetual"})`);
      console.log(`   Entitlements: ${plan.entitlementKeys.join(", ")}`);
    });
    return;
  }

  if (command === "checkout") {
    const planCode = args[1] || "weekly_edge";
    const rawPhone = args[2] || "0712345678";

    const plan = getPlanByCode(planCode);
    if (!plan) {
      console.error(`Error: Unknown plan code '${planCode}'`);
      process.exit(1);
    }

    const normPhone = normalizeKenyanPhoneNumber(rawPhone);
    const masked = maskPhoneNumber(normPhone);

    console.log(`Initiating STK Push for plan '${plan.name}' (KES ${plan.priceAmount}) to ${masked}...`);

    const adapter = new MockPaymentAdapter("success");
    const res = await adapter.initiatePayment({
      userId: "usr-cli-101",
      planCode: plan.code,
      phoneNumber: normPhone,
    });

    console.log("\nSTK Push Response:");
    console.log(` Internal Reference: ${res.internalReference}`);
    console.log(` Provider Checkout ID: ${res.providerCheckoutRequestId}`);
    console.log(` Status: ${res.status}`);
    console.log(` Message: ${res.message}`);

    // Activate subscription
    const now = new Date().toISOString();
    const expiresAt = calculateSubscriptionExpiry(plan.durationHours);

    const subscription: SubscriptionRecord = {
      id: `SUB-${Date.now()}`,
      userId: "usr-cli-101",
      planId: plan.id,
      planCode: plan.code,
      status: "active",
      startsAt: now,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    EntitlementService.saveSubscription(subscription);

    console.log("\nSubscription Activated Successfully:");
    console.log(` Subscription ID: ${subscription.id}`);
    console.log(` Status: ${subscription.status}`);
    console.log(` Expiry Date: ${subscription.expiresAt}`);
    return;
  }

  if (command === "maintenance") {
    console.log("Executing Subscription Expiry & Grace Period Maintenance Job...");

    const now = new Date();
    const expiredSub: SubscriptionRecord = {
      id: "SUB-TEST-EXPIRED",
      userId: "usr-expired-1",
      planId: "plan-weekly-edge",
      planCode: "weekly_edge",
      status: "active",
      startsAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
      expiresAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const { updatedSubscriptions, report } = await runSubscriptionMaintenanceJob([expiredSub]);

    console.log("\nMaintenance Job Execution Summary:");
    console.log(` Timestamp: ${report.timestamp}`);
    console.log(` Processed Count: ${report.processedCount}`);
    console.log(` Expired Count: ${report.expiredCount}`);
    console.log(` Grace Started Count: ${report.graceStartedCount}`);
    console.log(` Resulting Status: ${updatedSubscriptions[0].status}`);
    return;
  }

  if (command === "reconcile") {
    console.log("Running Payment Status Reconciliation Service Check...");
    const rec = evaluatePaymentReconciliation({
      id: "PAY-99120",
      expectedAmount: 99,
      receivedAmount: 99,
      internalStatus: "pending",
      providerStatus: "successful",
      providerTransactionId: "M-PESA-QW881",
    });

    if (rec) {
      console.log("\nReconciliation Exception Found & Resolved:");
      console.log(` Payment ID: ${rec.paymentId}`);
      console.log(` Discrepancy: ${rec.discrepancyType}`);
      console.log(` Resolution Status: ${rec.resolutionStatus}`);
      console.log(` Note: ${rec.resolutionNote}`);
    } else {
      console.log("No reconciliation discrepancies found.");
    }
    return;
  }

  console.log(`Unknown CLI command '${command}'. Use: plans, checkout, maintenance, reconcile.`);
}

main().catch((err) => {
  console.error("CLI Execution Error:", err);
  process.exit(1);
});
