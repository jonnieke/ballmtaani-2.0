import assert from "node:assert";
import { test } from "node:test";

// 4D: RBAC
import { hasPermission } from "../lib/rbac";

// 4E: Recommendations, Experiments, i18n
import { rankMatches, scoreMatch } from "../lib/recommendations";
import { assignVariant, getExperimentVariant, ACTIVE_EXPERIMENTS } from "../lib/experiments";
import { t } from "../lib/i18n";

// ────────────────────────────────────────────────────────
// 4D — RBAC
// ────────────────────────────────────────────────────────
test("1. RBAC — Platform Admin Full Access", () => {
  assert.strictEqual(hasPermission("platform_admin", "manage_users"), true);
  assert.strictEqual(hasPermission("platform_admin", "manage_ad_campaigns"), true);
});

test("2. RBAC — Creator Limited Access", () => {
  assert.strictEqual(hasPermission("creator", "publish_article"), true);
  assert.strictEqual(hasPermission("creator", "manage_users"), false);
  assert.strictEqual(hasPermission("creator", "manage_ad_campaigns"), false);
});

test("3. RBAC — Fan Zero Permissions", () => {
  assert.strictEqual(hasPermission("fan", "publish_article"), false);
  assert.strictEqual(hasPermission("fan", "moderate_content"), false);
});

// ────────────────────────────────────────────────────────
// 4E — Recommendation Engine
// ────────────────────────────────────────────────────────
test("4. Recommendation — Favourite Team Signal", () => {
  const result = scoreMatch(
    { matchId: "m1", homeTeamId: 42, leagueId: 39, kickoffISO: new Date(Date.now() + 90 * 60000).toISOString() },
    { favouriteTeamIds: [42], favouriteLeagueIds: [] }
  );
  assert.ok(result.score > 0);
  assert.ok(result.reasons.some(r => r.includes("Favourite team")));
});

test("5. Recommendation — Ranking Determinism", () => {
  const matches = [
    { matchId: "m1", homeTeamId: 99, leagueId: 99, kickoffISO: new Date(Date.now() + 3600000).toISOString() },
    { matchId: "m2", homeTeamId: 42, leagueId: 39, kickoffISO: new Date(Date.now() + 3600000).toISOString(), liveStatus: "LIVE" },
  ];
  const ranked = rankMatches(matches, { favouriteTeamIds: [42], favouriteLeagueIds: [39] });
  assert.strictEqual(ranked[0].matchId, "m2"); // Should rank highest
});

// ────────────────────────────────────────────────────────
// 4E — A/B Experiment Framework
// ────────────────────────────────────────────────────────
test("6. A/B Experiment — Deterministic User Bucketing", () => {
  const exp = ACTIVE_EXPERIMENTS[0];
  const v1 = assignVariant(exp, "user_abc");
  const v2 = assignVariant(exp, "user_abc");
  assert.strictEqual(v1, v2, "Same user must always get same variant");
});

test("7. A/B Experiment — Returns Null for Inactive Experiments", () => {
  const result = getExperimentVariant("EXP-NONEXISTENT", "user_xyz");
  assert.strictEqual(result, null);
});

// ────────────────────────────────────────────────────────
// 4E — i18n
// ────────────────────────────────────────────────────────
test("8. i18n — English String Lookup", () => {
  assert.strictEqual(t("matchday.title", "en"), "Today's Matchday");
  assert.strictEqual(t("fan.coins", "en"), "MTC Coins");
});

test("9. i18n — Swahili String Lookup", () => {
  assert.strictEqual(t("matchday.title", "sw"), "Mechi za Leo");
  assert.strictEqual(t("predictions.submit", "sw"), "Thibitisha Matarajio");
});

test("10. i18n — Sheng String Lookup", () => {
  assert.strictEqual(t("debates.title", "sheng"), "Madebate za wafans");
  assert.strictEqual(t("fan.greeting", "sheng"), "Urudi bana");
});
