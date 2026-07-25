import React from "react";

const STAGES = ["pilot","validated_pilot","limited_scale","channel_scale","market_scale","regional_scale","mature_operation"];
const TYPES = ["consumer","mobile","creator","publisher","b2b_api","telecom","competition","country","payment_provider"];

const mockProgrammes = [
  { key:"ke_consumer_growth", name:"Kenya Consumer Growth", scaleType:"consumer", currentStage:"pilot", status:"active", userLimit:500, owner:"CEO" },
  { key:"ke_creator_scale",   name:"Creator Channel Scale", scaleType:"creator",  currentStage:"pilot", status:"proposed", userLimit:null, owner:"Head of Growth" },
];

export default function ScaleProgrammesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Scale Governance</div>
        <h1 className="text-2xl font-extrabold mb-1">Scale Programmes</h1>
        <p className="text-gray-400 text-sm">Evidence-based scaling with explicit stage gates. No automatic progression.</p>
      </div>

      <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-3 mb-6 text-xs text-amber-300">
        ⚠ Stage advances require all gate criteria to pass AND an authorised approver signature. Stage skipping is not permitted.
      </div>

      <div className="space-y-4 mb-8">
        {mockProgrammes.map((p) => {
          const stageIdx = STAGES.indexOf(p.currentStage);
          return (
            <div key={p.key} className="bg-[#141414] border border-white/8 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.key} · {p.scaleType} · Owner: {p.owner}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {p.status}
                </span>
              </div>
              {/* Stage progress */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap ${i < stageIdx ? "bg-emerald-500/20 text-emerald-400" : i === stageIdx ? "bg-emerald-500 text-white" : "bg-white/5 text-gray-600"}`}>
                      {s.replace(/_/g," ")}
                    </div>
                    {i < STAGES.length - 1 && <span className="text-gray-700 text-xs">→</span>}
                  </div>
                ))}
              </div>
              {p.userLimit && (
                <div className="mt-3 text-xs text-gray-500">User ceiling: <span className="text-white font-mono">{p.userLimit.toLocaleString()}</span></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-[#141414] border border-white/8 rounded-xl p-5">
        <div className="text-sm font-bold mb-3">Stage Ceiling Reference</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-gray-400">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-2">Stage</th>
                <th className="text-right py-2">Max Users</th>
                <th className="text-right py-2">Max Partners</th>
                <th className="text-right py-2">Max Countries</th>
                <th className="text-right py-2">Exec Sign</th>
              </tr>
            </thead>
            <tbody>
              {[["pilot","500","5","1","No"],["validated_pilot","2,000","20","1","No"],["limited_scale","10,000","50","2","Yes"],["channel_scale","30,000","150","3","Yes"],["market_scale","100,000","500","5","Yes"],["regional_scale","500,000","2,000","10","Yes"],["mature_operation","—","—","—","Yes"]].map(([s,...v]) => (
                <tr key={s} className="border-b border-white/5">
                  <td className="py-2 text-white font-mono">{s}</td>
                  {v.map((val, i) => <td key={i} className="text-right py-2">{val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
