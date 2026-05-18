import { useRef, useEffect, useState, useMemo } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  stopAt?: number; // время в секундах, когда нужно остановить видео
  className?: string;
  hideOverlayControls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  onTimeUpdate,
  onEnded,
  stopAt,
  className = '',
  hideOverlayControls = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const sourceKind = useMemo(() => {
    const url = src || '';
    const lower = url.toLowerCase();
    if (/^https?:\/\/.+youtube\.com\//.test(lower) || /^https?:\/\/youtu\.be\//.test(lower)) return 'youtube';
    if (/^https?:\/\/.+vimeo\.com\//.test(lower)) return 'vimeo';
    if (/(\.mp4|\.webm|\.ogg)(\?.*)?$/.test(lower)) return 'html5';
    if (/(\.m3u8)(\?.*)?$/.test(lower)) return 'hls';
    return 'unknown';
  }, [src]);

  const youTubeEmbedUrl = useMemo(() => {
    if (sourceKind !== 'youtube') return '';
    try {
      const url = new URL(src);
      // watch?v=, share youtu.be, shorts, embed already
      let id = '';
      if (url.hostname.includes('youtu.be')) {
        id = url.pathname.split('/').filter(Boolean)[0] || '';
      } else if (url.pathname.startsWith('/shorts/')) {
        id = url.pathname.split('/')[2] || '';
      } else if (url.pathname.startsWith('/embed/')) {
        id = url.pathname.split('/')[2] || '';
      } else {
        id = url.searchParams.get('v') || '';
      }
      if (!id) return '';
      const params = new URLSearchParams({ rel: '0', modestbranding: '1', iv_load_policy: '3' });
      return `https://www.youtube.com/embed/${id}?${params.toString()}`;
    } catch {
      return '';
    }
  }, [sourceKind, src]);

  const vimeoEmbedUrl = useMemo(() => {
    if (sourceKind !== 'vimeo') return '';
    try {
      const url = new URL(src);
      // vimeo.com/{id} or player.vimeo.com/video/{id}
      let id = '';
      const parts = url.pathname.split('/').filter(Boolean);
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

      // Остановить видео в указанное время
      if (stopAt && time >= stopAt) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    const handleError = () => setError('Failed to load video');
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

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
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

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {sourceKind === 'youtube' ? (
        <div className="relative w-full h-full">
          <iframe
            src={youTubeEmbedUrl || undefined}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          {/* Transparent overlay — blocks YouTube branding clicks without disrupting playback area */}
          <div className="absolute inset-0" style={{ zIndex: 1, pointerEvents: 'none' }} />
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
      
      {!hideOverlayControls && (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            className="text-white hover:text-orange-400 transition-colors"
          >
            <Play className="h-6 w-6" />
          </button>
          
          {sourceKind === 'html5' || sourceKind === 'hls' ? (
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          
          {(sourceKind === 'html5' || sourceKind === 'hls') && (
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}
          
          <button
            onClick={toggleMute}
            className="text-white hover:text-orange-400 transition-colors"
          >
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