/**
 * BallMtaani Edge Phase 7 — Deterministic Lineup Impact Engine & Prediction Revision Generator
 */

import { MatchPredictionOutput } from "../types";
import { generateFixturePrediction } from "../engine/prediction-generator";

export interface LineupStarterInfo {
  playerName: string;
  position: "G" | "D" | "M" | "F";
  importanceScore: number; // 1-10 rating of player importance
  isStarter: boolean;
}

export interface LineupImpactInput {
  currentPrediction: MatchPredictionOutput;
  homeStarters: LineupStarterInfo[];
  awayStarters: LineupStarterInfo[];
  homeElo: number;
  awayElo: number;
  baseHomeAttack: number;
  baseHomeDefence: number;
  baseAwayAttack: number;
  baseAwayDefence: number;
}

export interface LineupImpactResult {
  revisedPrediction: MatchPredictionOutput;
  revisionNumber: number;
  absentHomeKeyPlayers: string[];
  absentAwayKeyPlayers: string[];
  homeAttackAdjustment: number;
  awayAttackAdjustment: number;
  impactDescription: string;
}

export function calculateLineupImpactRevision(input: LineupImpactInput): LineupImpactResult {
  const absentHomeKeyPlayers = input.homeStarters
    .filter((p) => p.importanceScore >= 7 && !p.isStarter)
    .map((p) => p.playerName);

  const absentAwayKeyPlayers = input.awayStarters
    .filter((p) => p.importanceScore >= 7 && !p.isStarter)
    .map((p) => p.playerName);

  // Calculate attack/defence penalty multipliers based on absent key starters
  const homePenalty = absentHomeKeyPlayers.length * 0.06; // 6% penalty per missing key player
  const awayPenalty = absentAwayKeyPlayers.length * 0.06;

  const adjustedHomeAttack = Math.max(input.baseHomeAttack * (1 - homePenalty), 0.5);
  const adjustedAwayAttack = Math.max(input.baseAwayAttack * (1 - awayPenalty), 0.5);

  const revisionNumber = input.currentPrediction.revisionNumber + 1;

  const revisedPrediction = generateFixturePrediction({
    fixtureId: input.currentPrediction.fixtureId,
    homeTeam: input.currentPrediction.homeTeam,
    awayTeam: input.currentPrediction.awayTeam,
    competition: input.currentPrediction.competition,
    kickoffAt: input.currentPrediction.kickoffAt,
    homeElo: input.homeElo,
    awayElo: input.awayElo,
    homeAttack: adjustedHomeAttack,
    homeDefence: input.baseHomeDefence,
    awayAttack: adjustedAwayAttack,
    awayDefence: input.baseAwayDefence,
    homeMatchesCount: 12,
    awayMatchesCount: 12,
  });

  revisedPrediction.revisionNumber = revisionNumber;
  revisedPrediction.publishedAt = new Date().toISOString();

  let impactDescription = "Confirmed lineups released. Model output unchanged.";
  if (absentHomeKeyPlayers.length > 0 || absentAwayKeyPlayers.length > 0) {
    impactDescription = `Confirmed lineups updated: ${
      absentHomeKeyPlayers.length > 0 ? `${input.currentPrediction.homeTeam} missing ${absentHomeKeyPlayers.join(", ")}. ` : ""
    }${
      absentAwayKeyPlayers.length > 0 ? `${input.currentPrediction.awayTeam} missing ${absentAwayKeyPlayers.join(", ")}. ` : ""
    }Model win probability adjusted.`;
  }

  return {
    revisedPrediction,
    revisionNumber,
    absentHomeKeyPlayers,
    absentAwayKeyPlayers,
    homeAttackAdjustment: Number((-homePenalty).toFixed(2)),
    awayAttackAdjustment: Number((-awayPenalty).toFixed(2)),
    impactDescription,
  };
}
