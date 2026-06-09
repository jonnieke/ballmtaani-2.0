import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import AdminLayout from "../components/AdminLayout";
import { Package, CheckCircle2, XCircle, Clock, Truck, Gift, Plus, Edit3, Save, X } from "lucide-react";

type RedemptionStatus = "pending" | "processing" | "fulfilled" | "cancelled";

interface Redemption {
  id: string;
  user_email: string | null;
  display_name: string | null;
  item_name: string;
  item_category: string;
  cost_mtc: number;
  contact_phone: string | null;
  delivery_address: string | null;
  delivery_name: string | null;
  notes: string | null;
  status: RedemptionStatus;
  admin_note: string | null;
  fulfilled_at: string | null;
  created_at: string;
}

interface RewardItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  cost_mtc: number;
  partner: string | null;
  stock: number | null;
  active: boolean;
  sort_order: number;
}

const STATUS_META: Record<RedemptionStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: "Pending",    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",   icon: Clock },
  processing: { label: "Processing", color: "text-blue-400 bg-blue-400/10 border-blue-400/20",         icon: Truck },
  fulfilled:  { label: "Fulfilled",  color: "text-green-400 bg-green-400/10 border-green-400/20",      icon: CheckCircle2 },
  cancelled:  { label: "Cancelled",  color: "text-white/25 bg-white/5 border-white/10",                icon: XCircle },
};

const CATEGORY_EMOJI: Record<string, string> = { airtime: "📱", data: "🌐", merch: "👕", digital: "🎁" };

