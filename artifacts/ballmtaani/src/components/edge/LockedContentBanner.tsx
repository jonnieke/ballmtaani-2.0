import React, { useState } from "react";
import { Button } from "../ui/button";
import { Lock, Zap } from "lucide-react";
import { CheckoutModal } from "./CheckoutModal";

export interface LockedContentBannerProps {
  sectionTitle: string;
  requiredPlanCode?: string;
  description?: string;
}

export default function LockedContentBanner({
  sectionTitle,
  requiredPlanCode = "matchday_pass",
  description = "Unlock full Over/Under 2.5, BTTS, top scorelines, risk factors, and prediction revision history.",
}: LockedContentBannerProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#121212] to-[#121212] p-6 text-center space-y-3 shadow-lg">
        <div className="h-10 w-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <Lock className="h-5 w-5" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-white">Unlock {sectionTitle}</h3>
          <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
        </div>

        <Button
          onClick={() => setIsCheckoutOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6"
        >
          <Zap className="mr-1.5 h-3.5 w-3.5 fill-current" /> Unlock Premium Analysis
        </Button>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlanCode={requiredPlanCode}
      />
    </>
  );
}
