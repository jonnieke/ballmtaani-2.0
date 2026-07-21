import assert from "node:assert";
import { test } from "node:test";
import { getActiveCampaign, isFrequencyCapExceeded, SAMPLE_CAMPAIGNS } from "../lib/ad-campaigns";

test("1. Ad Campaign Placement Filtering", () => {
  const hpCampaign = getActiveCampaign("homepage", SAMPLE_CAMPAIGNS);
  assert.ok(hpCampaign);
  assert.strictEqual(hpCampaign?.sponsorName, "Safaricom M-PESA Matchday");

  const mcCampaign = getActiveCampaign("match-centre", SAMPLE_CAMPAIGNS);
  assert.ok(mcCampaign);
  assert.strictEqual(mcCampaign?.sponsorName, "Kenya Airways Harambee Stars Partner");
});

test("2. Frequency Cap Evaluation", () => {
  assert.strictEqual(isFrequencyCapExceeded("CAMP-001", 3, 5), false);
  assert.strictEqual(isFrequencyCapExceeded("CAMP-001", 5, 5), true);
});
