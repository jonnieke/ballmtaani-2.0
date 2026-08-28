import { supabase } from "./supabase";

export type PublishedLocalMatch = {
  id: string;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  scheduledDate: string | null;
  kickoffTime: string | null;
  kickoffAt: string | null;
  round: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  venue: string | null;
  verificationStatus: "verified" | "corrected";
  publishedAt: string;
};

export type PublishedStanding = {
  id: string;
  position: number;
  team: string;
  played: number | null;
  goalDifference: number | null;
  points: number | null;
  competition: string;
  publishedAt: string;
};

export type PublishedLocalPlayer = {
  name: string;
  team: string | null;
  competition: string;
  goals: number;
  assists: number;
  latestPublishedAt: string;
};

export type LocalFeedStatus = "ready" | "empty" | "unavailable";

export type LocalFootballDesk = {
  matches: PublishedLocalMatch[];
  standings: PublishedStanding[];
  players: PublishedLocalPlayer[];
  teams: string[];
  matchStatus: LocalFeedStatus;
  standingsStatus: LocalFeedStatus;
  eventsStatus: LocalFeedStatus;
  lastPublishedAt: string | null;
};

export const EMPTY_LOCAL_FOOTBALL_DESK: LocalFootballDesk = {
  matches: [],
  standings: [],
  players: [],
  teams: [],
  matchStatus: "empty",
  standingsStatus: "empty",
  eventsStatus: "empty",
  lastPublishedAt: null,
};

