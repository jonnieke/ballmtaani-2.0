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
    title: "Google AdSense & Third-Party Advertising (Mandatory Disclosure)",
    body: "BallMtaani uses Google AdSense and third-party advertising vendors to display advertisements when you visit our website. These third-party vendors, including Google, use cookies (such as the DART cookie) to serve ads based on your prior visits to BallMtaani or other websites on the Internet. Google's use of advertising cookies enables it and its partners to serve personalized ads based on your visits to our site and/or other sites. You may opt out of personalized advertising by visiting Google Ad Settings (https://www.google.com/settings/ads) or Network Advertising Initiative / AboutAds (https://www.aboutads.info).",
  },
  {
    title: "Cookies & Web Storage",
    body: "We use cookies, local storage, and session storage to remember your authentication session, preserve your preferred theme atmosphere, and analyze overall site traffic. Third-party partners (such as Google Analytics and Google AdSense) may also set cookies to measure traffic and ad performance.",
  },
  {
    title: "Google Analytics 4",
    body: "BallMtaani utilizes Google Analytics 4 to understand website traffic, user interaction patterns, and device breakdown. Google Analytics processes anonymized data according to Google's Privacy Policy. You can learn more about how Google uses data when you use our site at https://policies.google.com/technologies/partner-sites.",
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
