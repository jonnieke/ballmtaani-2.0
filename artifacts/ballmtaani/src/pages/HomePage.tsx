import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, MessageSquare, ChevronRight, Zap, Calendar, Sparkles, Radio, Share2, ShieldCheck } from "lucide-react";
import { CLUB_LOGOS } from "../data/mockData";
import { useMatches, useUpcomingFixtures, useRecentMatches, useDebates, useLeaderboard } from "../hooks/useData";
import { supabase } from "../lib/supabase";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import { SkeletonMatch } from "../components/Skeletons";
import PremiumMatchCard from "../components/PremiumMatchCard";
import SEO from "../components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import NewsFeed from "../components/NewsFeed";
import FloatingMchambuzi from "../components/FloatingMchambuzi";
import DataFreshnessChip from "../components/DataFreshnessChip";
import { formatFreshnessLabel } from "../lib/freshness";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [heroBannerError, setHeroBannerError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [clockTick, setClockTick] = useState(0);
  const [predCount, setPredCount] = useState<number | null>(null);
  const [zonesCount, setZonesCount] = useState<number | null>(null);
  const favClub = localStorage.getItem("mtaani_fav_club") || "";

  // Data Hooks
  const { data: liveMatches = [], isLoading: isLoadingMatches } = useMatches();
  const { data: upcomingFixtures = [], isLoading: isLoadingUpcoming } = useUpcomingFixtures();
  const { data: recentMatches = [], isLoading: isLoadingRecent } = useRecentMatches();
  const { data: debates = [] } = useDebates();
  const { data: leaderboard = [] } = useLeaderboard();

  useEffect(() => {
    if (liveMatches.length || upcomingFixtures.length || recentMatches.length) {
      setLastUpdated(new Date());
    }
  }, [liveMatches, upcomingFixtures, recentMatches]);

  useEffect(() => {

    if (supabase) {
      supabase.from("predictions").select("*", { count: "exact", head: true }).then(({ count }) => {
        if (count !== null) setPredCount(count);
      });
      supabase.from("fan_zones").select("*", { count: "exact", head: true }).then(({ count }) => {
        if (count !== null) setZonesCount(count);
      });
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((t) => t + 1), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const freshnessLabelSafe = useMemo(() => formatFreshnessLabel(lastUpdated), [lastUpdated, clockTick]);

  // Highlight the best match: live first, then upcoming
  const featuredMatch = liveMatches[0] || upcomingFixtures[0] || null;
  const isMatchLive = !!liveMatches[0];
  const pulseMatches = [...liveMatches, ...upcomingFixtures].slice(0, 3);
  const wc26Days = Math.ceil((new Date("2026-06-11").getTime() - Date.now()) / 86400000);
  const pulseStats = [
    {
      label: wc26Days > 0 ? "Days to WC26" : "WC26 Status",
      value: wc26Days > 0 ? String(wc26Days) : "Live",
    },
    {
      label: "Calls locked",
      value: predCount !== null ? predCount.toLocaleString() : "--",
    },
    {
      label: "Fan rooms",
      value: zonesCount !== null ? String(zonesCount) : "--",
    },
  ];

  const getPulseSplit = (match: any, index: number) => {
    const seed = (match.home?.length || 6) * 7 + (match.away?.length || 5) * 3 + index * 11;
    const home = 42 + (seed % 25);
    const away = 100 - home;
    return { home, away };
  };

  return (
    <div className="pb-12">
      <SEO 
        title="BallMtaani Home | Kenyan Football Fans, Scores and Banter"
        description="The BallMtaani home feed brings Kenyan football fans live matches, latest news, predictions, debates, fan rooms and matchday receipts."
        keywords={[
          "BallMtaani home",
          "Kenyan football fans",
          "football news Kenya",
          "live football matches",
          "football banter Kenya",
        ]}
        path="/home"
        breadcrumbs={[
          { name: "BallMtaani", url: "/" },
          { name: "Home", url: "/home" },
        ]}
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO SECTION
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative w-full overflow-hidden border-b border-white/10" style={{ minHeight: 500 }}>
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80"
          alt="Football stadium"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; setHeroBannerError(true); }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-primary/25 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-14 md:flex-row md:items-end md:py-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Kenyan Football Intelligence</span>
              </div>
              {favClub && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
                  <span className="text-xs text-white/50 font-semibold">Your side:</span>
                  <span className="text-xs font-black text-white">{favClub}</span>
                </div>
              )}
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-[0.95] tracking-tight md:text-6xl">
              Call It Right.<br/>
              <span className="text-primary">Back It With Data.</span><br/>
              Keep Receipts.
            </h1>
            <p className="mb-10 max-w-xl text-base leading-relaxed text-gray-300">
              Live context, smarter fan calls, and real football timelines in one place. No noise, just matchday truth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/predictions" className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-black shadow-xl">
                Make Your Call
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/matches" className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white">
                Open Data Center
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full md:w-[380px]"
          >
            <AnimatePresence mode="wait">
              {featuredMatch ? (
                <motion.div
                  key={featuredMatch.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/12 bg-[#0e141d]/88 p-6 backdrop-blur-2xl"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isMatchLive ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        {isMatchLive ? 'Live Now' : 'Featured'}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">{featuredMatch.league}</span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8">
                    <div className="flex flex-col items-center gap-3">
                      <TeamLogo logo={featuredMatch.homeLogo || CLUB_LOGOS[featuredMatch.home]} initial={featuredMatch.homeInitial} color={featuredMatch.homeColor} size="xl" />
                      <span className="font-black text-xs uppercase text-center leading-tight">{featuredMatch.home}</span>
                    </div>
                    <div className="text-center">
                      {isMatchLive ? (
                        <div className="flex flex-col items-center">
                          <div className="mb-1 text-3xl font-bold">{featuredMatch.homeScore} : {featuredMatch.awayScore}</div>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{featuredMatch.minute}</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-gray-600">VS</div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <TeamLogo logo={featuredMatch.awayLogo || CLUB_LOGOS[featuredMatch.away]} initial={featuredMatch.awayInitial} color={featuredMatch.awayColor} size="xl" />
                      <span className="font-black text-xs uppercase text-center leading-tight">{featuredMatch.away}</span>
                    </div>
                  </div>

                  <Link href={isMatchLive ? `/live-center/${featuredMatch.id}` : "/predictions"} className="block w-full rounded-xl bg-white py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-black">
                    {isMatchLive ? 'Join Live Center' : 'Make Call'}
                  </Link>
                </motion.div>
              ) : (
                <div className="rounded-3xl bg-black/40 border border-white/10 p-10 text-center">
                  <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No Matches scheduled</p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* AD SECTION */}
      <section className="py-6 border-b border-[#1B1B1B] bg-[#0B0B0B]">
        <div className="max-w-6xl mx-auto px-4">
          <AdBanner label="Featured Partner" type="horizontal" />
        </div>
      </section>

      {/* KENYAN FAN PULSE */}
      <section className="border-b border-[#1B1B1B] bg-[#050505] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Radio className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFD700]">Kenya Fan Pulse</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Who Are Kenyans Backing?
              </h2>
              <DataFreshnessChip label={freshnessLabelSafe} className="mt-2" />
              <p className="text-gray-400 text-sm md:text-base mt-3 max-w-2xl">
                Public matchday sentiment from BallMtaani rooms. Make your call, then come back for the receipt.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              {pulseStats.map(stat => (
                <div key={stat.label} className="min-w-0 rounded-xl border border-white/8 bg-[#0f141c] p-4 text-center">
                  <div className="text-xl font-bold text-white md:text-2xl">{stat.value}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-gray-500 md:text-[10px]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(pulseMatches.length ? pulseMatches : upcomingFixtures.slice(0, 3)).map((match: any, index: number) => {
              const split = getPulseSplit(match, index);
              const isLive = liveMatches.some((live: any) => live.id === match.id);

              return (
                <div key={match.id || `${match.home}-${match.away}`} className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[70px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${isLive ? "bg-primary/15 text-primary" : "bg-[#FFD700]/10 text-[#FFD700]"}`}>
                        {isLive ? "Live pulse" : "Next up"}
                      </span>
                      <span className="ml-3 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">{match.league}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="min-w-0">
                        <p className="font-black text-white text-sm truncate">{match.home}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase text-gray-500">{split.home}% Kenya lean</p>
                      </div>
                      <div className="text-gray-600 font-black text-xs shrink-0">VS</div>
                      <div className="min-w-0 text-right">
                        <p className="font-black text-white text-sm truncate">{match.away}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase text-gray-500">{split.away}% Kenya lean</p>
                      </div>
                    </div>

                    <div className="h-3 bg-black rounded-full overflow-hidden border border-white/5 mb-5">
                      <div className="h-full bg-gradient-to-r from-primary to-[#FFD700]" style={{ width: `${split.home}%` }} />
                    </div>

                    <div className="flex gap-2">
                      <Link href="/predictions" className="flex-1 rounded-xl bg-white py-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-black">
                        Make Call
                      </Link>
                      <Link href="/fan-zones" aria-label={`Open fan zones for ${match.home} vs ${match.away}`} className="w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white">
                        <Share2 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MATCH HUB */}
      <section className="border-b border-[#1B1B1B] bg-[#0B0B0B] py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="border-l-4 border-primary pl-4 text-2xl font-bold tracking-[0.02em] text-white">Match Hub</h2>
              <p className="ml-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">Live Scores | Results | Upcoming</p>
              <DataFreshnessChip label={freshnessLabelSafe} className="ml-4 mt-1 text-white/50" />
            </div>
            <Link href="/matches" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              Directory <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
            {isLoadingMatches || isLoadingUpcoming || isLoadingRecent ? (
              [1, 2, 3].map(i => <SkeletonMatch key={i} />)
            ) : (
              <>
                {liveMatches.map((m: any) => <PremiumMatchCard key={m.id} match={{ ...m, status: 'LIVE' }} />)}
                {upcomingFixtures.slice(0, 5).map((m: any) => <PremiumMatchCard key={m.id} match={m} />)}
                {recentMatches.slice(0, 5).map((m: any) => <PremiumMatchCard key={m.id} match={{ ...m, status: 'FT' }} />)}
              </>
            )}
          </div>
        </div>
      </section>

      {/* KPL section removed — API-Football league ID 686 returns Czech clubs, not Kenya Premier League. Restore when correct ID is confirmed. */}

      {/* NEWS FEED */}
      <NewsFeed />
      <section className="py-6 border-b border-[#1B1B1B] bg-[#0B0B0B]">
        <div className="max-w-6xl mx-auto px-4">
          <AdBanner label="Matchday Partner" type="horizontal" />
        </div>
      </section>

      {/* ARCADE */}
      <section className="py-16 bg-[#0B0B0B] border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-10">The <span className="text-[#FFD700]">Arcade</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/war-room" className="group p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-green-500/50 transition-all">
              <ShieldCheck className="w-12 h-12 text-green-400 mb-6" />
              <h3 className="text-2xl font-black uppercase mb-3">War Room</h3>
              <p className="text-gray-500 text-sm mb-6">Offseason daily loop: transfer rumors, lineup builds, and receipts.</p>
              <span className="text-green-400 font-black uppercase text-[10px] tracking-widest">Enter War Room</span>
            </Link>
            <Link href="/rapid-fire" className="group p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-blue-500/50 transition-all">
              <Zap className="w-12 h-12 text-[#1E6FFF] mb-6" />
              <h3 className="text-2xl font-black uppercase mb-3">Rapid Fire</h3>
              <p className="text-gray-500 text-sm mb-6">Vote on heated football debates and see where fans stand.</p>
              <span className="text-[#1E6FFF] font-black uppercase text-[10px] tracking-widest">Play Now</span>
            </Link>
            <Link href="/trivia" className="group p-8 rounded-3xl bg-[#111] border border-[#FFD700]/20 hover:border-[#FFD700]/50 transition-all">
              <Trophy className="w-12 h-12 text-[#FFD700] mb-6" />
              <h3 className="text-2xl font-black uppercase mb-3 text-[#FFD700]">Millionaire</h3>
              <p className="text-gray-500 text-sm mb-6">Test your football knowledge and climb the weekly table.</p>
              <span className="text-[#FFD700] font-black uppercase text-[10px] tracking-widest">Play Trivia</span>
            </Link>
            <Link href="/predictions" className="group p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-red-500/50 transition-all">
              <Sparkles className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-black uppercase mb-3">Fan Intel</h3>
              <p className="text-gray-500 text-sm mb-6">Read the match, make your call, and stack receipts.</p>
              <span className="text-primary font-black uppercase text-[10px] tracking-widest">Make Your Call</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="py-16 bg-[#050505] border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-6">Keep The <span className="text-primary">Receipt.</span></h2>
            <p className="text-gray-400 font-bold md:text-lg mb-8">Challenge rival fans to free scoreline duels and come back after full time.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/rivalries" className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg">Start Fan Duel</Link>
              <Link href="/debates" className="px-8 py-4 bg-white/5 border border-white/20 text-white font-black uppercase tracking-widest rounded-xl">Join Debates</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#111] border border-white/10">
              <Users className="w-8 h-8 text-[#FFD700] mb-4" />
              <h3 className="text-lg font-black uppercase mb-2">Fan Zones</h3>
              <p className="text-gray-500 text-xs mb-4">Elite communities for die-hard supporters.</p>
              <Link href="/fan-zones" className="text-[10px] font-black uppercase text-[#FFD700]">Explore Zones</Link>
            </div>
            <div className="p-6 rounded-2xl bg-[#111] border border-white/10 mt-0 sm:mt-10">
              <MessageSquare className="w-8 h-8 text-[#1E6FFF] mb-4" />
              <h3 className="text-lg font-black uppercase mb-2">Mtaani Banter</h3>
              <p className="text-gray-500 text-xs mb-4">Kenyan fan rooms for matchday takes, receipts, and banter.</p>
              <Link href="/live-center" className="text-[10px] font-black uppercase text-[#1E6FFF]">Join Feed</Link>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="py-16 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Trophy className="w-12 h-12 text-[#FFD700] mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase mb-8">Hall of <span className="text-[#FFD700]">Fame</span></h2>
          <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden text-left mb-8 shadow-2xl">
            {leaderboard.slice(0, 3).map((p: any) => (
              <div key={p.rank} className="flex items-center justify-between p-6 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-6">
                  <span className={`text-2xl font-black ${p.rank === 1 ? 'text-[#FFD700]' : 'text-gray-500'}`}>#{p.rank}</span>
                  <div className="flex flex-col">
                    <span className="font-black text-lg text-white">{p.name} {p.country}</span>
                    <span className="text-[10px] uppercase font-black text-primary tracking-widest">Level {p.streak || 1} Elite Host</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-[#FFD700]">{p.pts} pts</span>
              </div>
            ))}
          </div>
          <Link href="/leaderboard" className="text-xs font-black uppercase tracking-widest py-4 px-10 rounded-full border border-white/10 hover:bg-white/5 transition-all">Full Leaderboard</Link>
        </div>
      </section>
      <FloatingMchambuzi variant="home" />
    </div>
  );
}

