import { useState, useRef } from "react";
import { X, MessageCircle, Copy, CheckCheck, Download, ShieldCheck, Flame, Trophy, ExternalLink } from "lucide-react";
import TeamLogo from "./TeamLogo";
import { formatWhatsAppReceiptText, PredictionReceipt } from "../lib/prediction-receipts";

interface MatchReceiptModalProps {
  receipt: PredictionReceipt & {
    homeLogo?: string;
    awayLogo?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchReceiptModal({ receipt, isOpen, onClose }: MatchReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const receiptUrl = `https://ballmtaani.com/receipts/${receipt.receiptCode}`;
  const whatsappText = formatWhatsAppReceiptText(receipt);

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(receiptUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Generate downloadable receipt image using Canvas API
  const handleDownloadReceipt = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dark Stadium Background
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, "#160507");
      grad.addColorStop(0.5, "#0b0b0b");
      grad.addColorStop(1, "#08101a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Red Accent Top Border
      ctx.fillStyle = "#B30000";
      ctx.fillRect(0, 0, 1080, 24);

      // Card Container
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(80, 80, 920, 920, 40);
      ctx.fill();
      ctx.stroke();

      // Brand Logo Header
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 52px system-ui, sans-serif";
      ctx.fillText("BALL", 130, 175);
      ctx.fillStyle = "#B30000";
      ctx.fillText("MTAANI", 265, 175);

      ctx.fillStyle = "#FFD700";
      ctx.font = "800 24px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(receipt.competition.toUpperCase(), 950, 175);
      ctx.textAlign = "left";

      // Divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(130, 215);
      ctx.lineTo(950, 215);
      ctx.stroke();

      // Receipt Code Badge
      ctx.fillStyle = "rgba(255, 215, 0, 0.12)";
      ctx.fillRect(130, 250, 320, 50);
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 24px monospace";
      ctx.fillText(`RECEIPT #${receipt.receiptCode}`, 150, 284);

      // Fan Display Name
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "600 28px system-ui, sans-serif";
      ctx.fillText(`Fan: ${receipt.fanDisplayName}`, 130, 350);

      // Teams
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 56px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(receipt.homeTeam.toUpperCase(), 540, 440);
      ctx.fillStyle = "#B30000";
      ctx.font = "900 36px system-ui, sans-serif";
      ctx.fillText("VS", 540, 500);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 56px system-ui, sans-serif";
      ctx.fillText(receipt.awayTeam.toUpperCase(), 540, 570);

      // Predicted Score Box
      ctx.fillStyle = "rgba(179, 0, 0, 0.2)";
      ctx.strokeStyle = "#B30000";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(290, 620, 500, 160, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#FFD700";
      ctx.font = "800 24px system-ui, sans-serif";
      ctx.fillText("PREDICTED MATCH SCORE", 540, 665);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 72px monospace";
      ctx.fillText(receipt.predictedScore, 540, 750);

      // Lock Timestamp
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "600 24px system-ui, sans-serif";
      const timeStr = new Date(receipt.submittedAtISO).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
      ctx.fillText(`🔒 Locked at Kickoff: ${timeStr} EAT`, 540, 830);

      // Slogan Footer
      ctx.fillStyle = "#FFD700";
      ctx.font = "italic 800 28px system-ui, sans-serif";
      ctx.fillText('"We predict. We debate. We keep receipts."', 540, 920);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "600 22px system-ui, sans-serif";
      ctx.fillText("ballmtaani.com", 540, 955);

      // Trigger download
      const link = document.createElement("a");
      link.download = `BallMtaani-Receipt-${receipt.receiptCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
          aria-label="Close receipt"
        >
          <X className="h-5 w-5" />
        </button>

        {/* RECEIPT CARD CONTAINER */}
        <div ref={cardRef} className="relative overflow-hidden rounded-3xl border border-[#B30000]/40 bg-[#0d0a11] p-6 shadow-[0_0_80px_rgba(179,0,0,0.35)]">
          {/* Background Glow Effects */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#B30000]/25 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#FFD700]/15 blur-[90px]" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black italic">
                <span className="text-white">BALL</span>
                <span className="text-[#B30000]">MTAANI</span>
              </span>
              <span className="rounded bg-[#B30000]/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#B30000]">
                RECEIPT
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD700]">
              {receipt.competition}
            </span>
          </div>

          {/* Verification Badge */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> VERIFIED RECEIPT
            </span>
            <span className="font-mono text-white/80">#{receipt.receiptCode}</span>
          </div>

          {/* Fixture & Prediction Display */}
          <div className="my-6 space-y-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
              FAN: <span className="text-white">{receipt.fanDisplayName}</span>
            </p>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <TeamLogo logo={receipt.homeLogo} initial={receipt.homeTeam.slice(0, 3).toUpperCase()} size="lg" color="#1a0000" shadow />
                <span className="text-xs font-black uppercase tracking-wide text-white leading-snug">{receipt.homeTeam}</span>
              </div>
              <span className="rounded-xl border border-[#B30000]/40 bg-[#B30000]/20 px-3 py-1.5 text-xs font-black text-[#FFD700]">
                VS
              </span>
              <div className="flex flex-col items-center gap-1.5">
                <TeamLogo logo={receipt.awayLogo} initial={receipt.awayTeam.slice(0, 3).toUpperCase()} size="lg" color="#1a0000" shadow />
                <span className="text-xs font-black uppercase tracking-wide text-white leading-snug">{receipt.awayTeam}</span>
              </div>
            </div>

            {/* PREDICTED SCORE BANNER */}
            <div className="rounded-2xl border border-[#B30000] bg-gradient-to-b from-[#B30000]/25 to-black/60 p-4 text-center">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                MY PREDICTED SCORE
              </span>
              <div className="mt-1 font-mono text-4xl font-black tracking-widest text-white">
                {receipt.predictedScore}
              </div>
            </div>
          </div>

          {/* Lock Timestamp info */}
          <div className="border-t border-white/10 pt-3 text-[10px] text-white/50 space-y-1">
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span className="font-mono text-white">
                {new Date(receipt.submittedAtISO).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-[#FFD700] uppercase">
                {receipt.status === "correct" ? "🎯 CORRECT" : receipt.status === "incorrect" ? "❌ INCORRECT" : "🔒 LOCKED AT KICKOFF"}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3 text-center text-[9px] font-black uppercase tracking-widest text-white/30 italic">
            "We predict. We debate. We keep receipts."
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-xs font-black uppercase tracking-wider text-black transition-transform hover:scale-[1.02] active:scale-98 shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle className="h-4 w-4 fill-black" />
            <span>WhatsApp Receipt</span>
          </button>

          <button
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-3.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-[#FFD700]" />
            <span>{downloading ? "Saving..." : "Save Image"}</span>
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/70 transition-colors hover:text-white"
        >
          {copied ? (
            <>
              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Receipt Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Direct Receipt Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
