/**
 * Customer Success Service — Phase 13
 *
 * Health scoring, lifecycle management, renewal forecasting
 * and expansion opportunity tracking for B2B and enterprise accounts.
 */

export type CsLifecycleStage =
  | "onboarding" | "implementation" | "launched" | "adopting"
  | "healthy" | "expanding" | "at_risk" | "renewal" | "churned";

export type CsHealthLabel = "Healthy" | "Watch" | "At risk" | "Critical";
export type RenewalForecast = "Likely" | "Uncertain" | "At risk" | "Churn expected";
export type RiskStatus = "none" | "watch" | "elevated" | "critical";

export interface CsAccount {
  id: string;
  tenantId: string;
  segment: "publisher" | "api_customer" | "enterprise" | "telecom" | "creator" | "small_media";
  lifecycleStage: CsLifecycleStage;
  healthScore: number; // 0–100
  healthLabel: CsHealthLabel;
  renewalDate: string | null;
  contractValueMinor: number;
  contractCurrency: string;
  riskStatus: RiskStatus;
  nextReviewAt: string | null;
}

export interface CsHealthInput {
  apiUsagePct: number;        // % of contracted usage consumed
  widgetUsagePct: number;
  activeSeats: number;
  totalSeats: number;
  featuresAdopted: number;
  totalFeatures: number;
  openSupportIssues: number;
  criticalSupportIssues: number;
  billingStatus: "current" | "past_due" | "disputed";
  daysToRenewal: number | null;
  errorRatePct: number;
  slaBreaches: number;
  lastEngagementDays: number; // days since last substantive engagement
}

export interface CsSuccessPlan {
  id: string;
  csAccountId: string;
  objectives: string;
  successMetrics: { metric: string; target: string }[];
  implementationSteps: { step: string; targetDate: string; status: string }[];
  productAdoptionTargets: { feature: string; targetPct: number }[];
  trainingRequirements: string | null;
  owner: string;
  startAt: string;
  reviewAt: string;
  status: "draft" | "active" | "completed" | "cancelled";
}

export interface RenewalAssessment {
  tenantId: string;
  renewalDate: string | null;
  forecast: RenewalForecast;
  confidenceScore: number; // 0–100
  keyRisks: string[];
  recommendedActions: string[];
}

export interface ExpansionOpportunity {
  tenantId: string;
  opportunityType: string;
  estimatedValueMinor: number;
  currency: string;
  description: string;
  readinessScore: number; // 0–100
}

export class CustomerSuccessService {
  /** Calculate a health score (0–100) from usage and engagement signals. */
  static calculateHealthScore(input: CsHealthInput): { score: number; label: CsHealthLabel; factors: string[] } {
    let score = 100;
    const factors: string[] = [];

    // API usage (underuse is a risk signal)
    if (input.apiUsagePct < 20)       { score -= 20; factors.push(`api_usage_very_low:${input.apiUsagePct.toFixed(0)}%`); }
    else if (input.apiUsagePct < 50)  { score -= 10; factors.push(`api_usage_low:${input.apiUsagePct.toFixed(0)}%`); }

    // Feature adoption
    const adoptionPct = input.totalFeatures > 0 ? (input.featuresAdopted / input.totalFeatures) * 100 : 0;
    if (adoptionPct < 25)             { score -= 15; factors.push(`feature_adoption_low:${adoptionPct.toFixed(0)}%`); }
    else if (adoptionPct < 50)        { score -= 7;  factors.push(`feature_adoption_moderate:${adoptionPct.toFixed(0)}%`); }

    // Support issues
    if (input.criticalSupportIssues > 0) { score -= input.criticalSupportIssues * 15; factors.push(`critical_support:${input.criticalSupportIssues}`); }
    else if (input.openSupportIssues > 5) { score -= 10; factors.push(`open_support_issues:${input.openSupportIssues}`); }

    // Billing
    if (input.billingStatus === "disputed")  { score -= 20; factors.push("billing_disputed"); }
    else if (input.billingStatus === "past_due") { score -= 15; factors.push("billing_past_due"); }

    // Renewal proximity
    if (input.daysToRenewal !== null && input.daysToRenewal < 60) { score -= 10; factors.push(`days_to_renewal:${input.daysToRenewal}`); }

    // Error rate
    if (input.errorRatePct > 5)       { score -= 15; factors.push(`error_rate_high:${input.errorRatePct.toFixed(1)}%`); }
    else if (input.errorRatePct > 2)  { score -= 7;  factors.push(`error_rate_elevated:${input.errorRatePct.toFixed(1)}%`); }

    // SLA breaches
    if (input.slaBreaches > 0)        { score -= input.slaBreaches * 5; factors.push(`sla_breaches:${input.slaBreaches}`); }

    // Engagement recency
    if (input.lastEngagementDays > 60)  { score -= 15; factors.push(`no_engagement_${input.lastEngagementDays}d`); }
    else if (input.lastEngagementDays > 30) { score -= 7; factors.push(`low_engagement_${input.lastEngagementDays}d`); }

    score = Math.max(0, Math.min(100, score));

    const label: CsHealthLabel =
      score >= 75 ? "Healthy" :
      score >= 50 ? "Watch" :
      score >= 25 ? "At risk" : "Critical";

    return { score, label, factors };
  }

