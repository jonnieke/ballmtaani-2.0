#!/usr/bin/env node

/**
 * WC26 Load Testing Script
 * Simulates concurrent users interacting with real-time features
 * Tests: Predictions, Comments, Polls, Debates
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY environment variables"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface LoadTestConfig {
  concurrentUsers: number;
  duration: number; // seconds
  testPredictions: boolean;
  testComments: boolean;
  testPolls: boolean;
  testDebateFlags: boolean;
}

interface TestResults {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
  errorsBy: Record<string, number>;
}

async function simulateUser(
  userId: number,
  config: LoadTestConfig,
  results: TestResults,
  endTime: number
) {
  while (Date.now() < endTime) {
    try {
      // Random test to run
      const tests = [
        config.testPredictions && "prediction",
        config.testComments && "comment",
        config.testPolls && "poll",
        config.testDebateFlags && "flag",
      ].filter(Boolean);

      if (tests.length === 0) break;

      const test = tests[Math.floor(Math.random() * tests.length)] as string;
      const startTime = performance.now();

      switch (test) {
        case "prediction":
          await testPrediction(userId);
          break;
        case "comment":
          await testComment(userId);
          break;
        case "poll":
          await testPoll(userId);
          break;
        case "flag":
          await testDebateFlag(userId);
          break;
      }

      const latency = performance.now() - startTime;
      results.totalRequests++;
      results.successCount++;
      results.avgLatency += latency;
      results.maxLatency = Math.max(results.maxLatency, latency);
      results.minLatency = Math.min(results.minLatency, latency);
    } catch (error: any) {
      results.totalRequests++;
      results.errorCount++;
      const errorType = error?.code || error?.message || "unknown";
      results.errorsBy[errorType] = (results.errorsBy[errorType] || 0) + 1;
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function testPrediction(userId: number) {
  const matchId = `match-${Math.floor(Math.random() * 100)}`;
  const result = ["home", "draw", "away"][Math.floor(Math.random() * 3)];

  // Check existing prediction
  const { data: existing } = await supabase
    .from("predictions")
    .select("id")
    .eq("match_id", matchId)
    .eq("user_id", `user-${userId}`)
    .single();

  if (!existing) {
    // Insert prediction
    await supabase.from("predictions").insert({
      match_id: matchId,
      user_id: `user-${userId}`,
      predicted_score: `${Math.floor(Math.random() * 5)}-${Math.floor(Math.random() * 5)}`,
      result,
      status: "locked",
    });
  }
}

async function testComment(userId: number) {
  const matchId = `match-${Math.floor(Math.random() * 100)}`;

  await supabase.from("match_comments").insert({
    match_id: matchId,
    user_id: `user-${userId}`,
    user_name: `Fan${userId}`,
    text: `Test comment ${Date.now()}`,
    reaction: ["goal", "save", "tackle"][Math.floor(Math.random() * 3)],
  });
}

async function testPoll(userId: number) {
  const fanZoneId = `zone-${Math.floor(Math.random() * 20)}`;

  // Get available polls
  const { data: polls } = await supabase
    .from("fan_zone_polls")
    .select("id, options")
    .eq("fan_zone_id", fanZoneId)
    .eq("status", "active")
    .limit(1);

  if (polls && polls.length > 0) {
    const poll = polls[0];
    const options = poll.options as any[];
    if (options.length > 0) {
      const selectedOption = options[Math.floor(Math.random() * options.length)];

      await supabase.from("poll_votes").insert({
        poll_id: poll.id,
        user_id: `user-${userId}`,
        option_id: selectedOption.id,
      });
    }
  }
}

async function testDebateFlag(userId: number) {
  // Get a random debate
  const { data: debates } = await supabase
    .from("debates")
    .select("id")
    .limit(1);

  if (debates && debates.length > 0) {
    const debate = debates[0];
    const reasons = ["spam", "inappropriate", "misinformation", "duplicate"];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];

    try {
      await supabase.from("debate_flags").insert({
        debate_id: debate.id,
        user_id: `user-${userId}`,
        reason,
        details: `Test flag at ${new Date().toISOString()}`,
      });
    } catch (err: any) {
      if (err?.code !== "23505") throw err; // Ignore unique constraint errors
    }
  }
}

async function runLoadTest(config: LoadTestConfig) {
  console.log("\n🚀 WC26 Load Test Starting...\n");
  console.log(`📊 Config:`);
  console.log(
    `   • Concurrent users: ${config.concurrentUsers}`
  );
  console.log(`   • Duration: ${config.duration}s`);
  console.log(`   • Tests: ${
    [
      config.testPredictions && "Predictions",
      config.testComments && "Comments",
      config.testPolls && "Polls",
      config.testDebateFlags && "Flags",
    ]
      .filter(Boolean)
      .join(", ")
  }\n`);

  const results: TestResults = {
    totalRequests: 0,
    successCount: 0,
    errorCount: 0,
    avgLatency: 0,
    maxLatency: 0,
    minLatency: Infinity,
    errorsBy: {},
  };

  const startTime = Date.now();
  const endTime = startTime + config.duration * 1000;

  // Start all users
  const users = Array.from({ length: config.concurrentUsers }, (_, i) =>
    simulateUser(i, config, results, endTime)
  );

  // Progress indicator
  const progressInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const successRate = results.totalRequests
      ? ((results.successCount / results.totalRequests) * 100).toFixed(1)
      : "0";
    process.stdout.write(
      `\r⏳ ${elapsed}s | ${results.totalRequests} requests | ${successRate}% success`
    );
  }, 1000);

  // Wait for all users to finish
  await Promise.all(users);
  clearInterval(progressInterval);

  // Calculate averages
  if (results.successCount > 0) {
    results.avgLatency = results.avgLatency / results.successCount;
  }

  console.log("\n\n✅ Load Test Complete!\n");
  console.log("📈 Results:");
  console.log(`   • Total Requests: ${results.totalRequests}`);
  console.log(
    `   • Success Rate: ${((results.successCount / results.totalRequests) * 100).toFixed(1)}%`
  );
  console.log(`   • Avg Latency: ${results.avgLatency.toFixed(2)}ms`);
  console.log(`   • Max Latency: ${results.maxLatency.toFixed(2)}ms`);
  console.log(`   • Min Latency: ${results.minLatency.toFixed(2)}ms`);

  if (results.errorCount > 0) {
    console.log(`\n⚠️  Errors (${results.errorCount}):`);
    Object.entries(results.errorsBy).forEach(([error, count]) => {
      console.log(`   • ${error}: ${count}`);
    });
  }

  // Performance assessment
  console.log("\n🎯 Assessment:");
  if (results.avgLatency < 200) {
    console.log("   ✅ Latency excellent (<200ms avg)");
  } else if (results.avgLatency < 500) {
    console.log("   ⚠️  Latency acceptable (<500ms avg)");
  } else {
    console.log("   ❌ Latency poor (>500ms avg) - optimize needed");
  }

  if (results.successCount / results.totalRequests > 0.99) {
    console.log("   ✅ Success rate excellent (>99%)");
  } else if (results.successCount / results.totalRequests > 0.95) {
    console.log("   ⚠️  Success rate acceptable (>95%)");
  } else {
    console.log("   ❌ Success rate low (<95%) - investigate errors");
  }

  console.log("\n");
}

// Config for WC26 launch stress test
const config: LoadTestConfig = {
  concurrentUsers: parseInt(process.env.LOAD_TEST_USERS || "100"),
  duration: parseInt(process.env.LOAD_TEST_DURATION || "60"),
  testPredictions: true,
  testComments: true,
  testPolls: true,
  testDebateFlags: true,
};

runLoadTest(config).catch((error) => {
  console.error("❌ Load test failed:", error);
  process.exit(1);
});
