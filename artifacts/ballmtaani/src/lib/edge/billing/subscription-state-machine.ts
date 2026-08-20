/**
 * BallMtaani Edge Phase 6 — Subscription State Machine & Lifecycle Transitions
 */

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "grace"
  | "expired"
  | "cancelled"
  | "suspended"
  | "refunded"
  | "payment_failed";

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: string;
  planCode: string;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string;
  graceEndsAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  latestPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionEventRecord {
  id: string;
  subscriptionId: string;
  userId: string;
  eventType:
    | "created"
    | "payment_pending"
    | "activated"
    | "renewed"
    | "extended"
    | "grace_started"
    | "expired"
    | "cancelled"
    | "suspended"
    | "refunded"
    | "manually_granted";
  previousStatus?: SubscriptionStatus;
  newStatus: SubscriptionStatus;
  effectiveAt: string;
  source: string;
  sourceId?: string;
  reason?: string;
}

const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  pending: ["active", "payment_failed", "cancelled"],
  active: ["grace", "expired", "cancelled", "suspended", "refunded", "active"], // active -> active is renewal extension
  grace: ["active", "expired", "cancelled", "suspended", "refunded"],
  expired: ["active"], // renewal after expiry
  cancelled: ["active"],
  suspended: ["active", "refunded"],
  refunded: ["active"],
  payment_failed: ["pending", "active"],
};

export function isValidStatusTransition(
  currentStatus: SubscriptionStatus,
  newStatus: SubscriptionStatus
): boolean {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

export function transitionSubscriptionStatus(
  subscription: SubscriptionRecord,
  newStatus: SubscriptionStatus,
  reason?: string,
  source = "system"
): { updatedSubscription: SubscriptionRecord; event: SubscriptionEventRecord } {
  if (!isValidStatusTransition(subscription.status, newStatus)) {
    throw new Error(
      `Invalid subscription status transition from '${subscription.status}' to '${newStatus}'.`
    );
  }

  const now = new Date().toISOString();
  const previousStatus = subscription.status;

  const updatedSubscription: SubscriptionRecord = {
    ...subscription,
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === "cancelled") {
    updatedSubscription.cancelledAt = now;
    updatedSubscription.cancellationReason = reason || "User initiated cancellation";
  }

  let eventType: SubscriptionEventRecord["eventType"] = "activated";
  if (newStatus === "active") eventType = previousStatus === "active" ? "renewed" : "activated";
  if (newStatus === "grace") eventType = "grace_started";
  if (newStatus === "expired") eventType = "expired";
  if (newStatus === "cancelled") eventType = "cancelled";
  if (newStatus === "suspended") eventType = "suspended";
  if (newStatus === "refunded") eventType = "refunded";

  const event: SubscriptionEventRecord = {
    id: `SUB-EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    subscriptionId: subscription.id,
    userId: subscription.userId,
    eventType,
    previousStatus,
    newStatus,
    effectiveAt: now,
    source,
    reason,
  };

  return { updatedSubscription, event };
}

/**
 * Calculates new expiration date based on plan duration and current expiration state
 */
export function calculateSubscriptionExpiry(
  durationHours: number | null,
  currentExpiry?: string
): string {
  if (!durationHours) {
    // Perpetual free access (e.g. 100 years out)
    const perp = new Date();
    perp.setFullYear(perp.getFullYear() + 100);
    return perp.toISOString();
  }

  const now = new Date();
  let baseDate = now;

  if (currentExpiry) {
    const existingExpiryDate = new Date(currentExpiry);
    // If active plan is currently not expired, extend from existing expiry date
    if (existingExpiryDate > now) {
      baseDate = existingExpiryDate;
    }
  }

  const newExpiryDate = new Date(baseDate.getTime() + durationHours * 3600 * 1000);
  return newExpiryDate.toISOString();
}
