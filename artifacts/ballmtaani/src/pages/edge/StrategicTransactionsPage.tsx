import React from "react";

const mockTransactions = [
  { id:"st-001", type:"technology_licensing", counterparty:"Safaricom SuperApp", rationale:"Embed football predictions in super-app for KES-based distribution", estimatedValue:"KES 2.4M/yr", status:"counterparty_discussion", riskScore:30, overallScore:74 },
  { id:"st-002", type:"minority_investment",   counterparty:"Savannah Ventures",   rationale:"Seed capital for regional expansion and model development", estimatedValue:"$750k",         status:"diligence",              riskScore:25, overallScore:80 },
  { id:"st-003", type:"distribution_agreement",counterparty:"KBC Media",           rationale:"Content distribution for football intelligence segments", estimatedValue:"KES 300k/yr",   status:"exploratory",            riskScore:20, overallScore:70 },
];

const STATUS_COLORS: Record<string, string> = {
  identified:"bg-gray-500/20 text-gray-400", exploratory:"bg-blue-500/20 text-blue-400",
  internal_review:"bg-purple-500/20 text-purple-400", counterparty_discussion:"bg-amber-500/20 text-amber-400",
  diligence:"bg-orange-500/20 text-orange-400", negotiation:"bg-yellow-500/20 text-yellow-400",
  approved:"bg-green-500/20 text-green-400", rejected:"bg-red-500/20 text-red-400", completed:"bg-emerald-500/20 text-emerald-400",
};

export default function StrategicTransactionsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Strategic</div>
        <h1 className="text-2xl font-extrabold mb-1">Strategic Transactions</h1>
        <p className="text-gray-400 text-sm">Evaluated on control impact, employee continuity, regulatory complexity and multi-dimension score. Headline price is not the only criterion.</p>
      </div>
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 mb-5 text-xs text-red-300">
        🔒 Restricted. Transaction information must not be shared outside the authorised team. All views and exports are logged.
      </div>

      <div className="space-y-3">
        {mockTransactions.map((t) => (
          <div key={t.id} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{t.counterparty}</span>
                  <span className="text-xs text-gray-500">{t.type.replace(/_/g," ")}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] ?? ""}`}>{t.status.replace("_"," ")}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{t.rationale}</p>
                <div className="text-xs text-gray-500">
                  Value: {t.estimatedValue} · Risk score: {t.riskScore} · Overall: {t.overallScore}
                </div>
              </div>
              <button id={`transaction-view-${t.id}`} className="text-xs text-emerald-400 hover:underline shrink-0">View →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
