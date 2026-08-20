import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  BellRing,
  Check,
  Clock3,
  Loader2,
  Mail,
  Newspaper,
  Radio,
  Save,
  ShieldCheck,
  Smartphone,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import SEO from "../components/SEO";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../context/AuthContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { supabase } from "../lib/supabase";

type Preferences = {
  push_enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  breaking_news: boolean;
  kickoff_reminders: boolean;
  lineup_alerts: boolean;
  goal_alerts: boolean;
  red_card_alerts: boolean;
  full_time_results: boolean;
  prediction_results: boolean;
  daily_digest: boolean;
  evening_digest: boolean;
  all_major_matches: boolean;
  quiet_hours_enabled: boolean;
  quiet_start: string;
  quiet_end: string;
  timezone: string;
};

const DEFAULTS: Preferences = {
  push_enabled: false,
  email_enabled: false,
  whatsapp_enabled: false,
  breaking_news: true,
  kickoff_reminders: true,
  lineup_alerts: true,
  goal_alerts: false,
  red_card_alerts: true,
  full_time_results: true,
  prediction_results: true,
  daily_digest: true,
  evening_digest: true,
  all_major_matches: false,
  quiet_hours_enabled: true,
  quiet_start: "23:00",
  quiet_end: "06:30",
  timezone: "Africa/Nairobi",
};

const LEAGUES = [
  { id: "39", name: "Premier League" },
  { id: "2", name: "Champions League" },
  { id: "3", name: "Europa League" },
  { id: "140", name: "La Liga" },
  { id: "135", name: "Serie A" },
  { id: "78", name: "Bundesliga" },
  { id: "61", name: "Ligue 1" },
  { id: "12", name: "CAF competitions" },
];

const TEAMS = [
  "Harambee Stars",
  "Gor Mahia",
  "AFC Leopards",
  "Arsenal",
  "Manchester United",
  "Chelsea",
  "Liverpool",
  "Manchester City",
  "Barcelona",
  "Real Madrid",
].map(name => ({ id: name.toLowerCase(), name }));

function PreferenceRow({ title, body, checked, onChange, disabled = false }: { title: string; body: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex min-h-[68px] items-center gap-4 border-b border-white/[0.055] py-3 last:border-0">
      <div className="min-w-0 flex-1"><p className="text-sm font-bold text-white">{title}</p><p className="mt-1 text-[11px] leading-4 text-white/38">{body}</p></div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={title} className="data-[state=checked]:bg-[#F7B500]" />
    </div>
  );
}

