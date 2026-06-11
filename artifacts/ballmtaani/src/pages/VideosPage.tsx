import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Radio } from "lucide-react";
import SEO from "../components/SEO";
import {
  fetchSportyVideos,
  getBlockedVideoIds,
  markVideoBlocked,
  SPORTYTV_CHANNEL_URL,
  type SportyVideo,
} from "../lib/youtube-api";
import YouTubePlayer from "../components/YouTubePlayer";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function VideoCard({ video, active, onPlay }: { video: SportyVideo; active: boolean; onPlay: () => void }) {
  return (
    <button
      onClick={onPlay}
      className={`group flex flex-col overflow-hidden rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 ${
        active ? "border-[#FFD700]/40 bg-[#0d0c04]" : "border-white/8 bg-[#0c111a] hover:border-white/16"
      }`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={video.thumbnail} alt={video.title} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
            <Play className="h-5 w-5 translate-x-[1px] text-white" fill="currentColor" />
          </span>
        </div>
        {video.isLive && (
          <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-[#B30000] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white/70 backdrop-blur-sm">
          {timeAgo(video.published)}
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-xs font-bold leading-snug text-white/85">{video.title}</p>
      </div>
    </button>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<SportyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(() => getBlockedVideoIds());
  const playerRef = useRef<HTMLDivElement>(null);

  // Hide videos this viewer can't play (region-restricted or embed-disabled)
  const playable = useMemo(() => videos.filter(v => !blockedIds.has(v.id)), [videos, blockedIds]);

  useEffect(() => {
    fetchSportyVideos().then(setVideos).finally(() => setLoading(false));
  }, []);

  // Keep a playable video selected — also auto-advances if the current one gets blocked
  useEffect(() => {
    if (!playable.length) { setSelectedId(null); return; }
    if (!selectedId || !playable.some(v => v.id === selectedId)) {
      setSelectedId((playable.find(v => v.isLive) || playable[0]).id);
    }
  }, [playable, selectedId]);

  const handleUnavailable = (id: string) => setBlockedIds(new Set(markVideoBlocked(id)));

  const selected = useMemo(() => playable.find(v => v.id === selectedId) || null, [playable, selectedId]);
  const liveVideos = playable.filter(v => v.isLive);
  const highlights = playable.filter(v => !v.isLive);

  const play = (id: string) => {
    setSelectedId(id);
    setAutoplay(true);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pb-24">
      <SEO
        title="Videos | BallMtaani — Live Matches & Highlights via SportyTV"
        description="Watch live World Cup 2026 matches and football highlights on BallMtaani via the official SportyTV Africa YouTube channel."
        keywords={["football videos", "World Cup 2026 live", "SportyTV", "football highlights Kenya", "BallMtaani videos"]}
        path="/videos"
        breadcrumbs={[{ name: "BallMtaani", url: "/" }, { name: "Videos", url: "/videos" }]}
      />

      <div className="mx-auto max-w-6xl px-4 pt-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <div className="h-px w-6 bg-[#B30000]/60" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#B30000]/80">Media Zone</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              Live Matches & <span className="text-[#FFD700]">Highlights</span>
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/40">
              Streams play through the official <span className="font-semibold text-white/65">SportyTV Africa</span> YouTube channel.
            </p>
          </div>
        </div>

        {/* Featured player */}
        <div ref={playerRef} className="scroll-mt-20">
          {loading ? (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Loading videos…</span>
            </div>
          ) : selected ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="aspect-video">
                <YouTubePlayer
                  key={`${selected.id}-${autoplay}`}
                  videoId={selected.id}
                  title={selected.title}
                  autoplay={autoplay}
                  className="h-full w-full"
                  onUnavailable={handleUnavailable}
                />
              </div>
              <div className="flex items-center gap-2 border-t border-white/8 px-4 py-3">
                {selected.isLive && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-[#B30000] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
                  </span>
                )}
                <p className="truncate text-xs font-bold text-white/80">{selected.title}</p>
              </div>
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-6 text-center">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/35">No videos available right now</span>
              <a href={SPORTYTV_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#FFD700]/80 hover:text-[#FFD700]">Visit SportyTV on YouTube →</a>
            </div>
          )}
        </div>

        {/* Live now */}
        {liveVideos.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-center gap-2.5">
              <Radio className="h-3.5 w-3.5 text-[#B30000]" />
              <h2 className="text-xs font-black uppercase tracking-[0.24em] text-white/70">Live Now</h2>
              <span className="rounded-full bg-[#B30000]/15 px-2 py-0.5 text-[9px] font-black text-[#B30000]">{liveVideos.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {liveVideos.map(v => <VideoCard key={v.id} video={v} active={v.id === selectedId} onPlay={() => play(v.id)} />)}
            </div>
          </section>
        )}

        {/* Highlights & latest */}
        {highlights.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-center gap-2.5">
              <Play className="h-3.5 w-3.5 text-[#FFD700]" />
              <h2 className="text-xs font-black uppercase tracking-[0.24em] text-white/70">Highlights & Latest</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {highlights.map(v => <VideoCard key={v.id} video={v} active={v.id === selectedId} onPlay={() => play(v.id)} />)}
            </div>
          </section>
        )}

        <p className="mt-8 text-center text-[10px] text-white/25">
          All videos are property of SportyTV Africa and play via the official YouTube player.
        </p>
      </div>
    </div>
  );
}
