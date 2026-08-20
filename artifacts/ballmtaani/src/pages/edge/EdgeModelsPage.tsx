import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Cpu } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function EdgeModelsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/edge/models" />

      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/edge">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Edge Overview
            </Button>
          </Link>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active Model Registry</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Model Version Registry & Transparency</h1>
          <p className="text-xs text-gray-400">Inspect parameters, training windows, and evaluation metrics for active prediction models.</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">ballmtaani-edge-statistical-v1</h2>
              <span className="text-xs text-gray-400">Dixon-Coles Elo Hybrid Model</span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono">ACTIVE BETA</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-400 block font-sans text-[10px]">Base Rating</span>
              <span className="text-white font-bold">1500 Elo</span>
            </div>
            <div>
              <span className="text-gray-400 block font-sans text-[10px]">Home Advantage</span>
              <span className="text-emerald-400 font-bold">+65 Rating</span>
            </div>
            <div>
              <span className="text-gray-400 block font-sans text-[10px]">K-Factor</span>
              <span className="text-white font-bold">32</span>
            </div>
            <div>
              <span className="text-gray-400 block font-sans text-[10px]">Dixon-Coles Rho</span>
              <span className="text-emerald-400 font-bold">-0.08</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-300">
            <p><strong>Supported Leagues:</strong> Premier League, UEFA Champions League, La Liga, Serie A.</p>
            <p><strong>Brier Score:</strong> 0.4850 | <strong>Log Loss:</strong> 0.8200 | <strong>ECE:</strong> 0.045</p>
          </div>
        </div>
      </div>
    </div>
  );
}
