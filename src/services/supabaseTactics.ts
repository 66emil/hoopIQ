import { getSupabaseClient } from './supabaseClient';
import type { Tactic } from '../types';

const TABLE = 'tactics';

export async function listTacticsFromSupabase(): Promise<Tactic[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, title, description, category, difficulty, steps, thumbnail, stepimages, animation, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Failed to load tactics');
  return (data || []).map((r: any) => ({
    id: String(r.id),
    title: r.title,
    description: r.description,
    category: r.category,
    difficulty: r.difficulty,
    steps: (r.steps as any[]) || [],
    thumbnail: r.thumbnail || undefined,
    stepImages: (r.stepimages as any[]) || undefined,
    animation: (r.animation as any) || undefined
  }));
}

export async function createTacticInSupabase(payload: Omit<Tactic, 'id'>): Promise<Tactic> {
  const supabase = getSupabaseClient();
  const insert = {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    difficulty: payload.difficulty,
    steps: payload.steps || [],
    thumbnail: payload.thumbnail || null,
    stepimages: payload.stepImages || null,
    animation: payload.animation || null
  };
  const { data, error } = await supabase.from(TABLE).insert(insert).select('id, title, description, category, difficulty, steps, thumbnail, stepimages, animation').single();
  if (error) throw new Error(error.message || 'Failed to create tactic');
  return {
    id: String(data.id),
    title: data.title,
    description: data.description,
    category: data.category,
    difficulty: data.difficulty,
    steps: data.steps || [],
    thumbnail: data.thumbnail || undefined,
    stepImages: data.stepimages || undefined,
    animation: data.animation || undefined
  };
}

export async function updateTacticInSupabase(id: string, updates: Partial<Tactic>): Promise<Tactic> {
  const supabase = getSupabaseClient();
  const payload: any = { ...updates };
  // Remove id
  delete payload.id;
  if ('stepImages' in payload) { payload.stepimages = payload.stepImages; delete payload.stepImages; }
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select('id, title, description, category, difficulty, steps, thumbnail, stepimages, animation')
    .single();
  if (error) throw new Error(error.message || 'Failed to update tactic');
  return {
    id: String(data.id),
    title: data.title,
    description: data.description,
    category: data.category,
    difficulty: data.difficulty,
    steps: data.steps || [],
    thumbnail: data.thumbnail || undefined,
    stepImages: data.stepimages || undefined,
    animation: data.animation || undefined
  };
}

export async function deleteTacticInSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message || 'Failed to delete tactic');
}


