/**
 * Sport Onboarding Service — Phase 14
 *
 * Enforces the 15-stage onboarding workflow for every new sport.
 * No sport may reach public_beta without completing all mandatory gates.
 * Football-specific model artefacts are blocked from cross-sport reuse.
 */

import { FOOTBALL_ONLY_FEATURES } from "./sport-opportunity-service";

export type OnboardingStatus =
  | "discovered" | "research" | "data_contract_review" | "historical_import"
  | "identity_modelling" | "feature_design" | "baseline_model"
  | "walk_forward_backtest" | "calibration" | "internal_shadow"
  | "internal_beta" | "public_beta" | "supported" | "paused"
  | "rejected" | "retired";

export interface OnboardingGate {
  stage: OnboardingStatus;
  label: string;
  mandatory: boolean;
  prerequisite?: OnboardingStatus;
  checks: string[];
}

export interface OnboardingWorkflow {
  sportId: string;
  sportKey: string;
  currentStatus: OnboardingStatus;
  historicalSeasonsImported: number;
  baselineModelKey: string | null;
  backtestRunAt: string | null;
  calibrationRunAt: string | null;
  performanceLedgerUrl: string | null;
  blockingIssues: string[];
}

export interface GateCheckResult {
  gate: OnboardingStatus;
  passed: boolean;
  failures: string[];
  warnings: string[];
}

export interface ModelValidationResult {
  sportKey: string;
  modelType: string;
  targetOutcome: string;
  beatsBaseline: boolean;
  baselineType: string;
  valBrierScore: number;
  valLogLoss: number;
  valCalibrationSlope: number;
  calibrationAcceptable: boolean;
  sampleSize: number;
  footballFeaturesUsed: string[]; // must be empty for non-football
  isValidForSport: boolean;
  blockers: string[];
}

// Ordered stage sequence — stages cannot be skipped forward
const STAGE_SEQUENCE: OnboardingStatus[] = [
  "discovered", "research", "data_contract_review", "historical_import",
  "identity_modelling", "feature_design", "baseline_model",
  "walk_forward_backtest", "calibration", "internal_shadow",
  "internal_beta", "public_beta", "supported",
];

// Gate definitions with mandatory checks per stage
const GATE_DEFINITIONS: OnboardingGate[] = [
  { stage: "research",            label: "Research",              mandatory: true,  checks: ["sport_rules_documented", "target_outcome_defined", "data_sources_identified"] },
  { stage: "data_contract_review",label: "Data Contract Review",  mandatory: true,  checks: ["data_licence_reviewed", "display_rights_confirmed", "derived_data_rights_confirmed"] },
  { stage: "historical_import",   label: "Historical Import",     mandatory: true,  checks: ["min_3_seasons_imported", "event_timestamps_quality_passed", "participant_data_complete"] },
  { stage: "identity_modelling",  label: "Identity Modelling",    mandatory: true,  checks: ["sport_neutral_entities_mapped", "no_football_terms_reused"] },
  { stage: "feature_design",      label: "Feature Design",        mandatory: true,  checks: ["sport_specific_features_defined", "no_football_only_features_included"] },
  { stage: "baseline_model",      label: "Baseline Model",        mandatory: true,  checks: ["baseline_type_documented", "baseline_performance_recorded"] },
  { stage: "walk_forward_backtest",label: "Walk-Forward Backtest",mandatory: true,  checks: ["chronological_split_confirmed", "no_future_data_leakage", "min_200_events_tested"] },
  { stage: "calibration",         label: "Calibration",           mandatory: true,  checks: ["calibration_curve_computed", "calibration_slope_acceptable", "model_beats_baseline"] },
  { stage: "internal_shadow",     label: "Internal Shadow",       mandatory: true,  checks: ["predictions_generated_without_publishing", "sanity_checks_passed"] },
  { stage: "internal_beta",       label: "Internal Beta",         mandatory: true,  checks: ["performance_ledger_live", "sport_team_reviewed"] },
  { stage: "public_beta",         label: "Public Beta",           mandatory: true,  checks: ["product_review_complete", "commercial_review_complete", "licensing_review_complete", "disclaimer_configured"] },
];

// Football-specific model types that must not be used for other sports
const FOOTBALL_ONLY_MODEL_TYPES = ["dixon_coles", "both_teams_to_score_model", "xg_model"];

// Calibration slope acceptable range (0.8–1.2 indicates good calibration)
const CALIBRATION_SLOPE_MIN = 0.8;
const CALIBRATION_SLOPE_MAX = 1.2;

// Minimum sample sizes per sport
const MIN_SAMPLE_SIZES: Record<string, number> = {
  basketball: 300, rugby: 200, cricket: 150,
  tennis: 400, athletics: 200, default: 200,
};

export class SportOnboardingService {
  /** Get the gate definition for a specific stage. */
  static getGate(stage: OnboardingStatus): OnboardingGate | undefined {
    return GATE_DEFINITIONS.find(g => g.stage === stage);
  }

