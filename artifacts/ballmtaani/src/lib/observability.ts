/**
 * BallMtaani Central Observability & Error Logger Engine
 * Structured error logging with correlation IDs and automated PII sanitization.
 */

export interface LogEntry {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  route?: string;
  operation?: string;
  provider?: string;
  correlationId: string;
  timestamp: string;
  details?: Record<string, any>;
}

/**
 * Sanitize error log payload to ensure PII (tokens, passwords, phone numbers, emails) is never logged
 */
export function sanitizeLogDetails(details?: Record<string, any>): Record<string, any> {
  if (!details) return {};
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(details)) {
    const k = key.toLowerCase();
    if (
      k.includes("token") ||
      k.includes("password") ||
      k.includes("auth") ||
      k.includes("secret") ||
      k.includes("email") ||
      k.includes("phone")
    ) {
      clean[key] = "[REDACTED_PII]";
    } else if (typeof value === "object" && value !== null) {
      clean[key] = sanitizeLogDetails(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

export function logError(
  message: string,
  context: { route?: string; operation?: string; provider?: string; details?: Record<string, any> } = {}
): LogEntry {
  const entry: LogEntry = {
    id: `ERR-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    level: "error",
    message,
    route: context.route || "global",
    operation: context.operation || "unknown",
    provider: context.provider,
    correlationId: `CORR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    details: sanitizeLogDetails(context.details),
  };

  console.error(`[BallMtaani Error] [${entry.correlationId}] ${message}`, entry.details);
  return entry;
}
