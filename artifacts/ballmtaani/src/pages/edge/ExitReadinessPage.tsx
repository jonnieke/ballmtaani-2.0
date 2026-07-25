import React from "react";

interface DomainRow { label: string; score: number; weight: number; gaps: string[] }
const mockDomains: DomainRow[] = [
  { label:"Corporate Records",   score:75, weight:0.15, gaps:["Board approvals documented","Corporate governance docs"] },
  { label:"IP Ownership",        score:60, weight:0.18, gaps:["Trademarks registered","OSS inventory clean"] },
  { label:"Financial Quality",   score:80, weight:0.18, gaps:["Financial forecast prepared"] },
  { label:"Commercial Quality",  score:82, weight:0.17, gaps:[] },
  { label:"Technical Quality",   score:70, weight:0.15, gaps:["Security audited","Technical debt registered"] },
  { label:"Compliance",          score:88, weight:0.10, gaps:[] },
  { label:"People",              score:65, weight:0.07, gaps:["Key-person risk mitigated","Leadership succession planned"] },
];

const overallScore = Math.round(mockDomains.reduce((s, d) => s + d.score * d.weight, 0));
const label = overallScore >= 85 ? "Highly Prepared" : overallScore >= 70 ? "Transaction Ready" : overallScore >= 55 ? "Diligence Capable" : overallScore >= 35 ? "Early Preparation" : "Not Ready";
const LABEL_COLORS: Record<string, string> = {
  "Highly Prepared":"bg-green-500/20 text-green-400",
  "Transaction Ready":"bg-emerald-500/20 text-emerald-400",
  "Diligence Capable":"bg-blue-500/20 text-blue-400",
  "Early Preparation":"bg-amber-500/20 text-amber-400",
  "Not Ready":"bg-red-500/20 text-red-400",
};

export default function ExitReadinessPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Exit Readiness</div>
        <h1 className="text-2xl font-extrabold mb-1">Exit Readiness Scorecard</h1>
        <p className="text-gray-400 text-sm">Comprehensive assessment across 7 domains. Includes known liabilities and gaps — weaknesses are not hidden.</p>
      </div>

      <div className="flex items-center gap-4 mb-6 bg-[#141414] border border-white/8 rounded-xl p-5">
        <div className="text-5xl font-extrabold text-white">{overallScore}</div>
        <div>
          <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${LABEL_COLORS[label] ?? ""}`}>{label}</span>
          <p className="text-xs text-gray-400 mt-1">Weighted across corporate, IP, financial, commercial, technical, compliance and people.</p>
        </div>
      </div>

      <div className="space-y-3">
        {mockDomains.map((d) => (
          <div key={d.label} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-white">{d.label}</div>
              <span className={`text-sm font-extrabold ${d.score >= 75 ? "text-green-400" : d.score >= 55 ? "text-amber-400" : "text-red-400"}`}>{d.score}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
              <div className={`h-1.5 rounded-full ${d.score >= 75 ? "bg-emerald-500" : d.score >= 55 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width:`${d.score}%` }} />
            </div>
            {d.gaps.length > 0 && (
              <div className="text-xs text-amber-400 flex gap-2 flex-wrap">
                {d.gaps.map(g => <span key={g} className="bg-amber-900/20 px-2 py-0.5 rounded">⚠ {g}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300">
        Exit readiness includes all known gaps and liabilities. Do not present this scorecard to investors or counterparties without legal review of the underlying records.
        An exit is not assumed to be the preferred outcome.
      </div>
    </div>
  );
}
