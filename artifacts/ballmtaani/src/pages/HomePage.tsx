import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { Trophy, Users, MessageSquare, ChevronRight, Zap, Sparkles, Radio, Calendar } from "lucide-react";
import { useMatches, useUpcomingFixtures, useRecentMatches, useLeaderboard } from "../hooks/useData";
import { fetchTodaysFixtures, type LiveMatch } from "../lib/football-api";
import { supabase } from "../lib/supabase";
import { WC26_GUIDES } from "../data/wc26-guides";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import { SkeletonMatch } from "../components/Skeletons";
import PremiumMatchCard from "../components/PremiumMatchCard";
import SEO from "../components/SEO";
import FloatingMchambuzi from "../components/FloatingMchambuzi";
import DataFreshnessChip from "../components/DataFreshnessChip";
import { formatFreshnessLabel } from "../lib/freshness";
import { motion } from "framer-motion";
import GoogleSignInButton from "../components/GoogleSignInButton";

const WC26_START = new Date("2026-06-11T17:00:00Z");
const WC26_END   = new Date("2026-07-20T00:00:00Z");

function useWC26() {
  const [cd, setCd] = useState({ days: 0, hours: 0, mins: 0, secs: 0, isLive: false, isOver: false });
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const over = now > WC26_END.getTime();
      const live = !over && now >= WC26_START.getTime();
      const diff = WC26_START.getTime() - now;
      setCd({ days: Math.max(0, Math.floor(diff / 86400000)), hours: Math.max(0, Math.floor((diff % 86400000) / 3600000)), mins: Math.max(0, Math.floor((diff % 3600000) / 60000)), secs: Math.max(0, Math.floor((diff % 60000) / 1000)), isLive: live, isOver: over });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return cd;
}

function progressPct(status: string, minute: string) {
  const m = parseInt(minute) || 0;
  if (status === "HT") return 50;
  if (status === "1H") return Math.min((m / 45) * 50, 50);
  if (status === "2H") return Math.min(50 + ((m - 45) / 45) * 50, 100);
  if (["ET","P"].includes(status)) return 100;
  return 0;
}

function halfLabel(status: string) {
  return ({ "1H":"1st Half","HT":"Half Time","2H":"2nd Half","ET":"Extra Time","P":"Penalties" } as Record<string,string>)[status] || "Live";
}

