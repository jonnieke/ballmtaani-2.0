import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Smartphone, WifiOff, Zap, Bell, ArrowLeft, ShieldCheck, Heart } from "lucide-react";
import { MOCK_PUBLISHED_PREDICTIONS } from "../../lib/edge/public/public-api-service";
import PredictionCard from "./PredictionCard";

export default function MobileAppPreviewView() {
  const [lowDataMode, setLowDataMode] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm border-4 border-gray-800 rounded-[40px] bg-[#121212] overflow-hidden shadow-2xl space-y-4 pb-6">
        {/* Mobile Header Bar */}
        <div className="bg-black/90 px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span className="font-extrabold text-sm text-white">BallMtaani Edge App</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">v1.0.0</Badge>
        </div>

        {/* Mobile Settings Controls */}
        <div className="px-4 flex items-center justify-between text-xs font-mono">
          <label className="flex items-center gap-2 cursor-pointer text-gray-300">
            <input type="checkbox" checked={lowDataMode} onChange={(e) => setLowDataMode(e.target.checked)} className="accent-emerald-500" />
            <span>Low-Data Mode</span>
          </label>

          <button onClick={() => setIsOffline(!isOffline)} className={`px-2 py-1 rounded text-[10px] font-bold ${isOffline ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            {isOffline ? "Offline Mode" : "Online Mode"}
          </button>
        </div>

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="mx-4 p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-400 text-[11px] flex items-center gap-2">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>Viewing cached predictions. Last updated 12m ago.</span>
          </div>
        )}

        {/* Prediction Cards List */}
        <div className="px-4 space-y-4 max-h-[500px] overflow-y-auto">
          {MOCK_PUBLISHED_PREDICTIONS.slice(0, 2).map((pred) => (
            <PredictionCard key={pred.fixtureId} prediction={pred} />
          ))}
        </div>
      </div>
    </div>
  );
}
