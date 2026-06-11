import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Send, Heart } from "lucide-react";

interface Comment {
  id: string;
  user_name: string;
  text: string;
  reaction?: "goal" | "save" | "tackle" | "yellow" | "red";
  created_at: string;
  likes: number;
}

export default function MatchCommentary({ matchId }: { matchId: string }) {
  const { user, username, isLoggedIn } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase || !matchId) return;
    // Ascending order: oldest at top, newest at bottom
    supabase.from("match_comments").select("*").eq("match_id", matchId).order("created_at", { ascending: true }).limit(50)
      .then(({ data }) => setComments((data as Comment[]) || []));

    const ch = supabase.channel(`match-${matchId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "match_comments", filter: `match_id=eq.${matchId}` },
        // Append new comments to end so newest is always at the bottom
        (payload: any) => setComments(prev => [...prev, payload.new as Comment]))
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [matchId]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  async function submitComment() {
    if (!isLoggedIn || !newComment.trim()) return;
    setSubmitting(true);
    await supabase.from("match_comments").insert({
      match_id: matchId,
      user_id: user?.id,
      user_name: username || "Fan",
      text: newComment.trim(),
      likes: 0,
    });
    setNewComment("");
    setSubmitting(false);
  }

  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d1018] overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="border-b border-white/6 px-4 py-3 bg-black/40">
        <p className="text-sm font-black uppercase tracking-widest text-white">Live Commentary ⚽</p>
        <p className="text-[9px] text-white/25 mt-0.5">{comments.length} reactions</p>
      </div>

      {/* Comments feed */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {comments.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-xs text-white/20">No reactions yet. Be the first to comment! 🔥</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-2.5 rounded-lg bg-white/4 p-2.5 hover:bg-white/6">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black text-white">
                {c.user_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white">{c.user_name}</p>
                <p className="text-[11px] leading-relaxed text-white/70 break-words">{c.text}</p>
                <div className="mt-1 flex items-center gap-2">
                  {c.reaction && <span className="text-xs">{
                    c.reaction === "goal" ? "⚽" : c.reaction === "save" ? "🧤" :
                    c.reaction === "tackle" ? "🔴" : c.reaction === "yellow" ? "🟨" : "🟥"
                  }</span>}
                  <span className="text-[9px] text-white/20">{new Date(c.created_at).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}</span>
                  <button className="ml-auto flex items-center gap-1 text-[9px] text-white/25 hover:text-[#B30000]">
                    <Heart className="h-3 w-3" /> {c.likes}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      {isLoggedIn ? (
        <div className="border-t border-white/6 bg-black/40 p-3">
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
              placeholder="React to the match..."
              maxLength={280}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 focus:border-white/20 focus:outline-none resize-none"
            />
            <button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B30000] text-white transition-all hover:bg-[#cc0000] disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-[8px] text-white/15">{280 - newComment.length} characters left</p>
        </div>
      ) : (
        <div className="border-t border-white/6 bg-black/40 px-3 py-2 text-center">
          <p className="text-[9px] text-white/30">
            <a href="/login" className="font-black text-[#B30000] hover:underline">Sign in</a> to join the commentary
          </p>
        </div>
      )}
    </div>
  );
}
