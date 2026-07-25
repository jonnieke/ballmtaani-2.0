/**
 * BallMtaani Edge Phase 4 — Hypothetical ROI & Drawdown Simulator
 * Simulates flat 1-unit hypothetical returns, calculates net yield, maximum drawdown %, and longest losing sequence.
 * FOR RESEARCH & TRANSPARENCY AUDITING ONLY — DO NOT PRESENT AS PROFIT GUARANTEES.
 */

export interface SimulatedSelection {
  fixtureId: string | number;
  predictedProbability: number;
  decimalOdds: number;
  isWon: boolean;
}

export interface RoiSimulationResult {
  totalStaked: number;
  totalReturned: number;
  netUnits: number;
  roiPercentage: number; // e.g. +4.5%
  winRatePercentage: number;
  maxDrawdownUnits: number;
  maxDrawdownPercentage: number;
  longestLosingStreak: number;
}

export function simulateHypotheticalFlatRoi(selections: SimulatedSelection[]): RoiSimulationResult {
  const n = selections.length;
  if (n === 0) {
    return {
      totalStaked: 0,
      totalReturned: 0,
      netUnits: 0,
      roiPercentage: 0,
      winRatePercentage: 0,
      maxDrawdownUnits: 0,
      maxDrawdownPercentage: 0,
      longestLosingStreak: 0,
    };
  }

  let totalStaked = 0;
  let totalReturned = 0;
  let winCount = 0;

  let currentStreak = 0;
  let maxLosingStreak = 0;

  let peakUnits = 0;
  let currentUnits = 0;
  let maxDrawdown = 0;

  for (const sel of selections) {
    totalStaked += 1.0; // 1 unit stake
    if (sel.isWon) {
      const payout = sel.decimalOdds > 1.0 ? sel.decimalOdds : 1.0;
      totalReturned += payout;
      currentUnits += payout - 1.0;
      winCount += 1;
      currentStreak = 0;
    } else {
      currentUnits -= 1.0;
      currentStreak += 1;
      if (currentStreak > maxLosingStreak) maxLosingStreak = currentStreak;
    }

    if (currentUnits > peakUnits) {
      peakUnits = currentUnits;
    } else {
      const dd = peakUnits - currentUnits;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
  }

  const netUnits = totalReturned - totalStaked;
  const roiPct = (netUnits / totalStaked) * 100;
  const winRate = (winCount / n) * 100;
  const maxDdPct = totalStaked > 0 ? (maxDrawdown / Math.max(1, peakUnits + totalStaked)) * 100 : 0;

  return {
    totalStaked: Math.round(totalStaked * 100) / 100,
    totalReturned: Math.round(totalReturned * 100) / 100,
    netUnits: Math.round(netUnits * 100) / 100,
    roiPercentage: Math.round(roiPct * 100) / 100,
    winRatePercentage: Math.round(winRate * 100) / 100,
    maxDrawdownUnits: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPercentage: Math.round(maxDdPct * 100) / 100,
    longestLosingStreak: maxLosingStreak,
  };
}
