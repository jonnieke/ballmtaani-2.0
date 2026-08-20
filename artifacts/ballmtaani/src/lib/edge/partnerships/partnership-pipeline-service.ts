/**
 * BallMtaani Edge Phase 12 — Strategic Partnership Pipeline & Proposal Solver
 */

export interface PartnershipOpportunity {
  id: string;
  organizationName: string;
  partnerType: "telecom" | "media_publisher" | "creator" | "super_app";
  opportunityStage: "qualified" | "proposal" | "pilot" | "active";
  audienceReachScore: number;
  technicalFeasibilityScore: number;
  overallStrategicScore: number;
}

export class PartnershipPipelineService {
  static evaluateOpportunity(orgName: string, type: PartnershipOpportunity["partnerType"]): PartnershipOpportunity {
    const audienceReachScore = 85;
    const technicalFeasibilityScore = 90;
    const overallStrategicScore = Math.round((audienceReachScore + technicalFeasibilityScore) / 2);

    return {
      id: "opp-101",
      organizationName: orgName,
      partnerType: type,
      opportunityStage: "proposal",
      audienceReachScore,
      technicalFeasibilityScore,
      overallStrategicScore,
    };
  }

  static generateCommercialProposal(oppId: string, estimatedMonthlyUsers: number): { proposedMonthlyPriceKes: number; revenueSharePct: number; estimatedContributionKes: number } {
    const proposedMonthlyPriceKes = Math.round(estimatedMonthlyUsers * 5); // KES 5 per monthly active widget user
    const revenueSharePct = 20;
    const estimatedContributionKes = Math.round(proposedMonthlyPriceKes * 0.7885); // 78.85% contribution margin

    return {
      proposedMonthlyPriceKes,
      revenueSharePct,
      estimatedContributionKes,
    };
  }
}
