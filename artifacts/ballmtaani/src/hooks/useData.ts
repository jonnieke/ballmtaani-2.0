import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as mock from "../data/mockData";

import { fetchLiveMatches } from "../lib/football-api";

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      // Prioritize Football API for live scores
      try {
        const liveMatches = await fetchLiveMatches();
        if (liveMatches && liveMatches.length > 0) {
          return liveMatches;
        }
      } catch (err) {
        console.error("Football API failed, falling back to Supabase/Mock:", err);
      }

      // Fallback to Supabase/Mock logic
      if (!supabase) return mock.LIVE_MATCHES;

      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*)
        `)
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
    }
  });
}

export function useUpcomingFixtures() {
  return useQuery({
    queryKey: ["upcoming-fixtures"],
    queryFn: async () => {
      if (!supabase) return mock.UPCOMING_FIXTURES;

      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*)
        `)
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
    }
  });
}

export function useDebates() {
  return useQuery({
    queryKey: ["debates"],
    queryFn: async () => {
      if (!supabase) return mock.DEBATES;

      const { data, error } = await supabase
        .from("debates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return mock.DEBATES;
      }

      return data.map(d => ({
        id: d.id,
        title: d.title,
        left: d.left_option,
        right: d.right_option,
        leftVotes: d.left_votes,
        rightVotes: d.right_votes,
        totalVotes: d.total_votes.toLocaleString()
      }));
    }
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!supabase) return mock.LEADERBOARD;

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
    }
  });
}

export function useFanZones() {
  return useQuery({
    queryKey: ["fan-zones"],
    queryFn: async () => {
      if (!supabase) return mock.FAN_ZONES;

      const { data, error } = await supabase
        .from("fan_zones")
        .select("*");

      if (error || !data || data.length === 0) {
        return mock.FAN_ZONES;
      }

      return data;
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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return { username: "Fan", points: 0, streak: 0, country: "KEN", favorite_team: "None" };
      }

      return data;
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

export function useStandings() {
  return useQuery({
    queryKey: ["standings"],
    queryFn: async () => {
      // Return mock standings for now
      return mock.STANDINGS;
    }
  });
}
