/**
 * BallMtaani Opt-In PWA Notification Engine
 * Contextual value-prompt permissions, category preferences, and Africa/Nairobi quiet hours.
 */

export interface NotificationCategories {
  kickoff: boolean;
  goals: boolean;
  halftime: boolean;
  predictions: boolean;
  news: boolean;
}

export const DEFAULT_NOTIFICATION_CATEGORIES: NotificationCategories = {
  kickoff: true,
  goals: true,
  halftime: true,
  predictions: true,
  news: true,
};

/**
 * Check if the current time in Africa/Nairobi falls inside quiet hours (e.g. 23:00 - 07:00 EAT)
 */
export function isInQuietHours(nowDate = new Date(), startHour = 23, endHour = 7): boolean {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Africa/Nairobi",
    hour: "numeric",
    hour12: false,
  };
  const eatHourStr = new Intl.DateTimeFormat("en-US", options).format(nowDate);
  const eatHour = parseInt(eatHourStr, 10);

  if (startHour > endHour) {
    // Crosses midnight (e.g. 23:00 to 07:00)
    return eatHour >= startHour || eatHour < endHour;
  }
  return eatHour >= startHour && eatHour < endHour;
}

/**
 * Prompt user for push permissions after value engagement
 */
export async function requestValuePromptPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error("Failed to request notification permission:", err);
    return "denied";
  }
}
