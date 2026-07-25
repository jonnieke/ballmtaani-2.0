/**
 * BallMtaani Edge — Fair Odds & Market Value Calculator
 * Normalizes bookmaker odds, calculates expected value (EV), fair odds, and edge status.
 */

import {
  MarketAnalysisResult,
  MarketType,
  SelectionType,
  RecommendationStatus,
  EdgeConfigThresholds,
  DEFAULT_THRESHOLDS,
  ConfidenceLevel,
  DataQualityScore,
} from "./types";

/**
 * Calculates fair decimal odds from raw probability.
 * e.g. P = 0.50 -> Fair Odds = 2.00
 */
export function calculateFairOdds(probability: number): number {
  if (probability <= 0) return 999;
  return Math.round((1 / probability) * 100) / 100;
}

/**
 * Removes bookmaker margin (overround) from a set of market decimal odds.
 */
export function removeBookmakerMargin(decimalOddsArray: number[]): number[] {
  if (!decimalOddsArray || decimalOddsArray.length === 0) return [];
  const rawImplied = decimalOddsArray.map((odds) => (odds > 0 ? 1 / odds : 0));
  const totalOverround = rawImplied.reduce((acc, curr) => acc + curr, 0);

  if (totalOverround <= 0) return decimalOddsArray.map(() => 0);
  return rawImplied.map((implied) => Math.round((implied / totalOverround) * 10000) / 10000);
}

/**
 * Calculates expected value EV = P_model * Odds_market - 1
 */
export function calculateExpectedValue(modelProbability: number, marketOdds: number): number {
  if (modelProbability <= 0 || marketOdds <= 1) return -1;
  return Math.round((modelProbability * marketOdds - 1) * 10000) / 10000;
}

/**
 * Classifies recommendation status based on Expected Value and data quality safeguards.
 */
export function classifyEdgeRecommendation(
  expectedValue: number,
  confidence: ConfidenceLevel,
  dataQuality: DataQualityScore,
  thresholds: EdgeConfigThresholds = DEFAULT_THRESHOLDS
): RecommendationStatus {
  if (dataQuality === "Insufficient") return "Insufficient Data";
  if (confidence === "Low" && expectedValue < thresholds.strongEdgeMinEv) return "No Edge";

  if (expectedValue >= thresholds.strongEdgeMinEv) return "Strong Edge";
  if (expectedValue >= thresholds.moderateEdgeMinEv) return "Moderate Edge";
  if (expectedValue >= thresholds.smallEdgeMinEv) return "Small Edge";

  return "No Edge";
}

export interface MarketOddsInput {
  market: MarketType;
  selection: SelectionType;
  decimalOdds: number;
}

/**
 * Analyzes market odds vs model probabilities for 1X2, OU25, or BTTS markets.
 */
export function analyzeMarketValue(
  market: MarketType,
  selection: SelectionType,
  modelProbability: number,
  marketOdds?: number,
  normalizedMarketProbability?: number,
  confidence: ConfidenceLevel = "Medium",
  dataQuality: DataQualityScore = "Good",
  thresholds: EdgeConfigThresholds = DEFAULT_THRESHOLDS
): MarketAnalysisResult {
  const fairOdds = calculateFairOdds(modelProbability);
  
  if (!marketOdds || marketOdds <= 1) {
    return {
      market,
      selection,
      modelProbability,
      fairOdds,
      recommendation: "No Edge",
      riskLevel: confidence === "High" ? "Low" : "Medium",
      explanation: `Model estimates ${Math.round(modelProbability * 100)}% probability (Fair Odds ${fairOdds}). No market odds available for comparison.`,
    };
  }

  const ev = calculateExpectedValue(modelProbability, marketOdds);
  const edgePct = Math.round(ev * 10000) / 100;
  const recommendation = classifyEdgeRecommendation(ev, confidence, dataQuality, thresholds);

  let riskLevel: "Low" | "Medium" | "High" = "Medium";
  if (confidence === "High" && recommendation !== "No Edge") riskLevel = "Low";
  else if (confidence === "Low" || recommendation === "No Edge") riskLevel = "High";

  let explanation = "";
  if (recommendation === "Strong Edge" || recommendation === "Moderate Edge" || recommendation === "Small Edge") {
    explanation = `Model gives ${selection} a ${Math.round(modelProbability * 100)}% probability vs market implied ${normalizedMarketProbability ? Math.round(normalizedMarketProbability * 100) : Math.round((1 / marketOdds) * 100)}%. Discovered ${edgePct > 0 ? "+" : ""}${edgePct}% statistical edge.`;
  } else {
    explanation = `Model probability ${Math.round(modelProbability * 100)}% is closely aligned with market odds ${marketOdds}. No statistical edge detected.`;
  }

  return {
    market,
    selection,
    modelProbability,
    fairOdds,
    marketOdds,
    marketProbability: normalizedMarketProbability,
    expectedValue: ev,
    edgePercentage: edgePct,
    recommendation,
    riskLevel,
    explanation,
  };
}
