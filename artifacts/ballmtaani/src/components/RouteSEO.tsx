import React from "react";

export interface RouteSEOProps {
  path: string;
}

const SEO_ROUTES: Record<string, { title: string; description: string }> = {
  "/": {
    title: "BallMtaani — The Heart of African Football News & Match Center",
    description: "Live scores, transfer updates, Sheng commentaries, and fan intelligence for KPL, EPL, Champions League & African football.",
  },
  "/edge": {
    title: "BallMtaani Edge — Smarter Football Predictions & Match Intelligence",
    description: "Explore match win probabilities, expected goals, likely scorelines, model confidence levels, and transparent public performance history.",
  },
  "/edge/today": {
    title: "Today's Football Predictions & Win Probabilities | BallMtaani Edge",
    description: "View today's football match probabilities, expected goals (xG), likely scorelines, and model confidence scores.",
  },
  "/edge/tomorrow": {
    title: "Tomorrow's Football Predictions & Match Analysis | BallMtaani Edge",
    description: "Preview tomorrow's football match win probabilities, expected goal totals, and model confidence levels.",
  },
  "/edge/upcoming": {
    title: "Upcoming Football Predictions & Match Analysis | BallMtaani Edge",
    description: "Browse upcoming football match win probabilities, expected goals (xG), and model analysis for Premier League, Champions League, La Liga, and Serie A.",
  },
  "/edge/performance": {
    title: "Public Prediction Performance Ledger & Audit Log | BallMtaani Edge",
    description: "Transparent public audit ledger tracking settled prediction Brier scores, log loss, 1X2 accuracy, and probability calibration history.",
  },
  "/edge/how-it-works": {
    title: "How BallMtaani Edge Works — Elo & Dixon-Coles Methodology",
    description: "Learn how BallMtaani Edge calculates team Elo ratings, Dixon-Coles Poisson expected goals, and probability calibration.",
  },
  "/edge/models": {
    title: "Active Model Version Registry & Transparency | BallMtaani Edge",
    description: "Inspect parameters, training windows, and evaluation metrics for active statistical prediction models.",
  },
  "/edge/pricing-preview": {
    title: "BallMtaani Edge Subscription Packages Preview",
    description: "Preview proposed subscription access packages for BallMtaani Edge including Match-Day Passes and Edge Pro.",
  },
};

export default function RouteSEO({ path }: RouteSEOProps) {
  const normPath = path.split("?")[0].toLowerCase();

  let seo = SEO_ROUTES[normPath];
  if (!seo && normPath.startsWith("/edge/match/")) {
    seo = {
      title: "Match Prediction & Probability Analysis | BallMtaani Edge",
      description: "Match win probabilities, expected goals (xG), likely scorelines, risk factors, and prediction revision history.",
    };
  }

  if (!seo) {
    seo = {
      title: "BallMtaani — African Football Platform",
      description: "African football news, live scores, fan engagement, and match intelligence.",
    };
  }

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content="BallMtaani" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
    </>
  );
}
