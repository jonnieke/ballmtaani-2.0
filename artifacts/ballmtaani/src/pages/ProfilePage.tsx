import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile, useMatches } from "../hooks/useData";
import { supabase } from "../lib/supabase";

import { LogOut, Trophy, Settings, Flame, Target, Sword, Loader2, Activity, UserPlus, Check, Coins, Package, Swords } from "lucide-react";
import { UserBadge } from "../components/UserBadge";
import { getUserTier } from "../lib/tiers";
import { useRoute, useLocation, Link } from "wouter";
import { ChallengeModal } from "../components/ChallengeModal";
import { InviteWidget } from "../components/InviteWidget";
import { EditProfileModal } from "../components/EditProfileModal";

export default function ProfilePage() {
  const [match, params] = useRoute("/profile/:id");
  const [, setLocation] = useLocation();
  const profileId = params?.id;
  const { isLoggedIn, user, username, logout, coins } = useAuth();
  const [activeTab, setActiveTab] = useState<"calls" | "debates" | "badges" | "duels" | "rewards">("calls");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [predStats, setPredStats] = useState<{ total: number; correct: number } | null>(null);
  const [duels, setDuels] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);

  const targetId = profileId || user?.id;
  const isOwnProfile = !profileId || profileId === user?.id;

  const { data: profile, isLoading } = useProfile(targetId);
  const { data: liveMatches = [] } = useMatches();
  const matchLookup = useMemo(() => {
    const map: Record<string, { home: string; away: string }> = {};
    (liveMatches as any[]).forEach((m) => { map[String(m.id)] = { home: m.home, away: m.away }; });
    return map;
  }, [liveMatches]);


  useEffect(() => {
    if (!isLoggedIn && !profileId && !isLoading) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation('/login');
    }
  }, [isLoggedIn, profileId, isLoading, setLocation]);

  // Fetch real prediction stats for this profile
  useEffect(() => {
    if (!targetId || !supabase) return;
    supabase.from("predictions").select("result").eq("user_id", targetId)
      .then(({ data }) => {
        if (!data) return;
        const correct = data.filter((p) => p.result === "correct" || p.result === "partial").length;
        setPredStats({ total: data.length, correct });
      });
  }, [targetId]);

  // Fetch duels and redemptions for own profile
  useEffect(() => {
    if (!isOwnProfile || !user || !supabase) return;
    supabase.from("fan_duels").select("*").or(`challenger_name.eq.${username},defender_name.eq.${username}`).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { setDuels(data || []); });
    supabase.from("reward_redemptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { setRedemptions(data || []); });
  }, [isOwnProfile, user, username]);

  if (!isLoggedIn && !profileId) {
    return null; // or a loader
  }

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  const displayUsername = profile?.username || username || "Fan";
  const points = profile?.points || 0;
  const streak = profile?.streak || 0;
  const country = profile?.country || "Kenya";
  const interactions = profile?.interactions || 0;
  const tier = getUserTier(interactions);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Profile Header */}
      <div className="bg-[#1B1B1B] rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary via-[#FFD700] to-accent"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0B0B0B] border-4 border-primary flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-[0_0_20px_rgba(179,0,0,0.4)] shrink-0">
            {displayUsername.substring(0, 2).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-widest uppercase mb-1">{displayUsername}</h1>
            <p className="text-[#FFD700] font-bold text-sm tracking-wider uppercase mb-4">@{displayUsername.toLowerCase()} - {country}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded">
                {profile?.created_at
                  ? "Joined " + new Date(profile.created_at).toLocaleDateString("en-KE", { month: "short", year: "numeric" })
                  : "BallMtaani Fan"}
              </span>
              <UserBadge interactions={interactions} className="px-3 py-1.5 text-xs" />
            </div>

            {/* Next Rank Progress Bar */}
            {tier.nextThreshold && (
              <div className="mt-5 w-full max-w-sm mx-auto md:mx-0">
                <div className="flex justify-between items-center text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1.5">
                  <span>{interactions} / {tier.nextThreshold} Interactions</span>
                  <span className="text-[#FFD700]">Next Rank</span>
                </div>
                <div className="h-2 bg-black/50 border border-white/10 rounded-full overflow-hidden shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${tier.color.split(' ')[0]} bg-opacity-100`}
                    style={{ width: `${Math.min(100, (interactions / tier.nextThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {isOwnProfile ? (
            <div className="flex flex-col gap-2 md:self-start">
              <button 
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 uppercase tracking-wider transition-colors px-3 py-2 rounded"
              >
                  <Settings className="w-4 h-4" /> Edit Profile
              </button>
              <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors border border-transparent hover:border-white/10 px-3 py-2 rounded"
              >
                  <LogOut className="w-4 h-4" /> Log Out
              </button>
              <Link href="/diagnostics">
                <button className="flex items-center gap-2 text-[10px] font-bold text-primary hover:text-white uppercase tracking-wider transition-colors border border-primary/20 hover:border-primary/50 px-3 py-1.5 rounded bg-primary/5">
                  <Activity className="w-3 h-3" /> Service Status
                </button>
              </Link>
            </div>
          ) : (
            <button 
                onClick={() => setShowChallengeModal(true)}
                className="flex items-center gap-2 text-xs font-black bg-primary hover:bg-red-700 text-white uppercase tracking-widest transition-all md:self-start border border-white/10 px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(179,0,0,0.3)] active:scale-95"
            >
                <Sword className="w-4 h-4" /> Challenge to Duel
            </button>
          )}

          {challengeSent && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-bold text-green-400 uppercase tracking-widest md:self-start">
              <Check className="w-3.5 h-3.5" /> Duel sent to {displayUsername}
            </div>
          )}

          {showChallengeModal && (
            <ChallengeModal
              rivalName={displayUsername}
              rivalId={targetId!}
              onClose={() => setShowChallengeModal(false)}
              onChallenge={async (matchId, prediction, bragLine) => {
                const match = matchLookup[String(matchId)];
                if (supabase && isLoggedIn) {
                  try {
                    await supabase.from("fan_duels").insert({
                      challenger_name: username,
                      defender_name: displayUsername,
                      home_team: match?.home || "Match TBD",
                      away_team: match?.away || "",
                      prediction,
                      brag_line: bragLine,
                      status: "pending",
                    });
                  } catch { /* ignore insert errors */ }
                  let dp: { id: string } | null = null;
                  try {
                    const res = await supabase.from("profiles").select("id").eq("username", displayUsername).maybeSingle();
                    dp = res.data;
                  } catch { /* ignore */ }
                  if (dp?.id) {
                    fetch("/api/push-send", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: dp.id,
                        title: `⚔️ ${username} just challenged you!`,
                        body: `${match?.home || "TBD"} vs ${match?.away || ""} · ${prediction} — Accept on BallMtaani.`,
                        url: "/rivalries",
                        tag: `duel-challenge-${dp.id}-${Date.now()}`,
                      }),
                    }).catch(() => {});
                  }
                }
                setShowChallengeModal(false);
                setChallengeSent(true);
                setTimeout(() => setChallengeSent(false), 5000);
              }}
            />
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8 pt-8 border-t border-white/5">
          {isOwnProfile && (
            <Link href="/store" className="group text-center rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/6 p-3 transition-all hover:bg-[#FFD700]/12">
              <span className="block text-2xl font-black text-[#FFD700]">{coins.toLocaleString()}</span>
              <span className="text-[9px] text-[#FFD700]/60 uppercase font-bold tracking-widest">MTC Balance</span>
            </Link>
          )}
          <div className="text-center">
            <span className="block text-2xl font-black text-white">
              {predStats ? predStats.total : <span className="text-gray-600">--</span>}
            </span>
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Calls</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-green-500">
              {predStats ? predStats.correct : <span className="text-gray-600">--</span>}
            </span>
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Correct</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-primary">{streak}</span>
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Streak 🔥</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-[#FFD700]">{points}</span>
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Points</span>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal 
          currentUsername={displayUsername}
          currentClub={profile?.favorite_team || ""}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            // Profile refetch happens automatically since query invalidation or manual refresh could be done.
            // For now, reload window to reflect changes globally in contexts if needed, or rely on React Query refetch
            window.location.reload();
          }}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6 overflow-x-auto hide-scrollbar">
        {[
          { id: "calls",   label: "Receipts" },
          { id: "debates", label: "Debates" },
          { id: "duels",   label: "Duels",   own: true },
          { id: "rewards", label: "Rewards",  own: true },
          { id: "badges",  label: "Badges" },
        ].filter(t => !t.own || isOwnProfile).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 font-black uppercase tracking-widest text-sm whitespace-nowrap transition-colors relative
              ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "calls" && (
          <div className="space-y-4">
            {predStats && predStats.total > 0 ? (
              <div className="bg-[#1B1B1B] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-black text-lg">{predStats.total} calls made</p>
                    <p className="text-green-400 text-sm font-bold">{predStats.correct} correct or right result</p>
                  </div>
                  <span className="text-2xl font-black text-[#FFD700]">
                    {predStats.total > 0 ? Math.round((predStats.correct / predStats.total) * 100) : 0}%
                  </span>
                </div>
                <Link
                  href="/predictions"
                  className="block w-full text-center rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                >
                  View Full Receipt Book
                </Link>
              </div>
            ) : (
              <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-6 text-center">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4">No calls locked yet</p>
                <Link
                  href="/predictions"
                  className="inline-block rounded-xl bg-[#FFD700] px-6 py-3 text-xs font-black uppercase tracking-widest text-black"
                >
                  Make Your First Call
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "debates" && (
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#1B1B1B] border border-white/5 rounded-xl p-5 opacity-50">
              <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">No debates joined yet</div>
            </div>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0B0B0B] border border-white/5 rounded-xl p-6 flex flex-col items-center text-center opacity-50 grayscale">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h4 className="font-black uppercase text-sm text-white mb-1">Sharpshooter</h4>
              <p className="text-[10px] text-gray-400 uppercase">Locked</p>
            </div>
            
            <div className="bg-[#0B0B0B] border border-white/5 rounded-xl p-6 flex flex-col items-center text-center opacity-50 grayscale">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
                <Flame className="w-8 h-8" />
              </div>
              <h4 className="font-black uppercase text-sm text-white mb-1">On Fire</h4>
              <p className="text-[10px] text-gray-400 uppercase">Locked</p>
            </div>
          </div>
        )}
      </div>

        {activeTab === "duels" && (
          <div className="space-y-3">
            {duels.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-[#111] p-8 text-center">
                <Swords className="mx-auto mb-3 h-8 w-8 text-white/15" />
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">No duels yet</p>
                <Link href="/rivalries" className="mt-3 inline-block rounded-xl bg-[#B30000] px-5 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
                  Issue a Challenge
                </Link>
              </div>
            ) : duels.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-[#111] px-4 py-3">
                <div>
                  <p className="text-sm font-black text-white">{d.challenger_name} <span className="text-white/25">vs</span> {d.defender_name}</p>
                  <p className="text-[10px] text-white/35">{d.home_team} vs {d.away_team} · {d.prediction}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${
                  d.status === "completed" ? "bg-[#FFD700]/15 text-[#FFD700]" :
                  d.status === "active"    ? "bg-[#B30000]/15 text-[#B30000]" :
                  "bg-white/8 text-white/30"}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-widest text-white/50">Your Redemptions</p>
              <Link href="/store" className="rounded-full border border-[#FFD700]/20 bg-[#FFD700]/8 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/70 hover:bg-[#FFD700]/15">
                Redeem More →
              </Link>
            </div>
            {redemptions.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-[#111] p-8 text-center">
                <Package className="mx-auto mb-3 h-8 w-8 text-white/15" />
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">No redemptions yet</p>
                <Link href="/store" className="mt-3 inline-block rounded-xl bg-[#FFD700] px-5 py-2 text-xs font-black uppercase tracking-widest text-black">
                  Browse Rewards
                </Link>
              </div>
            ) : redemptions.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-[#111] px-4 py-3">
                <div>
                  <p className="text-sm font-black text-white">{r.item_name}</p>
                  <p className="text-[10px] text-white/35">{r.cost_mtc.toLocaleString()} MTC · {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                  {r.admin_note && <p className="mt-0.5 text-[10px] text-blue-400/60">{r.admin_note}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${
                  r.status === "fulfilled"  ? "bg-green-500/15 text-green-400" :
                  r.status === "processing" ? "bg-blue-500/15 text-blue-400" :
                  r.status === "cancelled"  ? "bg-white/8 text-white/25" :
                  "bg-yellow-500/15 text-yellow-400"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}

      {/* Invite Friends */}
      {isOwnProfile && (
        <div className="mt-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invite Friends
          </h2>
          <InviteWidget />
        </div>
      )}
    </div>
  );
}
