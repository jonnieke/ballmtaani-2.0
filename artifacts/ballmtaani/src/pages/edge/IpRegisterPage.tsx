import React from "react";

const mockAssets = [
  { id:"ip-001", type:"source_code",      title:"BallMtaani Platform Codebase",        assignmentStatus:"assigned",    status:"active",  registrationRef:null,    owner:"BallMtaani Limited", creatorRef:"Founding engineering team", agreementRef:"EMPLOY-001" },
  { id:"ip-002", type:"model",            title:"Football Prediction Ensemble v2.1",    assignmentStatus:"assigned",    status:"active",  registrationRef:null,    owner:"BallMtaani Limited", creatorRef:"Head of Data Science", agreementRef:"EMPLOY-002" },
  { id:"ip-003", type:"dataset",          title:"African Football Historical Dataset",   assignmentStatus:"assigned",    status:"active",  registrationRef:null,    owner:"BallMtaani Limited", creatorRef:"Data engineering team", agreementRef:"DATA-PROC-001" },
  { id:"ip-004", type:"trademark",        title:"BallMtaani / BallMtaani Edge",         assignmentStatus:"unconfirmed", status:"pending_registration", registrationRef:null, owner:"BallMtaani Limited", creatorRef:null, agreementRef:null },
  { id:"ip-005", type:"domain",           title:"ballmtaani.com / ballmtaani.co.ke",    assignmentStatus:"assigned",    status:"active",  registrationRef:"WHC-REG-001", owner:"BallMtaani Limited", creatorRef:null, agreementRef:"DOMAIN-ASSIGN-001" },
];

const ASSIGNMENT_COLORS: Record<string, string> = {
  assigned:"bg-green-500/20 text-green-400", assumed_employment:"bg-blue-500/20 text-blue-400",
  unconfirmed:"bg-amber-500/20 text-amber-400", disputed:"bg-red-500/20 text-red-400",
};
const TYPE_ICONS: Record<string, string> = {
  source_code:"💻", model:"🤖", dataset:"📊", trademark:"™",
  domain:"🌐", design:"🎨", content:"📝", trade_secret:"🔒",
};

export default function IpRegisterPage() {
  const unconfirmed = mockAssets.filter(a => a.assignmentStatus === "unconfirmed");
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · IP Register</div>
        <h1 className="text-2xl font-extrabold mb-1">Intellectual Property Register</h1>
        <p className="text-gray-400 text-sm">Chain-of-title records for all material IP assets. Assignment must be confirmed by a supporting agreement.</p>
      </div>

      {unconfirmed.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 mb-5 text-xs text-amber-300">
          ⚠ {unconfirmed.length} material asset(s) with <strong>unconfirmed ownership</strong>.
          Company ownership is not confirmed until an IP assignment or employment agreement is recorded.
          {unconfirmed.map(a => <div key={a.id} className="mt-1">— {a.title}</div>)}
        </div>
      )}

      <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
        <table className="w-full text-xs text-gray-400">
          <thead><tr className="border-b border-white/8 text-left">
            <th className="p-3">Asset</th><th className="p-3">Type</th><th className="p-3">Owner</th>
            <th className="p-3">Assignment</th><th className="p-3">Agreement</th>
          </tr></thead>
          <tbody>
            {mockAssets.map((a) => (
              <tr key={a.id} className="border-b border-white/5">
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <span>{TYPE_ICONS[a.type] ?? "📄"}</span>
                    <span className="text-white font-bold leading-snug">{a.title}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-500">{a.type.replace("_"," ")}</td>
                <td className="p-3">{a.owner}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold ${ASSIGNMENT_COLORS[a.assignmentStatus] ?? ""}`}>
                    {a.assignmentStatus.replace("_"," ")}
                  </span>
                </td>
                <td className="p-3">
                  {a.agreementRef ? <span className="text-emerald-400">{a.agreementRef}</span> : <span className="text-amber-400">⚠ Missing</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
