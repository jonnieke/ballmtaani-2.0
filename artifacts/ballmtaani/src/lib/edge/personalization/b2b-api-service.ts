/**
 * BallMtaani Edge Phase 8 — B2B Partner API Service
 */

import { createHash } from "crypto";

export interface ApiKeyRecord {
  id: string;
  clientId: string;
  keyPrefix: string;
  keyHash: string;
  allowedOrigins: string[];
  rateLimitPerMinute: number;
  dailyLimit: number;
  requestCountToday: number;
}

const IN_MEMORY_API_KEYS = new Map<string, ApiKeyRecord>(); // keyHash -> record

export class B2BApiService {
  static hashKey(rawKey: string): string {
    return createHash("sha256").update(rawKey).digest("hex");
  }

  static generateApiKey(clientId: string, allowedOrigins: string[] = ["*"]): { rawKey: string; keyPrefix: string } {
    const rawKey = `bm_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    const keyPrefix = rawKey.slice(0, 12);
    const keyHash = this.hashKey(rawKey);

    const record: ApiKeyRecord = {
      id: `KEY-${Date.now()}`,
      clientId,
      keyPrefix,
      keyHash,
      allowedOrigins,
      rateLimitPerMinute: 60,
      dailyLimit: 10000,
      requestCountToday: 0,
    };

    IN_MEMORY_API_KEYS.set(keyHash, record);
    return { rawKey, keyPrefix };
  }

  static authenticateApiKey(rawKey: string, origin: string = "*"): { authenticated: boolean; error?: string } {
    const hash = this.hashKey(rawKey);
    const record = IN_MEMORY_API_KEYS.get(hash);

    if (!record) {
      return { authenticated: false, error: "Invalid B2B API Key provided." };
    }

    if (record.requestCountToday >= record.dailyLimit) {
      return { authenticated: false, error: "Daily API request quota exceeded." };
    }

    if (!record.allowedOrigins.includes("*") && !record.allowedOrigins.includes(origin)) {
      return { authenticated: false, error: `Domain '${origin}' is not in allowed origins.` };
    }

    record.requestCountToday += 1;
    return { authenticated: true };
  }
}
