/**
 * BallMtaani Edge Phase 7 — Deterministic Materiality Scoring Engine
 * Evaluates whether an event is materially significant (0-100 score) for subscriber alerts.
 */

export interface MaterialityEvaluationInput {
  eventType: "prediction_published" | "prediction_revised" | "lineup_confirmed" | "lineup_impact" | "odds_movement" | "kickoff_reminder";
  previousHomeProb?: number;
  newHomeProb?: number;
  previousOutcome?: "HOME" | "DRAW" | "AWAY";
  newOutcome?: "HOME" | "DRAW" | "AWAY";
  confidenceChanged?: boolean;
  absentStartersCount?: number;
  oddsPercentageChange?: number;
}

export function calculateMaterialityScore(input: MaterialityEvaluationInput): number {
  let score = 0;

  if (input.eventType === "prediction_published") {
    return 70; // Standard priority for new predictions
  }

  if (input.eventType === "lineup_confirmed") {
    score += 50;
    if (input.absentStartersCount && input.absentStartersCount > 0) {
      score += Math.min(input.absentStartersCount * 15, 40);
    }
  }

  if (input.eventType === "prediction_revised" || input.eventType === "lineup_impact") {
    // Probability shift component
    if (input.previousHomeProb !== undefined && input.newHomeProb !== undefined) {
      const probDiff = Math.abs(input.newHomeProb - input.previousHomeProb);
      score += Math.round(probDiff * 300); // 5% diff -> 15 points, 10% diff -> 30 points
    }

    // Top outcome flip component
    if (input.previousOutcome && input.newOutcome && input.previousOutcome !== input.newOutcome) {
      score += 35; // Outcome flip is highly material
    }

    // Confidence downgrade component
    if (input.confidenceChanged) {
      score += 20;
    }
  }

  if (input.eventType === "odds_movement") {
    if (input.oddsPercentageChange !== undefined) {
      const absChange = Math.abs(input.oddsPercentageChange);
      if (absChange >= 5.0) {
        score += Math.round(absChange * 4); // 5% -> 20 points, 10% -> 40 points
      }
    }
  }

  return Math.min(Math.max(score, 0), 100);
}
