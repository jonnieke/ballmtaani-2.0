/**
 * BallMtaani User Preference Engine
 * Manages local anonymous state & syncs with Supabase database for authenticated fans.
 */

import { supabase } from "./supabase";

export interface FanPreferences {
  followedTeams: string[];
  primaryTeam: string | null;
  followedLeagues: string[];
  language: string;
  timezone: string;
  onboardingCompleted: boolean;
}

const LOCAL_STORAGE_KEY = "ballmtaani_fan_prefs_v1";

export const DEFAULT_PREFERENCES: FanPreferences = {
  followedTeams: ["arsenal", "gor-mahia"],
  primaryTeam: "arsenal",
  followedLeagues: ["premier-league", "fkf-premier-league", "champions-league"],
  language: "en",
  timezone: "Africa/Nairobi",
  onboardingCompleted: false,
};

/**
 * Get preferences from LocalStorage for anonymous visitors
 */
export function getLocalPreferences(): FanPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read local preferences:", err);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save preferences to LocalStorage for anonymous visitors
 */
export function saveLocalPreferences(prefs: Partial<FanPreferences>): FanPreferences {
  const current = getLocalPreferences();
  const updated: FanPreferences = { ...current, ...prefs };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save local preferences:", err);
    }
  }
  return updated;
}

/**
 * Merge anonymous local preferences into authenticated Supabase account without duplicating entries
 */
export async function mergeAnonymousPreferences(userId: string): Promise<FanPreferences> {
  const local = getLocalPreferences();
  
  if (!supabase) return local;

  try {
    // 1. Sync favourite teams
    for (const teamId of local.followedTeams) {
      const isPrimary = teamId === local.primaryTeam;
      await supabase
        .from("user_favourite_teams")
        .upsert(
          { user_id: userId, team_id: teamId, is_primary: isPrimary },
          { onConflict: "user_id, team_id" }
        );
    }

    // 2. Sync favourite leagues
    for (const leagueId of local.followedLeagues) {
      await supabase
        .from("user_favourite_leagues")
        .upsert(
          { user_id: userId, league_id: leagueId },
          { onConflict: "user_id, league_id" }
        );
    }

    // 3. Upsert user preferences
    await supabase.from("user_preferences").upsert({
      user_id: userId,
      language: local.language,
      timezone: local.timezone,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    return { ...local, onboardingCompleted: true };
  } catch (err) {
    console.error("Failed to merge preferences into Supabase:", err);
    return local;
  }
}
