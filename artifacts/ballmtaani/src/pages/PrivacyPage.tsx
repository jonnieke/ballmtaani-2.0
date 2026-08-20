import { Link } from "wouter";
import SEO from "../components/SEO";

const sections = [
  {
    title: "Information We Collect & Use",
    body: "We may collect and use your phone number for secure authentication, your chosen favorite club for personalization, and your platform activity (such as predictions, votes, debates, room posts, invites, and MTC status wallet activity) to deliver the BallMtaani experience.",
  },
  {
    title: "Why We Use Your Data",
    body: "We use this information to maintain account security, display relevant fan rooms, keep match prediction receipts, power global and local leaderboards, prevent spam or abuse, and continuously improve platform performance.",
  },
  {
    title: "Public Fan Activity",
    body: "Certain community activities are visible to other fans, including your chosen username, club avatar badge, public posts, aggregate votes, fan duel challenges, leaderboard rank, and room interactions.",
  },
  {
    title: "Advertising & Sponsorship",
    body: "BallMtaani may occasionally run clearly labeled direct sponsorships or partner placements on selected editorial pages. If Google AdSense is enabled, ad units will be limited to substantial editorial pages and will stay clearly separated from logins, predictions, games, rewards, live-score utilities and account screens. We do not use hidden or unlabeled ad units.",
  },
  {
    title: "Cookies & Web Storage",
    body: "We use cookies, local storage, and session storage to remember your authentication session, preserve your preferred theme atmosphere, and analyze overall site traffic. Third-party services such as Google Analytics and, when enabled, Google advertising technologies may also set cookies to measure traffic, ad delivery and site performance.",
  },
  {
    title: "Google Analytics 4",
    body: "Google Analytics and Google advertising scripts are not loaded until the required consent architecture is active. If these services are enabled, BallMtaani will use a Google-certified consent management platform where required and will respect the visitor's choices before setting advertising or analytics cookies. Learn how Google uses partner-site data at https://policies.google.com/technologies/partner-sites.",
  },
  {
    title: "Your Choices & Data Rights",
    body: "You can control cookie preferences in your web browser settings, choose what public club profile details to display, and contact our team at info@ballmtaani.com for account, privacy, or data removal enquiries.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <SEO
        title="Privacy Policy | BallMtaani"
        description="BallMtaani privacy basics for phone login, fan activity, personalization, sponsorships, and public community content."
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
            This policy explains the information BallMtaani uses to run phone login, fan rooms, calls, receipts, sponsorships, and community features.
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
          Last updated: August 11, 2026.
        </p>
      </div>
    </main>
  );
}
