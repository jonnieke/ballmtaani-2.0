import React from "react";

const helpSections = [
  { id:"getting-started", title:"Getting Started", articles:["What is the BallMtaani Partner Network?","How do I create a partner account?","What partner types are available?","How long does approval take?"] },
  { id:"organisation", title:"Organisation Setup", articles:["Creating your organisation profile","Adding team members","Managing roles and permissions","Updating business information"] },
  { id:"domain", title:"Domain Verification", articles:["How to verify your domain","Adding a DNS TXT record","Troubleshooting domain verification","How many domains can I add?"] },
  { id:"api", title:"API & Keys", articles:["Creating an API client","Generating and rotating API keys","Understanding API scopes","Rate limits and quotas","Sandbox vs live environments"] },
  { id:"widgets", title:"Widgets", articles:["Creating your first widget","Available widget types","Customising widget themes","Attribution requirements (mandatory)","Widget usage limits"] },
  { id:"billing", title:"Billing & Invoices", articles:["How billing works","Understanding usage-based charges","Viewing your invoices","Disputing a charge","Upgrading your plan"] },
  { id:"responsible-use", title:"Responsible Use", articles:["What BallMtaani intelligence is — and isn't","Prohibited claims and copy","Attribution requirements","Reporting a partner policy violation"] },
];

export default function PartnerHelpCentrePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Partner Support</div>
        <h1 className="text-3xl font-extrabold mb-2">Partner Help Centre</h1>
        <p className="text-gray-400 text-sm">Everything you need to integrate BallMtaani Edge into your product.</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <input id="partner-help-search" type="text" placeholder="Search help articles…" className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">⌘K</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {helpSections.map((s) => (
          <div key={s.id} className="bg-[#141414] border border-white/8 rounded-xl p-5">
            <div className="font-bold text-white mb-3">{s.title}</div>
            <ul className="space-y-2">
              {s.articles.map((a) => (
                <li key={a}>
                  <a href={`/partners/help/${s.id}/${a.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`}
                     id={`help-${s.id}-${a.slice(0,20).toLowerCase().replace(/\s+/g,"-")}`}
                     className="text-xs text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <span className="text-gray-700">›</span>{a}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#141414] border border-white/8 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="font-bold text-white mb-1">Still need help?</div>
          <div className="text-xs text-gray-400">Our partner support team is available Monday–Friday, 08:00–18:00 EAT.</div>
        </div>
        <a href="mailto:partners@ballmtaani.com" id="partner-contact-support" className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-emerald-500/30 transition-colors whitespace-nowrap">
          Contact Support
        </a>
      </div>
    </div>
  );
}
