import { Link } from "wouter";
import { ArrowLeft, BarChart2, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import RouteSEO from "../../components/RouteSEO";

export default function EdgePerformancePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] pb-20 text-white">
      <RouteSEO path="/edge/performance" />
      <header className="border-b border-white/10 bg-black/60 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/edge"><Button variant="ghost" size="sm" className="text-gray-400 hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Edge Overview</Button></Link>
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#FFD000]"><ShieldCheck className="h-4 w-4" /> Audited records only</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ef3038]">Model accountability</p>
        <h1 className="mt-2 text-3xl font-black">Public Prediction Performance Ledger</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">This page publishes only predictions that were timestamped before kickoff and later settled against a verified final result. Aggregate accuracy, Brier score and calibration metrics remain hidden until the production ledger contains enough audited records.</p>
        <section className="mt-8 border border-white/10 bg-[#111] px-5 py-12 text-center" aria-labelledby="ledger-pending-title">
          <BarChart2 className="mx-auto h-8 w-8 text-[#FFD000]" />
          <h2 id="ledger-pending-title" className="mt-4 text-lg font-black">No settled production ledger is published yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/45">Previous sample scores and fabricated match records have been removed. This area will activate after real predictions are locked, matches finish, results are verified, and settlement records pass integrity checks.</p>
          <Link href="/edge" className="mt-5 inline-flex text-sm font-black text-[#ef3038]">View currently published predictions</Link>
        </section>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["No retroactive edits after kickoff", "All eligible predictions included", "Metrics calculated from settled records"].map((item) => <div key={item} className="border border-white/10 bg-white/[0.02] p-4 text-xs font-bold text-white/65"><ShieldCheck className="mb-2 h-4 w-4 text-[#FFD000]" />{item}</div>)}
        </div>
      </div>
    </main>
  );
}
