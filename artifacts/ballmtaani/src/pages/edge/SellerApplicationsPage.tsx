import React from "react";

const mockApps = [
  { id:"sa-001", displayName:"David Mwangi Analytics", sellerType:"verified_analyst", riskScore:15, outcome:"auto_approve", status:"manual_review",  submittedAt:"2026-07-24", prohibitedClaims:0 },
  { id:"sa-002", displayName:"SportsPulse Media",       sellerType:"publisher",        riskScore:12, outcome:"auto_approve", status:"approved",       submittedAt:"2026-07-22", prohibitedClaims:0 },
  { id:"sa-003", displayName:"SureBetKE (REJECTED)",    sellerType:"creator",          riskScore:100, outcome:"reject",      status:"rejected",       submittedAt:"2026-07-20", prohibitedClaims:2 },
];

const STATUS_COLORS: Record<string, string> = {
  approved:"bg-green-500/20 text-green-400", rejected:"bg-red-500/20 text-red-400",
  manual_review:"bg-amber-500/20 text-amber-400", automated_review:"bg-blue-500/20 text-blue-400",
  submitted:"bg-gray-500/20 text-gray-400",
};

export default function SellerApplicationsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Marketplace</div>
        <h1 className="text-2xl font-extrabold mb-1">Seller Applications</h1>
        <p className="text-gray-400 text-sm">
          Risk scored and reviewed before approval. Applications with prohibited phrases (guaranteed tips, fixed matches, sure bet) are auto-rejected at score 100.
        </p>
      </div>
      <div className="space-y-3">
        {mockApps.map((a) => (
          <div key={a.id} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{a.displayName}</span>
                  <span className="text-xs text-gray-500">{a.sellerType.replace("_"," ")}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status] ?? ""}`}>{a.status.replace("_"," ")}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Submitted: {a.submittedAt} ·
                  Risk: <span className={a.riskScore >= 60 ? "text-red-400 font-bold" : "text-gray-400"}>{a.riskScore}</span>
                  {a.prohibitedClaims > 0 && <span className="ml-2 text-red-400 font-bold">⚠ {a.prohibitedClaims} prohibited claim(s) detected</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {a.status === "manual_review" && (
                  <>
                    <button id={`seller-app-approve-${a.id}`} className="bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-green-500/30 transition-colors">Approve</button>
                    <button id={`seller-app-reject-${a.id}`} className="bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-red-500/30 transition-colors">Reject</button>
                  </>
                )}
                <button id={`seller-app-view-${a.id}`} className="text-xs text-gray-400 hover:text-white transition-colors">View →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
