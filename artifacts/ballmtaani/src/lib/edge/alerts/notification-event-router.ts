/**
 * BallMtaani Edge Phase 7 — Notification Event Router & Suppression Evaluator
 */

import { isInQuietHours } from "../../push-notifications";
import { EntitlementService } from "../billing/entitlement-service";
import { NotificationDeliveryPayload } from "./notification-provider-interface";

export interface UserNotificationFeedItem {
  id: string;
  userId: string;
  alertType: string;
  title: string;
  body: string;
  deepLink: string;
  status: "unread" | "read" | "dismissed";
  createdAt: string;
}

const IN_MEMORY_USER_NOTIFICATIONS = new Map<string, UserNotificationFeedItem[]>();

export class NotificationEventRouter {
  static async processAndRouteEvent(payload: {
    userId: string;
    alertType: string;
    title: string;
    body: string;
    deepLink: string;
    materialityScore: number;
  }): Promise<{ delivered: boolean; suppressed: boolean; suppressionReason?: string }> {
    // 1. Check Materiality Threshold (Score must be >= 30)
    if (payload.materialityScore < 30) {
      return { delivered: false, suppressed: true, suppressionReason: "Insignificant materiality score below 30" };
    }

    // 2. Check Entitlements (e.g. push or in-app alerts entitlement)
    const entitlementKey = payload.alertType === "lineup_impact" ? "edge.lineup_impact" : "edge.in_app_alerts";
    const hasEntitlement = await EntitlementService.hasEntitlement(payload.userId, entitlementKey);
    if (!hasEntitlement) {
      return { delivered: false, suppressed: true, suppressionReason: `Plan missing required entitlement '${entitlementKey}'` };
    }

    // 3. Check Quiet Hours (23:00 - 07:00 EAT)
    if (isInQuietHours()) {
      return { delivered: false, suppressed: true, suppressionReason: "Suppressed during Africa/Nairobi quiet hours (23:00 - 07:00 EAT)" };
    }

    // 4. Deliver In-App Notification Feed Item
    const notification: UserNotificationFeedItem = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: payload.userId,
      alertType: payload.alertType,
      title: payload.title,
      body: payload.body,
      deepLink: payload.deepLink,
      status: "unread",
      createdAt: new Date().toISOString(),
    };

    const userNotifs = IN_MEMORY_USER_NOTIFICATIONS.get(payload.userId) || [];
    userNotifs.unshift(notification);
    IN_MEMORY_USER_NOTIFICATIONS.set(payload.userId, userNotifs);

    return { delivered: true, suppressed: false };
  }

  static getUserNotifications(userId: string): UserNotificationFeedItem[] {
    return IN_MEMORY_USER_NOTIFICATIONS.get(userId) || [];
  }

  static markAsRead(userId: string, notificationId: string): void {
    const notifs = this.getUserNotifications(userId);
    const item = notifs.find((n) => n.id === notificationId);
    if (item) {
      item.status = "read";
    }
  }
}
