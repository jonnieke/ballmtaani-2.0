/**
 * BallMtaani Edge — Core Type Definitions
 */

export type RecommendationStatus =
  | "Strong Edge"
  | "Moderate Edge"
  | "Small Edge"
  | "No Edge"
  | "Avoid"
  | "Insufficient Data"
  | "Awaiting Lineups";

export type ConfidenceLevel = "High" | "Medium" | "Low";

export type DataQualityScore = "Excellent" | "Good" | "Limited" | "Insufficient";

export type MarketType = "1X2" | "OU25" | "BTTS";

export type SelectionType = "HOME" | "DRAW" | "AWAY" | "OVER" | "UNDER" | "YES" | "NO";

export interface ScorelineProbability {
  homeGoals: number;
  awayGoals: number;
  probability: number; // 0 to 1
  formattedScore: string; // e.g. "2 - 1"
}

export interface TeamFormStats {
  teamId: string | number;
  teamName: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
  failedToScore: number;
  avgShots: number;
  avgShotsOnTarget: number;
  expectedGoalsFor: number;
  expectedGoalsAgainst: number;
  restDays: number;
  leaguePosition?: number;
}

export interface MarketOddsItem {
  market: MarketType;
  selection: SelectionType;
  decimalOdds: number;
}

export interface MarketAnalysisResult {
  market: MarketType;
  selection: SelectionType;
  modelProbability: number;
  fairOdds: number;
  marketOdds?: number;
  marketProbability?: number;
  expectedValue?: number; // EV = P * Odds - 1
  edgePercentage?: number; // EV * 100
  recommendation: RecommendationStatus;
  riskLevel: "Low" | "Medium" | "High";
  explanation: string;
}

export interface MatchPredictionOutput {
  fixtureId: string | number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickoffAt: string;
  modelVersion: string;
  predictionStatus: RecommendationStatus;
  
  // Probabilities
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  over25Prob: number;
  under25Prob: number;
  bttsYesProb: number;
  bttsNoProb: number;
  
  // Expected Goals
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  
  // Scorelines
  topScorelines: ScorelineProbability[];
  
  // Meta & Quality
  confidence: ConfidenceLevel;
  dataQuality: DataQualityScore;
  riskFactors: string[];
  templateExplanation: string;
  
  // Markets & Value
  markets: MarketAnalysisResult[];
  
  // Mtaa Context & Kenyan Fan Intelligence
  storylines?: {
    strength: string;
    vulnerability: string;
    mtaaVerdict: string;
  };
  fanVote?: {
    homeVotes: number;
    drawVotes: number;
    awayVotes: number;
    totalVotes: number;
  };

  revisionNumber: number;
  generatedAt: string;
  publishedAt: string;
  lastOddsUpdate?: string;
}

export interface BacktestFixtureRecord {
  fixtureId: string | number;
  matchDate: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  actualHomeScore: number;
  actualAwayScore: number;
  predictedHomeWinProb: number;
  predictedDrawProb: number;
  predictedAwayWinProb: number;
  predictedOver25Prob: number;
  predictedBttsProb: number;
  marketHomeOdds?: number;
  marketDrawOdds?: number;
  marketAwayOdds?: number;
  recommendation: RecommendationStatus;
  marketSelection?: SelectionType;
  edgePercentage?: number;
}

export interface CalibrationBucket {
  bucketRange: string; // e.g. "0% - 10%"
  minProb: number;
  maxProb: number;
  predictionCount: number;
  avgPredictedProb: number;
  actualWinFrequency: number;
  calibrationError: number;
}

export interface BacktestSummary {
  modelVersion: string;
  totalMatches: number;
  totalPredictions: number;
  brierScore: number;
  logLoss: number;
  accuracy: number;
  calibrationBuckets: CalibrationBucket[];
  simulatedRoiPercentage: number;
  totalHypotheticalUnitsProfit: number;
  longestWinningStreak: number;
  longestLosingStreak: number;
  maxDrawdownPercentage: number;
  sampleSizeWarning: boolean;
  leagueBreakdown: Record<string, { matches: number; roi: number; brier: number }>;
}

export interface EdgeConfigThresholds {
  strongEdgeMinEv: number; // 0.08
  moderateEdgeMinEv: number; // 0.05
  smallEdgeMinEv: number; // 0.03
  minDataQualityScore: DataQualityScore;
  minConfidence: ConfidenceLevel;
}

export const DEFAULT_THRESHOLDS: EdgeConfigThresholds = {
  strongEdgeMinEv: 0.08,
  moderateEdgeMinEv: 0.05,
  smallEdgeMinEv: 0.03,
  minDataQualityScore: "Good",
  minConfidence: "Medium",
};
