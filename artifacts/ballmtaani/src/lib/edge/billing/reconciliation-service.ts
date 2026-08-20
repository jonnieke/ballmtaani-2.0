/**
 * BallMtaani Edge Phase 6 — Payment Reconciliation Engine
 */

export interface PaymentReconciliationRecord {
  id: string;
  paymentId: string;
  reconciliationType: "unconfirmed_callback" | "duplicate_transaction" | "amount_mismatch" | "manual_admin";
  expectedAmount: number;
  receivedAmount: number;
  expectedStatus: string;
  providerStatus: string;
  discrepancyType: string;
  resolutionStatus: "unresolved" | "resolved_auto" | "resolved_manual";
  resolutionNote?: string;
  reconciledAt: string;
}

export function evaluatePaymentReconciliation(payment: {
  id: string;
  expectedAmount: number;
  receivedAmount: number;
  internalStatus: string;
  providerStatus: string;
  providerTransactionId?: string;
}): PaymentReconciliationRecord | null {
  const now = new Date().toISOString();

  // 1. Check Amount Mismatch
  if (payment.receivedAmount !== payment.expectedAmount && payment.receivedAmount > 0) {
    return {
      id: `REC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      paymentId: payment.id,
      reconciliationType: "amount_mismatch",
      expectedAmount: payment.expectedAmount,
      receivedAmount: payment.receivedAmount,
      expectedStatus: payment.internalStatus,
      providerStatus: payment.providerStatus,
      discrepancyType: `Amount mismatch: Expected KES ${payment.expectedAmount}, received KES ${payment.receivedAmount}`,
      resolutionStatus: "unresolved",
      reconciledAt: now,
    };
  }

  // 2. Check Unconfirmed Callback (Provider successful but system pending)
  if (payment.providerStatus === "successful" && payment.internalStatus === "pending") {
    return {
      id: `REC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      paymentId: payment.id,
      reconciliationType: "unconfirmed_callback",
      expectedAmount: payment.expectedAmount,
      receivedAmount: payment.expectedAmount,
      expectedStatus: "pending",
      providerStatus: "successful",
      discrepancyType: "Provider confirmed success but internal status remained pending.",
      resolutionStatus: "resolved_auto",
      resolutionNote: "Auto-reconciled: Activated subscription following verified provider transaction.",
      reconciledAt: now,
    };
  }

  return null;
}
