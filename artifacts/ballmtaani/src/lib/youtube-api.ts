/**
 * SportyTV Africa (youtube.com/@sportytvafrica) media feed.
 * Videos are listed from the channel's public RSS feed via /api/youtube and
 * always played through the official YouTube embed player — views, ads and
 * watch time stay credited to the channel owner.
 */

export interface SportyVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  isLive: boolean;
  isUpcoming?: boolean;
  startsAt?: number | null; // epoch ms for scheduled streams
  membersOnly?: boolean;
}

// SportyTV streams several sports; the homepage player is football-first
const NON_FOOTBALL = /basket|liga acb|nba|euroleague|mma|pfl|ufc|boxing|wrestl|tennis|rugby|cricket|darts|nfl|baseball|hockey|esport|f1|formula/i;

export function isFootballVideo(v: SportyVideo): boolean {
  return !NON_FOOTBALL.test(v.title);
}

/**
 * Pick the hero stream, football first: a free live football stream, then the
 * next free scheduled football stream by start time (YouTube's embed shows its
 * own countdown waiting room), then any other free live/scheduled stream, then
 * the latest regular video.
 */
export function pickHeroStream(videos: SportyVideo[]): SportyVideo | null {
  const free = videos.filter(v => !v.membersOnly);
  const byStart = (a: SportyVideo, b: SportyVideo) => (a.startsAt || 0) - (b.startsAt || 0);

  for (const pool of [free.filter(isFootballVideo), free]) {
    const live = pool.find(v => v.isLive);
    if (live) return live;
    const upcoming = pool.filter(v => v.isUpcoming && v.startsAt).sort(byStart);
    if (upcoming.length) return upcoming[0];
  }
  return free.find(v => !v.isUpcoming) || videos[0] || null;
}

export function formatStartTime(startsAt: number): string {
  const d = new Date(startsAt);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const day = d.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const time = d.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Nairobi" });
  if (day === today) return `Today ${time} EAT`;
  const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "Africa/Nairobi" });
  return `${label} · ${time} EAT`;
}

export const SPORTYTV_CHANNEL_ID = "UCwu87p766uwEyzG1p8dEMlg";
export const SPORTYTV_CHANNEL_URL = "https://www.youtube.com/@sportytvafrica";

const CACHE_KEY = "mtaani_sportytv_cache";
const CACHE_TTL = 10 * 60 * 1000;

export function embedUrl(videoId: string, autoplay = false): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`;
}

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// ─── Region/embed-blocked videos (detected client-side by the player) ───
// Persisted briefly so a viewer doesn't re-hit the same blocked stream on
// every visit. Restrictions are per-viewer-country, so this never goes to
// the server — each browser keeps its own list.
const BLOCK_KEY = "mtaani_yt_blocked_v1";
const BLOCK_TTL = 6 * 60 * 60 * 1000;

export function getBlockedVideoIds(): Set<string> {
  try {
    const raw = localStorage.getItem(BLOCK_KEY);
    if (!raw) return new Set();
    const { ids, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > BLOCK_TTL || !Array.isArray(ids)) return new Set();
    return new Set(ids);
  } catch {
    return new Set();
  }
}

export function markVideoBlocked(id: string): Set<string> {
  const ids = getBlockedVideoIds();
  ids.add(id);
  try { localStorage.setItem(BLOCK_KEY, JSON.stringify({ ids: [...ids], timestamp: Date.now() })); } catch { /* quota */ }
  return ids;
}

export async function fetchSportyVideos(): Promise<SportyVideo[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL && Array.isArray(data) && data.length) return data;
    }
  } catch { /* ignore cache errors */ }

  try {
    const res = await fetch("/api/youtube");
    if (!res.ok) return [];
    const data = await res.json();
    const videos: SportyVideo[] = Array.isArray(data?.videos) ? data.videos : [];
    if (videos.length) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: videos, timestamp: Date.now() })); } catch { /* quota */ }
    }
    return videos;
  } catch {
    return [];
  }
}
