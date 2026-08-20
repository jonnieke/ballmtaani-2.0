/**
 * BallMtaani Edge Phase 5 — Public API Service Layer
 * Server-side read-only prediction queries. Never triggers external provider requests on page loads.
 */

import { generateFixturePrediction } from "../engine/prediction-generator";
import { MatchPredictionOutput } from "../types";

export const MOCK_PUBLISHED_PREDICTIONS: MatchPredictionOutput[] = [
  generateFixturePrediction({
    fixtureId: "epl-201",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    competition: "Premier League",
    kickoffAt: "2026-07-26T19:30:00Z",
    homeElo: 1620,
    awayElo: 1610,
    homeAttack: 1.35,
    homeDefence: 0.95,
    awayAttack: 1.25,
    awayDefence: 1.05,
    homeMatchesCount: 12,
    awayMatchesCount: 12,
  }),
  generateFixturePrediction({
    fixtureId: "ucl-202",
    homeTeam: "Real Madrid",
    awayTeam: "Bayern Munich",
    competition: "UEFA Champions League",
    kickoffAt: "2026-07-27T20:00:00Z",
    homeElo: 1680,
    awayElo: 1650,
    homeAttack: 1.45,
    homeDefence: 0.90,
    awayAttack: 1.35,
    awayDefence: 1.00,
    homeMatchesCount: 10,
    awayMatchesCount: 10,
  }),
  generateFixturePrediction({
    fixtureId: "la-liga-203",
    homeTeam: "Barcelona",
    awayTeam: "Atletico Madrid",
    competition: "La Liga",
    kickoffAt: "2026-07-28T19:00:00Z",
    homeElo: 1640,
    awayElo: 1600,
    homeAttack: 1.30,
    homeDefence: 0.92,
    awayAttack: 1.15,
    awayDefence: 0.88,
    homeMatchesCount: 11,
    awayMatchesCount: 11,
  }),
  generateFixturePrediction({
    fixtureId: "serie-a-204",
    homeTeam: "Inter Milan",
    awayTeam: "Juventus",
    competition: "Serie A",
    kickoffAt: "2026-07-29T18:45:00Z",
    homeElo: 1630,
    awayElo: 1590,
    homeAttack: 1.28,
    homeDefence: 0.85,
    awayAttack: 1.10,
    awayDefence: 0.90,
    homeMatchesCount: 14,
    awayMatchesCount: 14,
  }),
];

export async function getPublishedUpcomingPredictions(): Promise<MatchPredictionOutput[]> {
  return MOCK_PUBLISHED_PREDICTIONS;
}

export async function getPublishedPredictionById(fixtureId: string): Promise<MatchPredictionOutput | null> {
  const found = MOCK_PUBLISHED_PREDICTIONS.find((p) => String(p.fixtureId) === String(fixtureId));
  return found || MOCK_PUBLISHED_PREDICTIONS[0];
}
