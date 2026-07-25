/**
 * BallMtaani Edge Phase 3 — Team Attack & Defence Strength Engine
 * Relative parameter fitting, time-decay weighting, and shrinkage towards league average.
 */

export interface TeamStrengthMetrics {
  attackStrength: number; // > 1.0 = above average attack
  defenceStrength: number; // < 1.0 = above average defence (concedes fewer goals)
  homeAttackStrength: number;
  homeDefenceStrength: number;
  awayAttackStrength: number;
  awayDefenceStrength: number;
  formScore: number; // 0 to 100
  matchesRated: number;
}

export function calculateTimeDecayWeight(matchDateIso: string, referenceDateIso: string, halfLifeDays = 180): number {
  const daysDiff = (new Date(referenceDateIso).getTime() - new Date(matchDateIso).getTime()) / (1000 * 3600 * 24);
  if (daysDiff <= 0) return 1.0;
  const decayRate = Math.log(2) / halfLifeDays;
  return Math.exp(-decayRate * daysDiff);
}

/**
 * Calculates attack and defence parameters relative to league average goals.
 * Applies Bayesian shrinkage for small sample sizes (< 10 matches).
 */
export function estimateTeamStrengthParameters(
  teamGoalsScored: number[],
  teamGoalsConceded: number[],
  isHomeList: boolean[],
  leagueAvgGoalsPerMatch = 1.35
): TeamStrengthMetrics {
  const n = teamGoalsScored.length;
  if (n === 0) {
    return {
      attackStrength: 1.0,
      defenceStrength: 1.0,
      homeAttackStrength: 1.0,
      homeDefenceStrength: 1.0,
      awayAttackStrength: 1.0,
      awayDefenceStrength: 1.0,
      formScore: 50,
      matchesRated: 0,
    };
  }

  let totalScored = 0;
  let totalConceded = 0;
  let homeScored = 0, homeCount = 0;
  let awayScored = 0, awayCount = 0;
  let homeConceded = 0, awayConceded = 0;

  for (let i = 0; i < n; i++) {
    const s = teamGoalsScored[i];
    const c = teamGoalsConceded[i];
    totalScored += s;
    totalConceded += c;

    if (isHomeList[i]) {
      homeScored += s;
      homeConceded += c;
      homeCount += 1;
    } else {
      awayScored += s;
      awayConceded += c;
      awayCount += 1;
    }
  }

  const rawAtt = (totalScored / n) / leagueAvgGoalsPerMatch;
  const rawDef = (totalConceded / n) / leagueAvgGoalsPerMatch;

  // Bayesian shrinkage weight w = n / (n + m) where m = 5 prior matches
  const shrinkWeight = n / (n + 5);
  const attStrength = shrinkWeight * rawAtt + (1 - shrinkWeight) * 1.0;
  const defStrength = shrinkWeight * rawDef + (1 - shrinkWeight) * 1.0;

  const hAtt = homeCount > 0 ? (homeScored / homeCount) / leagueAvgGoalsPerMatch : attStrength;
  const hDef = homeCount > 0 ? (homeConceded / homeCount) / leagueAvgGoalsPerMatch : defStrength;

  const aAtt = awayCount > 0 ? (awayScored / awayCount) / leagueAvgGoalsPerMatch : attStrength;
  const aDef = awayCount > 0 ? (awayConceded / awayCount) / leagueAvgGoalsPerMatch : defStrength;

  // Form score calculation (points out of last 5)
  const recent = teamGoalsScored.slice(0, 5);
  const recentConc = teamGoalsConceded.slice(0, 5);
  let pts = 0;
  for (let i = 0; i < recent.length; i++) {
    if (recent[i] > recentConc[i]) pts += 3;
    else if (recent[i] === recentConc[i]) pts += 1;
  }
  const maxPts = recent.length * 3 || 15;
  const formScore = Math.round((pts / maxPts) * 100);

  return {
    attackStrength: Math.round(attStrength * 100) / 100,
    defenceStrength: Math.round(defStrength * 100) / 100,
    homeAttackStrength: Math.round(hAtt * 100) / 100,
    homeDefenceStrength: Math.round(hDef * 100) / 100,
    awayAttackStrength: Math.round(aAtt * 100) / 100,
    awayDefenceStrength: Math.round(aDef * 100) / 100,
    formScore,
    matchesRated: n,
  };
}
