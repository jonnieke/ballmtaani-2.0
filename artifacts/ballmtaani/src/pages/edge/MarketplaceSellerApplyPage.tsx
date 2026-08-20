/**
 * BallMtaani Edge Phase 14 — Marketplace Seller Application Page
 * Public application portal for content creators, publishers, and data providers.
 * Performs real-time risk scoring and prohibited phrase checking before submission.
 */

import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, ShieldAlert, Sparkles, UserCheck, AlertTriangle } from "lucide-react";
import { MarketplaceSellerService } from "../../lib/edge/marketplace/marketplace-seller-service";

export default function MarketplaceSellerApplyPage() {
  const [sellerType, setSellerType] = useState<"creator" | "publisher" | "data_provider">("creator");
  const [displayName, setDisplayName] = useState("");
  const [biography, setBiography] = useState("");
  const [intendedProducts, setIntendedProducts] = useState("");
  const [experience, setExperience] = useState("");
  const [website, setWebsite] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const score = MarketplaceSellerService.scoreApplication({
      userId: `USR-${Date.now()}`,
      sellerType,
      displayName: displayName || "Anonymous Analyst",
      biography,
      intendedProducts: intendedProducts.split(",").map((s) => s.trim()).filter(Boolean),
      experience,
      website: website || undefined,
    });

    setScoreResult(score);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Seller Onboarding</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Apply to Become a Verified Seller</h1>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Publish match tactical previews, competition reports, and statistical datasets to thousands of African sports fans.
          All applications undergo automated risk scoring and verification.
        </p>

        {/* Prohibited policy banner */}
        <div className="bg-[#120e0a] border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-amber-200/80">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-400 font-bold block mb-0.5">Strict Compliance Policy</strong>
            BallMtaani strictly prohibits products promising "guaranteed wins", "fixed matches", or automated betting scripts. Applications featuring these terms trigger automated auto-rejection (risk score = 100).
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="bg-[#111319] border border-white/8 rounded-2xl p-6 space-y-5">
            
            {/* Seller Type */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-2">
                Seller Classification
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "creator", label: "Independent Analyst", desc: "Individual sports writer or analyst" },
                  { key: "publisher", label: "Media Publisher", desc: "Digital sports newsroom or magazine" },
                  { key: "data_provider", label: "Data Provider", desc: "Stats company or data vendor" },
                ].map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setSellerType(type.key as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      sellerType === type.key
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-white/8 bg-white/3 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <div className="font-extrabold text-xs mb-0.5">{type.label}</div>
                    <div className="text-[10px] opacity-70 leading-tight">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Brand or Analyst Display Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. StatEdge Analysts Kenya"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#07080b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Biography */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Biography &amp; Analytical Focus *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe your background, data sources, and regional sports coverage..."
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                className="w-full bg-[#07080b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Intended Products */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Intended Products to List (comma separated) *</label>
              <input
                type="text"
                required
                placeholder="e.g. KPL Match Previews, Tactical Analysis, Historical CSV Data"
                value={intendedProducts}
                onChange={(e) => setIntendedProducts(e.target.value)}
                className="w-full bg-[#07080b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Relevant Experience &amp; Track Record</label>
              <input
                type="text"
                placeholder="e.g. 4 years sports analytics contributor at regional publication"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#07080b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Website or Portfolio URL</label>
              <input
                type="url"
                placeholder="https://yourbrand.co.ke"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-[#07080b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.25)]"
            >
              Submit Application &amp; Run Risk Audit
            </button>
          </form>
        ) : (
          <div className="bg-[#111319] border border-white/10 rounded-2xl p-6 text-center space-y-4">
            {scoreResult.outcome === "auto_approve" ? (
              <>
                <UserCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-extrabold text-emerald-400">Application Approved!</h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  Your risk score is <strong>{scoreResult.total}/100</strong>. You are qualified for automated seller status.
                </p>
              </>
            ) : scoreResult.outcome === "manual_review" ? (
              <>
                <CheckCircle className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="text-xl font-extrabold text-amber-400">Under Review</h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  Your risk score is <strong>{scoreResult.total}/100</strong>. Our team will verify your payout vault details within 24 hours.
                </p>
              </>
            ) : (
              <>
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-xl font-extrabold text-red-500">Application Rejected</h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  Prohibited terms detected in application. High risk score <strong>{scoreResult.total}/100</strong>.
                </p>
              </>
            )}

            <div className="bg-[#07080b] border border-white/6 rounded-xl p-3 text-left text-xs space-y-1 font-mono text-gray-400">
              <div>Seller Classification: <span className="text-white">{sellerType}</span></div>
              <div>Risk Score: <span className="text-white">{scoreResult.total} / 100</span></div>
              <div>Audit Outcome: <span className="text-emerald-400 font-bold uppercase">{scoreResult.outcome}</span></div>
            </div>

            <Link href="/marketplace" className="inline-block bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition-colors">
              Return to Marketplace
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
