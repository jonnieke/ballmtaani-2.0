import { Link } from "wouter";
import SEO from "../components/SEO";

const PILLARS = [
  {
    icon: "⚽",
    title: "Built for the Kenyan Fan",
    body: "BallMtaani was built from a simple frustration: football coverage in Kenya has always been designed for fans somewhere else. We cover the Premier League, La Liga and Champions League — but we do it the way a Nairobi street corner does, with WC26 lens, Kenya context and zero apologies for supporting Arsenal.",
  },
  {
    icon: "📰",
    title: "Mtaa Daily — Original Reporting",
    body: "Mtaa Daily is our editorial arm. We commission and publish original football analysis, match reports, WC26 commentary, and African football coverage from Kenyan writers. The name means 'street daily' — a nod to the match-day newspapers sold outside stadiums across East Africa.",
  },
  {
    icon: "🏆",
    title: "World Cup 2026 — Africa's Moment",
    body: "For the first time in the tournament's history, nine African nations qualified for the same World Cup. BallMtaani treats this as the story it is. We track every African team — Morocco, Nigeria, Senegal, Egypt, Cameroon, Ghana, Algeria, South Africa, Tunisia — with dedicated coverage, live updates and community calls.",
  },
  {
    icon: "🤖",
    title: "Mchambuzi AI",
    body: "Mchambuzi (Swahili for 'analyst') is our AI football analyst trained to give context from an African fan's perspective. Ask it about WC26 tactics, EPL form, transfer rumours or any football question. It gives straight answers with African context, not generic Wikipedia summaries.",
  },
  {
    icon: "🎮",
    title: "Fan Games that Earn Real Rewards",
    body: "Making a correct match prediction, winning a debate, completing trivia — these earn MTC (Mtaa Coins). MTC can be redeemed for real Kenyan airtime. We built this system because we wanted engagement to mean something beyond likes. Your football knowledge should pay, even a little.",
  },
  {
    icon: "📡",
    title: "Live Intelligence, Not Just Scores",
    body: "Our Data Centre gives you live scores, today's fixtures, league standings and WC26 top scorers in one place — updated in real time. Our Live Center adds momentum graphs and community commentary on top of the match ticker. We treat a live game as a story unfolding, not just a number.",
  },
];

