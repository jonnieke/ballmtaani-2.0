import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { HelpCircle, ArrowLeft, ShieldCheck, CreditCard, Bell, Activity } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function LaunchHelpCentrePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/edge/help" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/edge">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Edge Overview
              </Button>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-emerald-400" /> BallMtaani Edge Help & Support Centre
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Responsible AI Guidance</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Frequently Asked Questions & Support</h1>
          <p className="text-xs text-gray-400 mt-1">Learn how match probabilities work, M-Pesa billing, saved-match alerts, and responsible prediction usage.</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" /> How are match probabilities calculated?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              We blend Elo ratings, Dixon-Coles Poisson goal rates, and gradient boosting into calibrated probabilities. All probabilities sum to exactly 100%.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400" /> How does M-Pesa subscription billing work?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              When you choose a plan (Match-Day Pass KES 20, Weekly Edge KES 99, Edge Pro KES 399), an STK Push is sent to your Safaricom phone number. Once approved, your subscription activates immediately.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Are predictions guaranteed?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              No. Football contains natural variance. Predictions represent statistical probabilities for match analysis, not guaranteed outcomes or fixed bets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
