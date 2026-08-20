import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { ArrowLeft, Bot, Brain, Newspaper, Radio, Send, Sparkles, Trophy } from "lucide-react";
import SEO from "../components/SEO";
import { useMatches, useUpcomingFixtures, useRecentMatches } from "../hooks/useData";
import {
  askMchambuziHalisi,
  type MchambuziContext,
} from "../lib/mchambuzi-halisi";

type ChatMessage = {
  role: "fan" | "mchambuzi";
  text: string;
  usedAi?: boolean;
  provider?: string;
  citation?: string;
};

const WC26_QUESTIONS = [
  "Who's looking best after the first week of WC26?",
  "Which African nation has surprised you most so far?",
  "Who's the early golden boot frontrunner right now?",
  "Any upsets already? Which team is shocking people?",
  "Which group is the most entertaining to watch?",
  "Give me one team that's quietly dangerous this WC26.",
];

const GENERAL_QUESTIONS = [
  "What are the biggest football stories right now?",
  "Which upcoming match should Kenyan fans watch?",
  "Give me a funny but honest Premier League read.",
  "What is happening in live football now?",
];

function ContextStrip({ context }: { context?: MchambuziContext }) {
  if (!context) return null;
  return (
    <div className="flex flex-wrap gap-2 text-[11px]">
      <span className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 font-bold text-primary">
        <Radio className="h-3 w-3" /> {context.live.length} live
      </span>
      <span className="flex items-center gap-1.5 rounded-full border border-blue-400/22 bg-blue-500/8 px-3 py-1 font-bold text-blue-300">
        <Trophy className="h-3 w-3" /> {context.upcoming.length} upcoming
      </span>
      <span className="flex items-center gap-1.5 rounded-full border border-[#FFD700]/22 bg-[#FFD700]/8 px-3 py-1 font-bold text-[#FFD700]">
        <Newspaper className="h-3 w-3" /> {context.news.length} headlines
      </span>
    </div>
  );
}

