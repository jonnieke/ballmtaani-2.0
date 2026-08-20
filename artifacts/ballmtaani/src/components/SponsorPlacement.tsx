/**
 * BallMtaani Sponsor Placement Component
 * Clean, CLS-free sponsored placement support for partners with explicit labeling.
 */

import React from "react";
import { canShowAdsOnPath } from "../lib/ad-surface";

interface Props {
  sponsorName?: string;
  tagline?: string;
  linkUrl?: string;
  bannerType?: "homepage" | "match-centre" | "article";
}

export function SponsorPlacement({
  sponsorName = "Official Matchday Partner",
  tagline = "Fuel your football matchday experience with BallMtaani MTC rewards.",
  linkUrl = "/store",
}: Props) {
  if (!canShowAdsOnPath()) return null;

  return (
    <div className="w-full min-h-[80px] rounded-2xl bg-gradient-to-r from-[#181d2a] to-[#111319] border border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30 text-[9px] font-black uppercase tracking-widest shrink-0">
          SPONSORED
        </span>
        <div>
          <h4 className="text-xs font-bold text-white">{sponsorName}</h4>
          <p className="text-[11px] text-white/60 leading-tight">{tagline}</p>
        </div>
      </div>
      <a
        href={linkUrl}
        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider transition-colors border border-white/10 shrink-0 text-center"
      >
        Learn More
      </a>
    </div>
  );
}
