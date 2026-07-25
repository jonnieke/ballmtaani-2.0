/**
 * BallMtaani Edge Phase 12 — Launch Wave & Subscriber Ceiling Service
 */

export interface LaunchWaveDetails {
  id: string;
  name: string;
  stage: "employee_internal" | "invited_testers" | "closed_free_beta" | "closed_paid_beta" | "limited_public_paid" | "national_public_launch" | "scaled_commercial_launch";
  subscriberLimit: number;
  currentSubscriberCount: number;
  status: "active" | "paused" | "completed";
}

export class LaunchWaveService {
  static getActiveLaunchWave(): LaunchWaveDetails {
    return {
      id: "wave-001",
      name: "Kenyan Commercial Public Launch Wave 1",
      stage: "closed_paid_beta",
      subscriberLimit: 50000,
      currentSubscriberCount: 14250,
      status: "active",
    };
  }

  static checkSubscriberEnrolmentEligibility(userId: string): { isEligible: boolean; reason: string } {
    const wave = this.getActiveLaunchWave();
    if (wave.currentSubscriberCount >= wave.subscriberLimit) {
      return {
        isEligible: false,
        reason: "Subscriber limit reached for active launch wave. Joined waitlist.",
      };
    }

    return {
      isEligible: true,
      reason: "User eligible for enrollment in active launch wave.",
    };
  }
}
