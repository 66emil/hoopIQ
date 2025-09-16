import { getSupabaseClient } from './supabaseClient';
import type { QuizQuestion } from '../types';

const TABLE = 'quiz_questions';

export async function listQuizzesFromSupabase(): Promise<QuizQuestion[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, title, question, options, correctanswer, explanation, explanationvideourl, difficulty, category, videourl, thumbnail, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Failed to load quizzes');
  return (data || []).map((r: any) => ({
    id: String(r.id),
    title: r.title,
    question: r.question,
    options: (r.options as string[]) || [],
    correctAnswer: r.correctanswer,
    explanation: r.explanation,
    explanationVideoUrl: r.explanationvideourl || undefined,
    difficulty: r.difficulty,
    category: r.category,
    videoUrl: r.videourl,
    thumbnail: r.thumbnail || undefined
  }));
}

export async function createQuizInSupabase(payload: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion> {
  const supabase = getSupabaseClient();
  const insert = {
    title: payload.title,
    question: payload.question,
    options: payload.options,
    correctanswer: payload.correctAnswer,
    explanation: payload.explanation,
    explanationvideourl: payload.explanationVideoUrl || null,
    difficulty: payload.difficulty,
    category: payload.category,
    videourl: payload.videoUrl,
    thumbnail: payload.thumbnail || null
  };
  const { data, error } = await supabase.from(TABLE).insert(insert).select('id, title, question, options, correctanswer, explanation, explanationvideourl, difficulty, category, videourl, thumbnail').single();
  if (error) throw new Error(error.message || 'Failed to create quiz');
  return {
    id: String(data.id),
    title: data.title,
    question: data.question,
    options: data.options || [],
    correctAnswer: data.correctanswer,
    explanation: data.explanation,
    explanationVideoUrl: data.explanationvideourl || undefined,
    difficulty: data.difficulty,
    category: data.category,
    videoUrl: data.videourl,
    thumbnail: data.thumbnail || undefined
  };
}

export async function updateQuizInSupabase(id: string, updates: Partial<QuizQuestion>): Promise<QuizQuestion> {
  const supabase = getSupabaseClient();
  const payload: any = { ...updates };
  delete payload.id;
  if ('correctAnswer' in payload) { payload.correctanswer = payload.correctAnswer; delete payload.correctAnswer; }
  if ('explanationVideoUrl' in payload) { payload.explanationvideourl = payload.explanationVideoUrl; delete payload.explanationVideoUrl; }
  if ('videoUrl' in payload) { payload.videourl = payload.videoUrl; delete payload.videoUrl; }
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('id, title, question, options, correctanswer, explanation, explanationvideourl, difficulty, category, videourl, thumbnail')
    .single();
  if (error) throw new Error(error.message || 'Failed to update quiz');
  return {
    id: String(data.id),
    title: data.title,
    question: data.question,
    options: data.options || [],
    correctAnswer: data.correctanswer,
    explanation: data.explanation,
    explanationVideoUrl: data.explanationvideourl || undefined,
    difficulty: data.difficulty,
    category: data.category,
    videoUrl: data.videourl,
    thumbnail: data.thumbnail || undefined
  };
}

export async function deleteQuizInSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message || 'Failed to delete quiz');
}


