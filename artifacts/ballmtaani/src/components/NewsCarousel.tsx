import React, { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Newspaper, ArrowRight, Sparkles, Flame, Clock } from "lucide-react";
import { timeAgo, type NewsArticle } from "../lib/news-api";

interface NewsCarouselProps {
  articles: NewsArticle[];
  title?: string;
  eyebrow?: string;
  subtitle?: string;
}

const DEFAULT_NEWS_IMAGE = "https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/Football_culture_stadium.jpeg";

export default function NewsCarousel({
  articles,
  title = "Latest Football News Desk",
  eyebrow = "BallMtaani News Wire",
  subtitle = "Original reporting, tactical deep-dives, and breaking football stories from Kenya & beyond.",
}: NewsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [articles]);

  // Gentle auto-scroll when not hovered
  useEffect(() => {
    if (isHovered || articles.length === 0) return;
    const interval = setInterval(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 20) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 340, behavior: "smooth" });
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isHovered, articles.length]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -360 : 360;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section 
      className="relative overflow-hidden bg-[#07090c] border-t border-white/8 py-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#B30000]/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#FFD700]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header with Eyebrow, Title and Navigation Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-[#B30000] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]">
                {eyebrow}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-xs sm:text-sm text-white/50 max-w-2xl font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:border-[#FFD700]/60 hover:bg-[#FFD700]/10 hover:text-white transition-all shadow-sm"
            >
              <Newspaper className="h-3.5 w-3.5" />
              <span>All Articles</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous News"
                className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 shadow-sm"
                    : "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Next News"
                className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 shadow-sm"
                    : "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {articles.map((article, idx) => {
            const isInternal = Boolean(article.isInternal);
            const href = isInternal && article.slug ? `/article/${article.slug}` : (article.link || `/article/${article.slug}`);
            const isKenya = /kenya|harambee|gor mahia|afc leopards|tusker|kpl|fkf/i.test(`${article.title} ${article.description}`);
            
            const badgeLabel = isInternal
              ? "Mtaa Daily Original"
              : article.isWC26
              ? "WC26 Desk"
              : isKenya
              ? "Kenya Spotlight"
              : article.source || "Football News";

            const badgeBg = isInternal
              ? "bg-[#B30000] text-white"
              : article.isWC26
              ? "bg-[#FFD700] text-black"
              : isKenya
              ? "bg-emerald-600 text-white"
              : "bg-black/70 text-white/90";

            const cardContent = (
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#10131a] transition-all duration-300 hover:border-[#FFD700]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
                {/* Top decorative accent line */}
                <div className={`h-1 w-full ${isInternal ? "bg-gradient-to-r from-[#B30000] to-[#FFD700]" : "bg-gradient-to-r from-white/20 to-white/5"}`} />

                {/* Thumbnail Header with badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                  <img
                    src={article.thumbnail || DEFAULT_NEWS_IMAGE}
                    alt={article.title}
                    loading={idx < 4 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_NEWS_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10131a] via-[#10131a]/30 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wider shadow-md backdrop-blur-sm ${badgeBg}`}>
                      {badgeLabel}
                    </span>
                    {isInternal && (
                      <span className="rounded-full bg-[#FFD700]/90 text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Sparkles className="h-2.5 w-2.5" /> Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2.5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                    <span className="truncate max-w-[140px] text-white/60">{article.source || "Mtaa Daily"}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(article.pubDate)}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug line-clamp-2 group-hover:text-[#FFD700] transition-colors mb-2">
                    {article.title}
                  </h3>

                  {article.description && (
                    <p className="text-xs text-white/55 font-medium leading-relaxed line-clamp-2 mb-4">
                      {article.description}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                    <span>{isInternal ? "Read Article" : "Read Full Story"}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );

            return (
              <div
                key={article.id || article.slug || idx}
                className="w-[290px] sm:w-[320px] md:w-[340px] shrink-0 snap-start"
              >
                {isInternal ? (
                  <Link href={href} className="block h-full">
                    {cardContent}
                  </Link>
                ) : (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {cardContent}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
