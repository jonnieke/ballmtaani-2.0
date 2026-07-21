/**
 * BallMtaani Cost & Operational Metrics Engine
 * Internal metrics tracking API-Football requests, AI token usage, storage, and cost-per-active-fan.
 */

export interface CostMetricsSnapshot {
  apiFootballCallsToday: number;
  aiTokensUsedToday: number;
  aiCostUSD: number;
  activeFansToday: number;
  costPerActiveFanUSD: number;
  timestamp: string;
}

export function calculateCostMetrics(
  apiCalls = 1450,
  aiTokens = 250000,
  activeFans = 12500
): CostMetricsSnapshot {
  // Estimated rates: AI ~$0.002 / 1k tokens, API-Football ~$0.0001 / call
  const aiCost = (aiTokens / 1000) * 0.002;
  const apiCost = apiCalls * 0.0001;
  const totalCost = aiCost + apiCost;

  return {
    apiFootballCallsToday: apiCalls,
    aiTokensUsedToday: aiTokens,
    aiCostUSD: Number(aiCost.toFixed(4)),
    activeFansToday: activeFans,
    costPerActiveFanUSD: activeFans > 0 ? Number((totalCost / activeFans).toFixed(6)) : 0,
    timestamp: new Date().toISOString(),
  };
}
