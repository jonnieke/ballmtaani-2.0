/**
 * BallMtaani Edge Phase 8 — Referral Growth & Anti-Fraud Engine
 */

export interface ReferralAttributionRecord {
  id: string;
  referralCode: string;
  referrerUserId: string;
  referredUserId: string;
  status: "visited" | "registered" | "payment_pending" | "qualified" | "rejected";
  attributedAt: string;
  rewardHoursGranted?: number;
}

const IN_MEMORY_REFERRAL_CODES = new Map<string, string>(); // userId -> referralCode
const IN_MEMORY_ATTRIBUTIONS = new Map<string, ReferralAttributionRecord>(); // referredUserId -> attribution

export class ReferralService {
  static getOrCreateReferralCode(userId: string): string {
    if (IN_MEMORY_REFERRAL_CODES.has(userId)) {
      return IN_MEMORY_REFERRAL_CODES.get(userId)!;
    }
    const code = `EDGE-${userId.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    IN_MEMORY_REFERRAL_CODES.set(userId, code);
    return code;
  }

  static trackReferralRegistration(referrerUserId: string, referredUserId: string, referralCode: string): { success: boolean; message: string } {
    // Anti-fraud Rule 1: Self-referrals prohibited
    if (referrerUserId === referredUserId) {
      return { success: false, message: "Self-referrals are strictly prohibited." };
    }

    // Anti-fraud Rule 2: Already attributed user
    if (IN_MEMORY_ATTRIBUTIONS.has(referredUserId)) {
      return { success: false, message: "User is already attributed to a referral code." };
    }

    const attribution: ReferralAttributionRecord = {
      id: `ATTRIB-${Date.now()}`,
      referralCode,
      referrerUserId,
      referredUserId,
      status: "registered",
      attributedAt: new Date().toISOString(),
    };

    IN_MEMORY_ATTRIBUTIONS.set(referredUserId, attribution);
    return { success: true, message: "Referral attribution registered successfully." };
  }

  static processQualifyingPayment(referredUserId: string, amountKes: number): { qualified: boolean; bonusHoursGranted: number; message: string } {
    const attribution = IN_MEMORY_ATTRIBUTIONS.get(referredUserId);
    if (!attribution) {
      return { qualified: false, bonusHoursGranted: 0, message: "No active referral attribution found." };
    }

    if (amountKes < 20) {
      return { qualified: false, bonusHoursGranted: 0, message: "Payment amount does not meet minimum qualifying threshold (KES 20)." };
    }

    attribution.status = "qualified";
    attribution.rewardHoursGranted = 24; // 24 bonus hours granted to referrer
    IN_MEMORY_ATTRIBUTIONS.set(referredUserId, attribution);

    return {
      qualified: true,
      bonusHoursGranted: 24,
      message: "Referral payment qualified! 24 bonus access hours granted to referrer.",
    };
  }

  static getAttribution(referredUserId: string): ReferralAttributionRecord | undefined {
    return IN_MEMORY_ATTRIBUTIONS.get(referredUserId);
  }
}
