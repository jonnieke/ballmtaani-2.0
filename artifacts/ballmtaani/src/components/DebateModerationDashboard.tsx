import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Shield, Eye, EyeOff, Trash2, Flag } from "lucide-react";

interface FlaggedDebate {
  debate_id: string;
  title: string;
  left_option: string;
  right_option: string;
  flag_count: number;
  flag_reasons: Record<string, number>;
  status: "active" | "hidden" | "deleted";
  is_pinned: boolean;
  created_at: string;
}

export default function DebateModerationDashboard() {
  const [flaggedDebates, setFlaggedDebates] = useState<FlaggedDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "flagged" | "active">(
    "flagged"
  );
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadFlaggedDebates();
  }, [filterStatus]);

  const loadFlaggedDebates = async () => {
    if (!supabase) return;

    setLoading(true);

    try {
      // Get debates with moderation data
      let query = supabase
        .from("debate_moderation")
        .select(
          `
          debate_id,
          is_pinned,
          status,
          flag_count,
          debates:debate_id (
            id,
            title,
            left_option,
            right_option,
            created_at
          )
        `
        )
        .gt("flag_count", 0);

      if (filterStatus === "active") {
        query = query.eq("status", "active");
      } else if (filterStatus === "flagged") {
        query = query.gt("flag_count", 0);
      }

      const { data } = await query.order("flag_count", { ascending: false });

      if (data) {
        // Get flag reasons for each debate
        const debatesWithReasons = await Promise.all(
          (data as any[]).map(async (mod) => {
            const { data: flags } = await supabase
              .from("debate_flags")
              .select("reason")
              .eq("debate_id", mod.debate_id);

            const reasonCounts: Record<string, number> = {};
            (flags || []).forEach((f: any) => {
              reasonCounts[f.reason] = (reasonCounts[f.reason] || 0) + 1;
            });

            return {
              debate_id: mod.debate_id,
              title: mod.debates?.title || "Unknown",
              left_option: mod.debates?.left_option || "",
              right_option: mod.debates?.right_option || "",
              flag_count: mod.flag_count || 0,
              flag_reasons: reasonCounts,
              status: mod.status,
              is_pinned: mod.is_pinned,
              created_at: mod.debates?.created_at,
            };
          })
        );

        setFlaggedDebates(debatesWithReasons);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (debateId: string, isPinned: boolean) => {
    setActioningId(debateId);

    const { error } = await supabase
      .from("debate_moderation")
      .update({ is_pinned: !isPinned })
      .eq("debate_id", debateId);

    if (!error) {
      setFlaggedDebates((prev) =>
        prev.map((d) =>
          d.debate_id === debateId ? { ...d, is_pinned: !isPinned } : d
        )
      );
    }

    setActioningId(null);
  };

  const handleToggleHide = async (debateId: string, status: string) => {
    setActioningId(debateId);

    const newStatus = status === "hidden" ? "active" : "hidden";
    const { error } = await supabase
      .from("debate_moderation")
      .update({ status: newStatus })
      .eq("debate_id", debateId);

    if (!error) {
      setFlaggedDebates((prev) =>
        prev.map((d) =>
          d.debate_id === debateId ? { ...d, status: newStatus } : d
        )
      );
    }

    setActioningId(null);
  };

  const handleDelete = async (debateId: string) => {
    if (!confirm("Permanently delete this debate?")) return;

    setActioningId(debateId);

    const { error } = await supabase
      .from("debate_moderation")
      .update({ status: "deleted" })
      .eq("debate_id", debateId);

    if (!error) {
      setFlaggedDebates((prev) =>
        prev.filter((d) => d.debate_id !== debateId)
      );
    }

    setActioningId(null);
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />;
  }

  if (flaggedDebates.length === 0) {
    return (
      <div className="rounded-2xl border border-white/6 bg-[#0d1018] p-8 text-center">
        <Shield className="h-12 w-12 text-white/20 mx-auto mb-3" />
        <p className="text-sm font-black text-white/50 uppercase tracking-widest">
          No flagged debates
        </p>
        <p className="text-xs text-white/25 mt-2">Community is healthy ✨</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "flagged", "active"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
              filterStatus === status
                ? "bg-[#FFD700]/20 border border-[#FFD700]/40 text-[#FFD700]"
                : "bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
            }`}
          >
            {status === "all" ? "All" : status === "flagged" ? "Flagged" : "Active"}
          </button>
        ))}
      </div>

      {/* Flagged Debates List */}
      <div className="space-y-3">
        {flaggedDebates.map((debate) => (
          <div
            key={debate.debate_id}
            className="rounded-xl border border-white/6 bg-[#0d1018] p-4 hover:border-white/10 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {debate.title}
                </h4>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-[9px] rounded bg-white/10 px-2 py-1 text-white/70">
                    {debate.left_option}
                  </span>
                  <span className="text-[9px] text-white/25">vs</span>
                  <span className="text-[9px] rounded bg-white/10 px-2 py-1 text-white/70">
                    {debate.right_option}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 shrink-0">
                {debate.is_pinned && (
                  <span className="text-[9px] font-black bg-[#FFD700]/20 text-[#FFD700] px-2 py-1 rounded-full">
                    PINNED
                  </span>
                )}
                <span
                  className={`text-[9px] font-black px-2 py-1 rounded-full ${
                    debate.status === "hidden"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : debate.status === "deleted"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {debate.status === "deleted"
                    ? "DELETED"
                    : debate.status === "hidden"
                      ? "HIDDEN"
                      : "ACTIVE"}
                </span>
              </div>
            </div>

            {/* Flag Reasons */}
            <div className="mb-3 p-2 rounded-lg bg-white/3">
              <p className="text-[10px] font-black text-white/50 mb-2 uppercase">
                <Flag className="h-3 w-3 inline mr-1" />
                Flags: {debate.flag_count}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(debate.flag_reasons).map(([reason, count]) => (
                  <span
                    key={reason}
                    className="text-[9px] bg-red-500/20 text-red-400 px-2 py-1 rounded"
                  >
                    {reason} ({count})
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleTogglePin(debate.debate_id, debate.is_pinned)}
                disabled={actioningId === debate.debate_id}
                className="rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:bg-[#FFD700]/20 transition-colors disabled:opacity-50"
              >
                {debate.is_pinned ? "Unpin" : "Pin"}
              </button>

              <button
                onClick={() =>
                  handleToggleHide(debate.debate_id, debate.status)
                }
                disabled={actioningId === debate.debate_id}
                className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {debate.status === "hidden" ? (
                  <>
                    <Eye className="h-3 w-3" /> Show
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3" /> Hide
                  </>
                )}
              </button>

              <button
                onClick={() => handleDelete(debate.debate_id)}
                disabled={actioningId === debate.debate_id}
                className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
