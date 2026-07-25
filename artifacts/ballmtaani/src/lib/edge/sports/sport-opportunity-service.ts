/**
 * Sport Opportunity Service — Phase 14
 *
 * Evaluates cross-sport expansion candidates using a weighted readiness
 * scorecard. No sport may advance to onboarding without an explicit
 * 'approve_research' decision from an authorised reviewer.
 *
 * Football-specific features must NEVER be reused in non-football sports
 * without sport-specific validation.
 */

export type SportOpportunityStatus =
  | "identified" | "research" | "data_review" | "model_research"
  | "commercial_review" | "internal_pilot" | "public_beta"
  | "active" | "paused" | "rejected" | "retired";

export type SportOpportunityDecision =
  | "approve_research" | "approve_internal_pilot" | "approve_public_beta"
  | "activate" | "defer" | "reject";

export interface SportOpportunityScorecardInput {
  sportKey: string;
  sportName: string;
  targetMarkets: string[];

  // Weighted dimensions (0–100 each)
  audienceScore: number;            // 10%
  dataAvailabilityScore: number;    // 12%
  dataQualityScore: number;         // 8%
  modellingFeasibilityScore: number;// 15%
  licensingScore: number;           // 8%
  partnerDemandScore: number;       // 6%
  revenueScore: number;             // 10%
  costScore: number;                // 6%
  strategicFitScore: number;        // 10%
  responsibleUseRiskScore: number;  // 8% (inverted: high risk reduces score)
  operatingComplexityScore: number; // 7% (inverted)
}

export interface SportOpportunityScorecardResult {
  sportKey: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  recommendedDecision: SportOpportunityDecision;
  minimumThresholdsMet: boolean;
  blockingDimensions: string[];
  notes: string[];
}

// Hard minimum per dimension before any approval
const DIMENSION_MINIMUMS: Record<string, number> = {
  dataAvailabilityScore: 50,        // must have usable historical data
  modellingFeasibilityScore: 45,    // must be modelable
  licensingScore: 40,               // must have licensing path
  responsibleUseRiskScore_max: 60,  // risk score must be < 60 (inverted)
};

// Decision thresholds
const DECISION_THRESHOLDS = {
  approve_public_beta: 72,
  approve_internal_pilot: 62,
  approve_research: 45,
  defer: 35,
};

// Sports that must not use football-specific features
export const FOOTBALL_ONLY_FEATURES = [
  "home_attack_strength", "away_defence", "dixon_coles_rho",
  "both_teams_to_score", "over_2_5_goals", "expected_goals",
  "football_elo", "home_xg", "away_xg",
];

// Prohibited claim patterns for any sport
export const PROHIBITED_SPORT_CLAIMS = [
  "guaranteed", "sure bet", "fixed match", "insider", "100% accurate",
  "never loses", "loss recovery", "automated betting",
];

export class SportOpportunityService {
  /** Compute a weighted overall score for a sport opportunity. */
  static calculateOverallScore(input: SportOpportunityScorecardInput): number {
    const weights: Array<{ key: keyof SportOpportunityScorecardInput; weight: number; invert?: boolean }> = [
      { key: "audienceScore",             weight: 0.10 },
      { key: "dataAvailabilityScore",     weight: 0.12 },
      { key: "dataQualityScore",          weight: 0.08 },
      { key: "modellingFeasibilityScore", weight: 0.15 },
      { key: "licensingScore",            weight: 0.08 },
      { key: "partnerDemandScore",        weight: 0.06 },
      { key: "revenueScore",              weight: 0.10 },
      { key: "costScore",                 weight: 0.06 },
      { key: "strategicFitScore",         weight: 0.10 },
      { key: "responsibleUseRiskScore",   weight: 0.08, invert: true },
      { key: "operatingComplexityScore",  weight: 0.07, invert: true },
    ];

    let totalWeight = 0;
    let weightedSum = 0;
    for (const { key, weight, invert } of weights) {
      const raw = input[key] as number;
      const val = invert ? 100 - raw : raw;
      weightedSum += val * weight;
      totalWeight += weight;
    }

    return Math.round(weightedSum / totalWeight);
  }

