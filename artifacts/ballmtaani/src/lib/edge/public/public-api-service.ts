/**
 * BallMtaani Edge Phase 5 — Public API Service Layer
 * Server-side read-only prediction queries. Never triggers external provider requests on page loads.
 */

import { generateFixturePrediction } from "../engine/prediction-generator";
import { MatchPredictionOutput } from "../types";

export const MOCK_PUBLISHED_PREDICTIONS: MatchPredictionOutput[] = [
  generateFixturePrediction({
    fixtureId: "fkf-101",
    homeTeam: "Gor Mahia",
    awayTeam: "AFC Leopards",
    competition: "FKF Premier League",
    kickoffAt: "2026-08-25T15:00:00Z",
    homeElo: 1540,
    awayElo: 1490,
    homeAttack: 1.30,
    homeDefence: 0.82,
    awayAttack: 1.10,
    awayDefence: 0.98,
    homeMatchesCount: 14,
    awayMatchesCount: 14,
    storylines: {
      strength: "K'Ogalo have kept 6 clean sheets in their last 8 league matches and dominate second-ball regains in midfield.",
      vulnerability: "Ingwe are dangerous on high-tempo wing transitions through rapid counter-attacks.",
      mtaaVerdict: "Mashemeji Derby tension usually tightens the game; Model strongly projects Under 2.5 goals (71%) with a 1–0 / 2–0 Gor Mahia lean.",
    },
    fanVote: {
      homeVotes: 1420,
      drawVotes: 380,
      awayVotes: 980,
      totalVotes: 2780,
    },
  }),
  generateFixturePrediction({
    fixtureId: "epl-201",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    competition: "Premier League",
    kickoffAt: "2026-08-25T19:30:00Z",
    homeElo: 1620,
    awayElo: 1610,
    homeAttack: 1.35,
    homeDefence: 0.95,
    awayAttack: 1.25,
    awayDefence: 1.05,
    homeMatchesCount: 12,
    awayMatchesCount: 12,
    storylines: {
      strength: "Arsenal's set-piece xG efficiency ranks #1 in Europe; heavy pressure on opposition fullbacks.",
      vulnerability: "Liverpool's vertical counter-press punishes high defensive lines in transitional moments.",
      mtaaVerdict: "High-tempo showdown with heavy Over 2.5 goals probability (62%); tight 2–1 home lean.",
    },
    fanVote: {
      homeVotes: 3200,
      drawVotes: 850,
      awayVotes: 2150,
      totalVotes: 6200,
    },
  }),
  generateFixturePrediction({
    fixtureId: "ucl-202",
    homeTeam: "Real Madrid",
    awayTeam: "Bayern Munich",
    competition: "UEFA Champions League",
    kickoffAt: "2026-08-26T20:00:00Z",
    homeElo: 1680,
    awayElo: 1650,
    homeAttack: 1.45,
    homeDefence: 0.90,
    awayAttack: 1.35,
    awayDefence: 1.00,
    homeMatchesCount: 10,
    awayMatchesCount: 10,
    storylines: {
      strength: "Bernabeu European nights generate unrivaled late-game shot volume and clinical conversion.",
      vulnerability: "Bayern central overloads exploit defensive recovery space when fullbacks push high.",
      mtaaVerdict: "Both Teams To Score (BTTS Yes: 68%) is the model's standout conviction pick.",
    },
    fanVote: {
      homeVotes: 4100,
      drawVotes: 620,
      awayVotes: 1480,
      totalVotes: 6200,
    },
  }),
  generateFixturePrediction({
    fixtureId: "caf-103",
    homeTeam: "Harambee Stars",
    awayTeam: "Nigeria",
    competition: "AFCON Qualifiers",
    kickoffAt: "2026-08-27T16:00:00Z",
    homeElo: 1460,
    awayElo: 1590,
    homeAttack: 1.05,
    homeDefence: 0.95,
    awayAttack: 1.40,
    awayDefence: 0.88,
    homeMatchesCount: 8,
    awayMatchesCount: 8,
    storylines: {
      strength: "Nairobi home crowd atmosphere and structured low-block compactness at Kasarani.",
      vulnerability: "Super Eagles possess lethal individual attacking quality in 1-on-1 box duels.",
      mtaaVerdict: "Model projects a fierce tactical battle; Under 2.5 goals (66%) with high draw resilience.",
    },
    fanVote: {
      homeVotes: 2900,
      drawVotes: 1100,
      awayVotes: 1800,
      totalVotes: 5800,
    },
  }),
  generateFixturePrediction({
    fixtureId: "fkf-102",
    homeTeam: "Tusker FC",
    awayTeam: "Bandari FC",
    competition: "FKF Premier League",
    kickoffAt: "2026-08-28T15:00:00Z",
    homeElo: 1510,
    awayElo: 1470,
    homeAttack: 1.20,
    homeDefence: 0.88,
    awayAttack: 1.05,
    awayDefence: 0.92,
    homeMatchesCount: 12,
    awayMatchesCount: 12,
    storylines: {
      strength: "Tusker's physical aerial dominance and disciplined box defending at home.",
      vulnerability: "Bandari's counter-attacking speed from coastal wide wingers.",
      mtaaVerdict: "Model favors home advantage (54% Tusker win probability) with low total match xG.",
    },
    fanVote: {
      homeVotes: 890,
      drawVotes: 320,
      awayVotes: 440,
      totalVotes: 1650,
    },
  }),
  generateFixturePrediction({
    fixtureId: "la-liga-203",
    homeTeam: "Barcelona",
    awayTeam: "Atletico Madrid",
    competition: "La Liga",
    kickoffAt: "2026-08-29T19:00:00Z",
    homeElo: 1640,
    awayElo: 1600,
    homeAttack: 1.30,
    homeDefence: 0.92,
    awayAttack: 1.15,
    awayDefence: 0.88,
    homeMatchesCount: 11,
    awayMatchesCount: 11,
    storylines: {
      strength: "Catalan positional interchange and high ball possession share (avg 64%).",
      vulnerability: "Simeone's low block absorbs pressure and strikes on clinical set-pieces.",
      mtaaVerdict: "Tight tactical contest; Model favors home victory margin of 1 goal.",
    },
    fanVote: {
      homeVotes: 2800,
      drawVotes: 750,
      awayVotes: 1150,
      totalVotes: 4700,
    },
  }),
];

export async function getPublishedUpcomingPredictions(): Promise<MatchPredictionOutput[]> {
  return MOCK_PUBLISHED_PREDICTIONS;
}

export async function getPublishedPredictionById(fixtureId: string): Promise<MatchPredictionOutput | null> {
  const found = MOCK_PUBLISHED_PREDICTIONS.find((p) => String(p.fixtureId) === String(fixtureId));
  return found || MOCK_PUBLISHED_PREDICTIONS[0];
}
