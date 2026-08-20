import React from "react";

const mockOpps = [
  { id:"so-001", sportKey:"basketball", sportName:"Basketball", status:"data_review", overallScore:58, decision:"approve_research",  audienceScore:72, dataScore:65, modelScore:62, licensingScore:55, revenueScore:55, riskScore:20, owner:"Head of Sports Intelligence", reviewedAt:"2026-07-20" },
  { id:"so-002", sportKey:"cricket",    sportName:"Cricket",    status:"research",    overallScore:55, decision:"approve_research",  audienceScore:65, dataScore:70, modelScore:60, licensingScore:60, revenueScore:60, riskScore:18, owner:"Head of Sports Intelligence", reviewedAt:"2026-07-18" },
  { id:"so-003", sportKey:"rugby",      sportName:"Rugby",      status:"research",    overallScore:52, decision:"approve_research",  audienceScore:60, dataScore:55, modelScore:58, licensingScore:50, revenueScore:48, riskScore:15, owner:"Head of Sports Intelligence", reviewedAt:"2026-07-18" },
  { id:"so-004", sportKey:"tennis",     sportName:"Tennis",     status:"identified",  overallScore:48, decision:"defer",            audienceScore:50, dataScore:75, modelScore:72, licensingScore:65, revenueScore:50, riskScore:15, owner:"Head of Sports Intelligence", reviewedAt:null },
  { id:"so-005", sportKey:"athletics",  sportName:"Athletics",  status:"identified",  overallScore:44, decision:"defer",            audienceScore:68, dataScore:45, modelScore:35, licensingScore:40, revenueScore:35, riskScore:12, owner:"Head of Sports Intelligence", reviewedAt:null },
];

const DECISION_COLORS: Record<string, string> = {
  approve_research:"bg-blue-500/20 text-blue-400", approve_internal_pilot:"bg-purple-500/20 text-purple-400",
  activate:"bg-green-500/20 text-green-400", defer:"bg-amber-500/20 text-amber-400", reject:"bg-red-500/20 text-red-400",
};

function ScoreBar({ val, label }: { val: number; label: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>{label}</span><span>{val}</span></div>
      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${val >= 60 ? "bg-emerald-500" : val >= 45 ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width:`${val}%` }} />
      </div>
    </div>
  );
}

export default function SportOpportunitiesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Cross-Sport</div>
        <h1 className="text-2xl font-extrabold mb-1">Sport Opportunity Scorecards</h1>
        <p className="text-gray-400 text-sm">Each sport evaluated on 11 weighted dimensions. Minimum thresholds must be met before onboarding.</p>
      </div>

      <div className="space-y-4">
        {mockOpps.map((o) => (
          <div key={o.id} className="bg-[#141414] border border-white/8 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-white text-lg">{o.sportName}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DECISION_COLORS[o.decision]}`}>{o.decision.replace(/_/g," ")}</span>
                </div>
                <div className="text-xs text-gray-500">Owner: {o.owner}{o.reviewedAt ? ` · Reviewed: ${o.reviewedAt}` : " · Not yet reviewed"}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-white">{o.overallScore}</div>
                <div className="text-xs text-gray-500">Overall score</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <ScoreBar val={o.audienceScore}  label="Audience & demand" />
              <ScoreBar val={o.dataScore}      label="Data availability" />
              <ScoreBar val={o.modelScore}     label="Modelling feasibility" />
              <ScoreBar val={o.licensingScore} label="Licensing" />
              <ScoreBar val={o.revenueScore}   label="Commercial revenue" />
              <ScoreBar val={100 - o.riskScore} label="Responsible use" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300">
        ⚠ A sport with Decision = "defer" does not have sufficient data or modelling feasibility.
        Do not approve based on betting-market availability or strategic enthusiasm alone.
        Re-evaluate when data coverage and model feasibility improve.
      </div>
    </div>
  );
}
