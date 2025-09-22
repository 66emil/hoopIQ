import { useEffect, useState } from 'react';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { isUserAdmin } from '../services/supabaseAdmins';

const CACHE_KEY = 'basketball-iq-admins';

type AdminCache = {
  byUserId: Record<string, boolean>;
  updatedAt: number;
};

const readCache = (): AdminCache => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { byUserId: {}, updatedAt: 0 };
    const parsed = JSON.parse(raw);
    return { byUserId: parsed.byUserId || {}, updatedAt: parsed.updatedAt || 0 };
  } catch {
    return { byUserId: {}, updatedAt: 0 };
  }
};

const writeCache = (cache: AdminCache) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
};

export function useIsAdmin() {
  const { currentUser, isAuthLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // если не Supabase — выключаем фичу, админов нет
    if (!isSupabaseEnabled()) { setIsAdmin(false); setIsLoading(false); return; }
    if (isAuthLoading) { setIsLoading(true); return; }
    if (!currentUser?.id) { setIsAdmin(false); setIsLoading(false); return; }

    let isMounted = true;
    const cache = readCache();
    const cached = cache.byUserId[currentUser.id];
    if (typeof cached === 'boolean') {
      setIsAdmin(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    (async () => {
      try {
        const ok = await isUserAdmin(currentUser.id);
        if (!isMounted) return;
        setIsAdmin(ok);
        const next: AdminCache = {
          byUserId: { ...readCache().byUserId, [currentUser.id]: ok },
          updatedAt: Date.now()
        };
        writeCache(next);
      } catch {
        if (!isMounted) return;
        setIsAdmin(false);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [currentUser?.id, isAuthLoading]);

  return { isAdmin, isAdminLoading: isLoading };
}