  /** Validate stage advance — no skipping allowed. */
  static validateStageAdvance(
    workflow: OnboardingWorkflow,
    targetStage: OnboardingStatus,
    approver: string
  ): { valid: boolean; error?: string } {
    if (!approver || approver.trim() === "") {
      return { valid: false, error: "Approver is required for every stage advance." };
    }

    const terminal: OnboardingStatus[] = ["paused", "rejected", "retired"];
    if (terminal.includes(targetStage)) return { valid: true }; // terminal transitions always valid

    const currentIdx = STAGE_SEQUENCE.indexOf(workflow.currentStatus);
    const targetIdx  = STAGE_SEQUENCE.indexOf(targetStage);
    if (currentIdx === -1) return { valid: false, error: `Unknown current stage: ${workflow.currentStatus}` };
    if (targetIdx  === -1) return { valid: false, error: `Unknown target stage: ${targetStage}` };
    if (targetIdx > currentIdx + 1) {
      return { valid: false, error: `Cannot skip from '${workflow.currentStatus}' to '${targetStage}'. Must advance through '${STAGE_SEQUENCE[currentIdx + 1]}'.` };
    }
    return { valid: true };
  }

  /** Check whether a workflow can advance to the next stage. */
  static checkGate(workflow: OnboardingWorkflow, targetStage: OnboardingStatus): GateCheckResult {
    const gate = GATE_DEFINITIONS.find(g => g.stage === targetStage);
    const failures: string[] = [];
    const warnings: string[] = [];

    if (!gate) {
      return { gate: targetStage, passed: true, failures: [], warnings: [] };
    }

    // Stage-specific checks
    switch (targetStage) {
      case "historical_import":
        if (workflow.historicalSeasonsImported < 3) {
          failures.push(`Only ${workflow.historicalSeasonsImported} seasons imported. Minimum: 3.`);
        }
        break;

      case "baseline_model":
        if (!workflow.baselineModelKey) {
          failures.push("Baseline model key not recorded.");
        }
        break;

      case "walk_forward_backtest":
        if (!workflow.backtestRunAt) {
          failures.push("Backtest has not been run.");
        }
        break;

      case "calibration":
        if (!workflow.calibrationRunAt) {
          failures.push("Calibration has not been run.");
        }
        break;

      case "public_beta":
        if (!workflow.performanceLedgerUrl) {
          failures.push("Public beta performance ledger URL not configured.");
        }
        if (workflow.blockingIssues.length > 0) {
          failures.push(...workflow.blockingIssues.map(i => `Blocking issue: ${i}`));
        }
        break;
    }

    if (workflow.blockingIssues.length > 0 && targetStage !== "public_beta") {
      warnings.push(`${workflow.blockingIssues.length} open blocking issue(s).`);
    }

    return { gate: targetStage, passed: failures.length === 0, failures, warnings };
  }

  /** Validate a sport-specific model — enforce no football feature reuse. */
  static validateModel(params: {
    sportKey: string;
    modelType: string;
    targetOutcome: string;
    features: string[];
    valBrierScore: number;
    valLogLoss: number;
    valCalibrationSlope: number;
    sampleSize: number;
    baselineMetric: { brierScore: number; logLoss: number };
  }): ModelValidationResult {
    const blockers: string[] = [];

    // Block football-only model types for non-football sports
    if (params.sportKey !== "football" && FOOTBALL_ONLY_MODEL_TYPES.includes(params.modelType)) {
      blockers.push(`Model type '${params.modelType}' is football-only and cannot be used for ${params.sportKey}.`);
    }

    // Block football-only features for non-football sports
    const footballFeaturesUsed = params.sportKey !== "football"
      ? params.features.filter((f: string) => FOOTBALL_ONLY_FEATURES.includes(f))
      : [];
    if (footballFeaturesUsed.length > 0) {
      blockers.push(`Football-only features detected in ${params.sportKey} model: ${footballFeaturesUsed.join(", ")}.`);
    }

    // Sample size check
    const minSample = MIN_SAMPLE_SIZES[params.sportKey] ?? MIN_SAMPLE_SIZES.default;
    if (params.sampleSize < minSample) {
      blockers.push(`Backtest sample size (${params.sampleSize}) below minimum (${minSample}) for ${params.sportKey}.`);
    }

    // Calibration check
    const calibrationAcceptable =
      params.valCalibrationSlope >= CALIBRATION_SLOPE_MIN &&
      params.valCalibrationSlope <= CALIBRATION_SLOPE_MAX;
    if (!calibrationAcceptable) {
      blockers.push(`Calibration slope ${params.valCalibrationSlope.toFixed(3)} outside acceptable range [${CALIBRATION_SLOPE_MIN}, ${CALIBRATION_SLOPE_MAX}].`);
    }

    // Beats baseline
    const beatsBaseline =
      params.valBrierScore < params.baselineMetric.brierScore &&
      params.valLogLoss < params.baselineMetric.logLoss;
    if (!beatsBaseline) {
      blockers.push("Model does not beat the simple baseline on both Brier score and log loss. Do not release.");
    }

    return {
      sportKey: params.sportKey,
      modelType: params.modelType,
      targetOutcome: params.targetOutcome,
      beatsBaseline,
      baselineType: "historical_rate",
      valBrierScore: params.valBrierScore,
      valLogLoss: params.valLogLoss,
      valCalibrationSlope: params.valCalibrationSlope,
      calibrationAcceptable,
      sampleSize: params.sampleSize,
      footballFeaturesUsed,
      isValidForSport: blockers.length === 0,
      blockers,
    };
  }

  /** Return all mandatory stage gates in sequence. */
  static getMandatoryGates(): OnboardingGate[] {
    return GATE_DEFINITIONS.filter(g => g.mandatory);
  }

  /** Compute progress as a percentage through the mandatory stages. */
  static computeProgress(currentStatus: OnboardingStatus): number {
    const idx = STAGE_SEQUENCE.indexOf(currentStatus);
    if (idx === -1) return 0;
    return Math.round((idx / (STAGE_SEQUENCE.length - 1)) * 100);
  }
}
