/**
 * BallMtaani Edge CLI — Personalization, Localization, Referrals & B2B Engine
 * Usage: npx tsx scripts/edge-personalization-cli.ts [recommendations|language|referrals|b2b]
 */

import { rankPersonalizedRecommendations } from "../src/lib/edge/personalization/recommendation-engine";
import { generateMultilingualExplanation } from "../src/lib/edge/personalization/multilingual-explanation-engine";
import { ReferralService } from "../src/lib/edge/personalization/referral-service";
import { B2BApiService } from "../src/lib/edge/personalization/b2b-api-service";
import { WidgetDeliveryService } from "../src/lib/edge/personalization/widget-delivery-service";
import { MOCK_PUBLISHED_PREDICTIONS } from "../src/lib/edge/public/public-api-service";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "recommendations";

  console.log("\n=======================================================");
  console.log("  BALLMTAANI EDGE — PERSONALIZATION & B2B CLI");
  console.log("=======================================================\n");

  if (command === "recommendations") {
    const ranked = rankPersonalizedRecommendations(MOCK_PUBLISHED_PREDICTIONS, {
      userId: "usr-cli",
      followedTeams: ["Arsenal"],
      followedCompetitions: ["Premier League"],
      savedFixtureIds: ["epl-201"],
      mutedTeams: [],
      mutedCompetitions: [],
    });

    console.log("Ranked Recommendation Feed:");
    ranked.forEach((r, idx) => {
      console.log(` #${idx + 1} [Score: ${r.score}] ${r.prediction.homeTeam} vs ${r.prediction.awayTeam} — ${r.reason}`);
    });
    return;
  }

  if (command === "language") {
    const pred = MOCK_PUBLISHED_PREDICTIONS[0];
    const en = generateMultilingualExplanation(pred, "en");
    const sw = generateMultilingualExplanation(pred, "sw");
    const sh = generateMultilingualExplanation(pred, "sh");

    console.log("Multilingual Match Explanations (Arsenal vs Liverpool):");
    console.log(`\n [English (EN)]: ${en.summary}`);
    console.log(` [Kiswahili (SW)]: ${sw.summary}`);
    console.log(` [Sheng (SH)]: ${sh.summary}`);
    return;
  }

  if (command === "referrals") {
    const code = ReferralService.getOrCreateReferralCode("usr-referrer-1");
    console.log(`Generated Referral Code: ${code}`);

    const attRes = ReferralService.trackReferralRegistration("usr-referrer-1", "usr-referred-2", code);
    console.log(`Attribution Registration: ${attRes.message}`);

    const payRes = ReferralService.processQualifyingPayment("usr-referred-2", 99);
    console.log(`Qualifying Payment Processing: ${payRes.message}`);
    return;
  }

  if (command === "b2b") {
    const key = B2BApiService.generateApiKey("pub-media-1", ["standardmedia.co.ke"]);
    console.log(`Generated SHA-256 Hashed B2B Key: Prefix = ${key.keyPrefix}`);

    const authRes = B2BApiService.authenticateApiKey(key.rawKey, "standardmedia.co.ke");
    console.log(`API Key Domain Auth Result: ${authRes.authenticated ? "Success" : "Failed"}`);

    const widget = WidgetDeliveryService.generateMatchCardWidget(MOCK_PUBLISHED_PREDICTIONS[0], "standardmedia.co.ke", ["standardmedia.co.ke"]);
    console.log(`Widget Payload Generated: Type = ${(widget as any).widgetType}`);
    return;
  }

  console.log(`Unknown command '${command}'. Use: recommendations, language, referrals, b2b.`);
}

main().catch((err) => {
  console.error("CLI Error:", err);
  process.exit(1);
});
