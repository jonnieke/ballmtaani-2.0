/**
 * BallMtaani Edge Phase 6 — Subscription Maintenance & Expiry Job
 */

import { SubscriptionRecord, transitionSubscriptionStatus } from "./subscription-state-machine";
import { EntitlementService } from "./entitlement-service";

export interface MaintenanceReport {
  timestamp: string;
  processedCount: number;
  expiredCount: number;
  graceStartedCount: number;
}

export async function runSubscriptionMaintenanceJob(
  subscriptions: SubscriptionRecord[]
): Promise<{ updatedSubscriptions: SubscriptionRecord[]; report: MaintenanceReport }> {
  const now = new Date();
  const updatedSubscriptions: SubscriptionRecord[] = [];
  let expiredCount = 0;
  let graceStartedCount = 0;

  for (const sub of subscriptions) {
    let currentSub = { ...sub };
    const expiry = new Date(currentSub.expiresAt);

    if (currentSub.status === "active" && expiry <= now) {
      if (currentSub.graceEndsAt && new Date(currentSub.graceEndsAt) > now) {
        // Transition to grace
        const { updatedSubscription } = transitionSubscriptionStatus(
          currentSub,
          "grace",
          "Subscription period ended, active grace period started.",
          "maintenance_job"
        );
        currentSub = updatedSubscription;
        graceStartedCount++;
      } else {
        // Transition directly to expired
        const { updatedSubscription } = transitionSubscriptionStatus(
          currentSub,
          "expired",
          "Subscription period expired.",
          "maintenance_job"
        );
        currentSub = updatedSubscription;
        expiredCount++;
      }
    } else if (currentSub.status === "grace" && currentSub.graceEndsAt && new Date(currentSub.graceEndsAt) <= now) {
      // Transition from grace to expired
      const { updatedSubscription } = transitionSubscriptionStatus(
        currentSub,
        "expired",
        "Grace period expired.",
        "maintenance_job"
      );
      currentSub = updatedSubscription;
      expiredCount++;
    }

    updatedSubscriptions.push(currentSub);
    EntitlementService.saveSubscription(currentSub);
  }

  return {
    updatedSubscriptions,
    report: {
      timestamp: now.toISOString(),
      processedCount: subscriptions.length,
      expiredCount,
      graceStartedCount,
    },
  };
}
