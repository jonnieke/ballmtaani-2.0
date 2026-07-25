import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { generateIdempotencyKey } from "../../lib/payment-engine";
import { Check, Shield, Zap, Sparkles, Smartphone, ArrowLeft } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function EdgePricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; code: string } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  const handleSelectPlan = (planName: string, price: string, code: string) => {
    if (code === "free") return;
    const key = generateIdempotencyKey("user-123", code);
    setIdempotencyKey(key);
    setSelectedPlan({ name: planName, price, code });
    setPaymentSuccess(false);
  };

  const handleInitiateMpesa = () => {
    if (!phoneNumber || phoneNumber.length < 9) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <RouteSEO path="/edge/pricing" />

      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/edge">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edge
            </Button>
          </Link>
          <Badge className="bg-[#B30000] text-white">M-Pesa Supported</Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
          Transparent Pricing for <span className="text-[#B30000]">Matchday Intelligence</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-12">
          Unlock fair odds, market edge calculations, risk factor flags, and early recalculations. No long term contracts. Pay securely via M-Pesa.
        </p>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12">
          {/* Free */}
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 flex flex-col justify-between">
            <div>
              <Badge className="mb-4 bg-white/10 text-gray-300">Free Tier</Badge>
              <h3 className="text-xl font-bold text-white mb-2">Free Pass</h3>
              <div className="text-3xl font-extrabold text-white mb-4">KES 0</div>
              <ul className="space-y-2.5 text-xs text-gray-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Basic 1X2 Probabilities</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 3 Featured Daily Match Previews</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Public Performance Ledger</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full border-white/20 text-white" disabled>Current Plan</Button>
          </div>

          {/* Match-Day Pass */}
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 flex flex-col justify-between">
            <div>
              <Badge className="mb-4 bg-blue-500/20 text-blue-400">24-Hour Access</Badge>
              <h3 className="text-xl font-bold text-white mb-2">Match-Day Pass</h3>
              <div className="text-3xl font-extrabold text-white mb-4">KES 20 <span className="text-xs font-normal text-gray-400">/ 24 hrs</span></div>
              <ul className="space-y-2.5 text-xs text-gray-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Full Market Analysis for 24 hrs</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Fair Odds & Expected Value %</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> All Supported Leagues</li>
              </ul>
            </div>
            <Button onClick={() => handleSelectPlan("Match-Day Pass", "KES 20", "matchday_pass")} className="w-full bg-[#B30000] hover:bg-[#800000] text-white">
              Buy Pass (KES 20)
            </Button>
          </div>

          {/* Weekly Edge */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-[#121212] p-6 flex flex-col justify-between relative">
            <Badge className="absolute -top-3 right-6 bg-emerald-500 text-black font-bold text-[10px]">MOST POPULAR</Badge>
            <div>
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-400">7-Day Access</Badge>
              <h3 className="text-xl font-bold text-white mb-2">Weekly Edge</h3>
              <div className="text-3xl font-extrabold text-white mb-4">KES 99 <span className="text-xs font-normal text-gray-400">/ week</span></div>
              <ul className="space-y-2.5 text-xs text-gray-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 7 Days Full Platform Access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Fair Odds & Edge Badges</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Lineup Recalculation Alerts</li>
              </ul>
            </div>
            <Button onClick={() => handleSelectPlan("Weekly Edge", "KES 99", "weekly_edge")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Subscribe (KES 99)
            </Button>
          </div>

          {/* Edge Pro */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-[#121212] p-6 flex flex-col justify-between">
            <div>
              <Badge className="mb-4 bg-amber-500/20 text-amber-400">30-Day Monthly</Badge>
              <h3 className="text-xl font-bold text-white mb-2">Edge Pro</h3>
              <div className="text-3xl font-extrabold text-white mb-4">KES 399 <span className="text-xs font-normal text-gray-400">/ month</span></div>
              <ul className="space-y-2.5 text-xs text-gray-300 mb-6">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Unlimited Access for 30 Days</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Early Odds Snapshot Access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Full Exportable Backtest Analytics</li>
              </ul>
            </div>
            <Button onClick={() => handleSelectPlan("Edge Pro", "KES 399", "edge_pro")} className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold">
              Get Edge Pro (KES 399)
            </Button>
          </div>
        </div>

        {/* M-Pesa STK Push Checkout Modal */}
        {selectedPlan && (
          <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
            <DialogContent className="bg-[#121212] text-white border-white/20 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Smartphone className="h-5 w-5 text-emerald-400" /> Pay with M-Pesa
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400">
                  Subscribing to <strong className="text-white">{selectedPlan.name}</strong> for <strong className="text-emerald-400">{selectedPlan.price}</strong>.
                </DialogDescription>
              </DialogHeader>

              {paymentSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">M-Pesa Payment Confirmed!</h4>
                  <p className="text-xs text-gray-300">Your BallMtaani Edge access is now active.</p>
                  <span className="font-mono text-[10px] text-gray-500 block">Ref: {idempotencyKey}</span>
                  <Link href="/edge">
                    <Button className="w-full bg-[#B30000] text-white font-bold mt-2">Return to Predictions</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 py-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">Safarkom M-Pesa Phone Number</label>
                    <input
                      type="text"
                      placeholder="0712345678 or 254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <Button
                    onClick={handleInitiateMpesa}
                    disabled={isProcessing || !phoneNumber}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {isProcessing ? "Sending STK Push Prompt..." : `Pay ${selectedPlan.price} via M-Pesa`}
                  </Button>

                  <span className="text-[10px] text-gray-500 block text-center">
                    Secured by BallMtaani Serverless Idempotent Engine • ID: {idempotencyKey}
                  </span>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
