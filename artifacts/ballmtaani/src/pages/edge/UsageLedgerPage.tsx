import React from "react";

const mockEvents = [
  { id:"evt-001", tenant:"The Score KE", type:"api_request",   qty:1240, period:"2026-07", key:"ke-score-api-2026-07-24-batch-1", status:"recorded" },
  { id:"evt-002", tenant:"The Score KE", type:"widget_view",   qty:8420, period:"2026-07", key:"ke-score-widget-2026-07-24-batch-1", status:"billed" },
  { id:"evt-003", tenant:"DevStudio TZ", type:"api_request",   qty:320,  period:"2026-07", key:"tz-dev-api-2026-07-24-batch-1", status:"recorded" },
];

const STATUS_COLORS: Record<string, string> = {
  recorded:"bg-blue-500/20 text-blue-400", billed:"bg-green-500/20 text-green-400",
  disputed:"bg-red-500/20 text-red-400", excluded:"bg-gray-500/20 text-gray-400",
};

export default function UsageLedgerPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Usage Ledger</div>
        <h1 className="text-2xl font-extrabold mb-1">Billable Usage Ledger</h1>
        <p className="text-gray-400 text-sm">Immutable usage event log. Original records are never modified — adjustments use separate adjustment records.</p>
      </div>
      <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-3 mb-6 text-xs text-amber-300">
        ⚠ This ledger is immutable. To correct a record, create a Usage Adjustment — never edit the original event. All adjustments require approver sign-off.
      </div>
      <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/8 text-sm font-bold">Usage Events · 2026-07</div>
        <table className="w-full text-xs text-gray-400">
          <thead><tr className="border-b border-white/8 text-left"><th className="p-3">Tenant</th><th className="p-3">Type</th><th className="p-3">Qty</th><th className="p-3">Period</th><th className="p-3">Event Key</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {mockEvents.map((e) => (
              <tr key={e.id} className="border-b border-white/5">
                <td className="p-3 text-white font-bold">{e.tenant}</td>
                <td className="p-3">{e.type.replace(/_/g," ")}</td>
                <td className="p-3 font-mono text-white">{e.qty.toLocaleString()}</td>
                <td className="p-3">{e.period}</td>
                <td className="p-3 font-mono text-gray-600 max-w-xs truncate">{e.key}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[e.status]}`}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
