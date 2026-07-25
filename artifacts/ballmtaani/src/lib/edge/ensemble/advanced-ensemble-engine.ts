/**
 * BallMtaani Edge Phase 10 — Advanced Ensemble Probability Solver
 * Blends Dixon-Coles Poisson, LightGBM Gradient Boosting, Elo Ratings, and Logistic Regression into calibrated 1X2 market probabilities.
 */

export interface ModelProbabilityComponent {
  dixonColes: { homeProb: number; drawProb: number; awayProb: number };
  lightGbm: { homeProb: number; drawProb: number; awayProb: number };
  eloModel: { homeProb: number; drawProb: number; awayProb: number };
  logistic: { homeProb: number; drawProb: number; awayProb: number };
}

export interface EnsembleWeights {
  dixonColesWeight: number; // e.g. 0.35
  lightGbmWeight: number;   // e.g. 0.35
  eloWeight: number;        // e.g. 0.20
  logisticWeight: number;   // e.g. 0.10
}

export interface EnsembleResult {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  weights: EnsembleWeights;
  componentProbabilities: ModelProbabilityComponent;
}

export class AdvancedEnsembleEngine {
  static solve1X2Ensemble(
    components: ModelProbabilityComponent,
    weights: EnsembleWeights = { dixonColesWeight: 0.35, lightGbmWeight: 0.35, eloWeight: 0.20, logisticWeight: 0.10 }
  ): EnsembleResult {
    // 1. Calculate weighted probability sums
    let rawHome =
      components.dixonColes.homeProb * weights.dixonColesWeight +
      components.lightGbm.homeProb * weights.lightGbmWeight +
      components.eloModel.homeProb * weights.eloWeight +
      components.logistic.homeProb * weights.logisticWeight;

    let rawDraw =
      components.dixonColes.drawProb * weights.dixonColesWeight +
      components.lightGbm.drawProb * weights.lightGbmWeight +
      components.eloModel.drawProb * weights.eloWeight +
      components.logistic.drawProb * weights.logisticWeight;

    let rawAway =
      components.dixonColes.awayProb * weights.dixonColesWeight +
      components.lightGbm.awayProb * weights.lightGbmWeight +
      components.eloModel.awayProb * weights.eloWeight +
      components.logistic.awayProb * weights.logisticWeight;

    // 2. Normalize probabilities so sum = 1.0
    const total = rawHome + rawDraw + rawAway;
    const homeProb = Math.round((rawHome / total) * 10000) / 10000;
    const drawProb = Math.round((rawDraw / total) * 10000) / 10000;
    const awayProb = Math.round((1 - homeProb - drawProb) * 10000) / 10000;

    return {
      homeProb,
      drawProb,
      awayProb,
      weights,
      componentProbabilities: components,
    };
  }
}
