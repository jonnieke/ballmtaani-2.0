import React from "react";

const mockPortfolio = [
  { type:"competition", name:"English Premier League", status:"invest", contribution:"+KES 380k", growth:"+18%", strategic:90, risk:15, recommendation:"invest" },
  { type:"competition", name:"Kenya Premier League", status:"grow", contribution:"+KES 120k", growth:"+34%", strategic:95, risk:20, recommendation:"grow" },
  { type:"competition", name:"Kenyan Cup", status:"strategic", contribution:"-KES 12k", growth:"+5%", strategic:80, risk:25, recommendation:"maintain" },
  { type:"product", name:"Match-Day Pass", status:"grow", contribution:"+KES 210k", growth:"+22%", strategic:70, risk:10, recommendation:"grow" },
  { type:"product", name:"Edge Pro", status:"invest", contribution:"+KES 540k", growth:"+41%", strategic:85, risk:12, recommendation:"invest" },
  { type:"channel", name:"Creator Partnerships", status:"maintain", contribution:"+KES 90k", growth:"+8%", strategic:65, risk:18, recommendation:"maintain" },
  { type:"channel", name:"Paid Social", status:"optimize", contribution:"+KES 45k", growth:"-2%", strategic:40, risk:30, recommendation:"optimize" },
];

const STATUS_COLORS: Record<string, string> = {
  invest:"bg-emerald-500/20 text-emerald-400", grow:"bg-green-500/20 text-green-400",
  maintain:"bg-blue-500/20 text-blue-400", optimize:"bg-amber-500/20 text-amber-400",
  harvest:"bg-orange-500/20 text-orange-400", pause:"bg-gray-500/20 text-gray-400",
  retire:"bg-red-500/20 text-red-400", strategic:"bg-purple-500/20 text-purple-400",
};

export default function PortfolioOptimizationPage() {
  const types = [...new Set(mockPortfolio.map(i => i.type))];
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Portfolio</div>
        <h1 className="text-2xl font-extrabold mb-1">Portfolio Optimization</h1>
        <p className="text-gray-400 text-sm">Competition, product, channel and partner portfolio with contribution-based recommendations. Monthly reviews for active items.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[["Invest","2"],["Grow","3"],["Optimize/Maintain","2"],["Retire/Pause","0"]].map(([l,v]) => (
          <div key={l as string} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{l}</div>
            <div className="text-2xl font-extrabold">{v}</div>
          </div>
        ))}
      </div>

      {types.map(type => (
        <div key={type} className="mb-6">
          <div className="text-sm font-bold mb-3 text-gray-300 capitalize">{type} Portfolio</div>
          <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-gray-400">
              <thead><tr className="border-b border-white/8 text-left"><th className="p-3">Name</th><th className="p-3">Contribution</th><th className="p-3">Growth</th><th className="p-3">Strategic</th><th className="p-3">Status</th><th className="p-3">Recommendation</th></tr></thead>
              <tbody>
                {mockPortfolio.filter(i => i.type === type).map((item) => (
                  <tr key={item.name} className="border-b border-white/5">
                    <td className="p-3 text-white font-bold">{item.name}</td>
                    <td className="p-3 font-mono">{item.contribution}</td>
                    <td className="p-3">{item.growth}</td>
                    <td className="p-3">{item.strategic}/100</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[item.status]}`}>{item.status}</span></td>
                    <td className="p-3"><span className={`font-bold ${STATUS_COLORS[item.recommendation]?.replace("bg-","text-").replace("/20","")}`}>↑ {item.recommendation}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
