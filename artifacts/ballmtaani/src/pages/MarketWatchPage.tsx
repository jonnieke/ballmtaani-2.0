import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Flame,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import SEO from "../components/SEO";
import { supabase } from "../lib/supabase";

// ─── WC26 Pre-Match Intelligence ─────────────────────────────────────────────
const OPENING_MATCHES = [
  {
    id: "wc26-1",
    home: "Mexico",
    away: "South Africa",
    homeFlag: "🇲🇽",
    awayFlag: "🇿🇦",
    date: "Jun 11",
    time: "10:00 PM",
    heat: 95,
    context: "South Africa's first WC since 2010 — on home continent soil. Mexico have never lost a WC opener in 5 attempts.",
    watch: "Africa's emotional story vs CONCACAF experience",
    edge: "Mexico",
    group: "A",
  },
  {
    id: "wc26-2",
    home: "USA",
    away: "Colombia",
    homeFlag: "🇺🇸",
    awayFlag: "🇨🇴",
    date: "Jun 12",
    time: "1:00 AM",
    heat: 78,
    context: "USA play on home turf with a squad finally built for a WC run. Colombia's James Rodriguez era is over — this is new generation.",
    watch: "Host nation pressure vs Latam technical quality",
    edge: "Colombia",
    group: "A",
  },
  {
    id: "wc26-3",
    home: "Brazil",
    away: "Germany",
    homeFlag: "🇧🇷",
    awayFlag: "🇩🇪",
    date: "Jun 13",
    time: "7:00 PM",
    heat: 100,
    context: "The 7-1 rematch narrative is everywhere. Brazil under Ancelotti, Vinicius Jr at peak. Germany with a rebuilt identity post-Qatar disaster.",
    watch: "The biggest revenge story in football. WC2014 5-1 haunts Brazil.",
    edge: "Even — coin flip",
    group: "C",
  },
  {
    id: "wc26-4",
    home: "Canada",
    away: "Venezuela",
    homeFlag: "🇨🇦",
    awayFlag: "🇻🇪",
    date: "Jun 12",
    time: "4:00 PM",
    heat: 62,
    context: "Canada's first WC since 1986. Davies, Johnston, David — a golden generation finally on the biggest stage.",
    watch: "Sentimental favorite. Davies vs Venezuela's physical defensive block.",
    edge: "Canada",
    group: "B",
  },
  {
    id: "wc26-5",
    home: "Argentina",
    away: "Morocco",
    homeFlag: "🇦🇷",
    awayFlag: "🇲🇦",
    date: "Jun 14",
    time: "10:00 PM",
    heat: 92,
    context: "Morocco — the team that broke Europe's monopoly in Qatar 2022. Argentina — the world champions. This is the defining Africa vs South America opener.",
    watch: "Kenyan fans split between CAF pride (Morocco) and WC champion respect.",
    edge: "Morocco upset risk is real",
    group: "D",
  },
  {
    id: "wc26-6",
    home: "France",
    away: "England",
    homeFlag: "🇫🇷",
    awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    date: "Jun 14",
    time: "1:00 AM",
    heat: 88,
    context: "They met in the QF in Qatar. France won. England still haunted. Mbappe vs Bellingham. The defining rivalry of this generation.",
    watch: "Africa's most followed match — Premier League fans vs Mbappe worshippers.",
    edge: "France",
    group: "E",
  },
];

const CONTENDERS = [
  { flag: "🇧🇷", name: "Brazil", rating: 94, strength: "Vinicius, Rodrygo, depth", risk: "Defensive frailty", color: "text-green-400", border: "border-green-400/30" },
  { flag: "🇫🇷", name: "France", rating: 93, strength: "Mbappe + depth in every line", risk: "Squad harmony", color: "text-blue-300", border: "border-blue-300/30" },
  { flag: "🇦🇷", name: "Argentina", rating: 91, strength: "Defending champions, Messi's last WC", risk: "Age — can they go 7 games?", color: "text-[#FFD700]", border: "border-[#FFD700]/30" },
  { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "England", rating: 86, strength: "Bellingham, Saka, Foden. Young peak.", risk: "Penalty history", color: "text-red-300", border: "border-red-300/30" },
  { flag: "🇩🇪", name: "Germany", rating: 84, strength: "Rebuilt identity, Musiala + Wirtz", risk: "First tournament back from disaster", color: "text-white/70", border: "border-white/20" },
  { flag: "🇲🇦", name: "Morocco", rating: 82, strength: "CAF's best team. Tactical discipline.", risk: "Attacking fire power plateau", color: "text-orange-300", border: "border-orange-300/30" },
];


