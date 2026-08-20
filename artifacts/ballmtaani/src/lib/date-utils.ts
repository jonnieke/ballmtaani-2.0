/**
 * BallMtaani Timezone & Date Utilities
 * Primary target timezone: Africa/Nairobi (EAT / UTC+3)
 */

const KENYA_TIMEZONE = "Africa/Nairobi";

/**
 * Safely parse any date input (ISO string, timestamp, or Date)
 */
export function parseDate(dateInput: string | number | Date): Date {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === "number") return new Date(dateInput);
  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Format a kickoff time in Africa/Nairobi (EAT)
 * Example: "19:30 EAT" or "20:00"
 */
export function formatKenyanTime(dateInput: string | number | Date, includeLabel: boolean = true): string {
  const d = parseDate(dateInput);
  const formatter = new Intl.DateTimeFormat("en-KE", {
    timeZone: KENYA_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const formatted = formatter.format(d);
  return includeLabel ? `${formatted} EAT` : formatted;
}

/**
 * Format a full date & time in Africa/Nairobi timezone
 * Example: "Sat, 6 Sep 2026 at 19:30 EAT"
 */
export function formatKenyanDateTime(dateInput: string | number | Date): string {
  const d = parseDate(dateInput);
  const formatter = new Intl.DateTimeFormat("en-KE", {
    timeZone: KENYA_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${formatter.format(d)} EAT`;
}

/**
 * Format date for kickoff display (e.g. "Tomorrow, 19:30 EAT" or "Sep 6, 2026")
 */
export function formatMatchDateHeader(dateInput: string | number | Date): string {
  const d = parseDate(dateInput);
  const now = new Date();
  
  const kenyaDateFormatter = new Intl.DateTimeFormat("en-KE", { timeZone: KENYA_TIMEZONE, dateStyle: "short" });
  const isToday = kenyaDateFormatter.format(d) === kenyaDateFormatter.format(now);
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = kenyaDateFormatter.format(d) === kenyaDateFormatter.format(tomorrow);

  const timeStr = formatKenyanTime(d, true);

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;

  const fullFormatter = new Intl.DateTimeFormat("en-KE", {
    timeZone: KENYA_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${fullFormatter.format(d)} • ${timeStr}`;
}

/**
 * Produce valid ISO 8601 string for Schema.org JSON-LD (e.g. "2026-09-06T19:30:00+03:00")
 */
export function toISO8601WithTimezone(dateInput: string | number | Date): string {
  const d = parseDate(dateInput);
  return d.toISOString();
}
