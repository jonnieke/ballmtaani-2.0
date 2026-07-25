import React from "react";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  trialing: "bg-blue-500/20 text-blue-400",
  past_due: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-400",
};
const INV_STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-500/20 text-green-400",
  open: "bg-blue-500/20 text-blue-400",
  draft: "bg-gray-500/20 text-gray-400",
  disputed: "bg-red-500/20 text-red-400",
};

const mockSubs = [
  { id:"sub-001", tenant:"The Score KE", plan:"Publisher", billing:"monthly", status:"active",   period:"2026-07", apiUsed:8420, apiIncl:10000, amount:"KES 12,000" },
  { id:"sub-002", tenant:"DevStudio TZ", plan:"Developer", billing:"monthly", status:"trialing", period:"2026-07", apiUsed:1200, apiIncl:5000,  amount:"Free Trial" },
];
const mockInvoices = [
  { number:"INV-2026-07-SCORE", tenant:"The Score KE", period:"2026-07", total:"KES 12,000", status:"paid", issued:"2026-07-01" },
];

export default function B2bBillingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · B2B Billing</div>
        <h1 className="text-2xl font-extrabold mb-1">B2B Subscriptions & Invoicing</h1>
        <p className="text-gray-400 text-sm">Subscription management, usage-based billing, invoice workflow and dispute handling. All amounts in minor units.</p>
      </div>

      <div className="mb-6">
        <div className="text-sm font-bold mb-3">Active Subscriptions</div>
        <div className="space-y-3">
          {mockSubs.map((s) => (
            <div key={s.id} className="bg-[#141414] border border-white/8 rounded-xl p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{s.tenant}</span>
                  <span className="text-xs text-gray-500">{s.plan} · {s.billing}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{s.period}</div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">API: </span>
                    <span className="font-mono">{s.apiUsed.toLocaleString()}</span>
                    <span className="text-gray-600"> / {s.apiIncl.toLocaleString()}</span>
                  </div>
                  <div className="w-32 bg-white/10 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${s.apiUsed/s.apiIncl > 0.9 ? "bg-red-500" : "bg-emerald-500"}`} style={{width:`${Math.min(100,(s.apiUsed/s.apiIncl)*100)}%`}} />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-sm">{s.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-bold mb-3">Recent Invoices</div>
        <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-gray-400">
            <thead><tr className="border-b border-white/8 text-left"><th className="p-3">Invoice</th><th className="p-3">Partner</th><th className="p-3">Period</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Issued</th></tr></thead>
            <tbody>
              {mockInvoices.map((inv) => (
                <tr key={inv.number} className="border-b border-white/5">
                  <td className="p-3 font-mono text-white">{inv.number}</td>
                  <td className="p-3">{inv.tenant}</td>
                  <td className="p-3">{inv.period}</td>
                  <td className="p-3 font-bold text-white">{inv.total}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full font-bold ${INV_STATUS_COLORS[inv.status]}`}>{inv.status}</span></td>
                  <td className="p-3">{inv.issued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
