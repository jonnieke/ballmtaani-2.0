import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { User, ShieldCheck, Clock, CreditCard, ArrowLeft, Bookmark } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeAccountPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <RouteSEO path="/account/edge" />

      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/edge">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edge
            </Button>
          </Link>
          <Badge className="bg-emerald-500/20 text-emerald-400">Active Subscriber Portal</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold text-white mb-6">Edge Account Overview</h1>

        {/* Current Plan Overview Card */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Active Plan</span>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">Weekly Edge Pass</h2>
              <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">Access valid until: <strong className="text-white font-mono">July 31, 2026</strong></p>
          </div>
          <Link href="/edge/pricing">
            <Button className="bg-[#B30000] hover:bg-[#800000] text-white font-bold text-xs">
              Extend / Upgrade Plan
            </Button>
          </Link>
        </div>

        {/* Transaction History Log */}
        <div className="rounded-xl border border-white/10 bg-[#121212] p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" /> Payment & Renewal History
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded bg-white/5 font-mono">
              <div>
                <span className="font-bold text-white block">Weekly Edge (KES 99)</span>
                <span className="text-gray-400">M-Pesa Ref: IDEM-99X87A</span>
              </div>
              <span className="text-emerald-400 font-bold">CONFIRMED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