export async function fetchLocalFootballDesk(): Promise<LocalFootballDesk> {
  if (!supabase) return {
    ...EMPTY_LOCAL_FOOTBALL_DESK,
    matchStatus: "unavailable",
    standingsStatus: "unavailable",
    eventsStatus: "unavailable",
  };
  const [matchResult, standingResult, eventResult] = await Promise.all([
    supabase.from("local_fixtures").select(`
      id, status, scheduled_date, kickoff_time_text, kickoff_at, round_label,
      home_score, away_score, home_penalties, away_penalties, verification_status, published_at,
      competition:local_competitions(name),
      home_team:local_teams!local_fixtures_home_team_id_fkey(name),
      away_team:local_teams!local_fixtures_away_team_id_fkey(name),
      venue:local_venues(name)
    `).order("published_at", { ascending: false }).limit(50),
    supabase.from("local_standing_rows").select(`
      id, position, played, goal_difference, points, published_at,
      competition:local_competitions(name), team:local_teams(name)
    `).order("published_at", { ascending: false }).order("position", { ascending: true }).limit(10),
    supabase.from("local_match_events").select(`
      id, event_type, player_name, assist_name,
      team:local_teams(name),
      fixture:local_fixtures!inner(
        published_at,
        competition:local_competitions(name)
      )
    `).order("created_at", { ascending: false }).limit(200),
  ]);
  // Keep each published feed independent: an empty or unavailable table must
  // never hide verified fixtures and results that are already public.
  const one = (value: any) => Array.isArray(value) ? value[0] : value;
  const mappedMatches = (matchResult.error ? [] : matchResult.data || []).map((row: any) => ({
      id: row.id, status: row.status, scheduledDate: row.scheduled_date,
      kickoffTime: row.kickoff_time_text, kickoffAt: row.kickoff_at, round: row.round_label,
      homeScore: row.home_score, awayScore: row.away_score,
      homePenalties: row.home_penalties, awayPenalties: row.away_penalties,
      competition: one(row.competition)?.name || "Local football",
      homeTeam: one(row.home_team)?.name || "TBC", awayTeam: one(row.away_team)?.name || "TBC",
      venue: one(row.venue)?.name || null,
      verificationStatus: row.verification_status,
      publishedAt: row.published_at,
    })) as PublishedLocalMatch[];
  const matchKey = (match: PublishedLocalMatch) => [
    match.competition,
    match.homeTeam,
    match.awayTeam,
    match.scheduledDate || "date-pending",
    match.homeScore ?? "-",
    match.awayScore ?? "-",
    match.homePenalties ?? "-",
    match.awayPenalties ?? "-",
  ].map((value) => String(value).trim().toLocaleLowerCase()).join("|");
  const matches = [...new Map<string, PublishedLocalMatch>(
    mappedMatches.map((match) => [matchKey(match), match]),
  ).values()];
  matches.sort((a, b) => {
    const aScheduled = a.status === "scheduled" ? 0 : 1;
    const bScheduled = b.status === "scheduled" ? 0 : 1;
    if (aScheduled !== bScheduled) return aScheduled - bScheduled;
    const aTime = Date.parse(a.kickoffAt || a.scheduledDate || a.publishedAt) || 0;
    const bTime = Date.parse(b.kickoffAt || b.scheduledDate || b.publishedAt) || 0;
    return aScheduled === 0 ? aTime - bTime : bTime - aTime;
  });

  const standings = (standingResult.error ? [] : standingResult.data || []).map((row: any) => ({
      id: row.id, position: row.position, played: row.played,
      goalDifference: row.goal_difference, points: row.points,
      competition: one(row.competition)?.name || "Local table", team: one(row.team)?.name || "TBC",
      publishedAt: row.published_at,
    })) as PublishedStanding[];

  const playerMap = new Map<string, PublishedLocalPlayer>();
  for (const row of eventResult.error ? [] : eventResult.data || []) {
    const fixture = one((row as any).fixture);
    const playerName = String((row as any).player_name || "").trim();
    const assistName = String((row as any).assist_name || "").trim();
    if (!playerName && !assistName) continue;
    const team = one((row as any).team)?.name || null;
    const competition = one(fixture?.competition)?.name || "Local football";
    const publishedAt = fixture?.published_at || new Date(0).toISOString();
    if (playerName) {
      const key = `${playerName.toLowerCase()}|${String(team || "").toLowerCase()}`;
      const current = playerMap.get(key) || {
        name: playerName,
        team,
        competition,
        goals: 0,
        assists: 0,
        latestPublishedAt: publishedAt,
      };
      if (["goal", "penalty_goal"].includes((row as any).event_type)) current.goals += 1;
      if (Date.parse(publishedAt) > Date.parse(current.latestPublishedAt)) current.latestPublishedAt = publishedAt;
      playerMap.set(key, current);
    }
    if (assistName) {
      const assistKey = `${assistName.toLowerCase()}|${String(team || "").toLowerCase()}`;
      const assistant = playerMap.get(assistKey) || {
        name: assistName,
        team,
        competition,
        goals: 0,
        assists: 0,
        latestPublishedAt: publishedAt,
      };
      assistant.assists += 1;
      if (Date.parse(publishedAt) > Date.parse(assistant.latestPublishedAt)) {
        assistant.latestPublishedAt = publishedAt;
      }
      playerMap.set(assistKey, assistant);
    }
  }
  const players = [...playerMap.values()].sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name));
  const teams = [...new Set(matches.flatMap((match) => [match.homeTeam, match.awayTeam]).filter((team) => team !== "TBC"))].sort();
  const publishedTimes = [
    ...matches.map((match) => match.publishedAt),
    ...standings.map((row) => row.publishedAt),
  ].map(Date.parse).filter(Number.isFinite);

  return {
    matches: matches.slice(0, 24),
    standings,
    players,
    teams,
    matchStatus: matchResult.error ? "unavailable" : matches.length ? "ready" : "empty",
    standingsStatus: standingResult.error ? "unavailable" : standings.length ? "ready" : "empty",
    eventsStatus: eventResult.error ? "unavailable" : players.length ? "ready" : "empty",
    lastPublishedAt: publishedTimes.length ? new Date(Math.max(...publishedTimes)).toISOString() : null,
  };
}
