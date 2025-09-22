import { getSupabaseClient } from './supabaseClient';

export type ProfileData = {
  id: string; // user id
  nickname?: string | null;
  avatarUrl?: string | null; // we store base64 or public URL
  bio?: string | null;
  position?: string | null;
  avatarCropX?: number | null;
  avatarCropY?: number | null;
  avatarScale?: number | null;
  level?: number | null;
  xp?: number | null;
  updatedAt?: string | null;
};

const TABLE = 'profiles';

export async function upsertProfile(data: ProfileData): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = {
    id: data.id,
    nickname: data.nickname ?? null,
    // DB uses snake_case for avatar URL and timestamps
    avatar_url: data.avatarUrl ?? null,
    bio: data.bio ?? null,
    position: data.position ?? null,
    avatarCropX: data.avatarCropX ?? null,
    avatarCropY: data.avatarCropY ?? null,
    avatarScale: data.avatarScale ?? null,
    level: data.level ?? null,
    xp: data.xp ?? null,
    updated_at: new Date().toISOString()
  };
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(error.message || 'Failed to save profile');
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, nickname, avatar_url, bio, position, avatarCropX, avatarCropY, avatarScale, updated_at, level, xp')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message || 'Failed to load profile');
  if (!data) return null;
  // Map DB fields (snake_case) to frontend camelCase
  return {
    id: data.id,
    nickname: data.nickname ?? null,
    avatarUrl: (data as any).avatar_url ?? null,
    bio: data.bio ?? null,
    position: data.position ?? null,
    avatarCropX: (data as any).avatarCropX ?? null,
    avatarCropY: (data as any).avatarCropY ?? null,
    avatarScale: (data as any).avatarScale ?? null,
    level: (data as any).level ?? null,
    xp: (data as any).xp ?? null,
    updatedAt: (data as any).updated_at ?? null
  } as ProfileData;
}

// Update only progress fields (level, xp) and timestamp; create row if missing
export async function upsertProfileProgress(params: { id: string; level: number; xp: number }): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = {
    id: params.id,
    level: params.level,
    xp: params.xp,
    updated_at: new Date().toISOString()
  };
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(error.message || 'Failed to update profile progress');
}


