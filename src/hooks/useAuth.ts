import { useEffect, useMemo, useState } from 'react';
import { User } from '../types';
import { apiLogin, apiMe, apiRegister } from '../services/api';
import { getSupabaseClient, isSupabaseEnabled } from '../services/supabaseClient';
import { supabaseGetMe, supabaseLogin, supabaseRegister } from '../services/supabaseAuth';

const AUTH_USERS_KEY = 'basketball-iq-users'; // legacy local users (fallback)
const AUTH_SESSION_KEY = 'basketball-iq-session'; // stores accessToken now

type PublicUser = Omit<User, 'passwordHash'>;

const encode = (s: string): string => {
  try { return btoa(s); } catch { return s; }
};

const nowIso = () => new Date().toISOString();

export const useAuth = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(AUTH_SESSION_KEY));

  useEffect(() => {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (accessToken) localStorage.setItem(AUTH_SESSION_KEY, accessToken);
    else localStorage.removeItem(AUTH_SESSION_KEY);
    // notify other hook instances
    try { window.dispatchEvent(new CustomEvent('auth:changed')); } catch {}
  }, [accessToken]);

  // subscribe to token changes across tabs/components
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_SESSION_KEY) {
        setAccessToken(e.newValue);
      }
    };
    const onCustom = () => {
      const token = localStorage.getItem(AUTH_SESSION_KEY);
      setAccessToken(token);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:changed', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:changed', onCustom as EventListener);
    };
  }, []);

  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Local API mode
  useEffect(() => {
    if (isSupabaseEnabled()) return;
    setIsAuthLoading(true);
    (async () => {
      if (!accessToken) { setCurrentUser(null); setIsAuthLoading(false); return; }
      try {
        const me = await apiMe(accessToken);
        setCurrentUser({ ...me } as PublicUser);
      } catch {
        setCurrentUser(null);
        setAccessToken(null);
      } finally {
        setIsAuthLoading(false);
      }
    })();
  }, [accessToken]);

  // Supabase: restore session once and subscribe to changes
  useEffect(() => {
    if (!isSupabaseEnabled()) return;
    const supabase = getSupabaseClient();
    let isMounted = true;
    setIsAuthLoading(true);

    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token || null;
      if (!isMounted) return;
      if (token) {
        setAccessToken(token);
        try {
          const me = await supabaseGetMe(token);
          setCurrentUser({ ...me } as PublicUser);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setAccessToken(null);
      }
      setIsAuthLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const token = session?.access_token || null;
      if (token) {
        setAccessToken(token);
        try {
          const me = await supabaseGetMe(token);
          setCurrentUser({ ...me } as PublicUser);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, name: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const useSupabase = isSupabaseEnabled();
      const { accessToken } = useSupabase
        ? await supabaseRegister(name, email, password)
        : await apiRegister(name, email, password);
      setAccessToken(accessToken);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Ошибка регистрации' };
    }
  };

  const login = async (email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const useSupabase = isSupabaseEnabled();
      const { accessToken } = useSupabase
        ? await supabaseLogin(email, password)
        : await apiLogin(email, password);
      setAccessToken(accessToken);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Неверный логин или пароль' };
    }
  };

  const logout = () => {
    const useSupabase = isSupabaseEnabled();
    if (useSupabase) {
      try { getSupabaseClient().auth.signOut(); } catch {}
    }
    setAccessToken(null);
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<Pick<User, 'name'>>) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return {
    currentUser,
    accessToken,
    isAuthLoading,
    register,
    login,
    logout,
    updateProfile
  };
};


