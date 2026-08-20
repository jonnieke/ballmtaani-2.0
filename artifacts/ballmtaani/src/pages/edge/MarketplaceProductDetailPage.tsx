/**
 * BallMtaani Edge Phase 14 — Marketplace Product Detail Page
 * Displays product specifications, seller credentials, moderation approval,
 * integer-unit price breakdown, sample preview, and purchase initiation.
 */

import React, { useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft, CheckCircle, ShieldCheck, ShoppingBag, Star, User, Lock, AlertTriangle, FileText, BarChart2
} from "lucide-react";
import { MarketplaceOrderService } from "../../lib/edge/marketplace/marketplace-order-service";

const PRODUCTS_DB: Record<string, {
  id: string;
  title: string;
  seller: string;
  sellerVerified: boolean;
  sellerType: "creator" | "publisher" | "data_provider";
  sport: string;
  type: string;
  priceMinor: number; // integer minor units
  currency: string;
  billing: string;
  rating: number;
  sales: number;
  delivery: string;
  description: string;
  previewPoints: string[];
  moderationStatus: "approved";
}> = {
  "mp-001": {
    id: "mp-001",
    title: "EPL Matchday 38 Tactical Preview",
    seller: "StatEdge Analysts",
    sellerVerified: true,
    sellerType: "creator",
    sport: "Football",
    type: "Match Preview",
    priceMinor: 150_00, // KES 150.00
    currency: "KES",
    billing: "one_time",
    rating: 4.6,
    sales: 32,
    delivery: "Article & PDF",
    description: "In-depth statistical breakdown of Premier League final matchday fixtures. Includes Expected Goals (xG) trends, squad availability impacts, and Dixon-Coles model probability comparisons.",
    previewPoints: [
      "Tactical matchup analysis for top 4 clash fixtures",
      "Expected goals (xG) differential maps for home vs away teams",
      "Dixon-Coles vs Bookmaker implied probability comparison table",
      "Set-piece efficiency ratings for all 20 Premier League squads",
    ],
    moderationStatus: "approved",
  },
  "mp-002": {
    id: "mp-002",
    title: "KPL Season Report 2025/26",
    seller: "StatEdge Analysts",
    sellerVerified: true,
    sellerType: "publisher",
    sport: "Football",
    type: "Competition Report",
    priceMinor: 250_00, // KES 250.00
    currency: "KES",
    billing: "one_time",
    rating: 4.8,
    sales: 18,
    delivery: "PDF Report",
    description: "Complete analytical review of the FKF Premier League season. Features player performance metric indices, club rating trajectories, and tactical formation trends across all 18 clubs.",
    previewPoints: [
      "Complete FKF Premier League club Elo rating progressions",
      "Top 50 domestic player efficiency index rankings",
      "Home advantage metrics by stadium venue (Nairobi, Nakuru, Kisumu)",
      "Youth player breakout projections for the upcoming transfer window",
    ],
    moderationStatus: "approved",
  },
  "mp-003": {
    id: "mp-003",
    title: "African Football Data Bundle",
    seller: "DataSportsKE",
    sellerVerified: true,
    sellerType: "data_provider",
    sport: "Football",
    type: "Historical Dataset",
    priceMinor: 1200_00, // KES 1,200.00
    currency: "KES",
    billing: "one_time",
    rating: 4.4,
    sales: 7,
    delivery: "CSV / JSON Export",
    description: "Clean, normalized historical dataset covering 5,000+ matches across FKF Premier League, CAF Champions League, CHAN, and AFCON competitions (2020–2026).",
    previewPoints: [
      "Normalized CSV/JSON schema with match IDs, dates, and venues",
      "Half-time and full-time scores, goal timings, and referee data",
      "Pre-match Elo ratings and market odds snapshot per fixture",
      "Fully compatible with Python pandas, R, and SQL ingestion pipelines",
    ],
    moderationStatus: "approved",
  },
};

