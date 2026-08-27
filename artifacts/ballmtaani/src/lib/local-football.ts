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
};

export type PublishedStanding = {
  id: string;
  position: number;
  team: string;
  played: number | null;
  goalDifference: number | null;
  points: number | null;
  competition: string;
};

export type LocalFootballDesk = { matches: PublishedLocalMatch[]; standings: PublishedStanding[] };

export async function fetchLocalFootballDesk(): Promise<LocalFootballDesk> {
  if (!supabase) return { matches: [], standings: [] };
  const [matchResult, standingResult] = await Promise.all([
    supabase.from("local_fixtures").select(`
      id, status, scheduled_date, kickoff_time_text, kickoff_at, round_label,
      home_score, away_score, home_penalties, away_penalties,
      competition:local_competitions(name),
      home_team:local_teams!local_fixtures_home_team_id_fkey(name),
      away_team:local_teams!local_fixtures_away_team_id_fkey(name),
      venue:local_venues(name)
    `).order("scheduled_date", { ascending: false, nullsFirst: false }).limit(12),
    supabase.from("local_standing_rows").select(`
      id, position, played, goal_difference, points,
      competition:local_competitions(name), team:local_teams(name)
    `).order("published_at", { ascending: false }).order("position", { ascending: true }).limit(10),
  ]);
  if (matchResult.error || standingResult.error) return { matches: [], standings: [] };
  const one = (value: any) => Array.isArray(value) ? value[0] : value;
  return {
    matches: (matchResult.data || []).map((row: any) => ({
      id: row.id, status: row.status, scheduledDate: row.scheduled_date,
      kickoffTime: row.kickoff_time_text, kickoffAt: row.kickoff_at, round: row.round_label,
      homeScore: row.home_score, awayScore: row.away_score,
      homePenalties: row.home_penalties, awayPenalties: row.away_penalties,
      competition: one(row.competition)?.name || "Local football",
      homeTeam: one(row.home_team)?.name || "TBC", awayTeam: one(row.away_team)?.name || "TBC",
      venue: one(row.venue)?.name || null,
    })),
    standings: (standingResult.data || []).map((row: any) => ({
      id: row.id, position: row.position, played: row.played,
      goalDifference: row.goal_difference, points: row.points,
      competition: one(row.competition)?.name || "Local table", team: one(row.team)?.name || "TBC",
    })),
  };
}
