import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Trophy } from "lucide-react";

interface Entry { display_name: string; correct_this_week: number; id: string; }

export default function LiveLeaderboard() {
  const [leaders, setLeaders] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const load = async () => {
      const { data } = await supabase.from("prediction_stats").select("user_id, display_name, correct_count").order("correct_count", { ascending: false }).limit(5);
      setLeaders((data || []).map((d: any) => ({ id: d.user_id, display_name: d.display_name || "Fan", correct_this_week: d.correct_count || 0 })));
      setLoading(false);
    };
    load();

    // Poll every 10 seconds for live updates
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || leaders.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d1018] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[#FFD700]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">WC26 Leaders</h3>
        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[8px] font-black text-white/40">This Week</span>
      </div>
      <div className="space-y-2">
        {leaders.map((e, i) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                i === 0 ? "bg-[#FFD700] text-black" : i === 1 ? "bg-white/15" : "bg-white/8 text-white/30"
              }`}>{i + 1}</span>
              <span className="truncate text-xs font-bold text-white">{e.display_name}</span>
            </div>
            <span className="shrink-0 text-xs font-black text-[#FFD700]">{e.correct_this_week}✓</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[9px] text-white/15">Updates every 10 seconds ⚡</p>
    </div>
  );
}
