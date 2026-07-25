/**
 * BallMtaani Edge Phase 10 — Champion / Challenger Shadow Prediction Framework
 */

export interface ShadowPredictionRecord {
  fixtureId: string;
  championVersion: string;
  challengerVersion: string;
  championHomeProb: number;
  challengerHomeProb: number;
  differencePct: number;
  settledOutcome?: string;
}

const IN_MEMORY_SHADOW_PREDICTIONS: ShadowPredictionRecord[] = [];

export class ChampionChallengerEngine {
  static createShadowPrediction(
    fixtureId: string,
    championHomeProb: number,
    challengerHomeProb: number,
    championVersion: string = "dixon-coles-v1.0",
    challengerVersion: string = "lightgbm-ensemble-v2.1"
  ): ShadowPredictionRecord {
    const diff = Math.round(Math.abs(championHomeProb - challengerHomeProb) * 10000) / 100;
    const record: ShadowPredictionRecord = {
      fixtureId,
      championVersion,
      challengerVersion,
      championHomeProb,
      challengerHomeProb,
      differencePct: diff,
    };

    IN_MEMORY_SHADOW_PREDICTIONS.push(record);
    return record;
  }

  static getShadowRecords(): ShadowPredictionRecord[] {
    return IN_MEMORY_SHADOW_PREDICTIONS;
  }
}
