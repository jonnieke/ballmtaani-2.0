/**
 * BallMtaani Edge Phase 6 — Development Mock Payment Adapter
 */

import { getPlanByCode } from "./plan-catalog";
import { normalizeKenyanPhoneNumber, maskPhoneNumber } from "./mpesa-adapter";
import {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProvider,
  PaymentStatusResult,
  ValidatedCallback,
} from "./payment-provider-interface";

export type MockScenario = "success" | "user_cancelled" | "insufficient_balance" | "timeout" | "amount_mismatch";

export class MockPaymentAdapter implements PaymentProvider {
  name = "mock";
  private scenario: MockScenario;

  constructor(scenario: MockScenario = "success") {
    this.scenario = scenario;
  }

  setScenario(scenario: MockScenario) {
    this.scenario = scenario;
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const plan = getPlanByCode(request.planCode);
    if (!plan || !plan.isActive) {
      throw new Error(`Invalid plan code: ${request.planCode}`);
    }

    const normalizedPhone = normalizeKenyanPhoneNumber(request.phoneNumber);
    const maskedPhone = maskPhoneNumber(normalizedPhone);

    const internalReference =
      request.idempotencyKey ||
      `MOCK-REF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const providerCheckoutRequestId = `MOCK_CO_${Date.now()}`;

    return {
      internalReference,
      providerRequestId: `MOCK-REQ-${Date.now()}`,
      providerCheckoutRequestId,
      status: "pending",
      amount: plan.priceAmount,
      currency: plan.currency,
      phoneNumberMasked: maskedPhone,
      message: `[MOCK PAYMENTS] Simulated STK Push initiated for KES ${plan.priceAmount}.`,
    };
  }

  async queryPaymentStatus(providerReference: string): Promise<PaymentStatusResult> {
    if (this.scenario === "user_cancelled") {
      return {
        internalReference: providerReference,
        status: "cancelled",
        amount: 0,
        failureReason: "Payment request cancelled by user on handset.",
      };
    }

    if (this.scenario === "insufficient_balance") {
      return {
        internalReference: providerReference,
        status: "failed",
        amount: 0,
        failureReason: "Insufficient M-Pesa balance.",
      };
    }

    if (this.scenario === "timeout") {
      return {
        internalReference: providerReference,
        status: "timed_out",
        amount: 0,
        failureReason: "STK push timed out waiting for PIN input.",
      };
    }

    return {
      internalReference: providerReference,
      providerTransactionId: `MOCK-TX-${Date.now()}`,
      status: "successful",
      amount: 20,
      completedAt: new Date().toISOString(),
    };
  }

  async processCallback(rawPayload: Record<string, unknown>): Promise<ValidatedCallback> {
    const isSuccessful = this.scenario === "success" || this.scenario === "amount_mismatch";
    const amount = this.scenario === "amount_mismatch" ? 10 : 20;

    return {
      internalReference: String(rawPayload.internalReference || `MOCK-REF-${Date.now()}`),
      providerCheckoutRequestId: String(rawPayload.checkoutRequestId || `MOCK_CO_${Date.now()}`),
      providerTransactionId: `MOCK-TX-${Date.now()}`,
      isSuccessful,
      amount,
      resultCode: isSuccessful ? 0 : 1032,
      resultDesc: isSuccessful ? "Success" : "Request cancelled by user",
      phoneNumberMasked: "2547***5678",
      rawPayload,
    };
  }
}