function CountBox({ v, l }: { v: number; l: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[44px] rounded-lg border border-[#FFD700]/20 bg-black/60 px-2.5 py-1.5 text-center backdrop-blur-sm">
        <span className="block text-xl font-black tabular-nums text-white md:text-2xl">{String(v).padStart(2,"0")}</span>
      </div>
      <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[#FFD700]/50">{l}</span>
    </div>
  );
}

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [clockTick, setClockTick] = useState(0);
  const [todaysFixtures, setTodaysFixtures] = useState<any[]>([]);

  const { data: liveMatches = [], isLoading: isLoadingMatches } = useMatches();
  const { data: upcomingFixtures = [], isLoading: isLoadingUpcoming } = useUpcomingFixtures();
  const { data: recentMatches = [], isLoading: isLoadingRecent } = useRecentMatches();
  const { data: leaderboard = [] } = useLeaderboard();
  const wc26 = useWC26();

  useEffect(() => {
    if (liveMatches.length || upcomingFixtures.length || recentMatches.length) setLastUpdated(new Date());
  }, [liveMatches, upcomingFixtures, recentMatches]);

  useEffect(() => {
    fetchTodaysFixtures().then(setTodaysFixtures);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setClockTick(n => n + 1), 60000);
    return () => window.clearInterval(t);
  }, []);

  const freshnessLabel = useMemo(() => formatFreshnessLabel(lastUpdated), [lastUpdated, clockTick]);

  const featuredMatch = liveMatches[0] || upcomingFixtures[0] || null;
  const isMatchLive   = !!liveMatches[0];

  const liveStatuses = new Set(["1H","2H","HT","ET","P","BT","LIVE"]);
  const todayUpcoming = todaysFixtures.filter(m => !liveStatuses.has(m.status)).slice(0, 6);

  // Group today's matches by league
  const byLeague = todayUpcoming.reduce((acc: Record<string, any[]>, m) => {
    const k = m.league || "Other";
    if (!acc[k]) acc[k] = [];
    acc[k].push(m);
    return acc;
  }, {});

  return (
    <div className="pb-24">
      <SEO
        title="BallMtaani | Kenyan Football Hub â€” WC26 Ready"
        description="Kenya's #1 football hub: live UCL scores, World Cup 2026 countdown, today's fixtures, fan predictions and Mchambuzi AI analysis."
        keywords={["BallMtaani","Kenyan football","World Cup 2026","live football scores","UCL final","WC26 Kenya","football predictions"]}
        path="/home"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "Home", url: "/home" }]}
      />

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden border-b border-white/8 bg-[#040508]">
        {/* AI-generated hero â€” Vertex AI Imagen 3, World Cup energy */}
        <img src="/wc26-hero.jpg" alt="" decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-55" />
        {/* Cinematic grade overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_20%,rgba(4,5,8,0.65)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040508] via-[#040508]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040508]/80 via-transparent to-[#040508]/40" />
        {/* Gold shimmer at top */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700]/60 to-transparent" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">

            {/* Left â€” headline + social proof + CTAs */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              {/* WC26 badge */}
              {!wc26.isOver && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/28 bg-[#FFD700]/8 px-4 py-1.5">
                  {wc26.isLive && <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-pulse" />}
                  <Trophy className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FFD700]">
                    {wc26.isLive ? "World Cup 2026 â€” Live!" : `WC26 in ${wc26.days}d ${wc26.hours}h`}
                  </span>
                </div>
              )}

              {/* Dynamic headline â€” speaks to the fan, not a brand statement */}
              <h1 className="mb-3 text-4xl font-black leading-[0.9] tracking-tight text-white md:text-5xl lg:text-6xl">
                {isMatchLive && featuredMatch ? (
                  <>{featuredMatch.home} {featuredMatch.homeScore}â€“{featuredMatch.awayScore} {featuredMatch.away}.<br />
                  <span className="text-[#B30000]">{featuredMatch.minute}. Your move.</span></>
                ) : wc26.isLive ? (
                  <>The World Cup<br /><span className="text-[#FFD700]">Is Live.</span></>
                ) : (
                  <>Your group chat,<br /><span className="text-[#B30000]">but with receipts.</span></>
                )}
              </h1>

              {/* One-liner that explains the product */}
              <p className="mb-5 text-sm text-white/50 md:text-base">
                {isMatchLive
                  ? "Pick the final score. Come back at full time. The receipt doesn't lie."
                  : "Kenya's loudest fan room for live scores, WC26 predictions and real match receipts."}
              </p>

              {/* Social proof */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {["#B30000","#1E6FFF","#FFD700","#22c55e"].map(c => (
                    <div key={c} className="h-6 w-6 rounded-full border-2 border-[#040508]" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-white/40">
                  Join <span className="text-white/70 font-black">18,000+</span> Kenyan fans calling it
                </span>
              </div>

              {/* Countdown (compact, inline) */}
              {!wc26.isLive && !wc26.isOver && (
                <div className="mb-5 flex items-end gap-2">
                  <CountBox v={wc26.days}  l="Days" />
                  <span className="mb-5 text-lg font-black text-[#FFD700]/28">:</span>
                  <CountBox v={wc26.hours} l="Hrs" />
                  <span className="mb-5 text-lg font-black text-[#FFD700]/28">:</span>
                  <CountBox v={wc26.mins}  l="Min" />
                  <span className="mb-5 text-lg font-black text-[#FFD700]/28">:</span>
                  <CountBox v={wc26.secs}  l="Sec" />
                </div>
              )}

              {/* CTAs â€” primary action first, sign-up if logged out */}
              <div className="flex flex-wrap gap-3">
                {isMatchLive && featuredMatch ? (
                  <Link href={`/live-center/${featuredMatch.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#B30000] px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_0_24px_rgba(179,0,0,0.4)] transition-all hover:shadow-[0_0_36px_rgba(179,0,0,0.6)] active:scale-95">
                    Join Live Center <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link href="/world-cup-2026"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-black shadow-[0_0_24px_rgba(255,214,0,0.3)] transition-all hover:shadow-[0_0_36px_rgba(255,214,0,0.5)] active:scale-95">
                    WC26 Hub <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
                {!isLoggedIn ? (
                  <GoogleSignInButton size="md" label="Join Free · Google" />
                ) : (
                  <Link href="/predictions"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/18 bg-white/5 px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-95">
                    Make Your Call
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Right â€” Featured match */}
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, delay: 0.15 }}>
              {featuredMatch ? (
                <div className={`overflow-hidden rounded-2xl border backdrop-blur-xl ${isMatchLive ? "border-[#B30000]/40 bg-[#0d0608]/92 shadow-[0_0_40px_rgba(179,0,0,0.22)]" : "border-white/12 bg-[#0c111a]/92"}`}>
                  <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isMatchLive && <span className="h-2 w-2 rounded-full bg-[#B30000] animate-ping" />}
                      <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${isMatchLive ? "text-[#B30000]" : "text-white/45"}`}>
                        {isMatchLive ? "Live Now" : "Featured Match"}
                      </span>
                    </div>
                    <span className="max-w-[150px] truncate text-[10px] text-white/30">{featuredMatch.league}</span>
                  </div>
                  <div className="p-5 md:p-6">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-5">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <TeamLogo logo={featuredMatch.homeLogo} initial={featuredMatch.homeInitial} color={featuredMatch.homeColor || "#182333"} size="xl" />
                        <span className="text-sm font-black leading-tight text-white">{featuredMatch.home}</span>
                      </div>
                      <div className="text-center">
                        {isMatchLive ? (
                          <>
                            <div className="text-3xl font-black tabular-nums text-white">{featuredMatch.homeScore}<span className="text-white/25 mx-1">â€“</span>{featuredMatch.awayScore}</div>
                            <div className="mt-1 text-[10px] font-black uppercase text-[#B30000]">{featuredMatch.minute}</div>
                          </>
                        ) : (
                          <div className="rounded-xl border border-white/10 px-4 py-2 text-xl font-black text-white/22">VS</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-2 text-center">
                        <TeamLogo logo={featuredMatch.awayLogo} initial={featuredMatch.awayInitial} color={featuredMatch.awayColor || "#182333"} size="xl" />
                        <span className="text-sm font-black leading-tight text-white">{featuredMatch.away}</span>
                      </div>
                    </div>

                    {isMatchLive && (
                      <div className="mb-4">
                        <div className="h-1 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full rounded-full bg-[#B30000] shadow-[0_0_8px_#B30000] transition-all duration-1000"
                            style={{ width: `${progressPct(featuredMatch.status, featuredMatch.minute)}%` }} />
                        </div>
                        <div className="relative mt-1 flex justify-between text-[8px] text-white/18 font-semibold">
                          <span>0'</span><span className="absolute left-1/2 -translate-x-1/2">45'</span><span>90'</span>
                        </div>
                      </div>
                    )}

                    <Link href={isMatchLive ? `/live-center/${featuredMatch.id}` : "/predictions"}
                      className={`block w-full rounded-xl py-3.5 text-center text-sm font-black uppercase tracking-[0.12em] transition-all active:scale-[0.98] ${isMatchLive ? "bg-[#B30000] text-white shadow-[0_0_20px_rgba(179,0,0,0.4)]" : "bg-white text-black"}`}>
                      {isMatchLive ? "Join Live Center" : "Make Your Call"}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/8 bg-black/30 p-12 text-center backdrop-blur-sm">
                  <Calendar className="mx-auto mb-4 h-10 w-10 text-white/18" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/22">Matchday check-in coming soon</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      <section className="border-b border-white/6 bg-[#05070b] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="border-l-4 border-[#FFD700] pl-3 text-lg font-black uppercase tracking-widest text-white">WC26 Guides</h2>
              <p className="ml-4 mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">
                Format · Stadiums · Africa · Squads
              </p>
            </div>
            <Link href="/world-cup-2026" className="hidden items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#FFD700] sm:flex">
              Open WC26 Hub <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WC26_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/world-cup-2026/${guide.slug}`}
                className="group rounded-2xl border border-white/8 bg-[#090d14] p-4 transition-all hover:-translate-y-0.5 hover:border-[#FFD700]/30"
              >
                <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#FFD700]/58">{guide.eyebrow}</div>
                <h3 className="text-sm font-black uppercase leading-snug tracking-[0.08em] text-white">{guide.title}</h3>
                <p className="mt-3 line-clamp-3 text-xs leading-6 text-white/46">{guide.deck}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD700]">
                  Read guide <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ LIVE + TODAY'S MATCHES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {(liveMatches.length > 0 || todayUpcoming.length > 0) && (
        <section className="border-b border-white/6 bg-[#060810] py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-4 md:grid-cols-2">

              {/* Live Now */}
              {liveMatches.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-[#B30000]/35 bg-[#0d0608]/96 shadow-[0_0_20px_rgba(179,0,0,0.12)]">
                  <div className="flex items-center gap-2 border-b border-[#B30000]/18 px-3 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#B30000] animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B30000]">Live Now</span>
                    <span className="ml-auto text-[10px] text-[#B30000]/50">{liveMatches.length} match{liveMatches.length > 1 ? "es" : ""}</span>
                  </div>
                  {liveMatches.map((m: LiveMatch) => {
                    const pct   = progressPct(m.status, m.minute);
                    const hl    = halfLabel(m.status);
                    const isHT  = m.status === "HT";
                    return (
                      <Link key={m.id} href={`/live-center/${m.id}`} className="block border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 pt-3 pb-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <TeamLogo logo={m.homeLogo} initial={m.homeInitial} color="#1a0608" size="sm" />
                            <span className="truncate text-sm font-bold text-white">{m.home}</span>
                          </div>
                          <span className="text-lg font-black tabular-nums text-[#B30000]">{m.homeScore} â€“ {m.awayScore}</span>
                          <div className="flex min-w-0 items-center justify-end gap-2">
                            <span className="truncate text-right text-sm font-bold text-white">{m.away}</span>
                            <TeamLogo logo={m.awayLogo} initial={m.awayInitial} color="#1a0608" size="sm" />
                          </div>
                        </div>
                        <div className="px-3 pb-3">
                          <div className="mb-1.5 flex justify-between">
                            <span className="text-[9px] text-white/28 font-semibold uppercase tracking-widest">{m.league}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isHT ? "text-yellow-400" : "text-[#B30000]"}`}>
                              {isHT ? "Half Time" : m.minute ? `${m.minute} Â· ${hl}` : hl}
                            </span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-white/8">
                            <div className={`h-full rounded-full transition-all duration-1000 ${isHT ? "bg-yellow-400" : "bg-[#B30000]"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <div className="relative mt-1 flex justify-between text-[8px] text-white/15 font-semibold">
                            <span>0'</span><span className="absolute left-1/2 -translate-x-1/2">45'</span><span>90'</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Today's Upcoming */}
              {todayUpcoming.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#090d14]/96">
                  <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
                    <Calendar className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/60">Today's Matches</span>
                    <span className="ml-auto text-[10px] text-white/28">{new Date().toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" })}</span>
                  </div>
                  {Object.entries(byLeague).map(([league, matches]: [string, any[]]) => (
                    <div key={league}>
                      <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-3 py-1.5">
                        {matches[0]?.leagueLogo && <img src={matches[0].leagueLogo} alt="" className="h-3.5 w-3.5 object-contain opacity-60" loading="lazy" />}
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/38">{league}</span>
                      </div>
                      {matches.map((m: any) => (
                        <div key={m.id} className="grid grid-cols-[40px_1fr_28px_1fr] items-center gap-2 border-b border-white/5 px-3 py-2.5 last:border-0">
                          <span className="text-xs font-bold tabular-nums text-white/48">{m.time || "TBC"}</span>
                          <div className="flex min-w-0 items-center gap-1.5">
                            <TeamLogo logo={m.homeLogo} initial={m.homeInitial || m.home?.slice(0, 3)} color="#182333" size="sm" />
                            <span className="truncate text-sm font-semibold text-white">{m.home}</span>
                          </div>
                          <span className="text-center text-[10px] font-bold text-white/22">vs</span>
                          <div className="flex min-w-0 items-center justify-end gap-1.5">
                            <span className="truncate text-right text-sm font-semibold text-white">{m.away}</span>
                            <TeamLogo logo={m.awayLogo} initial={m.awayInitial || m.away?.slice(0, 3)} color="#182333" size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── STICKY SIGN-UP BANNER ── logged-out fans only */}
      {!isLoggedIn && (
        <div className=”fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0B0B0B]/96 backdrop-blur-xl px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]”>
          <div className=”mx-auto flex max-w-lg items-center gap-3”>
            <div className=”flex-1 min-w-0”>
              <p className=”text-xs font-black text-white leading-tight”>🏆 WC26 kicks off June 11</p>
              <p className=”text-[10px] text-white/40”>Make your bold calls before kickoff — free</p>
            </div>
            <GoogleSignInButton size=”sm” label=”Join · Google” />
          </div>
        </div>
      )}

      {/* MATCH HUB */}
      <section className=”border-b border-white/6 bg-[#0B0B0B] py-8”>
        <div className=”mx-auto max-w-6xl px-4”>
          <div className=”mb-5 flex items-center justify-between”>
            <div>
              <h2 className="border-l-4 border-[#B30000] pl-4 text-xl font-black uppercase tracking-wide text-white">Match Hub</h2>
              <p className="ml-4 mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Live Â· Results Â· Upcoming</p>
              {lastUpdated && <DataFreshnessChip label={freshnessLabel} className="ml-4 mt-1" />}
            </div>
            <Link href="/matches" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#B30000]">
              Full Desk <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {isLoadingMatches || isLoadingUpcoming || isLoadingRecent ? (
              [1, 2, 3].map(i => <SkeletonMatch key={i} />)
            ) : liveMatches.length === 0 && upcomingFixtures.length === 0 && recentMatches.length === 0 ? (
              <div className="min-w-[280px] max-w-[320px] snap-start rounded-xl border border-white/8 bg-[#0d1018] p-4">
                <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/30">No live desk right now</div>
                <p className="text-sm leading-6 text-white/58">
                  The live desk is quiet at the moment. The WC26 guides above are ready, and this desk will refill as soon as fixtures land.
                </p>
                <Link href="/world-cup-2026" className="mt-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD700]">
                  Open WC26 Hub <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <>
                {liveMatches.map((m: any) => <PremiumMatchCard key={m.id} match={{ ...m, status: "LIVE" }} />)}
                {upcomingFixtures.slice(0, 5).map((m: any) => <PremiumMatchCard key={m.id} match={m} />)}
                {recentMatches.slice(0, 5).map((m: any) => <PremiumMatchCard key={m.id} match={{ ...m, status: "FT" }} />)}
              </>
            )}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ARCADE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-white/6 bg-[#0B0B0B] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase tracking-widest text-white">The <span className="text-[#FFD700]">Arcade</span></h2>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">Calls Â· Trivia Â· Debates Â· Earn MTC</p>
            </div>
            {/* MTC explanation â€” one line */}
            <span className="hidden text-[10px] font-bold text-white/30 sm:block">
              Every correct call earns <span className="text-[#FFD700] font-black">MTC status</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            {[
              { href: "/predictions", icon: Sparkles, label: "Fan Intel", sub: "Pick the score. Keep the receipt.", border: "border-[#B30000]/22 hover:border-[#B30000]/50", ic: "text-[#B30000]", cta: "Make Call", badge: "Earn MTC" },
              { href: "/world-cup-2026", icon: Trophy, label: "WC26 Hub", sub: "Groups, fixtures, fan predictions", border: "border-[#FFD700]/22 hover:border-[#FFD700]/50", ic: "text-[#FFD700]", cta: "Open Hub", gold: true },
              { href: "/rapid-fire", icon: Zap, label: "Rapid Fire", sub: "30-second football polls", border: "border-blue-500/18 hover:border-blue-500/42", ic: "text-blue-400", cta: "Play Now", badge: "Earn MTC" },
              { href: "/trivia", icon: Radio, label: "Millionaire", sub: "Football IQ. Weekly table.", border: "border-purple-500/18 hover:border-purple-500/42", ic: "text-purple-400", cta: "Play Trivia", badge: "Earn MTC" },
            ].map(({ href, icon: Icon, label, sub, border, ic, cta, gold, badge }) => (
              <Link key={href} href={href}
                className={`group relative flex flex-col rounded-xl border bg-[#0d1018] p-4 transition-all duration-200 hover:-translate-y-0.5 ${border}`}>
                {badge && <span className="absolute right-2 top-2 rounded-full bg-[#FFD700]/12 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#FFD700]/70">{badge}</span>}
                <Icon className={`mb-3 h-5 w-5 ${ic}`} />
                <h3 className={`mb-1 text-xs font-black uppercase tracking-wide ${gold ? "text-[#FFD700]" : "text-white"}`}>{label}</h3>
                <p className="mb-3 flex-1 text-[11px] leading-relaxed text-white/30">{sub}</p>
                <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${ic}`}>{cta} â†’</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ KENYAN FOOTBALL STRIP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-[#006600]/25 bg-[#040a04] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#006600]/40 bg-[#006600]/15 text-sm">ðŸ‡°ðŸ‡ª</div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">African Football</h2>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[#22c55e]/60">CAF Â· Harambee Stars Â· Local</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/matches?league=CAF" className="group flex items-center gap-3 rounded-xl border border-[#006600]/18 bg-[#060d06] p-4 transition-all hover:border-[#006600]/40">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#006600]/15 text-lg">ðŸ†</div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase text-white">CAF Champions League</div>
                <div className="text-[10px] text-white/35">Continental club football</div>
              </div>
              <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/20 group-hover:text-[#22c55e]" />
            </Link>
            <Link href="/matches" className="group flex items-center gap-3 rounded-xl border border-[#006600]/18 bg-[#060d06] p-4 transition-all hover:border-[#006600]/40">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#006600]/15 text-lg">âš½</div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase text-white">Harambee Stars</div>
                <div className="text-[10px] text-white/35">Kenya national team</div>
              </div>
              <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/20 group-hover:text-[#22c55e]" />
            </Link>
            <Link href="/fan-zones" className="group flex items-center gap-3 rounded-xl border border-[#006600]/18 bg-[#060d06] p-4 transition-all hover:border-[#006600]/40">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#006600]/15 text-lg">ðŸ”¥</div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase text-white">Kenyan Fan Zones</div>
                <div className="text-[10px] text-white/35">Gor Â· Leopards Â· Tusker Â· More</div>
              </div>
              <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/20 group-hover:text-[#22c55e]" />
            </Link>
          </div>
        </div>
      </section>

      {/* AD */}
      <section className="border-b border-white/6 bg-[#0B0B0B] py-6">
        <div className="mx-auto max-w-6xl px-4">
          <AdBanner label="Matchday Partner" type="horizontal" />
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ COMMUNITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-white/6 bg-[#04060a] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-white">Keep The <span className="text-[#B30000]">Receipt.</span></h2>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">Challenge. Debate. Come back after full time.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            {[
              { href: "/rivalries", icon: Zap, label: "Fan Duels", sub: "Challenge a rival, settle the debate", border: "border-[#B30000]/20 hover:border-[#B30000]/45", bg: "bg-[#0d0608]", ic: "text-[#B30000]", ibg: "bg-[#B30000]/10", cta: "Start Duel" },
              { href: "/fan-zones", icon: Users, label: "Fan Zones", sub: "Elite communities for die-hards", border: "border-[#FFD700]/16 hover:border-[#FFD700]/38", bg: "bg-[#080700]", ic: "text-[#FFD700]", ibg: "bg-[#FFD700]/8", cta: "Explore", gold: true },
              { href: "/debates", icon: MessageSquare, label: "Debates", sub: "Takes, receipts and matchday banter", border: "border-blue-500/16 hover:border-blue-500/38", bg: "bg-[#050810]", ic: "text-blue-400", ibg: "bg-blue-500/8", cta: "Join Feed" },
            ].map(({ href, icon: Icon, label, sub, border, bg, ic, ibg, cta, gold }) => (
              <Link key={href} href={href}
                className={`group flex flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${bg} ${border}`}>
                <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${ibg}`}>
                  <Icon className={`h-4 w-4 ${ic}`} />
                </div>
                <h3 className={`mb-1 text-xs font-black uppercase tracking-wide ${gold ? "text-[#FFD700]" : "text-white"}`}>{label}</h3>
                <p className="mb-3 flex-1 text-[11px] text-white/28">{sub}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest ${ic}`}>{cta} â†’</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ LEADERBOARD PREVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-[#04060a] py-10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-1 text-lg font-black uppercase tracking-widest text-white">Hall of <span className="text-[#FFD700]">Fame</span></h2>
          <p className="mb-6 text-[10px] font-semibold uppercase tracking-widest text-white/25">Top fans this week</p>
          <div className="mb-6 overflow-hidden rounded-xl border border-white/6 bg-[#0d0f14]">
            {leaderboard.slice(0, 3).map((p: any, i: number) => (
              <div key={p.rank || i} className="flex items-center justify-between border-b border-white/5 px-4 py-3.5 last:border-0">
                <div className="flex items-center gap-4">
                  <span className={`w-6 text-sm font-black ${p.rank === 1 ? "text-[#FFD700]" : "text-white/25"}`}>#{p.rank}</span>
                  <div className="text-left">
                    <span className="text-sm font-black text-white">{p.name} {p.country}</span>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#B30000]">Level {p.streak || 1} Elite Host</div>
                  </div>
                </div>
                <span className="text-sm font-black text-[#FFD700]">{p.pts} pts</span>
              </div>
            ))}
            {!leaderboard.length && (
              <div className="py-8 text-[10px] font-black uppercase tracking-widest text-white/18">Loading...</div>
            )}
          </div>
          <Link href="/leaderboard"
            className="inline-block rounded-full border border-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white/60 transition-all hover:bg-white/5 hover:text-white">
            Full Leaderboard
          </Link>
        </div>
      </section>

      <FloatingMchambuzi variant="home" />
    </div>
  );
}
