import { useState, useRef, useCallback } from "react";
import SEO from "../components/SEO";
import { WC26_TEAMS } from "../data/wc26-teams";

// ─── Types ───────────────────────────────────────────────────
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}
interface FanCard {
  name: string;
  team: string;
  position: string;
  number: string;
  rating: string;
  flag: string;
}
type Feature = "hub" | "quiz" | "genius" | "fancard" | "predict";

// ─── Mchambuzi API helper ────────────────────────────────────
async function askMchambuzi(question: string): Promise<string> {
  const res = await fetch("/api/mchambuzi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("AI unavailable");
  const data = await res.json();
  return data.answer || data.response || String(data);
}

// ─── Subcomponent: Football IQ Quiz ─────────────────────────
function QuizFeature({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<"intro" | "loading" | "playing" | "done">("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ q: string; chosen: string; correct: string; right: boolean }[]>([]);
  const [topic, setTopic] = useState("WC26 general knowledge");

  const TOPICS = [
    "WC26 general knowledge",
    "African football WC26",
    "WC26 host stadiums and cities",
    "WC26 groups and fixtures",
    "World Cup history and records",
  ];

  const generateQuiz = async () => {
    setPhase("loading");
    try {
      const prompt = `Generate a 5-question multiple-choice quiz about "${topic}" for African football fans excited about World Cup 2026.
For each question output EXACTLY this JSON format (no markdown, raw JSON array):
[{"question":"...","options":["A","B","C","D"],"answer":"exact text of correct option","explanation":"1-sentence explanation"}]
Make questions engaging, relevant to African fans, and accurate. Mix difficulty levels.`;
      const raw = await askMchambuzi(prompt);
      // Extract JSON array from response
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Bad format");
      const parsed: QuizQuestion[] = JSON.parse(match[0]);
      setQuestions(parsed.slice(0, 5));
      setCurrent(0);
      setSelected(null);
      setScore(0);
      setResults([]);
      setPhase("playing");
    } catch {
      setPhase("intro");
      alert("AI is loading, try again in a moment!");
    }
  };

  const handleAnswer = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const q = questions[current];
    const right = opt === q.answer;
    if (right) setScore((s) => s + 1);
    setResults((r) => [...r, { q: q.question, chosen: opt, correct: q.answer, right }]);
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setPhase("done");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const scoreLabel = score >= 5 ? "Genius!" : score >= 3 ? "Solid fan!" : score >= 1 ? "Keep learning!" : "Back to basics!";
  const scoreColor = score >= 5 ? "#22c55e" : score >= 3 ? "#f59e0b" : "#ef4444";

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
        <span>&#8592;</span> Back to Fan Zone
      </button>

      {phase === "intro" && (
        <div className="max-w-lg mx-auto">
          <div className="text-5xl mb-4 text-center">&#129504;</div>
          <h1 className="text-2xl font-black text-center text-white mb-2">Football IQ Test</h1>
          <p className="text-white/50 text-center text-sm mb-8">5 AI-generated questions. Mchambuzi is watching.</p>

          <div className="mb-6">
            <label className="text-xs uppercase tracking-widest text-white/40 mb-3 block">Choose your topic</label>
            <div className="grid gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    topic === t
                      ? "border-[#B30000] bg-[#B30000]/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuiz}
            className="w-full py-4 rounded-xl bg-[#B30000] text-white font-bold text-base hover:bg-[#cc0000] active:scale-95 transition-all"
          >
            Generate My Quiz
          </button>
        </div>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[#B30000] rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Mchambuzi is crafting your quiz...</p>
        </div>
      )}

      {phase === "playing" && questions[current] && (
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-white/40 uppercase tracking-widest">Question {current + 1} / {questions.length}</span>
            <span className="text-xs font-bold text-[#f59e0b]">{score} correct</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1 mb-6">
            <div className="h-1 bg-[#B30000] rounded-full transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} />
          </div>

          <h2 className="text-lg font-bold text-white mb-6 leading-snug">{questions[current].question}</h2>

          <div className="grid gap-3 mb-6">
            {questions[current].options.map((opt) => {
              let cls = "border-white/10 bg-white/5 text-white/80 hover:border-white/40";
              if (selected) {
                if (opt === questions[current].answer) cls = "border-[#22c55e] bg-[#22c55e]/20 text-white";
                else if (opt === selected && opt !== questions[current].answer) cls = "border-[#ef4444] bg-[#ef4444]/20 text-white";
                else cls = "border-white/5 bg-white/3 text-white/30";
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className={`rounded-xl p-4 mb-4 text-sm ${selected === questions[current].answer ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#ef4444]/10 text-[#ef4444]"}`}>
              <span className="font-bold">{selected === questions[current].answer ? "Correct! " : "Wrong. "}</span>
              {questions[current].explanation}
            </div>
          )}

          {selected && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all"
            >
              {current + 1 >= questions.length ? "See Results" : "Next Question"}
            </button>
          )}
        </div>
      )}

      {phase === "done" && (
        <div className="max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">{score >= 4 ? "&#127942;" : score >= 2 ? "&#129310;" : "&#128514;"}</div>
          <div className="text-5xl font-black mb-2" style={{ color: scoreColor }}>{score}/5</div>
          <p className="text-xl font-bold text-white mb-1">{scoreLabel}</p>
          <p className="text-white/40 text-sm mb-8">{topic}</p>

          <div className="grid gap-2 mb-8 text-left">
            {results.map((r, i) => (
              <div key={i} className={`p-3 rounded-xl text-sm ${r.right ? "bg-[#22c55e]/10" : "bg-[#ef4444]/10"}`}>
                <span className="mr-2">{r.right ? "✓" : "✗"}</span>
                <span className="text-white/70">{r.q}</span>
                {!r.right && <div className="mt-1 text-[10px] text-white/40">Correct: {r.correct}</div>}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPhase("intro"); }}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-all"
            >
              New Topic
            </button>
            <button
              onClick={generateQuiz}
              className="flex-1 py-3 rounded-xl bg-[#B30000] text-white text-sm font-bold hover:bg-[#cc0000] transition-all"
            >
              Retry Same Topic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Subcomponent: Genius or Delulu ─────────────────────────
function GeniusOrDeluluFeature({ onBack }: { onBack: () => void }) {
  const [take, setTake] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ verdict: "GENIUS" | "DELULU" | "LUKEWARM"; rating: number; roast: string } | null>(null);

  const EXAMPLE_TAKES = [
    "Ghana will beat Brazil in the Round of 16",
    "Morocco can win the whole tournament",
    "Kenya would have qualified if they had more time",
    "England will choke in the semis again",
    "Mbappe will be the top scorer of WC26",
  ];

  const analyzeTake = async () => {
    if (take.trim().length < 10) return;
    setLoading(true);
    setResult(null);
    try {
      const prompt = `You are Mchambuzi, a sharp African football analyst. Rate this fan's football take:

"${take}"

Context: FIFA World Cup 2026, 48 teams, held in USA/Canada/Mexico. African teams: Morocco, Senegal, Nigeria, Egypt, Cameroon, South Africa, Ghana, Algeria, Tunisia.

Respond in EXACTLY this JSON format (no markdown):
{"verdict":"GENIUS|DELULU|LUKEWARM","rating":1-10,"roast":"2-3 sentence entertaining analysis with African/Kenyan football perspective, be funny but fair"}

verdict = GENIUS if well-reasoned (rating 7-10), DELULU if wildly wrong (rating 1-4), LUKEWARM if debatable (rating 5-6).`;

      const raw = await askMchambuzi(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Bad format");
      const parsed = JSON.parse(match[0]);
      setResult(parsed);
    } catch {
      alert("Mchambuzi couldn't analyze this take. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const verdictConfig = {
    GENIUS: { color: "#22c55e", bg: "#22c55e/10", emoji: "&#129504;", label: "GENIUS TAKE" },
    DELULU: { color: "#ef4444", bg: "#ef4444/10", emoji: "&#128561;", label: "CERTIFIED DELULU" },
    LUKEWARM: { color: "#f59e0b", bg: "#f59e0b/10", emoji: "&#129335;", label: "IT'S GIVING LUKEWARM" },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
        <span>&#8592;</span> Back to Fan Zone
      </button>

      <div className="max-w-lg mx-auto">
        <div className="text-5xl mb-4 text-center">&#128161;</div>
        <h1 className="text-2xl font-black text-center text-white mb-2">Genius or Delulu?</h1>
        <p className="text-white/50 text-center text-sm mb-8">Drop your hottest WC26 take. Mchambuzi will rate it.</p>

        <textarea
          value={take}
          onChange={(e) => setTake(e.target.value)}
          placeholder="e.g. Morocco will win the whole World Cup..."
          rows={4}
          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-[#B30000] transition-colors mb-4"
        />

        {!take && (
          <div className="mb-4">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TAKES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTake(t)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={analyzeTake}
          disabled={loading || take.trim().length < 10}
          className="w-full py-4 rounded-xl bg-[#B30000] text-white font-bold text-base hover:bg-[#cc0000] active:scale-95 transition-all disabled:opacity-40"
        >
          {loading ? "Mchambuzi is analyzing..." : "Rate My Take"}
        </button>

        {loading && (
          <div className="flex justify-center mt-6">
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#B30000] rounded-full animate-spin" />
          </div>
        )}

        {result && (
          <div className={`mt-6 rounded-2xl border p-6`}
            style={{ borderColor: verdictConfig[result.verdict].color + "40", background: verdictConfig[result.verdict].color + "10" }}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-2" dangerouslySetInnerHTML={{ __html: verdictConfig[result.verdict].emoji }} />
              <div className="text-lg font-black" style={{ color: verdictConfig[result.verdict].color }}>
                {verdictConfig[result.verdict].label}
              </div>
            </div>

            {/* Rating bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Delulu</span>
                <span className="font-bold" style={{ color: verdictConfig[result.verdict].color }}>{result.rating}/10</span>
                <span>Genius</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${result.rating * 10}%`, background: verdictConfig[result.verdict].color }}
                />
              </div>
            </div>

            <blockquote className="italic text-white/80 text-sm leading-relaxed border-l-2 pl-4"
              style={{ borderColor: verdictConfig[result.verdict].color }}>
              "{result.roast}"
            </blockquote>
            <p className="text-right text-xs text-white/30 mt-2">— Mchambuzi</p>

            <button
              onClick={() => { setResult(null); setTake(""); }}
              className="mt-4 w-full py-2 rounded-xl border border-white/20 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              Submit Another Take
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subcomponent: AI Fan Card ────────────────────────────────
function FanCardFeature({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<"form" | "generating" | "done">("form");
  const [form, setForm] = useState({ name: "", team: "Morocco", position: "FWD", number: "10", rating: "82" });
  const [card, setCard] = useState<{ imageUrl?: string; html: string } | null>(null);
  const [statAttributes, setStatAttributes] = useState<{ label: string; value: number }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const POSITIONS = ["GK", "DEF", "MID", "FWD"];
  const TEAMS = WC26_TEAMS.slice(0, 48).map((t) => t.name);

  const teamData = WC26_TEAMS.find((t) => t.name === form.team);
  const flagUrl = teamData?.logo || `https://media.api-sports.io/flags/ma.svg`;

  // Generate card visually in-browser — no external image API needed
  const generateCard = () => {
    if (!form.name.trim()) { alert("Enter your name first!"); return; }
    setPhase("generating");
    const r = Number(form.rating);
    setStatAttributes([
      { label: "PAC", value: Math.min(99, Math.max(50, r + Math.floor(Math.random() * 6) - 3)) },
      { label: "SHO", value: Math.min(99, Math.max(50, r + Math.floor(Math.random() * 8) - 4)) },
      { label: "PAS", value: Math.min(99, Math.max(50, r + Math.floor(Math.random() * 6) - 3)) },
      { label: "DRI", value: Math.min(99, Math.max(50, r + Math.floor(Math.random() * 7) - 3)) },
      { label: "DEF", value: Math.min(99, Math.max(50, r + Math.floor(Math.random() * 10) - 5)) },
      { label: "PHY", value: Math.min(99, Math.max(50, r + Math.floor(Math.random() * 7) - 3)) },
    ]);
    setTimeout(() => {
      setCard({ html: "ready" });
      setPhase("done");
    }, 1500);
  };

  const ratingColor = (r: number) => r >= 85 ? "#FFD700" : r >= 75 ? "#22c55e" : r >= 65 ? "#60a5fa" : "#c0c0c0";
  const ratingLabel = (r: number) => r >= 85 ? "GOLD" : r >= 75 ? "GREEN" : r >= 65 ? "BLUE" : "SILVER";

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
        <span>&#8592;</span> Back to Fan Zone
      </button>

      <div className="max-w-lg mx-auto">
        <div className="text-5xl mb-4 text-center">&#127951;</div>
        <h1 className="text-2xl font-black text-center text-white mb-2">Your WC26 Player Card</h1>
        <p className="text-white/50 text-center text-sm mb-8">Generate your FIFA-style WC26 fan card</p>

        {phase !== "done" && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Your Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                placeholder="e.g. AKINYI"
                maxLength={18}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#B30000] uppercase"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Your Team</label>
              <select
                value={form.team}
                onChange={(e) => setForm({ ...form, team: e.target.value })}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#B30000]"
              >
                {TEAMS.map((t) => <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Position</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#B30000]"
                >
                  {POSITIONS.map((p) => <option key={p} value={p} className="bg-[#1a1a1a]">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Number</label>
                <input
                  type="number"
                  min={1} max={99}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#B30000]"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/40 mb-2 block">Rating</label>
                <input
                  type="number"
                  min={50} max={99}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#B30000]"
                />
              </div>
            </div>
          </div>
        )}

        {phase === "generating" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-12 h-12 border-4 border-white/10 border-t-[#B30000] rounded-full animate-spin" />
            <p className="text-white/50 text-sm">Creating your WC26 card...</p>
          </div>
        )}

        {phase !== "generating" && (
          <button
            onClick={phase === "done" ? () => { setPhase("form"); setCard(null); } : generateCard}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 ${
              phase === "done"
                ? "border border-white/20 text-white hover:bg-white/10"
                : "bg-[#B30000] text-white hover:bg-[#cc0000]"
            }`}
          >
            {phase === "done" ? "Make Another Card" : "Generate My Card"}
          </button>
        )}

        {/* The rendered card */}
        {phase === "done" && card && (
          <div className="mt-8 flex flex-col items-center">
            {/* FIFA-style card */}
            <div
              ref={cardRef}
              className="relative w-64 rounded-2xl overflow-hidden select-none"
              style={{
                background: `linear-gradient(160deg, ${ratingColor(Number(form.rating))}22 0%, #1a1a1a 40%, #111 100%)`,
                border: `2px solid ${ratingColor(Number(form.rating))}60`,
                boxShadow: `0 0 40px ${ratingColor(Number(form.rating))}30, 0 20px 60px #000`,
              }}
            >
              {/* Card header */}
              <div className="relative px-4 pt-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="text-left">
                    <div className="text-4xl font-black leading-none" style={{ color: ratingColor(Number(form.rating)) }}>
                      {form.rating}
                    </div>
                    <div className="text-xs font-bold text-white/60 mt-0.5">{form.position}</div>
                    <img src={flagUrl} alt={form.team} className="w-8 h-auto mt-2 rounded" />
                  </div>
                  <div className="text-right">
                    <div
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: ratingColor(Number(form.rating)) + "20", color: ratingColor(Number(form.rating)) }}
                    >
                      WC26
                    </div>
                  </div>
                </div>

                {/* Player avatar placeholder */}
                <div className="flex justify-center my-3">
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
                    style={{ background: `radial-gradient(circle at 40% 30%, ${ratingColor(Number(form.rating))}30, transparent)`, border: `1px solid ${ratingColor(Number(form.rating))}30` }}
                  >
                    &#128100;
                  </div>
                </div>
              </div>

              {/* Name & number */}
              <div className="px-4 pb-2 text-center">
                <div className="text-xl font-black text-white tracking-wider truncate">{form.name || "FAN"}</div>
                <div className="text-xs text-white/40 mt-0.5">{form.team}</div>
              </div>

              {/* Divider */}
              <div className="mx-4 h-px" style={{ background: `${ratingColor(Number(form.rating))}30` }} />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-0 px-4 py-3">
                {statAttributes.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-base font-black text-white">{s.value}</div>
                    <div className="text-[9px] font-bold text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 pb-3 flex items-center justify-between">
                <div className="text-[8px] text-white/20 font-bold uppercase tracking-widest">BallMtaani Fan Card</div>
                <div
                  className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                  style={{ background: ratingColor(Number(form.rating)) + "30", color: ratingColor(Number(form.rating)) }}
                >
                  #{form.number}
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-white/30 text-center">Screenshot to share your card!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subcomponent: Champion Predictor ────────────────────────
function PredictChampionFeature({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ verdict: string; chance: number; route: string; danger: string } | null>(null);

  const POPULAR = ["Morocco", "Brazil", "France", "England", "Germany", "Argentina", "Spain", "Portugal", "USA", "Nigeria", "Senegal", "South Africa"];

  const analyze = async (team: string) => {
    setSelected(team);
    setLoading(true);
    setAnalysis(null);
    try {
      const prompt = `You are Mchambuzi. A fan has predicted ${team} will win WC26. Give an honest African football analyst take.

Respond in EXACTLY this JSON (no markdown):
{"verdict":"one punchy sentence about this pick","chance":5-75,"route":"likely path to final in 15 words","danger":"biggest threat to ${team} at WC26 in 10 words"}

chance = realistic % chance of winning (max 75 for any team since it's unpredictable). Be honest but engaging.`;

      const raw = await askMchambuzi(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("format");
      setAnalysis(JSON.parse(match[0]));
    } catch {
      setAnalysis({ verdict: "Bold pick! Football is unpredictable.", chance: 15, route: "Group stage - Knockouts - Final", danger: "Injuries and early exits" });
    } finally {
      setLoading(false);
    }
  };

  const chanceColor = (c: number) => c >= 50 ? "#22c55e" : c >= 30 ? "#f59e0b" : c >= 15 ? "#60a5fa" : "#ef4444";

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
        <span>&#8592;</span> Back to Fan Zone
      </button>

      <div className="max-w-lg mx-auto">
        <div className="text-5xl mb-4 text-center">&#127942;</div>
        <h1 className="text-2xl font-black text-center text-white mb-2">Predict the Champion</h1>
        <p className="text-white/50 text-center text-sm mb-8">Pick your winner. Mchambuzi gives you an honest reality check.</p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {POPULAR.map((team) => {
            const td = WC26_TEAMS.find((t) => t.name === team);
            return (
              <button
                key={team}
                onClick={() => analyze(team)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  selected === team ? "border-[#B30000] bg-[#B30000]/20" : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                {td && <img src={td.logo} alt={team} className="w-8 h-8 object-contain" />}
                <span className="text-xs text-white font-semibold text-center leading-tight">{team}</span>
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#B30000] rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Mchambuzi is analyzing {selected}...</p>
          </div>
        )}

        {analysis && !loading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              {WC26_TEAMS.find(t => t.name === selected) && (
                <img src={WC26_TEAMS.find(t => t.name === selected)!.logo} alt={selected!} className="w-10 h-10" />
              )}
              <div>
                <div className="text-white font-bold">{selected}</div>
                <div className="text-xs text-white/40">WC26 Champion Prediction</div>
              </div>
            </div>

            {/* Win chance */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40">Mchambuzi Win Probability</span>
                <span className="font-bold" style={{ color: chanceColor(analysis.chance) }}>{analysis.chance}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.chance}%`, background: chanceColor(analysis.chance) }}
                />
              </div>
            </div>

            <blockquote className="text-white/80 text-sm italic border-l-2 border-[#B30000] pl-3">
              "{analysis.verdict}"
            </blockquote>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Likely Route</div>
                <div className="text-xs text-white">{analysis.route}</div>
              </div>
              <div className="bg-[#ef4444]/10 rounded-xl p-3">
                <div className="text-[10px] text-[#ef4444]/60 uppercase tracking-widest mb-1">Biggest Danger</div>
                <div className="text-xs text-white">{analysis.danger}</div>
              </div>
            </div>

            <p className="text-xs text-white/20 text-right">— Mchambuzi, WC26 Analyst</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hub: Feature selector ───────────────────────────────────
const FEATURES = [
  {
    id: "quiz" as Feature,
    icon: "&#129504;",
    title: "Football IQ Test",
    subtitle: "Test your WC26 knowledge",
    desc: "5 AI-generated questions. Mchambuzi is the quizmaster. Think you know football?",
    color: "#3b82f6",
    badge: "AI Quiz",
  },
  {
    id: "genius" as Feature,
    icon: "&#128161;",
    title: "Genius or Delulu?",
    subtitle: "Rate my take",
    desc: "Drop your hottest WC26 take. Mchambuzi will tell you if you're a football genius or just delulu.",
    color: "#f59e0b",
    badge: "AI Roast",
  },
  {
    id: "fancard" as Feature,
    icon: "&#127951;",
    title: "My WC26 Player Card",
    subtitle: "Create your fan card",
    desc: "Generate your own FIFA-style WC26 card with your team, position and rating. Screenshot and share.",
    color: "#FFD700",
    badge: "Fan Card",
  },
  {
    id: "predict" as Feature,
    icon: "&#127942;",
    title: "Predict the Champion",
    subtitle: "Reality check your pick",
    desc: "Pick your WC26 winner and get an honest Mchambuzi probability analysis. Can your team really do it?",
    color: "#22c55e",
    badge: "AI Prediction",
  },
];

// ─── Main Page ───────────────────────────────────────────────
export default function AIFanZonePage() {
  const [active, setActive] = useState<Feature>("hub");

  const goBack = useCallback(() => setActive("hub"), []);

  if (active === "quiz") return <QuizFeature onBack={goBack} />;
  if (active === "genius") return <GeniusOrDeluluFeature onBack={goBack} />;
  if (active === "fancard") return <FanCardFeature onBack={goBack} />;
  if (active === "predict") return <PredictChampionFeature onBack={goBack} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <SEO
        title="AI Fan Zone - WC26 | BallMtaani"
        description="Test your football IQ, create your WC26 fan card, rate your takes with Mchambuzi AI, and predict the champion."
        path="/ai-fan-zone"
      />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, #B3000018 0%, transparent 70%)",
          }}
        />
        {/* Animated football pitch lines */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 80px)",
        }} />

        <div className="relative px-4 pt-12 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B30000]/20 border border-[#B30000]/30 text-[#B30000] text-xs font-bold uppercase tracking-widest mb-5">
            <span className="w-1.5 h-1.5 bg-[#B30000] rounded-full animate-pulse" />
            Powered by Mchambuzi AI
          </div>
          <h1 className="text-3xl font-black text-white mb-3 leading-tight">
            Make Every Moment<br />
            <span className="text-[#B30000]">More Fun</span>
          </h1>
          <p className="text-white/50 text-sm max-w-xs mx-auto">
            WC26 AI tools built for African fans. Quiz yourself, rate takes, build your card.
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="px-4 pb-20 max-w-lg mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {FEATURES.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className="w-full text-left rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 active:scale-[0.98] transition-all group"
            >
              <div className="flex gap-4 p-5">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform"
                  style={{ background: f.color + "18", border: `1px solid ${f.color}30` }}
                  dangerouslySetInnerHTML={{ __html: f.icon }}
                />
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-base">{f.title}</h3>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: f.color + "25", color: f.color }}
                    >
                      {f.badge}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                </div>
                {/* Arrow */}
                <div className="flex-shrink-0 flex items-center text-white/20 group-hover:text-white/60 transition-colors">
                  <span className="text-xl">&#8250;</span>
                </div>
              </div>
              {/* Bottom accent */}
              <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: f.color }} />
            </button>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/3 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-white/20 font-bold">Coming Soon</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "&#128049;", label: "Pet Fan Edition", sub: "Your pet supports a team" },
              { icon: "&#128247;", label: "Fan Moment", sub: "AI puts you in the crowd" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 opacity-40">
                <span className="text-2xl" dangerouslySetInnerHTML={{ __html: item.icon }} />
                <div>
                  <div className="text-xs text-white font-semibold">{item.label}</div>
                  <div className="text-[10px] text-white/40">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
