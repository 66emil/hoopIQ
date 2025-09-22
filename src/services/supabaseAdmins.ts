import { getSupabaseClient } from './supabaseClient';

const TABLE = 'admins';

export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('user_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message || 'Failed to check admin');
  }
  return Boolean(data?.user_id);
}

export async function listAdmins(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('user_id');
  if (error) throw new Error(error.message || 'Failed to load admins');
  return (data || []).map((r: any) => String(r.user_id));
}


