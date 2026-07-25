import React from "react";

const TREND_COLORS: Record<string, string> = { improving:"text-green-400", stable:"text-yellow-400", declining:"text-red-400" };
const TREND_ICONS: Record<string, string> = { improving:"↑", stable:"→", declining:"↓" };

const mockConsumer = { period:"2026-07", startingPaidUsers:3800, renewedUsers:3116, expiredUsers:684, reactivatedUsers:120, upgrades:95, downgrades:42, repeatPassPurchases:1420, renewalRatePct:82.0, revenueRetentionPct:84.3 };
const mockB2b = { period:"2026-07", startingContractValue:"KES 360,000", renewedValue:"KES 330,000", expansionValue:"KES 48,000", contractionValue:"KES 12,000", churnedValue:"KES 18,000", grrPct:86.7, nrrPct:99.9 };

export default function RevenueRetentionPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Revenue Retention</div>
        <h1 className="text-2xl font-extrabold mb-1">Revenue Retention</h1>
        <p className="text-gray-400 text-sm">GRR, NRR and consumer renewal tracking. New subscriber cohorts excluded from prior-period base. Implementation fees excluded from recurring revenue.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[["Consumer Renewal",`${mockConsumer.renewalRatePct}%`,"improving"],["Consumer Rev Retention",`${mockConsumer.revenueRetentionPct}%`,"stable"],["B2B GRR",`${mockB2b.grrPct}%`,"improving"],["B2B NRR",`${mockB2b.nrrPct}%`,"stable"]].map(([l,v,t]) => (
          <div key={l as string} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{l}</div>
            <div className="text-2xl font-extrabold">{v}</div>
            <div className={`text-xs font-bold mt-1 ${TREND_COLORS[t as string]}`}>{TREND_ICONS[t as string]} {t}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Consumer */}
        <div className="bg-[#141414] border border-white/8 rounded-xl p-5">
          <div className="text-sm font-bold mb-4">Consumer Retention · {mockConsumer.period}</div>
          <div className="space-y-2 text-xs">
            {[["Starting Paid Users",mockConsumer.startingPaidUsers.toLocaleString()],["Renewed",mockConsumer.renewedUsers.toLocaleString()],["Expired",mockConsumer.expiredUsers.toLocaleString()],["Reactivated",mockConsumer.reactivatedUsers.toLocaleString()],["Upgrades",mockConsumer.upgrades.toLocaleString()],["Downgrades",mockConsumer.downgrades.toLocaleString()],["Repeat Pass Purchases",mockConsumer.repeatPassPurchases.toLocaleString()]].map(([k,v]) => (
              <div key={k as string} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">{k}</span>
                <span className="font-bold text-white font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* B2B */}
        <div className="bg-[#141414] border border-white/8 rounded-xl p-5">
          <div className="text-sm font-bold mb-4">B2B Retention · {mockB2b.period}</div>
          <div className="space-y-2 text-xs">
            {[["Starting Contract Value",mockB2b.startingContractValue],["Renewed",mockB2b.renewedValue],["Expansion",mockB2b.expansionValue],["Contraction",mockB2b.contractionValue],["Churned",mockB2b.churnedValue],["GRR",`${mockB2b.grrPct}%`],["NRR",`${mockB2b.nrrPct}%`]].map(([k,v]) => (
              <div key={k as string} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">{k}</span>
                <span className="font-bold text-white font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
