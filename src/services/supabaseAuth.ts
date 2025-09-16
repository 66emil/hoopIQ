import { getSupabaseClient } from './supabaseClient';

export type SupabaseSession = {
  access_token: string;
};

export async function supabaseRegister(name: string, email: string, password: string): Promise<{ accessToken: string }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  if (error) throw new Error(error.message);
  const session = data.session;
  if (!session?.access_token) {
    throw new Error('Please verify your email to complete registration');
  }
  return { accessToken: session.access_token };
}

export async function supabaseLogin(email: string, password: string): Promise<{ accessToken: string }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.session?.access_token) throw new Error('Could not obtain access token');
  return { accessToken: data.session.access_token };
}

export async function supabaseGetMe(accessToken: string): Promise<{ id: string; email: string; name: string; level: number; points: number; createdAt: string }> {
  const supabase = getSupabaseClient();
  const { data: userData, error } = await supabase.auth.getUser(accessToken);
  if (error || !userData.user) throw new Error(error?.message || 'Failed to fetch profile');
  const user = userData.user;
  return {
    id: user.id,
    email: user.email || '',
    name: (user.user_metadata?.name as string) || user.email || 'User',
    level: 0,
    points: 0,
    createdAt: user.created_at || new Date().toISOString()
  };
}


