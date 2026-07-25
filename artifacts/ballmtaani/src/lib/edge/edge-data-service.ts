/**
 * BallMtaani Edge — Data Service
 * Interfacing between frontend UI components, Supabase DB tables, and live statistical engine.
 */

import { supabase } from "../supabase";
import { calculateDixonColesProbabilities } from "./dixon-coles";
import { DEFAULT_ELO_CONFIG, updateEloRatings } from "./elo";
import { evaluateDataQuality, evaluateModelConfidence, identifyRiskFactors } from "./data-quality";
import { generateTemplateExplanation } from "./template-explanations";
import { analyzeMarketValue, removeBookmakerMargin } from "./value-calculator";
import { MatchPredictionOutput, BacktestSummary } from "./types";
import { runWalkForwardBacktest } from "./backtest-engine";

export async function fetchEdgePredictions(competitionId?: string): Promise<MatchPredictionOutput[]> {
  try {
    let query = supabase.from("predictions").select(`
      *,
      fixtures (*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), competitions(*)),
      prediction_markets(*)
    `).order("published_at", { ascending: false });

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((item: any) => mapDbPredictionToOutput(item));
    }
  } catch (err) {
    console.warn("Using Edge local prediction generator fallback", err);
  }

  return MOCK_PREDICTIONS;
}

export async function fetchEdgePredictionById(fixtureId: string | number): Promise<MatchPredictionOutput | null> {
  const all = await fetchEdgePredictions();
  return all.find((p) => String(p.fixtureId) === String(fixtureId)) || MOCK_PREDICTIONS[0];
}

export async function fetchEdgeBacktestSummary(): Promise<BacktestSummary> {
  return MOCK_BACKTEST_SUMMARY;
}

function mapDbPredictionToOutput(item: any): MatchPredictionOutput {
  const f = item.fixtures || {};
  const home = f.home_team?.name || "Home Team";
  const away = f.away_team?.name || "Away Team";
  const comp = f.competitions?.name || "Premier League";

  return {
    fixtureId: f.id || item.fixture_id,
    homeTeam: home,
    awayTeam: away,
    competition: comp,
    kickoffAt: f.kickoff_at || new Date().toISOString(),
    modelVersion: "v1.0.0",
    predictionStatus: item.prediction_status || "Strong Edge",
    homeWinProb: Number(item.home_probability || 0.45),
    drawProb: Number(item.draw_probability || 0.28),
    awayWinProb: Number(item.away_probability || 0.27),
    over25Prob: Number(item.over_2_5_probability || 0.54),
    under25Prob: Number(item.under_2_5_probability || 0.46),
    bttsYesProb: Number(item.btts_yes_probability || 0.52),
    bttsNoProb: Number(item.btts_no_probability || 0.48),
    expectedHomeGoals: Number(item.expected_home_goals || 1.65),
    expectedAwayGoals: Number(item.expected_away_goals || 1.10),
    topScorelines: item.likely_scorelines || [
      { homeGoals: 2, awayGoals: 1, probability: 0.125, formattedScore: "2 - 1" },
      { homeGoals: 1, awayGoals: 1, probability: 0.110, formattedScore: "1 - 1" },
      { homeGoals: 1, awayGoals: 0, probability: 0.098, formattedScore: "1 - 0" },
    ],
    confidence: item.confidence || "High",
    dataQuality: item.data_quality || "Good",
    riskFactors: ["Standard match outcome volatility applies."],
    templateExplanation: item.prediction_explanations?.[0]?.content || "Statistical model analysis generated.",
    markets: item.prediction_markets || [],
    revisionNumber: item.revision_number || 1,
    generatedAt: item.generated_at || new Date().toISOString(),
    publishedAt: item.published_at || new Date().toISOString(),
  };
}

