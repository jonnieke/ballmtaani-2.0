import { Link } from "wouter";
import SEO from "../components/SEO";

const sections = [
  {
    title: "Information We Use",
    body: "We may use your phone number for login, your selected club for personalization, and your activity such as calls, votes, debates, room posts, invites, and wallet activity to run the app.",
  },
  {
    title: "Why We Use It",
    body: "We use this information to protect accounts, show relevant fan rooms, keep receipts, power leaderboards, reduce spam, and improve the BallMtaani experience.",
  },
  {
    title: "Public Activity",
    body: "Some activity is visible to other fans, including usernames, posts, votes in aggregate, fan duel status, leaderboard placement, and room participation.",
  },
  {
    title: "Third-Party Services",
    body: "BallMtaani may use third-party services for authentication, analytics, hosting, football data, news feeds, and advertising. Those services may process data according to their own policies.",
  },
  {
    title: "Advertising",
    body: "BallMtaani uses advertising to keep the service free. We avoid misleading, betting-adjacent, or unsafe ad experiences. Advertising density is kept moderate and never placed around interactive fan features.",
  },
  {
    title: "Your Choices",
    body: "You can avoid posting personal information in public rooms, choose what club identity you show, and request account or data help through the support channel once available.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <SEO
        title="Privacy Policy | BallMtaani"
        description="BallMtaani privacy basics for phone login, fan activity, personalization, ads, and public community content."
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
          <h1 className="mt-4 text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Privacy Policy</h1>
          <p className="mt-4 text-gray-400 leading-relaxed">
            This policy explains the information BallMtaani uses to run phone login, fan rooms, calls, receipts, and community features.
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
          Last updated: May 29, 2026.
        </p>
      </div>
    </main>
  );
}
