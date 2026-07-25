/**
 * BallMtaani Edge Phase 12 — Expansion Scorecard Engine
 */

export interface ExpansionCandidateScore {
  targetName: string;
  expansionType: "competition" | "country" | "channel";
  audienceDemandScore: number;
  modelReadinessScore: number;
  complianceScore: number;
  contributionMarginScore: number;
  overallScore: number;
  recommendedDecision: "approve_pilot" | "defer" | "reject";
}

export class ExpansionScorecardEngine {
  static evaluateExpansionCandidate(targetName: string, type: ExpansionCandidateScore["expansionType"]): ExpansionCandidateScore {
    const audienceDemandScore = 88;
    const modelReadinessScore = 85;
    const complianceScore = 92;
    const contributionMarginScore = 80;

    const overallScore = Math.round(
      (audienceDemandScore + modelReadinessScore + complianceScore + contributionMarginScore) / 4
    );

    const recommendedDecision = overallScore >= 80 ? "approve_pilot" : "defer";

    return {
      targetName,
      expansionType: type,
      audienceDemandScore,
      modelReadinessScore,
      complianceScore,
      contributionMarginScore,
      overallScore,
      recommendedDecision,
    };
  }
}
