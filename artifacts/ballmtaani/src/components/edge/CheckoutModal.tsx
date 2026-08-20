import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, Check, ShieldCheck, Phone, Smartphone, AlertCircle, ArrowRight } from "lucide-react";
import { getPlanByCode, EdgePlan } from "../../lib/edge/billing/plan-catalog";
import { MockPaymentAdapter } from "../../lib/edge/billing/mock-payment-adapter";

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanCode: string;
  onPaymentSuccess?: (subscriptionId: string) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  selectedPlanCode,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"review" | "phone" | "stk_prompt" | "success" | "error">("review");
  const [phoneNumber, setPhoneNumber] = useState("0712345678");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const plan: EdgePlan = getPlanByCode(selectedPlanCode) || getPlanByCode("matchday_pass")!;

  if (!isOpen) return null;

  const handleInitiatePayment = async () => {
    if (!acceptedTerms || !ageConfirmed) {
      setErrorMessage("Please confirm terms and 18+ age requirement before proceeding.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const adapter = new MockPaymentAdapter("success");
      const res = await adapter.initiatePayment({
        userId: "user-current-101",
        planCode: plan.code,
        phoneNumber,
      });

      setStep("stk_prompt");

      // Simulate STK Push response after 2 seconds
      setTimeout(() => {
        setLoading(false);
        setStep("success");
        if (onPaymentSuccess) {
          onPaymentSuccess(`SUB-${Date.now()}`);
        }
      }, 2000);
    } catch (err: unknown) {
      setLoading(false);
      setStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to initiate M-Pesa STK Push.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/15 rounded-xl p-6 shadow-2xl space-y-6 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close Checkout"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step 1: Review Plan & Terms */}
        {step === "review" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                M-Pesa Express Checkout
              </Badge>
              <h2 className="text-xl font-bold text-white">Unlock {plan.name}</h2>
              <p className="text-xs text-gray-400">{plan.description}</p>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center font-mono">
              <div>
                <span className="text-xs text-gray-400 block font-sans">Total Payable</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  KES {plan.priceAmount}
                </span>
              </div>
              <span className="text-xs text-gray-300 font-sans">
                {plan.durationHours ? `${plan.durationHours / 24} Days Access` : "Perpetual"}
              </span>
            </div>

            {/* Terms & Age Confirmation Checkboxes */}
            <div className="space-y-2 text-xs text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 accent-emerald-500"
                />
                <span>I accept the BallMtaani Edge Subscription Terms and Refund Policy.</span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 accent-emerald-500"
                />
                <span>I confirm that I am 18 years of age or older.</span>
              </label>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-gray-400 flex items-start gap-1.5 leading-normal">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                BallMtaani Edge provides statistical football analysis. Match outcomes remain uncertain, and premium access does not guarantee winning results.
              </span>
            </p>

            <Button
              onClick={() => setStep("phone")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
            >
              Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Phone Number Input */}
        {step === "phone" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Enter M-Pesa Phone Number</h2>
              <p className="text-xs text-gray-400">Enter your Safaricom phone number to receive the STK Push prompt.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-300 font-semibold block">Safaricom Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678 or 254712345678"
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-[10px] text-gray-400">Supported: 07XXXXXXXX or 2547XXXXXXXX</span>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              onClick={handleInitiatePayment}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
            >
              {loading ? "Sending Prompt..." : `Pay KES ${plan.priceAmount} via M-Pesa`}
            </Button>
          </div>
        )}

        {/* Step 3: STK Prompt Sent */}
        {step === "stk_prompt" && (
          <div className="text-center py-6 space-y-4">
            <div className="h-14 w-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Smartphone className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Check Your Phone</h3>
              <p className="text-xs text-gray-300">
                An M-Pesa prompt has been sent to <strong className="font-mono text-emerald-400">{phoneNumber}</strong>.
              </p>
              <p className="text-xs text-gray-400">Enter your M-Pesa PIN to complete payment of KES {plan.priceAmount}.</p>
            </div>
          </div>
        )}

        {/* Step 4: Success State */}
        {step === "success" && (
          <div className="text-center py-6 space-y-4">
            <div className="h-14 w-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Payment Confirmed!</h3>
              <p className="text-xs text-gray-300">Your subscription to <strong>{plan.name}</strong> is now active.</p>
            </div>
            <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
              Start Exploring Edge Intelligence
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
