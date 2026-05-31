import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getSupabaseClient } from '../services/supabaseClient';
import type { UserRole } from '../types';

const CACHE_KEY = 'hoopiq-role-by-user';

type RoleCache = Record<string, UserRole | null>;

const readCache = (): RoleCache => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeCache = (userId: string, role: UserRole | null) => {
  try {
    const cache = readCache();
    cache[userId] = role;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

/**
 * Resolves the current user's role ('coach' | 'player') from the profiles table.
 * Uses a localStorage cache to avoid a loading flash on repeat visits.
 */
export function useRole() {
  const { currentUser, isAuthLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(() => {
    const uid = currentUser?.id;
    return uid ? readCache()[uid] ?? null : null;
  });
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser?.id) {
      setRole(null);
      setIsRoleLoading(false);
      return;
    }

    const cached = readCache()[currentUser.id];
    if (cached !== undefined) setRole(cached);

    let active = true;
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();
        if (!active) return;
        if (error) throw error;
        const next = (data?.role as UserRole | null) ?? null;
        setRole(next);
        writeCache(currentUser.id, next);
      } catch {
        // keep cached value on failure
      } finally {
        if (active) setIsRoleLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [currentUser?.id, isAuthLoading]);

  return { role, isRoleLoading };
}
