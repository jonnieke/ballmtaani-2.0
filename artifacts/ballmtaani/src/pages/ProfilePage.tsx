import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useData";
import { supabase } from "../lib/supabase";

import { LogOut, Trophy, Settings, Flame, Target, Sword, Loader2, Activity, UserPlus, Check } from "lucide-react";
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
  const { isLoggedIn, user, username, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"calls" | "debates" | "badges">("calls");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [predStats, setPredStats] = useState<{ total: number; correct: number } | null>(null);

  const targetId = profileId || user?.id;
  const isOwnProfile = !profileId || profileId === user?.id;

  const { data: profile, isLoading } = useProfile(targetId);


  useEffect(() => {
    if (!isLoggedIn && !profileId && !isLoading) {
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation('/login');
    }
  }, [isLoggedIn, profileId, isLoading, setLocation]);

  // Fetch real prediction stats for this profile
  useEffect(() => {
    if (!targetId || !supabase) return;
    supabase
      .from("predictions")
      .select("result")
      .eq("user_id", targetId)
      .then(({ data }) => {
        if (!data) return;
        const correct = data.filter((p) => p.result === "correct" || p.result === "partial").length;
        setPredStats({ total: data.length, correct });
      })
      .catch(() => {});
  }, [targetId]);

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
              onChallenge={() => {
                setShowChallengeModal(false);
                setChallengeSent(true);
                setTimeout(() => setChallengeSent(false), 5000);
              }}
            />
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
          <div className="text-center">
            <span className="block text-3xl font-black text-[#FFD700]">{points}</span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Points</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-black text-white">
              {predStats ? predStats.total : <span className="text-gray-600">--</span>}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Calls</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-black text-green-500">
              {predStats ? predStats.correct : <span className="text-gray-600">--</span>}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Correct</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-black text-primary flex items-center justify-center gap-1">
              {streak} <Flame className="w-5 h-5" />
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Current Streak</span>
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
          { id: "calls", label: "Receipts" },
          { id: "debates", label: "My Debates" },
          { id: "badges", label: "Badges" }
        ].map(tab => (
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
