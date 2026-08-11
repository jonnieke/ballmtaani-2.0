import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useFixtureDetail, useUpcomingFixtures } from "../hooks/useData";
import { supabase } from "../lib/supabase";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Trophy, Flame, Target, Star, ShieldAlert, Share2, Users, Bell, Sparkles } from "lucide-react";
import TeamLogo from "../components/TeamLogo";
import SEO from "../components/SEO";
import { WC26BracketCard } from "../components/WC26BracketCard";
import { analytics } from "../lib/analytics";
import { askMchambuziHalisi } from "../lib/mchambuzi-halisi";

const WC26_SPECIAL_ID = "wc26-2026-winner";
const WC26_NATIONS = ["Brazil","France","Argentina","England","Germany","Spain","Portugal","Netherlands","Belgium","Morocco","Senegal","USA"];
const WC26_LOCK = new Date("2026-06-11T17:00:00Z");
const wc26PicksClosed = Date.now() >= WC26_LOCK.getTime();

// â”€â”€â”€ WC26 Tournament Prediction Questions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface WC26Question {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  options: string[];
  mtc: number;
}

const WC26_QUESTIONS: WC26Question[] = [
  {
    id: "wc26-champion",
    emoji: "🏆",
    title: "Who lifts the trophy?",
    subtitle: "Pick the WC26 World Champion",
    options: ["Brazil","France","Argentina","England","Germany","Spain","Portugal","Morocco","Senegal","USA","Netherlands","Colombia"],
    mtc: 500,
  },
  {
    id: "wc26-africa",
    emoji: "🌍",
    title: "Africa's deepest run",
    subtitle: "Which CAF team goes furthest?",
    options: ["Morocco","Senegal","Nigeria","Egypt","Cameroon","South Africa","Ghana","Algeria","Tunisia"],
    mtc: 200,
  },
  {
    id: "wc26-boot",
    emoji: "👟",
    title: "Golden Boot winner",
    subtitle: "Top scorer at WC26",
    options: ["Mbappe","Vinicius Jr","Haaland","Osimhen","Mane","Lewandowski","Kane","Benzema","Lukaku","Salah"],
    mtc: 300,
  },
  {
    id: "wc26-shock",
    emoji: "😱",
    title: "Biggest group stage exit",
    subtitle: "Who gets knocked out in the groups?",
    options: ["Argentina","Brazil","France","Germany","England","Spain","Belgium","Portugal"],
    mtc: 250,
  },
  {
    id: "wc26-horse",
    emoji: "⚡",
    title: "Dark horse finalist",
    subtitle: "Who reaches the final and shocks the world?",
    options: ["Portugal","Colombia","Japan","Ecuador","Senegal","South Korea","Iran","Mexico","USA","Canada"],
    mtc: 400,
  },
  {
    id: "wc26-kenya",
    emoji: "🇰🇪",
    title: "Kenya's heart team",
    subtitle: "Who are Kenyan fans riding with?",
    options: ["Morocco","Senegal","Nigeria","South Africa","Brazil","France","England","Argentina","USA","Germany"],
    mtc: 50,
  },
];


