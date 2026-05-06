import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { fetchFootballNews, timeAgo, type NewsArticle } from "../lib/news-api";

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFootballNews()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  const shareToWhatsApp = (article: NewsArticle) => {
    const text = encodeURIComponent(`⚽ ${article.title}\n\n${article.link}\n\nShared from BallMtaani — Africa's #1 Football Hub 🔥`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <section className="py-14 bg-[#050505] border-b border-[#1B1B1B]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white border-l-4 border-[#FFD700] pl-4">
              Latest News
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-4 mt-1">
              Breaking Football Headlines
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-2xl bg-[#111] border border-white/5 overflow-hidden animate-pulse">
                <div className="h-40 bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-16" />
                  <div className="h-4 bg-white/10 rounded" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.slice(0, 8).map((article) => (
              <div
                key={article.id}
                className="group rounded-2xl bg-[#111] border border-white/5 hover:border-white/15 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=60';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                    <span className="text-base leading-none">{article.sourceLogo}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{article.source}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                    {timeAgo(article.pubDate)}
                  </p>
                  <h3 className="text-sm font-black text-white leading-snug mb-4 flex-1 line-clamp-3">
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-auto">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Read
                    </a>
                    <button
                      onClick={() => shareToWhatsApp(article)}
                      title="Share to WhatsApp"
                      className="py-2 px-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-all text-base leading-none"
                    >
                      📲
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
