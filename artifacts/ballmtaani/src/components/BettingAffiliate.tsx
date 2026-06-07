/**
 * BettingAffiliate
 *
 * "Back Your Call" strip shown after a prediction is locked.
 * Links to major Kenyan betting platforms with UTM tracking.
 *
 * Revenue model:
 *   - Short term: UTM data proves traffic to betting companies
 *   - Medium term: Formal affiliate agreement = $5–15 per depositing user
 *
 * Placement: below locked prediction cards on /predictions
 */

import { ExternalLink } from "lucide-react";
import { analytics } from "../lib/analytics";

interface BettingPlatform {
  name: string;
  short: string;
  url: string;
  color: string;
  bg: string;
  border: string;
}

const PLATFORMS: BettingPlatform[] = [
  {
    name: "SportPesa",
    short: "SP",
    url: "https://www.sportpesa.co.ke/?utm_source=ballmtaani&utm_medium=referral&utm_campaign=wc26_prediction",
    color: "text-[#00A651]",
    bg: "bg-[#00A651]/10",
    border: "border-[#00A651]/25",
  },
  {
    name: "Odibets",
    short: "OB",
    url: "https://www.odibets.com/?utm_source=ballmtaani&utm_medium=referral&utm_campaign=wc26_prediction",
    color: "text-[#FF6B00]",
    bg: "bg-[#FF6B00]/10",
    border: "border-[#FF6B00]/25",
  },
  {
    name: "Betway",
    short: "BW",
    url: "https://www.betway.co.ke/?utm_source=ballmtaani&utm_medium=referral&utm_campaign=wc26_prediction",
    color: "text-[#00A4E4]",
    bg: "bg-[#00A4E4]/10",
    border: "border-[#00A4E4]/25",
  },
];

interface Props {
  matchLabel?: string;
  compact?: boolean;
}

export default function BettingAffiliate({ matchLabel, compact = false }: Props) {
  const handleClick = (platform: string) => {
    analytics.pageView(`betting_click_${platform.toLowerCase()}`);
    window.gtag?.("event", "betting_affiliate_click", {
      platform,
      match: matchLabel || "unknown",
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 shrink-0">Back it:</span>
        {PLATFORMS.map(p => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(p.name)}
            className={`rounded-lg border ${p.border} ${p.bg} ${p.color} px-2 py-1 text-[9px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity`}
          >
            {p.name}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/6 bg-[#08090d] p-3 mt-1">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/25">Back your call with real money</span>
        <span className="text-[8px] text-white/15 font-bold">18+ · Gamble responsibly</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PLATFORMS.map(p => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(p.name)}
            className={`flex items-center justify-center gap-1.5 rounded-lg border ${p.border} ${p.bg} py-2.5 transition-all hover:opacity-80 active:scale-[0.97]`}
          >
            <span className={`text-[11px] font-black ${p.color}`}>{p.name}</span>
            <ExternalLink className={`w-2.5 h-2.5 ${p.color} opacity-60`} />
          </a>
        ))}
      </div>
    </div>
  );
}
