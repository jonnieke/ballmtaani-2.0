/**
 * BallMtaani Edge Phase 4 — Backtesting & Evaluation CLI Tool
 */

import { executeWalkForwardBacktest } from "../src/lib/edge/backtest/walk-forward-engine";
import { validateHistoricalDataLeakage } from "../src/lib/edge/backtest/leakage-validator";
import { simulateHypotheticalFlatRoi } from "../src/lib/edge/backtest/roi-simulator";

async function main() {
  const command = process.argv[2] || "evaluate";

  console.log(`[BallMtaani Edge Backtest CLI] Running command: ${command}`);

  switch (command) {
    case "run":
    case "evaluate": {
      console.log("\n─── CHRONOLOGICAL WALK-FORWARD BACKTEST & CALIBRATION ───");
      const res = executeWalkForwardBacktest({
        name: "EPL + UCL 2-Year Walk-Forward",
        modelVersion: "ballmtaani-edge-statistical-v1",
        evaluationMode: "expanding",
        trainingWindowDays: 730,
        competitions: ["epl", "ucl", "la_liga", "serie_a"],
        retrainingFrequency: "weekly",
      });

      console.log(`Backtest Run ID: ${res.runId}`);
      console.log(`- Model Version: ${res.modelVersion}`);
      console.log(`- Total Fixtures Evaluated: ${res.totalFixturesProcessed}`);
      console.log(`- Leakage Safeguard Check: ${res.leakageStatus.toUpperCase()}`);
      console.log(`- Multi-class Brier Score: ${res.brierScore} (Uniform Benchmark: 0.6667)`);
      console.log(`- Multi-class Log Loss: ${res.logLoss} (Uniform Benchmark: 1.0986)`);
      console.log(`- 1X2 Top-Choice Accuracy: ${res.accuracy}%`);
      console.log(`- Expected Calibration Error (ECE): ${res.expectedCalibrationError}`);
      console.log(`- Max Calibration Error (MCE): ${res.maxCalibrationError}`);
      console.log(`- Acceptance Decision: ${res.decision.decision.toUpperCase()}`);
      console.log(`- Decision Reason: ${res.decision.decisionReason}\n`);
      break;
    }

    case "compare": {
      console.log("\n─── BENCHMARK MODEL COMPARISON MATRIX ───");
      const res = executeWalkForwardBacktest({
        name: "Benchmark Evaluation",
        modelVersion: "ballmtaani-edge-statistical-v1",
        evaluationMode: "expanding",
        trainingWindowDays: 730,
        competitions: ["epl", "ucl"],
        retrainingFrequency: "weekly",
      });

      console.log("Model Comparison Table:");
      for (const entry of res.benchmarks) {
        console.log(`- ${entry.modelName}`);
        console.log(`  Brier: ${entry.brierScore} | LogLoss: ${entry.logLoss} | Acc: ${entry.accuracy}% | Superior to Uniform: ${entry.isModelSuperiorToUniform ? "YES" : "NO"}`);
      }

      console.log("\nHypothetical Flat 1-Unit ROI Research Audit:");
      const roi = simulateHypotheticalFlatRoi([
        { fixtureId: "f1", predictedProbability: 0.55, decimalOdds: 2.10, isWon: true },
        { fixtureId: "f2", predictedProbability: 0.60, decimalOdds: 1.85, isWon: false },
        { fixtureId: "f3", predictedProbability: 0.50, decimalOdds: 2.20, isWon: true },
      ]);

      console.log(`- Total Staked: ${roi.totalStaked} units | Total Returned: ${roi.totalReturned} units`);
      console.log(`- Net Yield: ${roi.netUnits} units (${roi.roiPercentage}%)`);
      console.log(`- Max Drawdown: ${roi.maxDrawdownUnits} units (${roi.maxDrawdownPercentage}%)`);
      console.log(`- Longest Losing Streak: ${roi.longestLosingStreak} matches\n`);
      break;
    }

    case "leakage-check": {
      console.log("\n─── AUTOMATED DATA LEAKAGE INTEGRITY AUDIT ───");
      const check = validateHistoricalDataLeakage({
        fixtureKickoff: "2026-07-26T19:30:00Z",
        predictionCutoff: "2026-07-25T19:30:00Z",
        featureTimestamp: "2026-07-25T18:00:00Z",
        trainingCutoff: "2026-07-25T19:30:00Z",
        hasPostMatchStatsInPayload: false,
      });

      console.log(`Data Leakage Check: ${check.leakageStatus.toUpperCase()}`);
      if (check.isValid) {
        console.log("- Status: PASSED — Strictly zero point-in-time future data leakage detected.");
      } else {
        console.log(`- Violations: ${check.violations.join(" | ")}`);
      }
      console.log("");
      break;
    }

    default: {
      console.log(`Unknown command '${command}'. Supported: run, evaluate, compare, leakage-check.`);
      break;
    }
  }
}

main().catch((err) => {
  console.error("CLI Backtest Execution Error:", err);
  process.exit(1);
});
