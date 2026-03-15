import { Shield, Target, Award, Flame, Crown } from "lucide-react";
import React from "react";

export type TierLevel = "Plastic Fan" | "Benchwarmer" | "First Team" | "Captain" | "Club Legend";

export interface TierConfig {
  label: TierLevel;
  minInteractions: number;
  nextThreshold: number | null;
  color: string;
  glow: string;
  icon: React.ElementType;
}

export const TIERS: TierConfig[] = [
  {
    label: "Plastic Fan",
    minInteractions: 0,
    nextThreshold: 20,
    color: "bg-gray-800 text-gray-400 border-gray-600",
    glow: "shadow-none",
    icon: Shield,
  },
  {
    label: "Benchwarmer",
    minInteractions: 20,
    nextThreshold: 100,
    color: "bg-blue-900/50 text-blue-400 border-blue-500/50",
    glow: "shadow-[0_0_10px_rgba(59,130,246,0.2)]",
    icon: Target,
  },
  {
    label: "First Team",
    minInteractions: 100,
    nextThreshold: 300,
    color: "bg-green-900/50 text-green-400 border-green-500/50",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.4)]",
    icon: Award,
  },
  {
    label: "Captain",
    minInteractions: 300,
    nextThreshold: 1000,
    color: "bg-red-900/50 text-red-400 border-red-500/50",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse",
    icon: Flame,
  },
  {
    label: "Club Legend",
    minInteractions: 1000,
    nextThreshold: null,
    color: "bg-yellow-900/50 text-yellow-400 border-yellow-500/80 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]",
    glow: "shadow-[0_0_25px_rgba(250,204,21,0.8),inset_0_0_10px_rgba(250,204,21,0.5)]",
    icon: Crown,
  },
];

export function getUserTier(interactions: number): TierConfig {
  // Find the highest tier where interactions >= minInteractions
  let currentTier = TIERS[0];
  for (const tier of TIERS) {
    if (interactions >= tier.minInteractions) {
      currentTier = tier;
    } else {
      break;
    }
  }
  return currentTier;
}
