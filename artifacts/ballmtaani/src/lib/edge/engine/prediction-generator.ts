/**
 * BallMtaani Edge Phase 3 — Combined Prediction Generator & Output Validator
 */

import { solveDixonColesModel, DixonColesSolverResult } from "./dixon-coles-solver";
import { evaluateModelConfidenceScore, ConfidenceEngineResult } from "./confidence-risk";
import { MatchPredictionOutput, RecommendationStatus } from "../types";

export interface PredictionGeneratorInput {
  fixtureId: string | number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickoffAt: string;
  homeElo: number;
  awayElo: number;
  homeAttack: number;
  homeDefence: number;
  awayAttack: number;
  awayDefence: number;
  homeMatchesCount: number;
  awayMatchesCount: number;
  homeRestDays?: number;
  awayRestDays?: number;
  isPromotedTeam?: boolean;
  isEarlySeason?: boolean;
  isNeutralVenue?: boolean;
  modelVersion?: string;
}

export function generateFixturePrediction(input: PredictionGeneratorInput): MatchPredictionOutput {
  const modelVer = input.modelVersion || "ballmtaani-edge-statistical-v1";

  // 1. Solve Dixon-Coles Bivariate Model
  const modelRes = solveDixonColesModel({
    homeElo: input.homeElo,
    awayElo: input.awayElo,
    homeAttack: input.homeAttack,
    homeDefence: input.homeDefence,
    awayAttack: input.awayAttack,
    awayDefence: input.awayDefence,
  });

  // 2. Validate Probability Sums
  const probSum = modelRes.homeWinProb + modelRes.drawProb + modelRes.awayWinProb;
  if (Math.abs(probSum - 1.0) > 0.01) {
    throw new Error(`Invalid prediction output: 1X2 probabilities sum to ${probSum} (expected 1.0)`);
  }

  // 3. Evaluate Confidence & Risk Factors
  const confRes = evaluateModelConfidenceScore({
    homeMatchesCount: input.homeMatchesCount,
    awayMatchesCount: input.awayMatchesCount,
    dataQualityScore: 85,
    homeWinProb: modelRes.homeWinProb,
    drawProb: modelRes.drawProb,
    awayWinProb: modelRes.awayWinProb,
    homeRestDays: input.homeRestDays ?? 7,
    awayRestDays: input.awayRestDays ?? 7,
    isPromotedTeam: Boolean(input.isPromotedTeam),
    isEarlySeason: Boolean(input.isEarlySeason),
    isNeutralVenue: Boolean(input.isNeutralVenue),
  });

  // 4. Determine Gated Prediction Status
  let status: RecommendationStatus = "Eligible" as RecommendationStatus;
  if (Math.min(input.homeMatchesCount, input.awayMatchesCount) < 3) {
    status = "Insufficient Data";
  }

  return {
    fixtureId: input.fixtureId,
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    competition: input.competition,
    kickoffAt: input.kickoffAt,
    modelVersion: modelVer,
    predictionStatus: status,
    homeWinProb: modelRes.homeWinProb,
    drawProb: modelRes.drawProb,
    awayWinProb: modelRes.awayWinProb,
    over25Prob: modelRes.over25Prob,
    under25Prob: modelRes.under25Prob,
    bttsYesProb: modelRes.bttsYesProb,
    bttsNoProb: modelRes.bttsNoProb,
    expectedHomeGoals: modelRes.expectedHomeGoals,
    expectedAwayGoals: modelRes.expectedAwayGoals,
    topScorelines: modelRes.topScorelines,
    confidence: confRes.confidenceLabel,
    dataQuality: confRes.confidenceScore >= 75 ? "Excellent" : "Good",
    riskFactors: confRes.riskFactors,
    templateExplanation: `${input.homeTeam} (Elo ${Math.round(input.homeElo)}) vs ${input.awayTeam} (Elo ${Math.round(input.awayElo)}). Model xG: ${modelRes.expectedHomeGoals} - ${modelRes.expectedAwayGoals}.`,
    markets: [],
    revisionNumber: 1,
    generatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
}
