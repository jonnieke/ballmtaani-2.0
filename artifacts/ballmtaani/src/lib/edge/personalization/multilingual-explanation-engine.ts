/**
 * BallMtaani Edge Phase 8 — Multilingual Match Explanation Engine (EN / SW / SH)
 * Generates natural English, Kiswahili, and Sheng match intelligence explanations.
 */

import { MatchPredictionOutput } from "../types";

export type SupportedLanguage = "en" | "sw" | "sh";

export interface MultilingualExplanationOutput {
  language: SupportedLanguage;
  summary: string;
  detailedExplanation: string;
  disclaimer: string;
}

export function generateMultilingualExplanation(
  prediction: MatchPredictionOutput,
  lang: SupportedLanguage = "en"
): MultilingualExplanationOutput {
  const homeProb = Math.round(prediction.homeWinProb * 100);
  const drawProb = Math.round(prediction.drawProb * 100);
  const awayProb = Math.round(prediction.awayWinProb * 100);
  const totalXg = (prediction.expectedHomeGoals + prediction.expectedAwayGoals).toFixed(2);

  if (lang === "sw") {
    // Kiswahili Explanation
    const isHomeFav = prediction.homeWinProb >= prediction.awayWinProb;
    const favTeam = isHomeFav ? prediction.homeTeam : prediction.awayTeam;
    const favProb = isHomeFav ? homeProb : awayProb;

    const summary = `${favTeam} wana nafasi kubwa zaidi ya kushinda kwa asilimia ${favProb}%. Sare ina uwezekano wa asilimia ${drawProb}%.`;
    const detailedExplanation = `Mfumo wa BallMtaani Dixon-Coles unatarajia jumla ya mabao ${totalXg} katika mchezo huu wa ${prediction.competition}. Uhakika wa modeli ni ${prediction.confidence === "High" ? "kubwa" : "wa wastani"}.`;
    const disclaimer = "Uchanganuzi wa BallMtaani Edge unatolewa kwa msingi wa takwimu. Matokeo ya mpira wa miguu yana usawa na hayana uhakika 100%. (18+)";

    return { language: "sw", summary, detailedExplanation, disclaimer };
  }

  if (lang === "sh") {
    // Sheng Explanation
    const isHomeFav = prediction.homeWinProb >= prediction.awayWinProb;
    const favTeam = isHomeFav ? prediction.homeTeam : prediction.awayTeam;
    const favProb = isHomeFav ? homeProb : awayProb;

    const summary = `${favTeam} wako mbele kidogo kwa model na chance ya ${favProb}%. Draw bado iko na nguvu ya ${drawProb}%.`;
    const detailedExplanation = `Model ya Dixon-Coles inaona total expected goals za ${totalXg} kwa hii match ya ${prediction.competition}. Model confidence iko ${prediction.confidence}.`;
    const disclaimer = "BallMtaani Edge inapeana statistical data-driven predictions. Hakuna mechi ya sure win au banker. Cheza kwa mecho wazi. (18+)";

    return { language: "sh", summary, detailedExplanation, disclaimer };
  }

  // Default English Explanation
  const isHomeFav = prediction.homeWinProb >= prediction.awayWinProb;
  const favTeam = isHomeFav ? prediction.homeTeam : prediction.awayTeam;
  const favProb = isHomeFav ? homeProb : awayProb;

  const summary = `${favTeam} are favoured with a ${favProb}% win probability. The draw probability stands at ${drawProb}%.`;
  const detailedExplanation = `The Dixon-Coles bivariate Poisson model projects a total match expectation of ${totalXg} goals for this ${prediction.competition} fixture.`;
  const disclaimer = "BallMtaani Edge provides transparent statistical predictions for match intelligence. Football outcomes remain uncertain. (18+)";

  return { language: "en", summary, detailedExplanation, disclaimer };
}
