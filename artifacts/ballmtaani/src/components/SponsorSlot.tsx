import { useEffect } from "react";
import { analytics } from "../lib/analytics";

interface SponsorSlotProps {
  placement: string;
  className?: string;
}

/**
 * Named sponsor placement. Shows a tasteful "sponsor this spot" CTA.
 * Replace children content with actual creative once a sponsor is signed.
 * Fires a GA4 impression event on mount for reach reporting.
 */
export default function SponsorSlot({ placement, className = "" }: SponsorSlotProps) {
  useEffect(() => {
    analytics.sponsorImpression(placement);
  }, [placement]);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3 ${className}`}
      data-placement={placement}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-7 w-7 shrink-0 rounded-lg bg-white/6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/20">Sponsored</p>
          <p className="truncate text-[11px] font-bold text-white/30">Reserved sponsor placement for {placementLabel(placement)}</p>
        </div>
      </div>
      <a
        href="mailto:info@ballmtaani.com?subject=Sponsorship%20Inquiry"
        className="shrink-0 rounded-lg border border-[#FFD700]/20 bg-[#FFD700]/6 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/60 transition-all hover:border-[#FFD700]/40 hover:text-[#FFD700]"
        onClick={() => analytics.sponsorImpression(`${placement}:cta_click`)}
      >
        Sponsor &rarr;
      </a>
    </div>
  );
}

function placementLabel(placement: string): string {
  const map: Record<string, string> = {
    "homepage-hero":  "homepage",
    "fun-zone-hero":  "Fun Zone",
    "data-centre-sidebar": "Data Centre",
  };
  return map[placement] ?? "BallMtaani";
}




