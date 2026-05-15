import { useEffect, useState } from 'react';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { isUserAdmin } from '../services/supabaseAdmins';

const CACHE_KEY = 'basketball-iq-admins';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
    if (!isSupabaseEnabled()) { setIsAdmin(false); setIsLoading(false); return; }
    if (isAuthLoading) { setIsLoading(true); return; }
    if (!currentUser?.id) { setIsAdmin(false); setIsLoading(false); return; }

    let isMounted = true;
    const cache = readCache();
    const cached = cache.byUserId[currentUser.id];
    const isCacheValid = typeof cached === 'boolean' && Date.now() - cache.updatedAt < CACHE_TTL_MS;

    if (isCacheValid) {
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
        writeCache({
          byUserId: { ...readCache().byUserId, [currentUser.id]: ok },
          updatedAt: Date.now(),
        });
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