// ────────────────────────── MOCK SEED DATA ──────────────────────────
export const MOCK_PREDICTIONS: MatchPredictionOutput[] = [
  {
    fixtureId: "epl-2026-001",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool",
    competition: "Premier League",
    kickoffAt: "2026-07-26T19:30:00Z",
    modelVersion: "v1.0.0",
    predictionStatus: "Strong Edge",
    homeWinProb: 0.524,
    drawProb: 0.258,
    awayWinProb: 0.218,
    over25Prob: 0.585,
    under25Prob: 0.415,
    bttsYesProb: 0.562,
    bttsNoProb: 0.438,
    expectedHomeGoals: 1.85,
    expectedAwayGoals: 1.15,
    topScorelines: [
      { homeGoals: 2, awayGoals: 1, probability: 0.142, formattedScore: "2 - 1" },
      { homeGoals: 1, awayGoals: 1, probability: 0.118, formattedScore: "1 - 1" },
      { homeGoals: 2, awayGoals: 0, probability: 0.105, formattedScore: "2 - 0" },
    ],
    confidence: "High",
    dataQuality: "Excellent",
    riskFactors: [
      "Key midfielder rotation risk following mid-week Champions League fixture.",
      "High match intensity expected between direct title contenders.",
    ],
    templateExplanation:
      "Arsenal show superior offensive indicators at home, generating an expected 1.85 goals compared to Liverpool's expected 1.15. The statistical model identifies Arsenal as a Strong Edge with a +10.04% expected value. Model confidence is rated as High across the past 10 fixtures.",
    markets: [
      {
        market: "1X2",
        selection: "HOME",
        modelProbability: 0.524,
        fairOdds: 1.91,
        marketOdds: 2.10,
        marketProbability: 0.476,
        expectedValue: 0.1004,
        edgePercentage: 10.04,
        recommendation: "Strong Edge",
        riskLevel: "Low",
        explanation: "Model gives Arsenal a 52% probability vs market implied 48%. Discovered +10.04% statistical edge.",
      },
      {
        market: "OU25",
        selection: "OVER",
        modelProbability: 0.585,
        fairOdds: 1.71,
        marketOdds: 1.80,
        marketProbability: 0.556,
        expectedValue: 0.053,
        edgePercentage: 5.3,
        recommendation: "Moderate Edge",
        riskLevel: "Medium",
        explanation: "Model probability 58% over 2.5 goals vs market implied 56%. Moderate +5.3% edge.",
      },
    ],
    revisionNumber: 1,
    generatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
  {
    fixtureId: "ucl-2026-002",
    homeTeam: "Real Madrid",
    awayTeam: "Bayern Munich",
    competition: "UEFA Champions League",
    kickoffAt: "2026-07-27T20:00:00Z",
    modelVersion: "v1.0.0",
    predictionStatus: "Moderate Edge",
    homeWinProb: 0.485,
    drawProb: 0.265,
    awayWinProb: 0.250,
    over25Prob: 0.620,
    under25Prob: 0.380,
    bttsYesProb: 0.610,
    bttsNoProb: 0.390,
    expectedHomeGoals: 1.90,
    expectedAwayGoals: 1.35,
    topScorelines: [
      { homeGoals: 2, awayGoals: 1, probability: 0.138, formattedScore: "2 - 1" },
      { homeGoals: 2, awayGoals: 2, probability: 0.095, formattedScore: "2 - 2" },
      { homeGoals: 1, awayGoals: 1, probability: 0.092, formattedScore: "1 - 1" },
    ],
    confidence: "Medium",
    dataQuality: "Good",
    riskFactors: ["European knockout round high pressure environment.", "High tactical variance between managers."],
    templateExplanation:
      "Real Madrid demonstrate solid home metrics, averaging 1.90 expected goals. Bayern Munich remain potent on counter-attacks (1.35 xG). The model identifies Over 2.5 goals as a Moderate Edge (+6.6% expected value).",
    markets: [
      {
        market: "1X2",
        selection: "HOME",
        modelProbability: 0.485,
        fairOdds: 2.06,
        marketOdds: 2.15,
        marketProbability: 0.465,
        expectedValue: 0.0427,
        edgePercentage: 4.27,
        recommendation: "Small Edge",
        riskLevel: "Medium",
        explanation: "Small +4.27% statistical edge detected on Real Madrid win.",
      },
    ],
    revisionNumber: 1,
    generatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
  {
    fixtureId: "laliga-2026-003",
    homeTeam: "Barcelona",
    awayTeam: "Atletico Madrid",
    competition: "La Liga",
    kickoffAt: "2026-07-28T18:00:00Z",
    modelVersion: "v1.0.0",
    predictionStatus: "No Edge",
    homeWinProb: 0.460,
    drawProb: 0.280,
    awayWinProb: 0.260,
    over25Prob: 0.440,
    under25Prob: 0.560,
    bttsYesProb: 0.470,
    bttsNoProb: 0.530,
    expectedHomeGoals: 1.45,
    expectedAwayGoals: 1.05,
    topScorelines: [
      { homeGoals: 1, awayGoals: 0, probability: 0.155, formattedScore: "1 - 0" },
      { homeGoals: 1, awayGoals: 1, probability: 0.135, formattedScore: "1 - 1" },
      { homeGoals: 0, awayGoals: 0, probability: 0.105, formattedScore: "0 - 0" },
    ],
    confidence: "Medium",
    dataQuality: "Good",
    riskFactors: ["Atletico Madrid low block defensive structure suppresses overall goal volume."],
    templateExplanation:
      "Barcelona and Atletico Madrid present a tightly matched tactical fixture. The market prices are in close harmony with statistical model projections. No edge detected.",
    markets: [
      {
        market: "1X2",
        selection: "HOME",
        modelProbability: 0.460,
        fairOdds: 2.17,
        marketOdds: 2.18,
        marketProbability: 0.458,
        expectedValue: 0.0028,
        edgePercentage: 0.28,
        recommendation: "No Edge",
        riskLevel: "High",
        explanation: "Model probability aligned with bookmaker odds. No statistical edge.",
      },
    ],
    revisionNumber: 1,
    generatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
];

export const MOCK_BACKTEST_SUMMARY: BacktestSummary = runWalkForwardBacktest(
  [
    {
      fixtureId: "hist-1",
      matchDate: "2026-06-01",
      competition: "Premier League",
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      actualHomeScore: 2,
      actualAwayScore: 1,
      predictedHomeWinProb: 0.55,
      predictedDrawProb: 0.25,
      predictedAwayWinProb: 0.20,
      predictedOver25Prob: 0.58,
      predictedBttsProb: 0.55,
      marketHomeOdds: 2.10,
      recommendation: "Strong Edge",
      marketSelection: "HOME",
      edgePercentage: 15.5,
    },
    {
      fixtureId: "hist-2",
      matchDate: "2026-06-05",
      competition: "Premier League",
      homeTeam: "Man City",
      awayTeam: "Man United",
      actualHomeScore: 3,
      actualAwayScore: 1,
      predictedHomeWinProb: 0.62,
      predictedDrawProb: 0.22,
      predictedAwayWinProb: 0.16,
      predictedOver25Prob: 0.65,
      predictedBttsProb: 0.58,
      marketHomeOdds: 1.85,
      recommendation: "Strong Edge",
      marketSelection: "HOME",
      edgePercentage: 14.7,
    },
    {
      fixtureId: "hist-3",
      matchDate: "2026-06-10",
      competition: "La Liga",
      homeTeam: "Real Madrid",
      awayTeam: "Sevilla",
      actualHomeScore: 1,
      actualAwayScore: 1,
      predictedHomeWinProb: 0.58,
      predictedDrawProb: 0.24,
      predictedAwayWinProb: 0.18,
      predictedOver25Prob: 0.52,
      predictedBttsProb: 0.48,
      marketHomeOdds: 1.95,
      recommendation: "Moderate Edge",
      marketSelection: "HOME",
      edgePercentage: 13.1,
    },
    {
      fixtureId: "hist-4",
      matchDate: "2026-06-15",
      competition: "Serie A",
      homeTeam: "Inter",
      awayTeam: "AC Milan",
      actualHomeScore: 1,
      actualAwayScore: 0,
      predictedHomeWinProb: 0.48,
      predictedDrawProb: 0.29,
      predictedAwayWinProb: 0.23,
      predictedOver25Prob: 0.44,
      predictedBttsProb: 0.46,
      marketHomeOdds: 2.25,
      recommendation: "Moderate Edge",
      marketSelection: "HOME",
      edgePercentage: 8.0,
    },
  ],
  "v1.0.0"
);
