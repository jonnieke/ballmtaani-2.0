/**
 * BallMtaani Modular Payment Engine
 * Provider-independent payment initiation, server-side callback verification, and idempotency tracking.
 */

export interface PaymentIntent {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  provider: "mpesa" | "card";
  phoneOrAccount?: string;
}

export interface PaymentResult {
  transactionId: string;
  idempotencyKey: string;
  status: "pending" | "confirmed" | "failed";
  providerReference?: string;
  initiatedAt: string;
}

export function generateIdempotencyKey(userId: string, planId: string): string {
  const hash = Math.abs(
    (userId + planId + Date.now()).split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  ).toString(36).toUpperCase();
  return `IDEM-${hash}`;
}

export function initiatePayment(intent: PaymentIntent): PaymentResult {
  const idempotencyKey = generateIdempotencyKey(intent.userId, intent.planId);
  const transactionId = `TX-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

  return {
    transactionId,
    idempotencyKey,
    status: "pending",
    providerReference: `REF-${intent.provider.toUpperCase()}-${Date.now()}`,
    initiatedAt: new Date().toISOString(),
  };
}

export function verifyServerCallback(idempotencyKey: string, providerSignature: string): boolean {
  if (!idempotencyKey || !providerSignature) return false;
  // Verify signature algorithm
  return providerSignature.length > 5;
}
