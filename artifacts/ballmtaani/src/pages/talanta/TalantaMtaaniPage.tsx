import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AlertCircle, ArrowRight, CheckCircle2, PlusCircle, Search, ShieldCheck, Sparkles, Trophy, Users, X } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import RouteSEO from "../../components/RouteSEO";
import { fetchLocalFootballDesk } from "../../lib/local-football";
import { supabase } from "../../lib/supabase";

type TalentProfile = {
  id: string;
  slug: string;
  player_name: string;
  institution: string;
  position: string;
  county: string;
  image_url: string | null;
  summary: string | null;
  verification_note: string;
  verified_statistics: Record<string, number> | null;
  verified_at: string | null;
};

const POSITIONS = ["Striker", "Winger", "Central Midfielder", "Defensive Midfielder", "Center Back", "Full Back", "Goalkeeper"] as const;
const FIELD_CLASS = "w-full border border-white/10 bg-[#191919] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FFD000]/60";

async function fetchTalentProfiles(): Promise<TalentProfile[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("talent_profiles")
    .select("id,slug,player_name,institution,position,county,image_url,summary,verification_note,verified_statistics,verified_at")
    .eq("profile_status", "verified").order("published_at", { ascending: false });
  if (error) return [];
  return (data || []) as TalentProfile[];
}

