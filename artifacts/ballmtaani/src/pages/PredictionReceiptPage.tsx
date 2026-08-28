import { Link, useRoute } from "wouter";
import SEO from "../components/SEO";

/**
 * Public receipts stay fail-closed until the server-backed publication ledger
 * is available. An unknown code must never be turned into a plausible fixture.
 */
export default function PredictionReceiptPage() {
  const [, params] = useRoute("/receipt/:id");
  const code = (params?.id || "").toUpperCase();

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-16 text-white">
      <SEO
        title="Prediction receipt unavailable | BallMtaani"
        description="This prediction receipt could not be verified in BallMtaani's published receipt ledger."
        canonicalUrl={`/receipt/${code}`}
        noindex
      />
      <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#111319] p-8 text-center shadow-2xl">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">Receipt check</div>
        <h1 className="mt-3 text-2xl font-black uppercase">Receipt not verified</h1>
        <p className="mt-4 text-sm leading-6 text-white/55">
          {code ? `No published server record matches ${code}.` : "No receipt code was supplied."} BallMtaani will not create a placeholder score, fan identity or timestamp.
        </p>
        <Link href="/predictions" className="mt-6 inline-flex rounded-lg bg-[#B30000] px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-[#d71920]">
          Open my predictions
        </Link>
      </section>
    </main>
  );
}