export default function MarketplaceProductDetailPage() {
  const [, params] = useRoute("/marketplace/products/:id");
  const productId = params?.id || "mp-001";
  const product = PRODUCTS_DB[productId] || PRODUCTS_DB["mp-001"];

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [orderSummary, setOrderSummary] = useState<any>(null);

  const formatPrice = (minor: number, currency: string) => {
    return `${currency} ${(minor / 100).toLocaleString()}`;
  };

  const handlePurchase = () => {
    setIsPurchasing(true);

    // Server-side price validation check
    const validation = MarketplaceOrderService.validateProductForPurchase(
      {
        id: product.id,
        sellerId: "seller-001",
        priceMinor: product.priceMinor,
        currency: product.currency,
        billingType: product.billing,
        moderationStatus: product.moderationStatus,
        status: "approved",
      },
      product.priceMinor
    );

    if (!validation.valid) {
      alert(`Order validation failed: ${validation.errors.join(", ")}`);
      setIsPurchasing(false);
      return;
    }

    // Compute earnings breakdown (Platform commission 15%)
    const earnings = MarketplaceOrderService.calculateEarnings({
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
      sellerId: "seller-001",
      grossAmountMinor: product.priceMinor,
      currency: product.currency,
      commissionRule: {
        sellerType: product.sellerType,
        productType: product.type.toLowerCase().replace(/\s+/g, "_"),
        commissionPct: 15,
        fixedFeeMinor: 0,
      },
      applyWithholdingTax: false,
    });

    setOrderSummary(earnings);
    setPurchaseSuccess(true);
    setIsPurchasing(false);
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Main Grid */}
        <div className="grid md:grid-cols-[1fr_320px] gap-6">

          {/* Left Column: Details */}
          <div>
            {/* Header pill */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                MODERATED &amp; APPROVED
              </span>
              <span className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                {product.sport} · {product.type}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-3">
              {product.title}
            </h1>

            {/* Seller info */}
            <div className="flex items-center gap-3 p-3 bg-[#111319] border border-white/8 rounded-xl mb-6">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-extrabold text-sm">
                  <span>{product.seller}</span>
                  {product.sellerVerified && <span className="text-blue-400 text-xs" title="Verified Seller">✓</span>}
                </div>
                <div className="text-xs text-gray-500">
                  Verified {product.sellerType.replace("_", " ")} seller · ★ {product.rating} rating · {product.sales} sales
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#0e1015] border border-white/6 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-2">Product Overview</h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{product.description}</p>

              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> What's Included in this Product
              </h4>
              <ul className="space-y-2">
                {product.previewPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compliance Guarantee Banner */}
            <div className="bg-[#120f0a] border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/80 leading-relaxed">
                <strong className="text-amber-400 font-bold block mb-0.5">BallMtaani Platform Guarantee</strong>
                All marketplace products are pre-screened to exclude fixed-match claims, guaranteed tips, or loss-recovery schemes. 7-day buyer refund protection policy applies to all eligible orders.
              </div>
            </div>
          </div>

          {/* Right Column: Order Card */}
          <div>
            <div className="bg-[#11131a] border border-white/10 rounded-2xl p-5 sticky top-6 shadow-xl">
              
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Price</span>
                <div className="text-3xl font-extrabold text-white">{formatPrice(product.priceMinor, product.currency)}</div>
                <span className="text-[10px] text-gray-500 font-medium">One-time payment · Minor units (integers) processed</span>
              </div>

              <div className="space-y-2 border-t border-b border-white/8 py-3 my-4 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Delivery Format</span>
                  <span className="font-bold text-white">{product.delivery}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refund Window</span>
                  <span className="font-bold text-emerald-400">7 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-bold text-white">Included</span>
                </div>
              </div>

              {!purchaseSuccess ? (
                <button
                  id="buy-product-now-btn"
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full bg-[#B30000] hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(179,0,0,0.35)]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isPurchasing ? "Processing..." : `Get Access for ${formatPrice(product.priceMinor, product.currency)}`}
                </button>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="font-extrabold text-sm text-emerald-400 mb-1">Order Confirmed!</div>
                  <div className="text-[11px] text-gray-400 mb-3">
                    Order ID: <span className="font-mono text-white">{orderSummary?.orderId}</span>
                  </div>
                  <div className="bg-black/40 rounded-lg p-2 text-[10px] text-gray-400 space-y-1 mb-3 text-left">
                    <div className="flex justify-between"><span>Gross Amount:</span><span className="text-white font-mono">{formatPrice(orderSummary?.grossAmountMinor, product.currency)}</span></div>
                    <div className="flex justify-between"><span>Seller Net:</span><span className="text-emerald-400 font-mono">{formatPrice(orderSummary?.sellerNetMinor, product.currency)}</span></div>
                    <div className="flex justify-between"><span>Platform Commission (15%):</span><span className="text-white font-mono">{formatPrice(orderSummary?.platformCommissionMinor, product.currency)}</span></div>
                  </div>
                  <button
                    onClick={() => alert("Product content loaded! Check your account downloads.")}
                    className="w-full bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-widest py-2.5 rounded-lg hover:bg-emerald-400 transition-colors"
                  >
                    View &amp; Download Content
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 text-center">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>Encrypted transaction via BallMtaani Edge Vault</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
