import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, GitBranch, Trophy } from "lucide-react";
import SEO from "../components/SEO";
import { fetchTournamentFixtures } from "../lib/football-api";

const KNOCKOUT_ROUNDS = [
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "3rd Place Play-off",
  "Final",
];

const ROUND_COLORS: Record<string, string> = {
  "Round of 32":        "border-white/20 text-white/60",
  "Round of 16":        "border-blue-500/40 text-blue-400",
  "Quarter-finals":     "border-purple-500/40 text-purple-400",
  "Semi-finals":        "border-orange-500/40 text-orange-400",
  "3rd Place Play-off": "border-white/20 text-white/50",
  "Final":              "border-[#FFD700]/50 text-[#FFD700]",
};

function MatchCard({ match }: { match: any }) {
  const done = ["FT", "AET", "PEN"].includes(match.status);
  const live = ["1H", "2H", "HT", "ET", "BT", "P", "LIVE"].includes(match.status);
  const homeWin = done && match.homeScore > match.awayScore;
  const awayWin = done && match.awayScore > match.homeScore;

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0c0f16]">
      {live && (
        <div className="flex items-center gap-1.5 border-b border-red-500/20 bg-red-500/10 px-3 py-1">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-red-400">
            Live{match.minute ? ` · ${match.minute}'` : ""}
          </span>
        </div>
      )}

      <div className="p-3">
        {/* Home */}
        <div className={`flex items-center justify-between gap-2 ${homeWin ? "opacity-100" : done ? "opacity-50" : ""}`}>
          <div className="flex min-w-0 items-center gap-2">
            {match.homeLogo && <img src={match.homeLogo} alt="" className="h-5 w-5 shrink-0 object-contain" loading="lazy" />}
            <span className={`truncate text-[11px] font-black uppercase tracking-tight ${homeWin ? "text-white" : "text-white/70"}`}>
              {match.home}
            </span>
          </div>
          <span className={`shrink-0 text-sm font-black tabular-nums ${homeWin ? "text-white" : done ? "text-white/40" : "text-white/30"}`}>
            {done || live ? (match.homeScore ?? "—") : "—"}
          </span>
        </div>

        <div className="my-1.5 flex items-center gap-2">
          <div className="h-px flex-1 bg-white/6" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
            {done ? "FT" : live ? `${match.minute || "Live"}'` : match.time}
          </span>
          <div className="h-px flex-1 bg-white/6" />
        </div>

        {/* Away */}
        <div className={`flex items-center justify-between gap-2 ${awayWin ? "opacity-100" : done ? "opacity-50" : ""}`}>
          <div className="flex min-w-0 items-center gap-2">
            {match.awayLogo && <img src={match.awayLogo} alt="" className="h-5 w-5 shrink-0 object-contain" loading="lazy" />}
            <span className={`truncate text-[11px] font-black uppercase tracking-tight ${awayWin ? "text-white" : "text-white/70"}`}>
              {match.away}
            </span>
          </div>
          <span className={`shrink-0 text-sm font-black tabular-nums ${awayWin ? "text-white" : done ? "text-white/40" : "text-white/30"}`}>
            {done || live ? (match.awayScore ?? "—") : "—"}
          </span>
        </div>

        {!done && !live && (
          <div className="mt-2 text-[9px] text-white/25">{match.date} · {match.venue}</div>
        )}
      </div>
    </div>
  );
}

export default function WorldCupBracketPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournamentFixtures(1, 2026)
      .then(setFixtures)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byRound = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const round of KNOCKOUT_ROUNDS) {
      const matches = fixtures.filter(f =>
        KNOCKOUT_ROUNDS.some(r => f.round?.includes(r)) && f.round?.includes(round)
      );
      if (matches.length) map[round] = matches;
    }
    return map;
  }, [fixtures]);

  const hasKnockout = Object.keys(byRound).length > 0;

  // Group stage ends ~Jul 2; R32 starts Jun 28
  const groupStageEnds = new Date("2026-06-28T00:00:00Z");
  const daysUntilKnockout = Math.max(0, Math.ceil((groupStageEnds.getTime() - Date.now()) / 86400000));

  return (
    <div className="min-h-screen bg-[#05070b] pb-20 text-white">
      <SEO
        title="WC26 Knockout Bracket | BallMtaani"
        description="Live World Cup 2026 knockout bracket — Round of 32, Round of 16, Quarter-finals, Semi-finals, and Final results as they happen."
        keywords={["World Cup 2026 bracket", "WC26 knockout", "WC26 Round of 16", "World Cup 2026 results"]}
        path="/world-cup-2026/bracket"
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#FFD700]/14 bg-[#040508] px-4 py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-green-950/40 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#FFD700]/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <Link href="/world-cup-2026"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
            <ChevronLeft className="h-3.5 w-3.5" />
            WC26 Hub
          </Link>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FFD700]/25 bg-[#FFD700]/10">
              <GitBranch className="h-5 w-5 text-[#FFD700]" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#FFD700]/50">World Cup 2026</div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl">Knockout Bracket</h1>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-sm text-white/45">
            R32 through the Final — results update live as matches complete.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FFD700]/20 border-t-[#FFD700]" />
          </div>
        ) : hasKnockout ? (
          <div className="space-y-10">
            {KNOCKOUT_ROUNDS.filter(r => byRound[r]).map(round => (
              <section key={round}>
                <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${ROUND_COLORS[round] || "border-white/20 text-white/60"}`}>
                  {round === "Final" && <Trophy className="h-3 w-3" />}
                  {round}
                </div>
                <div className={`grid gap-3 ${round === "Final" ? "sm:grid-cols-1 max-w-xs" : round.includes("Semi") ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
                  {byRound[round].map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Empty state — before knockout rounds begin */
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/8">
              <GitBranch className="h-8 w-8 text-[#FFD700]/60" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Bracket Unlocks Soon</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">
              {daysUntilKnockout > 0
                ? `Group stage ends in ${daysUntilKnockout} day${daysUntilKnockout !== 1 ? "s" : ""}. Round of 32 kicks off Jun 28.`
                : "Knockout fixtures loading — check back after today's group matches."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 text-left">
              {[
                { label: "Round of 32",    date: "Jun 28 – Jul 3" },
                { label: "Round of 16",    date: "Jul 4 – 7" },
                { label: "Quarter-finals", date: "Jul 9 – 11" },
                { label: "Semi-finals",    date: "Jul 14 – 15" },
                { label: "3rd Place",      date: "Jul 18" },
                { label: "Final",          date: "Jul 19" },
              ].map(({ label, date }) => (
                <div key={label} className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2.5">
                  <div className="text-[10px] font-black uppercase tracking-tight text-white">{label}</div>
                  <div className="mt-0.5 text-[9px] text-white/35">{date}</div>
                </div>
              ))}
            </div>
            <Link href="/predictions"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-black shadow-[0_0_24px_rgba(255,214,0,0.3)] transition-all hover:shadow-[0_0_36px_rgba(255,214,0,0.5)]">
              Make Your Bracket Calls <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
