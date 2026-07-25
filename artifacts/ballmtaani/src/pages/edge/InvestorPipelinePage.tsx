import React from "react";

const mockInvestors = [
  { id:"io-001", name:"Savannah Ventures",      type:"vc",             status:"diligence",         fitScore:82, proposed:"$500k–$1M", stage:"seed",          geo:"Africa",   nextAction:"Share financials", nextAt:"2026-07-28" },
  { id:"io-002", name:"Telecom Growth Fund",    type:"strategic_media", status:"initial_meeting",   fitScore:71, proposed:"$1M–$3M",  stage:"series_a",      geo:"Africa",   nextAction:"Demo session",     nextAt:"2026-07-30" },
  { id:"io-003", name:"SparkPoint Angel",       type:"angel",           status:"information_shared",fitScore:65, proposed:"$100k",    stage:"pre_seed",      geo:"Global",   nextAction:"Follow-up call",   nextAt:"2026-07-26" },
];

const STATUS_COLORS: Record<string, string> = {
  identified:"bg-gray-500/20 text-gray-400", introduced:"bg-blue-500/20 text-blue-400",
  initial_meeting:"bg-purple-500/20 text-purple-400", information_shared:"bg-indigo-500/20 text-indigo-400",
  active_discussion:"bg-amber-500/20 text-amber-400", diligence:"bg-orange-500/20 text-orange-400",
  term_sheet:"bg-yellow-500/20 text-yellow-400", closed:"bg-green-500/20 text-green-400",
  declined:"bg-red-500/20 text-red-400",
};

export default function InvestorPipelinePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Investment</div>
        <h1 className="text-2xl font-extrabold mb-1">Investor Pipeline</h1>
        <p className="text-gray-400 text-sm">Stage-gated pipeline. Investor fit scored across stage, ticket, market, sector and strategic value. Do not optimise for valuation alone.</p>
      </div>
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 mb-5 text-xs text-red-300">
        🔒 Restricted. This information must not be shared outside authorised team members. All views are logged.
      </div>

      <div className="space-y-3">
        {mockInvestors.map((inv) => (
          <div key={inv.id} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{inv.name}</span>
                  <span className="text-xs text-gray-500">{inv.type.replace("_"," ")}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[inv.status] ?? ""}`}>{inv.status.replace("_"," ")}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {inv.stage} · {inv.geo} · Proposed: {inv.proposed} ·
                  Fit: <span className={inv.fitScore >= 75 ? "text-green-400 font-bold" : inv.fitScore >= 55 ? "text-amber-400 font-bold" : "text-gray-400"}>{inv.fitScore}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">Next: {inv.nextAction} by {inv.nextAt}</div>
              </div>
              <button id={`investor-view-${inv.id}`} className="text-xs text-emerald-400 hover:underline">View →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
