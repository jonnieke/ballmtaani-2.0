import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { TrendingUp } from "lucide-react";

interface Consensus {
  homeWin: number;
  draw: number;
  awayWin: number;
  totalPredictions: number;
}

export default function PredictionConsensus({ matchId, homeTeam, awayTeam }: { matchId: string; homeTeam: string; awayTeam: string }) {
  const [consensus, setConsensus] = useState<Consensus>({ homeWin: 0, draw: 0, awayWin: 0, totalPredictions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !matchId) return;
    const loadConsensus = async () => {
      const { data } = await supabase.from("predictions").select("result").eq("match_id", matchId).eq("status", "locked");
      const preds = (data as any[]) || [];
      const homeWin = preds.filter(p => p.result === "home").length;
      const draw = preds.filter(p => p.result === "draw").length;
      const awayWin = preds.filter(p => p.result === "away").length;
      const total = preds.length || 1;
      setConsensus({
        homeWin: Math.round((homeWin / total) * 100),
        draw: Math.round((draw / total) * 100),
        awayWin: Math.round((awayWin / total) * 100),
        totalPredictions: total,
      });
      setLoading(false);
    };
    loadConsensus();

    const ch = supabase.channel(`consensus-${matchId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "predictions", filter: `match_id=eq.${matchId}` }, () => loadConsensus())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [matchId]);

  if (loading) return <div className="h-32 animate-pulse rounded-xl bg-white/5" />;

  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d1018] p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#FFD700]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Fan Consensus</h3>
        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[8px] font-black text-white/40">{consensus.totalPredictions.toLocaleString()} calls</span>
      </div>

      <div className="space-y-3">
        {/* Home */}
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-black text-white">{homeTeam} Win</span>
            <span className="font-black text-[#FFD700]">{consensus.homeWin}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div className="h-full bg-gradient-to-r from-[#B30000] to-[#ff6b6b]" style={{ width: `${consensus.homeWin}%` }} />
          </div>
        </div>

        {/* Draw */}
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-black text-white">Draw</span>
            <span className="font-black text-white/50">{consensus.draw}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div className="h-full bg-white/30" style={{ width: `${consensus.draw}%` }} />
          </div>
        </div>

        {/* Away */}
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-black text-white">{awayTeam} Win</span>
            <span className="font-black text-blue-400">{consensus.awayWin}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: `${consensus.awayWin}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[9px] text-white/20">Live update every prediction ⚡</p>
    </div>
  );
}
