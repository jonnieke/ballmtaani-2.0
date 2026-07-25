/**
 * BallMtaani Edge Phase 4 — Data Leakage Validator
 * Strictly validates that no future results or post-kickoff statistics are present in historical features.
 */

export interface LeakageCheckInput {
  fixtureKickoff: string;
  predictionCutoff: string;
  featureTimestamp: string;
  trainingCutoff: string;
  hasPostMatchStatsInPayload?: boolean;
}

export interface LeakageValidationResult {
  isValid: boolean;
  leakageStatus: "passed" | "failed";
  violations: string[];
}

export function validateHistoricalDataLeakage(input: LeakageCheckInput): LeakageValidationResult {
  const violations: string[] = [];

  const kickoffTime = new Date(input.fixtureKickoff).getTime();
  const cutoffTime = new Date(input.predictionCutoff).getTime();
  const featureTime = new Date(input.featureTimestamp).getTime();
  const trainTime = new Date(input.trainingCutoff).getTime();

  // 1. Prediction Cutoff must precede Kickoff
  if (cutoffTime >= kickoffTime) {
    violations.push(`Prediction cutoff timestamp (${input.predictionCutoff}) is not prior to fixture kickoff (${input.fixtureKickoff}).`);
  }

  // 2. Feature timestamp must not exceed Prediction Cutoff
  if (featureTime > cutoffTime) {
    violations.push(`Feature generation timestamp (${input.featureTimestamp}) exceeds prediction cutoff (${input.predictionCutoff}).`);
  }

  // 3. Training cutoff must not exceed Prediction Cutoff
  if (trainTime > cutoffTime) {
    violations.push(`Model training cutoff (${input.trainingCutoff}) exceeds prediction cutoff (${input.predictionCutoff}).`);
  }

  // 4. Check for explicit post-match data flags
  if (input.hasPostMatchStatsInPayload) {
    violations.push("Payload contains post-match statistics or final match score lines.");
  }

  const isValid = violations.length === 0;

  return {
    isValid,
    leakageStatus: isValid ? "passed" : "failed",
    violations,
  };
}
