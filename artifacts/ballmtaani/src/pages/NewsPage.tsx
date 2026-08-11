import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { fetchFootballNews, isSubstantiveArticle, timeAgo, type NewsArticle } from "../lib/news-api";
import { fetchTodaysFixtures } from "../lib/football-api";
import { ExternalLink, Search, Clock, ChevronRight, BarChart2, Gamepad2, Newspaper } from "lucide-react";
import SEO from "../components/SEO";
import { analytics } from "../lib/analytics";
import { getEditorialFallbackArticles } from "../data/editorial-fallback-articles";

interface PartnerArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  author_name: string;
  partner_team_name: string | null;
  tags: string[];
  is_wc26: boolean;
  published_at: string;
}

function dedupePartnerArticles(articles: PartnerArticle[]): PartnerArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (!isSubstantiveArticle(article.content)) return false;
    const key = article.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
const DEFAULT_IMG = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg";

function readTime(text?: string | null) {
  if (!text) return "2 min";
  return `${Math.max(1, Math.round(text.split(/\s+/).length / 200))} min`;
}

const TAB_KEYWORDS: Record<string, string[]> = {
  "World Cup Archive":        ["world cup", "wc26", "wc 26", "2026 fifa", "fifa 2026"],
  "Analysis":         ["analysis", "tactical", "tactics", "opinion", "explainer", "deep dive", "breakdown"],
  "Match Reports":    ["match report", "match day", "matchday", "recap", "result", "highlights", "full time", "final whistle", " vs "],
  "Kenyan Fan Angle": ["arsenal", "chelsea", "man utd", "man united", "liverpool", "man city", "manchester city", "real madrid", "barcelona", "bayern", "harambee", "gor mahia", "afc leopards", "tusker", "kenya", "nairobi", "kpl", "simba"],
  "Africa":           ["africa", "afcon", "caf", "nigeria", "morocco", "senegal", "egypt", "cameroon", "ghana", "south africa", "ivory coast", "mali", "tunisia", "côte d'ivoire", "ethiopia", "uganda", "rwanda", "tanzania"],
};

const TABS = ["Front Page", "World Cup Archive", "Match Reports", "Kenyan Fan Angle", "Africa", "Wire"];

