import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Layers, Copy, ArrowLeft, Check, Plus, Code } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function TenantNewsroomPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/tenant/newsroom" />

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
              <Layers className="h-5 w-5 text-emerald-400" /> Publisher Newsroom & Match Collections
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Tenant: Standard Media Group</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Curated Newsroom Collections</h1>
            <p className="text-xs text-gray-400">Assemble match collections for newsroom articles and embed widgets.</p>
          </div>

          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create New Collection
          </Button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Active Collection</Badge>
              <span className="text-xs font-mono text-gray-400">3 Fixtures</span>
            </div>

            <h3 className="text-lg font-bold text-white">Weekend Premier League Derby Highlights</h3>
            <p className="text-xs text-gray-300">Curated match predictions for Arsenal vs Liverpool and Chelsea vs Man City.</p>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <Button size="sm" variant="outline" className="border-white/20 text-xs font-bold text-gray-300">
                <Code className="mr-1.5 h-3.5 w-3.5" /> Copy Widget Code
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
