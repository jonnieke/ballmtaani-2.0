import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import AdminLayout from "../components/AdminLayout";
import { FileText, Megaphone, Users, ChevronRight, TrendingUp, Eye } from "lucide-react";

interface Stats {
  publishedArticles: number;
  draftArticles: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  approvedPartners: number;
  pendingPartners: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("articles").select("status", { count: "exact" }),
      supabase.from("ad_campaigns").select("status, impressions, clicks"),
      supabase.from("partner_teams").select("approved"),
    ]).then(([articlesRes, adsRes, partnersRes]) => {
      const articles = articlesRes.data || [];
      const ads = adsRes.data || [];
      const partners = partnersRes.data || [];

      setStats({
        publishedArticles: articles.filter((a: any) => a.status === "published").length,
        draftArticles: articles.filter((a: any) => a.status === "draft").length,
        activeAds: ads.filter((a: any) => a.status === "active").length,
        totalImpressions: ads.reduce((sum: number, a: any) => sum + (a.impressions || 0), 0),
        totalClicks: ads.reduce((sum: number, a: any) => sum + (a.clicks || 0), 0),
        approvedPartners: partners.filter((p: any) => p.approved).length,
        pendingPartners: partners.filter((p: any) => !p.approved).length,
      });
    });
  }, []);

  const ctr = stats && stats.totalImpressions > 0
    ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(1)
    : "0.0";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest text-white">Dashboard</h1>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">BallMtaani Admin</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Published" value={stats?.publishedArticles ?? "—"} sub={`${stats?.draftArticles ?? 0} drafts`} color="text-green-400" icon={FileText} />
          <StatCard label="Active Ads" value={stats?.activeAds ?? "—"} sub={`${stats?.totalImpressions?.toLocaleString() ?? 0} impressions`} color="text-[#FFD700]" icon={Megaphone} />
          <StatCard label="Ad CTR" value={`${ctr}%`} sub={`${stats?.totalClicks ?? 0} clicks`} color="text-blue-400" icon={TrendingUp} />
          <StatCard label="Partners" value={stats?.approvedPartners ?? "—"} sub={`${stats?.pendingPartners ?? 0} pending`} color="text-purple-400" icon={Users} />
          <StatCard label="Impressions" value={stats?.totalImpressions?.toLocaleString() ?? "—"} sub="all campaigns" color="text-orange-400" icon={Eye} />
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Quick Actions</p>
          {[
            { href: "/admin/articles", label: "Write New Article", sub: "Partner content for the homepage", color: "border-[#B30000]/20 hover:border-[#B30000]/40" },
            { href: "/admin/ads", label: "Create Ad Campaign", sub: "Direct sponsor banners replacing AdSense", color: "border-[#FFD700]/15 hover:border-[#FFD700]/35" },
            { href: "/admin/partners", label: "Manage Partners", sub: "Approve teams to publish articles", color: "border-purple-500/15 hover:border-purple-500/35" },
          ].map(({ href, label, sub, color }) => (
            <Link key={href} href={href}
              className={`flex items-center justify-between rounded-xl border bg-[#0d1018] px-4 py-3.5 transition-all ${color}`}>
              <div>
                <p className="text-sm font-black text-white">{label}</p>
                <p className="mt-0.5 text-[10px] text-white/35">{sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20" />
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string | number; sub: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/6 bg-[#0d1018] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="mt-0.5 text-[9px] text-white/25">{sub}</p>
    </div>
  );
}
