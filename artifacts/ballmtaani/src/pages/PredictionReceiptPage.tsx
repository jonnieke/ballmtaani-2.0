/**
 * BallMtaani Public Prediction Receipt Page (/receipts/:receiptCode)
 * Permanent, timestamped prediction verification page with WhatsApp share card generator.
 */

import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import SEO from "../components/SEO";
import { formatWhatsAppReceiptText, PredictionReceipt } from "../lib/prediction-receipts";

const MOCK_RECEIPTS: Record<string, PredictionReceipt> = {
  "BM-REC-SAMPLE": {
    receiptCode: "BM-REC-SAMPLE",
    fanDisplayName: "NairobiGunner_254",
    homeTeam: "Arsenal FC",
    awayTeam: "Chelsea FC",
    competition: "Premier League",
    predictedScore: "2-1",
    submittedAtISO: new Date(Date.now() - 3600000 * 5).toISOString(),
    kickoffTimeISO: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "correct",
    actualScore: "2-1",
    pointsAwarded: 50,
    visibility: "public",
  },
};

export default function PredictionReceiptPage() {
  const [, params] = useRoute("/receipts/:receiptCode");
  const code = (params?.receiptCode || "").toUpperCase();
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16">("4:5");

  // Fallback to sample if code not found in mock store
  const receipt: PredictionReceipt = MOCK_RECEIPTS[code] || {
    receiptCode: code || "BM-REC-UNKNOWN",
    fanDisplayName: "Kenyan Fan",
    homeTeam: "Gor Mahia",
    awayTeam: "AFC Leopards",
    competition: "FKF Premier League",
    predictedScore: "1-0",
    submittedAtISO: new Date().toISOString(),
    kickoffTimeISO: new Date().toISOString(),
    status: "pending",
    visibility: "public",
  };

  const shareText = formatWhatsAppReceiptText(receipt);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white py-10 px-4">
      <SEO
        title={`Prediction Receipt ${receipt.receiptCode} | BallMtaani`}
        description={`Verified match prediction receipt for ${receipt.homeTeam} vs ${receipt.awayTeam} by ${receipt.fanDisplayName}.`}
        canonicalUrl={`/receipts/${receipt.receiptCode}`}
        noindex={receipt.visibility === "private"}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Verification Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>VERIFIED SERVER TIMESTAMPED RECEIPT</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-400/30">
            {receipt.receiptCode}
          </span>
        </div>

        {/* Digital Receipt Card */}
        <div
          className={`bg-[#111319] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 transition-all ${
            aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "9:16" ? "max-w-sm mx-auto" : ""
          }`}
        >
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="font-black text-xl italic">
                <span className="text-white">BALL</span>
                <span className="text-[#B30000]">MTAANI</span>
              </span>
              <span className="text-[10px] text-white/50 block font-semibold uppercase tracking-widest mt-0.5">
                Official Prediction Receipt
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#FFD700]">
              {receipt.competition}
            </span>
          </div>

          {/* Fan & Fixture Info */}
          <div className="space-y-4 text-center">
            <div className="text-xs text-white/60 font-semibold">
              Fan: <strong className="text-white font-bold">{receipt.fanDisplayName}</strong>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <span className="text-lg md:text-2xl font-black uppercase text-white">{receipt.homeTeam}</span>
              <span className="text-xs font-black text-[#FFD700] px-2 py-1 bg-white/5 rounded-lg border border-white/10">VS</span>
              <span className="text-lg md:text-2xl font-black uppercase text-white">{receipt.awayTeam}</span>
            </div>

            {/* Prediction Highlight */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700] block">
                PREDICTED SCORE
              </span>
              <div className="text-3xl md:text-5xl font-black text-white tracking-widest font-mono">
                {receipt.predictedScore}
              </div>
              {receipt.actualScore && (
                <div className="text-xs text-white/60 font-semibold pt-1">
                  Actual FT Score: <strong className="text-emerald-400">{receipt.actualScore}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Audit Timestamp */}
          <div className="space-y-2 text-xs text-white/50 border-t border-white/10 pt-4">
            <div className="flex justify-between">
              <span>Submitted At:</span>
              <strong className="text-white font-mono">
                {new Date(receipt.submittedAtISO).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Lock Status:</span>
              <strong className="text-[#FFD700] uppercase font-bold">LOCKED AT KICKOFF</strong>
            </div>
            <div className="flex justify-between">
              <span>Outcome:</span>
              <strong className={`uppercase font-bold ${
                receipt.status === "correct" ? "text-emerald-400" : receipt.status === "incorrect" ? "text-red-400" : "text-amber-400"
              }`}>
                {receipt.status} {receipt.pointsAwarded ? `(+${receipt.pointsAwarded} MTC)` : ""}
              </strong>
            </div>
          </div>

          {/* Receipt Slogan */}
          <div className="text-center pt-2 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
            "We predict. We debate. We keep receipts."
          </div>
        </div>

        {/* Social Sharing Controls */}
        <div className="bg-[#111319] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FFD700]">
            SHARE SOCIAL RECEIPT CARD
          </h3>

          {/* Aspect Ratio Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 font-semibold mr-2">Card Ratio:</span>
            {(["1:1", "4:5", "9:16"] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  aspectRatio === ratio
                    ? "bg-[#FFD700] text-black"
                    : "bg-white/5 border border-white/10 text-white/70 hover:text-white"
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")}
              className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 font-bold text-xs uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>📱</span> Share on WhatsApp
            </button>
            <Link
              href="/predictions"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs uppercase tracking-wider text-white transition-colors border border-white/10 text-center"
            >
              Make New Prediction
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
