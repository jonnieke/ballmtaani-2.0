import { Link } from "wouter";
import SEO from "../components/SEO";

const sections = [
  {
    title: "What BallMtaani Is",
    body: "BallMtaani is a football fan community for match calls, debates, live rooms, trivia, fan duels, and status-based rewards. It is built for Kenyan fans first and can be used by football fans elsewhere.",
  },
  {
    title: "No Betting Or Cash-Out",
    body: "BallMtaani is not a betting, gambling, lottery, or financial product. MTC status points have no monetary value. They cannot be bought, sold, refunded, withdrawn, transferred for money, or converted into cash or mobile money.",
  },
  {
    title: "MTC Status Points",
    body: "MTC status points are engagement rewards used inside BallMtaani for platform perks, cosmetic items, leaderboard status, and fan identity. We may adjust rewards, limits, balances, or perks to keep the platform fair and safe.",
  },
  {
    title: "Community Conduct",
    body: "Keep banter football-focused. Do not harass, threaten, impersonate, spam, post illegal content, or abuse other fans. We may remove content, limit features, or suspend accounts that hurt the community.",
  },
  {
    title: "Content And Accuracy",
    body: "Scores, fixtures, news, rankings, and fan intel may come from third-party data sources or community activity. We try to keep them useful, but they may be delayed, incomplete, or wrong.",
  },
  {
    title: "Accounts",
    body: "You are responsible for activity on your account and for keeping access to your phone secure. We may use phone verification to protect accounts and reduce spam.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <SEO
        title="Terms of Service | BallMtaani"
        description="BallMtaani terms for fan community use, MTC status points, and no-cash-value rewards."
      />

      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-black uppercase tracking-widest">
            Ball<span className="text-primary">Mtaani</span>
          </Link>
          <a href="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white">
            Back to login
          </a>
        </div>

        <div className="mb-10 border-b border-white/10 pb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#FFD700]">Legal</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Terms of Service</h1>
          <p className="mt-4 text-gray-400 leading-relaxed">
            These terms explain the basic rules for using BallMtaani. They are written plainly so fans know what the app is, and what it is not.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="bg-[#111] border border-white/10 p-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#FFD700] mb-3">{section.title}</h2>
              <p className="text-sm text-gray-300 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-600">
          Last updated: August 10, 2026.
        </p>
      </div>
    </main>
  );
}

