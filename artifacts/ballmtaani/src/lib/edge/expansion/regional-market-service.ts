/**
 * Regional Market Service — Phase 13
 *
 * Manages the full regional market lifecycle from research to scaled launch.
 * Enforces the 13-stage lifecycle and readiness score gates.
 * Multi-currency: all prices stored as integer minor units.
 */

export type MarketLifecycleStatus =
  | "market_research" | "compliance_review" | "payment_review"
  | "data_review" | "model_review" | "partner_discovery"
  | "internal_pilot" | "closed_beta" | "commercial_pilot"
  | "limited_launch" | "scaled_launch" | "paused" | "rejected";

export type MarketDecision = "proceed" | "pause" | "reject" | "escalate";

export interface MarketReadinessAssessment {
  id: string;
  countryCode: string;
  marketName: string;
  status: MarketLifecycleStatus;
  audienceScore: number;
  competitionScore: number;
  modelScore: number;
  paymentScore: number;
  complianceScore: number;
  dataProtectionScore: number;
  localizationScore: number;
  supportScore: number;
  partnerScore: number;
  costScore: number;
  revenueScore: number;
  overallScore: number;
  owner: string;
  reviewedAt: string | null;
  decision: MarketDecision | null;
}

export interface MarketConfiguration {
  countryCode: string;
  marketName: string;
  currencyCode: string;
  defaultLanguage: string;
  defaultTimezone: string;
  availableLanguages: string[];
  isActive: boolean;
  supportChannels: string[];
  partnerEligibility: string[];
}

export interface MarketPlanPrice {
  marketId: string;
  planKey: string;
  priceMinor: number; // integer minor units
  currencyCode: string;
  billingCycle: "monthly" | "annual" | "weekly" | "one_time";
  pricingVersion: string;
  effectiveFrom: string;
}

export interface MarketLegalDocument {
  countryCode: string;
  languageCode: string;
  docType: string;
  version: string;
  effectiveDate: string;
  approvalStatus: "draft" | "legal_review" | "approved" | "active" | "superseded";
  approvedBy: string | null;
}

// Minimum score thresholds per lifecycle stage gate
const STAGE_SCORE_GATES: Partial<Record<MarketLifecycleStatus, number>> = {
  internal_pilot:    60,
  closed_beta:       65,
  commercial_pilot:  70,
  limited_launch:    75,
  scaled_launch:     80,
};

// Stages where compliance score must be ≥ 70
const COMPLIANCE_MANDATORY_STAGES: MarketLifecycleStatus[] = [
  "commercial_pilot", "limited_launch", "scaled_launch",
];

const LIFECYCLE_SEQUENCE: MarketLifecycleStatus[] = [
  "market_research", "compliance_review", "payment_review", "data_review",
  "model_review", "partner_discovery", "internal_pilot", "closed_beta",
  "commercial_pilot", "limited_launch", "scaled_launch",
];

export class RegionalMarketService {
  /** Calculate the overall readiness score (weighted average of dimension scores). */
  static calculateOverallScore(assessment: Partial<MarketReadinessAssessment>): number {
    const weights: Array<{ key: keyof MarketReadinessAssessment; weight: number }> = [
      { key: "audienceScore",       weight: 0.10 },
      { key: "competitionScore",    weight: 0.10 },
      { key: "modelScore",          weight: 0.12 },
      { key: "paymentScore",        weight: 0.15 },
      { key: "complianceScore",     weight: 0.15 },
      { key: "dataProtectionScore", weight: 0.08 },
      { key: "localizationScore",   weight: 0.08 },
      { key: "supportScore",        weight: 0.08 },
      { key: "partnerScore",        weight: 0.06 },
      { key: "costScore",           weight: 0.04 },
      { key: "revenueScore",        weight: 0.04 },
    ];

    let totalWeight = 0;
    let weightedSum = 0;
    for (const { key, weight } of weights) {
      const val = assessment[key] as number | undefined;
      if (val !== undefined && val !== null) {
        weightedSum += val * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /** Evaluate whether a market can advance to the next lifecycle stage. */
  static evaluateStageReadiness(
    assessment: MarketReadinessAssessment,
    targetStage: MarketLifecycleStatus
  ): { canAdvance: boolean; blockers: string[] } {
    const blockers: string[] = [];

    // Must not skip stages
    const currentIdx = LIFECYCLE_SEQUENCE.indexOf(assessment.status);
    const targetIdx = LIFECYCLE_SEQUENCE.indexOf(targetStage);
    if (targetIdx > currentIdx + 1) {
      blockers.push(`Cannot skip from '${assessment.status}' to '${targetStage}'. Next allowed: ${LIFECYCLE_SEQUENCE[currentIdx + 1]}`);
    }

    // Overall score gate
    const requiredScore = STAGE_SCORE_GATES[targetStage];
    if (requiredScore !== undefined && assessment.overallScore < requiredScore) {
      blockers.push(`Overall score (${assessment.overallScore}) below required ${requiredScore} for '${targetStage}'`);
    }

    // Compliance mandatory for commercial stages
    if (COMPLIANCE_MANDATORY_STAGES.includes(targetStage) && (assessment.complianceScore ?? 0) < 70) {
      blockers.push(`Compliance score (${assessment.complianceScore}) must be ≥ 70 for '${targetStage}'`);
    }

    // Payment score mandatory for commercial stages
    if (["commercial_pilot", "limited_launch", "scaled_launch"].includes(targetStage) && (assessment.paymentScore ?? 0) < 60) {
      blockers.push(`Payment score (${assessment.paymentScore}) must be ≥ 60 for '${targetStage}'`);
    }

    // Legal documents must be active
    if (["limited_launch", "scaled_launch"].includes(targetStage)) {
      blockers.push("Verify active legal documents (terms, privacy, responsible-use) for this market before advancing.");
    }

    return { canAdvance: blockers.length === 0, blockers };
  }

  /** Validate a market-specific plan price. All amounts must be in minor units. */
  static validateMarketPrice(price: Partial<MarketPlanPrice>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!price.planKey) errors.push("planKey is required");
    if (price.priceMinor === undefined || price.priceMinor < 0) errors.push("priceMinor must be a non-negative integer");
    if (typeof price.priceMinor === "number" && !Number.isInteger(price.priceMinor)) errors.push("priceMinor must be an integer (minor units only — no decimals)");
    if (!price.currencyCode || price.currencyCode.length !== 3) errors.push("currencyCode must be a 3-letter ISO 4217 code");
    if (!price.pricingVersion) errors.push("pricingVersion is required for audit trail");
    return { valid: errors.length === 0, errors };
  }

  /** Format a minor-unit amount for a given currency (no floating-point). */
  static formatMinorAmount(amountMinor: number, currencyCode: string): string {
    const minorDigits: Record<string, number> = {
      KES: 2, UGX: 0, TZS: 0, RWF: 0, XOF: 0, USD: 2, EUR: 2, GBP: 2, ZAR: 2,
    };
    const digits = minorDigits[currencyCode] ?? 2;
    const major = amountMinor / Math.pow(10, digits);
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode, minimumFractionDigits: digits }).format(major);
  }

  /** Verify that a legal document is in 'active' state before a market launch. */
  static isLegalDocumentReady(doc: MarketLegalDocument): boolean {
    return doc.approvalStatus === "active" && !!doc.approvedBy && !!doc.effectiveDate;
  }

  /** Return a safe list of supported markets (active only, for UI consumption). */
  static getActiveMarkets(configs: MarketConfiguration[]): MarketConfiguration[] {
    return configs.filter(m => m.isActive);
  }
}
