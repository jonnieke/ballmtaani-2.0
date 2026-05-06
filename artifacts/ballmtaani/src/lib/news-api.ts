/**
 * Football News Feed
 * Uses rss2json.com to convert RSS feeds to JSON.
 * Falls back to curated mock headlines when API unavailable.
 */

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceLogo: string;
  thumbnail: string;
}

const RSS_FEEDS = [
  {
    url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    source: 'BBC Sport',
    sourceLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  {
    url: 'https://www.goal.com/feeds/en/news',
    source: 'Goal.com',
    sourceLogo: '⚽',
  },
];

const CACHE_KEY = 'mtaani_news_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const MOCK_HEADLINES: NewsArticle[] = [
  {
    id: 'm1',
    title: 'Gor Mahia Clinch KPL Title in Dramatic Final Day Finish',
    link: '#',
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    source: 'KPL',
    sourceLogo: '🇰🇪',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=60',
  },
  {
    id: 'm2',
    title: 'Mbappé Injury Scare Ahead of Champions League Semi-Final',
    link: '#',
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    source: 'Goal.com',
    sourceLogo: '⚽',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=60',
  },
  {
    id: 'm3',
    title: 'Al Ahly Reach CAF Champions League Final for 5th Consecutive Year',
    link: '#',
    pubDate: new Date(Date.now() - 10800000).toISOString(),
    source: 'CAF',
    sourceLogo: '🌍',
    thumbnail: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&q=60',
  },
  {
    id: 'm4',
    title: 'Arsenal Secure Top Four with Stunning Comeback Win at Anfield',
    link: '#',
    pubDate: new Date(Date.now() - 14400000).toISOString(),
    source: 'BBC Sport',
    sourceLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    thumbnail: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&q=60',
  },
  {
    id: 'm5',
    title: 'Kaizer Chiefs Name New Coach as PSL Relegation Battle Heats Up',
    link: '#',
    pubDate: new Date(Date.now() - 18000000).toISOString(),
    source: 'SuperSport',
    sourceLogo: '🇿🇦',
    thumbnail: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=400&q=60',
  },
  {
    id: 'm6',
    title: 'Real Madrid vs Barcelona: El Clásico Preview — Who Holds the Edge?',
    link: '#',
    pubDate: new Date(Date.now() - 21600000).toISOString(),
    source: 'Goal.com',
    sourceLogo: '⚽',
    thumbnail: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&q=60',
  },
  {
    id: 'm7',
    title: 'Simba SC vs Young Africans: Kariakoo Derby Sets Dar es Salaam Ablaze',
    link: '#',
    pubDate: new Date(Date.now() - 25200000).toISOString(),
    source: 'Azam TV',
    sourceLogo: '🇹🇿',
    thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&q=60',
  },
  {
    id: 'm8',
    title: 'FIFA Announces 2030 World Cup African Host Nations',
    link: '#',
    pubDate: new Date(Date.now() - 32400000).toISOString(),
    source: 'FIFA',
    sourceLogo: '🌐',
    thumbnail: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=60',
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export { timeAgo };

export async function fetchFootballNews(): Promise<NewsArticle[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch {
    // ignore cache errors
  }

  const articles: NewsArticle[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=4`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();

      if (json.status === 'ok' && json.items) {
        for (const item of json.items) {
          articles.push({
            id: item.guid || item.link,
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: feed.source,
            sourceLogo: feed.sourceLogo,
            thumbnail: item.thumbnail || item.enclosure?.link || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=60',
          });
        }
      }
    } catch {
      // Feed failed, continue to next
    }
  }

  const result = articles.length > 0 ? articles : MOCK_HEADLINES;

  // Cache result
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
  } catch {
    // ignore
  }

  return result;
}
