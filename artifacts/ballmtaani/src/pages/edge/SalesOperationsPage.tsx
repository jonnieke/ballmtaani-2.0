import React from "react";

const STAGE_COLORS: Record<string, string> = {
  lead:"bg-gray-500/20 text-gray-400", qualify:"bg-blue-500/20 text-blue-400",
  demo:"bg-purple-500/20 text-purple-400", proposal:"bg-amber-500/20 text-amber-400",
  contract:"bg-green-500/20 text-green-400", onboarding:"bg-emerald-500/20 text-emerald-400",
};
const mockOpps = [
  { id:"opp-001", name:"Safaricom SuperApp", stage:"proposal", valueKes:"KES 2.4M/yr", type:"telecom", lastActivity:"2026-07-24", owner:"CEO" },
  { id:"opp-002", name:"Sports Media Partner", stage:"demo",     valueKes:"KES 600k/yr", type:"publisher", lastActivity:"2026-07-22", owner:"Head of Sales" },
  { id:"opp-003", name:"KBC Radio Partnership", stage:"qualify", valueKes:"KES 300k/yr", type:"media", lastActivity:"2026-07-20", owner:"Head of Sales" },
];

export default function SalesOperationsPage() {
  const pipeline = mockOpps.reduce((sum,o) => sum + parseInt(o.valueKes.replace(/[^0-9]/g,"")), 0);
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Sales</div>
        <h1 className="text-2xl font-extrabold mb-1">Sales Operations</h1>
        <p className="text-gray-400 text-sm">Stage-gated pipeline. Opportunities may not remain in one stage indefinitely without review.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[["Pipeline Opportunities","3"],["Pipeline Value",`KES ${(pipeline/1000).toFixed(0)}k/yr`],["In Proposal","1"],["Avg Stage Age","8d"]].map(([l,v]) => (
          <div key={l as string} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{l}</div>
            <div className="text-xl font-extrabold">{v}</div>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {mockOpps.map((o) => (
          <div key={o.id} className="bg-[#141414] border border-white/8 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">{o.name}</span>
                <span className="text-xs text-gray-500">{o.type}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STAGE_COLORS[o.stage] ?? "bg-gray-500/20 text-gray-400"}`}>{o.stage}</span>
              </div>
              <div className="text-xs text-gray-500">Owner: {o.owner} · Last activity: {o.lastActivity}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white text-sm">{o.valueKes}</div>
              <button id={`opp-view-${o.id}`} className="text-xs text-emerald-400 hover:underline mt-1">View →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
