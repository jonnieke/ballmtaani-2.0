import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { supabase } from "../lib/supabase";
import { timeAgo } from "../lib/news-api";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
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
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setArticle(data as Article);
        setLoading(false);
      });
  }, [slug]);

  const share = () => {
    if (article) window.open(`https://wa.me/?text=${encodeURIComponent(`${article.title}\n\n${window.location.href}\n\nShared from BallMtaani`)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B]">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-56 rounded-2xl bg-white/5" />
            <div className="h-5 rounded bg-white/10" />
            <div className="h-5 w-3/4 rounded bg-white/10" />
            <div className="space-y-2 pt-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-3 rounded bg-white/8" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0B0B]">
        <h1 className="text-3xl font-black text-[#B30000]">Article Not Found</h1>
        <Link href="/" className="text-sm text-white/40 hover:text-white">← Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt || article.title}
        image={article.thumbnail_url || DEFAULT_IMAGE}
        type="article"
      />
      <div className="min-h-screen bg-[#0B0B0B] pb-20">
        {/* Back nav */}
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/30 transition-colors hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to BallMtaani
          </Link>
        </div>

        {/* Hero image */}
        <div className="mx-auto mt-4 max-w-3xl px-4">
          <div className="relative h-52 overflow-hidden rounded-2xl sm:h-72">
            <img
              src={article.thumbnail_url || DEFAULT_IMAGE}
              alt={article.title}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {article.is_wc26 && (
              <div className="absolute left-3 top-3 rounded-full bg-[#FFD700] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                WC26
              </div>
            )}
            {article.partner_team_name && (
              <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/70 backdrop-blur-sm">
                {article.partner_team_name}
              </div>
            )}
          </div>
        </div>

        {/* Article header */}
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {article.tags.map(tag => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/40">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mb-4 text-2xl font-black leading-tight text-white sm:text-3xl">{article.title}</h1>

          <div className="mb-6 flex items-center justify-between border-b border-white/8 pb-4">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <span className="flex items-center gap-1.5"><User className="h-3 w-3" />{article.author_name}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{timeAgo(article.published_at)}</span>
            </div>
            <button
              onClick={share}
              className="flex items-center gap-1.5 rounded-lg bg-[#25D366]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#25D366] transition-all hover:bg-[#25D366]/20"
            >
              <Share2 className="h-3 w-3" /> Share
            </button>
          </div>

          {/* Article content */}
          <div
            className="prose prose-invert prose-sm max-w-none
              prose-headings:font-black prose-headings:uppercase prose-headings:tracking-wide
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-strong:text-white prose-strong:font-black
              prose-a:text-[#FFD700] prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-[#B30000] prose-blockquote:text-white/50
              prose-li:text-white/70
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Footer CTA */}
          <div className="mt-12 rounded-2xl border border-white/8 bg-[#0d1018] p-5 text-center">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-white/40">Keep the conversation going</p>
            <p className="mb-4 text-sm font-bold text-white/60">React, predict, and debate on BallMtaani</p>
            <Link href="/debates" className="inline-flex items-center gap-2 rounded-xl bg-[#B30000] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#cc0000]">
              Go to Debates
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
