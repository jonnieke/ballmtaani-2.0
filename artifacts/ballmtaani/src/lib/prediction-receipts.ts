/**
 * BallMtaani Prediction Receipt Engine
 * Generates permanent timestamped receipts and WhatsApp share cards for fan predictions.
 */

export interface PredictionReceipt {
  receiptCode: string;
  fanDisplayName: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  predictedScore: string;
  submittedAtISO: string;
  kickoffTimeISO: string;
  status: "locked" | "pending" | "correct" | "incorrect" | "void";
  actualScore?: string;
  pointsAwarded?: number;
  visibility: "public" | "private";
}

/**
 * Generate a non-enumerable, permanent public receipt code
 */
export function generateReceiptCode(userId: string, matchId: string | number): string {
  const hash = Math.abs(
    (userId + matchId + Date.now()).split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  ).toString(36).toUpperCase();
  return `BM-REC-${hash.slice(0, 6)}`;
}

/**
 * Format WhatsApp receipt share text
 */
export function formatWhatsAppReceiptText(receipt: PredictionReceipt): string {
  const isEvaluated = receipt.status === "correct" || receipt.status === "incorrect";
  const outcomeText = receipt.status === "correct"
    ? `🎯 CORRECT (+${receipt.pointsAwarded || 50} MTC)`
    : receipt.status === "incorrect"
    ? `❌ INCORRECT`
    : `🔒 LOCKED RECEIPT`;

  return `🔥 BallMtaani Prediction Receipt [${receipt.receiptCode}]\n` +
    `👤 Fan: ${receipt.fanDisplayName}\n` +
    `⚽ ${receipt.homeTeam} vs ${receipt.awayTeam} (${receipt.competition})\n` +
    `📊 Predicted Score: ${receipt.predictedScore}\n` +
    `⏱️ Timestamp: ${new Date(receipt.submittedAtISO).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT\n` +
    `Status: ${outcomeText}\n\n` +
    `We predict. We debate. We keep receipts.\n` +
    `https://ballmtaani.com/receipts/${receipt.receiptCode}`;
}