const EDITORIAL = [
  "BallMtaani publishes original editorial content through Mtaa Daily. All opinion pieces represent the views of their authors, not those of BallMtaani as a platform.",
  "Live scores, fixture data and standings are sourced from API-Football and updated in real time. We apply editorial judgment when contextualising this data for our audience.",
  "RSS feeds aggregated in our Wire section are clearly attributed to their original publishers. BallMtaani does not claim authorship of external content.",
  "We do not accept payment to publish editorial content. Sponsored placements are clearly labelled 'Sponsor' or 'Partner'. Editorial and commercial decisions are made independently.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] pb-24">
      <SEO
        title="About BallMtaani | Kenya's Football Community Platform"
        description="BallMtaani is Kenya's home for football — live WC26 scores, Mtaa Daily original reporting, fan predictions, Mchambuzi AI analysis and real airtime rewards. Built in Nairobi for African fans."
        keywords={["about BallMtaani", "Kenya football platform", "Nairobi football", "WC26 Kenya", "African football coverage", "Mtaa Daily football news"]}
        path="/about"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "About", url: "/about" }]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "BallMtaani",
          "url": "https://ballmtaani.com",
          "logo": "https://ballmtaani.com/logo.png",
          "description": "Kenya's home for football — World Cup 2026, Premier League, KPL, original reporting and fan games with real rewards.",
          "foundingLocation": { "@type": "Place", "name": "Nairobi, Kenya" },
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "info@ballmtaani.com",
            "contactType": "customer support"
          },
          "sameAs": []
        }}
      />

      {/* ── HERO ── */}
      <div className="border-b border-white/8 bg-[#07060a]">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#B30000]/25 bg-[#B30000]/8 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B30000]" />
            <span className="text-[9px] font-black uppercase tracking-[0.28em] text-[#B30000]">Est. Nairobi, Kenya</span>
          </div>
          <h1 className="mb-4 text-4xl font-black leading-tight text-white md:text-5xl">
            Football, the way the <span className="text-[#B30000]">streets</span> see it.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
            BallMtaani is Kenya's home for football intelligence — live World Cup 2026 coverage, original reporting through Mtaa Daily, fan predictions, Mchambuzi AI analysis and engagement rewards that pay out as real Kenyan airtime.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4">

        {/* ── ORIGIN STORY ── */}
        <section className="border-b border-white/6 py-12">
          <h2 className="mb-2 border-l-4 border-[#B30000] pl-3 text-lg font-black uppercase tracking-wide text-white">The Story</h2>
          <p className="mb-4 ml-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Why We Built This</p>
          <div className="space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              BallMtaani started from a question every Kenyan football fan asks on matchday: <em className="text-white/80">why does all the football coverage feel like it was written for someone in Manchester?</em>
            </p>
            <p>
              We follow the Premier League, La Liga, the Champions League — passionately, knowledgeably. But we watch those games from Nairobi. We care about how African teams perform. We talk about Harambee Stars qualifying dreams. We know every Arsenal fan in our area and can name the precise moment each of them became a supporter.
            </p>
            <p>
              The football internet didn't have a home for that angle. So we built one.
            </p>
            <p>
              BallMtaani launched as a prediction platform and grew into a full football community: original editorial via Mtaa Daily, live match intelligence, AI analysis calibrated for African context, and a rewards system that turns correct calls into real Kenyan airtime.
            </p>
            <p>
              The name means 'football in the streets' — a reference to the informal match-day culture that runs through every Kenyan town. The local barber who calls every result correctly. The WhatsApp group that becomes a war room at kick-off. The receipt culture where getting it right matters more than any stat sheet.
            </p>
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="border-b border-white/6 py-12">
          <h2 className="mb-2 border-l-4 border-[#B30000] pl-3 text-lg font-black uppercase tracking-wide text-white">What We Cover</h2>
          <p className="mb-8 ml-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Platform Pillars</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {PILLARS.map(p => (
              <div key={p.title} className="rounded-xl border border-white/6 bg-[#0d1018] p-5">
                <div className="mb-3 text-2xl">{p.icon}</div>
                <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-white">{p.title}</h3>
                <p className="text-xs leading-relaxed text-white/50">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WC26 ── */}
        <section className="border-b border-white/6 py-12">
          <h2 className="mb-2 border-l-4 border-[#FFD700] pl-3 text-lg font-black uppercase tracking-wide text-white">World Cup 2026</h2>
          <p className="mb-6 ml-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Our Biggest Editorial Focus</p>
          <div className="rounded-2xl border border-[#FFD700]/15 bg-[#FFD700]/5 p-6">
            <p className="mb-4 text-sm leading-relaxed text-white/70">
              FIFA World Cup 2026 — hosted across the USA, Canada and Mexico — is the most important sporting event for African football in a generation. Nine African nations qualified: <strong className="text-white">Morocco, Nigeria, Senegal, Egypt, South Africa, Cameroon, Ghana, Algeria and Tunisia</strong>.
            </p>
            <p className="mb-4 text-sm leading-relaxed text-white/70">
              BallMtaani covers every match involving an African team with dedicated live pages, community calls, post-match analysis and Mchambuzi AI breakdown. We also run WC26 trivia, bracket predictions and a Golden Boot tracker.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              The tournament runs 11 June – 19 July 2026. Every goal. Every upset. Every receipt.
            </p>
          </div>
        </section>

        {/* ── EDITORIAL POLICY ── */}
        <section className="border-b border-white/6 py-12">
          <h2 className="mb-2 border-l-4 border-white/30 pl-3 text-lg font-black uppercase tracking-wide text-white">Editorial Policy</h2>
          <p className="mb-6 ml-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Standards & Independence</p>
          <ul className="space-y-3">
            {EDITORIAL.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/55">
                <span className="mt-0.5 shrink-0 text-[#B30000]">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── CONTACT CTA ── */}
        <section className="py-12">
          <h2 className="mb-6 border-l-4 border-white/30 pl-3 text-lg font-black uppercase tracking-wide text-white">Get In Touch</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/contact"
              className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-[#0d1018] p-5 transition-all hover:border-white/16">
              <span className="text-xs font-black uppercase tracking-widest text-white/40">Editorial & General</span>
              <span className="font-black text-white">Contact Us →</span>
              <span className="text-xs text-white/35">Questions, partnerships, press</span>
            </Link>
            <a href="mailto:info@ballmtaani.com"
              className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-[#0d1018] p-5 transition-all hover:border-white/16">
              <span className="text-xs font-black uppercase tracking-widest text-white/40">Direct Email</span>
              <span className="font-black text-white">info@ballmtaani.com</span>
              <span className="text-xs text-white/35">Sponsorship & advertising enquiries</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
