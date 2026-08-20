import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Check, Clock, CreditCard, ShieldCheck, Zap, Receipt, Bell, Heart, Gift } from "lucide-react";
import { CheckoutModal } from "../../components/edge/CheckoutModal";
import ReceiptView from "../../components/edge/ReceiptView";
import NotificationCenterView from "../../components/edge/NotificationCenterView";
import SavedMatchesView from "../../components/edge/SavedMatchesView";
import ReferralsView from "../../components/edge/ReferralsView";
import RouteSEO from "../../components/RouteSEO";

export default function AccountEdgePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "notifications" | "saved" | "referrals" | "history" | "receipt">("overview");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("weekly_edge");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/account/edge" />

      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/edge">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Edge Overview
            </Button>
          </Link>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">My Edge Account</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Subscription & Alert Center</h1>
          <p className="text-xs text-gray-400">View active plan entitlements, notification feeds, saved watchlist, referrals, payment history, and receipts.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 text-xs font-bold gap-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 shrink-0 transition-colors ${activeTab === "overview" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            Active Plan
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-3 shrink-0 flex items-center gap-1.5 transition-colors ${activeTab === "notifications" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Bell className="h-3.5 w-3.5" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 shrink-0 flex items-center gap-1.5 transition-colors ${activeTab === "saved" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Heart className="h-3.5 w-3.5" /> Saved Watchlist
          </button>
          <button
            onClick={() => setActiveTab("referrals")}
            className={`pb-3 shrink-0 flex items-center gap-1.5 transition-colors ${activeTab === "referrals" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Gift className="h-3.5 w-3.5" /> Referrals
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 shrink-0 transition-colors ${activeTab === "history" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab("receipt")}
            className={`pb-3 shrink-0 transition-colors ${activeTab === "receipt" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            Latest Receipt
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 to-[#121212] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] mb-1">
                    Active Subscription
                  </Badge>
                  <h2 className="text-2xl font-extrabold text-white">Weekly Edge Pass</h2>
                </div>
                <span className="text-sm font-bold text-emerald-400 font-mono">KES 99 / 7 Days</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
                <div>
                  <span className="text-gray-400 block font-sans text-[10px]">Status</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-sans text-[10px]">Expires At</span>
                  <span className="text-white font-bold">2026-08-01 19:30</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-sans text-[10px]">Remaining Time</span>
                  <span className="text-emerald-400 font-bold">6 Days 18 Hrs</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Active Plan Entitlements</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Full 1X2 Probabilities</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Over/Under 2.5 & BTTS Analysis</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Top Likely Scorelines</span>
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Full Prediction Archive Access</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button onClick={() => { setSelectedPlan("weekly_edge"); setIsCheckoutOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  Renew Plan (KES 99)
                </Button>
                <Button onClick={() => { setSelectedPlan("edge_pro"); setIsCheckoutOpen(true); }} variant="outline" className="border-white/20 text-white text-xs font-bold">
                  Upgrade to Edge Pro (KES 399)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === "notifications" && <NotificationCenterView />}

        {/* Tab 3: Saved Watchlist */}
        {activeTab === "saved" && <SavedMatchesView />}

        {/* Tab 4: Referrals */}
        {activeTab === "referrals" && <ReferralsView />}

        {/* Tab 5: Payment History */}
        {activeTab === "history" && (
          <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Payment Transaction History</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Weekly Edge (7 Days)</span>
                  <span className="text-gray-400 text-[10px]">Ref: BM-EDGE-99120 | M-Pesa: 2547***5678</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">KES 99</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Successful</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Latest Receipt */}
        {activeTab === "receipt" && (
          <ReceiptView
            paymentReference="BM-EDGE-99120"
            providerTransactionId="M-PESA-QW98120"
            planName="Weekly Edge"
            amount={99}
            paymentDate={new Date().toISOString()}
            startsAt={new Date().toISOString()}
            expiresAt={new Date(Date.now() + 7 * 86400000).toISOString()}
            phoneMasked="2547***5678"
          />
        )}
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlanCode={selectedPlan}
      />
    </div>
  );
}
