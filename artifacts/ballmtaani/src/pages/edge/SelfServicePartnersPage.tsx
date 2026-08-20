import React from "react";

const mockPartners = [
  { id:"p-001", org:"The Score KE", type:"publisher", plan:"Publisher", apiClients:2, widgets:3, apiUsagePct:34, billingStatus:"current", healthLabel:"Healthy" },
  { id:"p-002", org:"DevStudio TZ", type:"developer", plan:"Developer", apiClients:1, widgets:0, apiUsagePct:12, billingStatus:"current", healthLabel:"Watch" },
];

const HEALTH_COLORS: Record<string, string> = {
  Healthy: "bg-green-500/20 text-green-400",
  Watch: "bg-yellow-500/20 text-yellow-400",
  "At risk": "bg-orange-500/20 text-orange-400",
  Critical: "bg-red-500/20 text-red-400",
};

export default function SelfServicePartnersPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Self-Service Partners</div>
        <h1 className="text-2xl font-extrabold mb-1">Active Partner Accounts</h1>
        <p className="text-gray-400 text-sm">Monitor API clients, widgets, usage and billing across all active self-service partners.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[["Active Partners","2"],["API Clients","3"],["Active Widgets","3"],["Avg API Usage","23%"]].map(([l,v]) => (
          <div key={l as string} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{l}</div>
            <div className="text-2xl font-extrabold">{v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {mockPartners.map((p) => (
          <div key={p.id} className="bg-[#141414] border border-white/8 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-white">{p.org}</div>
                <div className="text-xs text-gray-500">{p.type} · {p.plan}</div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${HEALTH_COLORS[p.healthLabel]}`}>{p.healthLabel}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div><div className="text-gray-500 mb-1">API Clients</div><div className="font-bold">{p.apiClients}</div></div>
              <div><div className="text-gray-500 mb-1">Widgets</div><div className="font-bold">{p.widgets}</div></div>
              <div>
                <div className="text-gray-500 mb-1">API Usage</div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-1"><div className="bg-emerald-500 h-1.5 rounded-full" style={{width:`${p.apiUsagePct}%`}} /></div>
                <div className="font-bold mt-1">{p.apiUsagePct}%</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Billing</div>
                <div className={`font-bold ${p.billingStatus === "current" ? "text-green-400" : "text-red-400"}`}>{p.billingStatus}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
