/**
 * BallMtaani Edge — Deterministic Template Explanation Generator
 * Produces structured, natural-language prediction rationale without LLM runtime costs.
 */

import { ConfidenceLevel, DataQualityScore, RecommendationStatus } from "./types";

export interface TemplateExplanationParams {
  homeTeam: string;
  awayTeam: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  confidence: ConfidenceLevel;
  dataQuality: DataQualityScore;
  recommendation: RecommendationStatus;
  primarySelection: string;
  primaryProbability: number;
  edgePercentage?: number;
  riskFactor: string;
  sampleSize?: number;
}

export function generateTemplateExplanation(params: TemplateExplanationParams): string {
  const {
    homeTeam,
    awayTeam,
    expectedHomeGoals,
    expectedAwayGoals,
    confidence,
    recommendation,
    primarySelection,
    primaryProbability,
    edgePercentage,
    riskFactor,
    sampleSize = 10,
  } = params;

  const probPct = Math.round(primaryProbability * 100);
  let rationale = "";

  if (expectedHomeGoals > expectedAwayGoals + 0.4) {
    rationale = `${homeTeam} show superior offensive indicators at home, generating an expected ${expectedHomeGoals} goals compared to ${awayTeam}'s expected ${expectedAwayGoals}.`;
  } else if (expectedAwayGoals > expectedHomeGoals + 0.4) {
    rationale = `${awayTeam} demonstrate higher attacking efficiency on the road, generating an expected ${expectedAwayGoals} goals vs ${homeTeam}'s ${expectedHomeGoals}.`;
  } else {
    rationale = `Both ${homeTeam} and ${awayTeam} show closely matched expected goal outputs (${expectedHomeGoals} vs ${expectedAwayGoals}), reflecting a tight tactical contest.`;
  }

  let edgeNote = "";
  if (recommendation !== "No Edge" && recommendation !== "Insufficient Data" && edgePercentage !== undefined) {
    edgeNote = ` The statistical model identifies ${primarySelection} as a ${recommendation} with a +${edgePercentage}% expected value.`;
  } else {
    edgeNote = ` The market pricing is tightly calibrated with model probabilities, resulting in a 'No Edge' designation.`;
  }

  let disclaimerNote = ` Model confidence is rated as ${confidence} across the past ${sampleSize} fixtures. Note: ${riskFactor}`;

  return `${rationale}${edgeNote}${disclaimerNote}`;
}
