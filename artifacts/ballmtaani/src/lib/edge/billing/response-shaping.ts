/**
 * BallMtaani Edge Phase 6 — Server-Side Response Shaping
 * Never returns locked premium fields to unauthorized clients.
 */

import { MatchPredictionOutput } from "../types";
import { evaluateMatchResourceAccess } from "./resource-access";

export async function shapePredictionResponseForUser(
  prediction: MatchPredictionOutput,
  userId: string | null
): Promise<{
  shapedPrediction: Partial<MatchPredictionOutput>;
  isLocked: boolean;
  lockedSections: string[];
}> {
  const access = await evaluateMatchResourceAccess(userId, {
    fixtureId: String(prediction.fixtureId),
    kickoffAt: prediction.kickoffAt,
    predictionPublishedAt: prediction.publishedAt,
  });

  const lockedSections: string[] = [];

  const shaped: Partial<MatchPredictionOutput> = {
    fixtureId: prediction.fixtureId,
    homeTeam: prediction.homeTeam,
    awayTeam: prediction.awayTeam,
    competition: prediction.competition,
    kickoffAt: prediction.kickoffAt,
    homeWinProb: prediction.homeWinProb,
    drawProb: prediction.drawProb,
    awayWinProb: prediction.awayWinProb,
    expectedHomeGoals: prediction.expectedHomeGoals,
    expectedAwayGoals: prediction.expectedAwayGoals,
    confidence: prediction.confidence,
    dataQuality: prediction.dataQuality,
    templateExplanation: prediction.templateExplanation,
    publishedAt: prediction.publishedAt,
  };

  if (access.canViewGoalsMarkets) {
    shaped.over25Prob = prediction.over25Prob;
    shaped.under25Prob = prediction.under25Prob;
  } else {
    lockedSections.push("goalsMarkets");
  }

  if (access.canViewBTTS) {
    shaped.bttsYesProb = prediction.bttsYesProb;
    shaped.bttsNoProb = prediction.bttsNoProb;
  } else {
    lockedSections.push("btts");
  }

  if (access.canViewLikelyScorelines) {
    shaped.topScorelines = prediction.topScorelines;
  } else {
    lockedSections.push("likelyScorelines");
  }

  if (access.canViewRiskFactors) {
    shaped.riskFactors = prediction.riskFactors;
  } else {
    lockedSections.push("riskFactors");
  }

  return {
    shapedPrediction: shaped,
    isLocked: lockedSections.length > 0,
    lockedSections,
  };
}
