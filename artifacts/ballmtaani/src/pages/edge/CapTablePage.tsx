import React from "react";

const mockRows = [
  { id:"sh-001", holder:"Founder A", type:"individual", classKey:"ordinary_a", sharesHeld:"5,000,000", pctOwnership:"50.0000%", votingPct:"50.0000%", fullyDiluted:"47.619%", issueDate:"2024-03-01", status:"active" },
  { id:"sh-002", holder:"Founder B", type:"individual", classKey:"ordinary_a", sharesHeld:"5,000,000", pctOwnership:"50.0000%", votingPct:"50.0000%", fullyDiluted:"47.619%", issueDate:"2024-03-01", status:"active" },
  { id:"sh-003", holder:"Option Pool (Reserved)", type:"pool", classKey:"ordinary_a", sharesHeld:"1,000,000 (reserved)", pctOwnership:"—", votingPct:"—", fullyDiluted:"~4.762%", issueDate:null, status:"reserved" },
];

export default function CapTablePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Cap Table</div>
        <h1 className="text-2xl font-extrabold mb-1">Capitalization Table</h1>
        <p className="text-gray-400 text-sm">Computed from integer share records. Fully diluted includes unexercised option pool as an estimate only.</p>
      </div>
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 mb-5 text-xs text-red-300">
        🔒 Restricted. Cap table records must not be shared externally without legal and executive approval. All views are logged.
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[["Total Authorized","10,000,000 shares (Ordinary A)"],["Total Issued","10,000,000 shares"],["Option Pool","1,000,000 units (reserved, unissued)"]].map(([l,v]) => (
          <div key={l as string} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{l}</div>
            <div className="font-extrabold text-white text-sm">{v}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden mb-4">
        <table className="w-full text-xs text-gray-400">
          <thead><tr className="border-b border-white/8 text-left">
            <th className="p-3">Holder</th><th className="p-3">Class</th><th className="p-3">Shares</th>
            <th className="p-3">% Ownership</th><th className="p-3">% Voting</th><th className="p-3">% Fully Diluted</th><th className="p-3">Issued</th>
          </tr></thead>
          <tbody>
            {mockRows.map(r => (
              <tr key={r.id} className={`border-b border-white/5 ${r.status === "reserved" ? "opacity-50" : ""}`}>
                <td className="p-3 text-white font-bold">{r.holder}</td>
                <td className="p-3">{r.classKey}</td>
                <td className="p-3 font-mono">{r.sharesHeld}</td>
                <td className="p-3 font-mono">{r.pctOwnership}</td>
                <td className="p-3 font-mono">{r.votingPct}</td>
                <td className="p-3 font-mono text-gray-600">{r.fullyDiluted}</td>
                <td className="p-3">{r.issueDate ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-600">
        ⚠ Percentages are derived from integer share counts and displayed for reference only.
        Do not use percentage figures as the authoritative record of legal ownership.
        Fully diluted estimate includes unexercised option pool — actual conversion requires legal review.
      </div>
    </div>
  );
}
