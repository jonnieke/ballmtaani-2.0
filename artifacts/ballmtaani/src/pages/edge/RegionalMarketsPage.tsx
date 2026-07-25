import React from "react";

const MARKET_STATUS_COLORS: Record<string, string> = {
  market_research:"bg-gray-500/20 text-gray-400", internal_pilot:"bg-blue-500/20 text-blue-400",
  commercial_pilot:"bg-purple-500/20 text-purple-400", limited_launch:"bg-amber-500/20 text-amber-400",
  scaled_launch:"bg-green-500/20 text-green-400", compliance_review:"bg-orange-500/20 text-orange-400",
};

const mockMarkets = [
  { cc:"KE", name:"Kenya", status:"limited_launch", currency:"KES", overallScore:82, paymentScore:88, complianceScore:85, modelScore:78, owner:"CEO" },
  { cc:"TZ", name:"Tanzania", status:"commercial_pilot", currency:"TZS", overallScore:67, paymentScore:62, complianceScore:72, modelScore:65, owner:"Head of Expansion" },
  { cc:"UG", name:"Uganda", status:"internal_pilot", currency:"UGX", overallScore:58, paymentScore:55, complianceScore:68, modelScore:60, owner:"Head of Expansion" },
  { cc:"NG", name:"Nigeria", status:"compliance_review", currency:"NGN", overallScore:44, paymentScore:50, complianceScore:40, modelScore:48, owner:"Compliance Lead" },
  { cc:"GH", name:"Ghana", status:"market_research", currency:"GHS", overallScore:35, paymentScore:30, complianceScore:42, modelScore:32, owner:"Strategy" },
];

export default function RegionalMarketsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Regional Markets</div>
        <h1 className="text-2xl font-extrabold mb-1">Regional Market Lifecycle</h1>
        <p className="text-gray-400 text-sm">13-stage market lifecycle from research to scaled launch. No market skips stages without evidence-based gate reviews.</p>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-3 mb-6 text-xs text-amber-300">
        ⚠ Markets must not move directly from research to commercial launch. Each stage gate requires compliance, payment, model and readiness scores above thresholds.
      </div>

      <div className="space-y-4">
        {mockMarkets.map((m) => (
          <div key={m.cc} className="bg-[#141414] border border-white/8 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-white/20">{m.cc}</div>
                <div>
                  <div className="font-bold text-white">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.currency} · Owner: {m.owner}</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${MARKET_STATUS_COLORS[m.status] ?? "bg-gray-500/20 text-gray-400"}`}>{m.status.replace(/_/g," ")}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[["Overall",m.overallScore],["Payment",m.paymentScore],["Compliance",m.complianceScore],["Model",m.modelScore]].map(([label,score]) => (
                <div key={label as string}>
                  <div className="text-gray-500 mb-1">{label}</div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                    <div className={`h-1.5 rounded-full ${(score as number) >= 70 ? "bg-green-500" : (score as number) >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{width:`${score}%`}} />
                  </div>
                  <div className="font-bold">{score}/100</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
