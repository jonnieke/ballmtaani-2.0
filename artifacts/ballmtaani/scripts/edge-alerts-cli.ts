/**
 * BallMtaani Edge CLI — Premium Alerts, Lineups & Retention Engine
 * Usage: npx tsx scripts/edge-alerts-cli.ts [materiality|lineup-impact|odds-movement|saved|router]
 */

import { calculateMaterialityScore } from "../src/lib/edge/alerts/materiality-engine";
import { calculateLineupImpactRevision } from "../src/lib/edge/alerts/lineup-impact-engine";
import { analyzeOddsMovement } from "../src/lib/edge/alerts/odds-movement-analyzer";
import { SavedContentService } from "../src/lib/edge/alerts/saved-content-service";
import { NotificationEventRouter } from "../src/lib/edge/alerts/notification-event-router";
import { generateFixturePrediction } from "../src/lib/edge/engine/prediction-generator";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "materiality";

  console.log("\n=======================================================");
  console.log("  BALLMTAANI EDGE — ALERTS, LINEUPS & RETENTION CLI");
  console.log("=======================================================\n");

  if (command === "materiality") {
    const score1 = calculateMaterialityScore({
      eventType: "prediction_revised",
      previousHomeProb: 0.52,
      newHomeProb: 0.44, // 8% shift
      previousOutcome: "HOME",
      newOutcome: "HOME",
    });

    const score2 = calculateMaterialityScore({
      eventType: "prediction_revised",
      previousHomeProb: 0.42,
      newHomeProb: 0.35,
      previousOutcome: "HOME",
      newOutcome: "AWAY", // Outcome flip!
    });

    console.log("Deterministic Materiality Score Evaluation:");
    console.log(` - 8% Win Probability Shift: Materiality Score = ${score1} / 100`);
    console.log(` - Predicted Outcome Flip (HOME -> AWAY): Materiality Score = ${score2} / 100`);
    return;
  }

  if (command === "lineup-impact") {
    const pred = generateFixturePrediction({
      fixtureId: "epl-301",
      homeTeam: "Arsenal",
      awayTeam: "Liverpool",
      competition: "Premier League",
      kickoffAt: new Date().toISOString(),
    });

    console.log(`Original Prediction: Arsenal Win ${Math.round(pred.homeWinProb * 100)}% | xG: ${pred.expectedHomeGoals} - ${pred.expectedAwayGoals}`);

    const impact = calculateLineupImpactRevision({
      currentPrediction: pred,
      homeStarters: [
        { playerName: "Bukayo Saka", position: "F", importanceScore: 9, isStarter: true },
        { playerName: "Gabriel Martinelli", position: "F", importanceScore: 8, isStarter: false }, // Key starter absent!
      ],
      awayStarters: [
        { playerName: "Mohamed Salah", position: "F", importanceScore: 9, isStarter: true },
      ],
      homeElo: 1620,
      awayElo: 1610,
      baseHomeAttack: 1.35,
      baseHomeDefence: 0.95,
      baseAwayAttack: 1.25,
      baseAwayDefence: 1.05,
    });

    console.log("\nConfirmed Lineup Impact Revision:");
    console.log(` Revision Number: #${impact.revisionNumber}`);
    console.log(` Absent Key Players: ${impact.absentHomeKeyPlayers.join(", ")}`);
    console.log(` Revised Win Probabilities: Arsenal ${Math.round(impact.revisedPrediction.homeWinProb * 100)}% | Liverpool ${Math.round(impact.revisedPrediction.awayWinProb * 100)}%`);
    console.log(` Impact Summary: ${impact.impactDescription}`);
    return;
  }

  if (command === "odds-movement") {
    const result = analyzeOddsMovement({
      fixtureId: "epl-301",
      market: "1X2",
      selection: "HOME",
      previousOdds: 2.30,
      currentOdds: 2.10, // 8.7% shortening
      modelFairOdds: 2.15,
    });

    console.log("Material Odds Movement Evaluation:");
    console.log(` Selection: ${result.selection} (${result.direction})`);
    console.log(` Movement: ${result.previousOdds} -> ${result.currentOdds} (${result.percentageChange}%)`);
    console.log(` Is Material: ${result.isMaterial}`);
    console.log(` Value Status Transition: ${result.valueStatusChange || "Unchanged"}`);
    console.log(` Explanation: ${result.explanation}`);
    return;
  }

  if (command === "saved") {
    const res1 = await SavedContentService.saveMatch("usr-cli-free", "epl-201");
    console.log(`Free User Save Result: ${res1.message}`);

    const capacity = await SavedContentService.getSavedMatchCapacity("usr-cli-free");
    console.log(`Free Plan Saved Match Capacity: ${capacity} matches`);
    return;
  }

  console.log(`Unknown command '${command}'. Use: materiality, lineup-impact, odds-movement, saved.`);
}

main().catch((err) => {
  console.error("CLI Error:", err);
  process.exit(1);
});
