import React, { useState } from "react";
import { MatchPredictionOutput } from "../../lib/edge/types";
import { Button } from "../ui/button";
import { Share2, Copy, Check, MessageSquare, X } from "lucide-react";

interface MatchReceiptModalProps {
  prediction: MatchPredictionOutput;
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchReceiptModal({ prediction, isOpen, onClose }: MatchReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const kickoffTime = new Date(prediction.kickoffAt).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });

  const formattedHome = `${Math.round(prediction.homeWinProb * 100)}%`;
  const formattedDraw = `${Math.round(prediction.drawProb * 100)}%`;
  const formattedAway = `${Math.round(prediction.awayWinProb * 100)}%`;

  const receiptText = `⚽ *BALLMTAANI EDGE MATCH RECEIPT*
🔥 *${prediction.homeTeam} vs ${prediction.awayTeam}*
🏆 ${prediction.competition} • ⏰ ${kickoffTime} (EAT)

📊 *Model Win Probabilities:*
▫️ ${prediction.homeTeam}: *${formattedHome}*
▫️ Draw: *${formattedDraw}*
▫️ ${prediction.awayTeam}: *${formattedAway}*

🎯 *Expected Goals (xG):* ${prediction.expectedHomeGoals} - ${prediction.expectedAwayGoals}
⚡ *Over 2.5 Goals:* ${Math.round(prediction.over25Prob * 100)}% | *BTTS:* ${Math.round(prediction.bttsYesProb * 100)}%
💡 *Mtaa Verdict:* ${prediction.storylines?.mtaaVerdict || "High model confidence on home form."}

🔗 *View Full Data Breakdown:*
https://ballmtaani.com/edge/match/${prediction.fixtureId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(receiptText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#121212] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Match Receipt</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Visual Receipt Card */}
        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-b from-[#181818] to-[#0f0f0f] p-5 space-y-4 font-mono text-xs">
          <div className="text-center border-b border-white/10 pb-3 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">BallMtaani Edge Receipt</span>
            <h4 className="text-base font-extrabold text-white">{prediction.homeTeam} vs {prediction.awayTeam}</h4>
            <p className="text-[11px] text-gray-400">{prediction.competition} • {kickoffTime} EAT</p>
          </div>

          <div className="space-y-2 py-1">
            <div className="flex justify-between text-gray-300">
              <span>{prediction.homeTeam} Win:</span>
              <strong className="text-emerald-400">{formattedHome}</strong>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Draw:</span>
              <strong className="text-yellow-400">{formattedDraw}</strong>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>{prediction.awayTeam} Win:</span>
              <strong className="text-blue-400">{formattedAway}</strong>
            </div>
            <div className="flex justify-between text-gray-300 border-t border-white/5 pt-2">
              <span>Model xG Expectation:</span>
              <strong className="text-white">{prediction.expectedHomeGoals} - {prediction.expectedAwayGoals}</strong>
            </div>
          </div>

          {prediction.storylines && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] text-gray-200">
              <strong className="text-emerald-400 block mb-1">MTAA VERDICT:</strong>
              {prediction.storylines.mtaaVerdict}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={handleWhatsAppShare}
            className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold text-xs flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-4 w-4" /> Share on WhatsApp
          </Button>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full border-white/20 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Text"}
          </Button>
        </div>
      </div>
    </div>
  );
}
