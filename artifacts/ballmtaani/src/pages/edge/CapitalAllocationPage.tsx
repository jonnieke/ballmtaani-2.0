import React from "react";

const URGENCY_COLORS: Record<string, string> = { none:"text-gray-500", monitor:"text-blue-400", hire_soon:"text-amber-400", hire_now:"text-red-400" };
const RISK_COLORS: Record<string, string> = { low:"text-green-400", medium:"text-yellow-400", high:"text-orange-400", critical:"text-red-400" };

const mockCapacity = [
  { fn:"customer_support", avail:100, committed:72, risk:"low",      backlog:"1.2d average response" },
  { fn:"engineering",      avail:100, committed:85, risk:"medium",   backlog:"6 open PRs" },
  { fn:"model_operations", avail:100, committed:91, risk:"high",     backlog:"2 drift alerts pending" },
  { fn:"partner_success",  avail:100, committed:60, risk:"low",      backlog:"None" },
  { fn:"compliance",       avail:100, committed:88, risk:"high",     backlog:"TZ market review pending" },
];
const mockProposals = [
  { title:"Tanzania Market Launch", type:"country_expansion", amount:"KES 1.2M", strategicValue:85, risk:40, score:72, rec:"approve" },
  { title:"ML Ensemble Model v3", type:"model", amount:"KES 800k", strategicValue:90, risk:30, score:82, rec:"approve" },
  { title:"Paid Radio Campaign", type:"marketing", amount:"KES 2.5M", strategicValue:45, risk:65, score:41, rec:"defer" },
];

const REC_COLORS: Record<string, string> = { approve:"text-green-400", defer:"text-amber-400", reject:"text-red-400", request_revision:"text-orange-400" };

export default function CapitalAllocationPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Capital Allocation</div>
        <h1 className="text-2xl font-extrabold mb-1">Capital Allocation & Capacity</h1>
        <p className="text-gray-400 text-sm">Investment proposal scoring, team capacity utilisation and hiring trigger evaluation.</p>
      </div>

      <div className="mb-8">
        <div className="text-sm font-bold mb-3">Investment Proposals</div>
        <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-gray-400">
            <thead><tr className="border-b border-white/8 text-left"><th className="p-3">Proposal</th><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Strategic</th><th className="p-3">Risk</th><th className="p-3">Score</th><th className="p-3">Recommendation</th></tr></thead>
            <tbody>
              {mockProposals.map((p) => (
                <tr key={p.title} className="border-b border-white/5">
                  <td className="p-3 text-white font-bold">{p.title}</td>
                  <td className="p-3">{p.type.replace(/_/g," ")}</td>
                  <td className="p-3 font-mono">{p.amount}</td>
                  <td className="p-3">{p.strategicValue}/100</td>
                  <td className="p-3">{p.risk}/100</td>
                  <td className="p-3 font-bold text-white">{p.score}/100</td>
                  <td className={`p-3 font-bold ${REC_COLORS[p.rec]}`}>{p.rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="text-sm font-bold mb-3">Team Capacity Snapshots · 2026-07</div>
        <div className="space-y-3">
          {mockCapacity.map((c) => {
            const util = Math.min(100, Math.round((c.committed / c.avail) * 100));
            return (
              <div key={c.fn} className="bg-[#141414] border border-white/8 rounded-xl p-4 flex items-center gap-4">
                <div className="w-36 text-xs text-white font-bold">{c.fn.replace(/_/g," ")}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Utilisation</span><span className={`font-bold ${RISK_COLORS[c.risk]}`}>{util}% · {c.risk}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`h-2 rounded-full ${util >= 90 ? "bg-red-500" : util >= 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{width:`${util}%`}} />
                  </div>
                </div>
                <div className="text-xs text-gray-500 w-40 text-right">{c.backlog}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