  /** Full scorecard evaluation with blocking dimension detection. */
  static evaluate(input: SportOpportunityScorecardInput): SportOpportunityScorecardResult {
    const overall = this.calculateOverallScore(input);
    const blockingDimensions: string[] = [];
    const notes: string[] = [];

    // Check hard minimums
    if (input.dataAvailabilityScore < DIMENSION_MINIMUMS.dataAvailabilityScore) {
      blockingDimensions.push(`data_availability (${input.dataAvailabilityScore} < 50 minimum)`);
    }
    if (input.modellingFeasibilityScore < DIMENSION_MINIMUMS.modellingFeasibilityScore) {
      blockingDimensions.push(`modelling_feasibility (${input.modellingFeasibilityScore} < 45 minimum)`);
    }
    if (input.licensingScore < DIMENSION_MINIMUMS.licensingScore) {
      blockingDimensions.push(`licensing (${input.licensingScore} < 40 minimum)`);
    }
    if (input.responsibleUseRiskScore > DIMENSION_MINIMUMS.responsibleUseRiskScore_max) {
      blockingDimensions.push(`responsible_use_risk too high (${input.responsibleUseRiskScore} > 60 maximum)`);
    }

    const minimumThresholdsMet = blockingDimensions.length === 0;

    // Recommended decision
    let recommendedDecision: SportOpportunityDecision;
    if (!minimumThresholdsMet || overall < DECISION_THRESHOLDS.defer) {
      recommendedDecision = "reject";
      notes.push("Hard minimum dimension thresholds not met — do not proceed.");
    } else if (overall < DECISION_THRESHOLDS.approve_research) {
      recommendedDecision = "defer";
      notes.push("Score below research approval threshold. Re-evaluate when data availability improves.");
    } else if (overall < DECISION_THRESHOLDS.approve_internal_pilot) {
      recommendedDecision = "approve_research";
      notes.push("Approve for research phase only. Internal pilot requires score ≥ 62 and all minimums met.");
    } else if (overall < DECISION_THRESHOLDS.approve_public_beta) {
      recommendedDecision = "approve_internal_pilot";
      notes.push("Approve for internal pilot. Public beta requires score ≥ 72, calibration complete, and model beating baseline.");
    } else {
      recommendedDecision = "approve_public_beta";
      notes.push("Approve for public beta. Full activation requires performance ledger and product review.");
    }

    const dimensionScores: Record<string, number> = {
      audience: input.audienceScore,
      data_availability: input.dataAvailabilityScore,
      data_quality: input.dataQualityScore,
      modelling_feasibility: input.modellingFeasibilityScore,
      licensing: input.licensingScore,
      partner_demand: input.partnerDemandScore,
      revenue: input.revenueScore,
      cost: input.costScore,
      strategic_fit: input.strategicFitScore,
      responsible_use_risk: input.responsibleUseRiskScore,
      operating_complexity: input.operatingComplexityScore,
    };

    return { sportKey: input.sportKey, overallScore: overall, dimensionScores, recommendedDecision, minimumThresholdsMet, blockingDimensions, notes };
  }

  /** Validate that a proposed model feature is not a football-only feature. */
  static validateFeatureNotFootballOnly(feature: string, sport: string): boolean {
    if (sport === "football") return true; // football can use its own features
    return !FOOTBALL_ONLY_FEATURES.includes(feature);
  }

  /** Check sport description or marketing copy for prohibited claims. */
  static checkProhibitedClaims(text: string): string[] {
    const lower = text.toLowerCase();
    return PROHIBITED_SPORT_CLAIMS.filter(claim => lower.includes(claim));
  }

  /** Validate that a status advance is sequential. */
  static validateStatusAdvance(
    current: SportOpportunityStatus,
    proposed: SportOpportunityStatus
  ): { valid: boolean; error?: string } {
    const sequence: SportOpportunityStatus[] = [
      "identified", "research", "data_review", "model_research",
      "commercial_review", "internal_pilot", "public_beta", "active",
    ];
    const currentIdx = sequence.indexOf(current);
    const proposedIdx = sequence.indexOf(proposed);

    if (proposedIdx === -1) return { valid: true }; // terminal states ok
    if (currentIdx === -1) return { valid: false, error: "Unknown current status." };
    if (proposedIdx > currentIdx + 1) {
      return { valid: false, error: `Cannot skip from '${current}' to '${proposed}'. Must advance through ${sequence[currentIdx + 1]}.` };
    }
    return { valid: true };
  }
}
