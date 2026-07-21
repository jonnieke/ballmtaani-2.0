import assert from "node:assert";
import { test } from "node:test";
import { performHealthCheck } from "../../api/health";
import { logError, sanitizeLogDetails } from "../lib/observability";
import { calculateCostMetrics } from "../lib/cost-analytics";

test("1. System Health Check Output Schema", () => {
  const health = performHealthCheck();
  assert.ok(health.status === "ok" || health.status === "degraded");
  assert.strictEqual(health.checks.database, "up");
  assert.ok(health.timestamp);
});

test("2. Central Logger PII Redaction & Correlation ID", () => {
  const uncleaned = {
    token: "bearer_secret_123",
    email: "fan@example.com",
    user_name: "SafeUser",
  };

  const clean = sanitizeLogDetails(uncleaned);
  assert.strictEqual(clean.token, "[REDACTED_PII]");
  assert.strictEqual(clean.email, "[REDACTED_PII]");
  assert.strictEqual(clean.user_name, "SafeUser");

  const entry = logError("Database connection warning", { details: uncleaned });
  assert.ok(entry.id.startsWith("ERR-"));
  assert.ok(entry.correlationId.startsWith("CORR-"));
});

test("3. Operational Cost Metrics Calculation", () => {
  const metrics = calculateCostMetrics(1000, 500000, 10000);
  assert.ok(metrics.aiCostUSD > 0);
  assert.ok(metrics.costPerActiveFanUSD > 0);
});
