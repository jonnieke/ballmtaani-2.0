import React from "react";

const sports = [
  { key:"football",   name:"Football",   status:"supported",     flag:"🟢", score:100, decision:"activate"           },
  { key:"basketball", name:"Basketball", status:"data_review",   flag:"🔵", score:58,  decision:"approve_research"   },
  { key:"cricket",    name:"Cricket",    status:"research",      flag:"🔵", score:55,  decision:"approve_research"   },
  { key:"rugby",      name:"Rugby",      status:"research",      flag:"🔵", score:52,  decision:"approve_research"   },
  { key:"tennis",     name:"Tennis",     status:"identified",    flag:"⚪", score:48,  decision:"defer"              },
  { key:"athletics",  name:"Athletics",  status:"identified",    flag:"⚪", score:44,  decision:"defer"              },
];

const STATUS_COLORS: Record<string, string> = {
  supported:"bg-green-500/20 text-green-400", data_review:"bg-blue-500/20 text-blue-400",
  research:"bg-purple-500/20 text-purple-400", identified:"bg-gray-500/20 text-gray-400",
  paused:"bg-amber-500/20 text-amber-400", rejected:"bg-red-500/20 text-red-400",
};

export default function SportsHubPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Sports Hub</div>
        <h1 className="text-3xl font-extrabold mb-1">Sports Intelligence</h1>
        <p className="text-gray-400 text-sm mb-8">
          Each sport requires independently validated data, models, backtesting and calibration before public release.
          Football-specific models are <strong className="text-white">never</strong> reused without sport-specific validation.
        </p>

        {/* Supported sport hero */}
        <a href="/edge" id="sports-hub-football" className="block bg-gradient-to-br from-emerald-900/40 to-[#141414] border border-emerald-500/20 rounded-2xl p-6 mb-4 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">⚽</span>
                <span className="text-xl font-extrabold">Football</span>
                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <p className="text-sm text-gray-400">Kenya Premier League · Regional competitions · Dixon-Coles + Elo + Ensemble models</p>
            </div>
            <span className="text-emerald-400 text-lg">→</span>
          </div>
        </a>

        {/* Research-stage sports */}
        <div className="grid md:grid-cols-2 gap-3 mb-8">
          {sports.filter(s => s.key !== "football").map((s) => (
            <div key={s.key} className={`bg-[#141414] border border-white/8 rounded-xl p-4 ${s.status === "data_review" ? "opacity-90" : "opacity-60"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{s.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-gray-500/20 text-gray-400"}`}>
                    {s.status.replace("_"," ")}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Readiness: {s.score}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                <div className="bg-blue-500/60 h-1.5 rounded-full" style={{ width:`${s.score}%` }} />
              </div>
              <p className="text-xs text-gray-500">
                {s.decision === "approve_research"
                  ? "Research phase approved. Data import and modelling in progress."
                  : "Evaluation pending. Minimum data and modelling thresholds not yet met."}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-300">
          <div className="font-bold mb-1">Cross-Sport Expansion Principle</div>
          A sport is added to BallMtaani only when: reliable historical data exists, outcomes can be modelled responsibly,
          the model beats a simple baseline, calibration is acceptable, and commercial economics are credible.
          No sport launches from research to public without completing all 15 onboarding stages.
        </div>
      </div>
    </div>
  );
}
