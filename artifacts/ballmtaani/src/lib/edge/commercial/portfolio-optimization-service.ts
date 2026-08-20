/**
 * Portfolio Optimization Service — Phase 13
 *
 * Manages competition, product, channel and partner portfolios.
 * Scoring and recommendations based on contribution, growth, retention,
 * complexity and strategic value.
 */

export type PortfolioType =
  | "plan" | "product" | "competition" | "channel"
  | "partner" | "country" | "language" | "payment_provider";

export type PortfolioStatus =
  | "invest" | "grow" | "maintain" | "optimize"
  | "harvest" | "merge" | "pause" | "retire";

export type CompetitionClass =
  | "core" | "growth" | "strategic" | "experimental"
  | "internal_only" | "paused" | "retired";

export interface PortfolioItem {
  id: string;
  portfolioType: PortfolioType;
  referenceId: string;
  name: string;
  currentStatus: PortfolioStatus;
  strategicValue: number;       // 0–100
  revenueMinor: number;
  variableCostMinor: number;
  contributionMinor: number;    // computed: revenue - variableCost
  currencyCode: string;
  growthRatePct: number | null;
  retentionPct: number | null;
  operationalComplexity: number; // 0–100
  complianceRisk: number;        // 0–100
  supportBurden: number;         // 0–100
  recommendation: PortfolioStatus | null;
  reviewedAt: string | null;
  owner: string;
}

export interface CompetitionPortfolioScore {
  competitionKey: string;
  name: string;
  classification: CompetitionClass;
  modelPerformance: number; // 0–100
  dataQuality: number;
  providerReliability: number;
  userDemand: number;
  subscriberConversion: number;
  retentionImpact: number;
  revenueMinor: number;
  directCostMinor: number;
  contributionMinor: number;
  strategicValue: number;
  complianceRisk: number;
  supportBurden: number;
  overallScore: number;
  recommendedAction: string;
}

export interface PortfolioReviewDecision {
  itemId: string;
  previousStatus: PortfolioStatus;
  newStatus: PortfolioStatus;
  rationale: string;
  reviewedAt: string;
  reviewedBy: string;
}

// Minimum contribution margin % before a portfolio item is flagged
const MIN_CONTRIBUTION_PCT_THRESHOLD = 35;

export class PortfolioOptimizationService {
  /** Score and classify a competition for portfolio management. */
  static scoreCompetition(params: {
    competitionKey: string;
    name: string;
    modelPerformance: number;
    dataQuality: number;
    providerReliability: number;
    userDemand: number;
    subscriberConversion: number;
    retentionImpact: number;
    revenueMinor: number;
    directCostMinor: number;
    strategicValue: number;
    complianceRisk: number;
    supportBurden: number;
  }): CompetitionPortfolioScore {
    const contributionMinor = params.revenueMinor - params.directCostMinor;
    const contributionPct = params.revenueMinor > 0
      ? (contributionMinor / params.revenueMinor) * 100 : -100;

    // Weighted overall score
    const overallScore = Math.round(
      params.modelPerformance * 0.15 +
      params.dataQuality * 0.12 +
      params.providerReliability * 0.10 +
      params.userDemand * 0.15 +
      params.subscriberConversion * 0.12 +
      params.retentionImpact * 0.08 +
      Math.max(0, Math.min(100, contributionPct)) * 0.10 +
      params.strategicValue * 0.10 +
      (100 - params.complianceRisk) * 0.05 +
      (100 - params.supportBurden) * 0.03
    );

    // Classify
    let classification: CompetitionClass;
    if (overallScore >= 75 && contributionPct >= MIN_CONTRIBUTION_PCT_THRESHOLD)      classification = "core";
    else if (overallScore >= 60 && contributionPct >= 0)                              classification = "growth";
    else if (params.strategicValue >= 70 && contributionPct < MIN_CONTRIBUTION_PCT_THRESHOLD) classification = "strategic";
    else if (overallScore >= 45)                                                       classification = "experimental";
    else                                                                               classification = "paused";

    // Recommended action
    let recommendedAction: string;
    if (classification === "core")         recommendedAction = "Maintain and protect. Consider secondary provider.";
    else if (classification === "growth")  recommendedAction = "Increase marketing and model investment.";
    else if (classification === "strategic") recommendedAction = "Review quarterly. Cap resource commitment.";
    else if (classification === "experimental") recommendedAction = "Beta access only. Time-box to 2 quarters.";
    else                                   recommendedAction = "Pause public predictions. Review retirement.";

    return { ...params, contributionMinor, overallScore, classification, recommendedAction };
  }

