import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TrendingUp, DollarSign, Users, ArrowLeft, ShieldCheck, Activity, BarChart3, AlertCircle } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";
import { UnitEconomicsEngine } from "../../lib/edge/commercial/unit-economics-engine";

export default function ExecutiveDashboardPage() {
  const metrics = UnitEconomicsEngine.calculateCommercialMetrics();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/admin/edge/executive" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/edge">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Edge Control Panel
              </Button>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" /> Executive Commercial Dashboard
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs">
            Investor-Grade Metrics
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Commercial Scale-Up & Unit Economics</h1>
          <p className="text-xs text-gray-400">Executive metrics for MRR, ARPU, LTV:CAC, contribution margin, and model health governance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Monthly Recurring Revenue (MRR)</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">${metrics.mrrUsd.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400 block">+18.4% MoM Growth</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Average Revenue Per User (ARPU)</span>
            <span className="text-2xl font-extrabold text-white font-mono">${metrics.arpuUsd.toFixed(2)}</span>
            <span className="text-[10px] text-gray-400 block">Across Consumer & Telecom</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">LTV : CAC Ratio</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{metrics.ltvCacRatio}x</span>
            <span className="text-[10px] text-emerald-400 block">LTV: ${metrics.ltvUsd.toFixed(2)} | CAC: ${metrics.cacUsd.toFixed(2)}</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Subscription Gross Margin</span>
            <span className="text-2xl font-extrabold text-white font-mono">{metrics.grossMarginPercentage}%</span>
            <span className="text-[10px] text-emerald-400 block">Day-30 Retention: {metrics.day30RetentionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
