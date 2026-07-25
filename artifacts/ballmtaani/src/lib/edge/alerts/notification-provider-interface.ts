/**
 * BallMtaani Edge Phase 7 — Notification Channel Provider Interface
 */

export interface NotificationDeliveryPayload {
  userId: string;
  alertType: string;
  title: string;
  body: string;
  deepLink: string;
  priority: "low" | "standard" | "high" | "urgent";
}

export interface NotificationDeliveryResult {
  success: boolean;
  channel: string;
  messageId?: string;
  error?: string;
}

export interface NotificationProvider {
  channel: string;
  send(payload: NotificationDeliveryPayload): Promise<NotificationDeliveryResult>;
}
