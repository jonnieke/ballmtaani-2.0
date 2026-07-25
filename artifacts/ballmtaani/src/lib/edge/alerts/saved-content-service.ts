/**
 * BallMtaani Edge Phase 7 — Saved Content & Plan Capacity Service
 */

import { getPlanByCode } from "../billing/plan-catalog";
import { EntitlementService } from "../billing/entitlement-service";

export interface SavedMatchRecord {
  id: string;
  userId: string;
  fixtureId: string;
  savedAt: string;
}

const IN_MEMORY_SAVED_MATCHES = new Map<string, SavedMatchRecord[]>();

export class SavedContentService {
  static async getSavedMatchCapacity(userId: string | null): Promise<number> {
    if (!userId) return 3; // Anonymous default limit

    const sub = await EntitlementService.getActiveSubscription(userId);
    if (!sub) return 3; // Free plan limit: 3 saved matches

    if (sub.planCode === "matchday_pass") return 10;
    if (sub.planCode === "weekly_edge") return 25;
    if (sub.planCode === "edge_pro") return 100;

    return 3;
  }

  static async getSavedMatches(userId: string): Promise<SavedMatchRecord[]> {
    return IN_MEMORY_SAVED_MATCHES.get(userId) || [];
  }

  static async saveMatch(userId: string, fixtureId: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.getSavedMatches(userId);
    if (existing.some((m) => String(m.fixtureId) === String(fixtureId))) {
      return { success: true, message: "Match already saved." };
    }

    const capacity = await this.getSavedMatchCapacity(userId);
    if (existing.length >= capacity) {
      return {
        success: false,
        message: `Saved matches capacity limit (${capacity}) reached for your current plan. Upgrade to save more matches.`,
      };
    }

    const record: SavedMatchRecord = {
      id: `SAVED-${Date.now()}`,
      userId,
      fixtureId,
      savedAt: new Date().toISOString(),
    };

    existing.push(record);
    IN_MEMORY_SAVED_MATCHES.set(userId, existing);

    return { success: true, message: "Match saved to your Edge watchlist." };
  }

  static async unsaveMatch(userId: string, fixtureId: string): Promise<void> {
    const existing = await this.getSavedMatches(userId);
    const filtered = existing.filter((m) => String(m.fixtureId) !== String(fixtureId));
    IN_MEMORY_SAVED_MATCHES.set(userId, filtered);
  }
}
