/**
 * Marketplace Seller Service — Phase 14
 *
 * Controls seller application review, risk scoring, verification
 * and profile management.
 *
 * Prohibited use detection is enforced before any approval.
 * Payout profile destinations are never stored in plaintext.
 */

export type SellerType =
  | "verified_analyst" | "sports_writer" | "data_analyst" | "creator"
  | "publisher" | "media_house" | "data_provider"
  | "ballmtaani_internal" | "enterprise_partner";

export type SellerApplicationStatus =
  | "draft" | "submitted" | "automated_review" | "manual_review"
  | "approved" | "rejected" | "suspended" | "terminated";

export type VerificationLevel =
  | "none" | "email_verified" | "identity_verified"
  | "organization_verified" | "payout_verified" | "fully_verified";

export interface SellerApplicationInput {
  userId: string;
  partnerId?: string;
  sellerType: SellerType;
  displayName: string;
  biography?: string;
  intendedProducts: string[];
  experience?: string;
  website?: string;
  socialLinks?: Record<string, string>;
}

export interface SellerRiskScore {
  total: number;          // 0–100
  outcome: "auto_approve" | "manual_review" | "reject";
  components: Record<string, number>;
  warnings: string[];
}

export interface SellerApplicationReview {
  applicationId: string;
  autoDecision: "auto_approve" | "manual_review" | "reject";
  riskScore: SellerRiskScore;
  verificationRequired: VerificationLevel[];
  prohibitedClaimsFound: string[];
  requiresManualReview: boolean;
}

// Base risk per seller type
const SELLER_TYPE_BASE_RISK: Record<SellerType, number> = {
  ballmtaani_internal:  0,
  enterprise_partner:   5,
  publisher:           10,
  media_house:         10,
  data_provider:       15,
  verified_analyst:    15,
  sports_writer:       20,
  data_analyst:        20,
  creator:             25,
};

// Phrases that immediately trigger rejection
const PROHIBITED_SELLER_PHRASES = [
  "guaranteed tips", "guaranteed wins", "sure bet",
  "fixed match", "fixed matches", "insider tips",
  "100% accurate", "never loses", "loss recovery",
  "automated betting", "betting system", "stake placement",
  "bankroll management", "private bookmaker",
];

// Verification requirements per seller type
const VERIFICATION_REQUIREMENTS: Record<SellerType, VerificationLevel[]> = {
  creator:            ["email_verified"],
  sports_writer:      ["email_verified", "identity_verified"],
  data_analyst:       ["email_verified", "identity_verified"],
  verified_analyst:   ["email_verified", "identity_verified", "payout_verified"],
  publisher:          ["email_verified", "organization_verified", "payout_verified"],
  media_house:        ["email_verified", "organization_verified", "payout_verified"],
  data_provider:      ["email_verified", "organization_verified", "payout_verified"],
  enterprise_partner: ["email_verified", "organization_verified", "payout_verified"],
  ballmtaani_internal:["email_verified"],
};

export class MarketplaceSellerService {
  /** Score a seller application for automated risk review. */
  static scoreApplication(input: SellerApplicationInput): SellerRiskScore {
    const warnings: string[] = [];
    const components: Record<string, number> = {};

    // Base risk from seller type
    components.type_risk = SELLER_TYPE_BASE_RISK[input.sellerType];

    // Prohibited phrase check (score → 100 = auto-reject)
    const prohibitedFound = this.detectProhibitedPhrases([
      input.biography ?? "",
      input.experience ?? "",
      ...(input.intendedProducts ?? []),
    ].join(" "));

    if (prohibitedFound.length > 0) {
      components.prohibited_phrases = 100;
      warnings.push(...prohibitedFound.map(p => `Prohibited phrase: "${p}"`));
      return { total: 100, outcome: "reject", components, warnings };
    }

    // Website domain check
    components.website_risk = 0;
    if (input.website) {
      if (["localhost", "127.0.0.1"].some(s => input.website!.includes(s))) {
        components.website_risk = 20;
        warnings.push("Website appears to be localhost — likely not production.");
      }
    } else {
      components.website_risk = 10; // higher risk without website
    }

    // No social links for a public-facing seller is a flag
    const socialLinkCount = Object.keys(input.socialLinks ?? {}).length;
    components.social_links_risk = socialLinkCount === 0 ? 10 : 0;

    // Experience field absent
    components.experience_risk = (!input.experience || input.experience.trim().length < 20) ? 10 : 0;

    // Biography too short
    components.biography_risk = (!input.biography || input.biography.trim().length < 50) ? 5 : 0;

    // Total
    const total = Math.min(100, Object.values(components).reduce((a, b) => a + b, 0));

    let outcome: SellerRiskScore["outcome"];
    if (total <= 20) outcome = "auto_approve";
    else if (total <= 60) outcome = "manual_review";
    else outcome = "reject";

    return { total, outcome, components, warnings };
  }

