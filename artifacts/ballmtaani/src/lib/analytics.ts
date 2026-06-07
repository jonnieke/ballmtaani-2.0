/**
 * Google Analytics 4 event tracking
 * Tracks key user actions for growth insights
 */

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

export const analytics = {
  // Auth events
  signup: (method: "email" | "phone" | "mock") => {
    window.gtag?.("event", "sign_up", { method });
  },

  login: (method: "email" | "phone" | "mock") => {
    window.gtag?.("event", "login", { method });
  },

  authMethodSelected: (method: "email" | "phone") => {
    window.gtag?.("event", "auth_method_selected", { method });
  },

  authOtpRequested: (method: "email" | "phone") => {
    window.gtag?.("event", "auth_otp_requested", { method });
  },

  authOtpViewed: (method: "email" | "phone") => {
    window.gtag?.("event", "auth_otp_viewed", { method });
  },

  authOtpVerified: (method: "email" | "phone", status: "success" | "failed") => {
    window.gtag?.("event", "auth_otp_verified", { method, status });
  },

  // Prediction events
  predictionMade: (league: string, type: "score" | "result") => {
    window.gtag?.("event", "prediction_made", { league, type });
  },

  predictionLocked: (predictionsCount: number) => {
    window.gtag?.("event", "prediction_locked", { count: predictionsCount });
  },

  // WC26 events
  wc26PickMade: (question: string) => {
    window.gtag?.("event", "wc26_pick_made", { question });
  },

  wc26BracketComplete: (totalPicks: number, mtcOnLine: number) => {
    window.gtag?.("event", "wc26_bracket_complete", {
      picks: totalPicks,
      mtc: mtcOnLine,
    });
  },

  wc26ShareClicked: () => {
    window.gtag?.("event", "wc26_share", { method: "whatsapp" });
  },

  // Push notification events
  pushNotificationEnabled: () => {
    window.gtag?.("event", "push_enabled");
  },

  // Page views (automatically tracked by GA4, but can add custom context)
  pageView: (pageName: string) => {
    window.gtag?.("event", "page_view", { page_title: pageName });
  },

  // Feature usage
  mchambuziAsked: (question: string) => {
    window.gtag?.("event", "mchambuzi_asked", { question_length: question.length });
  },

  liveCenterVisited: () => {
    window.gtag?.("event", "live_center_opened");
  },

  // Leaderboard
  leaderboardViewed: (tab: "weekly" | "global" | "country") => {
    window.gtag?.("event", "leaderboard_viewed", { tab });
  },

  // Error tracking (for non-critical errors)
  errorOccurred: (errorName: string, errorMessage: string) => {
    window.gtag?.("event", "error", {
      error_name: errorName,
      error_message: errorMessage,
    });
  },
};
