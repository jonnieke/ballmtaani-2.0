import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Trophy } from "lucide-react";
import SEO from "../components/SEO";
import { fetchLocalFootballDesk } from "../lib/local-football";

export default function KenyaFootballPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["kenya-football-desk"],
    queryFn: fetchLocalFootballDesk,
    staleTime: 5 * 60 * 1000,
  });
  const matches = data?.matches || [];
  const standings = data?.standings || [];

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6">
      <SEO
        title="Kenyan Football Data Desk | BallMtaani"
        description="Verified Kenyan football fixtures, results and standings from the BallMtaani local football desk."
        path="/kenya-football"
      />
      <div className="mx-auto max-w-[1180px]">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-[#ef3038]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        <div className="mt-5 border-b border-white/10 pb-5">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#ef3038]">Daily local desk</p>
          <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">Kenya Football Daily</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/55">Local fixtures, results and tables published from verified organizer records. No API-Football placeholders are shown here.</p>
        </div>
        {isLoading ? <p className="py-16 text-center text-sm text-white/50">Loading verified local football data...</p> : (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <section id="fixtures" className="border border-white/10 bg-[#101010]" aria-labelledby="kenya-fixtures-heading">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 id="kenya-fixtures-heading" className="flex items-center gap-2 text-sm font-black uppercase"><CalendarDays className="h-4 w-4 text-[#ef3038]" /> Fixtures & results</h2>
                <Link href="/news?section=kenya" className="text-[9px] font-black uppercase text-[#ef3038]">Kenya news</Link>
              </div>
              {matches.length ? <div className="divide-y divide-white/10 px-4">{matches.map((match) => <div key={match.id} className="grid grid-cols-[86px_1fr_auto] gap-3 py-3 text-xs"><span className="text-white/45">{match.status === "finished" ? "FT" : match.scheduledDate || "TBC"}<small className="block text-[10px]">{match.kickoffTime || ""}</small></span><span><b className="block">{match.homeTeam}</b><b className="block">{match.awayTeam}</b><small className="mt-1 block text-[10px] text-white/40">{match.competition}{match.venue ? ` · ${match.venue}` : ""}</small></span><b className="text-right">{match.status === "finished" && match.homeScore !== null && match.awayScore !== null ? <><span className="block">{match.homeScore}</span><span className="block">{match.awayScore}</span></> : <span className="text-[#ef3038]">FIXTURE</span>}</b></div>)}</div> : <EmptyState icon={<CalendarDays className="h-6 w-6" />} text="No verified Kenyan fixtures or results have been published yet." />}
            </section>
            <section id="standings" className="border border-white/10 bg-[#101010]" aria-labelledby="kenya-table-heading">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 id="kenya-table-heading" className="flex items-center gap-2 text-sm font-black uppercase"><Trophy className="h-4 w-4 text-[#FFD000]" /> Local standings</h2>
                <span className="text-[8px] font-black uppercase text-emerald-400">Verified desk</span>
              </div>
              {standings.length ? <div className="px-4 py-2"><div className="grid grid-cols-[28px_1fr_40px_45px] border-b border-white/10 py-2 text-[9px] uppercase text-white/35"><span>#</span><span>Team</span><span>P</span><span>Pts</span></div>{standings.map((row) => <div key={row.id} className="grid grid-cols-[28px_1fr_40px_45px] border-b border-white/[0.07] py-2 text-xs"><span className="text-white/45">{row.position}</span><b className="truncate">{row.team}</b><span>{row.played ?? "-"}</span><b>{row.points ?? "-"}</b></div>)}</div> : <EmptyState icon={<Trophy className="h-6 w-6" />} text="No verified local standings have been published yet." />}
            </section>
          </div>
        )}
        <p className="mt-5 text-[11px] text-white/40">Local data is published after editorial verification. Submit a fixture or standings poster through the BallMtaani local desk.</p>
        <Link href="/news?section=kenya" className="mt-3 inline-flex bg-[#d8212d] px-4 py-2 text-[10px] font-black uppercase">Read Kenyan football coverage</Link>
      </div>
    </main>
  );
}

function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="grid min-h-[180px] place-items-center px-8 text-center text-sm text-white/45"><div>{icon}<p className="mt-3">{text}</p></div></div>;
}
