import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Trophy, Users, MessageSquare, ChevronRight, Zap, Calendar, Sparkles, Radio, Share2 } from "lucide-react";
import { CLUB_LOGOS } from "../data/mockData";
import { useMatches, useUpcomingFixtures, useRecentMatches, useDebates, useLeaderboard } from "../hooks/useData";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import { SkeletonMatch } from "../components/Skeletons";
import PremiumMatchCard from "../components/PremiumMatchCard";
import SEO from "../components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import NewsFeed from "../components/NewsFeed";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [heroBannerError, setHeroBannerError] = useState(false);

  // Data Hooks
  const { data: liveMatches = [], isLoading: isLoadingMatches } = useMatches();
  const { data: upcomingFixtures = [], isLoading: isLoadingUpcoming } = useUpcomingFixtures();
  const { data: recentMatches = [], isLoading: isLoadingRecent } = useRecentMatches();
  const { data: debates = [] } = useDebates();
  const { data: leaderboard = [] } = useLeaderboard();

  // Highlight the best match: live first, then upcoming
  const featuredMatch = liveMatches[0] || upcomingFixtures[0] || null;
  const isMatchLive = !!liveMatches[0];
  const pulseMatches = [...liveMatches, ...upcomingFixtures].slice(0, 3);
  const pulseStats = [
    { label: "Fans active today", value: "18.4K" },
    { label: "Calls locked", value: "6.8K" },
    { label: "Club rooms moving", value: "42" },
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
        title="BallMtaani | Kenyan Fans, Big Match Banter"
        description="Kenyan football fans predict, debate, and banter around the biggest matches in EPL, UCL, AFCON, CAF, and local derbies."
      />

      {/* ═══════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80"
          alt="Football stadium"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; setHeroBannerError(true); }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-primary/25 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-primary font-black text-xs uppercase tracking-widest">Kenyan Fans. Big Match Energy.</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-6">
              Call It.<br/>
              <span className="text-primary">Argue It.</span><br/>
              Keep Receipts.
            </h1>
            <p className="text-gray-300 text-base mb-10 max-w-md leading-relaxed">
              Call the biggest fixtures, see where Kenyan fans stand, and keep receipts for every matchday argument.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/predictions" className="bg-[#FFD700] text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl flex items-center gap-2 text-sm">
                Make Your Call
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/debates" className="bg-white/5 border border-white/20 text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl text-sm">
                Explore Community
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
                  className="rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 p-6 relative group overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isMatchLive ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                      <span className="text-white font-black text-[10px] uppercase bg-white/10 px-2 py-0.5 rounded">
                        {isMatchLive ? 'Live Now' : 'Featured'}
                      </span>
                    </div>
                    <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{featuredMatch.league}</span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8">
                    <div className="flex flex-col items-center gap-3">
                      <TeamLogo logo={featuredMatch.homeLogo || CLUB_LOGOS[featuredMatch.home]} initial={featuredMatch.homeInitial} color={featuredMatch.homeColor} size="xl" />
                      <span className="font-black text-xs uppercase text-center leading-tight">{featuredMatch.home}</span>
                    </div>
                    <div className="text-center">
                      {isMatchLive ? (
                        <div className="flex flex-col items-center">
                          <div className="text-3xl font-black mb-1">{featuredMatch.homeScore} : {featuredMatch.awayScore}</div>
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{featuredMatch.minute}</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-black text-gray-600">VS</div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <TeamLogo logo={featuredMatch.awayLogo || CLUB_LOGOS[featuredMatch.away]} initial={featuredMatch.awayInitial} color={featuredMatch.awayColor} size="xl" />
                      <span className="font-black text-xs uppercase text-center leading-tight">{featuredMatch.away}</span>
                    </div>
                  </div>

                  <Link href={isMatchLive ? `/live-center/${featuredMatch.id}` : "/predictions"} className="block w-full text-center bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl text-sm">
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
      <section className="py-14 bg-[#050505] border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4">
                <Radio className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.2em]">Kenya Fan Pulse</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                Who Are Kenyans Backing?
              </h2>
              <p className="text-gray-400 text-sm md:text-base mt-3 max-w-2xl">
                Public matchday sentiment from BallMtaani rooms. Make your call, then come back for the receipt.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              {pulseStats.map(stat => (
                <div key={stat.label} className="bg-[#111] border border-white/5 rounded-xl p-4 text-center min-w-0">
                  <div className="text-xl md:text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest leading-tight mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(pulseMatches.length ? pulseMatches : upcomingFixtures.slice(0, 3)).map((match: any, index: number) => {
              const split = getPulseSplit(match, index);
              const isLive = liveMatches.some((live: any) => live.id === match.id);

              return (
                <div key={match.id || `${match.home}-${match.away}`} className="bg-[#111] border border-white/10 rounded-2xl p-5 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[70px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${isLive ? "bg-primary/15 text-primary" : "bg-[#FFD700]/10 text-[#FFD700]"}`}>
                        {isLive ? "Live pulse" : "Next up"}
                      </span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate ml-3">{match.league}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="min-w-0">
                        <p className="font-black text-white text-sm truncate">{match.home}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">{split.home}% Kenya lean</p>
                      </div>
                      <div className="text-gray-600 font-black text-xs shrink-0">VS</div>
                      <div className="min-w-0 text-right">
                        <p className="font-black text-white text-sm truncate">{match.away}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">{split.away}% Kenya lean</p>
                      </div>
                    </div>

                    <div className="h-3 bg-black rounded-full overflow-hidden border border-white/5 mb-5">
                      <div className="h-full bg-gradient-to-r from-primary to-[#FFD700]" style={{ width: `${split.home}%` }} />
                    </div>

                    <div className="flex gap-2">
                      <Link href="/predictions" className="flex-1 text-center bg-white text-black rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">
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
      <section className="py-16 bg-[#0B0B0B] border-b border-[#1B1B1B]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white border-l-4 border-primary pl-4">Match Hub</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-4">Live Scores • Results • Upcoming</p>
            </div>
            <Link href="/matches" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
