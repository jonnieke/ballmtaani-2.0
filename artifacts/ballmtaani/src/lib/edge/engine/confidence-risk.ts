/**
 * BallMtaani Edge Phase 3 — Confidence Engine & Deterministic Risk Factors
 * Calculates model confidence (0-100 & label) and generates non-LLM risk statements.
 */

import { ConfidenceLevel, DataQualityScore } from "../types";

export interface ConfidenceInput {
  homeMatchesCount: number;
  awayMatchesCount: number;
  dataQualityScore: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  homeRestDays: number;
  awayRestDays: number;
  isPromotedTeam: boolean;
  isEarlySeason: boolean;
  isNeutralVenue?: boolean;
}

export interface ConfidenceEngineResult {
  confidenceScore: number; // 0 to 100
  confidenceLabel: ConfidenceLevel;
  riskFactors: string[];
}

export function evaluateModelConfidenceScore(input: ConfidenceInput): ConfidenceEngineResult {
  let score = 50; // Baseline

  // 1. Historical Sample Size (+-20)
  const minMatches = Math.min(input.homeMatchesCount, input.awayMatchesCount);
  if (minMatches >= 10) score += 20;
  else if (minMatches >= 5) score += 10;
  else score -= 15;

  // 2. Data Quality Score (+-15)
  if (input.dataQualityScore >= 85) score += 15;
  else if (input.dataQualityScore >= 70) score += 10;
  else if (input.dataQualityScore < 50) score -= 20;

  // 3. Outcome Consensus / Dominance (+-15)
  const maxProb = Math.max(input.homeWinProb, input.drawProb, input.awayWinProb);
  if (maxProb >= 0.55) score += 15;
  else if (maxProb >= 0.45) score += 5;
  else score -= 10;

  // 4. Rest & Congestion Penalties
  if (input.homeRestDays < 3 || input.awayRestDays < 3) score -= 10;
  if (input.isPromotedTeam) score -= 10;
  if (input.isEarlySeason) score -= 10;

  score = Math.max(10, Math.min(100, score));

  let label: ConfidenceLevel = "Low";
  if (score >= 75) label = "High";
  else if (score >= 50) label = "Medium";

  // Deterministic Risk Factor Generation (No LLM)
  const riskFactors: string[] = [];

  if (input.isEarlySeason) {
    riskFactors.push("Opening weeks of the season with volatile early form parameters.");
  }

  if (input.isPromotedTeam) {
    riskFactors.push("Recently promoted club with limited top-tier historical data.");
  }

  if (minMatches < 5) {
    riskFactors.push("Small sample size of recent completed fixtures.");
  }

  if (input.homeRestDays < 3 || input.awayRestDays < 3) {
    riskFactors.push("Fixture congestion alert: team playing with fewer than 3 days of rest.");
  }

  if (input.isNeutralVenue) {
    riskFactors.push("Fixture played at a neutral venue (zero home advantage applied).");
  }

  if (maxProb < 0.40) {
    riskFactors.push("High match variance: model probabilities indicate balanced 3-way distribution.");
  }

  if (riskFactors.length === 0) {
    riskFactors.push("Standard match outcome variance applies; no anomalous statistical risk detected.");
  }

  return {
    confidenceScore: score,
    confidenceLabel: label,
    riskFactors,
  };
}
