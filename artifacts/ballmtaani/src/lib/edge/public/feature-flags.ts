/**
 * BallMtaani Edge Phase 6 — Central Feature Flag Configuration
 */

export interface EdgeFeatureFlags {
  EDGE_PUBLIC_ENABLED: boolean;
  EDGE_PERFORMANCE_ENABLED: boolean;
  EDGE_MODELS_ENABLED: boolean;
  EDGE_ARCHIVE_ENABLED: boolean;
  EDGE_PRICING_PREVIEW_ENABLED: boolean;
  EDGE_PAYMENTS_ENABLED: boolean; // Activated in Phase 6
  EDGE_PREMIUM_ENABLED: boolean; // Activated in Phase 6
  EDGE_ODDS_DISPLAY_ENABLED: boolean;
  EDGE_VALUE_DISPLAY_ENABLED: boolean;
  EDGE_PUBLIC_ROI_ENABLED: boolean;
  EDGE_EDITORIAL_NOTES_ENABLED: boolean;
}

export const DEFAULT_EDGE_FEATURE_FLAGS: EdgeFeatureFlags = {
  EDGE_PUBLIC_ENABLED: true,
  EDGE_PERFORMANCE_ENABLED: true,
  EDGE_MODELS_ENABLED: true,
  EDGE_ARCHIVE_ENABLED: true,
  EDGE_PRICING_PREVIEW_ENABLED: true,
  EDGE_PAYMENTS_ENABLED: true, // Phase 6 payment & STK push initiation active
  EDGE_PREMIUM_ENABLED: true, // Phase 6 server-side entitlement checks active
  EDGE_ODDS_DISPLAY_ENABLED: false,
  EDGE_VALUE_DISPLAY_ENABLED: false,
  EDGE_PUBLIC_ROI_ENABLED: true,
  EDGE_EDITORIAL_NOTES_ENABLED: true,
};

export function getEdgeFeatureFlag<K extends keyof EdgeFeatureFlags>(key: K): boolean {
  return DEFAULT_EDGE_FEATURE_FLAGS[key];
}
