import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Search, FileText, MessageSquare, Users, X, Clock } from "lucide-react";
import SEO from "../components/SEO";

type Tab = "all" | "articles" | "debates" | "zones";

interface Result {
  type: "article" | "debate" | "zone";
  id: string;
  title: string;
  sub: string;
  href: string;
  time?: string;
}

const RECENT_KEY = "mtaani_recent_searches";
function getRecent(): string[] { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; } }
function addRecent(q: string) {
  const r = [q, ...getRecent().filter(x => x !== q)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(r));
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(getRecent);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || !supabase) { setResults([]); return; }
    setLoading(true);
    addRecent(q.trim());
    setRecent(getRecent());

    const [{ data: articles }, { data: debates }, { data: zones }] = await Promise.all([
      supabase.from("articles").select("id,slug,title,excerpt,published_at,partner_team_name").eq("status","published").ilike("title", `%${q}%`).limit(10),
      supabase.from("debates").select("id,title,author,status,created_at").ilike("title", `%${q}%`).limit(8),
      supabase.from("fan_zones").select("id,team,team_name,region").ilike("team_name", `%${q}%`).limit(6),
    ]);

    const all: Result[] = [
      ...(articles || []).map((a: any) => ({
        type: "article" as const, id: a.id, title: a.title,
        sub: a.partner_team_name || "BallMtaani",
        href: `/article/${a.slug}`,
        time: a.published_at,
      })),
      ...(debates || []).map((d: any) => ({
        type: "debate" as const, id: d.id, title: d.title,
        sub: `by ${d.author} · ${d.status}`,
        href: "/debates",
        time: d.created_at,
      })),
      ...(zones || []).map((z: any) => ({
        type: "zone" as const, id: z.id,
        title: z.team_name || z.team,
        sub: `Fan Zone · ${z.region || "Global"}`,
        href: "/fan-zones",
      })),
    ];
    setResults(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (query.length > 1) search(query); else setResults([]); }, 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const filtered = tab === "all" ? results : results.filter(r => {
    if (tab === "articles") return r.type === "article";
    if (tab === "debates")  return r.type === "debate";
    if (tab === "zones")    return r.type === "zone";
    return true;
  });

  const ICONS = { article: FileText, debate: MessageSquare, zone: Users };
  const COLORS = { article: "text-[#FFD700]", debate: "text-blue-400", zone: "text-green-400" };
  const BADGES = { article: "Article", debate: "Debate", zone: "Fan Zone" };

  return (
    <>
      <SEO title="Search | BallMtaani" description="Search articles, debates and fan zones on BallMtaani." path="/search" />
      <div className="min-h-screen bg-[#0B0B0B] pb-24">
        {/* Search header */}
        <div className="sticky top-0 z-20 border-b border-white/6 bg-[#0B0B0B]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl px-4 py-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search articles, debates, fan zones…"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-10 text-white placeholder-white/30 focus:border-white/20 focus:outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Tabs */}
            {results.length > 0 && (
              <div className="mt-3 flex gap-1">
                {(["all","articles","debates","zones"] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all
                      ${tab === t ? "bg-white/12 text-white" : "text-white/30 hover:text-white"}`}>
                    {t} {t !== "all" && `(${results.filter(r => r.type === t.slice(0,-1) as any).length})`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 pt-6">
          {/* Recent searches */}
          {!query && recent.length > 0 && (
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Recent</p>
                <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }} className="text-[9px] text-white/20 hover:text-white">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map(r => (
                  <button key={r} onClick={() => setQuery(r)}
                    className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/50 hover:bg-white/10 hover:text-white">
                    <Clock className="h-3 w-3" /> {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick nav */}
          {!query && (
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/25">Browse</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { label: "Latest Articles", href: "/news", icon: FileText, color: "border-[#FFD700]/15 text-[#FFD700]" },
                  { label: "Active Debates", href: "/debates", icon: MessageSquare, color: "border-blue-500/15 text-blue-400" },
                  { label: "Fan Zones", href: "/fan-zones", icon: Users, color: "border-green-500/15 text-green-400" },
                  { label: "WC26 Hub", href: "/world-cup-2026", icon: Search, color: "border-[#FFD700]/15 text-[#FFD700]" },
                  { label: "Live Matches", href: "/matches", icon: Search, color: "border-[#B30000]/15 text-[#B30000]" },
                  { label: "Leaderboard", href: "/leaderboard", icon: Search, color: "border-white/10 text-white/40" },
                ].map(({ label, href, icon: Icon, color }) => (
                  <Link key={href} href={href} className={`flex items-center gap-2 rounded-xl border bg-white/3 px-4 py-3 text-sm font-bold transition-all hover:bg-white/6 ${color}`}>
                    <Icon className="h-4 w-4 shrink-0" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />)}</div>
          )}

          {/* Results */}
          {!loading && query && filtered.length === 0 && (
            <div className="py-16 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-white/10" />
              <p className="font-black uppercase tracking-widest text-white/25">No results for "{query}"</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-2">
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/25">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
              {filtered.map(r => {
                const Icon = ICONS[r.type];
                return (
                  <Link key={`${r.type}-${r.id}`} href={r.href}
                    className="flex items-center gap-3 rounded-xl border border-white/6 bg-[#0d1018] px-4 py-3 transition-all hover:border-white/14 hover:bg-[#111]">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 ${COLORS[r.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">{r.title}</p>
                      <p className="text-[10px] text-white/35">{r.sub}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border-white/8 ${COLORS[r.type]}`}>
                      {BADGES[r.type]}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
