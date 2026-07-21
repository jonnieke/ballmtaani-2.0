/**
 * BallMtaani Ad Campaign Manager Component
 * Renders active sponsored experiences with CLS protection and explicit SPONSORED badge.
 */

import React, { useState } from "react";
import { getActiveCampaign, AdPlacementType } from "../lib/ad-campaigns";
import { trackEvent } from "../lib/analytics-events";

interface Props {
  placement: AdPlacementType;
}

export function AdCampaignManager({ placement }: Props) {
  const campaign = getActiveCampaign(placement);
  const [clickCount, setClickCount] = useState(0);

  if (!campaign) return null;

  const handleClick = () => {
    setClickCount(v => v + 1);
    trackEvent("receipt_shared", { campaignId: campaign.id, placement });
    window.open(campaign.destinationUrl, "_blank");
  };

  return (
    <div className="w-full min-h-[90px] rounded-2xl bg-[#131620] border border-[#FFD700]/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl my-4">
      <div className="flex items-center gap-3">
        <span className="px-2.5 py-1 rounded bg-[#FFD700] text-black text-[9px] font-black uppercase tracking-widest shrink-0">
          OFFICIAL SPONSOR
        </span>
        <div>
          <h4 className="text-xs font-black text-white">{campaign.sponsorName}</h4>
          <p className="text-[11px] text-white/70">{campaign.tagline}</p>
        </div>
      </div>

      <button
        onClick={handleClick}
        className="px-4 py-2 rounded-xl bg-[#B30000] hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors shrink-0 shadow-md"
      >
        Explore Partner Offer
      </button>
    </div>
  );
}
