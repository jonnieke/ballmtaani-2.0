/**
 * BallMtaani Match Lifecycle Engine
 * Centralized match-state model mapping upstream API statuses into standard platform states.
 */

export type PlatformMatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "extra_time"
  | "penalties"
  | "finished"
  | "postponed"
  | "cancelled"
  | "abandoned";

/**
 * Standardize API-Football and internal status strings into PlatformMatchStatus
 */
export function normalizeMatchStatus(rawStatus: string | number | undefined): PlatformMatchStatus {
  if (!rawStatus) return "scheduled";
  const str = String(rawStatus).toUpperCase().trim();

  switch (str) {
    case "1H":
    case "2H":
    case "IN_PLAY":
    case "LIVE":
      return "live";

    case "HT":
    case "HALFTIME":
    case "HALF_TIME":
      return "halftime";

    case "ET":
    case "EXTRA_TIME":
      return "extra_time";

    case "P":
    case "PEN_LIVE":
    case "PENALTIES":
      return "penalties";

    case "FT":
    case "AET":
    case "PEN":
    case "FINISHED":
    case "COMPLETED":
      return "finished";

    case "PST":
    case "POSTPONED":
      return "postponed";

    case "CANC":
    case "CANCELLED":
      return "cancelled";

    case "ABD":
    case "ABANDONED":
      return "abandoned";

    case "NS":
    case "TBD":
    case "SCHEDULED":
    case "UPCOMING":
    default:
      return "scheduled";
  }
}

export function isMatchActive(status: PlatformMatchStatus): boolean {
  return status === "live" || status === "halftime" || status === "extra_time" || status === "penalties";
}

export function isMatchLocked(status: PlatformMatchStatus, kickoffTimeISO?: string): boolean {
  if (status !== "scheduled") return true;
  if (!kickoffTimeISO) return false;
  return new Date().getTime() >= new Date(kickoffTimeISO).getTime();
}
