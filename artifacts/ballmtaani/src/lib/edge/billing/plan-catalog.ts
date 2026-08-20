/**
 * BallMtaani Edge Phase 6 — Central Plan Catalogue
 */

export interface EdgePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  priceAmount: number;
  currency: string;
  durationHours: number | null; // null for free
  billingType: "free" | "one_time" | "recurring_manual";
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  features: string[];
  entitlementKeys: string[];
  renewalAllowed: boolean;
  gracePeriodHours: number;
}

export const LAUNCH_SUBSCRIPTION_PLANS: EdgePlan[] = [
  {
    id: "plan-free",
    code: "free",
    name: "Free Preview",
    description: "Basic statistical football probabilities for selected daily matches.",
    priceAmount: 0,
    currency: "KES",
    durationHours: null,
    billingType: "free",
    isActive: true,
    isFeatured: false,
    displayOrder: 1,
    features: [
      "Selected daily fixtures",
      "Basic 1X2 probabilities",
      "Expected goals (xG)",
      "Public performance ledger",
    ],
    entitlementKeys: ["edge.basic_predictions"],
    renewalAllowed: false,
    gracePeriodHours: 0,
  },
  {
    id: "plan-matchday-pass",
    code: "matchday_pass",
    name: "Match-Day Pass",
    description: "24-hour full access to all match predictions, scorelines, and risk factors.",
    priceAmount: 20,
    currency: "KES",
    durationHours: 24,
    billingType: "one_time",
    isActive: true,
    isFeatured: false,
    displayOrder: 2,
    features: [
      "24-Hour Full Access",
      "Full 1X2 Probabilities",
      "Over/Under 2.5 & BTTS",
      "Top Likely Scorelines",
      "Risk Factors & Revisions",
    ],
    entitlementKeys: [
      "edge.basic_predictions",
      "edge.full_1x2",
      "edge.goals_markets",
      "edge.btts",
      "edge.likely_scores",
      "edge.full_analysis",
      "edge.risk_factors",
      "edge.revisions",
    ],
    renewalAllowed: true,
    gracePeriodHours: 0,
  },
  {
    id: "plan-weekly-edge",
    code: "weekly_edge",
    name: "Weekly Edge",
    description: "7-day complete access to all supported competitions and full prediction archive.",
    priceAmount: 99,
    currency: "KES",
    durationHours: 168, // 7 * 24
    billingType: "one_time",
    isActive: true,
    isFeatured: true,
    displayOrder: 3,
    features: [
      "7-Day Unrestricted Access",
      "All Supported Competitions",
      "Full Prediction Archive",
      "Updated Prediction Revisions",
      "Early Access Predictions",
    ],
    entitlementKeys: [
      "edge.basic_predictions",
      "edge.full_1x2",
      "edge.goals_markets",
      "edge.btts",
      "edge.likely_scores",
      "edge.full_analysis",
      "edge.risk_factors",
      "edge.revisions",
      "edge.early_access",
      "edge.full_archive",
    ],
    renewalAllowed: true,
    gracePeriodHours: 6,
  },
  {
    id: "plan-edge-pro",
    code: "edge_pro",
    name: "Edge Pro",
    description: "30-day VIP access with fair odds estimation, value analysis, and priority alerts.",
    priceAmount: 399,
    currency: "KES",
    durationHours: 720, // 30 * 24
    billingType: "one_time",
    isActive: true,
    isFeatured: false,
    displayOrder: 4,
    features: [
      "30-Day VIP Access",
      "Fair Odds & Value Analysis",
      "Priority Notification Preparation",
      "Saved Matches & Full Archive",
    ],
    entitlementKeys: [
      "edge.basic_predictions",
      "edge.full_1x2",
      "edge.goals_markets",
      "edge.btts",
      "edge.likely_scores",
      "edge.full_analysis",
      "edge.risk_factors",
      "edge.revisions",
      "edge.early_access",
      "edge.full_archive",
      "edge.fair_odds",
      "edge.value_analysis",
    ],
    renewalAllowed: true,
    gracePeriodHours: 24,
  },
];

export function getAllActivePlans(): EdgePlan[] {
  return LAUNCH_SUBSCRIPTION_PLANS.filter((p) => p.isActive);
}

export function getPlanByCode(code: string): EdgePlan | null {
  return LAUNCH_SUBSCRIPTION_PLANS.find((p) => p.code === code) || null;
}
