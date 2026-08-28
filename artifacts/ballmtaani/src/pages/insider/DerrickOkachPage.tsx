import { Link } from "wouter";
import { ShieldAlert } from "lucide-react";
import SEO from "../../components/SEO";

export default function DerrickOkachPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-16 text-white">
      <SEO
        title="Contributor profile under verification | BallMtaani"
        description="This local football contributor profile is not currently published because its identity and source material are still being verified."
        path="/insider/derrick-okach"
        noindex
      />
      <section className="mx-auto max-w-2xl rounded-2xl border border-amber-400/20 bg-[#121212] p-8 text-center shadow-2xl sm:p-10">
        <ShieldAlert className="mx-auto h-9 w-9 text-amber-300" />
        <div className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Editorial verification</div>
        <h1 className="mt-3 text-2xl font-black uppercase sm:text-3xl">Profile not currently published</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55">
          BallMtaani previously displayed biographical claims and first-person material here without a complete publication record. That content has been withdrawn. A contributor page will return only after identity, club affiliation, consent and original source material are verified by the editorial desk.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/talanta" className="rounded-lg bg-[#B30000] px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-[#d71920]">
            Open Talanta Mtaani
          </Link>
          <Link href="/kenya-football" className="rounded-lg border border-white/12 px-5 py-3 text-xs font-black uppercase tracking-wider text-white/75 hover:border-white/25 hover:text-white">
            Kenya football data
          </Link>
        </div>
      </section>
    </main>
  );
}
