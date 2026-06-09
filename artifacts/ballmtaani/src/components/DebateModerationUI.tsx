import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Flag, Crown } from "lucide-react";

interface DebateModerationUIProps {
  debateId: string;
  isPinned?: boolean;
  flagCount?: number;
  userHasFlagged?: boolean;
  onFlagSuccess?: () => void;
}

export default function DebateModerationUI({
  debateId,
  isPinned = false,
  flagCount = 0,
  userHasFlagged = false,
  onFlagSuccess,
}: DebateModerationUIProps) {
  const { isLoggedIn, user } = useAuth();
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [flagReason, setFlagReason] = useState<string | null>(null);
  const [flagDetails, setFlagDetails] = useState("");
  const [flagging, setFlagging] = useState(false);
  const [flagError, setFlagError] = useState("");

  const flagReasons = [
    { id: "spam", label: "Spam", desc: "Repetitive/low-effort" },
    { id: "inappropriate", label: "Inappropriate", desc: "Offensive content" },
    { id: "misinformation", label: "Misinformation", desc: "False information" },
    { id: "duplicate", label: "Duplicate", desc: "Already discussed" },
  ];

  const handleFlag = async () => {
    if (!isLoggedIn || !user?.id || !flagReason) return;

    setFlagging(true);
    setFlagError("");

    try {
      // Insert flag
      const { error: flagError } = await supabase.from("debate_flags").insert({
        debate_id: debateId,
        user_id: user.id,
        reason: flagReason,
        details: flagDetails.trim() || null,
      });

      if (flagError) {
        if (flagError.code === "23505") {
          setFlagError("You already flagged this debate");
        } else {
          setFlagError(flagError.message);
        }
        setFlagging(false);
        return;
      }

      // Update moderation table flag count
      const { data: modData } = await supabase
        .from("debate_moderation")
        .select("flag_count")
        .eq("debate_id", debateId)
        .single();

      if (modData) {
        await supabase
          .from("debate_moderation")
          .update({
            flag_count: (modData.flag_count || 0) + 1,
            is_flagged: true,
            flagged_at: new Date().toISOString(),
          })
          .eq("debate_id", debateId);
      } else {
        await supabase.from("debate_moderation").insert({
          debate_id: debateId,
          is_flagged: true,
          flag_count: 1,
          flag_reason: flagReason,
          flagged_at: new Date().toISOString(),
        });
      }

      setShowFlagMenu(false);
      setFlagReason(null);
      setFlagDetails("");
      onFlagSuccess?.();
    } catch (err) {
      setFlagError("Failed to flag debate");
    } finally {
      setFlagging(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Pinned Badge */}
      {isPinned && (
        <div className="flex items-center gap-1 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 px-2.5 py-1">
          <Crown className="h-3 w-3 text-[#FFD700]" />
          <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">
            Trending
          </span>
        </div>
      )}

      {/* Flag Button */}
      <div className="relative">
        <button
          onClick={() => setShowFlagMenu(!showFlagMenu)}
          disabled={userHasFlagged || flagging}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
            userHasFlagged
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : "bg-white/8 text-white/60 hover:bg-red-500/15 hover:text-red-400"
          }`}
        >
          <Flag className="h-3 w-3" />
          {flagCount > 0 && <span>{flagCount}</span>}
        </button>

        {/* Flag Menu */}
        {showFlagMenu && !userHasFlagged && (
          <div className="absolute right-0 top-full mt-1 z-20 rounded-lg border border-white/10 bg-[#0B0B0B] shadow-2xl overflow-hidden w-48">
            {!flagReason ? (
              <>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-3 py-2 border-b border-white/5">
                  Why flag?
                </p>
                <div className="space-y-1 p-2">
                  {flagReasons.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => setFlagReason(reason.id)}
                      className="w-full text-left rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2 transition-colors"
                    >
                      <p className="text-xs font-bold text-white">{reason.label}</p>
                      <p className="text-[9px] text-white/40">{reason.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest px-3 py-2 border-b border-white/5 flex items-center justify-between">
                  Details (optional)
                  <button
                    onClick={() => setFlagReason(null)}
                    className="text-white/30 hover:text-white text-xs"
                  >
                    ←
                  </button>
                </p>
                <div className="p-3 space-y-2">
                  <textarea
                    value={flagDetails}
                    onChange={(e) => setFlagDetails(e.target.value)}
                    placeholder="Add context..."
                    maxLength={200}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder-white/20 focus:border-white/30 focus:outline-none resize-none"
                    rows={3}
                  />
                  <p className="text-[8px] text-white/25">
                    {flagDetails.length}/200
                  </p>

                  {flagError && (
                    <p className="text-[9px] text-red-400">{flagError}</p>
                  )}

                  <button
                    onClick={handleFlag}
                    disabled={flagging}
                    className="w-full rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-3 py-2 text-xs font-black text-red-400 uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    {flagging ? "Flagging..." : "Submit Flag"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
