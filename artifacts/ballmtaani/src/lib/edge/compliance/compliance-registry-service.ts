/**
 * BallMtaani Edge Phase 11 — Compliance Registry & Responsible Copy Validator
 */

const PROHIBITED_MARKETING_CLAIMS = [
  "guaranteed win",
  "sure bet",
  "fixed match",
  "win every day",
  "cannot lose",
  "risk-free",
  "secret formula",
  "recover losses",
];

export interface CopyValidationResult {
  isCompliant: boolean;
  prohibitedMatchesFound: string[];
  recommendation: string;
}

export class ComplianceRegistryService {
  static validateMarketingCopy(text: string): CopyValidationResult {
    const lower = text.toLowerCase();
    const matchesFound = PROHIBITED_MARKETING_CLAIMS.filter((claim) => lower.includes(claim));

    if (matchesFound.length > 0) {
      return {
        isCompliant: false,
        prohibitedMatchesFound: matchesFound,
        recommendation: `REJECTED: Contains prohibited claims (${matchesFound.join(", ")}). Must emphasize probability and uncertainty instead.`,
      };
    }

    return {
      isCompliant: true,
      prohibitedMatchesFound: [],
      recommendation: "APPROVED: Marketing copy complies with responsible-use standards.",
    };
  }

  static getActiveLegalDocuments(): Array<{ title: string; version: string; key: string }> {
    return [
      { title: "BallMtaani Edge Terms of Service", version: "v1.0", key: "terms_of_service" },
      { title: "Privacy & Data Protection Policy", version: "v1.0", key: "privacy_policy" },
      { title: "Responsible Prediction Use Disclaimer", version: "v1.0", key: "responsible_use_policy" },
    ];
  }
}
