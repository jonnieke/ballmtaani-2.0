import React from "react";

const mockEntities = [
  { id:"ce-001", legalName:"BallMtaani Limited",         tradingName:"BallMtaani Edge",    type:"operating_company", jurisdiction:"Kenya",   status:"active",  regNo:"PVT-2024-001234", incorporated:"2024-03-01" },
  { id:"ce-002", legalName:"BallMtaani Holdings Limited", tradingName:"BallMtaani Group",  type:"holding_company",   jurisdiction:"Kenya",   status:"planned", regNo:null,              incorporated:null },
];
const mockShareholdings = [
  { id:"sh-001", holder:"Founder A", classKey:"ordinary_a", shares:"5,000,000", pct:"50.000%", votingPct:"50.000%" },
  { id:"sh-002", holder:"Founder B", classKey:"ordinary_a", shares:"5,000,000", pct:"50.000%", votingPct:"50.000%" },
];

const STATUS_COLORS: Record<string, string> = {
  active:"bg-green-500/20 text-green-400", planned:"bg-blue-500/20 text-blue-400",
  dormant:"bg-gray-500/20 text-gray-400", dissolved:"bg-red-500/20 text-red-400",
};

export default function CorporateRecordsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Corporate</div>
        <h1 className="text-2xl font-extrabold mb-1">Corporate Records</h1>
        <p className="text-gray-400 text-sm">Entity registry, shareholder information and governance documents. Access is restricted.</p>
      </div>
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 mb-5 text-xs text-red-300">
        🔒 Restricted area. Corporate records are accessible to authorised personnel only. All views are logged.
      </div>

      <div className="mb-6">
        <div className="text-sm font-bold mb-3 text-gray-300">Corporate Entities</div>
        <div className="space-y-3">
          {mockEntities.map((e) => (
            <div key={e.id} className="bg-[#141414] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{e.legalName}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {e.type.replace("_"," ")} · {e.jurisdiction}
                    {e.regNo && ` · Reg: ${e.regNo}`}
                    {e.incorporated && ` · Incorporated: ${e.incorporated}`}
                  </div>
                </div>
                <button id={`corporate-view-${e.id}`} className="text-xs text-emerald-400 hover:underline">View →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-bold mb-3 text-gray-300">Shareholdings — BallMtaani Limited (Indicative)</div>
        <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-gray-400">
            <thead><tr className="border-b border-white/8 text-left"><th className="p-3">Shareholder</th><th className="p-3">Class</th><th className="p-3">Shares</th><th className="p-3">% Ownership</th><th className="p-3">% Voting</th></tr></thead>
            <tbody>
              {mockShareholdings.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="p-3 text-white font-bold">{s.holder}</td>
                  <td className="p-3">{s.classKey}</td>
                  <td className="p-3 font-mono">{s.shares}</td>
                  <td className="p-3 font-mono">{s.pct}</td>
                  <td className="p-3 font-mono">{s.votingPct}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 text-xs text-gray-600 border-t border-white/5">
            Percentages are derived from integer share counts. Do not use percentage figures as the authoritative ownership record.
            Shares held: 10,000,000 of 10,000,000 authorized (Ordinary A).
          </div>
        </div>
      </div>
    </div>
  );
}
