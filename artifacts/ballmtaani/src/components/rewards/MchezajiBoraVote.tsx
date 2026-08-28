import { Link } from "wouter";
import { ShieldCheck, Trophy } from "lucide-react";

export default function MchezajiBoraVote() {
  return (
    <section className="space-y-5 rounded-2xl border border-[#FFD700]/25 bg-[#121212] p-6 shadow-xl" aria-labelledby="mchezaji-bora-title">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/15 text-[#FFD700]">
          <Trophy className="h-4 w-4" />
        </div>
        <div>
          <h3 id="mchezaji-bora-title" className="text-sm font-black uppercase tracking-wider text-white">Mchezaji Bora vote</h3>
          <p className="text-[11px] text-white/40">Verified match candidates only</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/3 p-5 text-center">
        <ShieldCheck className="mx-auto h-7 w-7 text-[#FFD700]/70" />
        <p className="mt-3 text-sm font-black text-white">No verified vote is open</p>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-white/45">
          BallMtaani will open voting only after a reviewed match record provides the fixture and candidate list, and a server ledger is ready to count each fan once. Placeholder players, vote totals and MTC awards are not shown.
        </p>
        <Link href="/kenya-football" className="mt-4 inline-flex rounded-lg border border-[#FFD700]/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:bg-[#FFD700]/10">
          View verified local records
        </Link>
      </div>
    </section>
  );
}
