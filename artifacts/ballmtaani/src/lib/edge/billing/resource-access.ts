/**
 * BallMtaani Edge Phase 6 — Resource-Aware Access Control
 */

import { EntitlementService, AccessDecision } from "./entitlement-service";

export interface MatchResourceContext {
  fixtureId: string;
  competitionSlug?: string;
  kickoffAt: string;
  predictionPublishedAt?: string;
}

export async function evaluateMatchResourceAccess(
  userId: string | null,
  context: MatchResourceContext
): Promise<{
  canViewBasic1X2: boolean;
  canViewGoalsMarkets: boolean;
  canViewBTTS: boolean;
  canViewLikelyScorelines: boolean;
  canViewRiskFactors: boolean;
  canViewRevisions: boolean;
  canViewFairOdds: boolean;
  canViewValueAnalysis: boolean;
}> {
  const [
    basicRes,
    goalsRes,
    bttsRes,
    scoresRes,
    riskRes,
    revisionsRes,
    fairOddsRes,
    valueRes,
  ] = await Promise.all([
    EntitlementService.evaluateAccess(userId, "edge.basic_predictions"),
    EntitlementService.evaluateAccess(userId, "edge.goals_markets"),
    EntitlementService.evaluateAccess(userId, "edge.btts"),
    EntitlementService.evaluateAccess(userId, "edge.likely_scores"),
    EntitlementService.evaluateAccess(userId, "edge.risk_factors"),
    EntitlementService.evaluateAccess(userId, "edge.revisions"),
    EntitlementService.evaluateAccess(userId, "edge.fair_odds"),
    EntitlementService.evaluateAccess(userId, "edge.value_analysis"),
  ]);

  return {
    canViewBasic1X2: basicRes.allowed,
    canViewGoalsMarkets: goalsRes.allowed,
    canViewBTTS: bttsRes.allowed,
    canViewLikelyScorelines: scoresRes.allowed,
    canViewRiskFactors: riskRes.allowed,
    canViewRevisions: revisionsRes.allowed,
    canViewFairOdds: fairOddsRes.allowed,
    canViewValueAnalysis: valueRes.allowed,
  };
}
