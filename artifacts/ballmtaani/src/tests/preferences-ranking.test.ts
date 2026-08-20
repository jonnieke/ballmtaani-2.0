import assert from "node:assert";
import { test } from "node:test";
import { DEFAULT_PREFERENCES, saveLocalPreferences } from "../lib/user-preferences";
import { scoreMatch, rankMatches, scoreNews, rankNews, FeedMatchItem, FeedNewsItem } from "../lib/home-preference";

test("1. Fan Preference Default Fallback", () => {
  assert.strictEqual(DEFAULT_PREFERENCES.primaryTeam, "arsenal");
  assert.ok(DEFAULT_PREFERENCES.followedTeams.includes("gor-mahia"));
});

test("2. Personalised Match Priority Scoring", () => {
  const matchArsenalLive: FeedMatchItem = {
    id: 1,
    homeTeam: "Arsenal FC",
    awayTeam: "Chelsea FC",
    leagueId: 39,
    leagueName: "Premier League",
    status: "live",
  };

  const matchGenericLive: FeedMatchItem = {
    id: 2,
    homeTeam: "Getafe",
    awayTeam: "Osasuna",
    leagueId: 140,
    leagueName: "La Liga",
    status: "live",
  };

  const arsenalScore = scoreMatch(matchArsenalLive, DEFAULT_PREFERENCES);
  const genericScore = scoreMatch(matchGenericLive, DEFAULT_PREFERENCES);

  assert.ok(arsenalScore > genericScore, "Arsenal primary live match must outscore generic live match");
});

test("3. Deterministic Match Ranking Order", () => {
  const matches: FeedMatchItem[] = [
    { id: 1, homeTeam: "Bournemouth", awayTeam: "Everton", leagueId: 39, leagueName: "EPL", status: "upcoming" },
    { id: 2, homeTeam: "Arsenal", awayTeam: "Liverpool", leagueId: 39, leagueName: "EPL", status: "live" },
    { id: 3, homeTeam: "Gor Mahia", awayTeam: "AFC Leopards", leagueId: 326, leagueName: "FKF PL", status: "upcoming" },
  ];

  const ranked = rankMatches(matches, DEFAULT_PREFERENCES);
  assert.strictEqual(ranked[0].id, 2, "Arsenal live match should rank #1");
  assert.strictEqual(ranked[1].id, 3, "Gor Mahia FKF derby should rank #2");
});

test("4. News Feed Priority Scoring", () => {
  const newsItem: FeedNewsItem = {
    id: "n1",
    title: "Arsenal prepare for crunch Premier League clash",
    publishedAt: new Date().toISOString(),
  };

  const score = scoreNews(newsItem, DEFAULT_PREFERENCES);
  assert.ok(score >= 500, "Arsenal news item should score high for Arsenal primary fan");
});
