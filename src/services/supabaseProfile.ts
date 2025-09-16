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
  updatedAt?: string | null;
};

const TABLE = 'profiles';

export async function upsertProfile(data: ProfileData): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = {
    id: data.id,
    nickname: data.nickname ?? null,
    avatarUrl: data.avatarUrl ?? null,
    bio: data.bio ?? null,
    position: data.position ?? null,
    avatarCropX: data.avatarCropX ?? null,
    avatarCropY: data.avatarCropY ?? null,
    avatarScale: data.avatarScale ?? null,
    updatedAt: new Date().toISOString()
  };
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(error.message || 'Failed to save profile');
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, nickname, avatarUrl, bio, position, avatarCropX, avatarCropY, avatarScale, updatedAt')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message || 'Failed to load profile');
  return data as ProfileData | null;
}


