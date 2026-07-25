/**
 * Partner Application Service — Phase 13
 *
 * Manages the full self-service partner onboarding workflow:
 * registration → verification → risk scoring → approval → provisioning.
 * Does not grant production API access before verification passes.
 */

export type PartnerType =
  | "creator" | "publisher" | "developer" | "small_media"
  | "telecom" | "enterprise" | "white_label";

export type ApplicationStatus =
  | "draft" | "submitted" | "automated_review" | "manual_review"
  | "approved" | "rejected" | "withdrawn" | "expired";

export type VerificationLevel =
  | "none" | "email_verified" | "identity_review"
  | "organization_verified" | "domain_verified"
  | "payment_verified" | "contract_verified" | "enhanced_review";

export type RiskOutcome =
  | "auto_approve" | "limited_trial" | "manual_review"
  | "reject" | "enhanced_verification";

export interface PartnerApplication {
  id: string;
  applicantUserId: string;
  requestedPartnerType: PartnerType;
  organizationName: string;
  market: string;
  website?: string;
  intendedUse: string;
  expectedUsage?: string;
  status: ApplicationStatus;
  verificationLevel: VerificationLevel;
  riskScore: number; // 0–100 (lower is safer)
  riskOutcome: RiskOutcome;
  reviewRequired: boolean;
}

export interface RiskScoringInput {
  partnerType: PartnerType;
  market: string;
  requestedScopes: string[];
  expectedMonthlyRequests: number;
  websiteProvided: boolean;
  paymentVerified: boolean;
  priorAccountHistory: "none" | "clean" | "issues";
  intendedUseCategories: string[];
  fraudSignals: number; // 0-10
  complianceRisk: "low" | "medium" | "high";
}

export interface RiskScoringResult {
  score: number;
  outcome: RiskOutcome;
  factors: string[];
  warnings: string[];
}

// Required verification levels per partner type
const REQUIRED_VERIFICATION: Record<PartnerType, VerificationLevel[]> = {
  creator:     ["email_verified"],
  publisher:   ["email_verified", "domain_verified", "organization_verified"],
  developer:   ["email_verified", "payment_verified"],
  small_media: ["email_verified", "organization_verified", "domain_verified", "payment_verified"],
  telecom:     ["email_verified", "organization_verified", "payment_verified", "contract_verified"],
  enterprise:  ["email_verified", "organization_verified", "payment_verified", "contract_verified"],
  white_label: ["email_verified", "organization_verified", "payment_verified", "contract_verified", "enhanced_review"],
};

// Scopes that require manual approval regardless of partner type
const PREMIUM_SCOPES = ["lineup_revisions", "odds_movement", "raw_model_probabilities", "bulk_export", "white_label_api"];

// Markets that require enhanced compliance check (not rejection based on geography alone)
const ENHANCED_COMPLIANCE_MARKETS = ["SO", "SD", "LY", "SS"]; // high-risk by sanctions, not geography alone

