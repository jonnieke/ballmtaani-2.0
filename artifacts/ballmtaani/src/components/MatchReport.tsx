import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Activity, Zap } from "lucide-react";

interface Report {
  summary: string;
  goals: string[];
  standoutPlayers: string[];
  stats: { category: string; home: number; away: number }[];
}

export default function MatchReport({ matchId, homeTeam, awayTeam }: { matchId: string; homeTeam: string; awayTeam: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !matchId) return;
    supabase.from("match_reports").select("summary, goals, standout_players, stats").eq("match_id", matchId).single()
      .then(({ data }) => {
        if (data) setReport({
          summary: data.summary,
          goals: data.goals || [],
          standoutPlayers: data.standout_players || [],
          stats: data.stats || [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [matchId]);

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-white/5" />;
  if (!report) return null;

  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d1018] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#FFD700]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Match Report</h3>
      </div>

      {/* Summary */}
      <p className="text-sm leading-relaxed text-white/70">{report.summary}</p>

      {/* Goals */}
      {report.goals.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">⚽ Goals</p>
          <div className="space-y-1">
            {report.goals.map((g, i) => (
              <p key={i} className="text-xs text-white/60">• {g}</p>
            ))}
          </div>
        </div>
      )}

      {/* Standout */}
      {report.standoutPlayers.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-2">⭐ Standout Players</p>
          <div className="flex flex-wrap gap-1.5">
            {report.standoutPlayers.map((p, i) => (
              <span key={i} className="rounded-full border border-[#FFD700]/20 bg-[#FFD700]/8 px-2.5 py-1 text-[10px] font-bold text-[#FFD700]/80">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats comparison */}
      {report.stats.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-white/50">📊 Stats</p>
          {report.stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="text-white/40">{s.category}</span>
              <div className="flex items-center gap-2 flex-1 ml-3">
                <span className="font-black text-white w-6 text-right">{s.home}</span>
                <div className="h-1.5 flex-1 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full bg-[#B30000]" style={{ width: `${(s.home / (s.home + s.away)) * 100}%` }} />
                </div>
                <span className="font-black text-white w-6">{s.away}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[9px] text-white/15">Generated from official match data</p>
    </div>
  );
}
