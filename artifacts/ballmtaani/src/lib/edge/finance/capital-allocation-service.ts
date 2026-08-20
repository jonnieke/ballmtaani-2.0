/**
 * Capital Allocation Service — Phase 13
 *
 * Investment proposal scoring, payback calculation, team capacity snapshots,
 * and hiring trigger evaluation.
 */

export type InvestmentType =
  | "data_provider" | "model" | "mobile" | "marketing"
  | "telecom_integration" | "country_expansion" | "competition_expansion"
  | "language" | "enterprise_feature" | "support_staffing"
  | "infrastructure" | "security" | "compliance" | "other";

export type InvestmentStatus =
  | "draft" | "review" | "approved" | "rejected"
  | "active" | "paused" | "completed";

export interface InvestmentProposal {
  id: string;
  title: string;
  investmentType: InvestmentType;
  description: string;
  requestedAmountMinor: number;
  currency: string;
  expectedRevenueMinor: number;
  expectedCostSavingsMinor: number;
  expectedContributionMinor: number;
  strategicValue: number;    // 0–100
  riskLevel: number;         // 0–100 (higher = riskier)
  reversibility: number;     // 0–100 (higher = more reversible)
  timeToValueMonths: number | null;
  paybackPeriodMonths: number | null;
  status: InvestmentStatus;
  owner: string;
}

export interface InvestmentScore {
  proposalId: string;
  compositeScore: number; // 0–100
  paybackRating: "excellent" | "good" | "acceptable" | "poor" | "unknown";
  riskRating: "low" | "medium" | "high" | "very_high";
  recommendation: "approve" | "defer" | "reject" | "request_revision";
  rationale: string;
}

export interface CapacitySnapshot {
  period: string; // YYYY-MM
  functionName: string;
  availableCapacity: number; // 0–100 (100 = fully available)
  committedCapacity: number; // 0–100
  utilization: number;       // derived: committed / available * 100
  backlog: string | null;
  riskLevel: "low" | "medium" | "high" | "critical";
  owner: string;
}

export interface HiringTriggerEvaluation {
  functionName: string;
  triggered: boolean;
  triggers: string[];
  urgency: "none" | "monitor" | "hire_soon" | "hire_now";
  recommendedHeadcount: number;
}

export class CapitalAllocationService {
  /** Score an investment proposal using a multi-factor composite model. */
  static scoreInvestment(proposal: InvestmentProposal): InvestmentScore {
    const totalBenefit = proposal.expectedRevenueMinor + proposal.expectedCostSavingsMinor;
    const benefitToCostRatio = proposal.requestedAmountMinor > 0
      ? totalBenefit / proposal.requestedAmountMinor : 0;

    // Base score components (each 0–100 contribution)
    const contributionScore = Math.min(100, benefitToCostRatio * 30);
    const strategicScore = proposal.strategicValue;
    const reversibilityScore = proposal.reversibility;
    const safetyScore = 100 - proposal.riskLevel;
    const timelinessScore = proposal.timeToValueMonths !== null
      ? Math.max(0, 100 - proposal.timeToValueMonths * 4) : 30;

    // Weighted composite
    const compositeScore = Math.round(
      contributionScore * 0.30 +
      strategicScore * 0.25 +
      safetyScore * 0.20 +
      reversibilityScore * 0.15 +
      timelinessScore * 0.10
    );

    // Payback rating
    const pb = proposal.paybackPeriodMonths;
    const paybackRating =
      pb === null ? "unknown" :
      pb <= 6    ? "excellent" :
      pb <= 12   ? "good" :
      pb <= 24   ? "acceptable" : "poor";

    // Risk rating
    const riskRating =
      proposal.riskLevel <= 25 ? "low" :
      proposal.riskLevel <= 50 ? "medium" :
      proposal.riskLevel <= 75 ? "high" : "very_high";

    // Recommendation
    let recommendation: InvestmentScore["recommendation"];
    if (compositeScore >= 70 && riskRating !== "very_high")       recommendation = "approve";
    else if (compositeScore >= 50 && riskRating !== "very_high")   recommendation = "defer";
    else if (proposal.riskLevel > 75 || proposal.reversibility < 20) recommendation = "reject";
    else                                                             recommendation = "request_revision";

    const rationale = `Composite: ${compositeScore}/100. Benefit/cost: ${benefitToCostRatio.toFixed(2)}×. Payback: ${pb ?? "unknown"} months. Risk: ${riskRating}.`;

    return { proposalId: proposal.id, compositeScore, paybackRating, riskRating, recommendation, rationale };
  }

