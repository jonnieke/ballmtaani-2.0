/**
 * BallMtaani Edge Phase 7 — Material Odds Movement Analyzer
 */

export interface OddsSnapshotInput {
  fixtureId: string;
  market: "1X2" | "OU25" | "BTTS";
  selection: "HOME" | "DRAW" | "AWAY";
  previousOdds: number;
  currentOdds: number;
  modelFairOdds: number;
}

export interface OddsMovementResult {
  fixtureId: string;
  market: string;
  selection: string;
  previousOdds: number;
  currentOdds: number;
  percentageChange: number;
  direction: "shortened" | "drifted";
  isMaterial: boolean;
  materialityScore: number;
  valueStatusChange?: string;
  explanation: string;
}

export function analyzeOddsMovement(input: OddsSnapshotInput): OddsMovementResult {
  const diff = input.currentOdds - input.previousOdds;
  const percentageChange = Number(((diff / input.previousOdds) * 100).toFixed(2));
  const direction = diff < 0 ? "shortened" : "drifted";

  const isMaterial = Math.abs(percentageChange) >= 5.0; // 5%+ odds movement is material
  const materialityScore = isMaterial ? Math.min(Math.round(Math.abs(percentageChange) * 4), 100) : 10;

  let valueStatusChange: string | undefined = undefined;
  if (input.previousOdds > input.modelFairOdds && input.currentOdds <= input.modelFairOdds) {
    valueStatusChange = "Moderate Edge -> No Edge";
  } else if (input.previousOdds <= input.modelFairOdds && input.currentOdds > input.modelFairOdds) {
    valueStatusChange = "No Edge -> Small Edge";
  }

  const explanation = `Market odds for ${input.selection} ${direction} from ${input.previousOdds.toFixed(2)} to ${input.currentOdds.toFixed(2)} (${percentageChange > 0 ? "+" : ""}${percentageChange}%). Model fair odds: ${input.modelFairOdds.toFixed(2)}.`;

  return {
    fixtureId: input.fixtureId,
    market: input.market,
    selection: input.selection,
    previousOdds: input.previousOdds,
    currentOdds: input.currentOdds,
    percentageChange,
    direction,
    isMaterial,
    materialityScore,
    valueStatusChange,
    explanation,
  };
}
