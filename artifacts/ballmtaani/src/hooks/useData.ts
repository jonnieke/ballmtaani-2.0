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
        return (await fetchLiveMatches()) || [];
      } catch (err) {
        console.error("Football API live matches failed:", err);
        return [];
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
        return (await apiFetchUpcoming()) || [];
      } catch (err) {
        console.error("Upcoming fixtures API failed:", err);
        return [];
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
        return (await apiFetchRecent()) || [];
      } catch (err) {
        console.error("Recent fixtures API failed:", err);
        return [];
      }
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
          .limit(10);

        if (error || !data || data.length === 0) {
          return mock.LEADERBOARD;
        }

        const sorted = [...data].sort((a, b) => {
          const aScore = Number(a.coins ?? a.points ?? 0);
          const bScore = Number(b.coins ?? b.points ?? 0);
          return bScore - aScore;
        });

        return sorted.map((p, index) => ({
          rank: index + 1,
          name: p.username,
          country: p.country || "KEN",
          correct: Math.floor(Number(p.coins ?? p.points ?? 0) / 25),
          streak: p.streak || 0,
          pts: Number(p.coins ?? p.points ?? 0)
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

        return data.map(zone => ({
          id: zone.id,
          team: zone.team_name || zone.name,
          team_name: zone.team_name || zone.name,
          logo: zone.logo_url || zone.logo,
          logo_url: zone.logo_url || zone.logo,
          members: zone.members_count ? zone.members_count.toLocaleString() : "10K+",
          members_count: zone.members_count || 0,
          preview: zone.preview_text || "Matchday talk is live.",
          preview_text: zone.preview_text || "Matchday talk is live.",
          color: zone.color || "#1E6FFF",
          region: zone.region || "Europe",
        }));
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

        return { 
          ...data, 
          points: data.coins || 0, // map coins to points for legacy UI
          interactions: data.coins ? Math.floor(data.coins / 10) : 120 
        };
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




