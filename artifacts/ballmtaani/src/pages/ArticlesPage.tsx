import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { isSubstantiveArticle, timeAgo } from "../lib/news-api";
import { getEditorialFallbackArticles } from "../data/editorial-fallback-articles";
import SEO from "../components/SEO";
import { ChevronRight, Newspaper } from "lucide-react";

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  thumbnail_url: string | null;
  author_name: string;
  published_at: string;
  is_wc26: boolean;
  tags: string[];
}

const DEFAULT_AUTHOR = "Mtaa Daily Desk";
const DEFAULT_IMG = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg";
const ENABLE_CONTENT_FALLBACKS = import.meta.env.VITE_ENABLE_CONTENT_MOCKS === "true";

function readTime(excerpt?: string | null) {
  if (!excerpt) return "2 min";
  return `${Math.max(1, Math.round(excerpt.split(/\s+/).length / 40))} min`;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "wc26">("all");

  useEffect(() => {
    const fallbackArticles = (ENABLE_CONTENT_FALLBACKS ? getEditorialFallbackArticles() : []).map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      thumbnail_url: article.thumbnail_url,
      author_name: article.author_name,
      published_at: article.published_at,
      is_wc26: article.is_wc26,
      tags: article.tags,
    }));

    if (!supabase) { setArticles(fallbackArticles as ArticleItem[]); setLoading(false); return; }
    supabase
      .from("articles")
      .select("id, slug, title, content, excerpt, thumbnail_url, author_name, published_at, is_wc26, tags")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const published = ((data || []) as ArticleItem[]).filter(article => isSubstantiveArticle(article.content));
        const seen = new Set(published.map((article) => article.slug));
        for (const article of fallbackArticles) {
          if (!seen.has(article.slug)) published.push(article as ArticleItem);
        }
        setArticles(published);
        setLoading(false);
      });
  }, []);

  const visible = filter === "wc26" ? articles.filter(a => a.is_wc26) : articles;

  return (
    <div className="min-h-screen bg-[#0B0B0B] pb-24">
      <SEO
        title="Mtaa Daily Articles | BallMtaani Football Reporting"
        description="Original Kenyan and African football reporting, match analysis and archive coverage from BallMtaani."
        keywords={["BallMtaani articles", "Mtaa Daily", "Kenya football articles", "African football reporting", "football analysis"]}
        path="/articles"
        breadcrumbs={[
          { name: "BallMtaani", url: "/" },
          { name: "Mtaa Daily", url: "/news" },
          { name: "All Articles", url: "/articles" },
        ]}
      />
{/* Header */}
      <div className="border-b border-white/8 bg-[#07060a]">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-2 flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-[#B30000]" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#B30000]">Mtaa Daily</span>
          </div>
          <h1 className="text-3xl font-black text-white md:text-4xl">All Articles</h1>
          <p className="mt-1 text-sm text-white/35">Original reporting from BallMtaani's editorial team</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* Filter tabs */}
        <div className="mb-8 flex gap-2">
          {(["all", "wc26"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? "bg-[#B30000] text-white" : "border border-white/10 text-white/40 hover:text-white"
              }`}>
              {f === "all" ? "All Stories" : "World Cup Archive"}
            </button>
          ))}
          <Link href="/news" className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#B30000] hover:underline self-center">
            Mtaa Daily <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse rounded-xl border border-white/6 bg-[#0d1018]">
                <div className="h-40 rounded-t-xl bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-white/8" />
                  <div className="h-3 rounded bg-white/6" />
                  <div className="h-3 w-1/2 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-20 text-center text-white/30">
            <Newspaper className="mx-auto mb-3 h-8 w-8 opacity-30" />
            <p className="text-sm">No articles yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((a, i) => {
              const author = (!a.author_name || a.author_name.toLowerCase() === "ballmtaani") ? DEFAULT_AUTHOR : a.author_name;
              const isFeatured = i === 0;
              return (
                <Link key={a.id} href={`/news/${a.slug}`}
                  className={`group flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 ${
                    isFeatured ? "sm:col-span-2 border-[#FFD700]/15 bg-[#0a0900]" : "border-white/6 bg-[#0d1018] hover:border-white/14"
                  }`}>
                  <div className={`relative overflow-hidden ${isFeatured ? "h-52 sm:h-64" : "h-40"}`}>
                    <img
                      src={a.thumbnail_url || DEFAULT_IMG}
                      alt={a.title}
                      loading={i < 3 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute left-3 bottom-3 flex gap-1.5">
                      {a.is_wc26 && (
                        <span className="rounded-full bg-[#FFD700] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-black">WC26</span>
                      )}
                      {a.tags.slice(0,1).map(t => (
                        <span key={t} className="rounded-full bg-black/60 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/70 backdrop-blur-sm">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-white/25">{timeAgo(a.published_at)} · {readTime(a.excerpt)} read</p>
                    <h2 className={`flex-1 font-black leading-snug text-white ${isFeatured ? "text-lg sm:text-xl" : "text-sm line-clamp-3"}`}>{a.title}</h2>
                    {isFeatured && a.excerpt && (
                      <p className="mt-2 text-xs leading-relaxed text-white/45 line-clamp-2">{a.excerpt}</p>
                    )}
                    <p className="mt-3 text-[9px] font-bold uppercase tracking-widest text-white/30">{author}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}






