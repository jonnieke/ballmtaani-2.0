/**
 * BallMtaani Edge Phase 11 — Acquisition Attribution & Funnel Analytics Engine
 */

export interface TouchpointRecord {
  userId: string;
  channel: "organic" | "social" | "telecom_bundle" | "referral" | "b2b_widget";
  campaign?: string;
  occurredAt: string;
}

export interface AttributionSummary {
  userId: string;
  firstTouchChannel: string;
  lastTouchChannel: string;
  conversionState: "registered" | "paid_subscriber";
}

const IN_MEMORY_TOUCHPOINTS: TouchpointRecord[] = [];

export class AcquisitionAttributionEngine {
  static recordTouchpoint(touchpoint: TouchpointRecord): void {
    IN_MEMORY_TOUCHPOINTS.push(touchpoint);
  }

  static getAttributionForUser(userId: string): AttributionSummary {
    const userTouchpoints = IN_MEMORY_TOUCHPOINTS.filter((t) => t.userId === userId);
    const first = userTouchpoints[0]?.channel || "organic";
    const last = userTouchpoints[userTouchpoints.length - 1]?.channel || first;

    return {
      userId,
      firstTouchChannel: first,
      lastTouchChannel: last,
      conversionState: "paid_subscriber",
    };
  }
}
