import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, ChevronRight, FileImage, Loader2, Plus, Save, Sparkles, Trash2, Upload } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../lib/supabase";

type GoalEvent = {
  team?: string | null;
  player: string;
  minute?: string | null;
  assist?: string | null;
  type: "goal" | "own_goal" | "penalty_goal";
};

type LocalMatch = {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  status: "scheduled" | "finished" | "postponed" | "cancelled";
  date?: string | null;
  kickoffTime?: string | null;
  venue?: string | null;
  round?: string | null;
  events: GoalEvent[];
};

type StandingRow = {
  position: number;
  team: string;
  played?: number | null;
  won?: number | null;
  drawn?: number | null;
  lost?: number | null;
  goalsFor?: number | null;
  goalsAgainst?: number | null;
  goalDifference?: number | null;
  points?: number | null;
};

type Extraction = {
  documentType: "fixture" | "result" | "multi_result" | "standings" | "team_photo" | "unknown";
  competition: { name?: string | null; shortName?: string | null; seasonLabel?: string | null; locality?: string | null; county?: string | null };
  matches: LocalMatch[];
  standings: StandingRow[];
  confidence: number;
  warnings: string[];
  rawText: string;
};

type SourceRecord = {
  id: string;
  source_name: string;
  original_filename: string;
  document_type: string;
  workflow_status: string;
  extraction_confidence: number | null;
  extraction_warnings: string[];
  extraction_payload: Extraction;
  created_at: string;
  published_at: string | null;
};

const EMPTY_EXTRACTION: Extraction = {
  documentType: "unknown",
  competition: { name: "", shortName: "", seasonLabel: "", locality: "", county: "" },
  matches: [], standings: [], confidence: 0, warnings: [], rawText: "",
};

const EMPTY_MATCH: LocalMatch = {
  homeTeam: "", awayTeam: "", homeScore: null, awayScore: null,
  homePenalties: null, awayPenalties: null, status: "scheduled", date: "",
  kickoffTime: "", venue: "", round: "", events: [],
};

const inputClass = "h-10 w-full rounded-md border border-white/10 bg-[#0b0f14] px-3 text-sm text-white outline-none transition focus:border-[#ef3038]/70";

