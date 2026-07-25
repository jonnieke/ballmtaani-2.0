/**
 * BallMtaani Edge Phase 9 — African Competition Onboarding & Readiness Engine
 * Evaluates whether a new African league (e.g. Botola Pro, South African Premier Division) is statistically ready for Edge model predictions.
 */

export interface CompetitionReadinessInput {
  competitionName: string;
  country: string;
  seasonsAvailable: number; // e.g. 3 seasons
  dataQualityAvg: number; // 0-100 avg data quality score
  walkForwardBrierScore: number; // e.g. 0.4850
  walkForwardLogLoss: number; // e.g. 0.8200
  hasLicensingApproval: boolean;
}

export interface CompetitionReadinessResult {
  competitionName: string;
  readinessScore: number; // 0-100 score
  status: "supported" | "public_beta" | "internal_beta" | "rejected";
  recommendation: string;
}

export function evaluateCompetitionReadiness(input: CompetitionReadinessInput): CompetitionReadinessResult {
  let score = 0;

  // 1. Data History Component (Max 25 pts)
  if (input.seasonsAvailable >= 3) score += 25;
  else if (input.seasonsAvailable === 2) score += 15;
  else if (input.seasonsAvailable === 1) score += 5;

  // 2. Data Quality Component (Max 25 pts)
  score += Math.round((input.dataQualityAvg / 100) * 25);

  // 3. Walk-Forward Brier Score Component (Max 35 pts)
  if (input.walkForwardBrierScore <= 0.4900) score += 35;
  else if (input.walkForwardBrierScore <= 0.5200) score += 20;
  else score += 5;

  // 4. Licensing & Commercial Approval Component (Max 15 pts)
  if (input.hasLicensingApproval) score += 15;

  let status: CompetitionReadinessResult["status"] = "rejected";
  let recommendation = "Insufficient historical depth or model calibration for public predictions.";

  if (score >= 85) {
    status = "supported";
    recommendation = "Approved for full production publication and premium entitlements.";
  } else if (score >= 70) {
    status = "public_beta";
    recommendation = "Approved for public beta preview with confidence warnings.";
  } else if (score >= 55) {
    status = "internal_beta";
    recommendation = "Approved for internal sandbox testing only.";
  }

  return {
    competitionName: input.competitionName,
    readinessScore: score,
    status,
    recommendation,
  };
}
