import { useState, useEffect } from 'react';
import { QuizVideo, videosList } from '../services/api';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { listVideosFromSupabase } from '../services/supabaseVideos';

export const useQuizVideos = () => {
  const [videos, setVideos] = useState<QuizVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const useSupabase = isSupabaseEnabled();
      const videoList = useSupabase ? await listVideosFromSupabase() : await videosList();
      setVideos(videoList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки видео');
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
    reload: loadVideos
  };
};
