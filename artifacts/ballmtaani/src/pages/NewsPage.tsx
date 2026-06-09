import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { fetchFootballNews, timeAgo, type NewsArticle } from "../lib/news-api";
import { ExternalLink, Search } from "lucide-react";
import SEO from "../components/SEO";

interface PartnerArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  author_name: string;
  partner_team_name: string | null;
  tags: string[];
  is_wc26: boolean;
  published_at: string;
}

const DEFAULT_IMG = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg";

export default function NewsPage() {
  const [partner, setPartner] = useState<PartnerArticle[]>([]);
  const [rss, setRss] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      supabase
        ? supabase.from("articles").select("id,slug,title,excerpt,thumbnail_url,author_name,partner_team_name,tags,is_wc26,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(50).then(({ data }) => data as PartnerArticle[] || [])
        : Promise.resolve([]),
      fetchFootballNews(),
    ]).then(([p, r]) => {
      setPartner(p);
      setRss(r);
      setLoading(false);
    });
  }, []);

  const q = query.toLowerCase();
  const filteredPartner = partner.filter(a =>
    !q || a.title.toLowerCase().includes(q) || (a.partner_team_name || "").toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q))
  );
  const filteredRss = rss.filter(a =>
    !q || a.title.toLowerCase().includes(q) || a.source.toLowerCase().includes(q)
  );

  return (
    <>
      <SEO
        title="Football News | BallMtaani"
        description="Latest football news, partner articles and breaking headlines on BallMtaani — Kenya's loudest fan room."
        path="/news"
      />

      <div className="min-h-screen bg-[#0B0B0B] pb-24">

        {/* Header */}
        <div className="border-b border-white/6 bg-[#070a0f]">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#B30000]">BallMtaani</p>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">Football News</h1>
                <p className="mt-1 text-sm text-white/30">Partner articles · Breaking headlines · WC26 coverage</p>
              </div>

              {/* Search */}
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/25 focus:border-white/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-8">

          {/* Partner articles */}
          {(loading || filteredPartner.length > 0) && (
            <section className="mb-12">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-4 w-1 rounded-full bg-[#B30000]" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-white/60">From Our Partners</h2>
                {!loading && <span className="rounded-full bg-white/8 px-2 py-0.5 text-[9px] font-black text-white/30">{filteredPartner.length}</span>}
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-white/5 bg-[#111]">
                      <div className="h-40 bg-white/5" />
                      <div className="space-y-2 p-4">
                        <div className="h-2 w-20 rounded bg-white/10" />
                        <div className="h-4 rounded bg-white/10" />
                        <div className="h-4 w-3/4 rounded bg-white/8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPartner.length === 0 ? (
                <p className="text-sm text-white/25">No partner articles match "{query}"</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPartner.map(a => (
                    <Link key={a.id} href={`/article/${a.slug}`}
                      className="group overflow-hidden rounded-2xl border border-white/8 bg-[#0d1018] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/18 hover:shadow-lg hover:shadow-black/30">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={a.thumbnail_url || DEFAULT_IMG}
                          alt={a.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 flex gap-1.5">
                          {a.is_wc26 && <span className="rounded bg-[#FFD700] px-1.5 py-0.5 text-[7px] font-black uppercase text-black">WC26</span>}
                          {a.partner_team_name && <span className="rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white/70 backdrop-blur-sm">{a.partner_team_name}</span>}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/25">{timeAgo(a.published_at)}</p>
                        <h3 className="mb-2 text-sm font-black leading-snug text-white line-clamp-2 group-hover:text-white/90">{a.title}</h3>
                        {a.excerpt && <p className="text-[11px] leading-relaxed text-white/40 line-clamp-2">{a.excerpt}</p>}
                        {a.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {a.tags.slice(0, 3).map(t => (
                              <span key={t} className="rounded-full border border-white/8 px-2 py-0.5 text-[8px] font-bold text-white/30">#{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* RSS headlines */}
          {!loading && filteredRss.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-4 w-1 rounded-full bg-white/20" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-white/40">Football Headlines</h2>
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-[9px] font-black text-white/20">{filteredRss.length}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRss.map(a => (
                  <a key={a.id} href={a.link} target="_blank" rel="noopener noreferrer"
                    className="group flex gap-3 overflow-hidden rounded-xl border border-white/6 bg-[#0d1018] p-3 transition-all hover:border-white/12 hover:bg-[#111]">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={a.thumbnail}
                        alt={a.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/25">{a.source}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-white/15" />
                      </div>
                      <p className="text-[11px] font-bold leading-snug text-white/70 line-clamp-2 group-hover:text-white/90">{a.title}</p>
                      <p className="mt-1 text-[9px] text-white/20">{timeAgo(a.pubDate)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {!loading && filteredPartner.length === 0 && filteredRss.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-3xl">⚽</p>
              <p className="font-black uppercase tracking-widest text-white/25">No results for "{query}"</p>
              <button onClick={() => setQuery("")} className="text-xs text-white/30 hover:text-white underline">Clear search</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
