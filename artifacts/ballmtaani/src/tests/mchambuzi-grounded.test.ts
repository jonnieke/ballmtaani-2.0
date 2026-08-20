import assert from "node:assert";
import { test } from "node:test";
import { askMchambuziHalisi, MchambuziPageContext } from "../lib/mchambuzi-halisi";

test("1. Mchambuzi Grounded Question Execution with Language Mode", async () => {
  const res = await askMchambuziHalisi(
    "How is Arsenal performing in recent matches?",
    { live: [], upcoming: [], recent: [] },
    "sheng"
  );

  assert.ok(res.answer, "Mchambuzi answer must not be empty");
  assert.ok(res.context, "Mchambuzi context must be present");
});

test("2. Page Context Sensitivity Support", async () => {
  const pageCtx: MchambuziPageContext = {
    pageType: "match",
    entityName: "Arsenal vs Chelsea",
    matchDetails: { home: "Arsenal", away: "Chelsea", league: "Premier League" },
  };

  const res = await askMchambuziHalisi(
    "What are the key tactical matchups?",
    { live: [], upcoming: [], recent: [] },
    "en",
    pageCtx
  );

  assert.ok(res.answer, "Answer with page context must execute");
});