export default function MchambuziHalisiPage() {
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [latestContext, setLatestContext] = useState<MchambuziContext | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "mchambuzi",
      text: "Karibu. I am Mchambuzi Halisi: funny when needed, ruthless when the football is poor, and allergic to fake certainty. Ask me anything football.",
    },
  ]);

  // Load React Query data to use as pre-fetched context (avoids duplicate API calls + rate limits)
  const { data: liveMatches = [] } = useMatches();
  const { data: upcomingFixtures = [] } = useUpcomingFixtures();
  const { data: recentMatches = [] } = useRecentMatches();

  // Pre-fill question from URL ?q= param (e.g. from Live Center "Ask Mchambuzi" button)
  const search = useSearch();
  useEffect(() => {
    const params = new URLSearchParams(search);
    const q = params.get("q");
    if (q && q.trim().length > 2) {
      setQuestion(q.trim());
    }
  }, [search]);

  const canAsk = question.trim().length > 2 && !isThinking;

  const ask = async (value = question) => {
    const clean = value.trim();
    if (!clean || isThinking) return;

    setQuestion("");
    setIsThinking(true);
    setMessages((prev) => [...prev, { role: "fan", text: clean }]);

    // Pass pre-loaded data to avoid hitting API rate limits on fallback
    const result = await askMchambuziHalisi(clean, {
      live: liveMatches,
      upcoming: upcomingFixtures,
      recent: recentMatches,
    });
    setLatestContext(result.context);
    const sources = Array.isArray(result.context?.sources) && result.context.sources.length
      ? result.context.sources.join(" | ")
      : "API-Football | BBC Sport RSS | Goal.com RSS";
    const updatedAt = result.context?.generatedAtLabel || "Latest timeline";
    const citation = `${sources} • Updated: ${updatedAt}`;
    setMessages((prev) => [...prev, { role: "mchambuzi", text: result.answer, usedAi: result.usedAi, provider: result.provider, citation }]);
    setIsThinking(false);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canAsk) ask();
  };

  const sourceLabel = useMemo(() => {
    if (!latestContext) return "API-Football + BBC/Goal ready";
    return `${latestContext.live.length} live, ${latestContext.upcoming.length} upcoming, ${latestContext.news.length} headlines checked`;
  }, [latestContext]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06090f] pb-24 text-white">
      <SEO
        title="Mchambuzi Halisi | BallMtaani AI Football Analyst"
        description="Ask Mchambuzi Halisi, BallMtaani's Kenyan AI football analyst, about live matches, fixtures, football news, form, transfers, WC26 and match context."
        keywords={[
          "Mchambuzi Halisi",
          "AI football analyst Kenya",
          "football AI Kenya",
          "BallMtaani AI",
          "football news Kenya",
          "live football analysis",
        ]}
        path="/mchambuzi-halisi"
        breadcrumbs={[
          { name: "BallMtaani", url: "/" },
          { name: "Mchambuzi Halisi", url: "/mchambuzi-halisi" },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Mchambuzi Halisi",
          "applicationCategory": "SportsApplication",
          "operatingSystem": "Web",
          "description": "AI football analyst for Kenyan fans using BallMtaani football data and news context.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KES",
          },
        }}
      />

      <div className="fixed inset-0 z-0">
        <img
          src="/wc26-hero.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(239,35,48,0.45),transparent_24%),radial-gradient(circle_at_16%_18%,rgba(0,177,255,0.18),transparent_30%),linear-gradient(180deg,rgba(6,9,15,0.55),#06090f_72%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Link href="/home" className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur-xl transition-colors hover:border-primary/60 hover:text-primary sm:mb-5">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>

        <section className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-primary">AI football analyst · WC26 ready</p>
          </div>
          <h1 className="max-w-3xl text-[clamp(2.25rem,8vw,3.8rem)] font-black italic leading-[0.94] text-white md:text-5xl">
            Mchambuzi Halisi
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:leading-relaxed">
            Ask about live scores, WC26 predictions, transfers, African football, or why your club is stressing you like rent day. Routed through live API feeds.
          </p>
          {latestContext && (
            <div className="mt-3">
              <ContextStrip context={latestContext} />
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-white/10 bg-[#0b1119]/92 p-3 md:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold uppercase text-white sm:text-lg">Ask the analyst</h2>
              </div>
              <span className="shrink-0 rounded-full border border-green-400/20 bg-green-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-green-300 sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">
                Football only
              </span>
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "fan" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[92%] rounded-2xl border px-4 py-3 text-sm leading-6 sm:max-w-[86%] ${
                    message.role === "fan"
                      ? "border-primary/35 bg-primary/14 text-white"
                      : "border-white/10 bg-white/[0.04] text-white/76"
                  }`}>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">
                      {message.role === "fan" ? "Fan" : message.usedAi === false ? "Mchambuzi · Live Data" : "Mchambuzi Halisi"}
                    </div>
                    {message.text}
                    {message.role === "mchambuzi" && (
                      <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-2">
                        {message.citation ? (
                          <span className="text-[10px] leading-5 text-white/32">
                            {message.citation}
                          </span>
                        ) : <span />}
                        <button
                          onClick={() => {
                            const text = encodeURIComponent(`🤖 Mchambuzi Halisi says:\n\n"${message.text}"\n\nAsk your own: https://ballmtaani.com/mchambuzi-halisi`);
                            window.open(`https://wa.me/?text=${text}`, "_blank");
                          }}
                          className="ml-2 shrink-0 rounded-lg bg-[#25D366]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#25D366] transition-all hover:bg-[#25D366]/20"
                        >
                          WA
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isThinking ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                  <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                  Checking live data and headlines...
                </div>
              ) : null}
            </div>

            <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask: Who wins WC26 or why is your club stressing you..."
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-primary/60"
              />
              <button
                type="submit"
                disabled={!canAsk}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 sm:shrink-0"
              >
                <Send className="h-4 w-4" />
                Ask
              </button>
            </form>
          </div>

          <aside className="space-y-3">
            {/* WC26 questions — most relevant right now */}
            <div className="overflow-hidden rounded-2xl border border-[#FFD700]/22 bg-[#0c0b02]/90">
              <div className="flex items-center gap-2 border-b border-[#FFD700]/12 px-4 py-2.5">
                <Trophy className="h-3.5 w-3.5 text-[#FFD700]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700] sm:text-[11px] sm:tracking-widest">WC26 — Ask Now</h3>
              </div>
              <div className="divide-y divide-white/5">
                {WC26_QUESTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => ask(item)}
                    disabled={isThinking}
                    className="block w-full px-4 py-3 text-left text-[11px] leading-5 text-white/60 transition-colors hover:bg-[#FFD700]/5 hover:text-white disabled:opacity-40 sm:py-2.5 sm:text-[12px]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* General questions */}
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0b1119]/90">
              <div className="border-b border-white/6 px-4 py-2.5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55 sm:text-[11px] sm:tracking-widest">General football</h3>
              </div>
              <div className="divide-y divide-white/5">
                {GENERAL_QUESTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => ask(item)}
                    disabled={isThinking}
                    className="block w-full px-4 py-3 text-left text-[11px] leading-5 text-white/55 transition-colors hover:bg-white/[0.03] hover:text-white disabled:opacity-40 sm:py-2.5 sm:text-[12px]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Data sources */}
            <div className="rounded-2xl border border-white/6 bg-[#0b1119]/80 px-4 py-3">
              <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/35">Live data sources</h3>
              <div className="space-y-1 text-[11px] text-white/35">
                <div>API-Football · live scores + fixtures</div>
                <div>BBC Sport · Goal.com · RSS headlines</div>
                <div>Vertex AI Gemini 2.5 Flash · analysis</div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
