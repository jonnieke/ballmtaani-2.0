import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, ShieldAlert, Sparkles, Trophy, Users } from "lucide-react";
import SEO from "../components/SEO";
import { EMPTY_LOCAL_FOOTBALL_DESK, fetchLocalFootballDesk, type LocalFeedStatus } from "../lib/local-football";

function publishedLabel(value: string | null) {
  if (!value) return "No verified publication yet";
  return `Last verified ${new Date(value).toLocaleString("en-KE", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi",
  })} EAT`;
}

function FeedEmpty({ status, icon, emptyText }: { status: LocalFeedStatus; icon: ReactNode; emptyText: string }) {
  const unavailable = status === "unavailable";
  return (
    <div className="grid min-h-[180px] place-items-center px-8 text-center text-sm text-white/45">
      <div>
        {unavailable ? <ShieldAlert className="mx-auto h-6 w-6 text-amber-400" /> : icon}
        <p className="mt-3">{unavailable ? "This verified feed is temporarily unavailable. No substitute data is being shown." : emptyText}</p>
      </div>
    </div>
  );
}

export default function KenyaFootballPage() {
  const { data = EMPTY_LOCAL_FOOTBALL_DESK, isLoading } = useQuery({
    queryKey: ["kenya-football-desk"], queryFn: fetchLocalFootballDesk, staleTime: 5 * 60 * 1000,
  });

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-6">
      <SEO title="Kenyan Football Data Desk | BallMtaani" description="Human-verified Kenyan grassroots football fixtures, results, scorers, teams and standings transcribed from organizer records." path="/kenya-football" />
      <div className="mx-auto max-w-[1180px]">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-[#ef3038]"><ArrowLeft className="h-3.5 w-3.5" /> Back to home</Link>
        <header className="mt-5 border-b border-white/10 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#ef3038]">Daily local desk</p>
              <h1 className="mt-2 text-3xl font-black uppercase sm:text-4xl">Kenya Football Daily</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Local fixtures, results and player performances published only after a BallMtaani editor checks the organizer record. Missing details remain unknown rather than being inferred.</p>
            </div>
            <div className="border border-white/10 bg-[#101010] px-3 py-2 text-[10px] text-white/50">
              <span className="flex items-center gap-1.5 font-black uppercase text-[#FFD000]"><CheckCircle2 className="h-3.5 w-3.5" /> Human reviewed</span>
              <span className="mt-1 block">{publishedLabel(data.lastPublishedAt)}</span>
            </div>
          </div>
        </header>

        {isLoading ? <p className="py-16 text-center text-sm text-white/50">Loading verified local football data...</p> : (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
              <section id="fixtures" className="border border-white/10 bg-[#101010]" aria-labelledby="kenya-fixtures-heading">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><h2 id="kenya-fixtures-heading" className="flex items-center gap-2 text-sm font-black uppercase"><CalendarDays className="h-4 w-4 text-[#ef3038]" /> Fixtures &amp; results</h2><Link href="/news?section=kenya" className="text-[9px] font-black uppercase text-[#ef3038]">Kenya news</Link></div>
                {data.matches.length ? <div className="divide-y divide-white/10 px-4">{data.matches.map((match) => {
                  const hasScore = match.status === "finished" && match.homeScore !== null && match.awayScore !== null;
                  return <article key={match.id} className="grid grid-cols-[76px_1fr_auto] gap-3 py-3 text-xs sm:grid-cols-[100px_1fr_auto]">
                    <span className="text-white/45">{hasScore ? "FT" : match.scheduledDate || "Date TBC"}<small className="block text-[10px]">{match.kickoffTime || match.round || ""}</small></span>
                    <span className="min-w-0"><b className="block truncate">{match.homeTeam}</b><b className="block truncate">{match.awayTeam}</b><small className="mt-1 block text-[10px] text-white/40">{match.competition}</small>{match.venue && <small className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40"><MapPin className="h-2.5 w-2.5" />{match.venue}</small>}</span>
                    <b className="text-right">{hasScore ? <><span className="block">{match.homeScore}</span><span className="block">{match.awayScore}</span>{match.homePenalties !== null && match.awayPenalties !== null && <small className="mt-1 block text-[9px] font-medium text-[#FFD000]">pens {match.homePenalties}-{match.awayPenalties}</small>}</> : <span className="text-[#ef3038]">FIXTURE</span>}{match.verificationStatus === "corrected" && <small className="mt-1 block text-[8px] font-black uppercase text-amber-400">Corrected</small>}</b>
                  </article>;
                })}</div> : <FeedEmpty status={data.matchStatus} icon={<CalendarDays className="mx-auto h-6 w-6" />} emptyText="No verified Kenyan fixtures or results have been published yet." />}
              </section>

              <section id="standings" className="border border-white/10 bg-[#101010]" aria-labelledby="kenya-table-heading">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><h2 id="kenya-table-heading" className="flex items-center gap-2 text-sm font-black uppercase"><Trophy className="h-4 w-4 text-[#FFD000]" /> Local standings</h2><span className="text-[8px] font-black uppercase text-[#FFD000]">Verified records only</span></div>
                {data.standings.length ? <div className="px-4 py-2"><p className="py-2 text-[10px] font-black uppercase text-white/45">{data.standings[0].competition}</p><div className="grid grid-cols-[28px_1fr_40px_45px] border-b border-white/10 py-2 text-[9px] uppercase text-white/35"><span>#</span><span>Team</span><span>P</span><span>Pts</span></div>{data.standings.map((row) => <div key={row.id} className="grid grid-cols-[28px_1fr_40px_45px] border-b border-white/[0.07] py-2 text-xs"><span className="text-white/45">{row.position}</span><b className="truncate">{row.team}</b><span>{row.played ?? "-"}</span><b>{row.points ?? "-"}</b></div>)}</div> : <FeedEmpty status={data.standingsStatus} icon={<Trophy className="mx-auto h-6 w-6" />} emptyText="No organizer standings table has passed editorial verification yet." />}
              </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="border border-white/10 bg-[#101010]" aria-labelledby="performance-radar-heading">
                <div className="border-b border-white/10 px-4 py-3"><h2 id="performance-radar-heading" className="flex items-center gap-2 text-sm font-black uppercase"><Sparkles className="h-4 w-4 text-[#FFD000]" /> Performance radar</h2><p className="mt-1 text-[10px] text-white/40">Players named in verified match records, ranked by recorded contributions.</p></div>
                {data.players.length ? <div className="divide-y divide-white/10 px-4">{data.players.slice(0, 12).map((player, index) => <div key={`${player.name}-${player.team}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-3 text-xs"><span className="font-black text-[#FFD000]">{index + 1}</span><span><b className="block">{player.name}</b><small className="text-[10px] text-white/40">{player.team || "Team not confirmed"} · {player.competition}</small></span><span className="text-right"><b>{player.goals}</b><small className="block text-[9px] uppercase text-white/40">goals</small></span></div>)}</div> : <FeedEmpty status={data.eventsStatus} icon={<Sparkles className="mx-auto h-6 w-6" />} emptyText="Player names and scoring events will appear after a detailed match record is verified." />}
              </section>

              <section className="border border-white/10 bg-[#101010]" aria-labelledby="teams-radar-heading">
                <div className="border-b border-white/10 px-4 py-3"><h2 id="teams-radar-heading" className="flex items-center gap-2 text-sm font-black uppercase"><Users className="h-4 w-4 text-[#ef3038]" /> Teams on the local radar</h2><p className="mt-1 text-[10px] text-white/40">Clubs and community teams present in the current verified dataset.</p></div>
                {data.teams.length ? <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3">{data.teams.map((team) => <div key={team} className="bg-[#101010] px-3 py-3 text-xs font-bold">{team}</div>)}</div> : <FeedEmpty status={data.matchStatus} icon={<Users className="mx-auto h-6 w-6" />} emptyText="Verified local teams will appear with the first published match record." />}
              </section>
            </div>
          </div>
        )}

        <p className="mt-5 text-[11px] leading-5 text-white/40">Organizer images remain private source evidence. Public tables show the reviewed transcription and publication time; uncertain dates, venues or scorers are left blank for follow-up.</p>
        <Link href="/news?section=kenya" className="mt-3 inline-flex bg-[#d8212d] px-4 py-2 text-[10px] font-black uppercase">Read Kenyan football coverage</Link>
      </div>
    </main>
  );
}
