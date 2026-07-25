import React from "react";

const steps = [
  { id:"email", label:"Verify Email", done:true },
  { id:"org", label:"Complete Organisation", done:true },
  { id:"terms", label:"Accept Partner Terms", done:true },
  { id:"domain", label:"Verify Domain", done:false },
  { id:"plan", label:"Select Plan", done:false },
  { id:"api", label:"Create API Client", done:false },
  { id:"widget", label:"Create Widget", done:false },
  { id:"test", label:"Test Integration", done:false },
  { id:"attribution", label:"Review Attribution", done:false },
  { id:"launch", label:"Launch", done:false },
];

const plans = [
  { key:"widget_starter", name:"Widget Starter", price:"KES 1,500/mo", features:["1 verified domain","50k widget views/mo","Public prediction fields","BallMtaani attribution"] },
  { key:"publisher", name:"Publisher", price:"KES 5,000/mo", features:["3 domains","500k widget views/mo","Basic API access","Usage dashboard"] },
  { key:"developer", name:"Developer", price:"KES 2,500/mo", features:["Sandbox API","5,000 API req/mo","Documentation","Webhook testing"] },
  { key:"creator_free", name:"Creator Free", price:"Free", features:["Referral code","Campaign assets","Public prediction links","Creator analytics"] },
];

export default function PartnerOnboardingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">BallMtaani Edge Partner Network</div>
        <h1 className="text-3xl font-extrabold mb-2">Partner Onboarding</h1>
        <p className="text-gray-400 text-sm max-w-xl">Join the BallMtaani Edge partner network. Access football match intelligence for publishers, developers and creators.</p>
      </div>

      {/* Progress checklist */}
      <div className="bg-[#141414] border border-white/8 rounded-xl p-6 mb-8">
        <div className="text-sm font-bold mb-4">Onboarding Progress</div>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.done ? "bg-emerald-500 text-white" : "bg-white/10 text-gray-500"}`}>
                {s.done ? "✓" : i + 1}
              </div>
              <div className={`text-sm ${s.done ? "text-white" : "text-gray-500"}`}>{s.label}</div>
              {!s.done && i === steps.findIndex(s => !s.done) && (
                <button id={`onboard-step-${s.id}`} className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg font-bold hover:bg-emerald-500/30 transition-colors">
                  Start →
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 bg-white/5 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full" style={{width:`${(steps.filter(s=>s.done).length/steps.length)*100}%`}} />
        </div>
        <div className="text-xs text-gray-500 mt-1">{steps.filter(s=>s.done).length}/{steps.length} steps complete</div>
      </div>

      {/* Plan selection */}
      <div className="text-sm font-bold mb-4">Choose Your Plan</div>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {plans.map((p) => (
          <div key={p.key} className="bg-[#141414] border border-white/8 rounded-xl p-5 hover:border-emerald-500/40 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="font-bold text-white">{p.name}</div>
              <div className="text-emerald-400 font-bold text-sm">{p.price}</div>
            </div>
            <ul className="space-y-1">
              {p.features.map((f) => <li key={f} className="text-xs text-gray-400 flex items-center gap-2"><span className="text-emerald-500">✓</span>{f}</li>)}
            </ul>
            <button id={`select-plan-${p.key}`} className="mt-4 w-full text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg font-bold transition-colors">
              Select {p.name}
            </button>
          </div>
        ))}
      </div>

      {/* Responsible use notice */}
      <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-300">
        <div className="font-bold mb-1">Responsible Use</div>
        BallMtaani Edge provides statistical match intelligence — not guaranteed outcomes, tipster services or betting advice.
        All widgets and API integrations must display model attribution and the responsible-use disclaimer.
        Partners found removing attribution or making prohibited claims will have access revoked.
      </div>
    </div>
  );
}
