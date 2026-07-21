/**
 * BallMtaani Typed Analytics Event Layer
 * Privacy-safe, centralized event tracking for growth, predictions, and fan engagement.
 */

export type AnalyticsEventName =
  | "onboarding_started"
  | "club_selected"
  | "league_followed"
  | "onboarding_completed"
  | "personalised_home_viewed"
  | "match_followed"
  | "live_centre_viewed"
  | "prediction_started"
  | "prediction_submitted"
  | "prediction_locked"
  | "receipt_viewed"
  | "receipt_shared"
  | "mchambuzi_opened"
  | "mchambuzi_question_submitted"
  | "debate_joined"
  | "comment_posted"
  | "push_permission_requested"
  | "push_enabled"
  | "push_denied"
  | "referral_created"
  | "referral_converted";

export interface AnalyticsPayload {
  clubId?: string;
  leagueId?: string | number;
  matchId?: string | number;
  receiptCode?: string;
  language?: string;
  referralCode?: string;
  [key: string]: any;
}

/**
 * Sanitize payload to strip PII (email, phone, full names)
 */
export function sanitizePayload(payload: AnalyticsPayload): AnalyticsPayload {
  const clean = { ...payload };
  delete clean.email;
  delete clean.phone;
  delete clean.user_name;
  delete clean.full_name;
  return clean;
}

/**
 * Track platform analytics event
 */
export function trackEvent(eventName: AnalyticsEventName, payload: AnalyticsPayload = {}): { event: AnalyticsEventName; payload: AnalyticsPayload; timestamp: string } {
  const cleanPayload = sanitizePayload(payload);
  const eventObj = {
    event: eventName,
    payload: cleanPayload,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, cleanPayload);
  }

  return eventObj;
}
