import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import AdminLayout from "../components/AdminLayout";
import { Plus, Edit3, Trash2, Pause, Play, Eye, TrendingUp, Save, X } from "lucide-react";

interface AdCampaign {
  id: string;
  name: string;
  advertiser: string | null;
  image_url: string | null;
  destination_url: string;
  cta_text: string;
  label: string;
  placement: string;
  status: "active" | "paused" | "ended";
  priority: number;
  starts_at: string;
  ends_at: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
}

const EMPTY: Partial<AdCampaign> = {
  name: "",
  advertiser: "",
  image_url: "",
  destination_url: "",
  cta_text: "Learn More",
  label: "Sponsor",
  placement: "horizontal",
  status: "active",
  priority: 0,
  ends_at: null,
};

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AdCampaign> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("ad_campaigns")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    setAds((data as AdCampaign[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!supabase || !editing) return;
    if (!editing.name?.trim()) { setError("Campaign name required."); return; }
    if (!editing.destination_url?.trim()) { setError("Destination URL required."); return; }
    setSaving(true);
    setError("");
    const payload = {
      name: editing.name,
      advertiser: editing.advertiser || null,
      image_url: editing.image_url || null,
      destination_url: editing.destination_url,
      cta_text: editing.cta_text || "Learn More",
      label: editing.label || "Sponsor",
      placement: editing.placement || "horizontal",
      status: editing.status || "active",
      priority: editing.priority || 0,
      ends_at: editing.ends_at || null,
      updated_at: new Date().toISOString(),
    };
    const { error: err } = editing.id
      ? await supabase.from("ad_campaigns").update(payload).eq("id", editing.id)
      : await supabase.from("ad_campaigns").insert({ ...payload, starts_at: new Date().toISOString(), impressions: 0, clicks: 0 });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setEditing(null);
    load();
  }

  async function toggleStatus(ad: AdCampaign) {
    if (!supabase) return;
    await supabase.from("ad_campaigns").update({ status: ad.status === "active" ? "paused" : "active" }).eq("id", ad.id);
    load();
  }

  async function remove(id: string) {
    if (!supabase || !confirm("Delete this campaign?")) return;
    await supabase.from("ad_campaigns").delete().eq("id", id);
    load();
  }

  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">Ad Campaigns</h1>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">Direct sponsor banners · Override AdSense</p>
          </div>
          <button onClick={() => { setEditing(EMPTY); setError(""); }}
            className="flex items-center gap-2 rounded-xl bg-[#B30000] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
            <Plus className="h-3.5 w-3.5" /> New Campaign
          </button>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active", value: ads.filter(a => a.status === "active").length, color: "text-green-400" },
            { label: "Impressions", value: totalImpressions.toLocaleString(), color: "text-[#FFD700]" },
            { label: "CTR", value: `${ctr}%`, color: "text-blue-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-white/6 bg-[#0d1018] px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/25">{label}</p>
              <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="rounded-xl border border-[#FFD700]/12 bg-[#FFD700]/5 px-4 py-3 text-[11px] font-bold text-[#FFD700]/60">
          Active campaigns replace AdSense for the matching placement. Highest priority shown first. Impressions and clicks are tracked automatically.
        </div>

        {/* Campaign list */}
        {loading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />)}</div>
        ) : ads.length === 0 ? (
          <div className="rounded-2xl border border-white/6 bg-[#0d1018] py-14 text-center">
            <p className="font-black uppercase tracking-widest text-white/25">No campaigns yet</p>
            <p className="mt-1 text-xs text-white/15">Create one to replace AdSense with a direct sponsor</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ads.map(ad => (
              <div key={ad.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0d1018] p-3 transition-all hover:border-white/14">
                {ad.image_url && <img src={ad.image_url} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-black text-white">{ad.name}</p>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider
                      ${ad.status === "active" ? "bg-green-500/20 text-green-400" : ad.status === "paused" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/30"}`}>
                      {ad.status}
                    </span>
                    <span className="shrink-0 rounded border border-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/30">{ad.placement}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[9px] text-white/25">
                    <span className="flex items-center gap-1"><Eye className="h-2.5 w-2.5" />{ad.impressions.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-2.5 w-2.5" />{ad.clicks} clicks</span>
                    {ad.advertiser && <span>{ad.advertiser}</span>}
                    <span>Priority {ad.priority}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => toggleStatus(ad)} title={ad.status === "active" ? "Pause" : "Activate"}
                    className="rounded-lg p-2 text-white/25 transition-all hover:bg-white/8 hover:text-white">
                    {ad.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button onClick={() => { setEditing(ad); setError(""); }}
                    className="rounded-lg p-2 text-white/25 transition-all hover:bg-white/8 hover:text-white">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(ad.id)}
                    className="rounded-lg p-2 text-white/25 transition-all hover:bg-[#B30000]/15 hover:text-[#B30000]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1018] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">{editing.id ? "Edit Campaign" : "New Campaign"}</h2>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            {error && <p className="mb-3 rounded-lg bg-[#B30000]/15 px-3 py-2 text-xs text-[#ff6b6b]">{error}</p>}

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <Field label="Campaign Name *" value={editing.name || ""} onChange={v => setEditing(e => ({ ...e!, name: v }))} placeholder="e.g. Local football partner" />
              <Field label="Advertiser" value={editing.advertiser || ""} onChange={v => setEditing(e => ({ ...e!, advertiser: v }))} placeholder="Company name" />
              <Field label="Destination URL *" value={editing.destination_url || ""} onChange={v => setEditing(e => ({ ...e!, destination_url: v }))} placeholder="https://..." />
              <Field label="Banner Image URL" value={editing.image_url || ""} onChange={v => setEditing(e => ({ ...e!, image_url: v }))} placeholder="https://..." />
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA Text" value={editing.cta_text || ""} onChange={v => setEditing(e => ({ ...e!, cta_text: v }))} placeholder="Learn More" />
                <Field label="Label" value={editing.label || ""} onChange={v => setEditing(e => ({ ...e!, label: v }))} placeholder="Sponsor" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">Placement</label>
                  <select value={editing.placement || "horizontal"} onChange={e => setEditing(f => ({ ...f!, placement: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-[#FFD700]/40 focus:outline-none">
                    <option value="horizontal">Horizontal</option>
                    <option value="square">Square</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">Priority</label>
                  <input type="number" value={editing.priority ?? 0} onChange={e => setEditing(f => ({ ...f!, priority: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-[#FFD700]/40 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-white/40">End Date (optional)</label>
                <input type="datetime-local" value={editing.ends_at ? editing.ends_at.slice(0, 16) : ""}
                  onChange={e => setEditing(f => ({ ...f!, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-[#FFD700]/40 focus:outline-none" />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">
                <X className="h-3 w-3" /> Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B30000] px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000] disabled:opacity-40">
                <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
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
