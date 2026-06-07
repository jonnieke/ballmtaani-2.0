import { Link, useRoute } from "wouter";
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, MessageCircle, ShieldCheck, Trophy } from "lucide-react";
import SEO from "../components/SEO";
import { getWc26Guide, WC26_GUIDES } from "../data/wc26-guides";

function notFound() {
  return (
    <div className="min-h-screen bg-[#05070b] px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#090d14] p-8 text-center">
        <Trophy className="mx-auto mb-4 h-10 w-10 text-[#FFD700]" />
        <h1 className="text-2xl font-black">WC26 guide not found</h1>
        <p className="mt-2 text-sm leading-7 text-white/55">The guide you opened is not available. Head back to the WC26 hub.</p>
        <Link href="/world-cup-2026" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-black">
          <ChevronLeft className="h-3.5 w-3.5" />
          WC26 Hub
        </Link>
      </div>
    </div>
  );
}

export default function WorldCupGuidePage() {
  const [, params] = useRoute("/world-cup-2026/:guide");
  const guide = getWc26Guide(params?.guide);

  if (!guide) return notFound();

  const related = WC26_GUIDES.filter((item) => item.slug !== guide.slug);

  return (
    <div className="min-h-screen bg-[#05070b] pb-20 text-white">
      <SEO
        title={`${guide.title} | BallMtaani WC26 Guide`}
        description={guide.deck}
        keywords={["World Cup 2026", guide.eyebrow, "WC26 Kenya", "BallMtaani World Cup guide", guide.title]}
        path={`/world-cup-2026/${guide.slug}`}
        breadcrumbs={[
          { name: "BallMtaani", url: "/" },
          { name: "World Cup 2026", url: "/world-cup-2026" },
          { name: guide.eyebrow, url: `/world-cup-2026/${guide.slug}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-[#FFD700]/14 bg-[#040508]">
        <img src="/wc26-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-36" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-[#05070b]/74 to-[#05070b]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070b] via-[#05070b]/50 to-transparent" />

        <div className="relative mx-auto max-w-5xl px-4 py-10 md:py-16">
          <Link href="/world-cup-2026" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
            <ChevronLeft className="h-3.5 w-3.5" />
            WC26 Hub
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
            <BookOpen className="h-3.5 w-3.5" />
            {guide.eyebrow}
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl">
            {guide.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/62 md:text-lg">{guide.deck}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {guide.statLine.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/42 p-4 backdrop-blur-sm">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</div>
                <div className="mt-2 text-2xl font-black text-[#FFD700]">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#FFD700]/16 bg-[#0c0b04] p-5 md:p-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
              <ShieldCheck className="h-4 w-4" />
              Fan read
            </div>
            <p className="mt-3 text-base leading-8 text-white/72">{guide.fanTake}</p>
          </section>

          {guide.sections.map((section, index) => (
            <section key={section.title} className="rounded-2xl border border-white/8 bg-[#090d14] p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-[11px] font-black text-[#FFD700]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-base font-black uppercase tracking-[0.16em] text-white">{section.title}</h2>
              </div>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-white/62 md:text-base md:leading-8">{paragraph}</p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 text-sm leading-6 text-white/62">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-white/8 bg-[#090d14] p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Use this guide</h3>
            <div className="mt-4 grid gap-2">
              <Link href="/predictions" className="flex items-center justify-between rounded-xl border border-[#FFD700]/12 bg-[#FFD700]/8 px-3 py-2 text-sm font-bold text-[#FFD700]">
                Make a WC26 call <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href={`/mchambuzi-halisi?q=${encodeURIComponent(`Explain ${guide.title} for a Kenyan football fan`)}`} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white/70">
                Ask Mchambuzi <MessageCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#090d14] p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Related WC26 reads</h3>
            <div className="mt-4 space-y-2">
              {related.map((item) => (
                <Link key={item.slug} href={`/world-cup-2026/${item.slug}`} className="block rounded-xl border border-white/8 bg-white/[0.03] p-3 transition-all hover:border-[#FFD700]/25 hover:bg-white/[0.055]">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#FFD700]/45">{item.eyebrow}</div>
                  <div className="mt-1 text-sm font-black leading-snug text-white">{item.title}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#FFD700]/12 bg-[#0c0b04] p-5">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#FFD700]">Sources</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {guide.sourceLinks.map((source) => (
                <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/70">
                  <ExternalLink className="h-3 w-3" />
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
