import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../lib/news-api";
import { Plus, Edit3, Eye, Trash2, Save, Globe, FileText, Send, CheckCircle2, XCircle, RotateCcw, Clock } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useContentRole } from "../hooks/useContentRole";

type ArticleStatus = "draft" | "submitted" | "approved" | "rejected" | "published" | "archived";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  author_name: string;
  author_id: string;
  partner_team_name: string | null;
  is_wc26: boolean;
  status: ArticleStatus;
  published_at: string | null;
  moderation_note: string | null;
  created_at: string;
}

interface ArticleForm {
  title: string;
  content: string;
  excerpt: string;
  thumbnail_url: string;
  author_name: string;
  partner_team_name: string;
  tags: string;
  is_wc26: boolean;
}

const EMPTY_FORM: ArticleForm = { title: "", content: "", excerpt: "", thumbnail_url: "", author_name: "BallMtaani", partner_team_name: "", tags: "", is_wc26: false };

const STATUS_META: Record<ArticleStatus, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "text-white/35" },
  submitted: { label: "In Review", color: "text-blue-400" },
  approved:  { label: "Approved",  color: "text-purple-400" },
  rejected:  { label: "Rejected",  color: "text-[#B30000]" },
  published: { label: "Published", color: "text-green-400" },
  archived:  { label: "Archived",  color: "text-white/20" },
};

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

