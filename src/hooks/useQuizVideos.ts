import { useState, useEffect } from 'react';
import type { QuizVideo } from '../types';
import { listVideosFromSupabase } from '../services/supabaseVideos';
import { getOrFetchCached, readCachedValue, writeCachedValue } from '../services/resourceCache';

const VIDEOS_CACHE_KEY = 'quizVideos:v1';
const VIDEOS_CACHE_STORAGE_KEY = 'basketball-iq-videos-cache-v1';
const VIDEOS_CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchVideos(): Promise<QuizVideo[]> {
  return listVideosFromSupabase();
}

export const useQuizVideos = () => {
  const cached = readCachedValue<QuizVideo[]>(VIDEOS_CACHE_KEY, { ttlMs: VIDEOS_CACHE_TTL_MS, storageKey: VIDEOS_CACHE_STORAGE_KEY });
  const [videos, setVideos] = useState<QuizVideo[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(() => !cached);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = async () => {
    try {
      if (!cached) setIsLoading(true);
      setError(null);
      const videoList = await getOrFetchCached(VIDEOS_CACHE_KEY, fetchVideos, {
        ttlMs: VIDEOS_CACHE_TTL_MS,
        storageKey: VIDEOS_CACHE_STORAGE_KEY
      });
      setVideos(videoList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
      console.error('Failed to load videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return {
    videos,
    isLoading,
    error,
    reload: async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fresh = await fetchVideos();
        writeCachedValue(VIDEOS_CACHE_KEY, fresh, { ttlMs: VIDEOS_CACHE_TTL_MS, storageKey: VIDEOS_CACHE_STORAGE_KEY });
        setVideos(fresh);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setIsLoading(false);
      }
    }
  };
};
