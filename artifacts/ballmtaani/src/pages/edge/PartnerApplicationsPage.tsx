import React from "react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  submitted: "bg-blue-500/20 text-blue-400",
  automated_review: "bg-purple-500/20 text-purple-400",
  manual_review: "bg-amber-500/20 text-amber-400",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  withdrawn: "bg-gray-500/10 text-gray-600",
};

const RISK_COLORS: Record<string, string> = {
  auto_approve: "text-green-400",
  limited_trial: "text-blue-400",
  manual_review: "text-amber-400",
  enhanced_verification: "text-orange-400",
  reject: "text-red-400",
};

const mockApplications = [
  { id:"app-001", org:"The Score KE", type:"publisher", market:"KE", status:"manual_review", riskScore:38, riskOutcome:"manual_review", submitted:"2026-07-24" },
  { id:"app-002", org:"DevStudio TZ", type:"developer", market:"TZ", status:"approved",      riskScore:18, riskOutcome:"auto_approve",   submitted:"2026-07-23" },
  { id:"app-003", org:"SportMedia UG", type:"small_media", market:"UG", status:"submitted",  riskScore:55, riskOutcome:"manual_review",   submitted:"2026-07-25" },
];

export default function PartnerApplicationsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Partner Onboarding</div>
        <h1 className="text-2xl font-extrabold mb-1">Partner Applications</h1>
        <p className="text-gray-400 text-sm">Self-service partner registration, automated risk scoring and verification workflow.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[["Total",mockApplications.length],["Manual Review",1],["Approved",1],["Avg Risk Score","37"]].map(([l,v]) => (
          <div key={l as string} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{l}</div>
            <div className="text-2xl font-extrabold">{v}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/8 text-sm font-bold">Applications Queue</div>
        <div className="divide-y divide-white/5">
          {mockApplications.map((a) => (
            <div key={a.id} className="p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-white">{a.org}</span>
                  <span className="text-xs text-gray-500">{a.type} · {a.market}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[a.status]}`}>{a.status.replace(/_/g," ")}</span>
                  <span className={`font-bold ${RISK_COLORS[a.riskOutcome]}`}>Risk: {a.riskScore}/100 · {a.riskOutcome.replace(/_/g," ")}</span>
                  <span className="text-gray-600">{a.submitted}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {a.status === "manual_review" && (
                  <>
                    <button id={`approve-${a.id}`} className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg font-bold hover:bg-green-500/30 transition-colors">Approve</button>
                    <button id={`reject-${a.id}`} className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg font-bold hover:bg-red-500/30 transition-colors">Reject</button>
                  </>
                )}
                {a.status === "approved" && <span className="text-xs text-green-400 font-bold px-3 py-1.5">✓ Provisioned</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-[#141414] border border-white/8 rounded-xl p-5">
        <div className="text-sm font-bold mb-3">Risk Score Reference</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {[["0–20","Auto Approve","text-green-400"],["21–40","Limited Trial","text-blue-400"],["41–65","Manual Review","text-amber-400"],["66–85","Enhanced Verification","text-orange-400"],["86–100","Reject","text-red-400"]].map(([r,l,c]) => (
            <div key={r as string} className="bg-white/3 rounded-lg p-3">
              <div className={`font-bold ${c} text-sm`}>{r}</div>
              <div className="text-gray-400 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
