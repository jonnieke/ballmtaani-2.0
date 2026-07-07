import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import AdminLayout from "../components/AdminLayout";
import { Plus, CheckCircle2, XCircle, Trash2, Save, X } from "lucide-react";

interface PartnerTeam {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  contact_email: string | null;
  approved: boolean;
  created_at: string;
}

const EMPTY: Partial<PartnerTeam> = {
  name: "",
  slug: "",
  logo_url: "",
  description: "",
  contact_email: "",
  approved: false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
}

async function adminPartnerRequest(path = "", init: RequestInit = {}) {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please log in again before managing partners.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`/api/admin-partners${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Could not save partner team");
  return payload;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PartnerTeam> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminPartnerRequest();
      setPartners((data.partners as PartnerTeam[]) || []);
    } catch (err: any) {
      setError(err?.message || "Could not load partner teams.");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim()) { setError("Name required."); return; }
    setSaving(true);
    setError("");

    const slug = editing.id ? editing.slug : slugify(editing.name || "");
    const payload = {
      name: editing.name,
      slug,
      logo_url: editing.logo_url || null,
      description: editing.description || null,
      contact_email: editing.contact_email || null,
      approved: editing.approved ?? false,
    };

    try {
      if (editing.id) {
        await adminPartnerRequest(`?id=${encodeURIComponent(editing.id)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminPartnerRequest("", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      load();
    } catch (err: any) {
      setError(err?.message || "Could not save partner team.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleApproval(p: PartnerTeam) {
    setError("");
    try {
      await adminPartnerRequest(`?id=${encodeURIComponent(p.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ approved: !p.approved }),
      });
      load();
    } catch (err: any) {
      setError(err?.message || "Could not update partner approval.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this partner? Their articles will be unlinked.")) return;
    setError("");
    try {
      await adminPartnerRequest(`?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      load();
    } catch (err: any) {
      setError(err?.message || "Could not delete partner team.");
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">Partner Teams</h1>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">Approved teams can publish articles on BallMtaani</p>
          </div>
          <button onClick={() => { setEditing(EMPTY); setError(""); }}
            className="flex items-center gap-2 rounded-xl bg-[#B30000] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
            <Plus className="h-3.5 w-3.5" /> Add Partner
          </button>
        </div>

        {error && <p className="rounded-xl border border-[#B30000]/20 bg-[#B30000]/12 px-3 py-2 text-xs font-bold text-[#ff8a8a]">{error}</p>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatPill label="Approved" value={partners.filter(p => p.approved).length} color="text-green-400" />
          <StatPill label="Pending" value={partners.filter(p => !p.approved).length} color="text-yellow-400" />
          <StatPill label="Total" value={partners.length} color="text-white" />
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}</div>
        ) : partners.length === 0 ? (
          <div className="rounded-2xl border border-white/6 bg-[#0d1018] py-14 text-center">
            <p className="font-black uppercase tracking-widest text-white/25">No partner teams</p>
            <p className="mt-1 text-xs text-white/15">Add teams that will write football articles for BallMtaani</p>
          </div>
        ) : (
          <div className="space-y-2">
            {partners.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0d1018] p-3 transition-all hover:border-white/14">
                {p.logo_url && <img src={p.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-black text-white">{p.name}</p>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider
                      ${p.approved ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                      {p.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[9px] text-white/25">{p.contact_email || p.slug}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => toggleApproval(p)} title={p.approved ? "Revoke access" : "Approve partner"}
                    className={`rounded-lg p-2 transition-all hover:bg-white/8 ${p.approved ? "text-green-400 hover:text-red-400" : "text-white/25 hover:text-green-400"}`}>
                    {p.approved ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </button>
                  <button onClick={() => { setEditing(p); setError(""); }}
                    className="rounded-lg p-2 text-white/25 transition-all hover:bg-white/8 hover:text-white">
                    <Save className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(p.id)}
                    className="rounded-lg p-2 text-white/25 transition-all hover:bg-[#B30000]/15 hover:text-[#B30000]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1018] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">{editing.id ? "Edit Partner" : "Add Partner"}</h2>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            {error && <p className="mb-3 rounded-lg bg-[#B30000]/15 px-3 py-2 text-xs text-[#ff6b6b]">{error}</p>}
            <div className="space-y-3">
              <Field label="Team / Publication Name *" value={editing.name || ""} onChange={v => setEditing(e => ({ ...e!, name: v }))} placeholder="e.g. KPL Digest" />
              <Field label="Contact Email" value={editing.contact_email || ""} onChange={v => setEditing(e => ({ ...e!, contact_email: v }))} placeholder="editor@example.com" />
              <Field label="Logo URL" value={editing.logo_url || ""} onChange={v => setEditing(e => ({ ...e!, logo_url: v }))} placeholder="https://..." />
              <Field label="Description" value={editing.description || ""} onChange={v => setEditing(e => ({ ...e!, description: v }))} placeholder="Short bio" />
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
                <input type="checkbox" checked={editing.approved ?? false} onChange={e => setEditing(f => ({ ...f!, approved: e.target.checked }))} className="h-4 w-4 accent-green-400" />
                <span className="text-sm font-bold text-white/60">Approved to publish articles</span>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">
                <X className="h-3 w-3" /> Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B30000] px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000] disabled:opacity-40">
                <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save Partner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/6 bg-[#0d1018] px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/25">{label}</p>
      <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
    </div>
  );
}
