import { useEffect, useState } from 'react';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { useAuth } from './useAuth';
import { isUserAdmin } from '../services/supabaseAdmins';

const CACHE_KEY = 'basketball-iq-admins';
const AUTH_SESSION_KEY = 'basketball-iq-session';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

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

// Decode JWT payload synchronously (no crypto needed — payload is just base64)
function getSubFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const b64 = token.split('.')[1];
    const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json)?.sub ?? null;
  } catch {
    return null;
  }
}

// Synchronously resolve admin status from cache before first render
function initAdminFromCache(): { isAdmin: boolean; needsFetch: boolean } {
  try {
    const userId = getSubFromToken(localStorage.getItem(AUTH_SESSION_KEY));
    if (!userId) return { isAdmin: false, needsFetch: false };
    const cache = readCache();
    const cached = cache.byUserId[userId];
    if (typeof cached === 'boolean') {
      // Use cached value regardless of TTL; fetch in background to refresh
      return { isAdmin: cached, needsFetch: Date.now() - cache.updatedAt > CACHE_TTL_MS };
    }
    return { isAdmin: false, needsFetch: true };
  } catch {
    return { isAdmin: false, needsFetch: true };
  }
}

export function useIsAdmin() {
  const { currentUser, isAuthLoading } = useAuth();

  const init = initAdminFromCache();
  const [isAdmin, setIsAdmin] = useState<boolean>(init.isAdmin);
  // Only show loading if we have no cached value at all
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isSupabaseEnabled()) { setIsAdmin(false); return; }
    if (isAuthLoading) return;
    if (!currentUser?.id) { setIsAdmin(false); return; }

    const cache = readCache();
    const cached = cache.byUserId[currentUser.id];
    const isCacheValid = typeof cached === 'boolean' && Date.now() - cache.updatedAt < CACHE_TTL_MS;

    // If we have a fresh cache hit, apply it and skip the network call
    if (isCacheValid) {
      setIsAdmin(cached);
      return;
    }

    // Fetch in background — don't block UI with a loading state if we already
    // have a stale cached value to show
    const hasStale = typeof cached === 'boolean';
    if (!hasStale) setIsLoading(true);

    let isMounted = true;
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
        if (!hasStale) setIsAdmin(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [currentUser?.id, isAuthLoading]);

  return { isAdmin, isAdminLoading: isLoading };
}