  /** Generate a portfolio recommendation for a single item. */
  static recommendPortfolioStatus(item: Partial<PortfolioItem>): {
    recommendation: PortfolioStatus;
    rationale: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const contribution = item.contributionMinor ?? (
      (item.revenueMinor ?? 0) - (item.variableCostMinor ?? 0)
    );
    const revenue = item.revenueMinor ?? 0;
    const contributionPct = revenue > 0 ? (contribution / revenue) * 100 : -100;
    const growth = item.growthRatePct ?? 0;
    const strategic = item.strategicValue ?? 50;
    const complexity = item.operationalComplexity ?? 50;
    const risk = item.complianceRisk ?? 50;

    if (contribution < 0) {
      warnings.push("Negative contribution — review cost structure before continuing.");
    }
    if (contributionPct < MIN_CONTRIBUTION_PCT_THRESHOLD && strategic < 60) {
      warnings.push(`Contribution (${contributionPct.toFixed(0)}%) below ${MIN_CONTRIBUTION_PCT_THRESHOLD}% threshold with low strategic value.`);
    }

    let recommendation: PortfolioStatus;
    if (growth > 30 && contributionPct >= 50 && strategic >= 60)          recommendation = "invest";
    else if (growth > 10 && contributionPct >= MIN_CONTRIBUTION_PCT_THRESHOLD) recommendation = "grow";
    else if (growth > 0 && contributionPct >= 30 && complexity < 70)      recommendation = "maintain";
    else if (contribution >= 0 && (risk > 60 || complexity > 70))         recommendation = "optimize";
    else if (contribution >= 0 && growth <= 0)                            recommendation = "harvest";
    else if (contribution < 0 && strategic < 40)                          recommendation = "retire";
    else if (contribution < 0 && strategic >= 40)                         recommendation = "pause";
    else                                                                    recommendation = "maintain";

    const rationale = `Contribution: ${contributionPct.toFixed(0)}%, Growth: ${growth.toFixed(0)}%, Strategic: ${strategic}/100, Complexity: ${complexity}/100`;
    return { recommendation, rationale, warnings };
  }

  /** Run a portfolio review for a set of items. */
  static runPortfolioReview(items: PortfolioItem[], reviewedBy: string): PortfolioReviewDecision[] {
    const decisions: PortfolioReviewDecision[] = [];
    const now = new Date().toISOString();

    for (const item of items) {
      const { recommendation, rationale } = this.recommendPortfolioStatus(item);
      if (recommendation !== item.currentStatus) {
        decisions.push({
          itemId: item.id,
          previousStatus: item.currentStatus,
          newStatus: recommendation,
          rationale,
          reviewedAt: now,
          reviewedBy,
        });
      }
    }

    return decisions;
  }

  /** Classify partners into portfolio tiers. */
  static classifyPartner(metrics: {
    contributionMinor: number;
    contractValueMinor: number;
    apiUsagePct: number;
    supportTicketsMonthly: number;
    complianceIssues: number;
    renewalLikelihood: "Likely" | "Uncertain" | "At risk" | "Churn expected";
    strategic: boolean;
  }): string {
    if (metrics.complianceIssues > 0)                   return "Compliance concern";
    if (metrics.contributionMinor < 0)                   return "Negative contribution";
    if (metrics.renewalLikelihood === "Churn expected")  return "Exit candidate";
    if (metrics.supportTicketsMonthly > 20)              return "High support";
    if (metrics.renewalLikelihood === "At risk")         return "At risk";
    if (metrics.strategic && metrics.contributionMinor >= 0) return "Strategic";
    if (metrics.apiUsagePct > 80 && metrics.contributionMinor > 0) return "Growth";
    if (metrics.contributionMinor > 0)                   return "Profitable";
    return "Developing";
  }
}