export default function TalantaMtaaniPage() {
  const [query, setQuery] = useState("");
  const [showNominate, setShowNominate] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({ playerName: "", institution: "", position: "Striker", county: "", contactPhone: "", evidenceNotes: "", consentConfirmed: false, website: "" });
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({ queryKey: ["verified-talent-profiles"], queryFn: fetchTalentProfiles, staleTime: 10 * 60 * 1000 });
  const { data: localDesk, isLoading: localLoading } = useQuery({ queryKey: ["talanta-local-performance"], queryFn: fetchLocalFootballDesk, staleTime: 5 * 60 * 1000 });

  const normalizedQuery = query.trim().toLowerCase();
  const visibleProfiles = profiles.filter((profile) => !normalizedQuery || [profile.player_name, profile.institution, profile.position, profile.county].some((value) => value.toLowerCase().includes(normalizedQuery)));
  const performancePlayers = (localDesk?.players || []).filter((player) => !normalizedQuery || [player.name, player.team || "", player.competition].some((value) => value.toLowerCase().includes(normalizedQuery)));

  async function submitNomination(event: React.FormEvent) {
    event.preventDefault();
    setSubmitState("submitting");
    setSubmitError("");
    try {
      const response = await fetch("/api/talent-nominations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The nomination could not be recorded.");
      setSubmitState("success");
      setForm({ playerName: "", institution: "", position: "Striker", county: "", contactPhone: "", evidenceNotes: "", consentConfirmed: false, website: "" });
    } catch (error) {
      setSubmitState("error");
      setSubmitError(error instanceof Error ? error.message : "The nomination could not be recorded.");
    }
  }

  return (
    <main className="min-h-screen bg-[#070707] pb-20 text-white">
      <RouteSEO path="/talanta" />
      <header className="border-b border-white/10 bg-[#0d0d0d] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <Badge className="border-[#FFD000]/30 bg-[#FFD000]/10 text-[#FFD000]"><Sparkles className="mr-1 h-3.5 w-3.5" /> Talanta Mtaani</Badge>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-black uppercase leading-tight sm:text-5xl">Find Kenya&apos;s next football stars.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">See the players making noise across school games, grassroots tournaments and FKF competitions. Follow local form, discover new names and keep up with the next matchday.</p>
            </div>
            <Button onClick={() => { setShowNominate(true); setSubmitState("idle"); }} className="bg-[#d8212d] font-black text-white hover:bg-[#bb1823]"><PlusCircle className="mr-2 h-4 w-4" /> Nominate a rising player</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <TrustCard icon={<Trophy className="h-5 w-5" />} title="Matchday form" text="Track goals and assists from published local match records." />
          <TrustCard icon={<ShieldCheck className="h-5 w-5" />} title="Player profiles" text="Explore fuller player stories as they are reviewed by the desk." />
          <TrustCard icon={<Users className="h-5 w-5" />} title="Safe submissions" text="Nomination details are kept private while the desk follows the story." />
        </div>

        <label className="relative block max-w-lg">
          <span className="sr-only">Search players, teams or competitions</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player, team, school or county" className="w-full border border-white/10 bg-[#111] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#FFD000]/60" />
        </label>

        <section aria-labelledby="performance-radar-title">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
            <div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ef3038]">The names to watch</p><h2 id="performance-radar-title" className="mt-1 text-xl font-black uppercase">Local performance radar</h2></div>
            <Link href="/kenya-football" className="text-[10px] font-black uppercase text-[#ef3038]">Open Kenya data <ArrowRight className="inline h-3 w-3" /></Link>
          </div>
          {localLoading ? <p className="py-10 text-sm text-white/45">Loading verified performances...</p> : performancePlayers.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{performancePlayers.map((player) => <article key={`${player.name}-${player.team}`} className="border border-white/10 bg-[#101010] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{player.name}</h3><p className="mt-1 text-xs text-white/50">{player.team || "Team not confirmed"}</p></div><span className="text-2xl font-black text-[#FFD000]">{player.goals}</span></div><p className="mt-3 border-t border-white/10 pt-3 text-[10px] uppercase text-white/45">Recorded goals · {player.competition}</p></article>)}</div>
          ) : <HonestEmpty text="No player performances to show yet. Check back after the next local matchday." />}
        </section>

        <section aria-labelledby="verified-profiles-title">
          <div className="border-b border-white/10 pb-3"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#FFD000]">More about the player</p><h2 id="verified-profiles-title" className="mt-1 text-xl font-black uppercase">Verified player profiles</h2></div>
          {profilesLoading ? <p className="py-10 text-sm text-white/45">Loading player profiles...</p> : visibleProfiles.length ? <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleProfiles.map((profile) => <article key={profile.id} className="overflow-hidden border border-white/10 bg-[#101010]">{profile.image_url && <img src={profile.image_url} alt={profile.player_name} className="h-44 w-full object-cover" loading="lazy" />}<div className="p-4"><span className="text-[9px] font-black uppercase text-[#FFD000]">Verified profile</span><h3 className="mt-1 text-lg font-black">{profile.player_name}</h3><p className="text-xs text-white/50">{profile.position} · {profile.institution} · {profile.county}</p>{profile.summary && <p className="mt-3 text-xs leading-5 text-white/65">{profile.summary}</p>}<p className="mt-3 border-t border-white/10 pt-3 text-[10px] text-white/40">{profile.verification_note}</p></div></article>)}</div> : <HonestEmpty text="Player profiles will appear here as the desk completes each story. Start with the matchday performances above." />}
        </section>
      </div>

      {showNominate && <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-labelledby="nomination-title"><div className="max-h-[92vh] w-full max-w-lg overflow-y-auto border border-white/15 bg-[#111] p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 id="nomination-title" className="text-lg font-black">Nominate a rising player</h2><p className="mt-1 text-xs leading-5 text-white/45">Share a reliable contact so the desk can request match records and consent.</p></div><button type="button" onClick={() => setShowNominate(false)} className="p-1 text-white/50 hover:text-white" aria-label="Close nomination form"><X className="h-5 w-5" /></button></div>
        {submitState === "success" ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-[#FFD000]" /><h3 className="mt-3 font-black">Nomination recorded</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/55">The private editorial queue has received it. Publication is never automatic and the desk may contact the nominated player, guardian, school, coach or club to verify the evidence.</p><Button onClick={() => setShowNominate(false)} className="mt-5 bg-[#d8212d]">Close</Button></div> : <form onSubmit={submitNomination} className="mt-5 space-y-4">
          <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label></div>
          <Field label="Player full name"><input required minLength={2} maxLength={120} value={form.playerName} onChange={(event) => setForm({ ...form, playerName: event.target.value })} className={FIELD_CLASS} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="School, academy or team"><input required minLength={2} maxLength={160} value={form.institution} onChange={(event) => setForm({ ...form, institution: event.target.value })} className={FIELD_CLASS} /></Field><Field label="Position"><select value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} className={FIELD_CLASS}>{POSITIONS.map((position) => <option key={position}>{position}</option>)}</select></Field></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="County"><input required minLength={2} maxLength={100} value={form.county} onChange={(event) => setForm({ ...form, county: event.target.value })} className={FIELD_CLASS} /></Field><Field label="Player, guardian or coach phone"><input required inputMode="tel" autoComplete="tel" placeholder="07... or +254..." value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} className={FIELD_CLASS} /></Field></div>
          <Field label="Evidence available (optional)"><textarea maxLength={1000} rows={3} value={form.evidenceNotes} onChange={(event) => setForm({ ...form, evidenceNotes: event.target.value })} placeholder="Tournament, match date, coach, poster or video details" className={`${FIELD_CLASS} resize-none`} /></Field>
          <label className="flex items-start gap-2 text-xs leading-5 text-white/60"><input required type="checkbox" checked={form.consentConfirmed} onChange={(event) => setForm({ ...form, consentConfirmed: event.target.checked })} className="mt-1 accent-[#FFD000]" /><span>I have permission to share this contact for a football verification follow-up. I understand the nomination is private and does not guarantee publication.</span></label>
          {submitState === "error" && <p className="flex items-start gap-2 border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{submitError}</p>}
          <Button type="submit" disabled={submitState === "submitting"} className="w-full bg-[#d8212d] font-black hover:bg-[#bb1823]">{submitState === "submitting" ? "Recording nomination..." : "Submit for private review"}</Button>
        </form>}
      </div></div>}
    </main>
  );
}

function TrustCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="border border-white/10 bg-[#101010] p-4"><span className="text-[#FFD000]">{icon}</span><h2 className="mt-3 text-sm font-black uppercase">{title}</h2><p className="mt-1 text-xs leading-5 text-white/45">{text}</p></div>; }
function HonestEmpty({ text }: { text: string }) { return <div className="mt-4 border border-dashed border-white/15 bg-white/[0.02] px-5 py-10 text-center text-sm text-white/45">{text}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold text-white/65"><span className="mb-1.5 block">{label}</span>{children}</label>; }