export default function PredictionsPage() {
  const initialTab = (() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "my" || tab === "make" || tab === "wc26") return tab;
    return "make";
  })();
  const [activeTab, setActiveTab] = useState<"make" | "my" | "wc26">(initialTab);

  // Legacy WC26 winner pick (kept for backward compat)
  const [wc26Pick, setWc26Pick]   = useState<string>("");
  const [wc26Saved, setWc26Saved] = useState(false);
  const [wc26Saving, setWc26Saving] = useState(false);

  // WC26 Tournament predictions
  const [wc26Picks, setWc26Picks]   = useState<Record<string, string>>({});   // questionId â†’ pick
  const [wc26Saved2, setWc26Saved2] = useState<Record<string, boolean>>({});   // questionId â†’ saved
  const [wc26Saving2, setWc26Saving2] = useState<string | null>(null);         // questionId being saved
  const [wc26Consensus, setWc26Consensus] = useState<Record<string, Record<string, number>>>({});
  const [showBracketCard, setShowBracketCard] = useState(false);
  const [matchPanelTab, setMatchPanelTab] = useState<"details" | "insights" | "odds" | "lineups">("details");
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | undefined>(undefined);

  const { isLoggedIn, user, coins, updateCoins, awardCoins } = useAuth();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, {home: string, away: string, saved: boolean}>>({});
  const [leagueFilter, setLeagueFilter] = useState<string>("all");
  const [myReceipts, setMyReceipts] = useState<any[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [mchambuziAnswer, setMchambuziAnswer] = useState("");

  const { data: fixtures = [] } = useUpcomingFixtures();
  const availableLeagues = useMemo(
    () => Array.from(new Set(fixtures.map((f: any) => f.league))).filter(Boolean),
    [fixtures]
  );
  const visibleFixtures = useMemo(
    () => fixtures.filter((f: any) => leagueFilter === "all" || f.league === leagueFilter),
    [fixtures, leagueFilter]
  );
  const lockedCalls = useMemo(() => Object.values(predictions).filter((p) => p.saved).length, [predictions]);
  const featuredFixture = visibleFixtures[0] || fixtures[0] || null;
  const wc26LockedCalls = useMemo(() => Object.keys(wc26Saved2).filter((key) => wc26Saved2[key]).length, [wc26Saved2]);
  const communitySignals = useMemo(() => ([
    { label: "Live fixtures", value: visibleFixtures.length.toLocaleString(), sub: "call volume" },
    { label: "Locked receipts", value: lockedCalls.toString(), sub: "submitted calls" },
    { label: "Archive calls", value: wc26LockedCalls.toString(), sub: "saved tournament picks" },
    { label: "MTC status", value: coins.toLocaleString(), sub: "non-cash points" },
  ]), [visibleFixtures.length, lockedCalls, wc26LockedCalls, coins]);
  const fixtureDetailQuery = useFixtureDetail(selectedFixtureId);
  const selectedFixture = useMemo(() => {
    if (!selectedFixtureId) return featuredFixture || null;
    return fixtures.find((item: any) => String(item.id) === String(selectedFixtureId)) || featuredFixture || null;
  }, [fixtures, featuredFixture, selectedFixtureId]);
  const fixtureDetailData = fixtureDetailQuery.data;
  const fixtureStats = fixtureDetailData?.stats || [];
  const homeLineup = fixtureDetailData?.lineups?.home || null;
  const awayLineup = fixtureDetailData?.lineups?.away || null;
  useEffect(() => {
    if (!selectedFixtureId && featuredFixture?.id) {
      setSelectedFixtureId(String(featuredFixture.id));
    }
  }, [selectedFixtureId, featuredFixture]);
  useEffect(() => {
    let cancelled = false;
    askMchambuziHalisi("Give a short tactical read of the most relevant current fixture.", { live: visibleFixtures, upcoming: fixtures, recent: [] })
      .then(({ answer }) => {
        if (!cancelled) setMchambuziAnswer(answer);
      })
      .catch(() => {
        if (!cancelled) setMchambuziAnswer("");
      });

    return () => {
      cancelled = true;
    };
  }, [fixtures, visibleFixtures]);


  const fixtureLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    fixtures.forEach((f: any) => {
      map[String(f.id)] = `${f.home} vs ${f.away}`;
    });
    return map;
  }, [fixtures]);

  const handlePredict = async (fixtureId: string) => {
    if (!isLoggedIn || !user) { 
      sessionStorage.setItem("auth_return_url", window.location.pathname);
      setLocation('/login'); 
      return; 
    }
    
    const pred = predictions[fixtureId];
    if (pred && pred.home !== "" && pred.away !== "") {
      setIsSubmitting(fixtureId);
      
      const { error } = await supabase.from("predictions").upsert({
        user_id: user.id,
        match_id: fixtureId,
        predicted_score: `${pred.home} - ${pred.away}`
      }, {
        onConflict: "user_id,match_id"
      });

      setIsSubmitting(null);
      
      if (!error) {
        setPredictions({ ...predictions, [fixtureId]: { ...pred, saved: true } });
        awardCoins('prediction_submitted');
      }
    }
  };

  const handleScoreChange = (fixtureId: string, team: 'home' | 'away', val: string) => {
    if (val !== "" && !/^\d+$/.test(val)) return;
    setPredictions(prev => ({
      ...prev,
      [fixtureId]: {
        home: team === 'home' ? val : (prev[fixtureId]?.home || ""),
        away: team === 'away' ? val : (prev[fixtureId]?.away || ""),
        saved: false
      }
    }));
  };

  const handleWC26Winner = async () => {
    if (!wc26Pick || wc26Saved || wc26Saving) return;
    if (!isLoggedIn || !user) { sessionStorage.setItem("auth_return_url", window.location.pathname); setLocation('/login'); return; }
    setWc26Saving(true);
    await supabase.from("predictions").upsert({ user_id: user.id, match_id: WC26_SPECIAL_ID, predicted_score: wc26Pick }, { onConflict: "user_id,match_id" });
    setWc26Saving(false);
    setWc26Saved(true);
    awardCoins('prediction_submitted');
  };

  // Load existing WC26 tournament picks
  useEffect(() => {
    if (!isLoggedIn || !user || !supabase) return;
    const ids = WC26_QUESTIONS.map(q => q.id);
    void Promise.resolve(
      supabase.from("predictions")
        .select("match_id, predicted_score")
        .eq("user_id", user.id)
        .in("match_id", ids)
        .then(({ data, error }) => {
          if (error || !data) return;
          const picks: Record<string, string> = {};
          const saved: Record<string, boolean> = {};
          data.forEach((row: any) => {
            picks[row.match_id] = row.predicted_score;
            saved[row.match_id] = true;
          });
          setWc26Picks(picks);
          setWc26Saved2(saved);
        })
    ).catch(() => {
      // Gracefully handle if predictions table doesn't exist yet
    });
  }, [isLoggedIn, user]);

  // Fetch aggregate vote counts for all WC26 questions (public, no auth required)
  useEffect(() => {
    if (!supabase) return;
    const ids = WC26_QUESTIONS.map(q => q.id);
    void Promise.resolve(
      supabase
        .from("predictions")
        .select("match_id, predicted_score")
        .in("match_id", ids)
        .then(({ data }) => {
          if (!data) return;
          const counts: Record<string, Record<string, number>> = {};
          for (const row of data) {
            if (!counts[row.match_id]) counts[row.match_id] = {};
            const key = row.predicted_score as string;
            counts[row.match_id][key] = (counts[row.match_id][key] || 0) + 1;
          }
          setWc26Consensus(counts);
        })
    ).catch(() => {});
  }, []);

  const handleWC26Pick = async (questionId: string, pick: string) => {
    if (!isLoggedIn || !user) { sessionStorage.setItem("auth_return_url", window.location.pathname); setLocation('/login'); return; }
    if (wc26Saved2[questionId]) return;
    setWc26Picks(prev => ({ ...prev, [questionId]: pick }));
    setWc26Saving2(questionId);
    await supabase.from("predictions").upsert(
      { user_id: user.id, match_id: questionId, predicted_score: pick },
      { onConflict: "user_id,match_id" }
    );
    setWc26Saving2(null);
    setWc26Saved2(prev => ({ ...prev, [questionId]: true }));
    // Optimistically update local consensus count
    setWc26Consensus(prev => {
      const qCounts = { ...(prev[questionId] || {}) };
      qCounts[pick] = (qCounts[pick] || 0) + 1;
      return { ...prev, [questionId]: qCounts };
    });
    awardCoins('prediction_submitted');
  };

  const shareWC26Picks = () => {
    const filled = WC26_QUESTIONS.filter(q => wc26Saved2[q.id]);
    if (!filled.length) return;
    const lines = filled.map(q => `${q.emoji} ${q.title}: ${wc26Picks[q.id]}`).join("\n");
    const total = filled.reduce((s, q) => s + q.mtc, 0);
    const text = encodeURIComponent(`🏆 My World Cup archive calls on BallMtaani\n\n${lines}\n\nArchived MTC record: ${total.toLocaleString()}\n\nMake yours → https://ballmtaani.com/predictions`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareReceipt = (item: any) => {
    const matchLabel = fixtureLabelMap[String(item.match_id)] || item.match_id;
    const status = String(item.result || "pending").toLowerCase();
    const emoji = status === "correct" ? "✅" : status === "partial" ? "🟡" : "❌";
    const text = encodeURIComponent(`${emoji} My BallMtaani Receipt\n\n${matchLabel}\nMy call: ${item.predicted_score || "-"} | Actual: ${item.actual_score || "TBD"}\n${status === "correct" ? `+${item.coins_awarded || 0} MTC earned 🔥` : ""}\n\nMake your call: https://ballmtaani.com/predictions`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const applyQuickScore = (fixtureId: string, score: string) => {
    const [home, away] = score.split("-");
    setPredictions((prev) => ({
      ...prev,
      [fixtureId]: { home: home.trim(), away: away.trim(), saved: false }
    }));
  };

  useEffect(() => {
    const loadMyReceipts = async () => {
      if (!isLoggedIn || !user || activeTab !== "my") return;
      setLoadingReceipts(true);
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setLoadingReceipts(false);
      if (error || !data) {
        setMyReceipts([]);
        return;
      }
      setMyReceipts(data);
    };
    loadMyReceipts();
  }, [activeTab, isLoggedIn, user]);

  useEffect(() => {
    if (!supabase || !isLoggedIn || !user || activeTab !== "my") return;
    const channel = supabase
      .channel("my-predictions-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "predictions", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const row = payload.new || payload.old;
          if (!row) return;
          setMyReceipts((prev) => {
            const without = prev.filter((p) => String(p.id) !== String(row.id));
            if (payload.eventType === "DELETE") return without;
            return [row, ...without];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, isLoggedIn, user]);

  // Credit MTC locally for any settled receipts not yet applied to local balance.
  // The settlement worker updates profiles.coins server-side, but the local coin
  // store also needs to reflect the win the moment a fan sees their receipt.
  useEffect(() => {
    if (!isLoggedIn || !user || myReceipts.length === 0) return;
    const creditedKey = `mtaani_credited_predictions_${user.id}`;
    const credited: string[] = JSON.parse(localStorage.getItem(creditedKey) || "[]");
    let totalNewCoins = 0;
    const newlyCredited: string[] = [];

    for (const receipt of myReceipts) {
      const id = String(receipt.id);
      if (credited.includes(id)) continue;
      const earned = Number(receipt.coins_awarded) || 0;
      if (earned > 0 && receipt.result && receipt.result !== "pending") {
        totalNewCoins += earned;
        newlyCredited.push(id);
      }
    }

    if (totalNewCoins > 0) {
      localStorage.setItem(creditedKey, JSON.stringify([...credited, ...newlyCredited]));
      updateCoins(totalNewCoins);
    }
  }, [myReceipts, isLoggedIn, user]);

  const wc26TotalMtc = WC26_QUESTIONS.filter(q => wc26Saved2[q.id]).reduce((s, q) => s + q.mtc, 0);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-20">
      {showBracketCard && (
        <WC26BracketCard
          picks={wc26Picks}
          consensus={wc26Consensus}
          questions={WC26_QUESTIONS}
          onClose={() => setShowBracketCard(false)}
        />
      )}
      <SEO
        title="Predictions | BallMtaani Fan Calls & Receipts"
        description="Make non-cash community score predictions, compare calls and keep a transparent record alongside BallMtaani match coverage."
        path="/predictions"
      />
{/* â”€â”€ HERO â”€â”€ */}
      <div className="border-b border-white/6 bg-[#0c0e13] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-1 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-[#FFD700]" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FFD700]">Calls & Receipts</span>
          </div>
          <h1 className="mb-2 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            Call It. <span className="text-[#FFD700]">Keep the Receipt.</span>
          </h1>
          <p className="mb-5 max-w-xl text-sm text-white/45">
            Pick the scoreline before kickoff. Earn MTC when you're right. Come back after full time — the receipt doesn't lie.
          </p>
          {/* MTC reward strip */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Target, label: "+50 MTC", sub: "Exact scoreline", color: "text-[#FFD700]", bg: "bg-[#FFD700]/8 border-[#FFD700]/20" },
              { icon: Flame, label: "+20 MTC", sub: "Correct result", color: "text-[#B30000]", bg: "bg-[#B30000]/8 border-[#B30000]/20" },
              { icon: Trophy, label: "Leaderboard", sub: "Top callers rise", color: "text-blue-400", bg: "bg-blue-500/8 border-blue-500/20" },
            ].map(({ icon: Icon, label, sub, color, bg }) => (
              <div key={label} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${bg}`}>
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                <div>
                  <div className={`text-xs font-black ${color}`}>{label}</div>
                  <div className="text-[9px] text-white/35 font-semibold">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-4 py-6">


        <div className="mb-6 grid gap-3 ">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
            <div className="bg-[linear-gradient(135deg,#3a1118_0%,#21120f_52%,#071116_100%)] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <Link href="/matches" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/80">
                  <Bell className="h-3.5 w-3.5" />
                  Live match
                </div>
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80">
                  <Star className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="text-center">
                  <TeamLogo
                    logo={selectedFixture?.homeLogo}
                    initial={String(selectedFixture?.home || "H").slice(0, 3).toUpperCase()}
                    color={selectedFixture?.homeColor || "#8b1118"}
                    size="lg"
                    shadow
                  />
                  <p className="mt-2 truncate text-sm font-black text-white">{selectedFixture?.home || "Home"}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white md:text-4xl">{selectedFixture?.time || selectedFixture?.date || "23:00"}</div>
                  <div className="mt-1 text-sm font-semibold text-white/70">{selectedFixture?.date ? "Today" : "Upcoming"}</div>
                </div>
                <div className="text-center">
                  <TeamLogo
                    logo={selectedFixture?.awayLogo}
                    initial={String(selectedFixture?.away || "A").slice(0, 3).toUpperCase()}
                    color={selectedFixture?.awayColor || "#123f92"}
                    size="lg"
                    shadow
                  />
                  <p className="mt-2 truncate text-sm font-black text-white">{selectedFixture?.away || "Away"}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { key: "details", label: "Details" },
                  { key: "insights", label: "AI Insights" },
                  { key: "odds", label: "Community" },
                  { key: "lineups", label: "Lineups" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMatchPanelTab(tab.key as any)}
                    className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-black transition ${
                      matchPanelTab === tab.key
                        ? "border-white text-white"
                        : "border-transparent text-white/55 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#e9edf1] p-4 text-[#111] md:p-5">
              {matchPanelTab === "details" ? (
                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[22px] bg-white p-5 shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#111] text-white">
                      <Target className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">Community prediction</p>
                    <h3 className="mt-2 text-2xl font-extrabold leading-tight text-[#171717]">Make an informed call</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      Review current form, confirmed team news, live statistics and Mchambuzi analysis before recording your score call.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-[#222]">
                      {["No money or stake required", "MTC is a non-cash status point", "Calls are community opinions, not betting advice"].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/mchambuzi-halisi" className="mt-5 inline-flex rounded-xl bg-[#3557ff] px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#2446f0]">
                      Read the match
                    </Link>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-[22px] border border-white/40 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Match details</p>
                          <p className="mt-2 text-lg font-black text-[#111]">{selectedFixture?.home || "Home"} vs {selectedFixture?.away || "Away"}</p>
                        </div>
                        <div className="rounded-full bg-[#111] px-3 py-1 text-[10px] font-black uppercase text-white">
                          {selectedFixture?.league || "World Cup 2026"}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        {[
                          { label: "Competition", value: selectedFixture?.league || "World Cup 2026" },
                          { label: "Kickoff", value: selectedFixture?.time || selectedFixture?.date || "TBA" },
                          { label: "Venue", value: selectedFixture?.venue || "TBA" },
                          { label: "Status", value: selectedFixture?.status || "Upcoming" },
                        ].map((item) => (
                          <div key={item.label} className="rounded-xl border border-[#111]/10 bg-[#f5f7fa] p-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">{item.label}</p>
                            <p className="mt-1 font-bold text-[#111]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-[#111]/10 bg-white p-5 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Live context</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {fixtureStats.length > 0 ? fixtureStats.slice(0, 3).map((stat) => (
                          <div key={stat.label} className="rounded-xl border border-[#111]/10 bg-[#f5f7fa] p-3 text-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">{stat.label}</p>
                            <p className="mt-2 text-lg font-black text-[#111]">{stat.home}{stat.unit || ""}<span className="mx-2 text-gray-400">-</span>{stat.away}{stat.unit || ""}</p>
                          </div>
                        )) : (
                          <div className="sm:col-span-3 rounded-xl border border-dashed border-[#111]/15 bg-[#f5f7fa] p-4 text-sm text-gray-500">
                            Live stats will appear once API-Football returns the fixture detail feed.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : matchPanelTab === "insights" ? (
                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[22px] border border-[#111]/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                      <Sparkles className="h-4 w-4 text-[#3557ff]" />
                      AI Insights
                    </div>
                    <h3 className="mt-3 text-xl font-black text-[#111]">Mchambuzi Halisi</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-700">{mchambuziAnswer || "Mchambuzi is reading the live feed for this fixture."}</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {[
                        { label: "Match pace", value: selectedFixture?.minute || selectedFixture?.status || "Live feed" },
                        { label: "Trend", value: fixtureStats.length ? "Stats ready" : "Waiting" },
                        { label: "Coverage", value: selectedFixture?.league || "WC26" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-[#111]/10 bg-[#f5f7fa] p-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">{item.label}</p>
                          <p className="mt-1 text-sm font-bold text-[#111]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <Link href="/mchambuzi-halisi" className="mt-5 inline-flex rounded-xl bg-[#3557ff] px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#2446f0]">
                      Open full analysis
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-[22px] border border-[#111]/10 bg-white p-5 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Why this matters</p>
                      <p className="mt-3 text-sm leading-6 text-gray-700">
                        Use the live fixture feed, confirmed team news and match statistics as context. Community calls remain opinions, not guarantees.
                      </p>
                    </div>
                  </div>
                </div>
              ) : matchPanelTab === "odds" ? (
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[22px] border border-[#111]/10 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Community lean</p>
                    <div className="mt-4 space-y-3">
                      {[
                        { label: "Home edge", pct: 44 },
                        { label: "Balanced", pct: 31 },
                        { label: "Away edge", pct: 25 },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                            <span>{item.label}</span>
                            <span>{item.pct}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#d8dde4]">
                            <div className="h-full rounded-full bg-[#3557ff]" style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[11px] leading-5 text-gray-500">
                      These percentages summarize community calls. They are not betting odds and have no monetary value.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-[#111]/10 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">How to read the pulse</p>
                    <h3 className="mt-3 text-xl font-black text-[#111]">Context matters more than consensus</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      Community percentages show what supporters expect. Check form, injuries, line-ups and Mchambuzi analysis before making a call. MTC is a non-cash status point.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[22px] border border-[#111]/10 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">{selectedFixture?.home || "Home"} lineup</p>
                    <div className="mt-3 text-sm font-black text-[#111]">{homeLineup?.formation || "4-3-3"}</div>
                    <div className="mt-3 space-y-2">
                      {homeLineup?.players?.length ? homeLineup.players.slice(0, 6).map((player) => (
                        <div key={`${player.number}-${player.name}`} className="flex items-center justify-between rounded-xl border border-[#111]/10 bg-[#f5f7fa] px-3 py-2 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#111]">{player.name}</p>
                            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">{player.pos}</p>
                          </div>
                          <span className="font-black text-[#3557ff]">{player.number}</span>
                        </div>
                      )) : <div className="rounded-xl border border-dashed border-[#111]/15 bg-[#f5f7fa] p-4 text-sm text-gray-500">Home lineup not published yet.</div>}
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-[#111]/10 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">{selectedFixture?.away || "Away"} lineup</p>
                    <div className="mt-3 text-sm font-black text-[#111]">{awayLineup?.formation || "4-3-3"}</div>
                    <div className="mt-3 space-y-2">
                      {awayLineup?.players?.length ? awayLineup.players.slice(0, 6).map((player) => (
                        <div key={`${player.number}-${player.name}`} className="flex items-center justify-between rounded-xl border border-[#111]/10 bg-[#f5f7fa] px-3 py-2 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#111]">{player.name}</p>
                            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500">{player.pos}</p>
                          </div>
                          <span className="font-black text-[#3557ff]">{player.number}</span>
                        </div>
                      )) : <div className="rounded-xl border border-dashed border-[#111]/15 bg-[#f5f7fa] p-4 text-sm text-gray-500">Away lineup not published yet.</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
        <section className="mb-6 border-y border-white/10 bg-[#0d0f14] px-4 py-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#FFD700]">Community snapshot</p>
              <h2 className="mt-1 text-lg font-black uppercase text-white">Calls, receipts and non-cash status</h2>
            </div>
            <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-white/45 hover:text-white">How MTC works</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {communitySignals.map((signal) => (
              <div key={signal.label} className="border-l border-white/15 px-3 py-1">
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/34">{signal.label}</div>
                <div className="mt-1 text-xl font-black text-white">{signal.value}</div>
                <div className="mt-1 text-[10px] text-white/30">{signal.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TAB NAVIGATION */}

        <div className="mb-8 overflow-x-auto hide-scrollbar">
          <div className="mx-auto flex w-max bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-xl">
            <button 
              onClick={() => setActiveTab("make")} 
              className={`px-6 md:px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                activeTab === "make" 
                  ? "text-white bg-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Make a Call
              {activeTab === "make" && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-primary rounded-t-full shadow-[0_0_8px_#B30000]" />}
            </button>
            <button 
              onClick={() => setActiveTab("my")} 
              className={`px-6 md:px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                activeTab === "my" 
                  ? "text-white bg-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              My Receipts
              {activeTab === "my" && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#FFD700] rounded-t-full shadow-[0_0_8px_#FFD700]" />}
            </button>
            <button
              onClick={() => setActiveTab("wc26")}
              className={`px-6 md:px-10 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
                activeTab === "wc26"
                  ? "text-black bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                  : "text-[#FFD700]/70 hover:text-[#FFD700] hover:bg-[#FFD700]/5"
              }`}
            >
              World Cup archive
              {activeTab === "wc26" && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#FFD700] rounded-t-full shadow-[0_0_8px_#FFD700]" />}
            </button>
          </div>
        </div>

        {activeTab === "make" ? (
          <div className="space-y-5">

            {/* WC26 Winner card */}
            <div className="overflow-hidden rounded-2xl border border-[#FFD700]/25 bg-gradient-to-br from-[#110d00] to-[#09080d]">
              <div className="flex items-center gap-3 border-b border-[#FFD700]/12 px-4 py-3">
                <Trophy className="h-4 w-4 text-[#FFD700]" />
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#FFD700]">World Cup 2026 archive pick</div>
                  <div className="text-[9px] text-white/30 font-semibold">
                    {wc26PicksClosed ? "The tournament has ended. Saved picks remain available as archive receipts." : "The tournament archive preserves calls made before kickoff."}
                  </div>
                </div>
                {wc26Saved
                  ? <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-green-400"><CheckCircle2 className="h-3.5 w-3.5" /> Locked</span>
                  : wc26PicksClosed && <span className="ml-auto text-[10px] font-black text-white/25 uppercase tracking-widest">Closed</span>
                }
              </div>
              <div className="p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {WC26_NATIONS.map(n => (
                    <button key={n} onClick={() => { if (!wc26Saved && !wc26PicksClosed) setWc26Pick(n); }}
                      className={`rounded-lg border px-3 py-1.5 text-[11px] font-black uppercase transition-all ${wc26Pick === n ? "border-[#FFD700]/60 bg-[#FFD700]/15 text-[#FFD700]" : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/25 hover:text-white"} ${(wc26Saved || wc26PicksClosed) ? "pointer-events-none" : ""}`}>
                      {n}
                    </button>
                  ))}
                </div>
                {!wc26PicksClosed && (
                  <button onClick={handleWC26Winner}
                    disabled={!wc26Pick || wc26Saved || wc26Saving}
                    className="flex items-center gap-2 rounded-xl bg-[#FFD700] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,214,0,0.3)] disabled:opacity-40 disabled:shadow-none transition-all hover:shadow-[0_0_30px_rgba(255,214,0,0.5)]">
                    {wc26Saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    {wc26Saved ? `${wc26Pick} locked in` : isLoggedIn ? "Lock In Pick" : "Log In to Pick"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setLeagueFilter("all")}
                className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${leagueFilter === "all" ? "bg-white/10 border-white/30 text-white" : "bg-black border-white/10 text-gray-500"}`}
              >
                All Leagues
              </button>
              {availableLeagues.map((league) => (
                <button
                  key={league}
                  onClick={() => setLeagueFilter(league)}
                  className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest border whitespace-nowrap ${leagueFilter === league ? "bg-white/10 border-white/30 text-white" : "bg-black border-white/10 text-gray-500"}`}
                >
                  {league}
                </button>
              ))}
            </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {visibleFixtures.map((fixture: any, idx: number) => {
              const isSaved = predictions[fixture.id]?.saved;
              const hScore = predictions[fixture.id]?.home || "";
              const aScore = predictions[fixture.id]?.away || "";

              return (
                <div key={fixture.id} className="contents">
                  <div 
                  className={`bg-[#111] rounded-xl border p-3 md:p-4 shadow-2xl relative overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in ${
                    isSaved ? 'border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]' : 'border-white/5 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]'
                  }`}
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[${fixture.homeColor || '#B30000'}]/10 via-transparent to-[${fixture.awayColor || '#1E6FFF'}]/10 opacity-30 pointer-events-none`} />
                  
                  {isSaved && (
                    <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 px-4 py-1.5 rounded-bl-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-1.5 border-b border-l border-green-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                      <CheckCircle2 className="w-3.5 h-3.5 drop-shadow-md" /> Locked In
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{fixture.league}</span>
                    </div>
                    <span className="text-gray-500 text-[10px] md:text-xs font-bold bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-wider">{fixture.date} â€¢ {fixture.time}</span>
                  </div>

                  <div className="flex items-center justify-between mb-5 relative z-10">
                    <div className="flex flex-col items-center gap-2 w-1/3 group">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl scale-150 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <TeamLogo logo={fixture.homeLogo} initial={fixture.homeInitial} color={fixture.homeColor} size="xl" shadow />
                      </div>
                      <span className="font-black text-[11px] md:text-sm text-center uppercase tracking-widest text-white drop-shadow-md truncate w-full">{fixture.home}</span>
                    </div>

                    {/* SCOREBOARDS */}
                    <div className="flex items-center gap-2 md:gap-4 bg-black/40 p-2.5 rounded-2xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.03)] backdrop-blur-sm">
                      <input
                        type="text"
                        maxLength={2}
                        value={hScore}
                        onChange={(e) => handleScoreChange(fixture.id, 'home', e.target.value)}
                        disabled={isSaved || isSubmitting === fixture.id}
                        className={`w-12 h-12 md:w-14 md:h-14 bg-black border-2 rounded-xl text-center text-2xl md:text-3xl font-black text-white focus:outline-none disabled:opacity-50 transition-all ${
                          hScore ? `border-[${fixture.homeColor || '#B30000'}]/50 shadow-[0_0_15px_${fixture.homeColor || '#B30000'}40]` : 'border-white/5 focus:border-[#FFD700]/50'
                        }`}
                        placeholder="-"
                      />
                      <span className="text-gray-600 font-black text-xl md:text-2xl">-</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={aScore}
                        onChange={(e) => handleScoreChange(fixture.id, 'away', e.target.value)}
                        disabled={isSaved || isSubmitting === fixture.id}
                        className={`w-12 h-12 md:w-14 md:h-14 bg-black border-2 rounded-xl text-center text-2xl md:text-3xl font-black text-white focus:outline-none disabled:opacity-50 transition-all ${
                          aScore ? `border-[${fixture.awayColor || '#1E6FFF'}]/50 shadow-[0_0_15px_${fixture.awayColor || '#1E6FFF'}40]` : 'border-white/5 focus:border-[#FFD700]/50'
                        }`}
                        placeholder="-"
                      />
                    </div>

                    <div className="flex flex-col items-center gap-2 w-1/3 group">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl scale-150 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <TeamLogo logo={fixture.awayLogo} initial={fixture.awayInitial} color={fixture.awayColor} size="xl" shadow />
                      </div>
                      <span className="font-black text-[11px] md:text-sm text-center uppercase tracking-widest text-white drop-shadow-md truncate w-full">{fixture.away}</span>
                    </div>
                  </div>

                  {!isSaved && (
                    <div className="mb-3 flex flex-wrap gap-1.5 relative z-10">
                      {["1-0", "2-1", "1-1", "2-0", "0-0"].map((score) => (
                        <button
                          key={score}
                          onClick={() => applyQuickScore(fixture.id, score)}
                          className="px-2 py-1 text-[9px] font-black uppercase tracking-widest border border-white/10 bg-black/40 text-gray-300 hover:text-white hover:border-[#FFD700]/40"
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  )}

                  {isSaved ? (
                    <>
                      <div className="flex gap-2 relative z-10">
                        <button
                          onClick={() => setPredictions({...predictions, [fixture.id]: { ...predictions[fixture.id], saved: false }})}
                          className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] py-3 rounded-xl transition-all"
                        >
                          Edit Call
                        </button>
                        <button
                          onClick={() => {
                            const text = `âš½ I called ${fixture.home} ${hScore}â€“${aScore} ${fixture.away} on BallMtaani.\n\nReceipt locked. Make your call â†’ https://ballmtaani.com/predictions`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                            analytics.shareWhatsapp("prediction");
                          }}
                          className="flex items-center gap-1.5 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] font-black uppercase tracking-widest text-[9px] px-3 py-3 rounded-xl transition-all"
                          title="Share to WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span className="hidden sm:inline">Share</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handlePredict(fixture.id)}
                      disabled={(hScore === "" || aScore === "") || isSubmitting === fixture.id}
                      className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-500 text-black font-black uppercase tracking-[0.2em] text-[10px] py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:shadow-none relative z-10"
                    >
                      {isSubmitting === fixture.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isLoggedIn ? "Lock In Call" : "Log In to Call It"}
                    </button>
                  )}
                </div>
                </div>
              );
            })}
          </div>
          </div>
      ) : activeTab === "my" ? (
        <div className="space-y-6">
          {!isLoggedIn ? (
            <div className="bg-[#1B1B1B] border border-white/10 rounded-xl p-8 text-center max-w-xl mx-auto mt-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-black">?</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest mb-2">Login Required</h2>
              <p className="text-gray-400 mb-6">You need an account to save calls and keep receipts.</p>
              <button onClick={() => { sessionStorage.setItem("auth_return_url", window.location.pathname); setLocation('/login'); }} className="bg-primary hover:bg-red-800 text-white font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors">
                Log In / Sign Up
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {loadingReceipts ? (
                <div className="text-center py-8 text-gray-500 font-black uppercase tracking-widest text-xs">Loading receipts...</div>
              ) : myReceipts.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-xl p-8 text-center">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No receipts yet</p>
                  <p className="text-gray-600 text-xs mt-2 font-bold uppercase tracking-wider">Make calls in the Make a Call tab to build your receipt book.</p>
                </div>
              ) : myReceipts.map((item: any, i: number) => {
                const status = String(item.result || "pending").toLowerCase();
                const color = status === "correct" ? "green" : status === "partial" ? "yellow" : status === "pending" ? "yellow" : "red";
                const hex = color === "green" ? "#22c55e" : color === "yellow" ? "#eab308" : "#ef4444";
                const statusLabel = status === "correct" ? "PERFECT RECEIPT" : status === "partial" ? "RIGHT RESULT" : status === "pending" ? "PENDING" : "MISSED";
                const points = `+${item.coins_awarded || 0} MTC`;
                const matchLabel = fixtureLabelMap[String(item.match_id)] || String(item.match_id || "Fixture");
                const created = item.created_at ? new Date(item.created_at).toLocaleDateString("en-KE", { weekday: "short" }) : "Recent";
                return (
                <div 
                  key={i} 
                  className={`bg-[#111] border border-white/5 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group animate-in slide-in-from-bottom-4 fade-in duration-500 hover:border-[${item.hex}]/30 transition-all`}
                  style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 bg-${color}-500 shadow-[0_0_15px_${hex}]`} />
                  <div className={`absolute -right-20 -top-20 w-64 h-64 bg-${color}-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-${color}-500/10 transition-colors duration-500`} />

                  <div className="flex items-center gap-4 w-full md:w-auto z-10">
                    <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-white/10 flex items-center justify-center relative z-10 shadow-lg text-[9px] font-black uppercase tracking-widest">
                      ID
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] block mb-1.5 flex items-center gap-2">
                        Prediction <span className="w-1 h-1 rounded-full bg-gray-600"></span> {created}
                      </span>
                      <div className="font-black text-sm text-white tracking-widest">{matchLabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto bg-black/60 p-3 rounded-xl border border-white/5 backdrop-blur-sm z-10 justify-center">
                    <div className="text-center">
                      <span className="block text-[10px] text-gray-500 uppercase font-black tracking-[0.1em] mb-1">Your Call</span>
                      <span className="font-black text-xl text-white">{item.predicted_score || "-"}</span>
                    </div>
                    <div className="w-px h-10 bg-white/10 mx-2"></div>
                    <div className="text-center">
                      <span className="block text-[10px] text-gray-500 uppercase font-black tracking-[0.1em] mb-1">Actual</span>
                      <span className="font-black text-xl text-white">{item.actual_score || "-"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 z-10 w-full md:w-40 shrink-0">
                    <div className={`w-full flex flex-col items-center justify-center p-3 rounded-xl border ${
                      color === "green" ? "bg-green-500/10 border-green-500/30" :
                      color === "yellow" ? "bg-yellow-500/10 border-yellow-500/30" :
                      "bg-red-500/10 border-red-500/30"
                    }`}>
                      <span className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${
                        color === "green" ? "text-green-400" : color === "yellow" ? "text-yellow-400" : "text-red-400"
                      }`}>{statusLabel}</span>
                      <span className={`text-base font-black ${
                        color === "green" ? "text-green-400" : color === "yellow" ? "text-yellow-400" : "text-red-400"
                      }`}>{points}</span>
                    </div>
                    {/* WhatsApp share */}
                    <button onClick={() => shareReceipt(item)}
                      className="w-full rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 py-2 text-[10px] font-black uppercase tracking-widest text-[#25D366] transition-all hover:bg-[#25D366]/20">
                      Share WA
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      ) : activeTab === "wc26" ? (
        // â”€â”€ WC26 TOURNAMENT PREDICTION TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Live banner â€” only shown while WC26 is on */}
          {wc26PicksClosed && (
            <div className="flex items-center justify-between rounded-2xl border border-[#B30000]/30 bg-[#B30000]/8 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#B30000]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#B30000]">World Cup 2026 archive</span>
                <span className="text-[10px] text-white/35">· Saved tournament receipts</span>
              </div>
              <button onClick={() => setActiveTab("make")}
                className="flex items-center gap-1 rounded-lg bg-[#B30000]/20 border border-[#B30000]/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#B30000] hover:bg-[#B30000]/30 transition-all">
                Call It <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="rounded-2xl border border-[#FFD700]/25 bg-gradient-to-br from-[#110d00] to-[#09080d] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-[#FFD700]">World Cup archive calls</h2>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {Object.keys(wc26Saved2).filter(k => wc26Saved2[k]).length}/{WC26_QUESTIONS.length} calls locked ·{" "}
                  {WC26_QUESTIONS.filter(q => wc26Saved2[q.id]).reduce((s, q) => s + q.mtc, 0).toLocaleString()} archived MTC points
                </p>
              </div>
              {Object.keys(wc26Saved2).some(k => wc26Saved2[k]) && (
                <button onClick={() => setShowBracketCard(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#FFD700]/12 border border-[#FFD700]/25 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:bg-[#FFD700]/22 transition-all">
                  <Share2 className="h-3.5 w-3.5" /> Share Card
                </button>
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[#FFD700] transition-all duration-500"
                style={{ width: `${(Object.keys(wc26Saved2).filter(k => wc26Saved2[k]).length / WC26_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question cards */}
          {WC26_QUESTIONS.map((q) => {
            const picked = wc26Picks[q.id];
            const saved  = wc26Saved2[q.id];
            const saving = wc26Saving2 === q.id;
            const locked = saved || wc26PicksClosed;
            return (
              <div key={q.id} className={`overflow-hidden rounded-2xl border transition-all ${
                saved ? "border-[#FFD700]/35 bg-[#0c0a00]/95" : "border-white/8 bg-[#0d0f14]/95"
              }`}>
                <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{q.emoji}</span>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-white">{q.title}</div>
                      <div className="text-[10px] text-white/35">{q.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black ${saved ? "text-[#FFD700]" : "text-white/30"}`}>
                      +{q.mtc.toLocaleString()} MTC
                    </span>
                    {saved
                      ? <CheckCircle2 className="h-4 w-4 text-[#FFD700]" />
                      : wc26PicksClosed && <span className="text-[10px] font-black text-white/20 uppercase">Closed</span>
                    }
                  </div>
                </div>

                <div className="p-4">
                  {locked ? (
                    // Locked state â€” full ranked breakdown of all options
                    (() => {
                      const qCounts = wc26Consensus[q.id] || {};
                      const total = Object.values(qCounts).reduce((s: number, n) => s + (n as number), 0);
                      const ranked = q.options
                        .map(opt => ({ opt, count: (qCounts[opt] as number) || 0 }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 7);
                      const leadOpt = ranked[0];
                      return (
                        <div className="space-y-1.5">
                          {picked && (
                            <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#FFD700]/25 bg-[#FFD700]/8 px-3 py-2">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#FFD700]" />
                              <span className="text-[11px] font-black text-[#FFD700]">Your pick: {picked}</span>
                              <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-[#FFD700]/50">Locked</span>
                            </div>
                          )}
                          {!picked && (
                            <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2">
                              <span className="text-[11px] italic text-white/25">No pick made</span>
                              <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-white/15">Window closed</span>
                            </div>
                          )}
                          {ranked.map(({ opt, count }) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            const isMyPick = opt === picked;
                            const isLead = leadOpt && opt === leadOpt.opt && count > 0;
                            return (
                              <div key={opt} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${isMyPick ? "bg-[#FFD700]/8 border border-[#FFD700]/20" : "border border-transparent"}`}>
                                <span className={`w-24 shrink-0 truncate text-[11px] font-bold ${isMyPick ? "text-[#FFD700]" : "text-white/55"}`}>
                                  {opt}
                                  {isLead && !isMyPick && <span className="ml-1 text-[8px] font-black uppercase text-white/25"> â–²</span>}
                                </span>
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/6">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${isMyPick ? "bg-[#FFD700]" : isLead ? "bg-white/30" : "bg-white/14"}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className={`w-8 shrink-0 text-right text-[10px] tabular-nums font-bold ${isMyPick ? "text-[#FFD700]" : "text-white/30"}`}>{pct}%</span>
                              </div>
                            );
                          })}
                          <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-white/20">
                            <Users className="h-3 w-3" />
                            {total > 0 ? `${total.toLocaleString()} fans voted` : "No votes yet"}
                            {leadOpt && leadOpt.count > 0 && (
                              <span className="ml-auto">Mtaa backing: <span className="text-white/40 font-black">{leadOpt.opt}</span></span>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    // Pick buttons â€” only shown pre-WC26
                    <div className="flex flex-wrap gap-2">
                      {q.options.map(opt => (
                        <button key={opt}
                          onClick={() => handleWC26Pick(q.id, opt)}
                          disabled={saving}
                          className={`rounded-lg border px-3 py-1.5 text-[11px] font-black uppercase transition-all disabled:opacity-50 ${
                            picked === opt && !saved
                              ? "border-[#FFD700]/60 bg-[#FFD700]/15 text-[#FFD700]"
                              : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/25 hover:text-white"
                          }`}>
                          {saving && picked === opt
                            ? <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />{opt}</span>
                            : opt
                          }
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* All done state */}
          {WC26_QUESTIONS.every(q => wc26Saved2[q.id]) && (
            <div className="overflow-hidden rounded-2xl border border-[#FFD700]/35 bg-gradient-to-br from-[#110d00] to-[#09080d] p-6 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-black text-[#FFD700] uppercase tracking-widest mb-2">All 6 calls locked.</h3>
              <p className="text-sm text-white/45 mb-5">
                {wc26PicksClosed
                  ? `The tournament has ended — your saved calls remain in the archive. ${WC26_QUESTIONS.reduce((s, q) => s + q.mtc, 0).toLocaleString()} archived MTC points.`
                  : `Come back after June 11 for your receipts. ${WC26_QUESTIONS.reduce((s, q) => s + q.mtc, 0).toLocaleString()} archived MTC points.`
                }
              </p>
              <button onClick={() => setShowBracketCard(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFD700] px-6 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,215,0,0.35)] transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.55)]">
                <Share2 className="h-4 w-4" /> Share My Bracket
              </button>
            </div>
          )}

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/20 pb-2">
            {wc26PicksClosed ? "World Cup 2026 archive · Tournament picks closed · Historical receipts" : "Closes at WC26 kickoff · Jun 11, 2026 · 10pm EAT"}
          </p>

        </div>
      ) : (
        <div className="py-10 text-center text-white/20 text-sm">Nothing here yet.</div>
      )}
      </div>
    </div>
  );
}





