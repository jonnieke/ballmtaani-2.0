import React from "react";

const STATS = [
  { label:"Active Sellers",       value:"2",          sub:"fully verified" },
  { label:"Products Listed",      value:"3",          sub:"all moderated" },
  { label:"Gross Merch Value",    value:"KES 84,600", sub:"July 2026" },
  { label:"Platform Commission",  value:"KES 12,690", sub:"15% of GMV" },
  { label:"Seller Earnings",      value:"KES 68,000", sub:"net payable" },
  { label:"Refund Rate",          value:"1.2%",       sub:"below 5% threshold" },
];

const mockOrders = [
  { id:"mo-001", buyer:"anon-user-001", product:"EPL Matchday 38 Tactical Preview", seller:"StatEdge Analysts", totalMinor:150_00, currency:"KES", status:"fulfilled",  commissionMinor:22_50, sellerNetMinor:121_75, earnStatus:"available" },
  { id:"mo-002", buyer:"anon-user-002", product:"KPL Season Report 2025/26",        seller:"StatEdge Analysts", totalMinor:250_00, currency:"KES", status:"refunded",   commissionMinor:0,     sellerNetMinor:0,      earnStatus:"reversed" },
  { id:"mo-003", buyer:"anon-user-003", product:"African Football Data Bundle",     seller:"DataSportsKE",      totalMinor:1200_00,currency:"KES", status:"fulfilled",  commissionMinor:180_00,sellerNetMinor:975_00, earnStatus:"pending" },
];

const STATUS_COLORS: Record<string, string> = {
  fulfilled:"bg-green-500/20 text-green-400", pending:"bg-amber-500/20 text-amber-400",
  refunded:"bg-gray-500/20 text-gray-400", disputed:"bg-red-500/20 text-red-400",
};
const EARN_COLORS: Record<string, string> = {
  pending:"text-amber-400", available:"text-blue-400",
  payable:"text-emerald-400", paid:"text-green-400",
  reversed:"text-gray-400", held:"text-red-400",
};

const fmt = (minor: number, currency: string) =>
  new Intl.NumberFormat("en-KE", { style:"currency", currency, minimumFractionDigits:2 }).format(minor / 100);

export default function MarketplaceAdminPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Phase 14 · Marketplace</div>
        <h1 className="text-2xl font-extrabold mb-1">Marketplace Operations</h1>
        <p className="text-gray-400 text-sm">GMV is separate from BallMtaani platform revenue. Only commission is platform revenue.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{s.label}</div>
            <div className="text-xl font-extrabold text-white">{s.value}</div>
            <div className="text-xs text-gray-600">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/8 text-sm font-bold">Recent Orders</div>
        <table className="w-full text-xs text-gray-400">
          <thead><tr className="border-b border-white/8 text-left">
            <th className="p-3">Product</th><th className="p-3">Seller</th>
            <th className="p-3">Total</th><th className="p-3">Commission</th>
            <th className="p-3">Seller Net</th><th className="p-3">Status</th><th className="p-3">Earnings</th>
          </tr></thead>
          <tbody>
            {mockOrders.map(o => (
              <tr key={o.id} className="border-b border-white/5">
                <td className="p-3 text-white max-w-[160px] truncate">{o.product}</td>
                <td className="p-3">{o.seller}</td>
                <td className="p-3 font-mono">{fmt(o.totalMinor, o.currency)}</td>
                <td className="p-3 font-mono">{fmt(o.commissionMinor, o.currency)}</td>
                <td className="p-3 font-mono">{fmt(o.sellerNetMinor, o.currency)}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[o.status] ?? ""}`}>{o.status}</span></td>
                <td className={`p-3 font-bold ${EARN_COLORS[o.earnStatus] ?? ""}`}>{o.earnStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-white/5 text-xs text-gray-600">
          Seller earnings remain 'pending' until refund window passes (default: 7 days). Payout cannot proceed until earnings are 'payable'.
        </div>
      </div>
    </div>
  );
}
