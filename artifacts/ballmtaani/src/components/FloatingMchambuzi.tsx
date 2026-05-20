import { FormEvent, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { askMchambuziHalisi } from "../lib/mchambuzi-halisi";

type FloatingMchambuziProps = {
  variant?: "landing" | "home";
};

type ChatLine = {
  role: "fan" | "analyst";
  text: string;
  provider?: string;
  citation?: string;
};

const QUICK_PROMPTS = [
  "Give me today's sharp football read",
  "Which match should I watch?",
  "Any big story I should know?",
];

export default function FloatingMchambuzi({ variant = "home" }: FloatingMchambuziProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([
    {
      role: "analyst",
      text: "Uliza haraka. I will give you the football read without making you leave the page.",
    },
  ]);

  const ask = async (value = question) => {
    const clean = value.trim();
    if (clean.length < 3 || thinking) return;

    setQuestion("");
    setOpen(true);
    setThinking(true);
    setLines((prev) => [...prev, { role: "fan", text: clean }]);

    const result = await askMchambuziHalisi(clean);
    const sources = Array.isArray(result.context?.sources) && result.context.sources.length
      ? result.context.sources.join(" | ")
      : "API-Football | BBC Sport RSS | Goal.com RSS";
    const updatedAt = result.context?.generatedAtLabel || "Latest timeline";
    const citation = `${sources} • Updated: ${updatedAt}`;
    setLines((prev) => [...prev, { role: "analyst", text: result.answer, provider: result.provider, citation }]);
    setThinking(false);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask();
  };

  const panelTone = variant === "landing"
    ? "border-primary/40 bg-[#090e17]/96 shadow-[0_24px_80px_rgba(239,35,48,0.22)]"
    : "border-[#FFD700]/30 bg-[#0d1118]/96 shadow-[0_24px_80px_rgba(0,0,0,0.45)]";

  return (
    <div className="fixed bottom-24 right-3 z-50 md:bottom-6 md:right-6">
      {open ? (
        <div className={`w-[calc(100vw-1.5rem)] max-w-[390px] overflow-hidden rounded-3xl border text-white backdrop-blur-2xl ${panelTone}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold uppercase tracking-[0.12em]">Ask Analyst</div>
                <div className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">Mchambuzi Halisi</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close analyst"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-3">
            {lines.slice(-5).map((line, index) => (
              <div
                key={`${line.role}-${index}-${line.text.slice(0, 12)}`}
                className={line.role === "fan" ? "ml-8 rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-white" : "mr-4 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-6 text-white/82"}
              >
                {line.text}
                {line.provider ? (
                  <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                    {line.provider === "fallback" ? "Data mode" : line.provider}
                  </div>
                ) : null}
                {line.citation ? (
                  <div className="mt-2 border-t border-white/10 pt-2 text-[10px] leading-4 text-white/55">
                    Citation: {line.citation}
                  </div>
                ) : null}
              </div>
            ))}
            {thinking ? (
              <div className="mr-12 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/48">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Reading the game
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => ask(prompt)}
                  disabled={thinking}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/58 hover:border-primary/50 hover:text-white disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 p-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask for a quick read..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/30"
              />
              <button
                type="submit"
                disabled={question.trim().length < 3 || thinking}
                aria-label="Ask Mchambuzi"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-3 rounded-full border border-primary/45 bg-[#0b1119]/92 px-3 py-2.5 text-left text-white shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 md:px-4"
          aria-label="Ask Mchambuzi Halisi"
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_24px_rgba(239,35,48,0.72)]">
            <MessageCircle className="h-5 w-5" />
            <Sparkles className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#FFD700] p-0.5 text-black" />
          </span>
          <span className="pr-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-primary md:text-xs">Ask Analyst</span>
            <span className="block text-xs font-bold text-white md:text-sm">Quick football read</span>
          </span>
        </button>
      )}
    </div>
  );
}
