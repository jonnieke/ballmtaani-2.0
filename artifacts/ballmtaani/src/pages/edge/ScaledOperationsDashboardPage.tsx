import React from "react";

const sections = [
  { id: "scale-programmes", title: "Scale Programmes", href: "/admin/edge/scale-programmes", desc: "Manage controlled scaling stages from pilot to mature operation" },
  { id: "partner-applications", title: "Partner Applications", href: "/admin/edge/partner-applications", desc: "Review self-service partner applications, verification and risk scoring" },
  { id: "self-service-partners", title: "Self-Service Partners", href: "/admin/edge/self-service-partners", desc: "Monitor active partner accounts, API clients and widgets" },
  { id: "b2b-billing", title: "B2B Billing", href: "/admin/edge/b2b-billing", desc: "Subscription management, usage ledger, invoices and disputes" },
  { id: "usage-ledger", title: "Usage Ledger", href: "/admin/edge/usage-ledger", desc: "Immutable billable usage events and period aggregations" },
  { id: "customer-success", title: "Customer Success", href: "/admin/edge/customer-success", desc: "Health scores, lifecycle stages, success plans and renewal forecasts" },
  { id: "sales", title: "Sales Operations", href: "/admin/edge/sales", desc: "Pipeline stages, activities and revenue forecasting" },
  { id: "regional-markets", title: "Regional Markets", href: "/admin/edge/regional-markets", desc: "Market lifecycle, readiness assessments and configurations" },
  { id: "payment-providers", title: "Payment Providers", href: "/admin/edge/payment-providers", desc: "Regional provider registry, routing and reconciliation" },
  { id: "portfolio", title: "Portfolio Optimization", href: "/admin/edge/portfolio", desc: "Competition, product, channel and partner portfolio decisions" },
  { id: "revenue-retention", title: "Revenue Retention", href: "/admin/edge/revenue-retention", desc: "GRR, NRR, consumer renewal and repeat purchase tracking" },
  { id: "capital-allocation", title: "Capital Allocation", href: "/admin/edge/capital-allocation", desc: "Investment proposals, payback scoring and capital decisions" },
  { id: "capacity", title: "Capacity Planning", href: "/admin/edge/capacity", desc: "Team utilisation, backlog risk and hiring trigger evaluation" },
];

export default function ScaledOperationsDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 py-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
          Phase 13 — Scaled Operations
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Scaled Growth Control Centre</h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          BallMtaani Edge scaled operations hub. All scaling is evidence-based.
          No automatic stage progression. Each section requires explicit authorisation before advancing.
        </p>
      </div>

      {/* Safety banner */}
      <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-start gap-3">
        <span className="text-amber-400 text-lg mt-0.5">⚠</span>
        <div>
          <div className="text-amber-300 font-bold text-sm mb-1">Scale-Readiness Principle Active</div>
          <div className="text-amber-200/70 text-xs">
            A segment may only scale when: the product works reliably, payments are dependable, the model is accepted for the competition,
            acquisition can be measured, retention is acceptable and compliance requirements are reviewed.
            Scaling must remain reversible at every stage.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <a
            key={s.id}
            href={s.href}
            id={`scaled-ops-nav-${s.id}`}
            className="block bg-[#141414] border border-white/8 rounded-xl p-5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
          >
            <div className="font-bold text-white text-sm mb-1 group-hover:text-emerald-300 transition-colors">{s.title}</div>
            <div className="text-gray-500 text-xs leading-relaxed">{s.desc}</div>
          </a>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Scale Programmes", value: "0", note: "Requires approval" },
          { label: "Partner Applications", value: "0", note: "Awaiting review" },
          { label: "B2B Subscriptions", value: "0", note: "Trialing + active" },
          { label: "Regional Markets", value: "1", note: "KE (pilot)" },
        ].map((m) => (
          <div key={m.label} className="bg-[#141414] border border-white/8 rounded-xl p-4">
            <div className="text-gray-500 text-xs mb-1">{m.label}</div>
            <div className="text-2xl font-extrabold text-white">{m.value}</div>
            <div className="text-xs text-gray-600 mt-1">{m.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
