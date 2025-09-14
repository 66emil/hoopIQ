import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true
    }
  });
  return cachedClient;
}

export function isSupabaseEnabled(): boolean {
  return String(import.meta.env.VITE_USE_SUPABASE).toLowerCase() === 'true';
}