async function intakeRequest(body: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Your session has expired. Sign in again.");
  const response = await fetch("/api/local-football-intake", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Local data request failed.");
  return payload;
}

async function posterDataUrl(file: File) {
  const image = await createImageBitmap(file);
  const max = 1800;
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  return canvas.toDataURL("image/jpeg", 0.88);
}

function numberValue(value: string) {
  return value === "" ? null : Number(value);
}

export default function AdminLocalFootballPage() {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [sourceType, setSourceType] = useState("organizer_poster");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [extraction, setExtraction] = useState<Extraction>(EMPTY_EXTRACTION);
  const [busy, setBusy] = useState<"extract" | "save" | "publish" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSources = useCallback(async () => {
    try {
      const data = await intakeRequest({ action: "list" });
      setSources(data.sources || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { loadSources(); }, [loadSources]);

  function chooseSource(source: SourceRecord) {
    setSourceId(source.id);
    setSourceName(source.source_name);
    setFile(null);
    setPreview("");
    setExtraction(source.extraction_payload || EMPTY_EXTRACTION);
    setError("");
    setMessage("");
  }

  async function onFile(next: File | null) {
    setFile(next);
    setSourceId(null);
    setExtraction(EMPTY_EXTRACTION);
    setError("");
    setMessage("");
    if (!next) { setPreview(""); return; }
    if (!/^image\/(jpeg|png|webp)$/.test(next.type)) { setError("Use a JPEG, PNG or WebP poster."); return; }
    try { setPreview(await posterDataUrl(next)); }
    catch { setError("This image could not be opened."); }
  }

  async function extract() {
    if (!file || !preview || !sourceName.trim()) { setError("Choose a poster and enter its organizer or source."); return; }
    setBusy("extract"); setError(""); setMessage("");
    try {
      const data = await intakeRequest({
        action: "extract", sourceName: sourceName.trim(), sourceType,
        filename: file.name, imageDataUrl: preview,
      });
      setSourceId(data.sourceId);
      setExtraction(data.extraction);
      setMessage("Draft extracted. Check every field against the poster before publishing.");
      await loadSources();
    } catch (err: any) { setError(err.message); }
    finally { setBusy(""); }
  }

  async function persist(action: "save" | "publish") {
    if (!sourceId) { setError("Extract or open a poster first."); return; }
    if (action === "publish" && !confirm("Publish these corrected values as verified local football data?")) return;
    setBusy(action); setError(""); setMessage("");
    try {
      await intakeRequest({ action, sourceId, extraction });
      setMessage(action === "publish" ? "Verified data is now live on BallMtaani." : "Review draft saved.");
      await loadSources();
    } catch (err: any) { setError(err.message); }
    finally { setBusy(""); }
  }

  function updateMatch(index: number, patch: Partial<LocalMatch>) {
    setExtraction((current) => ({ ...current, matches: current.matches.map((row, i) => i === index ? { ...row, ...patch } : row) }));
  }

  function updateStanding(index: number, patch: Partial<StandingRow>) {
    setExtraction((current) => ({ ...current, standings: current.standings.map((row, i) => i === index ? { ...row, ...patch } : row) }));
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-[#ef3038]"><FileImage className="h-5 w-5" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Kenyan Football</span></div>
          <h1 className="mt-2 text-2xl font-black uppercase text-white">Poster Data Desk</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">Turn organizer posters into searchable fixtures, results, scorers and standings. Extraction creates a private draft; nothing reaches fans until you verify it.</p>
        </header>

        {error && <Notice tone="error">{error}</Notice>}
        {message && <Notice tone="success">{message}</Notice>}

        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-3">
            <button onClick={() => { setSourceId(null); setFile(null); setPreview(""); setSourceName(""); setExtraction(EMPTY_EXTRACTION); }} className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#d8212d] text-xs font-black uppercase text-white hover:bg-[#ef3038]">
              <Plus className="h-4 w-4" /> New poster
            </button>
            <div className="overflow-hidden rounded-md border border-white/10 bg-[#0b0f14]">
              <div className="border-b border-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/35">Recent intake</div>
              <div className="max-h-[560px] divide-y divide-white/7 overflow-y-auto">
                {sources.length === 0 && <p className="p-4 text-xs text-white/30">No posters processed yet.</p>}
                {sources.map((source) => (
                  <button key={source.id} onClick={() => chooseSource(source)} className={`flex w-full items-center gap-2 px-3 py-3 text-left hover:bg-white/5 ${sourceId === source.id ? "bg-white/7" : ""}`}>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${source.workflow_status === "published" ? "bg-emerald-400" : source.workflow_status === "failed" ? "bg-red-500" : "bg-amber-400"}`} />
                    <span className="min-w-0 flex-1"><b className="block truncate text-xs text-white/75">{source.source_name}</b><small className="block truncate text-[9px] uppercase text-white/30">{source.document_type.replace("_", " ")} · {source.workflow_status.replace("_", " ")}</small></span>
                    <ChevronRight className="h-3 w-3 text-white/20" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-5">
            {!sourceId && (
              <section className="grid gap-4 rounded-md border border-white/10 bg-[#0b0f14] p-4 md:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-4">
                  <Field label="Organizer / source"><input className={inputClass} value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="e.g. Pedeshee Wauna Super Cup" /></Field>
                  <Field label="Poster source type"><select className={inputClass} value={sourceType} onChange={(e) => setSourceType(e.target.value)}><option value="organizer_poster">Organizer poster</option><option value="club_poster">Club poster</option><option value="school_poster">School poster</option><option value="reporter">Reporter submission</option><option value="other">Other source</option></select></Field>
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-white/20 bg-black/20 px-5 text-center hover:border-[#ef3038]/60">
                    <Upload className="h-6 w-6 text-[#ef3038]" /><b className="mt-2 text-sm">Choose fixture, result or table poster</b><span className="mt-1 text-[10px] text-white/35">JPEG, PNG or WebP. It is resized securely before upload.</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0] || null)} />
                  </label>
                  <button disabled={busy !== ""} onClick={extract} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#d8212d] text-xs font-black uppercase text-white disabled:opacity-45">
                    {busy === "extract" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Extract draft
                  </button>
                </div>
                <div className="grid min-h-64 place-items-center overflow-hidden rounded-md border border-white/10 bg-black/40">
                  {preview ? <img src={preview} alt="Poster awaiting extraction" className="max-h-[420px] w-full object-contain" /> : <FileImage className="h-12 w-12 text-white/10" />}
                </div>
              </section>
            )}

            {sourceId && (
              <>
                <section className="rounded-md border border-amber-400/25 bg-amber-400/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-widest text-amber-300">Human review required</p><p className="mt-1 text-xs text-white/55">OCR confidence: {Math.round((extraction.confidence || 0) * 100)}%. Compare names, scores, dates and venues with the original poster.</p></div><select className={`${inputClass} w-44`} value={extraction.documentType} onChange={(e) => setExtraction((x) => ({ ...x, documentType: e.target.value as Extraction["documentType"] }))}><option value="fixture">Fixture</option><option value="result">Result</option><option value="multi_result">Multiple results</option><option value="standings">Standings</option><option value="team_photo">Team photo</option><option value="unknown">Unknown</option></select></div>
                  {extraction.warnings.length > 0 && <ul className="mt-3 space-y-1">{extraction.warnings.map((warning, i) => <li key={i} className="flex gap-2 text-[11px] text-amber-100/65"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />{warning}</li>)}</ul>}
                </section>

                <section className="rounded-md border border-white/10 bg-[#0b0f14] p-4">
                  <h2 className="mb-3 text-xs font-black uppercase tracking-widest">Competition</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(["name", "shortName", "seasonLabel", "locality", "county"] as const).map((key) => <Field key={key} label={key.replace(/([A-Z])/g, " $1")}><input className={inputClass} value={extraction.competition[key] || ""} onChange={(e) => setExtraction((x) => ({ ...x, competition: { ...x.competition, [key]: e.target.value } }))} /></Field>)}
                  </div>
                </section>

                <section className="space-y-3">
                  <SectionTitle title={`Matches (${extraction.matches.length})`} onAdd={() => setExtraction((x) => ({ ...x, matches: [...x.matches, { ...EMPTY_MATCH }] }))} />
                  {extraction.matches.map((match, index) => (
                    <div key={index} className="rounded-md border border-white/10 bg-[#0b0f14] p-4">
                      <div className="mb-3 flex items-center justify-between"><b className="text-xs uppercase text-white/65">Match {index + 1}</b><button title="Remove match" onClick={() => setExtraction((x) => ({ ...x, matches: x.matches.filter((_, i) => i !== index) }))} className="p-2 text-white/30 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <TextInput label="Home team" value={match.homeTeam} onChange={(value) => updateMatch(index, { homeTeam: value })} />
                        <TextInput label="Away team" value={match.awayTeam} onChange={(value) => updateMatch(index, { awayTeam: value })} />
                        <NumberInput label="Home score" value={match.homeScore} onChange={(value) => updateMatch(index, { homeScore: value })} />
                        <NumberInput label="Away score" value={match.awayScore} onChange={(value) => updateMatch(index, { awayScore: value })} />
                        <TextInput label="Date (YYYY-MM-DD)" value={match.date} onChange={(value) => updateMatch(index, { date: value })} />
                        <TextInput label="Kickoff time" value={match.kickoffTime} onChange={(value) => updateMatch(index, { kickoffTime: value })} />
                        <TextInput label="Venue" value={match.venue} onChange={(value) => updateMatch(index, { venue: value })} />
                        <TextInput label="Round" value={match.round} onChange={(value) => updateMatch(index, { round: value })} />
                        <Field label="Status"><select className={inputClass} value={match.status} onChange={(e) => updateMatch(index, { status: e.target.value as LocalMatch["status"] })}><option value="scheduled">Scheduled</option><option value="finished">Finished</option><option value="postponed">Postponed</option><option value="cancelled">Cancelled</option></select></Field>
                        <NumberInput label="Home penalties" value={match.homePenalties} onChange={(value) => updateMatch(index, { homePenalties: value })} />
                        <NumberInput label="Away penalties" value={match.awayPenalties} onChange={(value) => updateMatch(index, { awayPenalties: value })} />
                      </div>
                      <div className="mt-4 border-t border-white/8 pt-3">
                        <div className="mb-2 flex items-center justify-between"><b className="text-[9px] uppercase tracking-widest text-white/35">Goals / events</b><button onClick={() => updateMatch(index, { events: [...match.events, { team: "", player: "", minute: "", assist: "", type: "goal" }] })} className="flex items-center gap-1 text-[9px] font-black uppercase text-[#ef3038]"><Plus className="h-3 w-3" /> Add scorer</button></div>
                        <div className="space-y-2">{match.events.map((event, eventIndex) => <div key={eventIndex} className="grid gap-2 sm:grid-cols-[1fr_1fr_80px_1fr_34px]"><input aria-label="Scorer team" placeholder="Team" className={inputClass} value={event.team || ""} onChange={(e) => updateMatch(index, { events: match.events.map((item, i) => i === eventIndex ? { ...item, team: e.target.value } : item) })} /><input aria-label="Scorer" placeholder="Player" className={inputClass} value={event.player} onChange={(e) => updateMatch(index, { events: match.events.map((item, i) => i === eventIndex ? { ...item, player: e.target.value } : item) })} /><input aria-label="Minute" placeholder="51'" className={inputClass} value={event.minute || ""} onChange={(e) => updateMatch(index, { events: match.events.map((item, i) => i === eventIndex ? { ...item, minute: e.target.value } : item) })} /><input aria-label="Assist" placeholder="Assist (optional)" className={inputClass} value={event.assist || ""} onChange={(e) => updateMatch(index, { events: match.events.map((item, i) => i === eventIndex ? { ...item, assist: e.target.value } : item) })} /><button title="Remove event" onClick={() => updateMatch(index, { events: match.events.filter((_, i) => i !== eventIndex) })} className="grid h-10 place-items-center rounded-md border border-white/10 text-white/30 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>
                      </div>
                    </div>
                  ))}
                </section>

                <section className="space-y-3">
                  <SectionTitle title={`Standings (${extraction.standings.length})`} onAdd={() => setExtraction((x) => ({ ...x, standings: [...x.standings, { position: x.standings.length + 1, team: "", played: null, won: null, drawn: null, lost: null, goalDifference: null, points: null }] }))} />
                  {extraction.standings.length > 0 && <div className="overflow-x-auto rounded-md border border-white/10 bg-[#0b0f14]"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-white/5 text-[9px] uppercase text-white/35"><tr>{["#", "Team", "P", "W", "D", "L", "GD", "Pts", ""].map((label) => <th key={label} className="px-2 py-2">{label}</th>)}</tr></thead><tbody className="divide-y divide-white/7">{extraction.standings.map((row, index) => <tr key={index}>{(["position", "team", "played", "won", "drawn", "lost", "goalDifference", "points"] as const).map((key) => <td key={key} className="p-1"><input aria-label={key} type={key === "team" ? "text" : "number"} className={`${inputClass} ${key === "team" ? "min-w-36" : "w-16"}`} value={row[key] ?? ""} onChange={(e) => updateStanding(index, { [key]: key === "team" ? e.target.value : numberValue(e.target.value) } as Partial<StandingRow>)} /></td>)}<td><button title="Remove row" onClick={() => setExtraction((x) => ({ ...x, standings: x.standings.filter((_, i) => i !== index) }))} className="p-2 text-white/25 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button></td></tr>)}</tbody></table></div>}
                </section>

                <div className="sticky bottom-3 z-10 flex flex-wrap justify-end gap-2 rounded-md border border-white/10 bg-[#080b10]/95 p-3 shadow-2xl backdrop-blur">
                  <button disabled={busy !== ""} onClick={() => persist("save")} className="flex h-10 items-center gap-2 rounded-md border border-white/15 px-4 text-xs font-black uppercase text-white/70 hover:bg-white/5 disabled:opacity-40">{busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft</button>
                  <button disabled={busy !== ""} onClick={() => persist("publish")} className="flex h-10 items-center gap-2 rounded-md bg-[#d8212d] px-5 text-xs font-black uppercase text-white hover:bg-[#ef3038] disabled:opacity-40">{busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Verify & publish</button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-white/35">{label}</span>{children}</label>; }
function TextInput({ label, value, onChange }: { label: string; value?: string | null; onChange: (value: string) => void }) { return <Field label={label}><input className={inputClass} value={value || ""} onChange={(e) => onChange(e.target.value)} /></Field>; }
function NumberInput({ label, value, onChange }: { label: string; value?: number | null; onChange: (value: number | null) => void }) { return <Field label={label}><input type="number" min="0" className={inputClass} value={value ?? ""} onChange={(e) => onChange(numberValue(e.target.value))} /></Field>; }
function SectionTitle({ title, onAdd }: { title: string; onAdd: () => void }) { return <div className="flex items-center justify-between"><h2 className="text-xs font-black uppercase tracking-widest">{title}</h2><button onClick={onAdd} className="flex items-center gap-1 text-[9px] font-black uppercase text-[#ef3038]"><Plus className="h-3 w-3" /> Add row</button></div>; }
function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) { return <div className={`rounded-md border px-4 py-3 text-sm ${tone === "error" ? "border-red-500/25 bg-red-500/8 text-red-300" : "border-emerald-500/25 bg-emerald-500/8 text-emerald-300"}`}>{children}</div>; }
