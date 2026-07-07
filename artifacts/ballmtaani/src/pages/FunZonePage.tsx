import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Gamepad2, Sparkles, ChevronRight } from "lucide-react";
import SEO from "../components/SEO";
import SponsorSlot from "../components/SponsorSlot";
import { analytics } from "../lib/analytics";

// ─── Game catalogue ────────────────────────────────────────────────────────────
type GameDef = {
  href: string;
  img: string;
  emoji: string;
  art: string;
  glow: string;
  tag: string;
  title: string;
  description: string;
  earn: string;
};

const GAMES: GameDef[] = [
  {
    href: "/trivia",
    img: "/funzone/trivia.jpg",
    emoji: "🧠",
    art: "linear-gradient(135deg, #001147 0%, #0047FF 60%, #00153d 100%)",
    glow: "rgba(0,71,255,0.45)",
    tag: "Quiz",
    title: "Test your football IQ",
    description: "Think you know the game? Climb the prize ladder and find out — every correct answer earns MTC. How high can you go?",
    earn: "Earn 10–500 MTC",
  },
  {
    href: "/rapid-fire",
    img: "/funzone/rapid-fire.jpg",
    emoji: "⚡",
    art: "linear-gradient(135deg, #3d0000 0%, #B30000 60%, #1a0000 100%)",
    glow: "rgba(179,0,0,0.45)",
    tag: "Rapid Fire",
    title: "Pick a side. No fence-sitting.",
    description: "Messi or Ronaldo? Trent or Walker? Vote in seconds and see how the streets called it.",
    earn: "Earn 25 MTC",
  },
  {
    href: "/predictions",
    img: "/funzone/predictions.jpg",
    emoji: "🏆",
    art: "linear-gradient(135deg, #2b2300 0%, #b89400 60%, #1f1a00 100%)",
    glow: "rgba(255,215,0,0.35)",
    tag: "Predictions",
    title: "Predict the champion",
    description: "Back your pick for every big match. Correct calls earn MTC — wrong ones earn receipts.",
    earn: "Earn 50–500 MTC",
  },
  {
    href: "/rivalries",
    img: "/funzone/rivalries.jpg",
    emoji: "⚔️",
    art: "linear-gradient(135deg, #001a10 0%, #006600 60%, #001208 100%)",
    glow: "rgba(34,197,94,0.35)",
    tag: "Fan Duels",
    title: "Challenge a rival",
    description: "Settle the debate one-on-one. Winner takes the bragging rights — and keeps the receipt.",
    earn: "Earn 100 MTC",
  },
  {
    href: "/mchambuzi-halisi",
    img: "/funzone/mchambuzi.jpg",
    emoji: "🤖",
    art: "linear-gradient(135deg, #1a0033 0%, #6d28d9 60%, #12001f 100%)",
    glow: "rgba(139,92,246,0.4)",
    tag: "AI Analyst",
    title: "Is your take genius?",
    description: "Drop your boldest take and let Mchambuzi rate it: genius or delusional. No mercy.",
    earn: "Earn 30 MTC",
  },
  {
    href: "/war-room",
    img: "/funzone/war-room.jpg",
    emoji: "🎙️",
    art: "linear-gradient(135deg, #1f1200 0%, #c2410c 60%, #170d00 100%)",
    glow: "rgba(249,115,22,0.4)",
    tag: "War Room",
    title: "Matchday war room",
    description: "Live banter while the game burns. Takes, receipts and full-time told-you-so's.",
    earn: "Earn 50 MTC",
  },
];

const GAME_MAP = Object.fromEntries(GAMES.map(g => [g.href, g]));

// ─── Section groupings ─────────────────────────────────────────────────────────
const SECTIONS: { label: string; icon: string; sub: string; hrefs: string[] }[] = [
  { label: "Test It",   icon: "🧠", sub: "Prove what you know",   hrefs: ["/trivia", "/rapid-fire"] },
  { label: "Call It",   icon: "🏆", sub: "Predictions that pay",  hrefs: ["/predictions", "/war-room"] },
  { label: "Settle It", icon: "⚔️", sub: "Debates, AI-judged",    hrefs: ["/rivalries", "/mchambuzi-halisi"] },
];

