import { Link } from "wouter";
import SEO from "../components/SEO";

const sections = [
  {
    title: "1. Information We Collect & Use",
    body: "We may collect and use your phone number for secure authentication, your chosen favorite club for personalization, and your platform activity (such as predictions, votes, debates, room posts, invites, and MTC status wallet activity) to deliver the BallMtaani experience.",
  },
  {
    title: "2. Why We Use Your Data",
    body: "We use this information to maintain account security, display relevant fan rooms, keep match prediction receipts, power global and local leaderboards, prevent spam or abuse, and continuously improve platform performance.",
  },
  {
    title: "3. Google AdSense & Third-Party Advertising Disclosures",
    body: "BallMtaani partners with Google AdSense and third-party advertising networks to serve advertisements on our editorial articles. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites across the internet. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to BallMtaani and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ads Settings (https://www.google.com/settings/ads) or through the Digital Advertising Alliance Consumer Choice page at https://www.aboutads.info/choices/.",
  },
  {
    title: "4. Cookies, Web Beacons & Storage",
    body: "We use cookies, web beacons, local storage, and session storage to remember your authentication session, preserve your preferred interface atmosphere, and analyze overall site traffic. Third-party advertisers may place and read cookies on your browser or use web beacons to collect information in the course of ads being served on BallMtaani. You can configure your browser to reject cookies or notify you when a cookie is sent.",
  },
  {
    title: "5. Analytics (Google Analytics 4)",
    body: "We use Google Analytics 4 to understand website traffic, user engagement, and reader preferences. Google Analytics collects information anonymously and reports website trends without identifying individual visitors. To learn more about how Google uses data when you visit our partner sites, please visit https://policies.google.com/technologies/partner-sites.",
  },
  {
    title: "6. Editorial Separation & Ad Placement Standards",
    body: "BallMtaani maintains strict editorial independence. Advertisements and sponsored placements are clearly labeled and strictly separated from editorial judgment, news reporting, and analysis. In accordance with Google Publisher Policies, advertisements are limited to long-form editorial reading pages and are never placed on login dialogs, match prediction tools, scoreboard utility widgets, or interactive games.",
  },
  {
    title: "7. Your Data Rights & Contact",
    body: "You can control cookie preferences in your browser settings, request access to your data, or request account deletion at any time by emailing our privacy officer at privacy@ballmtaani.com or info@ballmtaani.com.",
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