export default function AdminArticlesPage() {
  const { user, username, isLoggedIn } = useAuth();
  const [, navigate] = useLocation();
  const role = useContentRole();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"mine" | "queue" | "all">("mine");

  const loadArticles = useCallback(async () => {
    if (!user || !supabase) return;
    setLoading(true);
    let q = supabase.from("articles")
      .select("id, slug, title, excerpt, thumbnail_url, author_name, author_id, partner_team_name, is_wc26, status, published_at, moderation_note, created_at");
    // Editors/publishers/admins see all; writers see only their own
    if (!role.canEdit) q = q.eq("author_id", user.id);
    const { data } = await q.order("created_at", { ascending: false });
    setArticles((data as Article[]) || []);
    setLoading(false);
  }, [user, role.canEdit]);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    loadArticles();
  }, [isLoggedIn, loadArticles, navigate]);

  function openEditor(article?: Article) {
    if (article) {
      setEditingId(article.id);
      setForm({ title: article.title, content: "", excerpt: article.excerpt || "", thumbnail_url: article.thumbnail_url || "", author_name: article.author_name || "BallMtaani", partner_team_name: article.partner_team_name || "", tags: "", is_wc26: article.is_wc26 });
      if (supabase) supabase.from("articles").select("content, tags").eq("id", article.id).single().then(({ data }) => {
        if (data) setForm(f => ({ ...f, content: data.content, tags: (data.tags || []).join(", ") }));
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setError(""); setSuccessMsg(""); setView("editor");
  }

  async function saveArticle(targetStatus: ArticleStatus) {
    if (!user || !supabase) return;
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.content.trim()) { setError("Content is required."); return; }
    setSaving(true); setError("");

    const slug = editingId ? undefined : `${slugify(form.title)}-${Date.now().toString(36)}`;
    const payload: any = {
      title: form.title.trim(), content: form.content,
      excerpt: form.excerpt.trim() || null, thumbnail_url: form.thumbnail_url.trim() || null,
      partner_team_name: form.partner_team_name.trim() || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      is_wc26: form.is_wc26,
      author_name: form.author_name.trim() || "BallMtaani",
      author_id: user.id,
      status: targetStatus,
      published_at: targetStatus === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    if (slug) payload.slug = slug;

    const { error: dbError } = editingId
      ? await supabase.from("articles").update(payload).eq("id", editingId)
      : await supabase.from("articles").insert(payload);

    setSaving(false);
    if (dbError) { setError(dbError.message); return; }

    const msg: Record<ArticleStatus, string> = { draft: "Draft saved.", submitted: "Submitted for review!", approved: "Approved.", rejected: "Rejected.", published: "Published!", archived: "Archived." };
    setSuccessMsg(msg[targetStatus]);
    await loadArticles();
    setTimeout(() => { setView("list"); setSuccessMsg(""); }, 1200);
  }

  async function updateStatus(article: Article, status: ArticleStatus, note?: string) {
    if (!supabase) return;
    await supabase.from("articles").update({
      status,
      moderation_note: note || null,
      published_at: status === "published" ? new Date().toISOString() : article.published_at,
      updated_at: new Date().toISOString(),
    }).eq("id", article.id);
    setRejectingId(null); setRejectNote("");
    loadArticles();
  }

  async function deleteArticle(id: string) {
    if (!supabase || !confirm("Delete this article permanently?")) return;
    await supabase.from("articles").delete().eq("id", id);
    loadArticles();
  }

  if (!isLoggedIn) return null;
  if (!role.loading && !role.canWrite) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <FileText className="h-8 w-8 text-white/15" />
          <p className="font-black uppercase tracking-widest text-white/30">No Article Access</p>
          <p className="text-xs text-white/20">Ask a super admin to assign you a Writer, Editor, or Publisher role.</p>
        </div>
      </AdminLayout>
    );
  }

  // ── EDITOR ────────────────────────────────────────────────────────────────
  if (view === "editor") {
    const editingArticle = articles.find(a => a.id === editingId);
    const currentStatus = editingArticle?.status;
    const isDraft = !editingId || currentStatus === "draft" || currentStatus === "rejected";
    const isLive = currentStatus === "published" || currentStatus === "approved";
    const canSubmit = role.canWrite && isDraft;
    const canPublishDirect = role.canPublish;

    return (
      <AdminLayout>
        <div>
          <button onClick={() => setView("list")} className="mb-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/30 transition-colors hover:text-white">
            ← All Articles
          </button>
          <h1 className="mb-6 text-xl font-black uppercase tracking-widest text-white">
            {editingId ? "Edit Article" : "New Article"}
          </h1>

          {editingArticle?.moderation_note && editingArticle.status === "rejected" && (
            <div className="mb-4 rounded-xl border border-[#B30000]/30 bg-[#B30000]/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B30000]">Editor feedback</p>
              <p className="mt-1 text-sm text-white/70">{editingArticle.moderation_note}</p>
            </div>
          )}

          {error && <div className="mb-4 rounded-xl border border-[#B30000]/30 bg-[#B30000]/10 px-4 py-3 text-sm text-[#ff6b6b]">{error}</div>}
          {successMsg && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">{successMsg}</div>}

          <div className="space-y-4">
            <FormField label="Title *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Article headline..." bold />
            <FormField label="Author / Byline" value={form.author_name} onChange={v => setForm(f => ({ ...f, author_name: v }))} placeholder="BallMtaani" />
            <FormField label="Excerpt — shown on homepage card and as article standfirst" value={form.excerpt} onChange={v => setForm(f => ({ ...f, excerpt: v }))} placeholder="One compelling sentence about the article..." />
            <FormField label="Thumbnail URL" value={form.thumbnail_url} onChange={v => setForm(f => ({ ...f, thumbnail_url: v }))} placeholder="https://..." />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Team / Publication" value={form.partner_team_name} onChange={v => setForm(f => ({ ...f, partner_team_name: v }))} placeholder="e.g. KPL Digest" />
              <FormField label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="EPL, Transfers, WC26" />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-[#0d1018] px-4 py-3">
              <input type="checkbox" checked={form.is_wc26} onChange={e => setForm(f => ({ ...f, is_wc26: e.target.checked }))} className="h-4 w-4 accent-[#FFD700]" />
              <span className="text-sm font-bold text-white/60">Tag as WC26 content <span className="text-[#FFD700]">(appears in WC26 section)</span></span>
            </label>
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">Article Content * (HTML supported)</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your article here. Separate paragraphs with a blank line. For formatting: use **bold**, or HTML tags like <h2>, <blockquote>, <strong>. Images: <img src='url' />."
                rows={18} className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 font-mono text-sm text-white/80 placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {/* Editing a live article — Save Changes keeps it published/approved */}
              {isLive && editingId ? (
                <button onClick={() => saveArticle(currentStatus!)} disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B30000] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000] disabled:opacity-40">
                  <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Changes"}
                </button>
              ) : (
                <>
                  <button onClick={() => saveArticle("draft")} disabled={saving}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white/60 hover:bg-white/10 disabled:opacity-40">
                    <Save className="h-3.5 w-3.5" /> Save Draft
                  </button>
                  {canSubmit && (
                    <button onClick={() => saveArticle("submitted")} disabled={saving}
                      className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 disabled:opacity-40">
                      <Send className="h-3.5 w-3.5" /> Submit for Review
                    </button>
                  )}
                  {canPublishDirect && (
                    <button onClick={() => saveArticle("published")} disabled={saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B30000] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000] disabled:opacity-40">
                      <Globe className="h-3.5 w-3.5" /> {saving ? "Publishing…" : "Publish Now"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ── LIST ──────────────────────────────────────────────────────────────────
  const myArticles  = articles.filter(a => a.author_id === user?.id);
  const queueArticles = articles.filter(a => a.status === "submitted" || a.status === "approved");
  const shownArticles = activeTab === "mine" ? myArticles : activeTab === "queue" ? queueArticles : articles;

  return (
    <AdminLayout>
      <div>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">Articles</h1>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">
              {role.isSuperAdmin ? "Full access" : role.canPublish ? "Publisher" : role.canEdit ? "Editor" : "Writer"}
            </p>
          </div>
          {role.canWrite && (
            <button onClick={() => openEditor()}
              className="flex items-center gap-2 rounded-xl bg-[#B30000] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
              <Plus className="h-3.5 w-3.5" /> New Article
            </button>
          )}
        </div>

        {/* Tabs */}
        {role.canEdit && (
          <div className="mb-5 flex gap-1 rounded-xl border border-white/6 bg-[#0d1018] p-1">
            {([
              { key: "mine", label: "My Articles", count: myArticles.length },
              { key: "queue", label: "Review Queue", count: queueArticles.length, badge: queueArticles.filter(a => a.status === "submitted").length },
              { key: "all", label: "All Articles", count: articles.length },
            ] as const).map(({ key, label, count, ...rest }) => { const badge = "badge" in rest ? rest.badge : 0; return (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-all
                  ${activeTab === key ? "bg-white/8 text-white" : "text-white/30 hover:text-white/60"}`}>
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black ${activeTab === key ? "bg-white/15 text-white/60" : "bg-white/8 text-white/25"}`}>{count}</span>
                {badge ? <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" /> : null}
              </button>
            ); })}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />)}</div>
        ) : shownArticles.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/6 bg-[#0d1018] py-16 text-center">
            <FileText className="h-8 w-8 text-white/15" />
            <p className="font-black uppercase tracking-widest text-white/25">
              {activeTab === "queue" ? "No articles awaiting review" : "No articles yet"}
            </p>
            {activeTab === "mine" && role.canWrite && (
              <button onClick={() => openEditor()} className="rounded-xl bg-[#B30000] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
                Write First Article
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {shownArticles.map(article => {
              const sm = STATUS_META[article.status];
              const isOwn = article.author_id === user?.id;
              // Editors/publishers/admins can edit any article; writers only own drafts/rejected
              const isEditableByMe = role.canEdit || (isOwn && (article.status === "draft" || article.status === "rejected"));
              const isRejectOpen = rejectingId === article.id;

              return (
                <div key={article.id} className="rounded-xl border border-white/6 bg-[#0d1018] transition-all hover:border-white/12">
                  <div className="flex items-center gap-3 p-3">
                    {article.thumbnail_url && <img src={article.thumbnail_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-black text-white">{article.title}</p>
                        {article.is_wc26 && <span className="shrink-0 rounded bg-[#FFD700]/15 px-1.5 py-0.5 text-[8px] font-black uppercase text-[#FFD700]">WC26</span>}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                        <span className={sm.color}>{sm.label}</span>
                        <span className="text-white/20">· {article.author_name}</span>
                        {article.partner_team_name && <span className="text-white/20">· {article.partner_team_name}</span>}
                        <span className="text-white/15">· {timeAgo(article.published_at || article.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {article.status === "published" && (
                        <a href={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer"
                          className="rounded-lg p-2 text-white/25 transition-all hover:bg-white/8 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </a>
                      )}

                      {/* Writer actions */}
                      {isEditableByMe && (
                        <button onClick={() => openEditor(article)} className="rounded-lg p-2 text-white/25 transition-all hover:bg-white/8 hover:text-white">
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      {isOwn && article.status === "draft" && (
                        <button onClick={() => updateStatus(article, "submitted")} title="Submit for review"
                          className="rounded-lg p-2 text-blue-400/50 transition-all hover:bg-blue-500/10 hover:text-blue-400">
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      {isOwn && article.status === "submitted" && (
                        <button onClick={() => updateStatus(article, "draft")} title="Withdraw from review"
                          className="rounded-lg p-2 text-white/25 transition-all hover:bg-white/8 hover:text-white">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}

                      {/* Editor actions */}
                      {role.canEdit && article.status === "submitted" && (
                        <>
                          <button onClick={() => updateStatus(article, "approved")} title="Approve"
                            className="rounded-lg p-2 text-purple-400/50 transition-all hover:bg-purple-500/10 hover:text-purple-400">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setRejectingId(article.id)} title="Reject"
                            className="rounded-lg p-2 text-[#B30000]/50 transition-all hover:bg-[#B30000]/10 hover:text-[#B30000]">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {/* Publisher actions */}
                      {role.canPublish && article.status === "approved" && (
                        <button onClick={() => updateStatus(article, "published")} title="Publish"
                          className="rounded-lg p-2 text-green-400/50 transition-all hover:bg-green-500/10 hover:text-green-400">
                          <Globe className="h-4 w-4" />
                        </button>
                      )}
                      {role.canPublish && article.status === "published" && (
                        <button onClick={() => updateStatus(article, "archived")} title="Archive"
                          className="rounded-lg p-2 text-white/25 transition-all hover:bg-white/8 hover:text-white">
                          <Clock className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete — own drafts or admin */}
                      {(isOwn && article.status === "draft" || role.isSuperAdmin) && (
                        <button onClick={() => deleteArticle(article.id)}
                          className="rounded-lg p-2 text-white/20 transition-all hover:bg-[#B30000]/15 hover:text-[#B30000]">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection note input */}
                  {isRejectOpen && (
                    <div className="border-t border-white/6 px-3 pb-3 pt-2">
                      <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-[#B30000]">Rejection reason (shown to author)</p>
                      <div className="flex gap-2">
                        <input value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                          placeholder="Be specific so the author can improve..."
                          className="flex-1 rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#B30000]/40 focus:outline-none" />
                        <button onClick={() => updateStatus(article, "rejected", rejectNote)}
                          className="rounded-lg bg-[#B30000] px-3 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
                          Reject
                        </button>
                        <button onClick={() => { setRejectingId(null); setRejectNote(""); }}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/30 hover:text-white">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Moderation note display */}
                  {article.status === "rejected" && article.moderation_note && (
                    <div className="border-t border-[#B30000]/15 px-3 pb-3 pt-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#B30000]">Editor feedback</p>
                      <p className="mt-1 text-xs text-white/50">{article.moderation_note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function FormField({ label, value, onChange, placeholder, bold }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; bold?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none ${bold ? "font-bold" : ""}`} />
    </div>
  );
}
