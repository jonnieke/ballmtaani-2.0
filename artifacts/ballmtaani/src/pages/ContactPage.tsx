import { useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";
import { Mail, Briefcase, CheckCircle2 } from "lucide-react";

const TOPICS = [
  { value: "general", label: "General enquiry" },
  { value: "editorial", label: "Editorial / content" },
  { value: "sponsorship", label: "Sponsorship & advertising" },
  { value: "bug", label: "Bug report" },
  { value: "account", label: "Account help" },
  { value: "press", label: "Press & media" },
];

const CHANNELS = [
  { icon: Mail, label: "Editorial Desk", value: "editor@ballmtaani.com", href: "mailto:editor@ballmtaani.com", desc: "News tips, editorial pitches & article feedback" },
  { icon: Mail, label: "General & Support", value: "info@ballmtaani.com", href: "mailto:info@ballmtaani.com", desc: "General enquiries, account and privacy requests" },
  { icon: Briefcase, label: "Sponsorship & Ads", value: "sponsors@ballmtaani.com", href: "mailto:sponsors@ballmtaani.com", desc: "Commercial partnerships & direct sponsorships" },
];

export default function ContactPage() {
  const [topic, setTopic] = useState("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setError(null);

    try {
      if (supabase) {
        await supabase.from("contact_messages").insert({
          name: name.trim(),
          email: email.trim(),
          topic,
          message: message.trim(),
        });
      }
      setDone(true);
    } catch {
      setError("Something went wrong - please email us directly at info@ballmtaani.com");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] pb-24">
      <SEO
        title="Contact BallMtaani | Get In Touch"
        description="Contact BallMtaani for editorial enquiries, sponsorship and advertising, bug reports, press requests or general questions. Email info@ballmtaani.com or use our contact form."
        keywords={["contact BallMtaani", "BallMtaani email", "BallMtaani sponsorship", "Kenya football contact"]}
        path="/contact"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "Contact", url: "/contact" }]}
      />

      <div className="border-b border-white/8 bg-[#07060a]">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-2 text-3xl font-black text-white md:text-4xl">Get In Touch</h1>
          <p className="text-sm leading-relaxed text-white/45">Questions, partnerships, press or feedback - we read everything.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {done ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-500/20 bg-green-500/8 py-16 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
                <h2 className="text-lg font-black text-white">Message received</h2>
                <p className="max-w-xs text-sm text-white/50">We'll get back to you at {email} within 1-2 working days.</p>
                <Link href="/" className="mt-2 text-xs font-black uppercase tracking-widest text-[#B30000] hover:underline">Back to BallMtaani</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Topic</label>
                  <select
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d1018] px-4 py-3 text-sm font-semibold text-white focus:border-white/25 focus:outline-none"
                  >
                    {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full rounded-xl border border-white/10 bg-[#0d1018] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white/25 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-[#0d1018] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white/25 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={6}
                    placeholder="Tell us what's on your mind..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#0d1018] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white/25 focus:outline-none"
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={sending || !name.trim() || !email.trim() || !message.trim()}
                  className="w-full rounded-xl bg-[#B30000] py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition-all hover:bg-[#cc0000] disabled:opacity-40"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Direct Channels</p>
            {CHANNELS.map(ch => (
              <a key={ch.label} href={ch.href} target={ch.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-start gap-3 rounded-xl border border-white/6 bg-[#0d1018] p-4 transition-all hover:border-white/14">
                <ch.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#B30000]" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-white">{ch.label}</p>
                  <p className="mt-0.5 break-all text-[11px] text-white/50">{ch.value}</p>
                  <p className="mt-1 text-[10px] text-white/28">{ch.desc}</p>
                </div>
              </a>
            ))}

            <div className="rounded-xl border border-white/6 bg-[#0d1018] p-4 text-xs leading-relaxed text-white/40">
              <p className="mb-1 font-black uppercase tracking-wide text-white/60">Response time</p>
              We aim to respond to genuine enquiries as soon as possible.
            </div>

            <div className="pt-2 text-[10px] text-white/20">
              <Link href="/about" className="hover:text-white/40">About BallMtaani</Link>
              {" · "}
              <Link href="/privacy" className="hover:text-white/40">Privacy Policy</Link>
              {" · "}
              <Link href="/terms" className="hover:text-white/40">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
