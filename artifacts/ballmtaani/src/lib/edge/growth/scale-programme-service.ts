/**
 * Scale Programme Service — Phase 13
 *
 * Manages controlled scaling stages from pilot to mature operation.
 * No automatic stage progression. All gate-checks must pass AND
 * an authorised approver must explicitly advance the stage.
 */

export type ScaleType =
  | "consumer" | "mobile" | "creator" | "publisher" | "b2b_api"
  | "telecom" | "competition" | "country" | "payment_provider"
  | "language" | "enterprise" | "product_plan";

export type ScaleStage =
  | "pilot" | "validated_pilot" | "limited_scale" | "channel_scale"
  | "market_scale" | "regional_scale" | "mature_operation";

export type ScaleProgrammeStatus =
  | "analysis" | "proposed" | "review" | "approved" | "active"
  | "paused" | "completed" | "rolled_back" | "rejected";

export interface StageRequirements {
  stage: ScaleStage;
  maxUsers: number | null;
  maxPartners: number | null;
  maxCampaignSpendKes: number | null;
  maxNotifications: number | null;
  maxCompetitions: number | null;
  maxCountries: number | null;
  maxApiMonthlyRequests: number | null;
  requiredModelAccuracy: number | null; // 0-1
  requiredContributionPct: number | null;
  requiresComplianceSign: boolean;
  requiresExecutiveSign: boolean;
}

export interface ScaleProgramme {
  id: string;
  key: string;
  name: string;
  scaleType: ScaleType;
  targetScope: string;
  currentStage: ScaleStage;
  proposedStage: ScaleStage | null;
  status: ScaleProgrammeStatus;
  owner: string;
  userLimit: number | null;
  partnerLimit: number | null;
  successCriteria: string[];
  stopConditions: string[];
  rollbackPlan: string;
}

export interface ScaleReadinessResult {
  programmeId: string;
  stage: ScaleStage;
  gatesPassed: string[];
  gatesFailed: string[];
  canAdvance: boolean;
  blockers: string[];
}

export interface ChannelScaleDecision {
  channel: string;
  attributionReliable: boolean;
  cpaAcceptable: boolean;
  contributionAcceptable: boolean;
  refundControlled: boolean;
  retentionBaseline: boolean;
  fraudManageable: boolean;
  supportCapacity: boolean;
  complianceClean: boolean;
  decision: "Scale" | "Maintain" | "Optimize" | "Restrict" | "Pause" | "Stop";
}

const STAGE_REQUIREMENTS: Record<ScaleStage, StageRequirements> = {
  pilot:            { stage: "pilot",            maxUsers: 500,    maxPartners: 5,    maxCampaignSpendKes: 50_000,   maxNotifications: 5_000,    maxCompetitions: 3,  maxCountries: 1, maxApiMonthlyRequests: 10_000,    requiredModelAccuracy: 0.52, requiredContributionPct: null, requiresComplianceSign: true,  requiresExecutiveSign: false },
  validated_pilot:  { stage: "validated_pilot",  maxUsers: 2_000,  maxPartners: 20,   maxCampaignSpendKes: 200_000,  maxNotifications: 20_000,   maxCompetitions: 6,  maxCountries: 1, maxApiMonthlyRequests: 50_000,    requiredModelAccuracy: 0.54, requiredContributionPct: 40,   requiresComplianceSign: true,  requiresExecutiveSign: false },
  limited_scale:    { stage: "limited_scale",    maxUsers: 10_000, maxPartners: 50,   maxCampaignSpendKes: 500_000,  maxNotifications: 100_000,  maxCompetitions: 10, maxCountries: 2, maxApiMonthlyRequests: 200_000,   requiredModelAccuracy: 0.55, requiredContributionPct: 45,   requiresComplianceSign: true,  requiresExecutiveSign: true  },
  channel_scale:    { stage: "channel_scale",    maxUsers: 30_000, maxPartners: 150,  maxCampaignSpendKes: 2_000_000,maxNotifications: 500_000,  maxCompetitions: 15, maxCountries: 3, maxApiMonthlyRequests: 1_000_000, requiredModelAccuracy: 0.55, requiredContributionPct: 50,   requiresComplianceSign: true,  requiresExecutiveSign: true  },
  market_scale:     { stage: "market_scale",     maxUsers: 100_000,maxPartners: 500,  maxCampaignSpendKes: 10_000_000,maxNotifications:2_000_000,maxCompetitions: 20, maxCountries: 5, maxApiMonthlyRequests: 5_000_000, requiredModelAccuracy: 0.56, requiredContributionPct: 55,   requiresComplianceSign: true,  requiresExecutiveSign: true  },
  regional_scale:   { stage: "regional_scale",   maxUsers: 500_000,maxPartners: 2_000,maxCampaignSpendKes: null,     maxNotifications: null,     maxCompetitions: 30, maxCountries: 10,maxApiMonthlyRequests: null,      requiredModelAccuracy: 0.56, requiredContributionPct: 55,   requiresComplianceSign: true,  requiresExecutiveSign: true  },
  mature_operation: { stage: "mature_operation", maxUsers: null,   maxPartners: null, maxCampaignSpendKes: null,     maxNotifications: null,     maxCompetitions: null,maxCountries: null,maxApiMonthlyRequests: null,   requiredModelAccuracy: 0.56, requiredContributionPct: 55,   requiresComplianceSign: true,  requiresExecutiveSign: true  },
};

const STAGE_ORDER: ScaleStage[] = [
  "pilot", "validated_pilot", "limited_scale", "channel_scale",
  "market_scale", "regional_scale", "mature_operation",
];

export class ScaleProgrammeService {
  /** Return the requirements ceiling for a given stage. */
  static getStageRequirements(stage: ScaleStage): StageRequirements {
    return STAGE_REQUIREMENTS[stage];
  }

