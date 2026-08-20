import React from "react";

const PROVIDER_STATUS_COLORS: Record<string, string> = {
  active:"bg-green-500/20 text-green-400", sandbox:"bg-blue-500/20 text-blue-400",
  research:"bg-gray-500/20 text-gray-400", degraded:"bg-red-500/20 text-red-400",
  approved:"bg-emerald-500/20 text-emerald-400",
};

const mockProviders = [
  { id:"pp-001", market:"KE", provider:"mpesa_ke",       status:"active",   currencies:["KES"], health:"healthy",  priority:1 },
  { id:"pp-002", market:"TZ", provider:"airtel_money",   status:"sandbox",  currencies:["TZS"], health:"unknown",  priority:1 },
  { id:"pp-003", market:"UG", provider:"mtn_momo",       status:"research", currencies:["UGX"], health:"unknown",  priority:1 },
  { id:"pp-004", market:"KE", provider:"stripe",         status:"research", currencies:["USD","KES"], health:"unknown", priority:5 },
];

const HEALTH_COLORS: Record<string, string> = { healthy:"text-green-400", degraded:"text-red-400", unknown:"text-gray-500", down:"text-red-500" };

export default function PaymentProvidersPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 13 · Payment Providers</div>
        <h1 className="text-2xl font-extrabold mb-1">Regional Payment Providers</h1>
        <p className="text-gray-400 text-sm">Provider registry, routing configuration and health monitoring. Fallback is user-aware — never silent re-charge.</p>
      </div>
      <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-xs text-gray-400">
          <thead><tr className="border-b border-white/8 text-left"><th className="p-3">Market</th><th className="p-3">Provider</th><th className="p-3">Status</th><th className="p-3">Currencies</th><th className="p-3">Health</th><th className="p-3">Priority</th></tr></thead>
          <tbody>
            {mockProviders.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="p-3 text-white font-bold">{p.market}</td>
                <td className="p-3 font-mono text-white">{p.provider}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full font-bold ${PROVIDER_STATUS_COLORS[p.status]}`}>{p.status}</span></td>
                <td className="p-3">{p.currencies.join(", ")}</td>
                <td className={`p-3 font-bold ${HEALTH_COLORS[p.health]}`}>{p.health}</td>
                <td className="p-3">{p.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-300">
        <div className="font-bold mb-1">Routing Policy</div>
        Payment routing considers: country, currency, network, plan, amount, provider health, fees and user choice.
        Do not route based solely on lowest fee if provider reliability is weak. User-aware fallback must explain the alternative before redirecting.
      </div>
    </div>
  );
}
