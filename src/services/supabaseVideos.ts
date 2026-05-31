import { getSupabaseClient } from './supabaseClient';
import type { QuizVideo } from '../types';

// Expected table: videos (id uuid/text, title text, description text, category text, difficulty text,
// videoUrl text, thumbnail text, explanationVideoUrl text, createdAt timestamptz)

function deriveYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0] || null;
    if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
    if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

function ensureThumbnail(videoUrl: string, thumb: string | null | undefined): string | null {
  if (thumb) return thumb;
  const id = deriveYoutubeId(videoUrl);
  if (id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

export async function listVideosFromSupabase(): Promise<QuizVideo[]> {
  const supabase = getSupabaseClient();
  const table = (import.meta.env.VITE_SUPABASE_VIDEOS_TABLE as string) || 'videos';

  const { data, error } = await supabase
    .from(table)
    .select('id, title, description, category, difficulty, videoUrl, thumbnail, explanationVideoUrl, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || `Failed to load videos from Supabase table ${table}`);
  }

  return (data || []).map((v: any) => {
    const videoUrl: string = String(v.videoUrl ?? '');
    const thumb = ensureThumbnail(videoUrl, v.thumbnail);
    return {
      id: String(v.id),
      title: String(v.title ?? ''),
      description: v.description ?? null,
      category: (v.category as 'offense' | 'defense') ?? 'offense',
      difficulty: (v.difficulty as 'beginner' | 'intermediate' | 'advanced') ?? 'beginner',
      videoUrl,
      thumbnail: thumb,
      explanationVideoUrl: v.explanationVideoUrl ?? null,
      createdAt: v.created_at ?? new Date().toISOString()
    } as QuizVideo;
  });
}


