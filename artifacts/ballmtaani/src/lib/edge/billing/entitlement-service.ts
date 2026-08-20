/**
 * BallMtaani Edge Phase 6 — Centralized Entitlement Evaluator
 */

import { getPlanByCode } from "./plan-catalog";
import { SubscriptionRecord } from "./subscription-state-machine";

export interface UserEntitlementGrant {
  id: string;
  userId: string;
  entitlementKey: string;
  sourceType: "subscription" | "promotion" | "admin" | "campaign" | "compensation" | "test";
  startsAt: string;
  expiresAt: string;
  status: "active" | "expired" | "revoked";
  grantedBy?: string;
  reason?: string;
}

export interface AccessDecision {
  allowed: boolean;
  decision: "allowed" | "denied" | "preview" | "anonymous_free";
  reason: string;
  matchedEntitlementKey?: string;
  subscriptionId?: string;
}

const IN_MEMORY_SUBSCRIPTIONS = new Map<string, SubscriptionRecord>();
const IN_MEMORY_MANUAL_GRANTS = new Map<string, UserEntitlementGrant[]>();

export class EntitlementService {
  /**
   * Evaluates if a user possesses a specific active entitlement key
   */
  static async hasEntitlement(userId: string | null, entitlementKey: string): Promise<boolean> {
    const decision = await this.evaluateAccess(userId, entitlementKey);
    return decision.allowed;
  }

  /**
   * Retrieves active subscription for a user
   */
  static async getActiveSubscription(userId: string): Promise<SubscriptionRecord | null> {
    const sub = IN_MEMORY_SUBSCRIPTIONS.get(userId);
    if (!sub) return null;

    const now = new Date();
    const expiry = new Date(sub.expiresAt);

    if (sub.status === "active" && expiry > now) {
      return sub;
    }

    if (sub.status === "grace" && sub.graceEndsAt && new Date(sub.graceEndsAt) > now) {
      return sub;
    }

    return null;
  }

  /**
   * Grants an active subscription to a user (e.g. upon confirmed payment)
   */
  static saveSubscription(subscription: SubscriptionRecord): void {
    IN_MEMORY_SUBSCRIPTIONS.set(subscription.userId, subscription);
  }

  /**
   * Adds a manual entitlement grant for a user
   */
  static addManualGrant(grant: UserEntitlementGrant): void {
    const existing = IN_MEMORY_MANUAL_GRANTS.get(grant.userId) || [];
    existing.push(grant);
    IN_MEMORY_MANUAL_GRANTS.set(grant.userId, existing);
  }

  /**
   * Comprehensive access evaluation engine
   */
  static async evaluateAccess(userId: string | null, entitlementKey: string): Promise<AccessDecision> {
    // 1. Basic Free Entitlements accessible to all (anonymous or logged-in)
    if (entitlementKey === "edge.basic_predictions") {
      return {
        allowed: true,
        decision: userId ? "allowed" : "anonymous_free",
        reason: "Basic predictions are accessible to all users.",
        matchedEntitlementKey: entitlementKey,
      };
    }

    if (!userId) {
      return {
        allowed: false,
        decision: "preview",
        reason: "Authentication required to access premium football analysis.",
        matchedEntitlementKey: entitlementKey,
      };
    }

    const now = new Date();

    // 2. Check Manual Grants (Admin adjustments, promotional grants)
    const grants = IN_MEMORY_MANUAL_GRANTS.get(userId) || [];
    const activeGrant = grants.find(
      (g) =>
        g.entitlementKey === entitlementKey &&
        g.status === "active" &&
        new Date(g.startsAt) <= now &&
        new Date(g.expiresAt) > now
    );

    if (activeGrant) {
      return {
        allowed: true,
        decision: "allowed",
        reason: `Access granted via manual entitlement (${activeGrant.sourceType}): ${activeGrant.reason || "Active grant"}.`,
        matchedEntitlementKey: entitlementKey,
      };
    }

    // 3. Check Active Subscription Plan
    const activeSub = await this.getActiveSubscription(userId);
    if (!activeSub) {
      return {
        allowed: false,
        decision: "denied",
        reason: "No active premium subscription found.",
        matchedEntitlementKey: entitlementKey,
      };
    }

    const plan = getPlanByCode(activeSub.planCode);
    if (!plan || !plan.isActive) {
      return {
        allowed: false,
        decision: "denied",
        reason: "Associated plan is inactive or retired.",
        matchedEntitlementKey: entitlementKey,
      };
    }

    if (plan.entitlementKeys.includes(entitlementKey)) {
      return {
        allowed: true,
        decision: "allowed",
        reason: `Access granted via active plan '${plan.name}'.`,
        matchedEntitlementKey: entitlementKey,
        subscriptionId: activeSub.id,
      };
    }

    return {
      allowed: false,
      decision: "denied",
      reason: `Current plan '${plan.name}' does not include required entitlement '${entitlementKey}'. Higher tier required.`,
      matchedEntitlementKey: entitlementKey,
      subscriptionId: activeSub.id,
    };
  }
}
