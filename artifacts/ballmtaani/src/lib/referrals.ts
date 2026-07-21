/**
 * BallMtaani Growth & Referral Engine
 * Generates unique fan referral codes and tracks onboarding conversions.
 */

export interface ReferralRecord {
  referralCode: string;
  inviterUserId: string;
  invitedUserId?: string;
  status: "created" | "converted";
  createdAtISO: string;
}

/**
 * Generate unique fan invite referral code
 */
export function generateReferralCode(userId: string): string {
  const hash = Math.abs(
    (userId + "REF").split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  ).toString(36).toUpperCase();
  return `BM-REF-${hash.slice(0, 5)}`;
}

/**
 * Format referral invite share link
 */
export function getReferralShareUrl(referralCode: string): string {
  return `https://ballmtaani.com/home?ref=${encodeURIComponent(referralCode)}`;
}
