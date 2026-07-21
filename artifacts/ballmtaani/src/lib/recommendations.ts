/**
 * BallMtaani Multi-Signal Recommendation Engine
 * Transparent, privacy-safe match and content recommendations for Kenyan fans.
 * Signals: favourite clubs, leagues, recent activity, time of day, match urgency.
 */

export interface RecommendationSignal {
  matchId: string | number;
  homeTeamId?: number;
  awayTeamId?: number;
  leagueId?: number;
  kickoffISO: string;
  liveStatus?: string; // 'LIVE', 'HT', 'FT', etc.
}

export interface RecommendationResult {
  matchId: string | number;
  score: number;
  reasons: string[];
}

export interface UserContext {
  favouriteTeamIds: number[];
  favouriteLeagueIds: number[];
  recentlyViewedLeagueIds?: number[];
}

const SIGNAL_WEIGHTS = {
  FAVOURITE_TEAM: 40,
  FAVOURITE_LEAGUE: 25,
  RECENTLY_VIEWED_LEAGUE: 10,
  LIVE_MATCH: 20,
  KICKOFF_IMMINENT: 15, // < 2 hours away
};

export function scoreMatch(match: RecommendationSignal, ctx: UserContext): RecommendationResult {
  let score = 0;
  const reasons: string[] = [];
  const now = Date.now();
  const kickoffMs = new Date(match.kickoffISO).getTime();
  const minsUntilKickoff = (kickoffMs - now) / 60000;

  if (match.homeTeamId && ctx.favouriteTeamIds.includes(match.homeTeamId)) {
    score += SIGNAL_WEIGHTS.FAVOURITE_TEAM;
    reasons.push("Favourite team playing");
  }
  if (match.awayTeamId && ctx.favouriteTeamIds.includes(match.awayTeamId)) {
    score += SIGNAL_WEIGHTS.FAVOURITE_TEAM;
    reasons.push("Favourite team playing away");
  }
  if (match.leagueId && ctx.favouriteLeagueIds.includes(match.leagueId)) {
    score += SIGNAL_WEIGHTS.FAVOURITE_LEAGUE;
    reasons.push("Favourite league");
  }
  if (match.leagueId && (ctx.recentlyViewedLeagueIds || []).includes(match.leagueId)) {
    score += SIGNAL_WEIGHTS.RECENTLY_VIEWED_LEAGUE;
    reasons.push("Recently browsed league");
  }
  if (match.liveStatus && ["1H", "2H", "HT", "ET", "LIVE"].includes(match.liveStatus)) {
    score += SIGNAL_WEIGHTS.LIVE_MATCH;
    reasons.push("Match is LIVE now");
  }
  if (minsUntilKickoff > 0 && minsUntilKickoff < 120) {
    score += SIGNAL_WEIGHTS.KICKOFF_IMMINENT;
    reasons.push("Kicks off within 2 hours");
  }

  return { matchId: match.matchId, score, reasons };
}

export function rankMatches(
  matches: RecommendationSignal[],
  ctx: UserContext
): RecommendationResult[] {
  return matches
    .map(m => scoreMatch(m, ctx))
    .sort((a, b) => b.score - a.score);
}
