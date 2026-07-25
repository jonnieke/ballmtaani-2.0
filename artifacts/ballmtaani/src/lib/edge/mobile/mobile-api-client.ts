/**
 * BallMtaani Edge Phase 9 — Typed Mobile API Client & Offline Cache Layer
 */

import { MatchPredictionOutput } from "../types";
import { MOCK_PUBLISHED_PREDICTIONS } from "../public/public-api-service";

export interface MobileCacheConfig {
  lowDataMode: boolean;
  cacheTtlMs: number;
}

export interface CachedPredictionResponse {
  data: MatchPredictionOutput[];
  isFromCache: boolean;
  freshnessLabel: string;
  lowDataMode: boolean;
}

const MOBILE_PREDICTION_CACHE = new Map<string, { data: MatchPredictionOutput[]; timestamp: number }>();

export class MobileApiClient {
  static async fetchPredictions(
    token?: string,
    config: MobileCacheConfig = { lowDataMode: false, cacheTtlMs: 3600000 }
  ): Promise<CachedPredictionResponse> {
    const cacheKey = "mobile_upcoming_predictions";
    const cached = MOBILE_PREDICTION_CACHE.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < config.cacheTtlMs) {
      const ageMinutes = Math.round((now - cached.timestamp) / 60000);
      return {
        data: cached.data,
        isFromCache: true,
        freshnessLabel: `Cached ${ageMinutes}m ago`,
        lowDataMode: config.lowDataMode,
      };
    }

    // Populate cache with published predictions
    MOBILE_PREDICTION_CACHE.set(cacheKey, { data: MOCK_PUBLISHED_PREDICTIONS, timestamp: now });

    return {
      data: MOCK_PUBLISHED_PREDICTIONS,
      isFromCache: false,
      freshnessLabel: "Live fresh data",
      lowDataMode: config.lowDataMode,
    };
  }

  static parseDeepLink(url: string): { route: string; fixtureId?: string } {
    if (url.startsWith("ballmtaani://edge/match/")) {
      const fixtureId = url.replace("ballmtaani://edge/match/", "");
      return { route: "match_detail", fixtureId };
    }
    if (url.startsWith("ballmtaani://edge/saved")) {
      return { route: "saved" };
    }
    return { route: "home" };
  }
}
