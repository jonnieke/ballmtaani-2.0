/**
 * BallMtaani Edge Phase 12 — Social Prediction Card Generator
 */

export interface PredictionCardData {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: string;
  modelVersion: string;
  disclaimer: string;
}

export class SocialCardGenerator {
  static generateSocialCard(pred: {
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    confidence: string;
  }): PredictionCardData {
    return {
      fixtureId: pred.fixtureId,
      homeTeam: pred.homeTeam,
      awayTeam: pred.awayTeam,
      homeWinProb: pred.homeWinProb,
      drawProb: pred.drawProb,
      awayWinProb: pred.awayWinProb,
      confidence: pred.confidence,
      modelVersion: "BallMtaani Ensemble v2.0",
      disclaimer: "Informational statistical probabilities only. Outcomes are inherently uncertain.",
    };
  }
}
