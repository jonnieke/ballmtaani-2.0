import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { BarChart3, Lock, Check } from "lucide-react";

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  votes: Record<string, number>;
  status: "active" | "closed";
  closes_at: string | null;
  created_at: string;
}

interface UserVote {
  poll_id: string;
  option_id: string;
}

export default function FanZonePolls({ fanZoneId }: { fanZoneId: string }) {
  const { isLoggedIn, user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !fanZoneId) return;

    const loadPolls = async () => {
      // Get polls for this fan zone
      const { data: pollsData } = await supabase
        .from("fan_zone_polls")
        .select("*")
        .eq("fan_zone_id", fanZoneId)
        .order("created_at", { ascending: false });

      if (pollsData) {
        setPolls(
          pollsData.map((p: any) => ({
            id: p.id,
            question: p.question,
            options: p.options || [],
            votes: p.votes || {},
            status: p.status,
            closes_at: p.closes_at,
            created_at: p.created_at,
          }))
        );
      }

      // Get user's votes if logged in
      if (isLoggedIn && user?.id) {
        const { data: votesData } = await supabase
          .from("poll_votes")
          .select("poll_id, option_id")
          .eq("user_id", user.id)
          .in(
            "poll_id",
            (pollsData || []).map((p: any) => p.id)
          );

        if (votesData) {
          const voteMap: Record<string, string> = {};
          votesData.forEach((v: UserVote) => {
            voteMap[v.poll_id] = v.option_id;
          });
          setUserVotes(voteMap);
        }
      }

      setLoading(false);
    };

    loadPolls();

    // Real-time subscription for poll updates
    const channel = supabase
      .channel(`polls-${fanZoneId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fan_zone_polls",
          filter: `fan_zone_id=eq.${fanZoneId}`,
        },
        (payload: any) => {
          setPolls((prev) =>
            prev.map((p) =>
              p.id === payload.new.id
                ? {
                    ...p,
                    votes: payload.new.votes,
                    status: payload.new.status,
                  }
                : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fan_zone_polls",
          filter: `fan_zone_id=eq.${fanZoneId}`,
        },
        (payload: any) => {
          setPolls((prev) => [
            {
              id: payload.new.id,
              question: payload.new.question,
              options: payload.new.options,
              votes: payload.new.votes,
              status: payload.new.status,
              closes_at: payload.new.closes_at,
              created_at: payload.new.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fanZoneId, isLoggedIn, user?.id]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!isLoggedIn || !user?.id) {
      window.location.href = "/login";
      return;
    }

    setVotingPollId(pollId);

    // Record the vote
    const { error } = await supabase.from("poll_votes").insert({
      poll_id: pollId,
      user_id: user.id,
      option_id: optionId,
    });

    if (!error) {
      // Update local vote record
      setUserVotes((prev) => ({ ...prev, [pollId]: optionId }));

      // Update poll votes count in database
      const poll = polls.find((p) => p.id === pollId);
      if (poll) {
        const updatedVotes = { ...poll.votes };
        updatedVotes[optionId] = (updatedVotes[optionId] || 0) + 1;

        await supabase
          .from("fan_zone_polls")
          .update({ votes: updatedVotes })
          .eq("id", pollId);
      }
    }

    setVotingPollId(null);
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />;
  }

  if (polls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-[#FFD700]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-white">
          Zone Polls
        </h3>
      </div>

      {polls.map((poll) => {
        const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0) || 1;
        const userVoted = userVotes[poll.id];
        const isExpired = poll.closes_at && new Date(poll.closes_at) < new Date();
        const isClosed = poll.status === "closed" || isExpired;

        return (
          <div
            key={poll.id}
            className="rounded-2xl border border-white/6 bg-[#0d1018] p-4 space-y-3"
          >
            {/* Poll Question */}
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-bold text-white flex-1">
                {poll.question}
              </h4>
              {isClosed && (
                <span className="shrink-0 rounded-full bg-white/8 px-2 py-1 text-[8px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Closed
                </span>
              )}
            </div>

            {/* Poll Options */}
            <div className="space-y-2.5">
              {poll.options.map((option) => {
                const optionVotes = poll.votes[option.id] || 0;
                const percentage = totalVotes ? (optionVotes / totalVotes) * 100 : 0;
                const isSelected = userVoted === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() =>
                      !isClosed && !userVoted && handleVote(poll.id, option.id)
                    }
                    disabled={isClosed || userVoted !== undefined || votingPollId === poll.id}
                    className="w-full text-left transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-bold text-white">
                          {option.text}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-[#FFD700]" />
                        )}
                      </div>
                      <span className="text-[10px] font-black text-white/50">
                        {optionVotes}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isSelected
                            ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500]"
                            : "bg-gradient-to-r from-[#B30000] to-[#ff6b6b]"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="text-[9px] text-white/30 mt-1">
                      {percentage.toFixed(0)}%
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Total Votes */}
            <p className="text-[10px] text-white/25 text-center pt-2 border-t border-white/5">
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
              {!isLoggedIn && " • Sign in to vote"}
              {isLoggedIn && !userVoted && !isClosed && " • Vote now"}
              {userVoted && " ✓ You voted"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
