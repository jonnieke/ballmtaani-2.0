import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Check, Lock, ShieldCheck, Zap } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function EdgePricingPreviewPage() {
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/edge/pricing-preview" />

      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/edge">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Edge Overview
            </Button>
          </Link>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Preview Mode — Phase 6 Monetization</Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs">
            BallMtaani Edge Subscriptions
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Future Access Packages</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Preview proposed subscription tiers for BallMtaani Edge. Access is currently free during beta preview mode.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Free Tier */}
          <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Free Preview</h3>
                <span className="text-2xl font-extrabold text-white font-mono">KES 0</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Basic 1X2 Probabilities</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Selected Daily Matches</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Public Performance Ledger</li>
              </ul>
            </div>
            <Button disabled variant="outline" className="w-full text-xs font-bold border-white/20 text-gray-400">
              Active Plan
            </Button>
          </div>

          {/* Match-Day Pass */}
          <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] mb-1">24-Hour Pass</Badge>
                <h3 className="text-lg font-bold text-white">Match-Day Pass</h3>
                <span className="text-2xl font-extrabold text-white font-mono">KES 20 <span className="text-xs text-gray-400 font-sans font-normal">/ day</span></span>
              </div>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 24-Hour Full Access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Over/Under & BTTS Analysis</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> M-Pesa Express Payment</li>
              </ul>
            </div>
            <Button onClick={() => setWaitlistSuccess(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white">
              {waitlistSuccess ? "Registered for Preview" : "Join Early Access"}
            </Button>
          </div>

          {/* Weekly Edge */}
          <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-[#121212] p-6 space-y-6 flex flex-col justify-between relative">
            <div className="space-y-4">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] mb-1">Most Popular</Badge>
                <h3 className="text-lg font-bold text-white">Weekly Edge</h3>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">KES 99 <span className="text-xs text-gray-400 font-sans font-normal">/ week</span></span>
              </div>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 7-Day Unrestricted Access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> All Supported Leagues</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Expected Goals & Likely Scores</li>
              </ul>
            </div>
            <Button onClick={() => setWaitlistSuccess(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white">
              {waitlistSuccess ? "Registered for Preview" : "Join Early Access"}
            </Button>
          </div>

          {/* Edge Pro */}
          <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] mb-1">Monthly VIP</Badge>
                <h3 className="text-lg font-bold text-white">Edge Pro</h3>
                <span className="text-2xl font-extrabold text-white font-mono">KES 399 <span className="text-xs text-gray-400 font-sans font-normal">/ month</span></span>
              </div>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Monthly Full Access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Fair Odds & Value Analysis</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Early Prediction Revision Alerts</li>
              </ul>
            </div>
            <Button onClick={() => setWaitlistSuccess(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white">
              {waitlistSuccess ? "Registered for Preview" : "Join Early Access"}
            </Button>
          </div>
        </div>

        {waitlistSuccess && (
          <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs text-center font-semibold">
            Thank you! You have been registered for early access to BallMtaani Edge Phase 6 subscriptions.
          </div>
        )}
      </div>
    </div>
  );
}