// ─── Live activity strip (seeded floor, ticks up slowly) ──────────────────────
function ActivityStrip() {
  const [fans, setFans]   = useState(312);
  const [mtc, setMtc]     = useState(18240);
  const [preds, setPreds] = useState(4107);

  useEffect(() => {
    const id = setInterval(() => {
      setFans(f  => f  + Math.floor(Math.random() * 3));
      setMtc(m   => m  + Math.floor(Math.random() * 55 + 5));
      setPreds(p => Math.random() > 0.6 ? p + 1 : p);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-b border-white/6 bg-[#060a10]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/45">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
          </span>
          <span className="font-black text-white">{fans.toLocaleString()}</span> fans playing now
        </span>
        <span className="text-white/15">·</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">
          <span className="font-black text-[#FFD700]">{mtc.toLocaleString()}</span> MTC earned today
        </span>
        <span className="text-white/15">·</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">
          <span className="font-black text-white">{preds.toLocaleString()}</span> predictions called
        </span>
      </div>
    </div>
  );
}

// ─── Daily challenge strip ─────────────────────────────────────────────────────
const DAILY_CHALLENGE = {
  text: "Call 3 correct WC26 scorelines today",
  reward: "300 bonus MTC",
  href: "/predictions",
};

function DailyChallenge() {
  return (
    <div className="border-b border-[#FFD700]/12 bg-[#FFD700]/5">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <span className="shrink-0 text-xl leading-none">🔥</span>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#FFD700]/60">Today's Challenge</p>
          <p className="truncate text-sm font-black text-white">{DAILY_CHALLENGE.text}</p>
        </div>
        <Link
          href={DAILY_CHALLENGE.href}
          className="shrink-0 flex items-center gap-1 rounded-full bg-[#FFD700] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black transition-opacity hover:opacity-90"
        >
          {DAILY_CHALLENGE.reward}
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Game card ────────────────────────────────────────────────────────────────
function GameCard({
  game,
  index,
  featured = false,
}: {
  game: GameDef;
  index: number;
  featured?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="h-full"
    >
      <Link
        href={game.href}
        onClick={() => analytics.gameStarted(game.tag)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0c111a] transition-all duration-200 hover:-translate-y-1 hover:border-white/20"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        {/* Art panel */}
        <div
          className={`relative flex items-center justify-center overflow-hidden ${featured ? "h-56 sm:h-72" : "h-44"}`}
          style={{ background: game.art }}
        >
          {!imgFailed ? (
            <img
              src={game.img}
              alt={game.title}
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(ellipse 60% 70% at 50% 100%, ${game.glow}, transparent)` }}
              />
              <span className="relative text-6xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">{game.emoji}</span>
            </>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0c111a] to-transparent" />

          {/* Tag — top left */}
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
            {game.tag}
          </span>

          {/* Earn badge — top right */}
          <span className="absolute right-3 top-3 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#FFD700] backdrop-blur-sm">
            {game.earn}
          </span>
        </div>

        {/* Copy */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className={`font-black text-white ${featured ? "text-base sm:text-lg" : "text-sm"}`}>{game.title}</h3>
          <p className={`mt-1.5 flex-1 leading-relaxed text-white/45 ${featured ? "text-xs sm:text-sm" : "text-xs"}`}>
            {game.description}
          </p>
          <span className="mt-4 inline-flex w-fit items-center rounded-lg bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-black transition-all group-hover:bg-[#FFD700] group-active:scale-95">
            Try it now
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="text-2xl leading-none">{icon}</span>
      <div>
        <h2 className="text-lg font-black uppercase tracking-wider text-white">{label}</h2>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{sub}</p>
      </div>
      <div className="ml-2 h-px flex-1 bg-white/8" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FunZonePage() {
  return (
    <div className="min-h-screen bg-[#040508] pb-24">
      <SEO
        title="Fun Zone | BallMtaani Arcade — Quizzes, Duels & Predictions"
        description="Take a break from the table talk: football trivia, rapid-fire debates, fan duels, AI take ratings and match predictions. All free, all earning MTC."
        keywords={["football trivia", "football quiz Kenya", "fan duels", "football predictions game", "BallMtaani arcade"]}
        path="/fun-zone"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "Fun Zone", url: "/fun-zone" }]}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,215,0,0.08),transparent)]" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700]/70 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 text-center md:py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFD700]/25 bg-[#FFD700]/8 px-3 py-1.5">
              <Gamepad2 className="h-3 w-3 text-[#FFD700]" />
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#FFD700]">BallMtaani Arcade</span>
            </div>
            <h1 className="text-3xl font-black leading-tight text-white md:text-5xl">
              Make every matchday <span className="text-[#FFD700]">more fun.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/45">
              Score big between fixtures. Test your football IQ, pick a side in rapid-fire debates,
              duel your rivals and call the matches — every game earns MTC.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/25">
              <Sparkles className="h-3 w-3" /> Free to play · Powered by Mchambuzi AI
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Live activity strip ── */}
      <ActivityStrip />

      {/* ── Daily challenge ── */}
      <DailyChallenge />

      {/* ── Sponsor ── */}
      <div className="mx-auto max-w-6xl px-4 pb-2 pt-5">
        <SponsorSlot placement="fun-zone-hero" />
      </div>

      {/* ── Sectioned game grid ── */}
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        {SECTIONS.map((section) => {
          const games = section.hrefs.map(h => GAME_MAP[h]).filter(Boolean);
          const isTestIt = section.label === "Test It";

          return (
            <section key={section.label}>
              <SectionHeader icon={section.icon} label={section.label} sub={section.sub} />

              {isTestIt ? (
                /* Test It: Trivia spans 2 cols (featured hero), Rapid Fire takes 1 col */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {games.map((game, i) => (
                    <div key={game.href} className={i === 0 ? "sm:col-span-2" : "sm:col-span-1"}>
                      <GameCard game={game} index={i} featured={i === 0} />
                    </div>
                  ))}
                </div>
              ) : (
                /* Call It + Settle It: equal 2-col grid */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {games.map((game, i) => (
                    <GameCard key={game.href} game={game} index={i} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}