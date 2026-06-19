import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { fetchFootballNews, timeAgo, type NewsArticle } from "../lib/news-api";
import { ExternalLink, Search, Clock, ChevronRight } from "lucide-react";
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

function readTime(text?: string | null) {
  if (!text) return "2 min";
  return `${Math.max(1, Math.round(text.split(/\s+/).length / 200))} min`;
}

export default function NewsPage() {
  const [partner, setPartner] = useState<PartnerArticle[]>([]);
  const [rss, setRss] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    Promise.all([
      supabase
        ? supabase.from("articles").select("id,slug,title,excerpt,thumbnail_url,author_name,partner_team_name,tags,is_wc26,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(50).then(({ data }) => (data as PartnerArticle[]) || [])
        : Promise.resolve([]),
      fetchFootballNews(),
    ]).then(([p, r]) => {
      setPartner(p);
      setRss(r);
      setLoading(false);
    });
  }, []);

  const q = query.toLowerCase();

  // Keyword sets for each tab — checked against title, tags, and partner_team_name
  const TAB_KEYWORDS: Record<string, string[]> = {
    "WC26":        ["world cup", "wc26", "wc 26", "2026 fifa", "fifa 2026"],
    "Analysis":    ["analysis", "tactical", "tactics", "opinion", "explainer", "deep dive", "breakdown"],
    "Match Reports":["match report", "match day", "matchday", "recap", "result", "highlights", "full time", "final whistle", " vs "],
    "Africa":      ["africa", "afcon", "caf", "kenya", "nigeria", "morocco", "senegal", "egypt", "cameroon", "ghana", "south africa", "ivory coast", "mali", "tunisia", "côte d'ivoire"],
    "East Africa": ["kenya", "tanzania", "uganda", "rwanda", "ethiopia", "harambee stars", "gor mahia", "afc leopards", "tusker", "simba", "yanga", "villa sc", "kpl", "ligi kuu", "fufa", "cecafa"],
  };

  function matchesTab(text: string): boolean {
    if (activeTab === "All") return true;
    const kws = TAB_KEYWORDS[activeTab];
    if (!kws) return true;
    const t = text.toLowerCase();
    return kws.some(k => t.includes(k));
  }

  const filteredPartner = partner.filter(a => {
    const haystack = [a.title, a.partner_team_name || "", ...(a.tags || [])].join(" ");
    const matchesQuery = !q || haystack.toLowerCase().includes(q);
    return matchesQuery && (
      activeTab === "All" ||
      (activeTab === "WC26" && a.is_wc26) ||
      matchesTab(haystack)
    );
  });

  const filteredRss = rss.filter(a => {
    const haystack = `${a.title} ${a.source} ${a.description || ""}`;
    const matchesQuery = !q || haystack.toLowerCase().includes(q);
    if (!matchesQuery) return false;
    if (activeTab === "WC26") return !!(a.isWC26 || matchesTab(haystack));
    return matchesTab(haystack);
  });

  const coverStory = filteredPartner[0];
  const features   = filteredPartner.slice(1, 3);
  const interior   = filteredPartner.slice(3);

  // Hero uses the latest cover story image when available, else the stadium fallback
  const heroImg = partner[0]?.thumbnail_url || DEFAULT_IMG;
  const heroTitle = partner[0]?.title || "Africa's World Cup. Every Story. Right Here.";
  const heroSubtitle = partner[0]?.excerpt || null;
  const heroHref = partner[0]?.slug ? `/article/${partner[0].slug}` : "/world-cup-2026";

  const edition = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
  const TABS = ["All", "WC26", "Analysis", "Match Reports", "Africa", "East Africa"];

  return (
    <>
      <SEO
        title="The Touchline | BallMtaani"
        description="Latest football news, partner articles and breaking headlines on BallMtaani — Kenya's loudest fan room."
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
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/22">Edition {edition}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/22" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-36 rounded-lg border border-white/8 bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/18 focus:border-white/18 focus:outline-none sm:w-52"
                />
              </div>
            </div>

            {/* Wordmark */}
            <div className="pb-4 text-center">
              <p className="mb-1 text-[8px] font-black uppercase tracking-[0.5em] text-[#B30000]/70">Est. Nairobi</p>
              <h1 className="text-[clamp(2.6rem,8vw,5rem)] font-black uppercase leading-none tracking-[0.03em] text-white">
                BallMtaani News
              </h1>
              <div className="mt-2 flex items-center justify-center gap-3">
                <div className="h-px w-16 bg-white/10" />
                <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-white/22">Football journalism for the Kenyan fan</p>
                <div className="h-px w-16 bg-white/10" />
              </div>
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

        {/* ── EDITORIAL HERO ── */}
        <div className="relative overflow-hidden border-b border-white/6" style={{ aspectRatio: "21/6", minHeight: 140 }}>
          <img
            src={heroImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/95 via-[#05070d]/60 to-[#05070d]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070d]/80 via-transparent to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B30000]/50 to-transparent" />
          <div className="relative z-10 flex h-full items-center px-6 sm:px-10 lg:px-16">
            <div className="max-w-xl">
              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.4em] text-[#B30000]/80">
                {partner[0]?.is_wc26 ? "WC26 · Latest" : "Latest Story"}
              </p>
              <h2 className="mb-3 text-xl font-black leading-tight text-white sm:text-2xl lg:text-3xl line-clamp-2">
                {heroTitle}
              </h2>
              {heroSubtitle && (
                <p className="mb-3 text-sm leading-relaxed text-white/45 line-clamp-2 hidden sm:block">{heroSubtitle}</p>
              )}
              <Link
                href={heroHref}
                className="inline-flex items-center gap-2 rounded-lg bg-[#B30000] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-[#cc0000] active:scale-95"
              >
                Read Story <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

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
                {query ? `No results for "${query}"` : "No articles yet"}
              </p>
              {query && (
                <button onClick={() => setQuery("")} className="text-xs text-[#B30000] underline hover:text-white transition-colors">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>

              {/* ══ COVER STORY ══════════════════════════════════════════ */}
              {coverStory && (
                <section className="mb-10">
                  <SectionRule label="Cover Story" accent />
                  <Link href={`/article/${coverStory.slug}`} className="group block">
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

              {/* ══ FEATURES ═════════════════════════════════════════════ */}
              {features.length > 0 && (
                <section className="mb-10">
                  <SectionRule label="Features" />
                  <div className={`grid gap-5 ${features.length === 1 ? "" : "sm:grid-cols-2"}`}>
                    {features.map(a => (
                      <Link key={a.id} href={`/article/${a.slug}`}
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

              {/* ══ MORE STORIES ═════════════════════════════════════════ */}
              {interior.length > 0 && (
                <section className="mb-12">
                  <SectionRule label="More Stories" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {interior.map(a => (
                      <Link key={a.id} href={`/article/${a.slug}`}
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

              {/* ══ WIRE / RSS HEADLINES ════════════════════════════════ */}
              {filteredRss.length > 0 && (
                <section>
                  <SectionRule label="Wire · Football Headlines" dim />
                  <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-10 lg:gap-x-12 divide-y divide-white/[0.05] sm:divide-y-0">
                    {filteredRss.map((a, i) => (
                      <a key={a.id} href={a.link} target="_blank" rel="noopener noreferrer"
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
