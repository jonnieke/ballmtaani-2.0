import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { supabase } from "../lib/supabase";
import { timeAgo } from "../lib/news-api";
import { ArrowLeft, Share2, MessageSquare } from "lucide-react";
import SEO from "../components/SEO";

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  author_name: string;
  partner_team_name: string | null;
  tags: string[];
  is_wc26: boolean;
  published_at: string;
}

const DEFAULT_IMAGE = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg";

/** Turn plain text into HTML paragraphs; leave real HTML untouched */
function normalizeContent(raw: string): string {
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(raw);
  if (hasHtmlTags) return raw;
  // Split on blank lines and wrap each chunk in <p>
  return raw
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

/** Estimated reading time */
function readingTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || !supabase) { setLoading(false); setNotFound(true); return; }
    supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setArticle(data as Article);
        setLoading(false);
      });
  }, [slug]);

  const share = () => {
    if (article) window.open(
      `https://wa.me/?text=${encodeURIComponent(`${article.title}\n\n${window.location.href}\n\nRead on BallMtaani`)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B]">
        <div className="h-[45vh] animate-pulse bg-white/5" />
        <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
          <div className="h-4 w-20 rounded bg-white/10" />
          <div className="h-8 rounded-lg bg-white/10" />
          <div className="h-6 w-2/3 rounded-lg bg-white/8" />
          <div className="h-3 w-32 rounded bg-white/8" />
          <div className="pt-4 space-y-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className={`h-3 rounded bg-white/6 ${i % 3 === 0 ? "w-3/4" : "w-full"}`} />)}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0B0B]">
        <p className="text-4xl">⚽</p>
        <h1 className="text-2xl font-black text-[#B30000]">Article Not Found</h1>
        <Link href="/" className="text-sm text-white/40 hover:text-white">← Back to BallMtaani</Link>
      </div>
    );
  }

  const formattedContent = normalizeContent(article.content);
  const mins = readingTime(article.content);
  const publishDate = new Date(article.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt || article.title}
        image={article.thumbnail_url || DEFAULT_IMAGE}
        type="article"
      />

      <div className="min-h-screen bg-[#0B0B0B] pb-24">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden sm:h-[58vh]">
          <img
            src={article.thumbnail_url || DEFAULT_IMAGE}
            alt={article.title}
            className="h-full w-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
          />
          {/* Multi-layer gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/30 to-transparent" />

          {/* Back link */}
          <div className="absolute left-4 top-4 sm:left-6">
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 backdrop-blur-md transition-all hover:bg-black/70 hover:text-white">
              <ArrowLeft className="h-3 w-3" /> BallMtaani
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5 sm:right-6">
            {article.is_wc26 && (
              <span className="rounded-full bg-[#FFD700] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                WC26
              </span>
            )}
            {article.partner_team_name && (
              <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/70 backdrop-blur-sm">
                {article.partner_team_name}
              </span>
            )}
          </div>

          {/* Title over hero — magazine cover style */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 sm:px-8 sm:pb-8">
            <div className="mx-auto max-w-2xl">
              {article.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {article.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="rounded-sm bg-[#B30000] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-2xl font-black leading-[1.15] text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                {article.title}
              </h1>
            </div>
          </div>
        </div>

        {/* ── BYLINE ───────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl px-4 sm:px-8">
          <div className="flex items-center justify-between border-b border-white/8 py-4">
            <div className="flex items-center gap-3">
              {/* Author avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B30000]/20 text-[11px] font-black text-[#B30000]">
                {article.author_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-white">{article.author_name}</p>
                <p className="text-[10px] text-white/30">{publishDate} · {mins}</p>
              </div>
            </div>
            <button
              onClick={share}
              className="flex items-center gap-1.5 rounded-full bg-[#25D366]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#25D366] transition-all hover:bg-[#25D366]/20"
            >
              <Share2 className="h-3 w-3" /> Share
            </button>
          </div>

          {/* Excerpt / standfirst */}
          {article.excerpt && (
            <p className="mt-5 text-base font-semibold leading-relaxed text-white/60 sm:text-lg">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* ── BODY ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-8">
          <div
            className="
              article-body
              text-[15px] leading-[1.8] text-white/75 sm:text-[16px]

              [&_p]:mb-5
              [&_p:first-of-type]:text-[17px] [&_p:first-of-type]:font-medium [&_p:first-of-type]:text-white/85 [&_p:first-of-type]:leading-relaxed

              [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-white
              [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-base [&_h3]:font-black [&_h3]:uppercase [&_h3]:tracking-widest [&_h3]:text-white/80

              [&_strong]:font-black [&_strong]:text-white
              [&_em]:italic [&_em]:text-white/70

              [&_a]:text-[#FFD700] [&_a]:underline [&_a:hover]:text-yellow-300

              [&_ul]:my-5 [&_ul]:space-y-2 [&_ul]:pl-5
              [&_ol]:my-5 [&_ol]:space-y-2 [&_ol]:pl-5
              [&_li]:text-white/70 [&_li]:leading-relaxed
              [&_li::marker]:text-[#B30000]

              [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-[#B30000]
              [&_blockquote]:bg-white/3 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_blockquote]:rounded-r-xl
              [&_blockquote]:text-lg [&_blockquote]:font-semibold [&_blockquote]:italic [&_blockquote]:text-white/60
              [&_blockquote_p]:mb-0

              [&_img]:my-6 [&_img]:w-full [&_img]:rounded-xl [&_img]:object-cover

              [&_hr]:my-8 [&_hr]:border-white/10

              [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:text-sm
            "
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>

        {/* ── DIVIDER ──────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl px-4 sm:px-8">
          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">BallMtaani</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Tags footer */}
          {article.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/35">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="rounded-2xl border border-white/8 bg-[#0d1018] p-6 text-center">
            <div className="mb-1 text-xl">⚽</div>
            <p className="mb-1 text-sm font-black uppercase tracking-widest text-white">Keep the receipt.</p>
            <p className="mb-5 text-xs text-white/40">Predict, debate, and score points on BallMtaani</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/predictions" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B30000] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#cc0000]">
                Make a Call
              </Link>
              <Link href="/debates" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white/60 transition-all hover:bg-white/10">
                <MessageSquare className="h-3.5 w-3.5" /> Join Debate
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
