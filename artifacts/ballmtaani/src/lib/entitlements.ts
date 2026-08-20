/**
 * BallMtaani Entitlements & Product Tier Engine
 * Configurable feature permissions and quotas for Free, Plus, and Pro tiers.
 */

export type ProductTier = "free" | "ballmtaani_plus" | "ballmtaani_pro";

export type FeatureKey =
  | "live_scores"
  | "predictions_basic"
  | "mchambuzi_ai_questions"
  | "reduced_ads"
  | "advanced_analysis"
  | "exportable_reports"
  | "creator_analytics";

export interface TierConfig {
  tier: ProductTier;
  label: string;
  features: FeatureKey[];
  aiQuestionDailyQuota: number; // -1 for unlimited
}

export const TIER_CONFIGS: Record<ProductTier, TierConfig> = {
  free: {
    tier: "free",
    label: "Free Matchday Pass",
    features: ["live_scores", "predictions_basic", "mchambuzi_ai_questions"],
    aiQuestionDailyQuota: 10,
  },
  ballmtaani_plus: {
    tier: "ballmtaani_plus",
    label: "BallMtaani Plus",
    features: ["live_scores", "predictions_basic", "mchambuzi_ai_questions", "reduced_ads", "advanced_analysis"],
    aiQuestionDailyQuota: 50,
  },
  ballmtaani_pro: {
    tier: "ballmtaani_pro",
    label: "BallMtaani Pro",
    features: ["live_scores", "predictions_basic", "mchambuzi_ai_questions", "reduced_ads", "advanced_analysis", "exportable_reports", "creator_analytics"],
    aiQuestionDailyQuota: -1,
  },
};

export function hasFeatureAccess(tier: ProductTier = "free", feature: FeatureKey): boolean {
  const config = TIER_CONFIGS[tier] || TIER_CONFIGS.free;
  return config.features.includes(feature);
}

export function getAiQuotaLimit(tier: ProductTier = "free"): number {
  const config = TIER_CONFIGS[tier] || TIER_CONFIGS.free;
  return config.aiQuestionDailyQuota;
}
