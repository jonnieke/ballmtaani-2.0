import assert from "node:assert";
import { test } from "node:test";
import { checkContentSafety, filterBlockedPosts, PostContent } from "../lib/community-moderation";
import { isInQuietHours } from "../lib/push-notifications";

test("1. Banned Term Commercial Spam Detection", () => {
  const safePost = checkContentSafety("Arsenal has great midfield energy today!");
  assert.strictEqual(safePost.isSafe, true);

  const scamPost = checkContentSafety("Join my WhatsApp group bet for fixed match sure win!");
  assert.strictEqual(scamPost.isSafe, false);
});

test("2. Filter Blocked Posts", () => {
  const posts: PostContent[] = [
    { id: "p1", userId: "u1", authorName: "User1", text: "Go Arsenal!", createdAt: new Date().toISOString() },
    { id: "p2", userId: "u2", authorName: "User2", text: "Spam message", createdAt: new Date().toISOString() },
  ];

  const filtered = filterBlockedPosts(posts, ["u2"]);
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].id, "p1");
});

test("3. Africa/Nairobi Quiet Hours Check", () => {
  const nightDate = new Date("2026-07-22T01:30:00.000Z"); // 04:30 AM EAT
  assert.ok(isInQuietHours(nightDate, 23, 7), "04:30 EAT should fall within quiet hours 23:00 - 07:00");
});
