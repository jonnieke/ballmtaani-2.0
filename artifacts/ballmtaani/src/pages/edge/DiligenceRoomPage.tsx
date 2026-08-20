import React from "react";

const mockRequests = [
  { id:"dr-001", investor:"Savannah Ventures", category:"financial",         request:"12-month management accounts",  priority:"critical", status:"shared",     accessLevel:"confirmatory", due:"2026-07-25", completedAt:"2026-07-24" },
  { id:"dr-002", investor:"Savannah Ventures", category:"data_model",        request:"Backtest methodology document", priority:"high",     status:"ready",      accessLevel:"standard",     due:"2026-07-26", completedAt:"2026-07-25" },
  { id:"dr-003", investor:"Savannah Ventures", category:"product_technical",  request:"Architecture overview",         priority:"normal",   status:"in_progress",accessLevel:"standard",     due:"2026-07-28", completedAt:null },
  { id:"dr-004", investor:"Savannah Ventures", category:"legal",             request:"IP assignment records",         priority:"critical", status:"requested",  accessLevel:"restricted",   due:"2026-07-29", completedAt:null },
];

const STATUS_COLORS: Record<string, string> = {
  requested:"bg-gray-500/20 text-gray-400", in_progress:"bg-blue-500/20 text-blue-400",
  ready:"bg-amber-500/20 text-amber-400", shared:"bg-green-500/20 text-green-400",
  follow_up:"bg-purple-500/20 text-purple-400", closed:"bg-gray-400/20 text-gray-500",
};
const PRIORITY_COLORS: Record<string, string> = {
  critical:"text-red-400 font-bold", high:"text-amber-400 font-bold", normal:"text-gray-400", low:"text-gray-500",
};
const ACCESS_COLORS: Record<string, string> = {
  summary:"text-gray-400", standard:"text-blue-400", confirmatory:"text-purple-400", restricted:"text-red-400 font-bold",
};

export default function DiligenceRoomPage() {
  const expiresAt = "2026-08-25T00:00:00Z"; // illustrative grant expiry
  const expired = new Date(expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Diligence Room</div>
        <h1 className="text-2xl font-extrabold mb-1">Investor Diligence Requests</h1>
        <p className="text-gray-400 text-sm">Access is time-limited and audited. Restricted documents require explicit board approval for each investor.</p>
      </div>

      <div className={`rounded-lg p-3 mb-5 text-xs ${expired ? "bg-red-900/20 border border-red-500/20 text-red-300" : "bg-blue-900/20 border border-blue-500/20 text-blue-300"}`}>
        Data room access expires: <strong>{expiresAt.split("T")[0]}</strong> · {expired ? "⚠ ACCESS EXPIRED" : "All document downloads are logged."}
      </div>

      <div className="space-y-2">
        {mockRequests.map((r) => (
          <div key={r.id} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${PRIORITY_COLORS[r.priority]}`}>{r.priority.toUpperCase()}</span>
                  <span className="text-white font-bold">{r.request}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? ""}`}>{r.status.replace("_"," ")}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {r.category.replace("_"," ")} ·
                  Access: <span className={ACCESS_COLORS[r.accessLevel]}>{r.accessLevel}</span> ·
                  Due: {r.due}
                  {r.completedAt && ` · Fulfilled: ${r.completedAt}`}
                </div>
              </div>
              <button id={`diligence-view-${r.id}`} className="text-xs text-emerald-400 hover:underline">Manage →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