  /** Detect prohibited phrases in combined application text. */
  static detectProhibitedPhrases(text: string): string[] {
    const lower = text.toLowerCase();
    return PROHIBITED_SELLER_PHRASES.filter(p => lower.includes(p));
  }

  /** Return which verification levels are still required. */
  static getMissingVerifications(
    sellerType: SellerType,
    completed: VerificationLevel[]
  ): VerificationLevel[] {
    const required = VERIFICATION_REQUIREMENTS[sellerType] ?? [];
    return required.filter(r => !completed.includes(r));
  }

  /** Full automated review of a new seller application. */
  static reviewApplication(
    applicationId: string,
    input: SellerApplicationInput,
    completedVerifications: VerificationLevel[]
  ): SellerApplicationReview {
    const riskScore = this.scoreApplication(input);
    const prohibitedClaimsFound = this.detectProhibitedPhrases([
      input.biography ?? "", input.experience ?? "",
      ...(input.intendedProducts ?? []),
    ].join(" "));
    const missing = this.getMissingVerifications(input.sellerType, completedVerifications);

    // Must have manual review if:
    // - Risk score > 20
    // - Missing required verifications
    // - Enterprise/publisher/data_provider type (always manual)
    const alwaysManual: SellerType[] = ["enterprise_partner", "data_provider", "media_house"];
    const requiresManualReview =
      riskScore.outcome !== "auto_approve" ||
      missing.length > 0 ||
      alwaysManual.includes(input.sellerType);

    return {
      applicationId,
      autoDecision: riskScore.outcome,
      riskScore,
      verificationRequired: missing,
      prohibitedClaimsFound,
      requiresManualReview,
    };
  }

  /** Generate a public-safe seller slug from display name. */
  static generateSlug(displayName: string, userId: string): string {
    const base = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const suffix = userId.slice(0, 6);
    return `${base}-${suffix}`;
  }

  /** Validate a payout destination — only accepts opaque vault reference (never raw account). */
  static validatePayoutProfile(params: {
    payoutMethod: string;
    destinationReference: string;
    currency: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const VALID_METHODS = ["mpesa", "bank_transfer", "partner_account", "manual"];
    if (!VALID_METHODS.includes(params.payoutMethod)) {
      errors.push(`Invalid payout method: ${params.payoutMethod}.`);
    }

    // Destination reference must be an opaque vault key, not a raw phone/account number
    if (/^\+?[0-9]{8,15}$/.test(params.destinationReference)) {
      errors.push("Destination reference must be an opaque vault key, not a raw phone number. Pass the vault reference.");
    }
    if (params.destinationReference.length < 8) {
      errors.push("Destination reference too short to be a valid vault reference.");
    }

    const VALID_CURRENCIES = ["KES", "TZS", "UGX", "USD", "ZAR", "NGN"];
    if (!VALID_CURRENCIES.includes(params.currency)) {
      errors.push(`Unsupported payout currency: ${params.currency}.`);
    }

    return { valid: errors.length === 0, errors };
  }

  /** Check whether a seller is eligible to have earnings made payable. */
  static isPayoutEligible(params: {
    verificationLevel: VerificationLevel;
    payoutProfileVerified: boolean;
    pendingDisputeCount: number;
    availableEarningsMinor: number;
    minimumPayoutMinor: number;
    refundPeriodsPassed: boolean;
  }): { eligible: boolean; blockers: string[] } {
    const blockers: string[] = [];

    if (params.verificationLevel !== "fully_verified" && params.verificationLevel !== "payout_verified") {
      blockers.push("Seller payout verification not complete.");
    }
    if (!params.payoutProfileVerified) {
      blockers.push("Payout profile destination not verified.");
    }
    if (params.pendingDisputeCount > 0) {
      blockers.push(`${params.pendingDisputeCount} open dispute(s) must be resolved before payout.`);
    }
    if (!params.refundPeriodsPassed) {
      blockers.push("Refund window has not passed for all earnings in this payout.");
    }
    if (params.availableEarningsMinor < params.minimumPayoutMinor) {
      blockers.push(`Available earnings (${params.availableEarningsMinor}) below minimum payout threshold (${params.minimumPayoutMinor}).`);
    }

    return { eligible: blockers.length === 0, blockers };
  }
}
