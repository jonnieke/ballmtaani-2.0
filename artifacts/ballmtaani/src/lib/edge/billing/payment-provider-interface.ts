/**
 * BallMtaani Edge Phase 6 — Normalized Payment Provider Interface
 */

export interface PaymentInitiationRequest {
  userId: string;
  planCode: string;
  phoneNumber: string; // Kenyan format e.g. 0712345678 or 254712345678
  idempotencyKey?: string;
}

export interface PaymentInitiationResult {
  internalReference: string;
  providerRequestId?: string;
  providerCheckoutRequestId?: string;
  status: "pending" | "successful" | "failed";
  amount: number;
  currency: string;
  phoneNumberMasked: string;
  message: string;
}

export interface PaymentStatusResult {
  internalReference: string;
  providerTransactionId?: string;
  status: "initiated" | "pending" | "successful" | "failed" | "cancelled" | "timed_out";
  amount: number;
  completedAt?: string;
  failureReason?: string;
}

export interface ValidatedCallback {
  internalReference: string;
  providerCheckoutRequestId: string;
  providerTransactionId?: string;
  isSuccessful: boolean;
  amount: number;
  resultCode: number | string;
  resultDesc: string;
  phoneNumberMasked: string;
  rawPayload: Record<string, unknown>;
}

export interface PaymentProvider {
  name: string;
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
  queryPaymentStatus(providerReference: string): Promise<PaymentStatusResult>;
  processCallback(rawPayload: Record<string, unknown>): Promise<ValidatedCallback>;
}
