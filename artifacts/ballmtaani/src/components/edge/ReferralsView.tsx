import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Gift, Copy, Check, Share2, Users, Clock } from "lucide-react";
import { ReferralService } from "../../lib/edge/personalization/referral-service";

export default function ReferralsView() {
  const [copied, setCopied] = useState(false);
  const referralCode = ReferralService.getOrCreateReferralCode("usr-current");
  const shareUrl = `https://ballmtaani.co.ke/edge?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-xl font-bold text-white">Referral Rewards Program</h2>
        <p className="text-xs text-gray-400">Invite fellow football fans to BallMtaani Edge and earn 24 bonus hours per qualifying referral.</p>
      </div>

      {/* Share Box */}
      <div className="p-6 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-[#121212] to-[#121212] space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
            <Gift className="mr-1 h-3.5 w-3.5" /> Earn 24 Hours Per Friend
          </Badge>
          <span className="text-xs font-mono text-gray-400">Your Code: <strong className="text-white">{referralCode}</strong></span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 select-all"
          />
          <Button onClick={handleCopy} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>
      </div>

      {/* Program Terms & Referral Ledger */}
      <div className="rounded-xl border border-white/10 bg-[#121212] p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Referral Qualification Ledger</h3>
        <div className="space-y-3 text-xs font-mono">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Referred: User 2547***9910</span>
              <span className="text-gray-400 text-[10px]">Status: Qualified Payment (Weekly Pass)</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-400 block">+24 Access Hours</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Granted</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
