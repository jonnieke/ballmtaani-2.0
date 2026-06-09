import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AdminLayout from "../components/AdminLayout";
import { Users, TrendingUp, MessageSquare, Trophy, Coins, Gift, FileText, Swords } from "lucide-react";

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalPredictions: number;
  totalComments: number;
  totalLikes: number;
  totalDuels: number;
  totalArticles: number;
  publishedArticles: number;
  totalRedemptions: number;
  pendingRedemptions: number;
  totalMTCRedeemed: number;
}

interface TopEarner { display_name: string; coins: number; id: string; }

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-white/6 bg-[#0d1018] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <p className={`text-2xl font-black ${color}`}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="mt-0.5 text-[9px] text-white/25">{sub}</p>}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topEarners, setTopEarners] = useState<TopEarner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    const today = new Date(); today.setHours(0,0,0,0);
    const weekAgo = new Date(Date.now() - 7*86400000);

    Promise.all([
      supabase.from("profiles").select("id, created_at, coins, display_name").order("coins", { ascending: false }),
      supabase.from("predictions").select("id", { count: "exact", head: true }),
      supabase.from("article_comments").select("id", { count: "exact", head: true }),
      supabase.from("article_reactions").select("id", { count: "exact", head: true }),
      supabase.from("fan_duels").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id, status"),
      supabase.from("reward_redemptions").select("id, status, cost_mtc"),
    ]).then(([profiles, preds, comments, likes, duels, articles, redemptions]) => {
      const p = (profiles.data || []) as any[];
      const today0 = today.getTime();
      const week0 = weekAgo.getTime();
      const artData = (articles.data || []) as any[];
      const redData = (redemptions.data || []) as any[];

      setStats({
        totalUsers: p.length,
        newUsersToday: p.filter(u => new Date(u.created_at).getTime() >= today0).length,
        newUsersWeek: p.filter(u => new Date(u.created_at).getTime() >= week0).length,
        totalPredictions: preds.count ?? 0,
        totalComments: comments.count ?? 0,
        totalLikes: likes.count ?? 0,
        totalDuels: duels.count ?? 0,
        totalArticles: artData.length,
        publishedArticles: artData.filter(a => a.status === "published").length,
        totalRedemptions: redData.length,
        pendingRedemptions: redData.filter(r => r.status === "pending").length,
        totalMTCRedeemed: redData.reduce((s: number, r: any) => s + (r.cost_mtc || 0), 0),
      });
      setTopEarners(p.filter(u => u.coins > 0).slice(0, 10).map((u: any) => ({ id: u.id, display_name: u.display_name || "Fan", coins: u.coins })));
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest text-white">Analytics</h1>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">Platform overview</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />)}</div>
        ) : stats && (
          <>
            {/* Users */}
            <div>
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">👥 Users</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Total Fans" value={stats.totalUsers} icon={Users} color="text-white" />
                <StatCard label="Joined Today" value={stats.newUsersToday} icon={Users} color="text-green-400" />
                <StatCard label="Joined This Week" value={stats.newUsersWeek} sub="last 7 days" icon={TrendingUp} color="text-blue-400" />
              </div>
            </div>

            {/* Engagement */}
            <div>
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">⚡ Engagement</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Predictions" value={stats.totalPredictions} icon={Trophy} color="text-[#FFD700]" />
                <StatCard label="Comments" value={stats.totalComments} icon={MessageSquare} color="text-purple-400" />
                <StatCard label="Likes" value={stats.totalLikes} icon={TrendingUp} color="text-[#B30000]" />
                <StatCard label="Fan Duels" value={stats.totalDuels} icon={Swords} color="text-orange-400" />
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">📝 Content</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Total Articles" value={stats.totalArticles} icon={FileText} color="text-white" />
                <StatCard label="Published" value={stats.publishedArticles} icon={FileText} color="text-green-400" />
                <StatCard label="Drafts" value={stats.totalArticles - stats.publishedArticles} icon={FileText} color="text-white/30" />
              </div>
            </div>

            {/* Rewards */}
            <div>
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">🎁 Rewards</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Total Redemptions" value={stats.totalRedemptions} icon={Gift} color="text-[#FFD700]" />
                <StatCard label="Pending" value={stats.pendingRedemptions} sub="need fulfilling" icon={Gift} color="text-yellow-400" />
                <StatCard label="MTC Redeemed" value={`${(stats.totalMTCRedeemed / 1000).toFixed(1)}k`} icon={Coins} color="text-[#FFD700]" />
              </div>
            </div>

            {/* Top earners */}
            {topEarners.length > 0 && (
              <div>
                <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">🏆 Top MTC Earners</p>
                <div className="rounded-xl border border-white/6 bg-[#0d1018] overflow-hidden">
                  {topEarners.map((u, i) => (
                    <div key={u.id} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${i === 0 ? "bg-[#FFD700] text-black" : i === 1 ? "bg-white/20 text-white" : i === 2 ? "bg-orange-600/50 text-orange-200" : "bg-white/6 text-white/30"}`}>{i + 1}</span>
                      <p className="flex-1 text-sm font-bold text-white">{u.display_name}</p>
                      <span className="font-black text-[#FFD700]">{u.coins.toLocaleString()} MTC</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