export default function AdminRewardsPage() {
  const [tab, setTab] = useState<"redemptions" | "catalog">("redemptions");
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [items, setItems] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RedemptionStatus | "all">("pending");
  const [editNote, setEditNote] = useState<{ id: string; note: string } | null>(null);
  const [editItem, setEditItem] = useState<Partial<RewardItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const [{ data: r }, { data: i }] = await Promise.all([
      supabase.from("reward_redemptions").select("*").order("created_at", { ascending: false }),
      supabase.from("reward_items").select("*").order("sort_order"),
    ]);
    setRedemptions((r as Redemption[]) || []);
    setItems((i as RewardItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: RedemptionStatus, note?: string) {
    if (!supabase) return;
    await supabase.from("reward_redemptions").update({
      status,
      admin_note: note ?? null,
      fulfilled_at: status === "fulfilled" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setEditNote(null);
    load();
  }

  async function saveItem() {
    if (!supabase || !editItem) return;
    setSaving(true);
    const payload = {
      name: editItem.name, description: editItem.description || null,
      category: editItem.category || "merch", cost_mtc: editItem.cost_mtc || 0,
      partner: editItem.partner || null, stock: editItem.stock ?? null,
      active: editItem.active ?? true, sort_order: editItem.sort_order ?? 0,
    };
    if (editItem.id) {
      await supabase.from("reward_items").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("reward_items").insert(payload);
    }
    setSaving(false);
    setEditItem(null);
    load();
  }

  const shown = statusFilter === "all" ? redemptions : redemptions.filter(r => r.status === statusFilter);
  const stats = {
    pending:   redemptions.filter(r => r.status === "pending").length,
    processing: redemptions.filter(r => r.status === "processing").length,
    fulfilled: redemptions.filter(r => r.status === "fulfilled").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">Rewards Engine</h1>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/28">
              MTC redemptions · Fulfillment · Catalog
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",    value: stats.pending,   color: "text-yellow-400" },
            { label: "Processing", value: stats.processing, color: "text-blue-400" },
            { label: "Fulfilled",  value: stats.fulfilled, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/6 bg-[#0d1018] px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/25">{s.label}</p>
              <p className={`mt-1 text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-white/6 bg-[#0d1018] p-1">
          {[
            { key: "redemptions", label: "Redemption Queue" },
            { key: "catalog",     label: "Reward Catalog" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.key ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── REDEMPTIONS ── */}
        {tab === "redemptions" && (
          <div className="space-y-4">
            {/* Status filter */}
            <div className="flex flex-wrap gap-1.5">
              {(["all", "pending", "processing", "fulfilled", "cancelled"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all
                    ${statusFilter === s ? "border-white/20 bg-white/10 text-white" : "border-white/6 text-white/30 hover:text-white"}`}>
                  {s} {s !== "all" && s in stats ? `(${stats[s as keyof typeof stats] ?? 0})` : ""}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />)}</div>
            ) : shown.length === 0 ? (
              <div className="rounded-2xl border border-white/6 bg-[#0d1018] py-14 text-center">
                <Package className="mx-auto mb-2 h-8 w-8 text-white/10" />
                <p className="font-black uppercase tracking-widest text-white/20">No {statusFilter !== "all" ? statusFilter : ""} redemptions</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shown.map(r => {
                  const sm = STATUS_META[r.status];
                  const Icon = sm.icon;
                  return (
                    <div key={r.id} className="rounded-xl border border-white/8 bg-[#0d1018] p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{CATEGORY_EMOJI[r.item_category] ?? "🎁"}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-white">{r.item_name}</p>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${sm.color}`}>
                              <Icon className="h-2.5 w-2.5" /> {sm.label}
                            </span>
                            <span className="text-[9px] font-bold text-[#FFD700]">{r.cost_mtc.toLocaleString()} MTC</span>
                          </div>
                          <div className="mt-1 space-y-0.5 text-[10px] text-white/40">
                            <p>👤 {r.display_name || r.user_email || "Unknown user"}</p>
                            {r.contact_phone && <p>📱 {r.contact_phone}</p>}
                            {r.delivery_name && <p>📦 {r.delivery_name} — {r.delivery_address}</p>}
                            {r.notes && <p>💬 "{r.notes}"</p>}
                            {r.admin_note && <p className="text-blue-400/60">Admin: {r.admin_note}</p>}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1.5">
                          {r.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(r.id, "processing")}
                                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/20">
                                Process
                              </button>
                              <button onClick={() => updateStatus(r.id, "fulfilled")}
                                className="rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-green-400 hover:bg-green-500/20">
                                Fulfil
                              </button>
                              <button onClick={() => updateStatus(r.id, "cancelled")}
                                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white">
                                Cancel
                              </button>
                            </>
                          )}
                          {r.status === "processing" && (
                            <button onClick={() => updateStatus(r.id, "fulfilled")}
                              className="rounded-lg bg-green-600 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white hover:bg-green-500">
                              Mark Fulfilled
                            </button>
                          )}
                          <button onClick={() => setEditNote({ id: r.id, note: r.admin_note || "" })}
                            className="rounded-lg border border-white/8 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white">
                            Add Note
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CATALOG ── */}
        {tab === "catalog" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => setEditItem({ name: "", category: "merch", cost_mtc: 0, active: true, sort_order: 0 })}
                className="flex items-center gap-2 rounded-xl bg-[#B30000] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-[#0d1018] p-3">
                <span className="text-xl">{CATEGORY_EMOJI[item.category] ?? "🎁"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-white">{item.name}</p>
                    {!item.active && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[8px] font-black uppercase text-white/30">Inactive</span>}
                    {item.partner && <span className="rounded bg-[#FFD700]/10 px-1.5 py-0.5 text-[8px] font-black text-[#FFD700]/70">{item.partner}</span>}
                  </div>
                  <div className="mt-0.5 flex gap-2 text-[9px] text-white/30">
                    <span className="font-black text-[#FFD700]">{item.cost_mtc.toLocaleString()} MTC</span>
                    {item.stock != null && <span>· Stock: {item.stock}</span>}
                    <span>· {item.category}</span>
                  </div>
                </div>
                <button onClick={() => setEditItem(item)} className="rounded-lg p-2 text-white/25 hover:bg-white/8 hover:text-white">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add note modal */}
      {editNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1018] p-5">
            <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-white">Admin Note</h3>
            <textarea value={editNote.note} onChange={e => setEditNote(n => n ? { ...n, note: e.target.value } : n)}
              rows={3} placeholder="e.g. Airtime sent via Safaricom at 14:30"
              className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setEditNote(null)} className="flex-1 rounded-xl border border-white/10 py-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
              <button onClick={() => updateStatus(editNote.id, redemptions.find(r => r.id === editNote.id)?.status || "pending", editNote.note)}
                className="flex-1 rounded-xl bg-[#B30000] py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000]">
                <Save className="mr-1 inline h-3 w-3" /> Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit item modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setEditItem(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1018] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">{editItem.id ? "Edit Item" : "Add Item"}</h3>
              <button onClick={() => setEditItem(null)} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Name *", key: "name", placeholder: "e.g. Ksh 100 Airtime" },
                { label: "Description", key: "description", placeholder: "Short description" },
                { label: "Partner", key: "partner", placeholder: "credoFaster or BallMtaani" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">{label}</label>
                  <input value={(editItem as any)[key] || ""} onChange={e => setEditItem(f => ({ ...f!, [key]: e.target.value }))} placeholder={placeholder}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Category</label>
                  <select value={editItem.category || "merch"} onChange={e => setEditItem(f => ({ ...f!, category: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-[#FFD700]/40 focus:outline-none">
                    <option value="airtime">Airtime</option>
                    <option value="data">Data</option>
                    <option value="merch">Merch</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Cost (MTC)</label>
                  <input type="number" value={editItem.cost_mtc || 0} onChange={e => setEditItem(f => ({ ...f!, cost_mtc: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-[#FFD700]/40 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Stock (blank = unlimited)</label>
                  <input type="number" value={editItem.stock ?? ""} onChange={e => setEditItem(f => ({ ...f!, stock: e.target.value ? Number(e.target.value) : null }))} placeholder="unlimited"
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#FFD700]/40 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">Sort Order</label>
                  <input type="number" value={editItem.sort_order ?? 0} onChange={e => setEditItem(f => ({ ...f!, sort_order: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-[#FFD700]/40 focus:outline-none" />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
                <input type="checkbox" checked={editItem.active ?? true} onChange={e => setEditItem(f => ({ ...f!, active: e.target.checked }))} className="h-4 w-4 accent-green-400" />
                <span className="text-sm font-bold text-white/60">Active (visible to fans)</span>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditItem(null)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
              <button onClick={saveItem} disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#B30000] py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-[#cc0000] disabled:opacity-40">
                <Save className="h-3 w-3" /> {saving ? "Saving…" : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
