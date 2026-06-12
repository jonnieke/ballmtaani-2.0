/**
 * SportyTV Africa media feed.
 *
 * Combines two public sources server-side (no CORS in the browser):
 *  - the channel's RSS feed (recent uploads + live streams)
 *  - the channel's Streams tab via the InnerTube browse endpoint, which is the
 *    only place scheduled streams ("Upcoming", with start times) appear
 *
 * Playback always happens through the official YouTube embed player, so views
 * stay credited to the channel.
 */

const CHANNEL_ID = "UCwu87p766uwEyzG1p8dEMlg"; // youtube.com/@sportytvafrica
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const BROWSE_URL = "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false";

type Video = {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  isLive: boolean;
  isUpcoming: boolean;
  startsAt: number | null; // epoch ms for scheduled streams
  membersOnly: boolean;
};

function decodeHtml(value: string): string {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function thumbOf(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function looksMembersOnly(title: string, badges: string[]): boolean {
  return badges.some(b => /member/i.test(b)) || /\bmembers?\b/i.test(title);
}

function parseFeed(xml: string): Video[] {
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
  const videos: Video[] = [];
  for (const entry of entries) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = decodeHtml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").trim();
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || "";
    if (!id || !title) continue;
    videos.push({
      id,
      title,
      published,
      thumbnail: thumbOf(id),
      isLive: /(^|\W)LIVE(\W|$)/i.test(title) && !/COUNTDOWN/i.test(title),
      isUpcoming: false,
      startsAt: null,
      membersOnly: looksMembersOnly(title, []),
    });
  }
  return videos;
}

// "Scheduled for 6/12/26, 6:00 PM" — request is pinned to UTC + en-US, so the
// string is deterministic and parses as UTC.
function parseScheduled(text: string): number | null {
  const m = text.match(/Scheduled for (\d+)\/(\d+)\/(\d+), (\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  const [, mo, day, yy, hh, min, ap] = m;
  let hour = Number(hh) % 12;
  if (/pm/i.test(ap)) hour += 12;
  return Date.UTC(2000 + Number(yy), Number(mo) - 1, Number(day), hour, Number(min));
}

function collectStrings(node: any, key: "text" | "content", out: string[]) {
  if (!node || typeof node !== "object") return;
  if (typeof node[key] === "string") out.push(node[key]);
  for (const v of Object.values(node)) collectStrings(v, key, out);
}

async function fetchStreamsTab(): Promise<Video[]> {
  const res = await fetch(BROWSE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20240101.00.00",
          hl: "en",
          // gl=KE: SportyTV's streams are Africa-targeted; from US server IPs
          // YouTube hides the upcoming items unless the geo context is Kenyan.
          gl: "KE",
          timeZone: "UTC",
          utcOffsetMinutes: 0,
        },
      },
      browseId: CHANNEL_ID,
      params: "EgdzdHJlYW1z", // Streams tab
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();

  const found = new Map<string, Video>();
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    const lv = node.lockupViewModel;
    if (lv?.contentId && !found.has(lv.contentId)) {
      const badges: string[] = [];
      collectStrings(lv.contentImage, "text", badges);
      const meta: string[] = [];
      collectStrings(lv.metadata, "content", meta);
      const title = meta[0] || "";
      const scheduledText = meta.find(t => /Scheduled for/i.test(t)) || "";
      const startsAt = parseScheduled(scheduledText);
      const isLive = badges.some(b => /^LIVE$/i.test(b.trim()));
      const isUpcoming = badges.some(b => /^Upcoming$/i.test(b.trim()));
      if (title) {
        found.set(lv.contentId, {
          id: lv.contentId,
          title,
          published: startsAt ? new Date(startsAt).toISOString() : "",
          thumbnail: thumbOf(lv.contentId),
          isLive,
          isUpcoming,
          startsAt,
          membersOnly: looksMembersOnly(title, badges),
        });
      }
    }
    for (const v of Object.values(node)) walk(v);
  };
  walk(data);
  return [...found.values()];
}

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.end(JSON.stringify(body));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const [feedResult, streamsResult] = await Promise.allSettled([
      fetch(FEED_URL, { headers: { "User-Agent": "Mozilla/5.0 (compatible; BallMtaani/1.0)" } })
        .then(r => (r.ok ? r.text() : ""))
        .then(parseFeed),
      fetchStreamsTab(),
    ]);
    const fromFeed = feedResult.status === "fulfilled" ? feedResult.value : [];
    const fromStreams = streamsResult.status === "fulfilled" ? streamsResult.value : [];

    // Streams-tab data wins (it has authoritative live/upcoming state and
    // start times); RSS fills in anything the tab didn't surface.
    const merged = new Map<string, Video>();
    for (const v of fromStreams) merged.set(v.id, v);
    for (const v of fromFeed) {
      const existing = merged.get(v.id);
      if (existing) {
        if (!existing.published) existing.published = v.published;
      } else {
        merged.set(v.id, v);
      }
    }

    return json(res, 200, { channelId: CHANNEL_ID, videos: [...merged.values()] });
  } catch (error) {
    return json(res, 200, { channelId: CHANNEL_ID, videos: [], error: String(error) });
  }
}
