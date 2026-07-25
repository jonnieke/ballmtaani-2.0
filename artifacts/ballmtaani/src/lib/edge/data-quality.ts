/**
 * BallMtaani Edge — Data Quality & Model Confidence Evaluator
 * Evaluates match metadata completeness, historical sample size, and model agreement.
 */

import { ConfidenceLevel, DataQualityScore } from "./types";

export interface DataQualityInput {
  homeMatchesCount: number;
  awayMatchesCount: number;
  hasDetailedStats: boolean;
  isNewSeason: boolean;
  isPromotedTeam: boolean;
  hasMarketOdds: boolean;
  hasLineupData?: boolean;
}

export function evaluateDataQuality(input: DataQualityInput): DataQualityScore {
  const minMatches = Math.min(input.homeMatchesCount, input.awayMatchesCount);

  if (minMatches < 3 || input.isPromotedTeam) {
    return "Insufficient";
  }

  if (minMatches < 6 || input.isNewSeason || !input.hasDetailedStats) {
    return "Limited";
  }

  if (minMatches >= 10 && input.hasDetailedStats && input.hasMarketOdds && input.hasLineupData !== false) {
    return "Excellent";
  }

  return "Good";
}

export function evaluateModelConfidence(
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
  dataQuality: DataQualityScore
): ConfidenceLevel {
  if (dataQuality === "Insufficient") return "Low";
  
  const maxProb = Math.max(homeWinProb, drawProb, awayWinProb);

  if (dataQuality === "Excellent" && maxProb >= 0.55) {
    return "High";
  }

  if (dataQuality === "Good" && maxProb >= 0.45) {
    return "Medium";
  }

  return "Low";
}

export function identifyRiskFactors(
  homeTeam: string,
  awayTeam: string,
  input: DataQualityInput,
  dataQuality: DataQualityScore,
  confidence: ConfidenceLevel
): string[] {
  const risks: string[] = [];

  if (input.isNewSeason) {
    risks.push("Early season fixture with volatile early form parameters.");
  }

  if (input.isPromotedTeam) {
    risks.push("Recently promoted team with limited top-tier historical data.");
  }

  if (Math.min(input.homeMatchesCount, input.awayMatchesCount) < 5) {
    risks.push("Small sample size of recent completed fixtures.");
  }

  if (!input.hasMarketOdds) {
    risks.push("Absence of live market consensus odds.");
  }

  if (confidence === "Low") {
    risks.push("Model probabilities indicate high match variance and outcome uncertainty.");
  }

  if (risks.length === 0) {
    risks.push("Standard match variance apply; no major anomalous statistical risk detected.");
  }

  return risks;
}
