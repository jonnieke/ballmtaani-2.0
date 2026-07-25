import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ShieldCheck, Activity, Users, CreditCard, ArrowLeft, FileText, CheckCircle } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function EnterpriseDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/tenant/dashboard" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/edge">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Edge Home
              </Button>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> Enterprise Tenant Portal
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Standard Media Group</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Enterprise Governance & SLA Metrics</h1>
          <p className="text-xs text-gray-400">View contract SLAs, team role access, enterprise invoices, and SLA measurements.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">SLA Availability (MTD)</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">99.94%</span>
            <span className="text-[10px] text-emerald-400 block">Target 99.9% Exceeded</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Contract Status</span>
            <span className="text-2xl font-extrabold text-white font-mono">Active</span>
            <span className="text-[10px] text-gray-400 block">Enterprise Tier</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Authorized Seats</span>
            <span className="text-2xl font-extrabold text-white font-mono">8 / 15 Users</span>
            <span className="text-[10px] text-emerald-400 block">7 Seats Remaining</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Monthly Contract Fee</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">$1,500</span>
            <span className="text-[10px] text-gray-500 block">Billed Annually</span>
          </div>
        </div>
      </div>
    </div>
  );
}
