/**
 * BallMtaani Edge Phase 4 — Model Acceptance Gates & Evaluation Decision Engine
 * Automatically evaluates whether a model passes statistical reliability, calibration, data integrity, and benchmark superiority gates.
 */

export interface ModelAcceptanceInput {
  modelKey: string;
  modelVersion: string;
  brierScore: number;
  logLoss: number;
  expectedCalibrationError: number;
  leakageStatus: "passed" | "failed";
  sampleSize: number;
  uniformBrierBenchmark?: number; // 0.6667
}

export type EvaluationDecision = "accepted_for_beta" | "accepted_with_limits" | "needs_recalibration" | "rejected";

export interface EvaluationDecisionResult {
  decision: EvaluationDecision;
  decisionReason: string;
  gatesPassed: string[];
  gatesFailed: string[];
}

export function evaluateModelAcceptanceGates(input: ModelAcceptanceInput): EvaluationDecisionResult {
  const gatesPassed: string[] = [];
  const gatesFailed: string[] = [];
  const uniformBenchmark = input.uniformBrierBenchmark || 0.6667;

  // 1. Data Integrity Gate
  if (input.leakageStatus === "passed") {
    gatesPassed.push("Data Integrity Gate: Zero point-in-time data leakage detected.");
  } else {
    gatesFailed.push("Data Integrity Gate: Data leakage detected in historical features.");
  }

  // 2. Statistical Superiority Gate
  if (input.brierScore < uniformBenchmark - 0.05) {
    gatesPassed.push(`Statistical Superiority Gate: Brier score (${input.brierScore}) is significantly superior to uniform benchmark (${uniformBenchmark}).`);
  } else {
    gatesFailed.push(`Statistical Superiority Gate: Brier score (${input.brierScore}) failed to beat uniform benchmark (${uniformBenchmark}).`);
  }

  // 3. Calibration Accuracy Gate
  if (input.expectedCalibrationError <= 0.08) {
    gatesPassed.push(`Calibration Gate: Expected Calibration Error (${input.expectedCalibrationError}) meets requirement (<= 0.08).`);
  } else {
    gatesFailed.push(`Calibration Gate: Expected Calibration Error (${input.expectedCalibrationError}) exceeds 0.08 threshold.`);
  }

  // 4. Sample Size Gate
  if (input.sampleSize >= 50) {
    gatesPassed.push(`Sample Size Gate: Fixture sample size (${input.sampleSize}) meets minimum evaluation requirement (>= 50).`);
  } else {
    gatesFailed.push(`Sample Size Gate: Fixture sample size (${input.sampleSize}) is insufficient (< 50).`);
  }

  let decision: EvaluationDecision = "rejected";
  let decisionReason = "";

  if (gatesFailed.length === 0) {
    decision = "accepted_for_beta";
    decisionReason = "Model satisfies all data integrity, statistical superiority, calibration accuracy, and sample size gates.";
  } else if (gatesFailed.length === 1 && gatesFailed[0].includes("Calibration Gate")) {
    decision = "needs_recalibration";
    decisionReason = "Model demonstrates statistical superiority but requires probability recalibration (Isotonic scaling).";
  } else if (gatesFailed.length === 1 && gatesFailed[0].includes("Sample Size")) {
    decision = "accepted_with_limits";
    decisionReason = "Model passed statistical gates but evaluation sample size is limited. Accepted for Beta with restricted competition scope.";
  } else {
    decision = "rejected";
    decisionReason = `Model rejected due to gate failures: ${gatesFailed.join(" | ")}`;
  }

  return {
    decision,
    decisionReason,
    gatesPassed,
    gatesFailed,
  };
}
