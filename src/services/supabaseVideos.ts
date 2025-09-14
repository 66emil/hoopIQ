import { getSupabaseClient } from './supabaseClient';
import type { QuizVideo } from './api';

// Expected table: videos (id uuid/text, title text, description text, category text, difficulty text,
// videoUrl text, thumbnail text, explanationVideoUrl text, createdAt timestamptz)

export async function listVideosFromSupabase(): Promise<QuizVideo[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('videos')
    .select('id, title, description, category, difficulty, videoUrl, thumbnail, explanationVideoUrl, createdAt')
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to load videos from Supabase');
  }

  // Ensure types/shape match QuizVideo
  return (data || []).map(v => ({
    id: String(v.id),
    title: v.title as string,
    description: (v as any).description ?? null,
    category: (v.category as 'offense' | 'defense') ?? 'offense',
    difficulty: (v.difficulty as 'beginner' | 'intermediate' | 'advanced') ?? 'beginner',
    videoUrl: v.videoUrl as string,
    thumbnail: (v as any).thumbnail ?? null,
    explanationVideoUrl: (v as any).explanationVideoUrl ?? null,
    createdAt: (v as any).createdAt ?? new Date().toISOString()
  }));
}