export default function NewsPage() {
  const [partner, setPartner] = useState<PartnerArticle[]>([]);
  const [rss, setRss] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Front Page");
  const [fixtures, setFixtures] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase
        ? supabase.from("articles").select("id,slug,title,content,excerpt,thumbnail_url,author_name,partner_team_name,tags,is_wc26,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(50).then(({ data }) => (data as PartnerArticle[]) || [])
        : Promise.resolve([]),
      fetchFootballNews(),
      fetchTodaysFixtures(),
    ]).then(([p, r, f]) => {
      const fallbackPartner: PartnerArticle[] = getEditorialFallbackArticles().map(article => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        thumbnail_url: article.thumbnail_url,
        author_name: article.author_name,
        partner_team_name: article.partner_team_name,
        tags: article.tags,
        is_wc26: article.is_wc26,
        published_at: article.published_at,
      }));
      setPartner(dedupePartnerArticles([...p, ...fallbackPartner]));
      setRss(r);
      setFixtures((f || []).slice(0, 6));
      setLoading(false);
    });
  }, []);

  const q = query.toLowerCase();

  function matchesTab(text: string): boolean {
    if (activeTab === "Front Page" || activeTab === "Wire") return true;
    const kws = TAB_KEYWORDS[activeTab];
    if (!kws) return true;
    const t = text.toLowerCase();
    return kws.some(k => t.includes(k));
  }

  const filteredPartner = activeTab === "Wire" ? [] : partner.filter(a => {
    const haystack = [a.title, a.partner_team_name || "", ...(a.tags || [])].join(" ");
    const matchesQuery = !q || haystack.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (activeTab === "World Cup Archive") return a.is_wc26 || matchesTab(haystack);
    return matchesTab(haystack);
  });

  const filteredRss = activeTab !== "Wire" && activeTab !== "Front Page"
    ? rss.filter(a => {
        const haystack = `${a.title} ${a.source} ${a.description || ""}`;
        const matchesQuery = !q || haystack.toLowerCase().includes(q);
        if (!matchesQuery) return false;
        if (activeTab === "World Cup Archive") return !!(a.isWC26 || matchesTab(haystack));
        return matchesTab(haystack);
      })
    : rss.filter(a => {
        if (!q) return true;
        return `${a.title} ${a.source}`.toLowerCase().includes(q);
      });

  const coverStory = filteredPartner[0];
  const features   = filteredPartner.slice(1, 3);
  const interior   = filteredPartner.slice(3);


  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
  const edition = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();

  return (
    <>
      <SEO
        title="Mtaa Daily | BallMtaani — Football for the Kenyan Fan"
        description="Original Kenyan and African football reporting, Premier League coverage, match analysis and the stories shaping today's game."
        path="/news"
      />

      <div className="min-h-screen bg-[#070910] pb-24">

        {/* ── MASTHEAD ── */}
        <div className="border-b border-white/8 bg-[#05070d]">
          <div className="mx-auto max-w-6xl px-4 pt-5 pb-0">

            {/* Eyebrow strip */}
            <div className="flex items-center justify-between border-b border-white/6 pb-3 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#B30000]">BallMtaani</span>
                <span className="text-white/12">·</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/22">Mtaa Daily</span>
                <span className="text-white/12">·</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/18">{today}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/22" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="w-36 rounded-lg border border-white/8 bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/18 focus:border-white/18 focus:outline-none sm:w-52"
                />
              </div>
            </div>

            {/* Wordmark */}
            <div className="pb-4 text-center">
              <p className="mb-1 text-[8px] font-black uppercase tracking-[0.5em] text-[#B30000]/70">Est. Nairobi · {edition}</p>
              <h1 className="text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-none tracking-[0.03em] text-white">
                Mtaa Daily
              </h1>
              <div className="mt-2 flex items-center justify-center gap-3">
                <div className="h-px w-16 bg-white/10" />
                <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-white/22">Today's football newspaper for the Kenyan fan</p>
                <div className="h-px w-16 bg-white/10" />
              </div>
            </div>

            {/* Platform doors — Read / Data / Play */}
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-white/6 bg-white/[0.02] p-2">
              {[
                { href: "/news",      icon: Newspaper,  label: "Read",       sub: "Mtaa Daily",   active: true,  color: "#B30000" },
                { href: "/data-centre", icon: BarChart2,  label: "Data",       sub: "Centre",       active: false, color: "#1E6FFF" },
                { href: "/fun-zone",  icon: Gamepad2,   label: "Play",       sub: "Fun Zone",     active: false, color: "#22c55e" },
              ].map(({ href, icon: Icon, label, sub, active, color }) => (
                <Link key={href} href={href}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2.5 transition-all ${active ? "bg-white/8" : "hover:bg-white/5"}`}>
                  <Icon className="h-4 w-4" style={{ color: active ? color : "rgba(255,255,255,0.3)" }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: active ? "white" : "rgba(255,255,255,0.35)" }}>
                    {label} <span style={{ color: active ? color : "rgba(255,255,255,0.2)" }}>{sub}</span>
                  </span>
                </Link>
              ))}
            </div>

          </div>

          {/* Section tabs */}
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex gap-5 overflow-x-auto border-t border-white/6 py-2.5 no-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 pb-1.5 text-[10px] font-black uppercase tracking-[0.22em] transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-[#B30000] text-white"
                      : "border-transparent text-white/25 hover:text-white/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* ── TODAY'S MATCHES STRIP (front page only) ── */}
        {activeTab === "Front Page" && fixtures.length > 0 && (
          <div className="border-b border-white/6 bg-[#04060a] py-3">
            <div className="mx-auto max-w-6xl px-4">
              <div className="flex items-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.28em] text-white/30">Today ·</span>
                {fixtures.map((m: any) => (
                  <Link key={m.id} href="/matches"
                    className="flex shrink-0 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 transition-all hover:border-white/15">
                    <span className="text-[10px] font-bold text-white/50">{m.home}</span>
                    <span className="text-[9px] font-black text-white/22">vs</span>
                    <span className="text-[10px] font-bold text-white/50">{m.away}</span>
                    {m.time && <span className="text-[9px] font-black text-[#FFD700]/70">{m.time}</span>}
                  </Link>
                ))}
                <Link href="/matches" className="shrink-0 text-[9px] font-black uppercase tracking-widest text-[#B30000] hover:underline">
                  All Fixtures →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        <div className="mx-auto max-w-6xl px-4 pt-8">

          {loading ? (
            <div className="space-y-6">
              <div className="animate-pulse rounded-2xl bg-white/[0.04] h-[340px] sm:h-[420px]" />
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="animate-pulse rounded-xl bg-white/[0.04] h-56" />
                <div className="animate-pulse rounded-xl bg-white/[0.04] h-56" />
              </div>
            </div>
          ) : filteredPartner.length === 0 && filteredRss.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="text-4xl font-black text-white/10">⚽</div>
              <p className="font-black uppercase tracking-widest text-white/20">
                {query ? `No results for "${query}"` : "No stories yet in this section"}
              </p>
              {query && (
                <button onClick={() => setQuery("")} className="text-xs text-[#B30000] underline hover:text-white transition-colors">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>

              {/* ══ COVER STORY ══ */}
              {coverStory && (
                <section className="mb-10">
                  <SectionRule label={activeTab === "World Cup Archive" ? "World Cup Archive · Top Story" : activeTab === "Kenyan Fan Angle" ? "Kenyan Fan Angle · Top Story" : "Cover Story"} accent />
                  <Link href={`/news/${coverStory.slug}`} onClick={() => analytics.articleRead("partner", activeTab)} className="group block">
                    <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "21/9" }}>
                      <img
                        src={coverStory.thumbnail_url || DEFAULT_IMG}
                        alt={coverStory.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                        onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-[#05070d]/55 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/85 via-[#05070d]/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6 sm:p-8 lg:p-10 max-w-2xl lg:max-w-3xl">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          {coverStory.is_wc26 && (
                            <span className="rounded-[3px] bg-[#FFD700] px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-black">WC26</span>
                          )}
                          {coverStory.partner_team_name && (
                            <span className="rounded-[3px] border border-white/18 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/50 backdrop-blur-sm">{coverStory.partner_team_name}</span>
                          )}
                        </div>
                        <h2 className="mb-3 text-2xl font-black leading-[1.05] tracking-tight text-white sm:text-3xl lg:text-[2.6rem] group-hover:text-white/90 transition-colors">
                          {coverStory.title}
                        </h2>
                        {coverStory.excerpt && (
                          <p className="mb-4 text-sm leading-relaxed text-white/50 line-clamp-2 sm:line-clamp-3 max-w-xl">
                            {coverStory.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B30000]">{coverStory.author_name}</span>
                          <span className="text-white/15">·</span>
                          <span className="flex items-center gap-1 text-[10px] text-white/28">
                            <Clock className="h-3 w-3" />
                            {readTime(coverStory.excerpt)} read
                          </span>
                          <span className="text-white/15">·</span>
                          <span className="text-[10px] text-white/28">{timeAgo(coverStory.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </section>
              )}

              {/* ══ FEATURES ══ */}
              {features.length > 0 && (
                <section className="mb-10">
                  <SectionRule label="Features" />
                  <div className={`grid gap-5 ${features.length === 1 ? "" : "sm:grid-cols-2"}`}>
                    {features.map(a => (
                      <Link key={a.id} href={`/news/${a.slug}`} onClick={() => analytics.articleRead("partner", activeTab)}
                        className="group overflow-hidden rounded-xl border border-white/7 bg-[#0c0f17] transition-all duration-200 hover:border-white/14 hover:shadow-xl hover:shadow-black/40">
                        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                          <img
                            src={a.thumbnail_url || DEFAULT_IMG}
                            alt={a.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent" />
                          {a.is_wc26 && (
                            <div className="absolute left-3 bottom-3">
                              <span className="rounded-[3px] bg-[#FFD700] px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-black">WC26</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 sm:p-5">
                          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.28em] text-white/22">{timeAgo(a.published_at)}</p>
                          <h3 className="mb-2 text-[1.05rem] font-black leading-snug text-white line-clamp-2 group-hover:text-white/88 transition-colors">{a.title}</h3>
                          {a.excerpt && (
                            <p className="text-[11px] leading-relaxed text-white/36 line-clamp-2">{a.excerpt}</p>
                          )}
                          <div className="mt-4 flex items-center gap-2.5 border-t border-white/[0.06] pt-3.5">
                            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#B30000]">{a.author_name}</span>
                            <span className="text-white/12">·</span>
                            <span className="flex items-center gap-1 text-[9px] text-white/22">
                              <Clock className="h-2.5 w-2.5" /> {readTime(a.excerpt)} read
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* ══ MORE STORIES ══ */}
              {interior.length > 0 && (
                <section className="mb-12">
                  <SectionRule label="More Stories" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {interior.map(a => (
                      <Link key={a.id} href={`/news/${a.slug}`} onClick={() => analytics.articleRead("partner", activeTab)}
                        className="group flex gap-3.5 rounded-xl border border-white/[0.06] bg-[#0c0f17] p-3 transition-all hover:border-white/12 hover:bg-[#0f131e]">
                        <div className="relative h-[4.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={a.thumbnail_url || DEFAULT_IMG}
                            alt={a.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                          />
                          {a.is_wc26 && (
                            <div className="absolute inset-x-0 bottom-0 flex justify-center py-0.5 bg-[#FFD700]">
                              <span className="text-[6px] font-black uppercase tracking-wider text-black">WC26</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-white/18">{timeAgo(a.published_at)}</p>
                          <h4 className="text-[12px] font-black leading-snug text-white/80 line-clamp-3 group-hover:text-white transition-colors">{a.title}</h4>
                          <span className="mt-1.5 block text-[8px] font-bold uppercase tracking-wider text-[#B30000]/60">{a.author_name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}


              {/* ══ WIRE / RSS HEADLINES ══ */}
              {filteredRss.length > 0 && (
                <section>
                  <SectionRule label="Wire · Football Headlines" dim />
                  <p className="mb-4 text-[9px] font-bold uppercase tracking-widest text-white/18">External sources — clearly marked</p>
                  <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-10 lg:gap-x-12 divide-y divide-white/[0.05] sm:divide-y-0">
                    {filteredRss.map((a, i) => (
                      <a key={a.id} href={a.link} target="_blank" rel="noopener noreferrer"
                        onClick={() => analytics.articleRead(a.source || "rss", activeTab)}
                        className="group flex items-start gap-3 py-4 border-b border-white/[0.05] last:border-0 transition-colors hover:bg-transparent">
                        <span className="mt-0.5 shrink-0 text-[10px] font-black tabular-nums text-white/10 w-5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="text-[8px] font-black uppercase tracking-wider text-white/20">{a.source}</span>
                            <ExternalLink className="h-2.5 w-2.5 text-white/10" />
                          </div>
                          <p className="text-[12px] font-bold leading-snug text-white/55 line-clamp-2 group-hover:text-white/80 transition-colors">{a.title}</p>
                          <p className="mt-1.5 text-[8px] text-white/18">{timeAgo(a.pubDate)}</p>
                        </div>
                        <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={a.thumbnail}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

            </>
          )}

          {/* ── BOTTOM PLATFORM DOORS ── */}
          {!loading && (
            <div className="mt-12 grid grid-cols-3 gap-3 border-t border-white/6 pt-8">
              {[
                { href: "/data-centre", icon: BarChart2, label: "Data Centre",  sub: "Live scores, fixtures & standings",  color: "#1E6FFF" },
                { href: "/fun-zone", icon: Gamepad2,   label: "Fun Zone",     sub: "Trivia, duels, rapid fire & more",   color: "#22c55e" },
                { href: "/store",    icon: Newspaper,  label: "Mtaa Play",    sub: "Predictions, debates and rewards",       color: "#FFD700" },
              ].map(({ href, icon: Icon, label, sub, color }) => (
                <Link key={href} href={href}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-white/6 bg-white/[0.02] p-4 text-center transition-all hover:border-white/14 hover:bg-white/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color + "18" }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wide text-white">{label}</span>
                  <span className="text-[9px] leading-snug text-white/30">{sub}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest transition-colors" style={{ color }}>
                    Open →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SectionRule({ label, accent, dim }: { label: string; accent?: boolean; dim?: boolean }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/7" />
      <span className={`text-[9px] font-black uppercase tracking-[0.38em] ${accent ? "text-[#B30000]" : dim ? "text-white/22" : "text-white/32"}`}>
        {label}
      </span>
      <div className="h-px flex-1 bg-white/7" />
    </div>
  );
}




