import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as mock from "../data/mockData";

import {
  fetchLiveMatches,
  fetchUpcomingFixtures as apiFetchUpcoming,
  fetchRecentMatches as apiFetchRecent,
  fetchAllStandings,
  fetchFixtureStats,
  fetchFixtureEvents,
  fetchFixtureLineups,
} from "../lib/football-api";

/**
 * Live matches — from API-Football (major leagues only), fallback to mock.
 * Refreshes every 30 seconds when window is focused.
 */
export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      try {
        const liveMatches = await fetchLiveMatches();
        if (liveMatches && liveMatches.length > 0) {
          return liveMatches;
        }
      } catch (err) {
        console.error("Football API failed, falling back to mock:", err);
      }

      // Fallback: try Supabase, then mock
      if (!supabase) return mock.LIVE_MATCHES;

      try {
        const { data, error } = await supabase
          .from("matches")
          .select(`*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)`)
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          return mock.LIVE_MATCHES;
        }

        return data.map(m => ({
          id: m.id,
          home: m.home_team.name,
          homeLogo: m.home_team.logo_url,
          homeColor: m.home_team.color,
          homeInitial: m.home_team.initial,
          away: m.away_team.name,
          awayLogo: m.away_team.logo_url,
          awayColor: m.away_team.color,
          awayInitial: m.away_team.initial,
          homeScore: m.home_score,
          awayScore: m.away_score,
          minute: m.minute,
          league: m.league,
          possession: m.possession,
          scorers: m.scorers
        }));
      } catch (err) {
        return mock.LIVE_MATCHES;
      }
    },
    refetchInterval: 30000, // Refresh every 30s for live scores
    staleTime: 15000,       // Consider data stale after 15s
  });
}

/**
 * Upcoming fixtures — from API-Football (major leagues), fallback to mock.
 */
export function useUpcomingFixtures() {
  return useQuery({
    queryKey: ["upcoming-fixtures"],
    queryFn: async () => {
      try {
        const upcoming = await apiFetchUpcoming();
        if (upcoming && upcoming.length > 0) {
          return upcoming;
        }
      } catch (err) {
        console.error("Upcoming fixtures API failed, falling back to mock:", err);
      }

      // Fallback
      if (!supabase) return mock.UPCOMING_FIXTURES;

      try {
        const { data, error } = await supabase
          .from("matches")
          .select(`*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)`)
          .eq("status", "upcoming")
          .order("match_date", { ascending: true });

        if (error || !data || data.length === 0) {
          return mock.UPCOMING_FIXTURES;
        }

        return data.map(m => ({
          id: m.id,
          home: m.home_team.name,
          homeLogo: m.home_team.logo_url,
          homeColor: m.home_team.color,
          homeInitial: m.home_team.initial,
          away: m.away_team.name,
          awayLogo: m.away_team.logo_url,
          awayColor: m.away_team.color,
          awayInitial: m.away_team.initial,
          time: m.match_date,
          league: m.league,
          date: "Upcoming"
        }));
      } catch (err) {
        return mock.UPCOMING_FIXTURES;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Recent fixtures — from API-Football (major leagues), past 5 days.
 */
export function useRecentMatches() {
  return useQuery({
    queryKey: ["recent-fixtures"],
    queryFn: async () => {
      try {
        const recent = await apiFetchRecent();
        if (recent && recent.length > 0) {
          return recent;
        }
      } catch (err) {
        console.error("Recent fixtures API failed:", err);
      }
      return [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (past results don't change often)
  });
}

/**
 * Standings — from API-Football (5 major leagues), fallback to mock.
 */
export function useStandings() {
  return useQuery({
    queryKey: ["standings"],
    queryFn: async () => {
      try {
        const standings = await fetchAllStandings();
        if (standings && Object.keys(standings).length > 0) {
          return standings;
        }
      } catch (err) {
        console.error("Standings API failed, falling back to mock:", err);
      }

      return mock.STANDINGS;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — standings don't change mid-match
  });
}

/**
 * Fixture Detail — stats, events, lineups for a specific match.
 * Only fetched on-demand when user opens Live Center.
 */
export function useFixtureDetail(fixtureId: string | undefined) {
  return useQuery({
    queryKey: ["fixture-detail", fixtureId],
    queryFn: async () => {
      if (!fixtureId) return null;

      const [stats, events, lineups] = await Promise.all([
        fetchFixtureStats(fixtureId),
        fetchFixtureEvents(fixtureId),
        fetchFixtureLineups(fixtureId),
      ]);

      return { stats, events, lineups };
    },
    enabled: !!fixtureId,
    staleTime: 30000, // Refresh every 30s
    refetchInterval: 30000,
  });
}

// ─── Non-football hooks (Supabase / mock) ───────────────────

export function useDebates() {
  return useQuery({
    queryKey: ["debates"],
    queryFn: async () => {
      if (!supabase) return mock.DEBATES;

      try {
        const { data, error } = await supabase
          .from("debates")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          return mock.DEBATES;
        }

        return data.map(d => {
          const fallback = mock.DEBATES.find(m => m.id === d.id);
          return {
            id: d.id,
            title: d.title,
            left: d.left_option,
            right: d.right_option,
            leftImage: d.left_image || fallback?.leftImage,
            rightImage: d.right_image || fallback?.rightImage,
            leftVotes: d.left_votes,
            rightVotes: d.right_votes,
            totalVotes: d.total_votes.toLocaleString()
          };
        });
      } catch (err) {
        return mock.DEBATES;
      }
    }
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!supabase) return mock.LEADERBOARD;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("points", { ascending: false })
          .limit(10);

        if (error || !data || data.length === 0) {
          return mock.LEADERBOARD;
        }

        return data.map((p, index) => ({
          rank: index + 1,
          name: p.username,
          country: p.country || "🌍",
          correct: Math.floor(p.points / 5),
          streak: p.streak,
          pts: p.points
        }));
      } catch (err) {
        return mock.LEADERBOARD;
      }
    }
  });
}

export function useFanZones() {
  return useQuery({
    queryKey: ["fan-zones"],
    queryFn: async () => {
      if (!supabase) return mock.FAN_ZONES;

      try {
        const { data, error } = await supabase
          .from("fan_zones")
          .select("*");

        if (error || !data || data.length === 0) {
          return mock.FAN_ZONES;
        }

        return data;
      } catch (e) {
        return mock.FAN_ZONES;
      }
    }
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId || !supabase) {
        return { username: "Fan", points: 0, streak: 0, country: "KEN", favorite_team: "None" };
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error || !data) {
          return { username: "Fan", points: 0, streak: 0, country: "KEN", favorite_team: "None", interactions: 120 };
        }

        return { ...data, interactions: data.interactions || 120 };
      } catch (e) {
        return { username: "Fan", points: 0, streak: 0, country: "KEN", favorite_team: "None", interactions: 120 };
      }
    },
    enabled: !!userId
  });
}

export function useBanter(zoneId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["banter", zoneId],
    queryFn: async () => {
      if (!zoneId || !supabase) return [];
      const { data, error } = await supabase
        .from("banter")
        .select("*")
        .eq("fan_zone_id", zoneId)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data;
    },
    enabled: !!zoneId
  });

  useEffect(() => {
    if (!zoneId || !supabase) return;

    const channel = supabase
      .channel(`banter-${zoneId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "banter",
          filter: `fan_zone_id=eq.${zoneId}`
        },
        (payload) => {
          queryClient.setQueryData(["banter", zoneId], (old: any[] | undefined) => {
            return [payload.new, ...(old || [])];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [zoneId, queryClient]);

  return query;
}
