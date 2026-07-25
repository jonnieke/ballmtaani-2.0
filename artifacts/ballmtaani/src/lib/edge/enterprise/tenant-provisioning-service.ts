/**
 * Tenant Provisioning Service — Phase 13
 *
 * Idempotent, resume-safe provisioning pipeline for approved partners.
 * Does NOT provision production access before verification passes.
 */

export type ProvisioningStep =
  | "create_tenant" | "assign_owner" | "apply_plan" | "configure_scopes"
  | "apply_usage_limits" | "apply_feature_flags" | "set_trial_expiry"
  | "create_billing_profile" | "create_audit_event" | "send_onboarding";

export type ProvisioningStatus =
  | "pending" | "in_progress" | "completed" | "failed" | "rolled_back";

export interface ProvisioningPlan {
  applicationId: string;
  partnerType: string;
  organizationName: string;
  ownerUserId: string;
  planKey: string;
  allowedScopes: string[];
  usageLimits: Record<string, number>;
  featureFlags: Record<string, boolean>;
  isTrial: boolean;
  trialDurationDays: number | null;
  market: string;
}

export interface ProvisioningResult {
  applicationId: string;
  tenantId: string;
  status: ProvisioningStatus;
  completedSteps: ProvisioningStep[];
  failedStep: ProvisioningStep | null;
  error: string | null;
  idempotencyKey: string;
  provisionedAt: string;
}

export interface ProvisioningProgress {
  steps: Record<ProvisioningStep, "pending" | "completed" | "failed" | "skipped">;
  currentStep: ProvisioningStep | null;
  tenantId: string | null;
  startedAt: string;
}

const PROVISIONING_SEQUENCE: ProvisioningStep[] = [
  "create_tenant",
  "assign_owner",
  "apply_plan",
  "configure_scopes",
  "apply_usage_limits",
  "apply_feature_flags",
  "set_trial_expiry",
  "create_billing_profile",
  "create_audit_event",
  "send_onboarding",
];

const PLAN_DEFAULTS: Record<string, { scopes: string[]; limits: Record<string, number> }> = {
  creator_free:     { scopes: ["referral","campaign_assets","public_predictions"],      limits: { api_requests_monthly: 0, widget_views_monthly: 0 } },
  widget_starter:   { scopes: ["public_predictions","widget_embed"],                    limits: { api_requests_monthly: 1_000, widget_views_monthly: 50_000, domains: 1 } },
  publisher:        { scopes: ["public_predictions","widget_embed","public_api"],        limits: { api_requests_monthly: 10_000, widget_views_monthly: 500_000, domains: 3 } },
  developer:        { scopes: ["sandbox_api","webhook_test"],                           limits: { api_requests_monthly: 5_000, widget_views_monthly: 0, domains: 0 } },
  pro_publisher:    { scopes: ["public_predictions","widget_embed","premium_api"],      limits: { api_requests_monthly: 100_000, widget_views_monthly: 2_000_000, domains: 10 } },
  enterprise:       { scopes: ["custom"], /* customised at contract time */             limits: { api_requests_monthly: -1, widget_views_monthly: -1, domains: -1 } },
};

export class TenantProvisioningService {
  /** Initialise a new provisioning run for an approved application. */
  static initProvisioningProgress(applicationId: string): ProvisioningProgress {
    const steps = Object.fromEntries(
      PROVISIONING_SEQUENCE.map(s => [s, "pending"])
    ) as Record<ProvisioningStep, "pending" | "completed" | "failed" | "skipped">;

    return {
      steps,
      currentStep: null,
      tenantId: null,
      startedAt: new Date().toISOString(),
    };
  }

  /** Simulate executing the provisioning sequence (deterministic stub for testing). */
  static executeProvisioning(plan: ProvisioningPlan, existingProgress?: ProvisioningProgress): ProvisioningResult {
    const idempotencyKey = `prov:${plan.applicationId}:${plan.ownerUserId}`;
    const progress = existingProgress ?? this.initProvisioningProgress(plan.applicationId);
    const tenantId = progress.tenantId ?? `tnt_${plan.applicationId.slice(0, 8)}`;
    const completedSteps: ProvisioningStep[] = [];

    for (const step of PROVISIONING_SEQUENCE) {
      // Skip already-completed steps (idempotency / resume)
      if (progress.steps[step] === "completed") {
        completedSteps.push(step);
        continue;
      }

      // Simulate step execution
      const stepResult = this.executeStep(step, plan, tenantId);
      if (!stepResult.success) {
        return {
          applicationId: plan.applicationId,
          tenantId,
          status: "failed",
          completedSteps,
          failedStep: step,
          error: stepResult.error ?? "Unknown provisioning error",
          idempotencyKey,
          provisionedAt: new Date().toISOString(),
        };
      }
      completedSteps.push(step);
    }

    return {
      applicationId: plan.applicationId,
      tenantId,
      status: "completed",
      completedSteps,
      failedStep: null,
      error: null,
      idempotencyKey,
      provisionedAt: new Date().toISOString(),
    };
  }

  /** Execute a single provisioning step. */
  private static executeStep(
    step: ProvisioningStep,
    plan: ProvisioningPlan,
    tenantId: string
  ): { success: boolean; error?: string } {
    switch (step) {
      case "create_tenant":
        return { success: true };
      case "assign_owner":
        return plan.ownerUserId ? { success: true } : { success: false, error: "Owner user ID is required" };
      case "apply_plan": {
        const planDef = PLAN_DEFAULTS[plan.planKey];
        return planDef ? { success: true } : { success: false, error: `Unknown plan key: ${plan.planKey}` };
      }
      case "configure_scopes":
        return plan.allowedScopes.length > 0 ? { success: true } : { success: false, error: "No scopes configured" };
      case "apply_usage_limits":
        return { success: true };
      case "apply_feature_flags":
        return { success: true };
      case "set_trial_expiry":
        if (plan.isTrial && (plan.trialDurationDays === null || plan.trialDurationDays <= 0)) {
          return { success: false, error: "Trial duration must be a positive number of days" };
        }
        return { success: true };
      case "create_billing_profile":
        return { success: true };
      case "create_audit_event":
        return { success: true };
      case "send_onboarding":
        return { success: true };
    }
  }

  /** Retrieve the default scopes and limits for a given plan key. */
  static getPlanDefaults(planKey: string): { scopes: string[]; limits: Record<string, number> } | null {
    return PLAN_DEFAULTS[planKey] ?? null;
  }

  /** Generate a rollback record for a failed or cancelled provisioning. */
  static generateRollbackRecord(tenantId: string, reason: string): {
    tenantId: string;
    reason: string;
    rolledBackAt: string;
    steps: string[];
  } {
    return {
      tenantId,
      reason,
      rolledBackAt: new Date().toISOString(),
      steps: [
        "revoke_api_keys",
        "suspend_tenant",
        "cancel_billing_profile",
        "remove_feature_flags",
        "create_rollback_audit_event",
      ],
    };
  }
}
