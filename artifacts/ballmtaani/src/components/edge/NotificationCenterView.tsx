import React, { useState } from "react";
import { Link } from "wouter";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Bell, CheckCircle, Clock, ChevronRight, Filter } from "lucide-react";
import { NotificationEventRouter, UserNotificationFeedItem } from "../../lib/edge/alerts/notification-event-router";

export default function NotificationCenterView() {
  const [notifications, setNotifications] = useState<UserNotificationFeedItem[]>([
    {
      id: "NOTIF-101",
      userId: "user-current",
      alertType: "lineup_impact",
      title: "Lineup Revision: Arsenal vs Liverpool",
      body: "Arsenal win probability adjusted from 45% to 41% after confirmed lineups released.",
      deepLink: "/edge/match/epl-201",
      status: "unread",
      createdAt: new Date().toISOString(),
    },
    {
      id: "NOTIF-102",
      userId: "user-current",
      alertType: "odds_movement",
      title: "Market Odds Movement: Real Madrid",
      body: "Real Madrid win odds shortened from 2.10 to 1.95 on market consensus.",
      deepLink: "/edge/match/ucl-202",
      status: "read",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, status: "read" })));
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Notification Feed</h2>
          <p className="text-xs text-gray-400">Timely match intelligence, prediction revisions, and lineup updates.</p>
        </div>

        <Button onClick={markAllRead} variant="outline" size="sm" className="text-xs text-gray-300 border-white/20">
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all ${
              n.status === "unread"
                ? "bg-emerald-950/20 border-emerald-500/40"
                : "bg-[#121212] border-white/10"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{n.title}</span>
                  {n.status === "unread" && (
                    <Badge className="bg-emerald-500 text-black font-extrabold text-[9px]">NEW</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{n.body}</p>
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(n.createdAt).toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi" })} EAT
                </span>
              </div>

              <Link href={n.deepLink}>
                <Button size="sm" variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300">
                  View Match <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
