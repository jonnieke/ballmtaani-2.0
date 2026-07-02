import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Gamepad2, Sparkles } from "lucide-react";
import SEO from "../components/SEO";
import SponsorSlot from "../components/SponsorSlot";
import { analytics } from "../lib/analytics";

// ─── Game catalogue — every card links to a live feature ───────────────────────
// Card art generated via Vertex AI — regenerate with: node scripts/gen-funzone-cards.mjs
const GAMES = [
  {
    href: "/trivia",
    img: "/funzone/trivia.jpg",
    emoji: "🧠",
    art: "linear-gradient(135deg, #001147 0%, #0047FF 60%, #00153d 100%)",
    glow: "rgba(0,71,255,0.45)",
    tag: "Quiz",
    title: "Test your football IQ",
    description: "Think you know the game? Climb the prize ladder and find out — every correct answer earns MTC.",
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
  },
];

function GameCard({ game, index }: { game: (typeof GAMES)[number]; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <Link
        href={game.href}
        onClick={() => analytics.gameStarted(game.tag)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0c111a] transition-all duration-200 hover:-translate-y-1 hover:border-white/20"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        {/* Art panel — AI-generated card art, gradient fallback if it fails */}
        <div className="relative flex h-44 items-center justify-center overflow-hidden" style={{ background: game.art }}>
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
              <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 70% at 50% 100%, ${game.glow}, transparent)` }} />
              <span className="relative text-6xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">{game.emoji}</span>
            </>
          )}
          {/* Bottom fade so the card copy reads as one piece */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0c111a] to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
            {game.tag}
          </span>
        </div>

        {/* Copy */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-sm font-black text-white">{game.title}</h3>
          <p className="mt-1.5 flex-1 text-xs leading-relaxed text-white/45">{game.description}</p>
          <span className="mt-4 inline-flex w-fit items-center rounded-lg bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-black transition-all group-hover:bg-[#FFD700] group-active:scale-95">
            Try it now
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

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

      {/* ── SPONSOR SLOT — fun zone ── */}
      <div className="mx-auto max-w-6xl px-4 pb-2 pt-4">
        <SponsorSlot placement="fun-zone-hero" />
      </div>

      {/* ── Game grid ── */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game, i) => <GameCard key={game.href} game={game} index={i} />)}
        </div>
      </section>
    </div>
  );
}
