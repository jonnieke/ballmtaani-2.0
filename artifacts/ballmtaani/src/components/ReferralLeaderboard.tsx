import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Users, TrendingUp, Trophy } from "lucide-react";

interface Referrer { user_id: string; display_name: string; referral_count: number; mtc_earned: number; }

export default function ReferralLeaderboard() {
  const [top, setTop] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from("profiles").select("id, display_name, referral_count, coins").order("referral_count", { ascending: false }).limit(10)
      .then(({ data }) => {
        setTop((data || []).filter((p: any) => p.referral_count > 0).map((p: any) => ({
          user_id: p.id, display_name: p.display_name || "Fan", referral_count: p.referral_count || 0, mtc_earned: (p.referral_count || 0) * 500
        })));
        setLoading(false);
      });
  }, []);

  if (loading || top.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d1018] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[#FFD700]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Top Referrers</h3>
        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[8px] font-black text-white/40">This Season</span>
      </div>
      <div className="space-y-1">
        {top.map((r, i) => (
          <div key={r.user_id} className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2.5 hover:bg-white/5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                i === 0 ? "bg-[#FFD700] text-black" : i === 1 ? "bg-white/15" : "bg-white/8 text-white/30"
              }`}>{i + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{r.display_name}</p>
                <p className="text-[9px] text-white/25">{r.referral_count} referral{r.referral_count !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <span className="shrink-0 text-right">
              <p className="text-xs font-black text-[#FFD700]">{r.mtc_earned.toLocaleString()}</p>
              <p className="text-[8px] text-white/20">MTC earned</p>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
