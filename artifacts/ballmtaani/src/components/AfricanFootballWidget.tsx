/**
 * AfricanFootballWidget
 *
 * Shows African football content relevant to Kenyan fans:
 * - WC26 African nation fixtures (live now, in-season)
 * - Fan following stats pulled from predictions table
 * - KPL off-season bridge ("KPL returns September 2026")
 *
 * Placed on HomePage and /matches as the "Local Heroes" section.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, ChevronRight, Star, Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";

// 9 CAF nations at WC26
const CAF_AT_WC26 = [
  {
    flag: "🇲🇦", name: "Morocco", group: "D",
    fixture: "vs Argentina", date: "Jun 14", time: "10 PM",
    note: "Qatar semi-finalists. Africa's best shot.",
    color: "border-red-500/30 bg-red-500/5",
    accent: "text-red-400",
  },
  {
    flag: "🇸🇳", name: "Senegal", group: "H",
    fixture: "vs Portugal", date: "Jun 17", time: "7 PM",
    note: "AFCON champions. Sadio Mane's last tournament?",
    color: "border-green-500/30 bg-green-500/5",
    accent: "text-green-400",
  },
  {
    flag: "🇳🇬", name: "Nigeria", group: "F",
    fixture: "vs Netherlands", date: "Jun 15", time: "4 PM",
    note: "Super Eagles with a point to prove.",
    color: "border-emerald-500/30 bg-emerald-500/5",
    accent: "text-emerald-400",
  },
  {
    flag: "🇿🇦", name: "South Africa", group: "A",
    fixture: "vs Mexico", date: "Jun 11", time: "10 PM",
    note: "Opening match. First WC since 2010.",
    color: "border-yellow-500/30 bg-yellow-500/5",
    accent: "text-yellow-400",
  },
  {
    flag: "🇪🇬", name: "Egypt", group: "D",
    fixture: "vs Uruguay", date: "Jun 15", time: "1 AM",
    note: "Salah's farewell? Egypt's biggest stage.",
    color: "border-orange-500/30 bg-orange-500/5",
    accent: "text-orange-400",
  },
  {
    flag: "🇨🇲", name: "Cameroon", group: "F",
    fixture: "vs Sweden", date: "Jun 16", time: "10 PM",
    note: "Indomitable Lions hunting upset glory.",
    color: "border-amber-500/30 bg-amber-500/5",
    accent: "text-amber-400",
  },
  {
    flag: "🇬🇭", name: "Ghana", group: "G",
    fixture: "vs Italy", date: "Jun 16", time: "7 PM",
    note: "Black Stars eyeing redemption from Qatar.",
    color: "border-yellow-400/30 bg-yellow-400/5",
    accent: "text-yellow-300",
  },
  {
    flag: "🇩🇿", name: "Algeria", group: "C",
    fixture: "vs Japan", date: "Jun 15", time: "1 PM",
    note: "Unbeaten in qualifying. Strong tactical unit.",
    color: "border-white/20 bg-white/3",
    accent: "text-white/60",
  },
  {
    flag: "🇹🇳", name: "Tunisia", group: "B",
    fixture: "vs Spain", date: "Jun 14", time: "4 PM",
    note: "Eagles of Carthage vs European giants.",
    color: "border-red-400/20 bg-red-400/3",
    accent: "text-red-300",
  },
];

const KPL_TEAMS = [
  { name: "Gor Mahia", flag: "🟢", nickname: "K'Ogalo" },
  { name: "AFC Leopards", flag: "🔵", nickname: "Ingwe" },
  { name: "Tusker FC", flag: "🐘", nickname: "The Brewers" },
  { name: "Bandari FC", flag: "⚓", nickname: "The Dockers" },
  { name: "Kakamega Homeboyz", flag: "🏠", nickname: "Homeboyz" },
  { name: "Nairobi City Stars", flag: "⭐", nickname: "City Stars" },
];

interface Props {
  compact?: boolean; // compact = homepage widget, false = full section on /matches
}

export default function AfricanFootballWidget({ compact = false }: Props) {
  const [africaFans, setAfricaFans] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [activeTab, setActiveTab] = useState<"wc26" | "kpl">("wc26");

  useEffect(() => {
    if (!supabase) return;
    // Pull "wc26-africa" question picks to show who Kenyans are backing
    void Promise.resolve(
      supabase
        .from("predictions")
        .select("predicted_score")
        .eq("match_id", "wc26-africa")
        .then(({ data, error }) => {
          if (error || !data) return;
          const counts: Record<string, number> = {};
          data.forEach((row: any) => {
            const pick = row.predicted_score || "Unknown";
            counts[pick] = (counts[pick] || 0) + 1;
          });
          setAfricaFans(counts);
          setTotalVotes(data.length);
        })
    ).catch(() => {});
  }, []);

  const topAfricaPick = Object.entries(africaFans).sort(([, a], [, b]) => b - a)[0]?.[0];

  if (compact) {
    // ── Compact homepage version ──────────────────────────────────
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0b1119]/88 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3.5">
          <div>
            <h2 className="text-base font-bold uppercase text-white">African Lions at WC26</h2>
            <p className="text-[10px] text-white/40">9 CAF nations. All with something to prove.</p>
          </div>
          {totalVotes > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5">
              <Star className="h-3 w-3 text-orange-400" />
              <span className="text-[10px] font-bold text-orange-300">{topAfricaPick || "?"} favoured</span>
            </div>
          )}
        </div>

        {/* 3-column compact grid */}
        <div className="grid grid-cols-3 divide-x divide-white/6">
          {CAF_AT_WC26.slice(0, 3).map((nation) => (
            <div key={nation.name} className="p-3 text-center">
              <div className="text-2xl mb-1">{nation.flag}</div>
              <div className="text-xs font-bold text-white">{nation.name}</div>
              <div className="text-[9px] text-white/40">Group {nation.group}</div>
              <div className={`mt-1 text-[9px] font-bold ${nation.accent}`}>{nation.fixture}</div>
              <div className="text-[9px] text-white/30">{nation.date}</div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-white/8 px-4 py-3 flex items-center justify-between">
          <span className="text-[10px] text-white/35">+ 6 more African nations</span>
          <Link href="/matches?tab=africa" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-red-300 transition-colors">
            All CAF fixtures <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Full /matches version ────────────────────────────────────────
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1119]/88 overflow-hidden">
      {/* Hero image banner */}
      <div className="relative h-36 overflow-hidden">
        <img
          src="https://rkxrkpahrrgzlnxqxolu.supabase.co/storage/v1/object/public/ballmtaani-images/African_fans_celebration_stadium.jpeg"
          alt="African football fans"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1119] via-[#0b1119]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1119]/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-orange-400/80 mb-0.5">WC26 · Africa</p>
          <h2 className="text-xl font-black uppercase text-white leading-none drop-shadow-lg">Local Heroes</h2>
        </div>
        {totalVotes > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-orange-400/25 bg-black/60 backdrop-blur-sm px-3 py-1.5">
            <Star className="h-3 w-3 text-orange-400" />
            <span className="text-[10px] font-bold text-orange-300">{topAfricaPick} favoured</span>
          </div>
        )}
      </div>

      {/* Header + tabs */}
      <div className="border-b border-white/8 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-xs text-white/44">African football for Kenyan fans</p>
          {totalVotes > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5">
              <Star className="h-3 w-3 text-orange-400" />
              <span className="text-[10px] font-bold text-orange-300">
                {totalVotes} fans backing Africa's deepest run
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {(["wc26", "kpl"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "border-primary bg-primary/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
              }`}
            >
              {tab === "wc26" ? "WC26 African Nations" : "KPL"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "wc26" && (
        <div className="p-4">
          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {CAF_AT_WC26.map((nation) => {
              const fanCount = africaFans[nation.name] || 0;
              const fanPct = totalVotes > 0 ? Math.round((fanCount / totalVotes) * 100) : 0;
              return (
                <div key={nation.name} className={`rounded-2xl border p-3.5 ${nation.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{nation.flag}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{nation.name}</div>
                        <div className="text-[10px] text-white/40">Group {nation.group}</div>
                      </div>
                    </div>
                    {fanCount > 0 && (
                      <div className={`text-xs font-black ${nation.accent}`}>{fanPct}%</div>
                    )}
                  </div>

                  <p className="text-[10px] leading-4 text-white/50 mb-2">{nation.note}</p>

                  <div className={`rounded-lg border ${nation.color} px-2.5 py-2`}>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-white/35 mb-0.5">Opening match</div>
                    <div className={`text-[11px] font-bold ${nation.accent}`}>{nation.fixture}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CalendarDays className="h-3 w-3 text-white/30" />
                      <span className="text-[10px] text-white/40">{nation.date} · {nation.time} EAT</span>
                    </div>
                  </div>

                  {fanCount > 0 && (
                    <div className="mt-2">
                      <div className="h-1 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${nation.accent.replace("text-","bg-")}`} style={{ width: `${Math.min(fanPct * 3, 100)}%` }} />
                      </div>
                      <div className="mt-1 text-[9px] text-white/30">{fanCount} Kenyan fan{fanCount !== 1 ? "s" : ""} backing this</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/5 p-4 text-center">
            <p className="text-sm font-bold text-white">Who's Africa's deepest run at WC26?</p>
            <p className="text-xs text-white/40 mt-1">Pick your team. Win MTC coins if you're right.</p>
            <Link
              href="/predictions"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-black hover:bg-yellow-400 transition-colors"
            >
              Make Your Pick <Trophy className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {activeTab === "kpl" && (
        <div className="p-4">
          {/* Off-season banner */}
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-3xl mb-2">⚽</div>
            <div className="text-sm font-bold text-white">KPL Season 2025-26 Complete</div>
            <p className="text-xs text-white/40 mt-1">The next KPL season kicks off September 2026. Come back then for live Harambee Stars club action.</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
              <CalendarDays className="h-3 w-3" />
              KPL returns September 2026
            </div>
          </div>

          {/* KPL clubs */}
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-white/35">Top KPL Clubs</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {KPL_TEAMS.map((team) => (
              <div key={team.name} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
                <span className="text-xl">{team.flag}</span>
                <div>
                  <div className="text-xs font-bold text-white">{team.name}</div>
                  <div className="text-[9px] text-white/35">{team.nickname}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bridge to WC26 */}
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-xs font-bold text-white mb-1">While KPL is on break...</div>
            <p className="text-[11px] text-white/50">Follow Africa's 9 nations at WC26. Morocco, Senegal and South Africa are all in with a real chance.</p>
            <button
              onClick={() => setActiveTab("wc26")}
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-red-300 transition-colors"
            >
              See WC26 African fixtures <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
