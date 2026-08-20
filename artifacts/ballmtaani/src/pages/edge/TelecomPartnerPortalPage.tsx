import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Smartphone, DollarSign, Users, ArrowLeft, ShieldCheck, CheckCircle } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function TelecomPartnerPortalPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/partners/telecom" />

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
              <Smartphone className="h-5 w-5 text-emerald-400" /> Telecom Distribution Portal
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Partner: Safaricom Telecom</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Telecom Subscriber Provisioning & Revenue Share</h1>
          <p className="text-xs text-gray-400">View active sponsored subscribers, bulk entitlement grants, and monthly revenue-share settlements.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Active Telecom Subscribers</span>
            <span className="text-2xl font-extrabold text-white font-mono">14,250</span>
            <span className="text-[10px] text-emerald-400 block">Hashed MSISDN Identities</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Sponsored 24h Passes</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">3,890</span>
            <span className="text-[10px] text-emerald-400 block">Active Sponsored Grants</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Gross Revenue (MTD)</span>
            <span className="text-2xl font-extrabold text-white font-mono">KES 1,425,000</span>
            <span className="text-[10px] text-gray-400 block">From Telecom Subscriptions</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Partner Revenue Share (30%)</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">KES 427,500</span>
            <span className="text-[10px] text-emerald-400 block">Platform Net: KES 997,500</span>
          </div>
        </div>
      </div>
    </div>
  );
}
