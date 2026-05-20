import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Bot, Brain, Newspaper, Radio, Send, Sparkles, Trophy } from "lucide-react";
import SEO from "../components/SEO";
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

const QUICK_QUESTIONS = [
  "What are the biggest football stories right now?",
  "Which upcoming match should Kenyan fans watch?",
  "Give me a funny but honest Premier League read.",
  "What is happening in live football now?",
];

function ContextStrip({ context }: { context?: MchambuziContext }) {
  if (!context) return null;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-primary/25 bg-primary/8 p-4">
        <Radio className="mb-2 h-5 w-5 text-primary" />
        <div className="text-2xl font-bold text-white">{context.live.length}</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Live matches</div>
      </div>
      <div className="rounded-2xl border border-blue-400/25 bg-blue-500/8 p-4">
        <Trophy className="mb-2 h-5 w-5 text-blue-300" />
        <div className="text-2xl font-bold text-white">{context.upcoming.length}</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Upcoming feed</div>
      </div>
      <div className="rounded-2xl border border-[#FFD700]/25 bg-[#FFD700]/8 p-4">
        <Newspaper className="mb-2 h-5 w-5 text-[#FFD700]" />
        <div className="text-2xl font-bold text-white">{context.news.length}</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">BBC / Goal headlines</div>
      </div>
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

  const canAsk = question.trim().length > 2 && !isThinking;

  const ask = async (value = question) => {
    const clean = value.trim();
    if (!clean || isThinking) return;

    setQuestion("");
    setIsThinking(true);
    setMessages((prev) => [...prev, { role: "fan", text: clean }]);

    const result = await askMchambuziHalisi(clean);
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
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="h-full w-full object-cover opacity-28"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(239,35,48,0.5),transparent_24%),radial-gradient(circle_at_16%_18%,rgba(0,177,255,0.22),transparent_30%),linear-gradient(180deg,rgba(6,9,15,0.62),#06090f_76%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur-xl transition-colors hover:border-primary/60 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Live Hub
        </Link>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-primary">AI football analyst</p>
            <h1 className="text-4xl font-bold italic leading-none md:text-6xl">Mchambuzi Halisi</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/66">
              Ask about live games, fixtures, transfers, headlines, form, WC26 or why your club is stressing you like rent day.
            </p>
          </div>

          <div className="rounded-3xl border border-white/12 bg-[#0c121b]/88 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/35 bg-primary/12 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase text-white">Routed To Real Feeds</h2>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/42">{sourceLabel}</p>
              </div>
            </div>
            <ContextStrip context={latestContext} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-white/10 bg-[#0b1119]/92 p-3 md:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold uppercase text-white">Ask the analyst</h2>
              </div>
              <span className="rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300">
                Football only
              </span>
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "fan" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] rounded-2xl border px-4 py-3 text-sm leading-6 ${
                    message.role === "fan"
                      ? "border-primary/35 bg-primary/14 text-white"
                      : "border-white/10 bg-white/[0.04] text-white/76"
                  }`}>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">
                      {message.role === "fan" ? "Fan" : message.provider === "openai" ? "Mchambuzi Halisi" : message.provider === "gemini" ? "Mchambuzi Halisi" : message.usedAi === false ? "Mchambuzi Halisi - data mode" : "Mchambuzi Halisi"}
                    </div>
                    {message.text}
                    {message.role === "mchambuzi" && message.citation ? (
                      <div className="mt-2 border-t border-white/10 pt-2 text-[11px] leading-5 text-white/55">
                        Citation: {message.citation}
                      </div>
                    ) : null}
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

            <form onSubmit={submit} className="mt-4 flex gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask: Is Arsenal cooking or are we dreaming again?"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-primary/60"
              />
              <button
                type="submit"
                disabled={!canAsk}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                Ask
              </button>
            </form>
          </div>

          <aside className="space-y-3">
            <div className="rounded-3xl border border-white/10 bg-[#0b1119]/88 p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Quick asks</h3>
              <div className="mt-3 space-y-2">
                {QUICK_QUESTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => ask(item)}
                    disabled={isThinking}
                    className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm text-white/64 transition-colors hover:border-primary/45 hover:text-white disabled:opacity-40"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/8 p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">What it checks</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/58">
                <li>API-Football live scores and fixtures</li>
                <li>Recent match receipts</li>
                <li>BBC Sport and Goal.com headlines</li>
                <li>BallMtaani fan-first tone</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