  /** Forecast renewal probability for an account. */
  static forecastRenewal(account: CsAccount, input: CsHealthInput): RenewalAssessment {
    const { score, label } = this.calculateHealthScore(input);
    const keyRisks: string[] = [];
    const recommendedActions: string[] = [];

    if (input.billingStatus !== "current")     keyRisks.push("Outstanding billing issue");
    if (input.criticalSupportIssues > 0)       keyRisks.push("Unresolved critical support case");
    if (input.daysToRenewal !== null && input.daysToRenewal < 30) keyRisks.push("Renewal imminent — no renewal confirmation");
    if (input.apiUsagePct < 20)                keyRisks.push("Significantly underusing contracted API volume");
    if (input.lastEngagementDays > 45)         keyRisks.push("No meaningful engagement in 45+ days");

    if (keyRisks.length > 0)                  recommendedActions.push("Schedule executive business review");
    if (input.apiUsagePct < 30)               recommendedActions.push("Arrange technical enablement session");
    if (input.billingStatus !== "current")    recommendedActions.push("Escalate billing resolution to finance");
    if (input.featuresAdopted / input.totalFeatures < 0.5) recommendedActions.push("Conduct product adoption workshop");

    const forecast: RenewalForecast =
      score >= 70 ? "Likely" :
      score >= 45 ? "Uncertain" :
      score >= 25 ? "At risk" : "Churn expected";

    return {
      tenantId: account.tenantId,
      renewalDate: account.renewalDate,
      forecast,
      confidenceScore: score,
      keyRisks,
      recommendedActions,
    };
  }

  /** Identify expansion opportunities within an existing account. */
  static identifyExpansionOpportunities(account: CsAccount, input: CsHealthInput): ExpansionOpportunity[] {
    const opportunities: ExpansionOpportunity[] = [];

    if (account.lifecycleStage !== "churned" && account.healthLabel !== "Critical") {
      if (input.apiUsagePct > 80) {
        opportunities.push({ tenantId: account.tenantId, opportunityType: "api_upgrade", estimatedValueMinor: Math.round(account.contractValueMinor * 0.3), currency: account.contractCurrency, description: "Usage approaching limit — upgrade to higher API tier", readinessScore: 80 });
      }
      if (input.activeSeats < input.totalSeats * 0.6) {
        opportunities.push({ tenantId: account.tenantId, opportunityType: "seat_expansion", estimatedValueMinor: Math.round(account.contractValueMinor * 0.2), currency: account.contractCurrency, description: "Active seat utilisation below 60% — potential additional seats", readinessScore: 50 });
      }
      if (input.featuresAdopted / input.totalFeatures < 0.5) {
        opportunities.push({ tenantId: account.tenantId, opportunityType: "premium_features", estimatedValueMinor: Math.round(account.contractValueMinor * 0.15), currency: account.contractCurrency, description: "Less than half features adopted — upsell to premium scope", readinessScore: 45 });
      }
    }

    return opportunities;
  }

  /** Assign a lifecycle stage based on health and activity signals. */
  static determineLifecycleStage(
    currentStage: CsLifecycleStage,
    healthLabel: CsHealthLabel,
    daysActive: number,
    hasLaunched: boolean,
    renewalDays: number | null,
  ): CsLifecycleStage {
    if (healthLabel === "Critical" && currentStage !== "churned") return "at_risk";
    if (renewalDays !== null && renewalDays <= 90 && renewalDays > 0)   return "renewal";
    if (currentStage === "onboarding" && daysActive > 30)               return hasLaunched ? "launched" : "implementation";
    if (currentStage === "launched" && healthLabel === "Healthy")        return "adopting";
    if (currentStage === "adopting" && healthLabel === "Healthy" && daysActive > 90) return "healthy";
    if (currentStage === "healthy" && healthLabel === "Healthy")         return "expanding";
    return currentStage;
  }
}
