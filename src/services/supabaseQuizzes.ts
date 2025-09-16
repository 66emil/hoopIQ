import { getSupabaseClient } from './supabaseClient';
import type { QuizQuestion } from '../types';

const TABLE = 'quiz_questions';

export async function listQuizzesFromSupabase(): Promise<QuizQuestion[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, title, question, options, correctAnswer, explanation, explanationVideoUrl, difficulty, category, videoUrl, thumbnail, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Failed to load quizzes');
  return (data || []).map((r: any) => ({
    id: String(r.id),
    title: r.title,
    question: r.question,
    options: (r.options as string[]) || [],
    correctAnswer: r.correctAnswer,
    explanation: r.explanation,
    explanationVideoUrl: r.explanationVideoUrl || undefined,
    difficulty: r.difficulty,
    category: r.category,
    videoUrl: r.videoUrl,
    thumbnail: r.thumbnail || undefined
  }));
}

export async function createQuizInSupabase(payload: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion> {
  const supabase = getSupabaseClient();
  const insert = {
    title: payload.title,
    question: payload.question,
    options: payload.options,
    correctAnswer: payload.correctAnswer,
    explanation: payload.explanation,
    explanationVideoUrl: payload.explanationVideoUrl || null,
    difficulty: payload.difficulty,
    category: payload.category,
    videoUrl: payload.videoUrl,
    thumbnail: payload.thumbnail || null
  };
  const { data, error } = await supabase.from(TABLE).insert(insert).select('id, title, question, options, correctAnswer, explanation, explanationVideoUrl, difficulty, category, videoUrl, thumbnail').single();
  if (error) throw new Error(error.message || 'Failed to create quiz');
  return {
    id: String(data.id),
    title: data.title,
    question: data.question,
    options: data.options || [],
    correctAnswer: data.correctAnswer,
    explanation: data.explanation,
    explanationVideoUrl: data.explanationVideoUrl || undefined,
    difficulty: data.difficulty,
    category: data.category,
    videoUrl: data.videoUrl,
    thumbnail: data.thumbnail || undefined
  };
}

export async function updateQuizInSupabase(id: string, updates: Partial<QuizQuestion>): Promise<QuizQuestion> {
  const supabase = getSupabaseClient();
  const payload: any = { ...updates };
  delete payload.id;
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('id, title, question, options, correctAnswer, explanation, explanationVideoUrl, difficulty, category, videoUrl, thumbnail')
    .single();
  if (error) throw new Error(error.message || 'Failed to update quiz');
  return {
    id: String(data.id),
    title: data.title,
    question: data.question,
    options: data.options || [],
    correctAnswer: data.correctAnswer,
    explanation: data.explanation,
    explanationVideoUrl: data.explanationVideoUrl || undefined,
    difficulty: data.difficulty,
    category: data.category,
    videoUrl: data.videoUrl,
    thumbnail: data.thumbnail || undefined
  };
}

export async function deleteQuizInSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message || 'Failed to delete quiz');
}


