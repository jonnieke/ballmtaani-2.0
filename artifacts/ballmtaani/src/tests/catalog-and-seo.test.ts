import assert from "node:assert";
import { test } from "node:test";
import { getLeagueBySlug, getTeamSlug, getMatchSlug, parseMatchSlug, COMPETITIONS } from "../config/football-catalog";
import { formatKenyanTime, formatKenyanDateTime, parseDate } from "../lib/date-utils";
import { generateHomepageSchema, generateLeagueSchema, generateClubSchema, generateMatchSchema, generateArticleSchema } from "../lib/jsonld";

test("1. League Slug Resolution", () => {
  const pl = getLeagueBySlug("premier-league");
  assert.strictEqual(pl?.id, 39);
  assert.strictEqual(pl?.officialName, "Premier League");

  const ucl = getLeagueBySlug("champions-league");
  assert.strictEqual(ucl?.id, 2);

  const kpl = getLeagueBySlug("fkf-premier-league");
  assert.strictEqual(kpl?.id, 276);
});

test("2. Team Slug Resolution", () => {
  assert.strictEqual(getTeamSlug("Arsenal FC"), "arsenal-fc");
  assert.strictEqual(getTeamSlug("Gor Mahia FC"), "gor-mahia-fc");
  assert.strictEqual(getTeamSlug("Manchester United"), "manchester-united");
});

test("3. Match Slug Parsing", () => {
  const slug = getMatchSlug("Arsenal", "Chelsea", "2026-09-06", 123456);
  assert.strictEqual(slug, "arsenal-v-chelsea-2026-09-06-123456");

  const parsed = parseMatchSlug(slug);
  assert.strictEqual(parsed.fixtureId, 123456);
});

test("4. Africa/Nairobi Timezone Formatting", () => {
  const isoDate = "2026-09-06T16:30:00.000Z"; // 16:30 UTC = 19:30 EAT (+3h)
  const formattedTime = formatKenyanTime(isoDate, true);
  assert.ok(formattedTime.includes("EAT"));
  
  const parsed = parseDate(isoDate);
  assert.strictEqual(parsed.getFullYear(), 2026);
});

test("5. JSON-LD Schema Generation & JSON Validity", () => {
  const hpSchema = generateHomepageSchema();
  const hpJson = JSON.stringify(hpSchema);
  assert.ok(hpJson.includes("BallMtaani"));
  assert.doesNotThrow(() => JSON.parse(hpJson));

  const leagueSchema = generateLeagueSchema({
    name: "Premier League",
    slug: "premier-league",
    description: "EPL live scores",
    country: "England",
    season: 2026,
  });
  const leagueJson = JSON.stringify(leagueSchema);
  assert.doesNotThrow(() => JSON.parse(leagueJson));

  const clubSchema = generateClubSchema({
    name: "Arsenal",
    slug: "arsenal",
    country: "England",
  });
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(clubSchema)));

  const matchSchema = generateMatchSchema({
    matchSlug: "arsenal-v-chelsea-2026-09-06-123456",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    startDateISO: "2026-09-06T19:30:00+03:00",
    status: "scheduled",
    leagueName: "Premier League",
  });
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(matchSchema)));
});

test("6. Competition Catalog Integrity", () => {
  assert.strictEqual(COMPETITIONS.length, 10);
  for (const c of COMPETITIONS) {
    assert.ok(c.id > 0);
    assert.ok(c.slug.length > 0);
    assert.ok(c.seoTitle.length > 0);
  }
});