export class PartnerApplicationService {
  /** Calculate a risk score and outcome for a new application. */
  static scoreRisk(input: RiskScoringInput): RiskScoringResult {
    let score = 0;
    const factors: string[] = [];
    const warnings: string[] = [];

    // Partner type base risk
    const typeRisk: Record<PartnerType, number> = {
      creator: 10, publisher: 15, developer: 20, small_media: 15,
      telecom: 35, enterprise: 30, white_label: 45,
    };
    score += typeRisk[input.partnerType];
    factors.push(`partner_type:${input.partnerType} (+${typeRisk[input.partnerType]})`);

    // Premium scope requests
    const premiumRequested = input.requestedScopes.filter(s => PREMIUM_SCOPES.includes(s));
    if (premiumRequested.length > 0) {
      score += premiumRequested.length * 10;
      factors.push(`premium_scopes:${premiumRequested.join(",")} (+${premiumRequested.length * 10})`);
    }

    // Expected usage volume
    if (input.expectedMonthlyRequests > 1_000_000) { score += 20; factors.push("high_volume_api (+20)"); }
    else if (input.expectedMonthlyRequests > 100_000) { score += 10; factors.push("medium_volume_api (+10)"); }

    // Verification state
    if (!input.websiteProvided) { score += 10; warnings.push("no_website_provided"); }
    if (!input.paymentVerified) { score += 5; factors.push("payment_unverified (+5)"); }

    // Account history
    if (input.priorAccountHistory === "issues") { score += 25; factors.push("prior_account_issues (+25)"); }
    else if (input.priorAccountHistory === "clean") { score -= 5; factors.push("clean_history (-5)"); }

    // Fraud signals
    if (input.fraudSignals > 0) {
      score += input.fraudSignals * 5;
      factors.push(`fraud_signals:${input.fraudSignals} (+${input.fraudSignals * 5})`);
    }

    // Compliance risk
    if (input.complianceRisk === "high") { score += 20; factors.push("compliance_risk:high (+20)"); }
    else if (input.complianceRisk === "medium") { score += 10; factors.push("compliance_risk:medium (+10)"); }

    // Enhanced compliance markets (not automatic rejection)
    if (ENHANCED_COMPLIANCE_MARKETS.includes(input.market)) {
      score += 15;
      warnings.push(`market_${input.market}_requires_enhanced_review`);
    }

    // Prohibited intended use check
    const prohibitedTerms = ["betting operator", "stake placement", "sure bet", "guaranteed wins", "loss recovery"];
    const intendedUseLower = input.intendedUseCategories.join(" ").toLowerCase();
    for (const term of prohibitedTerms) {
      if (intendedUseLower.includes(term)) {
        score = 100; // automatic rejection floor
        warnings.push(`prohibited_use_claim:${term}`);
      }
    }

    score = Math.min(100, Math.max(0, score));

    let outcome: RiskOutcome;
    if (score <= 20)      outcome = "auto_approve";
    else if (score <= 40) outcome = "limited_trial";
    else if (score <= 65) outcome = "manual_review";
    else if (score <= 85) outcome = "enhanced_verification";
    else                  outcome = "reject";

    return { score, outcome, factors, warnings };
  }

  /** Validate that the minimum verification requirements are met for a partner type. */
  static checkVerificationRequirements(
    partnerType: PartnerType,
    achieved: VerificationLevel[]
  ): { satisfied: boolean; missing: VerificationLevel[] } {
    const required = REQUIRED_VERIFICATION[partnerType];
    const achievedSet = new Set(achieved);
    const missing = required.filter(r => !achievedSet.has(r));
    return { satisfied: missing.length === 0, missing };
  }

  /** Check if a premium scope request requires manual approval. */
  static requiresManualApprovalForScopes(scopes: string[]): boolean {
    return scopes.some(s => PREMIUM_SCOPES.includes(s));
  }

  /** Simulate the automated review decision for a submitted application. */
  static runAutomatedReview(application: Partial<PartnerApplication> & { riskScore: number; riskOutcome: RiskOutcome }): {
    nextStatus: ApplicationStatus;
    requiresManualReview: boolean;
    provisioningAllowed: boolean;
    trialOnly: boolean;
    notes: string;
  } {
    switch (application.riskOutcome) {
      case "auto_approve":
        return { nextStatus: "approved", requiresManualReview: false, provisioningAllowed: true, trialOnly: false, notes: "Automated approval: risk score below threshold." };
      case "limited_trial":
        return { nextStatus: "approved", requiresManualReview: false, provisioningAllowed: true, trialOnly: true, notes: "Limited trial granted. Manual review required for full access." };
      case "manual_review":
        return { nextStatus: "manual_review", requiresManualReview: true, provisioningAllowed: false, trialOnly: false, notes: "Flagged for manual review. No access until reviewed." };
      case "enhanced_verification":
        return { nextStatus: "manual_review", requiresManualReview: true, provisioningAllowed: false, trialOnly: false, notes: "Enhanced verification required before any access." };
      case "reject":
        return { nextStatus: "rejected", requiresManualReview: false, provisioningAllowed: false, trialOnly: false, notes: "Automated rejection: score or prohibited use claim." };
    }
  }
}
