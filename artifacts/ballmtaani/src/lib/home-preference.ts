/**
 * BallMtaani Personalised Homepage Ranking Engine
 * Deterministic feed ordering based on fan preference model.
 */

import { FanPreferences, DEFAULT_PREFERENCES } from "./user-preferences";

export interface FeedMatchItem {
  id: string | number;
  homeTeam: string;
  awayTeam: string;
  leagueId: number | string;
  leagueName: string;
  status: string; // 'live' | 'upcoming' | 'finished'
  priorityScore?: number;
}

export interface FeedNewsItem {
  id: string;
  title: string;
  teamsRelated?: string[];
  leagueRelated?: string;
  publishedAt: string;
  priorityScore?: number;
}

/**
 * Calculate match priority score deterministically
 */
export function scoreMatch(match: FeedMatchItem, prefs: FanPreferences = DEFAULT_PREFERENCES): number {
  let score = 0;

  const homeSlug = match.homeTeam.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const awaySlug = match.awayTeam.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // 1. Followed teams
  const isHomeFollowed = prefs.followedTeams.some(t => homeSlug.includes(t));
  const isAwayFollowed = prefs.followedTeams.some(t => awaySlug.includes(t));
  const isPrimary = prefs.primaryTeam && (homeSlug.includes(prefs.primaryTeam) || awaySlug.includes(prefs.primaryTeam));

  if (isPrimary) score += 1000;
  else if (isHomeFollowed || isAwayFollowed) score += 500;

  // 2. Status
  if (match.status === "live") score += 200;
  else if (match.status === "upcoming") score += 100;

  // 3. League priority (Kenyan & Major European)
  const leagueStr = String(match.leagueId || match.leagueName).toLowerCase();
  if (leagueStr.includes("326") || leagueStr.includes("fkf") || leagueStr.includes("kenya")) score += 150;
  else if (leagueStr.includes("39") || leagueStr.includes("premier")) score += 120;
  else if (leagueStr.includes("2") || leagueStr.includes("champions")) score += 110;

  return score;
}

/**
 * Sort matches deterministically for personalised feed
 */
export function rankMatches(matches: FeedMatchItem[], prefs: FanPreferences = DEFAULT_PREFERENCES): FeedMatchItem[] {
  return [...matches]
    .map(m => ({ ...m, priorityScore: scoreMatch(m, prefs) }))
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
}

/**
 * Calculate news article priority score
 */
export function scoreNews(news: FeedNewsItem, prefs: FanPreferences = DEFAULT_PREFERENCES): number {
  let score = 0;
  const titleLower = news.title.toLowerCase();

  // Primary team match
  if (prefs.primaryTeam && titleLower.includes(prefs.primaryTeam)) score += 500;

  // Followed teams
  for (const team of prefs.followedTeams) {
    if (titleLower.includes(team)) score += 200;
  }

  // Recency score
  const pubTime = new Date(news.publishedAt).getTime();
  if (!isNaN(pubTime)) {
    const hoursOld = (Date.now() - pubTime) / (1000 * 60 * 60);
    score += Math.max(0, 100 - hoursOld);
  }

  return score;
}

/**
 * Sort news deterministically for personalised feed
 */
export function rankNews(news: FeedNewsItem[], prefs: FanPreferences = DEFAULT_PREFERENCES): FeedNewsItem[] {
  return [...news]
    .map(n => ({ ...n, priorityScore: scoreNews(n, prefs) }))
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
}
