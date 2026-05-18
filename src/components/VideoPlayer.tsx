import { useRef, useEffect, useState, useMemo } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  stopAt?: number;
  className?: string;
  hideOverlayControls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  onTimeUpdate,
  onEnded,
  stopAt,
  className = '',
  hideOverlayControls = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether the YT iframe has been started (hides the play overlay after first click)
  const [ytStarted, setYtStarted] = useState(false);

  const sourceKind = useMemo(() => {
    const url = src || '';
    const lower = url.toLowerCase();
    if (/^https?:\/\/.+youtube\.com\//.test(lower) || /^https?:\/\/youtu\.be\//.test(lower)) return 'youtube';
    if (/^https?:\/\/.+vimeo\.com\//.test(lower)) return 'vimeo';
    if (/(\.mp4|\.webm|\.ogg)(\?.*)?$/.test(lower)) return 'html5';
    if (/(\.m3u8)(\?.*)?$/.test(lower)) return 'hls';
    return 'unknown';
  }, [src]);

  // Reset ytStarted when video src changes (e.g. quiz switches to explanation video)
  useEffect(() => {
    setYtStarted(false);
  }, [src]);

  const youTubeVideoId = useMemo(() => {
    if (sourceKind !== 'youtube') return '';
    try {
      const url = new URL(src);
      if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || '';
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || '';
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || '';
      return url.searchParams.get('v') || '';
    } catch {
      return '';
    }
  }, [sourceKind, src]);

  const youTubeEmbedUrl = useMemo(() => {
    if (!youTubeVideoId) return '';
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      iv_load_policy: '3',
      controls: '0',       // hide native YT controls
      autoplay: '1',       // autoplay on load
      loop: '1',           // loop the video
      playlist: youTubeVideoId, // required for loop to work in iframe
      enablejsapi: '1',    // allows postMessage control (fallback if autoplay blocked)
    });
    return `https://www.youtube.com/embed/${youTubeVideoId}?${params.toString()}`;
  }, [youTubeVideoId]);

  const vimeoEmbedUrl = useMemo(() => {
    if (sourceKind !== 'vimeo') return '';
    try {
      const url = new URL(src);
      const parts = url.pathname.split('/').filter(Boolean);
      let id = '';
      if (url.hostname === 'vimeo.com' && parts[0]) id = parts[0];
      if (url.hostname === 'player.vimeo.com' && parts[1]) id = parts[1];
      if (!id) return '';
      return `https://player.vimeo.com/video/${id}`;
    } catch {
      return '';
    }
  }, [sourceKind, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
      if (stopAt && time >= stopAt) {
        video.pause();
        setIsPlaying(false);
      }
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => { setIsPlaying(false); onEnded?.(); };
    const handleError = () => setError('Failed to load video');

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [stopAt, onTimeUpdate, onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { video.pause(); } else { video.play(); }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Sends playVideo command via postMessage — works without loading the YT IFrame API script
  const playYouTube = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
      '*',
    );
    setYtStarted(true);
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {sourceKind === 'youtube' ? (
        <div className="relative w-full h-full">
          <iframe
            ref={iframeRef}
            src={youTubeEmbedUrl || undefined}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          {/* Fallback play button — shown if browser blocked autoplay.
              Becomes pointer-events:none after first play so user can't accidentally
              interact with the blocked iframe (controls=0 anyway). */}
          {!ytStarted ? (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              style={{ zIndex: 2, background: 'rgba(0,0,0,0.35)' }}
              onClick={playYouTube}
            >
              <div
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <Play size={28} color="#fff" style={{ marginLeft: 4 }} />
              </div>
            </div>
          ) : (
            /* Transparent blocker — prevents YouTube logo / title clicks after video starts */
            <div className="absolute inset-0" style={{ zIndex: 2, pointerEvents: 'none' }} />
          )}
        </div>
      ) : sourceKind === 'vimeo' ? (
        <iframe
          src={vimeoEmbedUrl || undefined}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          onClick={togglePlay}
          controls
          playsInline
          crossOrigin="anonymous"
          preload="metadata"
        />
      )}

      {!hideOverlayControls && sourceKind !== 'youtube' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center space-x-3">
            <button onClick={togglePlay} className="text-white hover:text-orange-400 transition-colors">
              <Play className="h-6 w-6" />
            </button>

            {(sourceKind === 'html5' || sourceKind === 'hls') ? (
              <div className="flex-1">
                <input
                  type="range" min="0" max={duration || 0} value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {(sourceKind === 'html5' || sourceKind === 'hls') && (
              <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
            )}

            <button onClick={toggleMute} className="text-white hover:text-orange-400 transition-colors">
              <span className="inline-block h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-2 left-2 right-2 text-sm text-red-400 bg-red-900/40 border border-red-700 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
};