export default function NotificationsPage() {
  const { user, authLoading } = useAuth();
  const { isSupported, isSubscribed, isLoading: pushLoading, pushError, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS);
  const [leagueIds, setLeagueIds] = useState<string[]>([]);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pageError, setPageError] = useState("");
  const [email, setEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const initialPreferences = useRef<Preferences>(DEFAULTS);

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user?.email]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    Promise.all([
      supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("notification_follows").select("entity_type,entity_id").eq("user_id", user.id),
    ]).then(([prefResult, followResult]) => {
      if (cancelled) return;
      const next = prefResult.data ? { ...DEFAULTS, ...prefResult.data, push_enabled: isSubscribed } : { ...DEFAULTS, push_enabled: isSubscribed };
      setPreferences(next);
      initialPreferences.current = next;
      setLeagueIds((followResult.data || []).filter((row: any) => row.entity_type === "league").map((row: any) => row.entity_id));
      setTeamIds((followResult.data || []).filter((row: any) => row.entity_type === "team").map((row: any) => row.entity_id));
      if (prefResult.error && prefResult.error.code !== "PGRST116") setPageError("Notification preferences are not available yet. Apply the database migration and reload.");
    }).catch(() => setPageError("Could not load your alert settings."))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authLoading, user?.id, isSubscribed]);

  const selectedCount = leagueIds.length + teamIds.length;
  const hasLiveAlerts = preferences.kickoff_reminders || preferences.lineup_alerts || preferences.goal_alerts || preferences.red_card_alerts || preferences.full_time_results;
  const channelSummary = useMemo(() => [isSubscribed ? "Web push" : null, preferences.email_enabled ? "Email" : null].filter(Boolean).join(" + ") || "No active channel", [isSubscribed, preferences.email_enabled]);

  const setPreference = (key: keyof Preferences, value: boolean | string) => setPreferences(current => ({ ...current, [key]: value }));
  const toggleSelection = (id: string, values: string[], setter: (next: string[]) => void) => setter(values.includes(id) ? values.filter(value => value !== id) : [...values, id]);

  const togglePush = async (enabled: boolean) => {
    setPageError("");
    const ok = enabled ? await subscribeToPush() : await unsubscribeFromPush();
    if (ok) setPreferences(current => ({ ...current, push_enabled: enabled }));
  };

  const savePreferences = async () => {
    if (!user) return;
    setSaving(true); setSaved(false); setPageError("");
    const payload = { ...preferences, push_enabled: isSubscribed, user_id: user.id, updated_at: new Date().toISOString() };
    const follows = [
      ...leagueIds.map(id => ({ user_id: user.id, entity_type: "league", entity_id: id, entity_name: LEAGUES.find(item => item.id === id)?.name || id })),
      ...teamIds.map(id => ({ user_id: user.id, entity_type: "team", entity_id: id, entity_name: TEAMS.find(item => item.id === id)?.name || id })),
    ];
    try {
      const { error: preferenceError } = await supabase.from("notification_preferences").upsert(payload, { onConflict: "user_id" });
      if (preferenceError) throw preferenceError;
      const { error: deleteError } = await supabase.from("notification_follows").delete().eq("user_id", user.id);
      if (deleteError) throw deleteError;
      if (follows.length) {
        const { error: followsError } = await supabase.from("notification_follows").insert(follows);
        if (followsError) throw followsError;
      }
      if (initialPreferences.current.email_enabled !== preferences.email_enabled) {
        await supabase.from("notification_consent_events").insert({ user_id: user.id, channel: "email", action: preferences.email_enabled ? "granted" : "withdrawn", purpose: "football_news_and_match_alerts", source: "notifications_page", metadata: { timezone: preferences.timezone } });
      }
      initialPreferences.current = { ...preferences, push_enabled: isSubscribed };
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      setPageError(error?.message || "Could not save your notification settings.");
    } finally {
      setSaving(false);
    }
  };

  const subscribeNewsletter = async () => {
    setNewsletterStatus("");
    if (!email || !newsletterConsent) { setNewsletterStatus("Enter your email and confirm consent first."); return; }
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch("/api/newsletter-subscribe", { method: "POST", headers: { "Content-Type": "application/json", ...(session.data.session?.access_token ? { Authorization: `Bearer ${session.data.session.access_token}` } : {}) }, body: JSON.stringify({ email, morningDigest: true, eveningDigest: preferences.evening_digest, breakingNews: false, source: "notifications_page" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Subscription failed");
      setNewsletterStatus("Subscription saved. Email delivery begins when the Mtaa briefing schedule launches.");
      setPreference("email_enabled", true);
    } catch (error: any) {
      setNewsletterStatus(error?.message || "Could not subscribe right now.");
    }
  };

  return (
    <main className="min-h-screen bg-[#060a0d] text-white">
      <SEO title="Football Alerts & Newsletter | BallMtaani" description="Choose live match alerts, breaking football news and BallMtaani email briefings in East Africa Time." path="/notifications" />
      <section className="border-b border-white/8 bg-[#091016]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#F7B500]">Kenya-first matchday signal</p>
              <h1 className="mt-2 text-3xl font-black uppercase md:text-4xl">Alerts that land at the right moment</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">Follow the football that matters to you with East Africa Time, low-noise delivery, and opt-in channels built for the Kenyan fan rhythm.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">EAT-first</span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">Low-data</span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">Opt-in only</span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">No spam</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/8 bg-white/8">
              <div className="bg-[#0b1116] px-4 py-3">
                <p className="text-[9px] uppercase tracking-wider text-white/28">Channels</p>
                <p className="mt-1 text-xs font-black text-white">{channelSummary}</p>
              </div>
              <div className="bg-[#0b1116] px-4 py-3">
                <p className="text-[9px] uppercase tracking-wider text-white/28">Following</p>
                <p className="mt-1 text-xs font-black text-white">{selectedCount} topics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-7 md:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div className="space-y-6">
          {!user && !authLoading ? (
            <section className="rounded-lg border border-[#F7B500]/25 bg-[#0b1116] p-6">
              <BellRing className="h-7 w-7 text-[#F7B500]" />
              <h2 className="mt-4 text-xl font-black uppercase">Sign in for personal match alerts</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">Your teams, competitions and quiet hours sync securely across devices. Start with push and email, then layer on future WhatsApp delivery when you want it.</p>
              <Link href="/login" className="mt-5 inline-flex h-11 items-center rounded-md bg-[#F7B500] px-5 text-xs font-black uppercase tracking-wider text-black">Sign in to customise</Link>
            </section>
          ) : loading ? (
            <div className="grid min-h-[260px] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#F7B500]" /></div>
          ) : (
            <>
              <section className="rounded-lg border border-white/8 bg-[#0b1116] p-5" aria-labelledby="channels-heading">
                <div className="flex items-center gap-3 border-b border-white/8 pb-4"><Smartphone className="h-5 w-5 text-[#F7B500]" /><div><h2 id="channels-heading" className="text-sm font-black uppercase tracking-wider">Delivery channels</h2><p className="mt-1 text-[10px] text-white/35">Every channel is separately controlled.</p></div></div>
                <PreferenceRow title="Browser push" body={isSupported ? "Fast alerts on this device, including when Ball Mtaani is closed." : "Push is not supported by this browser."} checked={isSubscribed} onChange={togglePush} disabled={!isSupported || pushLoading} />
                <PreferenceRow title="Email briefings" body="Morning football briefing and matchday schedule at your chosen cadence." checked={preferences.email_enabled} onChange={value => setPreference("email_enabled", value)} />
                <div className="flex min-h-[68px] items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">WhatsApp alerts</p>
                      <span className="rounded bg-[#F7B500]/12 px-2 py-0.5 text-[8px] font-black uppercase text-[#F7B500]">Next release</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/38">Reserved for high-value, explicitly opted-in Kenyan match alerts.</p>
                  </div>
                  <Switch checked={false} disabled aria-label="WhatsApp alerts coming next" />
                </div>
              </section>

              <section className="rounded-lg border border-white/8 bg-[#0b1116] p-5" aria-labelledby="events-heading">
                <div className="flex items-center gap-3 border-b border-white/8 pb-4"><Radio className="h-5 w-5 text-[#F7B500]" /><div><h2 id="events-heading" className="text-sm font-black uppercase tracking-wider">What reaches you</h2><p className="mt-1 text-[10px] text-white/35">Goal alerts start off to protect your attention.</p></div></div>
                <PreferenceRow title="Breaking football news" body="Editor-approved major stories, transfers and Kenyan football updates." checked={preferences.breaking_news} onChange={value => setPreference("breaking_news", value)} />
                <PreferenceRow title="Kickoff reminders" body="One reminder shortly before followed matches begin." checked={preferences.kickoff_reminders} onChange={value => setPreference("kickoff_reminders", value)} />
                <PreferenceRow title="Confirmed lineups" body="Starting elevens when the verified match feed publishes them." checked={preferences.lineup_alerts} onChange={value => setPreference("lineup_alerts", value)} />
                <PreferenceRow title="Goals" body="Every score change for matches and teams you follow." checked={preferences.goal_alerts} onChange={value => setPreference("goal_alerts", value)} />
                <PreferenceRow title="Red cards" body="Major match-changing disciplinary events." checked={preferences.red_card_alerts} onChange={value => setPreference("red_card_alerts", value)} />
                <PreferenceRow title="Full-time results" body="Final score and a direct route to the match report and receipts." checked={preferences.full_time_results} onChange={value => setPreference("full_time_results", value)} />
                <PreferenceRow title="Prediction receipts" body="Your result, MTC reward and receipt after settlement." checked={preferences.prediction_results} onChange={value => setPreference("prediction_results", value)} />
              </section>

              <section className="rounded-lg border border-white/8 bg-[#0b1116] p-5" aria-labelledby="follow-heading">
                <div className="flex items-center gap-3 border-b border-white/8 pb-4"><Trophy className="h-5 w-5 text-[#F7B500]" /><div><h2 id="follow-heading" className="text-sm font-black uppercase tracking-wider">Your football</h2><p className="mt-1 text-[10px] text-white/35">Live alerts only fire for these selections unless All major matches is enabled.</p></div></div>
                <PreferenceRow title="All major matches" body="Receive selected event types across every supported major competition." checked={preferences.all_major_matches} onChange={value => setPreference("all_major_matches", value)} />
                <p className="mt-4 text-[9px] font-black uppercase tracking-[0.16em] text-white/30">Competitions</p><div className="mt-2 flex flex-wrap gap-2">{LEAGUES.map(item => <button key={item.id} onClick={() => toggleSelection(item.id, leagueIds, setLeagueIds)} className={`h-9 rounded-md border px-3 text-[10px] font-black transition ${leagueIds.includes(item.id) ? "border-[#F7B500]/55 bg-[#F7B500]/12 text-[#F7B500]" : "border-white/9 bg-white/[0.02] text-white/45 hover:text-white"}`}>{item.name}</button>)}</div>
                <p className="mt-5 text-[9px] font-black uppercase tracking-[0.16em] text-white/30">Teams</p><div className="mt-2 flex flex-wrap gap-2">{TEAMS.map(item => <button key={item.id} onClick={() => toggleSelection(item.id, teamIds, setTeamIds)} className={`h-9 rounded-md border px-3 text-[10px] font-black transition ${teamIds.includes(item.id) ? "border-[#F7B500]/55 bg-[#F7B500]/12 text-[#F7B500]" : "border-white/9 bg-white/[0.02] text-white/45 hover:text-white"}`}>{item.name}</button>)}</div>
                {!preferences.all_major_matches && hasLiveAlerts && selectedCount === 0 && <p className="mt-4 rounded-md border border-[#F7B500]/20 bg-[#F7B500]/7 px-3 py-2 text-[10px] leading-4 text-[#F7B500]">Choose at least one team or competition to receive live match alerts.</p>}
              </section>

              <section className="rounded-lg border border-white/8 bg-[#0b1116] p-5" aria-labelledby="quiet-heading">
                <div className="flex items-center gap-3 border-b border-white/8 pb-4"><Clock3 className="h-5 w-5 text-[#F7B500]" /><div><h2 id="quiet-heading" className="text-sm font-black uppercase tracking-wider">Quiet hours</h2><p className="mt-1 text-[10px] text-white/35">Times are stored in Africa/Nairobi.</p></div></div>
                <PreferenceRow title="Protect quiet hours" body="Hold non-personal alerts overnight. Direct prediction and social receipts still arrive." checked={preferences.quiet_hours_enabled} onChange={value => setPreference("quiet_hours_enabled", value)} />
                {preferences.quiet_hours_enabled && <div className="grid grid-cols-2 gap-3 pt-4"><label className="text-[10px] font-bold uppercase tracking-wider text-white/35">From<input type="time" value={preferences.quiet_start.slice(0,5)} onChange={event => setPreference("quiet_start", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-white/9 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#F7B500]/45" /></label><label className="text-[10px] font-bold uppercase tracking-wider text-white/35">Until<input type="time" value={preferences.quiet_end.slice(0,5)} onChange={event => setPreference("quiet_end", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-white/9 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#F7B500]/45" /></label></div>}
              </section>

              {(pageError || pushError) && <p className="rounded-md border border-red-500/25 bg-red-500/8 px-4 py-3 text-xs text-red-300">{pageError || pushError}</p>}
              <button onClick={savePreferences} disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#F7B500] text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#FFC928] disabled:opacity-55">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saved ? "Preferences saved" : "Save alert settings"}</button>
            </>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-[#F7B500]/22 bg-[#0b1116] p-5">
            <Mail className="h-6 w-6 text-[#F7B500]" />
            <h2 className="mt-4 text-lg font-black uppercase">Mtaa Morning Brief</h2>
            <p className="mt-2 text-xs leading-5 text-white/42">The latest football fire, Kenyan stories, table movement and tonight&apos;s fixtures in one compact email.</p>
            <div className="mt-4 rounded-md border border-white/8 bg-white/[0.03] px-3 py-3 text-[10px] uppercase tracking-[0.18em] text-white/45">
              <div className="flex items-center justify-between">
                <span>What you get</span>
                <span>Kenya-friendly</span>
              </div>
              <div className="mt-3 space-y-2 text-[11px] leading-4 text-white/55">
                <p>• Morning briefing at 7:00 AM EAT</p>
                <p>• Matchday notes, verified news and tables</p>
                <p>• A clean path to push, then WhatsApp later</p>
              </div>
            </div>
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="mt-4 h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#F7B500]/45" />
            <label className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-white/42"><input type="checkbox" checked={newsletterConsent} onChange={event => setNewsletterConsent(event.target.checked)} className="mt-0.5 accent-[#F7B500]" />I agree to receive Ball Mtaani football news and match briefings by email. I can unsubscribe at any time.</label>
            <button onClick={subscribeNewsletter} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#F7B500] text-[10px] font-black uppercase tracking-wider text-[#F7B500] transition hover:bg-[#F7B500] hover:text-black"><Newspaper className="h-4 w-4" />Join the briefing</button>
            {newsletterStatus && <p className="mt-3 text-[10px] leading-4 text-white/48">{newsletterStatus}</p>}
          </section>
          <section className="rounded-lg border border-white/8 bg-[#0b1116] p-5"><ShieldCheck className="h-5 w-5 text-[#F7B500]" /><h2 className="mt-3 text-sm font-black uppercase">Your consent stays visible</h2><p className="mt-2 text-[11px] leading-5 text-white/38">Every channel records when consent was granted or withdrawn. Ball Mtaani does not enable sponsored alerts inside your football preferences.</p><Link href="/privacy" className="mt-3 inline-flex text-[10px] font-black uppercase tracking-wider text-[#F7B500]">Privacy policy</Link></section>
          <section className="rounded-lg border border-white/8 bg-[#0b1116] p-5"><Target className="h-5 w-5 text-[#F7B500]" /><h2 className="mt-3 text-sm font-black uppercase">Best setup</h2><div className="mt-3 space-y-3 text-[11px] text-white/42"><p className="flex gap-2"><Users className="h-4 w-4 shrink-0 text-[#F7B500]" />Follow your club and one competition.</p><p className="flex gap-2"><BellRing className="h-4 w-4 shrink-0 text-[#F7B500]" />Enable kickoff, lineups and full-time first.</p><p className="flex gap-2"><Clock3 className="h-4 w-4 shrink-0 text-[#F7B500]" />Keep quiet hours on to avoid alert fatigue.</p></div></section>
        </aside>
      </div>
    </main>
  );
}
