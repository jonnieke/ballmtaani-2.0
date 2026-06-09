import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Heart, MessageCircle, Send, Trash2, CornerDownRight } from "lucide-react";

interface Comment {
  id: string;
  article_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  parent_id: string | null;
  likes: number;
  created_at: string;
}

function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B30000]/20 text-[11px] font-black text-[#B30000]">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

interface Props {
  articleId: string;
  articleTitle: string;
}

export default function ArticleEngagement({ articleId, articleTitle }: Props) {
  const { user, username, isLoggedIn } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    const [{ data: cmts }, { count: likes }, { data: myReaction }] = await Promise.all([
      supabase.from("article_comments").select("*").eq("article_id", articleId).order("created_at", { ascending: true }),
      supabase.from("article_reactions").select("id", { count: "exact", head: true }).eq("article_id", articleId).eq("type", "like"),
      user ? supabase.from("article_reactions").select("id").eq("article_id", articleId).eq("user_id", user.id).eq("type", "like").maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setComments((cmts as Comment[]) || []);
    setLikeCount(likes ?? 0);
    setHasLiked(!!myReaction);
  }, [articleId, user]);

  useEffect(() => {
    loadData();
    if (!supabase) return;
    const ch = supabase.channel(`article-${articleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "article_comments", filter: `article_id=eq.${articleId}` }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "article_reactions", filter: `article_id=eq.${articleId}` }, loadData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [articleId, loadData]);

  async function toggleLike() {
    if (!user || !supabase || liking) return;
    setLiking(true);
    if (hasLiked) {
      await supabase.from("article_reactions").delete().eq("article_id", articleId).eq("user_id", user.id).eq("type", "like");
    } else {
      await supabase.from("article_reactions").insert({ article_id: articleId, user_id: user.id, type: "like" });
    }
    await loadData();
    setLiking(false);
  }

  async function submitComment() {
    if (!user || !supabase || !text.trim()) return;
    setSubmitting(true);
    await supabase.from("article_comments").insert({
      article_id: articleId,
      user_id: user.id,
      author_name: username || user.email?.split("@")[0] || "Fan",
      content: text.trim(),
      parent_id: replyTo?.id ?? null,
    });
    setText(""); setReplyTo(null); setSubmitting(false);
  }

  async function deleteComment(id: string) {
    if (!supabase || !confirm("Delete your comment?")) return;
    await supabase.from("article_comments").delete().eq("id", id);
  }

  const topLevel = comments.filter(c => !c.parent_id);
  const replies = (pid: string) => comments.filter(c => c.parent_id === pid);

  const share = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${articleTitle}\n\nhttps://ballmtaani.com/article/${articleId}\n\nvia BallMtaani`)}`, "_blank");

  return (
    <div className="mt-10">
      {/* ── Reaction bar ── */}
      <div className="mb-8 flex items-center gap-4 border-t border-b border-white/8 py-4">
        <button onClick={toggleLike} disabled={!isLoggedIn || liking}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all active:scale-95
            ${hasLiked ? "border-[#B30000]/50 bg-[#B30000]/15 text-[#B30000]" : "border-white/10 bg-white/4 text-white/50 hover:border-[#B30000]/30 hover:text-[#B30000]"}`}>
          <Heart className={`h-4 w-4 ${hasLiked ? "fill-[#B30000]" : ""}`} />
          <span>{likeCount}</span>
          <span className="hidden sm:inline">{hasLiked ? "Liked" : "Like"}</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-white/30">
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
        </div>

        <button onClick={share}
          className="ml-auto flex items-center gap-2 rounded-full border border-[#25D366]/20 bg-[#25D366]/8 px-4 py-2 text-sm font-bold text-[#25D366] transition-all hover:bg-[#25D366]/16">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share
        </button>
      </div>

      {/* ── Comments ── */}
      <div className="mb-6">
        <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-white">
          Comments <span className="ml-2 text-white/25">({comments.length})</span>
        </h3>

        {/* Comment input */}
        {isLoggedIn ? (
          <div className="mb-6 rounded-xl border border-white/8 bg-[#0d1018] p-4">
            {replyTo && (
              <div className="mb-3 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="text-[10px] text-white/40">
                  <CornerDownRight className="mr-1 inline h-3 w-3" />
                  Replying to <span className="font-bold text-white/60">{replyTo.author_name}</span>
                </span>
                <button onClick={() => setReplyTo(null)} className="text-white/25 hover:text-white"><span className="text-xs">✕</span></button>
              </div>
            )}
            <div className="flex gap-3">
              <Avatar name={username || "Me"} />
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }}
                  placeholder="Join the conversation…"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-white/20 focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-white/20">Ctrl+Enter to post</span>
                  <button onClick={submitComment} disabled={!text.trim() || submitting}
                    className="flex items-center gap-1.5 rounded-xl bg-[#B30000] px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#cc0000] disabled:opacity-35">
                    <Send className="h-3 w-3" /> Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-xl border border-white/6 bg-[#0d1018] px-4 py-4 text-center">
            <p className="text-sm text-white/40">
              <a href="/login" className="font-black text-[#B30000] hover:underline">Sign in</a> to join the conversation
            </p>
          </div>
        )}

        {/* Comment list */}
        {topLevel.length === 0 ? (
          <div className="rounded-xl border border-white/6 bg-[#0d1018] py-10 text-center">
            <MessageCircle className="mx-auto mb-2 h-6 w-6 text-white/15" />
            <p className="text-sm text-white/25">No comments yet. Be the first to react.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topLevel.map(c => (
              <div key={c.id}>
                <CommentRow comment={c} currentUserId={user?.id} onReply={() => { setReplyTo(c); inputRef.current?.focus(); }} onDelete={deleteComment} />
                {replies(c.id).length > 0 && (
                  <div className="ml-11 mt-2 space-y-2 border-l border-white/6 pl-4">
                    {replies(c.id).map(r => (
                      <CommentRow key={r.id} comment={r} currentUserId={user?.id} onReply={() => { setReplyTo(c); inputRef.current?.focus(); }} onDelete={deleteComment} isReply />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentRow({ comment, currentUserId, onReply, onDelete, isReply = false }: {
  comment: Comment; currentUserId?: string; onReply: () => void; onDelete: (id: string) => void; isReply?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Avatar name={comment.author_name} />
      <div className="min-w-0 flex-1 rounded-xl border border-white/6 bg-[#0d1018] px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-black text-white">{comment.author_name}</span>
          <span className="text-[9px] text-white/25">{ago(comment.created_at)}</span>
        </div>
        <p className="text-sm leading-relaxed text-white/70">{comment.content}</p>
        <div className="mt-2 flex items-center gap-3">
          {!isReply && (
            <button onClick={onReply} className="flex items-center gap-1 text-[10px] font-bold text-white/25 transition-colors hover:text-white/60">
              <CornerDownRight className="h-3 w-3" /> Reply
            </button>
          )}
          {currentUserId === comment.user_id && (
            <button onClick={() => onDelete(comment.id)} className="flex items-center gap-1 text-[10px] font-bold text-white/20 transition-colors hover:text-[#B30000]">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