  /** Calculate capacity utilization for a team function. */
  static calculateCapacityUtilization(snapshot: Omit<CapacitySnapshot, "utilization">): CapacitySnapshot {
    const utilization = snapshot.availableCapacity > 0
      ? Math.min(100, Math.round((snapshot.committedCapacity / snapshot.availableCapacity) * 100))
      : 100;

    const riskLevel: CapacitySnapshot["riskLevel"] =
      utilization >= 95 ? "critical" :
      utilization >= 85 ? "high" :
      utilization >= 70 ? "medium" : "low";

    return { ...snapshot, utilization, riskLevel };
  }

  /** Evaluate hiring triggers for a function given current workload signals. */
  static evaluateHiringTriggers(params: {
    functionName: string;
    supportBacklogDays?: number;
    openPartnerIntegrations?: number;
    modelOpsOverloadSignals?: number;
    dataQualityBacklogItems?: number;
    salesPipelineCoverage?: number; // months of pipeline coverage
    complianceWorkloadPct?: number;
    mobileCrashReportsWeekly?: number;
    infraIncidentsMonthly?: number;
    financeReconHoursMonthly?: number;
    currentUtilizationPct: number;
  }): HiringTriggerEvaluation {
    const triggers: string[] = [];

    if ((params.supportBacklogDays ?? 0) > 3)           triggers.push(`Support backlog ${params.supportBacklogDays}d (threshold: 3d)`);
    if ((params.openPartnerIntegrations ?? 0) > 3)      triggers.push(`${params.openPartnerIntegrations} concurrent partner integrations (threshold: 3)`);
    if ((params.modelOpsOverloadSignals ?? 0) > 2)      triggers.push("Model operations overload signals detected");
    if ((params.dataQualityBacklogItems ?? 0) > 20)     triggers.push(`Data quality backlog: ${params.dataQualityBacklogItems} items`);
    if ((params.salesPipelineCoverage ?? 99) < 3)       triggers.push("Sales pipeline coverage below 3 months");
    if ((params.complianceWorkloadPct ?? 0) > 85)       triggers.push("Compliance team utilisation above 85%");
    if ((params.mobileCrashReportsWeekly ?? 0) > 50)    triggers.push(`Mobile crash volume: ${params.mobileCrashReportsWeekly}/week`);
    if ((params.infraIncidentsMonthly ?? 0) > 3)        triggers.push(`Infrastructure incidents: ${params.infraIncidentsMonthly}/month`);
    if ((params.financeReconHoursMonthly ?? 0) > 40)    triggers.push(`Finance reconciliation: ${params.financeReconHoursMonthly}h/month`);
    if (params.currentUtilizationPct >= 90)              triggers.push(`Team utilisation at ${params.currentUtilizationPct}%`);

    const triggered = triggers.length > 0;
    const urgency: HiringTriggerEvaluation["urgency"] =
      triggers.length >= 4 ? "hire_now" :
      triggers.length >= 2 ? "hire_soon" :
      triggered             ? "monitor" : "none";

    const recommendedHeadcount =
      urgency === "hire_now"  ? Math.ceil(triggers.length / 2) :
      urgency === "hire_soon" ? 1 : 0;

    return { functionName: params.functionName, triggered, triggers, urgency, recommendedHeadcount };
  }
}
