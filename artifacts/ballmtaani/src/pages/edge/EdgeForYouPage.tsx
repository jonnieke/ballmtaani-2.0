import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Sparkles, Heart, Users, ShieldCheck, ChevronRight, SlidersHorizontal } from "lucide-react";
import { MOCK_PUBLISHED_PREDICTIONS } from "../../lib/edge/public/public-api-service";
import { rankPersonalizedRecommendations } from "../../lib/edge/personalization/recommendation-engine";
import { generateMultilingualExplanation, SupportedLanguage } from "../../lib/edge/personalization/multilingual-explanation-engine";
import { LanguageSwitcher } from "../../components/edge/LanguageSwitcher";
import PredictionCard from "../../components/edge/PredictionCard";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeForYouPage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [followedTeams, setFollowedTeams] = useState<string[]>(["Arsenal", "Real Madrid"]);

  const ranked = rankPersonalizedRecommendations(MOCK_PUBLISHED_PREDICTIONS, {
    userId: "usr-current",
    followedTeams,
    followedCompetitions: ["Premier League", "UEFA Champions League"],
    savedFixtureIds: ["epl-201"],
    mutedTeams: [],
    mutedCompetitions: [],
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/edge/for-you" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Personalized For You
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
            <Link href="/edge/today">
              <Button variant="outline" size="sm" className="text-xs text-gray-300 border-white/20">
                All Matches
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Match Intelligence Feed</h1>
          <p className="text-xs text-gray-400">Fixtures tailored to your followed teams, competitions, and saved watchlist.</p>
        </div>

        {/* Personalized Recommendations Stream */}
        <div className="space-y-6">
          {ranked.map((rec) => {
            const explanation = generateMultilingualExplanation(rec.prediction, language);

            return (
              <div key={rec.prediction.fixtureId} className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                    {rec.reason}
                  </Badge>
                  <span className="text-gray-400">Score: {rec.score}</span>
                </div>

                <PredictionCard prediction={rec.prediction} />

                {/* Multilingual Explanation Card */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">
                    {language === "sw" ? "Uchanganuzi wa Modeli" : language === "sh" ? "Model Summary" : "Model Intelligence"}
                  </span>
                  <p className="text-gray-200 leading-relaxed font-sans">{explanation.summary}</p>
                  <p className="text-gray-400 leading-relaxed text-[11px] font-sans">{explanation.detailedExplanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