function HeatBar({ value }: { value: number }) {
  const color = value >= 90 ? "bg-red-500" : value >= 75 ? "bg-orange-500" : "bg-yellow-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right text-[10px] font-bold text-white/50">{value}</span>
    </div>
  );
}

function RatingBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${color.replace("text-", "bg-").replace("/70","")}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function MarketWatchPage() {
  const [sentiment, setSentiment] = useState<Record<string, Record<string, number>>>({});
  const [sentimentLoading, setSentimentLoading] = useState(true);

  // Load fan pick counts for WC26 questions
  useEffect(() => {
    if (!supabase) { setSentimentLoading(false); return; }
    const wc26ids = ["wc26-champion", "wc26-africa", "wc26-shock", "wc26-horse", "wc26-kenya"];
    void Promise.resolve(
      supabase
        .from("predictions")
        .select("match_id, predicted_score")
        .in("match_id", wc26ids)
        .then(({ data, error }) => {
          setSentimentLoading(false);
          if (error || !data) return;
          const counts: Record<string, Record<string, number>> = {};
          data.forEach((row: any) => {
            if (!counts[row.match_id]) counts[row.match_id] = {};
            const pick = row.predicted_score || "Unknown";
            counts[row.match_id][pick] = (counts[row.match_id][pick] || 0) + 1;
          });
          setSentiment(counts);
        })
    ).catch(() => setSentimentLoading(false));
  }, []);

  // Champion picks — top 3
  const championPicks = Object.entries(sentiment["wc26-champion"] || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const championTotal = championPicks.reduce((s, [, n]) => s + n, 0) || 1;

  // Africa picks
  const africaPicks = Object.entries(sentiment["wc26-africa"] || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
  const africaTotal = africaPicks.reduce((s, [, n]) => s + n, 0) || 1;

  // Kenya heart team
  const kenyaPicks = Object.entries(sentiment["wc26-kenya"] || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
  const kenyaTotal = kenyaPicks.reduce((s, [, n]) => s + n, 0) || 1;

  const hasSentiment = championTotal > 1 || africaTotal > 1 || kenyaTotal > 1;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070a0f] pb-32 text-white">
      <SEO
        title="Market Watch — WC26 Intelligence | BallMtaani"
        description="WC26 pre-match intelligence for Kenyan fans: fan sentiment, opening fixture context, title contender form and match heat ratings."
        keywords={["WC26 preview", "football intelligence Kenya", "World Cup 2026 analysis", "BallMtaani market watch"]}
        path="/market-watch"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "Market Watch", url: "/market-watch" }]}
      />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/African_fans_celebration_stadium.jpeg"
          alt=""
          className="h-full w-full object-cover object-center opacity-18"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(239,35,48,0.25),transparent_28%),radial-gradient(circle_at_14%_70%,rgba(42,130,255,0.15),transparent_30%),linear-gradient(180deg,rgba(7,10,15,0.7),#070a0f_80%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">

        {/* Top nav */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/matches" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur-xl hover:border-primary/60 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Data Center
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Football intelligence for Kenyan fans
          </div>
        </div>

        {/* Hero */}
        <section className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-primary">WC26 intelligence</p>
            <h1 className="max-w-3xl text-4xl font-bold italic leading-none md:text-6xl">Read every game before kickoff.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/62">
              Fan sentiment from BallMtaani predictions, opening fixture context and title contender form — everything Kenyan fans need to call WC26.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: Flame, value: "6", label: "Opening fixtures", color: "border-red-400/35 text-red-300" },
              { icon: Target, value: "32", label: "Nations tracked", color: "border-[#FFD700]/35 text-[#FFD700]" },
              { icon: TrendingUp, value: "Live", label: "Fan sentiment", color: "border-green-400/35 text-green-300" },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className={`rounded-2xl border bg-[#0d131c]/86 p-3 ${color}`}>
                <Icon className="mb-2 h-5 w-5" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Fan Sentiment — pulled from predictions table */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold uppercase">Fan Sentiment Board</h2>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Live from predictions</span>
          </div>

          {sentimentLoading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/40">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
              Loading fan picks...
            </div>
          ) : !hasSentiment ? (
            <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.03] p-6 text-center">
              <div className="text-sm font-bold uppercase tracking-wider text-white">No picks yet</div>
              <p className="mt-2 text-sm text-white/40">Be the first — make your WC26 predictions and your pick shows here.</p>
              <Link href="/predictions" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/35 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/25 transition-colors">
                Make your WC26 calls <Trophy className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {/* Champion picks */}
              {championTotal > 1 && (
                <div className="rounded-2xl border border-[#FFD700]/20 bg-[#0d131c]/88 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/50">Who lifts the trophy?</div>
                      <div className="text-sm font-bold text-white">{championTotal} fans voted</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {championPicks.map(([team, count]) => (
                      <div key={team}>
                        <div className="mb-1 flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white">{team}</span>
                          <span className="text-white/45">{Math.round((count / championTotal) * 100)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[#FFD700]" style={{ width: `${(count / championTotal) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Africa's best run */}
              {africaTotal > 1 && (
                <div className="rounded-2xl border border-orange-400/20 bg-[#0d131c]/88 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg">🌍</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/50">Africa's deepest run?</div>
                      <div className="text-sm font-bold text-white">{africaTotal} fans voted</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {africaPicks.map(([team, count]) => (
                      <div key={team}>
                        <div className="mb-1 flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white">{team}</span>
                          <span className="text-white/45">{Math.round((count / africaTotal) * 100)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-orange-500" style={{ width: `${(count / africaTotal) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kenya's heart team */}
              {kenyaTotal > 1 && (
                <div className="rounded-2xl border border-green-500/20 bg-[#0d131c]/88 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg">🇰🇪</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white/50">Kenya's heart team?</div>
                      <div className="text-sm font-bold text-white">{kenyaTotal} fans voted</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {kenyaPicks.map(([team, count]) => (
                      <div key={team}>
                        <div className="mb-1 flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white">{team}</span>
                          <span className="text-white/45">{Math.round((count / kenyaTotal) * 100)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${(count / kenyaTotal) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Opening Fixture Intelligence */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <Zap className="h-5 w-5 text-[#FFD700]" />
            <h2 className="text-xl font-bold uppercase">Opening Fixture Intelligence</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {OPENING_MATCHES.map((m) => (
              <div key={m.id} className="rounded-2xl border border-white/10 bg-[#0d131c]/88 p-4 hover:border-white/20 transition-colors">
                {/* Teams */}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="text-center">
                    <div className="text-2xl">{m.homeFlag}</div>
                    <div className="mt-1 text-xs font-bold text-white">{m.home}</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/30">Group {m.group}</div>
                    <div className="text-xs font-bold text-white/50">{m.date}</div>
                    <div className="text-[10px] text-white/30">{m.time} EAT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">{m.awayFlag}</div>
                    <div className="mt-1 text-xs font-bold text-white">{m.away}</div>
                  </div>
                </div>

                {/* Heat */}
                <div className="mb-3">
                  <div className="mb-1 flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-white/40">Match heat</span>
                    <Flame className={`h-3.5 w-3.5 ${m.heat >= 90 ? "text-red-400" : m.heat >= 75 ? "text-orange-400" : "text-yellow-400"}`} />
                  </div>
                  <HeatBar value={m.heat} />
                </div>

                {/* Context */}
                <p className="mb-2 text-[11px] leading-5 text-white/55">{m.context}</p>

                {/* Watch for */}
                <div className="mb-2 rounded-lg border border-blue-400/15 bg-blue-500/8 px-3 py-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-blue-300/70 mb-0.5">Watch for</div>
                  <p className="text-[10px] leading-4 text-blue-100/70">{m.watch}</p>
                </div>

                {/* Edge */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Fan edge</span>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{m.edge}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Title Contenders */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-purple-300" />
            <h2 className="text-xl font-bold uppercase">Title Contender Form</h2>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {CONTENDERS.map((team) => (
              <div key={team.name} className={`rounded-2xl border bg-[#0d131c]/88 p-4 ${team.border}`}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-3xl">{team.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${team.color}`}>{team.name}</span>
                      <span className="text-sm font-bold text-white">{team.rating}</span>
                    </div>
                    <RatingBar value={team.rating} color={team.color} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Activity className="mt-0.5 h-3 w-3 shrink-0 text-green-400" />
                    <p className="text-[10px] leading-4 text-white/55">{team.strength}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
                    <p className="text-[10px] leading-4 text-white/45">{team.risk}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Make Your Calls CTA */}
        <section className="rounded-3xl border border-[#FFD700]/25 bg-[#FFD700]/5 p-5 text-center">
          <div className="text-2xl mb-2">⚽</div>
          <h2 className="text-lg font-bold uppercase text-white">WC26 kicks off June 11</h2>
          <p className="mt-2 text-sm text-white/50">Make your 6 bold calls now. Win MTC coins. Show on the Leaderboard.</p>
          <Link
            href="/predictions"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-6 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-yellow-400 transition-colors"
          >
            Make Your WC26 Calls <Trophy className="h-4 w-4" />
          </Link>
        </section>

        <footer className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
          BallMtaani · Football intelligence for Kenyan fans
        </footer>
      </main>
    </div>
  );
}
