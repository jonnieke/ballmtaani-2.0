import { Link } from "wouter";
import SEO from "../components/SEO";

const PILLARS = [
  {
    icon: "⚽",
    title: "Built for the Kenyan Fan",
    body: "BallMtaani was built from a simple frustration: football coverage in Kenya has too often been written for someone else. We cover the Premier League, La Liga and the Champions League, but we do it from a Nairobi point of view with Kenyan context and an African fan's voice.",
  },
  {
    icon: "📰",
    title: "Mtaa Daily - Original Reporting",
    body: "Mtaa Daily is our editorial desk. We publish original football analysis, match reports, African football coverage and opinion from Kenyan writers. The name means street daily - a nod to match-day newspapers and the culture around them.",
  },
  {
    icon: "🏆",
    title: "World Cup 2026 Archive",
    body: "World Cup 2026 is now part of the archive and remains an important story for African football. BallMtaani keeps the tournament pages, analysis and context available for fans who want the full history and results in one place.",
  },
  {
    icon: "🤖",
    title: "Mchambuzi AI",
    body: "Mchambuzi (Swahili for analyst) is our football assistant with African context. Ask it about tactics, transfers, the EPL, KPL, World Cup history or match previews and it gives direct answers without the generic fluff.",
  },
  {
    icon: "🎮",
    title: "Fan Games and Rewards",
    body: "Making a correct prediction, winning a debate or completing trivia can earn MTC (Mtaa Coins). MTC can be redeemed for real Kenyan airtime, subject to the platform rules and campaign terms.",
  },
  {
    icon: "📡",
    title: "Live Intelligence, Not Just Scores",
    body: "Our live center brings together scores, fixtures, standings and match context in one place. We treat football as a story unfolding, not just a number on a screen.",
  },
];

const EDITORIAL = [
  "BallMtaani publishes original editorial content through Mtaa Daily. Opinions belong to their authors, not to the platform as a whole.",
  "Live scores, fixtures and standings are sourced from API-Football and updated in real time. We add editorial context for our audience.",
  "RSS items in the Wire are clearly attributed to their original publishers. BallMtaani does not claim authorship of external content.",
  "We do not sell editorial coverage. Sponsored placements are clearly labelled and kept separate from news judgment.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] pb-24">
      <SEO
        title="About BallMtaani | Kenya's Football Community Platform"
        description="BallMtaani is Kenya's home for football - live scores, Mtaa Daily original reporting, fan predictions, Mchambuzi AI analysis and real airtime rewards. Built in Nairobi for African fans."
        keywords={["about BallMtaani", "Kenya football platform", "Nairobi football", "World Cup 2026 archive Kenya", "African football coverage", "Mtaa Daily football news"]}
        path="/about"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "About", url: "/about" }]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "BallMtaani",
          "url": "https://ballmtaani.com",
          "logo": "https://ballmtaani.com/logo.png",
          "description": "Kenya's home for football - live scores, Premier League, KPL, original reporting and fan games with real rewards.",
          "foundingLocation": { "@type": "Place", "name": "Nairobi, Kenya" },
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "info@ballmtaani.com",
            "contactType": "customer support"
          },
          "sameAs": []
        }}
      />

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
            BallMtaani is Kenya's home for football intelligence - live coverage, original reporting through Mtaa Daily, fan predictions, Mchambuzi AI analysis and engagement rewards that can become real Kenyan airtime.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <section className="border-b border-white/6 py-12">
          <h2 className="mb-2 border-l-4 border-[#B30000] pl-3 text-lg font-black uppercase tracking-wide text-white">The Story</h2>
          <p className="mb-4 ml-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Why We Built This</p>
          <div className="space-y-4 text-sm leading-relaxed text-white/60">
            <p>
              BallMtaani started from a question every Kenyan football fan asks on matchday: why does so much football coverage feel like it was written for someone in Manchester?
            </p>
            <p>
              We follow the Premier League, La Liga and the Champions League passionately. But we watch from Nairobi. We care about African teams, Harambee Stars, the KPL and the local arguments that come with supporting a club here.
            </p>
            <p>
              The football internet did not have a home for that angle, so we built one.
            </p>
            <p>
              BallMtaani launched as a prediction platform and grew into a football community: original editorial via Mtaa Daily, live match intelligence, AI analysis with African context and a rewards system that turns correct calls into Kenyan airtime.
            </p>
            <p>
              The name means football in the streets - a reference to the informal match-day culture that runs through every Kenyan town. The barber who predicts a result before kick-off. The WhatsApp group that becomes a war room. The receipt culture where getting it right matters.
            </p>
          </div>
        </section>

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

        <section className="border-b border-white/6 py-12">
          <h2 className="mb-2 border-l-4 border-[#FFD700] pl-3 text-lg font-black uppercase tracking-wide text-white">World Cup 2026 Archive</h2>
          <p className="mb-6 ml-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Historic Coverage</p>
          <div className="rounded-2xl border border-[#FFD700]/15 bg-[#FFD700]/5 p-6">
            <p className="mb-4 text-sm leading-relaxed text-white/70">
              FIFA World Cup 2026, hosted across the USA, Canada and Mexico, remains a major archive for African football. BallMtaani keeps the tournament pages, analysis and results available alongside our regular coverage of current football.
            </p>
            <p className="mb-4 text-sm leading-relaxed text-white/70">
              We track African teams with dedicated live pages, community calls, post-match analysis and Mchambuzi breakdowns. We also keep archive trivia, bracket history and Golden Boot context for fans who want the full story.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              Tournament dates: 11 June to 19 July 2026.
            </p>
          </div>
        </section>

        <section className="border-b border-white/6 py-12">
          <h2 className="mb-2 border-l-4 border-white/30 pl-3 text-lg font-black uppercase tracking-wide text-white">Editorial Policy</h2>
          <p className="mb-6 ml-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Standards & Independence</p>
          <ul className="space-y-3">
            {EDITORIAL.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/55">
                <span className="mt-0.5 shrink-0 text-[#B30000]">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-12">
          <h2 className="mb-6 border-l-4 border-white/30 pl-3 text-lg font-black uppercase tracking-wide text-white">Get In Touch</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/contact" className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-[#0d1018] p-5 transition-all hover:border-white/16">
              <span className="text-xs font-black uppercase tracking-widest text-white/40">Editorial & General</span>
              <span className="font-black text-white">Contact Us &rarr;</span>
              <span className="text-xs text-white/35">Questions, partnerships, press</span>
            </Link>
            <a href="mailto:info@ballmtaani.com" className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-[#0d1018] p-5 transition-all hover:border-white/16">
              <span className="text-xs font-black uppercase tracking-widest text-white/40">Direct Email</span>
              <span className="font-black text-white">info@ballmtaani.com</span>
              <span className="text-xs text-white/35">Sponsorship and advertising enquiries</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
