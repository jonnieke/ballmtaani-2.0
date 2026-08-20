/**
 * BallMtaani Edge Phase 8 — Deterministic Recommendation Engine
 * Ranks upcoming fixtures based on followed teams, followed competitions, saved watchlist items, and kickoff proximity.
 */

import { MatchPredictionOutput } from "../types";

export interface UserPreferencesInput {
  userId: string;
  followedTeams: string[];
  followedCompetitions: string[];
  savedFixtureIds: string[];
  mutedTeams: string[];
  mutedCompetitions: string[];
}

export interface RecommendationCandidate {
  prediction: MatchPredictionOutput;
  score: number;
  reason: string;
}

export function rankPersonalizedRecommendations(
  candidates: MatchPredictionOutput[],
  preferences: UserPreferencesInput
): RecommendationCandidate[] {
  const results: RecommendationCandidate[] = [];

  for (const pred of candidates) {
    // Exclude muted teams or competitions
    if (preferences.mutedTeams.includes(pred.homeTeam) || preferences.mutedTeams.includes(pred.awayTeam)) {
      continue;
    }
    if (preferences.mutedCompetitions.includes(pred.competition)) {
      continue;
    }

    let score = 50; // Baseline candidate score
    let reason = "Upcoming match in a major competition";

    // 1. Followed Team Boost (+40 points)
    if (preferences.followedTeams.includes(pred.homeTeam) || preferences.followedTeams.includes(pred.awayTeam)) {
      score += 40;
      const team = preferences.followedTeams.includes(pred.homeTeam) ? pred.homeTeam : pred.awayTeam;
      reason = `Because you follow ${team}`;
    }
    // 2. Saved Watchlist Boost (+35 points)
    else if (preferences.savedFixtureIds.includes(String(pred.fixtureId))) {
      score += 35;
      reason = "Saved on your watchlist";
    }
    // 3. Followed Competition Boost (+20 points)
    else if (preferences.followedCompetitions.includes(pred.competition)) {
      score += 20;
      reason = `From your followed league (${pred.competition})`;
    }

    // 4. Lineup Impact Revision Boost (+15 points if revised)
    if (pred.revisionNumber && pred.revisionNumber > 1) {
      score += 15;
      reason += " — Confirmed lineup revision available";
    }

    results.push({
      prediction: pred,
      score,
      reason,
    });
  }

  // Sort descending by recommendation score
  return results.sort((a, b) => b.score - a.score);
}
