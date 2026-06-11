/**
 * SportyTV Africa media feed.
 * Reads the channel's public YouTube RSS feed server-side (no CORS in the browser)
 * and returns a JSON list of recent videos. Playback always happens through the
 * official YouTube embed player, so views stay credited to the channel.
 */

const CHANNEL_ID = "UCwu87p766uwEyzG1p8dEMlg"; // youtube.com/@sportytvafrica
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

type Video = {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  isLive: boolean;
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
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      isLive: /(^|\W)LIVE(\W|$)/i.test(title) && !/COUNTDOWN/i.test(title),
    });
  }
  return videos;
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
    const upstream = await fetch(FEED_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BallMtaani/1.0)" },
    });
    if (!upstream.ok) return json(res, 200, { videos: [], error: `Feed responded ${upstream.status}` });
    const xml = await upstream.text();
    return json(res, 200, { channelId: CHANNEL_ID, videos: parseFeed(xml) });
  } catch (error) {
    return json(res, 200, { channelId: CHANNEL_ID, videos: [], error: String(error) });
  }
}
