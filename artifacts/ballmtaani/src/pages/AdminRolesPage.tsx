import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import AdminLayout from "../components/AdminLayout";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { Link } from "wouter";
import { Plus, Trash2, X, Save, ShieldCheck, Pen, Eye, Globe } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  user_email: string | null;
  display_name: string | null;
  role: "writer" | "editor" | "publisher";
  partner_team_name: string | null;
  created_at: string;
}

const ROLE_META = {
  writer: {
    label: "Writer",
    desc: "Create articles, edit own drafts, submit for review",
    icon: Pen,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  editor: {
    label: "Editor",
    desc: "Review submitted articles, approve or reject, edit any article",
    icon: Eye,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  publisher: {
    label: "Publisher",
    desc: "Publish and unpublish approved articles — includes all Editor permissions",
    icon: Globe,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
};

export default function AdminRolesPage() {
  const isSuperAdmin = useIsAdmin();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_id: "", user_email: "", display_name: "", role: "writer" as "writer" | "editor" | "publisher", partner_team_name: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_content_roles")
      .select("*")
      .order("created_at", { ascending: false });
    setRoles((data as UserRole[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function assign() {
    if (!supabase) return;
    if (!form.user_id.trim()) { setError("User ID is required."); return; }
    setSaving(true); setError("");
    const { error: err } = await supabase.from("user_content_roles").upsert({
      user_id: form.user_id.trim(),
      user_email: form.user_email.trim() || null,
      display_name: form.display_name.trim() || null,
      role: form.role,
      partner_team_name: form.partner_team_name.trim() || null,
    }, { onConflict: "user_id,role" });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowForm(false);
    setForm({ user_id: "", user_email: "", display_name: "", role: "writer", partner_team_name: "" });
    load();
  }

  async function revoke(id: string) {
    if (!supabase || !confirm("Revoke this role?")) return;
    await supabase.from("user_content_roles").delete().eq("id", id);
    load();
  }

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <ShieldCheck className="h-8 w-8 text-white/15" />
          <p className="font-black uppercase tracking-widest text-white/30">Super Admin Only</p>
          <Link href="/admin" className="text-xs text-white/25 hover:text-white">← Back to dashboard</Link>
        </div>
      </AdminLayout>
    );
  }

  const byRole = (r: "writer" | "editor" | "publisher") => roles.filter(x => x.role === r);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">Content Roles</h1>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">
              Assign article workflow roles to team members
            </p>
          </div>
          <button onClick={() => { setShowForm(true); setError(""); }}
            className="flex items-center gap-2 rounded-xl bg-[#B30000] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
            <Plus className="h-3.5 w-3.5" /> Assign Role
          </button>
        </div>

        {/* Role definitions */}
        <div className="grid gap-3 sm:grid-cols-3">
          {(["writer", "editor", "publisher"] as const).map(role => {
            const m = ROLE_META[role];
            const Icon = m.icon;
            return (
              <div key={role} className={`rounded-xl border p-4 ${m.bg}`}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${m.color}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${m.color}`}>{m.label}</span>
                  <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-black text-white/40">{byRole(role).length}</span>
                </div>
                <p className="text-[11px] text-white/45">{m.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Workflow diagram */}
        <div className="rounded-xl border border-white/6 bg-[#0d1018] px-4 py-3">
          <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-white/25">Article Flow</p>
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
            {[
              { label: "Draft", color: "text-white/40", role: "Writer" },
              { label: "→" },
              { label: "Submitted", color: "text-blue-400", role: "Writer submits" },
              { label: "→" },
              { label: "Approved", color: "text-purple-400", role: "Editor approves" },
              { label: "→" },
              { label: "Published", color: "text-green-400", role: "Publisher publishes" },
            ].map((s, i) => (
              <span key={i} className={s.color || "text-white/20"}>
                {s.label}{s.role ? <span className="text-white/20 text-[9px] ml-1">({s.role})</span> : ""}
              </span>
            ))}
            <span className="ml-2 text-[#B30000]">← Rejected</span>
            <span className="text-white/20 text-[9px]">(Editor rejects → back to draft)</span>
          </div>
        </div>

        {/* Role lists */}
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />)}</div>
        ) : roles.length === 0 ? (
          <div className="rounded-2xl border border-white/6 bg-[#0d1018] py-14 text-center">
            <p className="font-black uppercase tracking-widest text-white/25">No roles assigned</p>
            <p className="mt-1 text-xs text-white/15">Assign roles to team members to unlock the article workflow</p>
          </div>
        ) : (
          <div className="space-y-1">
            {roles.map(r => {
              const m = ROLE_META[r.role];
              const Icon = m.icon;
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-[#0d1018] px-4 py-3 transition-all hover:border-white/12">
                  <Icon className={`h-4 w-4 shrink-0 ${m.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-black text-white">{r.display_name || r.user_email || r.user_id}</p>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider border ${m.bg} ${m.color}`}>{m.label}</span>
                    </div>
                    <div className="mt-0.5 flex gap-2 text-[9px] text-white/25">
                      {r.user_email && <span>{r.user_email}</span>}
                      {r.partner_team_name && <span>· {r.partner_team_name}</span>}
                      <span className="font-mono text-white/15">{r.user_id.slice(0, 8)}…</span>
                    </div>
                  </div>
                  <button onClick={() => revoke(r.id)}
                    className="shrink-0 rounded-lg p-2 text-white/20 transition-all hover:bg-[#B30000]/15 hover:text-[#B30000]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1018] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Assign Role</h2>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            <div className="mb-3 rounded-xl border border-[#FFD700]/12 bg-[#FFD700]/5 px-3 py-2 text-[11px] text-[#FFD700]/60">
              Find the user's ID in Supabase → Authentication → Users. Or ask them to share it from their profile page.
            </div>

            {error && <p className="mb-3 rounded-lg bg-[#B30000]/15 px-3 py-2 text-xs text-[#ff6b6b]">{error}</p>}

            <div className="space-y-3">
              <Field label="Supabase User ID *" value={form.user_id} onChange={v => setForm(f => ({ ...f, user_id: v }))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" mono />
              <Field label="Email (for display)" value={form.user_email} onChange={v => setForm(f => ({ ...f, user_email: v }))} placeholder="writer@example.com" />
              <Field label="Display Name" value={form.display_name} onChange={v => setForm(f => ({ ...f, display_name: v }))} placeholder="Jane Doe" />
              <Field label="Partner Team (optional)" value={form.partner_team_name} onChange={v => setForm(f => ({ ...f, partner_team_name: v }))} placeholder="e.g. KPL Digest" />

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/40">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["writer", "editor", "publisher"] as const).map(role => {
                    const m = ROLE_META[role];
                    const Icon = m.icon;
                    return (
                      <button key={role} onClick={() => setForm(f => ({ ...f, role }))}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all
                          ${form.role === role ? `${m.bg} ${m.color}` : "border-white/8 text-white/30 hover:border-white/20"}`}>
                        <Icon className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-wider">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-white/30">{ROLE_META[form.role].desc}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowForm(false)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">
                <X className="h-3 w-3" /> Cancel
              </button>
              <button onClick={assign} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B30000] px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000] disabled:opacity-40">
                <Save className="h-3 w-3" /> {saving ? "Assigning…" : "Assign Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none ${mono ? "font-mono text-xs" : ""}`} />
    </div>
  );
}
