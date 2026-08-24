import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Send, Bell, CheckCircle2, Zap, Shield, Sparkles, ExternalLink, MessageCircle } from "lucide-react";

interface TelegramNotificationBridgeProps {
  fixtureId?: string | number;
  matchTitle?: string;
  variant?: "banner" | "button" | "card";
}

export default function TelegramNotificationBridge({
  fixtureId,
  matchTitle,
  variant = "card",
}: TelegramNotificationBridgeProps) {
  const [subscribed, setSubscribed] = useState(false);

  const telegramBotUsername = "ballmtaani_bot";
  const telegramChannel = "ballmtaani";

  const directTelegramUrl = fixtureId
    ? `https://t.me/${telegramBotUsername}?start=alert_${fixtureId}`
    : `https://t.me/${telegramChannel}`;

  const handleJoinTelegram = () => {
    setSubscribed(true);
    window.open(directTelegramUrl, "_blank", "noopener,noreferrer");
  };

  if (variant === "button") {
    return (
      <Button
        onClick={handleJoinTelegram}
        size="sm"
        className="bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs h-8 px-3 gap-1.5 shadow-md transition-all rounded-lg"
      >
        <Send className="h-3.5 w-3.5 fill-current" />
        {subscribed ? "Alert Set on Telegram" : "Get Lineup Alert"}
      </Button>
    );
  }

  if (variant === "banner") {
    return (
      <div className="rounded-xl border border-[#229ED9]/30 bg-gradient-to-r from-[#0d2230] via-[#121212] to-[#121212] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-full bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center border border-[#229ED9]/30 shrink-0">
            <Send className="h-5 w-5 fill-current ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white">BallMtaani Live Telegram Alerts</h4>
              <Badge className="bg-[#229ED9]/20 text-[#229ED9] border-[#229ED9]/30 text-[9px] px-1.5 py-0">
                LIVE
              </Badge>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Get confirmed lineups 60 mins before kickoff, Dixon-Coles model probability updates &amp; match receipts.
            </p>
          </div>
        </div>

        <Button
          onClick={handleJoinTelegram}
          className="w-full sm:w-auto bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs px-5 h-9 shrink-0 shadow-lg gap-1.5"
        >
          <Send className="h-3.5 w-3.5 fill-current" />
          Join Telegram Channel
          <ExternalLink className="h-3 w-3 opacity-70 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#229ED9]/30 bg-gradient-to-br from-[#0c2436] via-[#121212] to-[#121212] p-6 space-y-5 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center border border-[#229ED9]/30">
            <Send className="h-4 w-4 fill-current ml-0.5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              Live Telegram Match Alerts <Sparkles className="h-3.5 w-3.5 text-[#229ED9]" />
            </h3>
            <p className="text-[11px] text-gray-400">Instant push notifications for Kenyan football fans</p>
          </div>
        </div>

        <Badge className="bg-[#229ED9]/20 text-[#229ED9] border-[#229ED9]/30 text-[10px]">
          Free Instant Bot
        </Badge>
      </div>

      {matchTitle && (
        <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs">
          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Target Match Alert:</span>
          <span className="text-white font-bold">{matchTitle}</span>
        </div>
      )}

      <div className="space-y-2 text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span><strong>Confirmed Lineups:</strong> Get starting XIs delivered the minute managers submit them.</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span><strong>Model Probability Shifts:</strong> See how late injuries shift win probabilities.</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span><strong>1-Tap Shareable Receipts:</strong> Formatted match receipts directly on your Telegram feed.</span>
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={handleJoinTelegram}
          className="w-full bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-sm h-11 shadow-xl gap-2 transition-all transform active:scale-95"
        >
          <Send className="h-4 w-4 fill-current" />
          {fixtureId ? `Get Alert for ${matchTitle || "This Match"}` : "Join BallMtaani on Telegram"}
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </Button>
      </div>
    </div>
  );
}
