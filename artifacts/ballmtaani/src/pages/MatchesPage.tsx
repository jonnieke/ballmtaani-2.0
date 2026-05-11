import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Activity, CalendarDays, Table2, Timer, Pin, ChevronDown, ChevronUp, Circle, Square, ArrowLeftRight, RotateCw } from "lucide-react";
import { useMatches, useRecentMatches, useUpcomingFixtures, useStandings } from "../hooks/useData";
import TeamLogo from "../components/TeamLogo";
import AdBanner from "../components/AdBanner";
import SEO from "../components/SEO";
import { fetchFixtureEvents, fetchLiveEventSummary, type FixtureEvent, type LiveEventSummary } from "../lib/football-api";
import { useAuth } from "../context/AuthContext";

type ViewMode = "live" | "fixtures" | "results" | "standings";
type FixtureWindow = "all" | "today" | "tomorrow";
type LiveSort = "minute" | "league" | "events";

const TOP_LEAGUES = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-white/10 bg-[#111] p-8 text-center text-xs font-black uppercase tracking-widest text-gray-400">
      {message}
    </div>
  );
}

export default function MatchesPage() {
  const [mode, setMode] = useState<ViewMode>("live");
  const [selectedLeague, setSelectedLeague] = useState("Premier League");
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>("all");
  const [liveOnly, setLiveOnly] = useState(true);
  const [autoRefreshLive, setAutoRefreshLive] = useState(true);
  const [liveRefreshTick, setLiveRefreshTick] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [fixtureWindow, setFixtureWindow] = useState<FixtureWindow>("all");
  const [liveSort, setLiveSort] = useState<LiveSort>("minute");
  const [eventSummaryMap, setEventSummaryMap] = useState<Record<string, LiveEventSummary>>({});
  const [eventSummaryFetchedAtMap, setEventSummaryFetchedAtMap] = useState<Record<string, number>>({});
  const [eventTimelineMap, setEventTimelineMap] = useState<Record<string, FixtureEvent[]>>({});
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [visibleLiveIds, setVisibleLiveIds] = useState<string[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [pinnedMatchIds, setPinnedMatchIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("mtaani_pinned_matches");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const { data: liveMatches = [] } = useMatches();
  const { data: recentMatches = [] } = useRecentMatches();
  const { data: upcomingFixtures = [] } = useUpcomingFixtures();
  const { data: standings = {} as Record<string, any[]> } = useStandings();
  const { dbProfile } = useAuth();
  const liveRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const visibleSetRef = useRef<Set<string>>(new Set());

  const followedClub = useMemo(() => {
    const profileClub = String(dbProfile?.favorite_team || dbProfile?.favorite_club || "").trim();
    const pendingClub = typeof window !== "undefined" ? (sessionStorage.getItem("mtaani_pending_club") || "").trim() : "";
    return (profileClub || pendingClub).toLowerCase();
  }, [dbProfile]);

  const groupedUpcoming = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const fixture of upcomingFixtures) {
      const key = fixture.date || "Upcoming";
      if (!groups[key]) groups[key] = [];
      groups[key].push(fixture);
    }
    return groups;
  }, [upcomingFixtures]);

  const groupedRecent = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const result of recentMatches) {
      const key = result.date || "Recent";
      if (!groups[key]) groups[key] = [];
      groups[key].push(result);
    }
    return groups;
  }, [recentMatches]);

  const selectedStandings = standings[selectedLeague] || [];
  const availableLeagues = useMemo(
    () => Array.from(new Set([...liveMatches.map((m: any) => m.league), ...upcomingFixtures.map((f: any) => f.league), ...recentMatches.map((r: any) => r.league)])).filter(Boolean),
    [liveMatches, upcomingFixtures, recentMatches]
  );

  const filteredLive = useMemo(() => {
    const base = liveMatches.filter(
      (m: any) => (selectedLeagueFilter === "all" || m.league === selectedLeagueFilter) && (!liveOnly || (m.status && m.status !== "NS"))
    );

    const eventTotal = (id: string) => {
      const summary = eventSummaryMap[id];
      if (!summary) return -1;
      return summary.goals + summary.cards + summary.reds + summary.subs;
    };

    const minuteValue = (value: string) => {
      const parsed = parseInt((value || "").replace("'", ""), 10);
      return Number.isNaN(parsed) ? -1 : parsed;
    };

    const sorted = [...base].sort((a: any, b: any) => {
      const aPinned = pinnedMatchIds.includes(String(a.id));
      const bPinned = pinnedMatchIds.includes(String(b.id));
      if (aPinned !== bPinned) return aPinned ? -1 : 1;

      const aFollowed = followedClub && (String(a.home).toLowerCase().includes(followedClub) || String(a.away).toLowerCase().includes(followedClub));
      const bFollowed = followedClub && (String(b.home).toLowerCase().includes(followedClub) || String(b.away).toLowerCase().includes(followedClub));
      if (aFollowed !== bFollowed) return aFollowed ? -1 : 1;

      if (liveSort === "league") return String(a.league).localeCompare(String(b.league));
      if (liveSort === "events") return eventTotal(String(b.id)) - eventTotal(String(a.id));
      return minuteValue(String(b.minute)) - minuteValue(String(a.minute));
    });
    return sorted;
  }, [liveMatches, selectedLeagueFilter, liveOnly, liveSort, eventSummaryMap, pinnedMatchIds, followedClub]);

  const filteredUpcoming = useMemo(() => {
    return upcomingFixtures.filter((f: any) => {
      if (selectedLeagueFilter !== "all" && f.league !== selectedLeagueFilter) return false;
      if (fixtureWindow === "today") return f.date === "Today" || f.date === "Upcoming";
      if (fixtureWindow === "tomorrow") return f.date === "Tomorrow";
      return true;
    });
  }, [upcomingFixtures, selectedLeagueFilter, fixtureWindow]);

  const filteredRecent = useMemo(() => {
    return recentMatches.filter((r: any) => selectedLeagueFilter === "all" || r.league === selectedLeagueFilter);
  }, [recentMatches, selectedLeagueFilter]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const targetIds = visibleLiveIds.length > 0
        ? visibleLiveIds
        : filteredLive.slice(0, 8).map((m: any) => String(m.id));
      const targetLive = filteredLive.filter((m: any) => targetIds.includes(String(m.id)));
      const updates: Record<string, LiveEventSummary> = {};
      const fetchedAtUpdates: Record<string, number> = {};
      await Promise.all(
        targetLive.map(async (m: any) => {
          try {
            updates[m.id] = await fetchLiveEventSummary(String(m.id));
            fetchedAtUpdates[m.id] = Date.now();
          } catch {
            updates[m.id] = { goals: 0, cards: 0, reds: 0, subs: 0 };
            fetchedAtUpdates[m.id] = Date.now();
          }
        })
      );
      if (!cancelled) {
        setEventSummaryMap((prev) => ({ ...prev, ...updates }));
        setEventSummaryFetchedAtMap((prev) => ({ ...prev, ...fetchedAtUpdates }));
      }
    };
    if (mode === "live" && filteredLive.length > 0) run();
    return () => {
      cancelled = true;
    };
  }, [mode, filteredLive, visibleLiveIds, liveRefreshTick]);

  useEffect(() => {
    if (mode !== "live") return;
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const row = entry.target as HTMLTableRowElement;
          const fixtureId = row.dataset.fixtureId;
          if (!fixtureId) continue;
          if (entry.isIntersecting) {
            if (!visibleSetRef.current.has(fixtureId)) {
              visibleSetRef.current.add(fixtureId);
              changed = true;
            }
          } else if (visibleSetRef.current.delete(fixtureId)) {
            changed = true;
          }
        }
        if (changed) {
          setVisibleLiveIds(Array.from(visibleSetRef.current));
        }
      },
      { threshold: 0.15 }
    );

    visibleSetRef.current.clear();
    setVisibleLiveIds([]);
    filteredLive.forEach((m: any) => {
      const id = String(m.id);
      const el = liveRowRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mode, filteredLive]);

  const setLiveRowRef = (fixtureId: string, node: HTMLTableRowElement | null) => {
    liveRowRefs.current[fixtureId] = node;
  };

  const refreshLiveNow = (source: "manual" | "auto" = "manual") => {
    if (source === "manual") {
      setIsManualRefreshing(true);
      window.setTimeout(() => setIsManualRefreshing(false), 700);
    }
    setLastUpdatedAt(new Date());
    setEventSummaryMap({});
    setEventSummaryFetchedAtMap({});
    setLiveRefreshTick((prev) => prev + 1);
  };

  useEffect(() => {
    if (mode === "live") setLastUpdatedAt(new Date());
  }, [mode, liveMatches]);

  useEffect(() => {
    if (mode !== "live" || !autoRefreshLive) return;
    let timer: number | undefined;

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      refreshLiveNow("auto");
    };

    timer = window.setInterval(tick, 20000);
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [mode, autoRefreshLive]);

  useEffect(() => {
    localStorage.setItem("mtaani_pinned_matches", JSON.stringify(pinnedMatchIds));
  }, [pinnedMatchIds]);

  const togglePinned = (matchId: string) => {
    setPinnedMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [matchId, ...prev].slice(0, 8)
    );
  };

  const toggleExpanded = async (matchId: string) => {
    setExpandedMatchId((prev) => (prev === matchId ? null : matchId));
    if (eventTimelineMap[matchId]) return;

    try {
      const events = await fetchFixtureEvents(matchId);
      setEventTimelineMap((prev) => ({ ...prev, [matchId]: events }));
    } catch {
      setEventTimelineMap((prev) => ({ ...prev, [matchId]: [] }));
    }
  };

  const momentumBars = (summary?: LiveEventSummary) => {
    const total = (summary?.goals || 0) * 3 + (summary?.reds || 0) * 3 + (summary?.cards || 0) + (summary?.subs || 0);
    const level = Math.min(5, Math.max(0, Math.ceil(total / 2)));
    return (
      <div className="inline-flex items-end gap-0.5 h-4">
        {[0, 1, 2, 3, 4].map((idx) => (
          <span
            key={idx}
            className={`w-1 rounded-sm ${idx < level ? "bg-primary" : "bg-white/20"}`}
            style={{ height: `${6 + idx * 2}px` }}
          />
        ))}
      </div>
    );
  };

  const freshnessLabel = (fixtureId: string) => {
    const ts = eventSummaryFetchedAtMap[fixtureId];
    if (!ts) return "syncing";
    const age = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (age <= 5) return "just now";
    if (age < 60) return `${age}s ago`;
    const mins = Math.floor(age / 60);
    return `${mins}m ago`;
  };

  const eventChip = (event: FixtureEvent) => {
    if (event.type === "goal") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-600/20 text-green-400">
          <Circle className="w-2.5 h-2.5 fill-current" /> Goal
        </span>
      );
    }
    if (event.type === "yellow") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400">
          <Square className="w-2.5 h-2.5 fill-current" /> Yellow
        </span>
      );
    }
    if (event.type === "red") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-600/20 text-red-400">
          <Square className="w-2.5 h-2.5 fill-current" /> Red
        </span>
      );
    }
    if (event.type === "sub") {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-600/20 text-blue-400">
          <ArrowLeftRight className="w-2.5 h-2.5" /> Sub
        </span>
      );
    }
    return <span className="inline-flex items-center px-1.5 py-0.5 bg-white/10 text-gray-300">Event</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-10">
      <SEO
        title="Football Data Center | BallMtaani"
        description="Live football results, fixtures, standings, and real-time match data powered by API-Football."
      />

      <div className="mb-5">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest border-l-4 border-primary pl-4">Football Data Center</h1>
        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-4 mt-2">
          Real-time data feed • API-Football
        </p>
      </div>

      <div className="mb-6">
        <AdBanner label="Data Partner" type="horizontal" />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto hide-scrollbar lg:grid lg:grid-cols-4">
        <button
          onClick={() => setMode("live")}
          className={`shrink-0 min-w-[140px] px-3 py-3 border text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${mode === "live" ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-400 hover:text-white"}`}
        >
          <Activity className="w-4 h-4" /> Live
        </button>
        <button
          onClick={() => setMode("fixtures")}
          className={`shrink-0 min-w-[140px] px-3 py-3 border text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${mode === "fixtures" ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-400 hover:text-white"}`}
        >
          <CalendarDays className="w-4 h-4" /> Fixtures
        </button>
        <button
          onClick={() => setMode("results")}
          className={`shrink-0 min-w-[140px] px-3 py-3 border text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${mode === "results" ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-400 hover:text-white"}`}
        >
          <Timer className="w-4 h-4" /> Results
        </button>
        <button
          onClick={() => setMode("standings")}
          className={`shrink-0 min-w-[140px] px-3 py-3 border text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${mode === "standings" ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-400 hover:text-white"}`}
        >
          <Table2 className="w-4 h-4" /> Standings
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-2">
        <select
          value={selectedLeagueFilter}
          onChange={(e) => setSelectedLeagueFilter(e.target.value)}
          className="bg-[#111] border border-white/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-gray-300 focus:outline-none focus:border-primary"
        >
          <option value="all">All Leagues</option>
          {availableLeagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>

        <button
          onClick={() => setLiveOnly((v) => !v)}
          className={`border px-3 py-2 text-xs font-black uppercase tracking-widest ${liveOnly ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-400 hover:text-white"}`}
        >
          {liveOnly ? "Live Only: On" : "Live Only: Off"}
        </button>

        <div className="grid grid-cols-3 border border-white/10 bg-[#111]">
          <button onClick={() => setFixtureWindow("all")} className={`py-2 text-[10px] font-black uppercase tracking-widest ${fixtureWindow === "all" ? "bg-white/10 text-white" : "text-gray-500"}`}>All</button>
          <button onClick={() => setFixtureWindow("today")} className={`py-2 text-[10px] font-black uppercase tracking-widest ${fixtureWindow === "today" ? "bg-white/10 text-white" : "text-gray-500"}`}>Today</button>
          <button onClick={() => setFixtureWindow("tomorrow")} className={`py-2 text-[10px] font-black uppercase tracking-widest ${fixtureWindow === "tomorrow" ? "bg-white/10 text-white" : "text-gray-500"}`}>Tomorrow</button>
        </div>
      </div>

      {mode === "live" && (
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <div className="grid grid-cols-3 border border-white/10 bg-[#111] max-w-[420px]">
              <button onClick={() => setLiveSort("minute")} className={`py-2 px-3 text-[10px] font-black uppercase tracking-widest ${liveSort === "minute" ? "bg-white/10 text-white" : "text-gray-500"}`}>Sort: Minute</button>
              <button onClick={() => setLiveSort("league")} className={`py-2 px-3 text-[10px] font-black uppercase tracking-widest ${liveSort === "league" ? "bg-white/10 text-white" : "text-gray-500"}`}>Sort: League</button>
              <button onClick={() => setLiveSort("events")} className={`py-2 px-3 text-[10px] font-black uppercase tracking-widest ${liveSort === "events" ? "bg-white/10 text-white" : "text-gray-500"}`}>Sort: Events</button>
            </div>
            <button
              onClick={() => setAutoRefreshLive((v) => !v)}
              className={`border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${autoRefreshLive ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-400 hover:text-white"}`}
            >
              Auto Refresh: {autoRefreshLive ? "On" : "Off"}
            </button>
            <button
              onClick={() => refreshLiveNow("manual")}
              disabled={isManualRefreshing}
              className={`inline-flex items-center gap-1.5 border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                isManualRefreshing
                  ? "border-primary bg-primary/20 text-white"
                  : "border-white/10 bg-[#111] text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isManualRefreshing ? "animate-spin" : ""}`} />
              {isManualRefreshing ? "Refreshing..." : "Refresh Now"}
            </button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Last updated: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Africa/Nairobi" }) : "--:--:--"} EAT
          </p>
        </div>
      )}

      {mode === "live" && (
        <>
          {filteredLive.length === 0 ? (
            <EmptyState message="No live matches right now." />
          ) : (
            <>
            <div className="space-y-2 md:hidden">
              {filteredLive.map((m: any) => {
                const matchId = String(m.id);
                const isPinned = pinnedMatchIds.includes(matchId);
                return (
                  <div key={`mobile-${matchId}`} className="border border-white/10 bg-[#111] p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] font-black uppercase tracking-widest text-gray-400">{m.league}</span>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-primary">{m.minute || "LIVE"}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <span className="truncate text-xs font-bold text-white">{m.home}</span>
                      <span className="text-base font-black text-white">{m.homeScore} - {m.awayScore}</span>
                      <span className="truncate text-right text-xs font-bold text-white">{m.away}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => togglePinned(matchId)}
                        className={`inline-flex items-center justify-center border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${isPinned ? "border-primary bg-primary/20 text-primary" : "border-white/10 bg-black/30 text-gray-300"}`}
                      >
                        <Pin className="mr-1 h-3.5 w-3.5" />
                        {isPinned ? "Pinned" : "Pin"}
                      </button>
                      <Link href={`/live-center/${m.id}`} className="inline-block border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/5 hover:text-white">
                        Open
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hidden border border-white/10 bg-[#111] overflow-x-auto md:block">
              <table className="w-full min-w-[980px]">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="text-center p-2">Flow</th>
                    <th className="text-center p-2">Pin</th>
                    <th className="text-left p-2">League</th>
                    <th className="text-left p-2">Home</th>
                    <th className="text-center p-2">Score</th>
                    <th className="text-left p-2">Away</th>
                    <th className="text-center p-2">Momentum</th>
                    <th className="text-center p-2">Events</th>
                    <th className="text-center p-2">Minute</th>
                    <th className="text-center p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLive.map((m: any) => {
                    const matchId = String(m.id);
                    const isExpanded = expandedMatchId === matchId;
                    const isPinned = pinnedMatchIds.includes(matchId);
                    const isFollowedClub =
                      followedClub &&
                      (String(m.home).toLowerCase().includes(followedClub) || String(m.away).toLowerCase().includes(followedClub));
                    const timeline = eventTimelineMap[matchId];
                    return (
                      <Fragment key={matchId}>
                        <tr key={matchId} data-fixture-id={matchId} ref={(node) => setLiveRowRef(matchId, node)} className="border-b border-white/5 hover:bg-white/[0.03]">
                          <td className="p-2 text-center">
                            <button
                              onClick={() => toggleExpanded(matchId)}
                              className="inline-flex items-center justify-center w-7 h-7 border border-white/10 text-gray-400 hover:text-white"
                              title={isExpanded ? "Collapse timeline" : "Expand timeline"}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => togglePinned(matchId)}
                              className={`inline-flex items-center justify-center w-7 h-7 border ${isPinned ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-gray-500 hover:text-white"}`}
                              title={isPinned ? "Unpin match" : "Pin match"}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="p-2 text-[11px] font-bold text-gray-300 max-w-[140px] truncate">{m.league}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <TeamLogo logo={m.homeLogo} initial={m.homeInitial} color={m.homeColor} size="sm" />
                              <span className="text-sm font-bold text-white truncate">{m.home}</span>
                              {isFollowedClub && String(m.home).toLowerCase().includes(followedClub) && (
                                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary">Fav</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-center text-base md:text-lg font-black text-white">{m.homeScore} - {m.awayScore}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <TeamLogo logo={m.awayLogo} initial={m.awayInitial} color={m.awayColor} size="sm" />
                              <span className="text-sm font-bold text-white truncate">{m.away}</span>
                              {isFollowedClub && String(m.away).toLowerCase().includes(followedClub) && (
                                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary">Fav</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-center">{momentumBars(eventSummaryMap[m.id])}</td>
                          <td className="p-2 text-center">
                            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase">
                              <span className="px-1.5 py-0.5 bg-green-600/20 text-green-400">G {eventSummaryMap[m.id]?.goals ?? "-"}</span>
                              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400">Y {eventSummaryMap[m.id]?.cards ?? "-"}</span>
                              <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400">R {eventSummaryMap[m.id]?.reds ?? "-"}</span>
                              <span className="px-1.5 py-0.5 bg-blue-600/20 text-blue-400">S {eventSummaryMap[m.id]?.subs ?? "-"}</span>
                            </div>
                          </td>
                          <td className="p-2 text-center text-sm font-black text-primary">{m.minute || "LIVE"}</td>
                          <td className="p-2 text-center">
                            <span className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
                              {freshnessLabel(matchId)}
                            </span>
                            <Link href={`/live-center/${m.id}`} className="inline-block border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/5">
                              Open
                            </Link>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="border-b border-white/5 bg-black/20">
                            <td colSpan={10} className="p-2">
                              {!timeline ? (
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Loading timeline...</p>
                              ) : timeline.length === 0 ? (
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No events yet.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div className="border border-white/10 bg-[#111] p-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Home Events</p>
                                    <div className="space-y-1.5">
                                      {timeline
                                        .filter((event) => event.team === "home")
                                        .sort((a, b) => a.min - b.min)
                                        .slice(-8)
                                        .map((event, idx) => (
                                          <div key={`${matchId}-home-${idx}`} className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-300">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              <span className="text-primary font-black">{event.min}'</span>
                                              {eventChip(event)}
                                            </div>
                                            <span className="text-white truncate">{event.player || "-"}</span>
                                          </div>
                                        ))}
                                      {timeline.filter((event) => event.team === "home").length === 0 && (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No home events</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="border border-white/10 bg-[#111] p-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Away Events</p>
                                    <div className="space-y-1.5">
                                      {timeline
                                        .filter((event) => event.team === "away")
                                        .sort((a, b) => a.min - b.min)
                                        .slice(-8)
                                        .map((event, idx) => (
                                          <div key={`${matchId}-away-${idx}`} className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-300">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              <span className="text-primary font-black">{event.min}'</span>
                                              {eventChip(event)}
                                            </div>
                                            <span className="text-white truncate">{event.player || "-"}</span>
                                          </div>
                                        ))}
                                      {timeline.filter((event) => event.team === "away").length === 0 && (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No away events</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </>
      )}

      {mode === "fixtures" && (
        <>
          {filteredUpcoming.length === 0 ? (
            <EmptyState message="No upcoming fixtures available." />
          ) : (
            <div className="space-y-5">
              {Object.entries(
                filteredUpcoming.reduce((groups: Record<string, any[]>, fixture: any) => {
                  const key = fixture.date || "Upcoming";
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(fixture);
                  return groups;
                }, {})
              ).map(([date, fixtures]) => (
                <div key={date} className="border border-white/10 bg-[#111]">
                  <div className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-widest text-gray-400">{date}</div>
                  <div className="divide-y divide-white/5">
                    {(fixtures as any[]).map((f: any) => (
                      <div key={f.id} className="px-4 py-3 grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <TeamLogo logo={f.homeLogo} initial={f.homeInitial} color={f.homeColor} size="sm" />
                          <span className="text-sm font-bold text-white truncate">{f.home}</span>
                        </div>
                        <span className="text-[11px] font-black uppercase text-gray-600">vs</span>
                        <div className="flex items-center gap-2 min-w-0 justify-end">
                          <span className="text-sm font-bold text-white truncate">{f.away}</span>
                          <TeamLogo logo={f.awayLogo} initial={f.awayInitial} color={f.awayColor} size="sm" />
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest text-primary">{f.time}</div>
                          <div className="text-[10px] text-gray-500 font-bold">{f.league}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <AdBanner label="Fixture Feed Sponsor" type="horizontal" />
            </div>
          )}
        </>
      )}

      {mode === "results" && (
        <>
          {filteredRecent.length === 0 ? (
            <EmptyState message="No recent results available." />
          ) : (
            <div className="space-y-5">
              {Object.entries(
                filteredRecent.reduce((groups: Record<string, any[]>, result: any) => {
                  const key = result.date || "Recent";
                  if (!groups[key]) groups[key] = [];
                  groups[key].push(result);
                  return groups;
                }, {})
              ).map(([date, results]) => (
                <div key={date} className="border border-white/10 bg-[#111]">
                  <div className="px-4 py-3 border-b border-white/10 text-xs font-black uppercase tracking-widest text-gray-400">{date}</div>
                  <div className="divide-y divide-white/5">
                    {(results as any[]).map((r: any) => (
                      <div key={r.id} className="px-4 py-3 grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <TeamLogo logo={r.homeLogo} initial={r.homeInitial} color={r.homeColor} size="sm" />
                          <span className="text-sm font-bold text-white truncate">{r.home}</span>
                        </div>
                        <span className="text-sm font-black text-white">{r.homeScore} - {r.awayScore}</span>
                        <div className="flex items-center gap-2 min-w-0 justify-end">
                          <span className="text-sm font-bold text-white truncate">{r.away}</span>
                          <TeamLogo logo={r.awayLogo} initial={r.awayInitial} color={r.awayColor} size="sm" />
                        </div>
                        <div className="text-right text-[10px] text-gray-500 font-bold">{r.league}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <AdBanner label="Results Feed Sponsor" type="horizontal" />
            </div>
          )}
        </>
      )}

      {mode === "standings" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {TOP_LEAGUES.map((league) => (
              <button
                key={league}
                onClick={() => setSelectedLeague(league)}
                className={`px-3 py-2 border text-[10px] font-black uppercase tracking-widest ${selectedLeague === league ? "bg-primary/20 border-primary text-white" : "bg-[#111] border-white/10 text-gray-400 hover:text-white"}`}
              >
                {league}
              </button>
            ))}
          </div>
          {selectedStandings.length === 0 ? (
            <EmptyState message="No standings data available for selected league." />
          ) : (
            <div className="border border-white/10 bg-[#111] overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="text-center p-3">#</th>
                    <th className="text-left p-3">Club</th>
                    <th className="text-center p-3">P</th>
                    <th className="text-center p-3">GD</th>
                    <th className="text-center p-3">Pts</th>
                    <th className="text-left p-3">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStandings.map((team: any) => (
                    <tr key={team.rank} className="border-b border-white/5 hover:bg-white/[0.03]">
                      <td className="p-3 text-center text-xs font-bold text-gray-500">{team.rank}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img src={team.logo} alt={team.team} className="w-5 h-5 object-contain" />
                          <span className="text-sm font-bold text-white">{team.team}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-xs text-gray-400">{team.played}</td>
                      <td className="p-3 text-center text-xs text-gray-400">{team.gd}</td>
                      <td className="p-3 text-center text-sm font-black text-white">{team.points}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {(team.form || []).slice(-5).map((f: string, idx: number) => (
                            <span key={`${team.rank}-${idx}`} className={`w-5 h-5 text-[9px] font-black flex items-center justify-center ${f === "W" ? "bg-green-600/20 text-green-400" : f === "D" ? "bg-gray-600/20 text-gray-300" : "bg-red-600/20 text-red-400"}`}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
