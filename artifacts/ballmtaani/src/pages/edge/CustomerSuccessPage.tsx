import React from "react";

const HEALTH_COLORS: Record<string, string> = {
  Healthy: "text-green-400", Watch: "text-yellow-400", "At risk": "text-orange-400", Critical: "text-red-400"
};
const FORECAST_COLORS: Record<string, string> = {
  Likely: "text-green-400", Uncertain: "text-yellow-400", "At risk": "text-orange-400", "Churn expected": "text-red-400"
};
const STAGE_COLORS: Record<string, string> = {
  onboarding:"bg-blue-500/20 text-blue-400", launched:"bg-purple-500/20 text-purple-400",
  healthy:"bg-green-500/20 text-green-400", at_risk:"bg-red-500/20 text-red-400",
  renewal:"bg-amber-500/20 text-amber-400", expanding:"bg-emerald-500/20 text-emerald-400"
};

const mockAccounts = [
  { id:"cs-001", org:"The Score KE", segment:"publisher", stage:"healthy", healthScore:78, healthLabel:"Healthy", renewalForecast:"Likely", contractKes:"KES 144,000/yr", daysToRenewal:180 },
  { id:"cs-002", org:"SportMedia UG", segment:"small_media", stage:"onboarding", healthScore:52, healthLabel:"Watch", renewalForecast:"Uncertain", contractKes:"KES 60,000/yr", daysToRenewal:null },
];

export default function CustomerSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Customer Success</div>
        <h1 className="text-2xl font-extrabold mb-1">Customer Success Accounts</h1>
        <p className="text-gray-400 text-sm">Health scoring, lifecycle management, success plans and renewal forecasting for B2B partners.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[["Total Accounts","2"],["Healthy","1"],["At Risk","0"],["Renewal Q3","1"]].map(([l,v]) => (
          <div key={l as string} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{l}</div>
            <div className="text-2xl font-extrabold">{v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {mockAccounts.map((a) => (
          <div key={a.id} className="bg-[#141414] border border-white/8 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-white">{a.org}</div>
                <div className="text-xs text-gray-500">{a.segment} · {a.contractKes}</div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${STAGE_COLORS[a.stage] ?? "bg-gray-500/20 text-gray-400"}`}>{a.stage.replace(/_/g," ")}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-gray-500 mb-1">Health Score</div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{width:`${a.healthScore}%`}} />
                </div>
                <div className={`font-bold ${HEALTH_COLORS[a.healthLabel]}`}>{a.healthScore}/100 · {a.healthLabel}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Renewal Forecast</div>
                <div className={`font-bold ${FORECAST_COLORS[a.renewalForecast]}`}>{a.renewalForecast}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Days to Renewal</div>
                <div className="font-bold">{a.daysToRenewal ? `${a.daysToRenewal}d` : "—"}</div>
              </div>
              <div>
                <button id={`cs-plan-${a.id}`} className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg font-bold w-full transition-colors">View Success Plan</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