  /** Evaluate whether a programme satisfies its current stage gates. */
  static evaluateScaleReadiness(programme: ScaleProgramme, metrics: {
    currentUsers: number;
    currentPartners: number;
    modelAccuracy: number;
    contributionPct: number;
    complianceSigned: boolean;
    executiveSigned: boolean;
    paymentSuccessRate: number;
    supportBacklogDays: number;
    refundRatePct: number;
  }): ScaleReadinessResult {
    const reqs = STAGE_REQUIREMENTS[programme.currentStage];
    const gatesPassed: string[] = [];
    const gatesFailed: string[] = [];
    const blockers: string[] = [];

    const check = (label: string, passes: boolean, blocker?: string) => {
      if (passes) {
        gatesPassed.push(label);
      } else {
        gatesFailed.push(label);
        if (blocker) blockers.push(blocker);
      }
    };

    check("user_ceiling",
      reqs.maxUsers === null || metrics.currentUsers <= reqs.maxUsers,
      reqs.maxUsers !== null ? `Users (${metrics.currentUsers}) exceed stage ceiling (${reqs.maxUsers})` : undefined);

    check("partner_ceiling",
      reqs.maxPartners === null || metrics.currentPartners <= reqs.maxPartners,
      reqs.maxPartners !== null ? `Partners (${metrics.currentPartners}) exceed stage ceiling (${reqs.maxPartners})` : undefined);

    check("model_accuracy",
      reqs.requiredModelAccuracy === null || metrics.modelAccuracy >= reqs.requiredModelAccuracy,
      `Model accuracy (${(metrics.modelAccuracy * 100).toFixed(1)}%) below required (${((reqs.requiredModelAccuracy ?? 0) * 100).toFixed(1)}%)`);

    check("contribution_margin",
      reqs.requiredContributionPct === null || metrics.contributionPct >= reqs.requiredContributionPct,
      `Contribution (${metrics.contributionPct.toFixed(1)}%) below required (${reqs.requiredContributionPct}%)`);

    check("compliance_sign",
      !reqs.requiresComplianceSign || metrics.complianceSigned,
      "Compliance sign-off required for this stage");

    check("executive_sign",
      !reqs.requiresExecutiveSign || metrics.executiveSigned,
      "Executive sign-off required for this stage");

    check("payment_health",
      metrics.paymentSuccessRate >= 0.92,
      `Payment success rate (${(metrics.paymentSuccessRate * 100).toFixed(1)}%) below 92%`);

    check("support_backlog",
      metrics.supportBacklogDays <= 2,
      `Support backlog (${metrics.supportBacklogDays}d) exceeds 2-day threshold`);

    check("refund_rate",
      metrics.refundRatePct <= 5,
      `Refund rate (${metrics.refundRatePct.toFixed(1)}%) exceeds 5% threshold`);

    return {
      programmeId: programme.id,
      stage: programme.currentStage,
      gatesPassed,
      gatesFailed,
      canAdvance: gatesFailed.length === 0,
      blockers,
    };
  }

  /** Propose a stage advance (does NOT advance automatically). */
  static proposeStageAdvance(
    programme: ScaleProgramme,
    proposedStage: ScaleStage,
    approver: string
  ): { valid: boolean; error?: string } {
    const currentIdx = STAGE_ORDER.indexOf(programme.currentStage);
    const proposedIdx = STAGE_ORDER.indexOf(proposedStage);

    if (proposedIdx !== currentIdx + 1) {
      return { valid: false, error: `Cannot skip stages. Current: ${programme.currentStage}. Must advance to ${STAGE_ORDER[currentIdx + 1]}.` };
    }

    if (!approver || approver.trim() === "") {
      return { valid: false, error: "Approver name is required for stage advance." };
    }

    return { valid: true };
  }

  /** Evaluate a single acquisition channel for scaling eligibility. */
  static evaluateChannelScaling(channel: string, metrics: {
    attributionConfidence: number; // 0-1
    cpaPaidKes: number;
    cpaBenchmarkKes: number;
    contributionPct: number;
    refundRatePct: number;
    retentionVsBaselineDelta: number; // negative = worse
    fraudCasesPerMille: number;
    supportTicketsPerMille: number;
    complianceIssues: number;
  }): ChannelScaleDecision {
    const attributionReliable = metrics.attributionConfidence >= 0.80;
    const cpaAcceptable = metrics.cpaPaidKes <= metrics.cpaBenchmarkKes * 1.2;
    const contributionAcceptable = metrics.contributionPct >= 40;
    const refundControlled = metrics.refundRatePct <= 5;
    const retentionBaseline = metrics.retentionVsBaselineDelta >= -5;
    const fraudManageable = metrics.fraudCasesPerMille <= 3;
    const supportCapacity = metrics.supportTicketsPerMille <= 50;
    const complianceClean = metrics.complianceIssues === 0;

    const passes = [attributionReliable, cpaAcceptable, contributionAcceptable, refundControlled,
                    retentionBaseline, fraudManageable, supportCapacity, complianceClean];
    const passCount = passes.filter(Boolean).length;

    let decision: ChannelScaleDecision["decision"];
    if (passCount === 8) decision = "Scale";
    else if (!complianceClean || !refundControlled) decision = "Restrict";
    else if (passCount >= 6) decision = "Maintain";
    else if (passCount >= 4) decision = "Optimize";
    else if (passCount >= 2) decision = "Pause";
    else decision = "Stop";

    return { channel, attributionReliable, cpaAcceptable, contributionAcceptable,
             refundControlled, retentionBaseline, fraudManageable, supportCapacity,
             complianceClean, decision };
  }
}
