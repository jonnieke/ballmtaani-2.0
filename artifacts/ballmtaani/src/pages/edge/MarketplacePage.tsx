import React from "react";

const mockProducts = [
  { id:"mp-001", title:"EPL Matchday 38 Tactical Preview", seller:"StatEdge Analysts", sellerVerified:true, sport:"Football", type:"Match Preview", price:"KES 150", billing:"one_time", rating:4.6, sales:32, delivery:"article" },
  { id:"mp-002", title:"KPL Season Report 2025/26",        seller:"StatEdge Analysts", sellerVerified:true, sport:"Football", type:"Competition Report", price:"KES 250", billing:"one_time", rating:4.8, sales:18, delivery:"pdf_report" },
  { id:"mp-003", title:"African Football Data Bundle",     seller:"DataSportsKE",      sellerVerified:true, sport:"Football", type:"Historical Dataset", price:"KES 1,200", billing:"one_time", rating:4.4, sales:7,  delivery:"data_export" },
];

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2">Marketplace</div>
        <h1 className="text-3xl font-extrabold mb-1">Sports Intelligence Marketplace</h1>
        <p className="text-gray-400 text-sm mb-2">Analyst reports, statistical bundles and data products from verified creators.</p>
        <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-3 mb-6 text-xs text-amber-300">
          All products are moderated before listing. No guaranteed tips, fixed-match claims, betting systems or insider-information products are permitted.
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {mockProducts.map((p) => (
            <a key={p.id} href={`/marketplace/products/${p.id}`} id={`marketplace-product-${p.id}`}
               className="block bg-[#141414] border border-white/8 rounded-xl p-5 hover:border-emerald-500/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-3">
                  <div className="font-bold text-white mb-1 leading-snug">{p.title}</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="text-emerald-400 font-bold">{p.seller}</span>
                    {p.sellerVerified && <span className="text-blue-400" title="Verified seller">✓</span>}
                    <span>·</span><span>{p.sport}</span><span>·</span><span>{p.type}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-emerald-400 text-sm">{p.price}</div>
                  <div className="text-xs text-gray-600">{p.billing.replace("_"," ")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
                <span>★ {p.rating}</span>
                <span>{p.sales} sales</span>
                <span className="bg-white/5 px-1.5 py-0.5 rounded">{p.delivery.replace("_"," ")}</span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a href="/marketplace/sellers/apply" id="marketplace-become-seller"
            className="inline-block bg-emerald-500/20 text-emerald-400 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-500/30 transition-colors">
            Become a Seller →
          </a>
        </div>
      </div>
    </div>
  );
}
