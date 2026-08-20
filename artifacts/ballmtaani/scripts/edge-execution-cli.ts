/**
 * BallMtaani Edge CLI — Controlled Public Launch, Partnerships & Expansion CLI
 * Usage: npx tsx scripts/edge-execution-cli.ts [wave|social|partnerships|activation|expansion]
 */

import { LaunchWaveService } from "../src/lib/edge/waves/launch-wave-service";
import { SocialCardGenerator } from "../src/lib/edge/marketing/social-card-generator";
import { PartnershipPipelineService } from "../src/lib/edge/partnerships/partnership-pipeline-service";
import { UserActivationEngine } from "../src/lib/edge/activation/user-activation-engine";
import { ExpansionScorecardEngine } from "../src/lib/edge/expansion/expansion-scorecard-engine";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "wave";

  console.log("\n=======================================================");
  console.log("  BALLMTAANI EDGE — COMMERCIAL EXECUTION & EXPANSION CLI");
  console.log("=======================================================\n");

  if (command === "wave") {
    const wave = LaunchWaveService.getActiveLaunchWave();
    const eligibility = LaunchWaveService.checkSubscriberEnrolmentEligibility("usr-new-001");

    console.log("Active Launch Wave Status:");
    console.log(` - Wave Name: ${wave.name}`);
    console.log(` - Current Stage: ${wave.stage.toUpperCase()}`);
    console.log(` - Subscriber Ceiling: ${wave.currentSubscriberCount.toLocaleString()} / ${wave.subscriberLimit.toLocaleString()}`);
    console.log(` - Enrolment Check: ${eligibility.reason}`);
    return;
  }

  if (command === "social") {
    const card = SocialCardGenerator.generateSocialCard({
      fixtureId: "fix-premier-101",
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      homeWinProb: 0.55,
      drawProb: 0.25,
      awayWinProb: 0.20,
      confidence: "HIGH",
    });

    console.log("Social Prediction Card Data Generated:");
    console.log(` - Fixture: ${card.homeTeam} vs ${card.awayTeam}`);
    console.log(` - Probabilities: ${Math.round(card.homeWinProb * 100)}% - ${Math.round(card.drawProb * 100)}% - ${Math.round(card.awayWinProb * 100)}%`);
    console.log(` - Model Version: ${card.modelVersion}`);
    console.log(` - Disclaimer: ${card.disclaimer}`);
    return;
  }

  if (command === "partnerships") {
    const opp = PartnershipPipelineService.evaluateOpportunity("Safaricom SuperApp", "telecom");
    const proposal = PartnershipPipelineService.generateCommercialProposal(opp.id, 50000);

    console.log("B2B Strategic Partnership Opportunity Evaluation:");
    console.log(` - Partner: ${opp.organizationName} (${opp.partnerType.toUpperCase()})`);
    console.log(` - Strategic Score: ${opp.overallStrategicScore} / 100`);
    console.log(` - Proposed Monthly Price: KES ${proposal.proposedMonthlyPriceKes.toLocaleString()}`);
    console.log(` - Expected Net Contribution: KES ${proposal.estimatedContributionKes.toLocaleString()}`);
    return;
  }

  if (command === "activation") {
    const activation = UserActivationEngine.evaluateUserActivation("usr-sub-88");
    const health = UserActivationEngine.calculateSubscriberHealthScore("usr-sub-88");

    console.log("User Activation & Health Score Metrics:");
    console.log(` - User ID: ${activation.userId}`);
    console.log(` - Fully Activated: ${activation.isFullyActivated}`);
    console.log(` - Subscriber Health: ${health.healthCategory.toUpperCase()} (${health.score}/100)`);
    return;
  }

  if (command === "expansion") {
    const compScore = ExpansionScorecardEngine.evaluateExpansionCandidate("French Ligue 1", "competition");
    const countryScore = ExpansionScorecardEngine.evaluateExpansionCandidate("Tanzania", "country");

    console.log("Expansion Scorecards Evaluation:");
    console.log(` - Competition: ${compScore.targetName} -> Overall Score: ${compScore.overallScore}/100 (${compScore.recommendedDecision.toUpperCase()})`);
    console.log(` - Country: ${countryScore.targetName} -> Overall Score: ${countryScore.overallScore}/100 (${countryScore.recommendedDecision.toUpperCase()})`);
    return;
  }

  console.log(`Unknown command '${command}'. Use: wave, social, partnerships, activation, expansion.`);
}

main().catch((err) => {
  console.error("CLI Error:", err);
  process.exit(1);
});
