import { useEffect, useState } from 'react';
import { User } from '../types';
import { apiLogin, apiMe, apiRegister } from '../services/api';
import { getSupabaseClient, isSupabaseEnabled } from '../services/supabaseClient';
import { supabaseGetMe, supabaseLogin, supabaseRegister } from '../services/supabaseAuth';

const AUTH_SESSION_KEY = 'basketball-iq-session';

type PublicUser = Omit<User, 'passwordHash'>;

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(AUTH_SESSION_KEY));

  useEffect(() => {
    if (accessToken) localStorage.setItem(AUTH_SESSION_KEY, accessToken);
    else localStorage.removeItem(AUTH_SESSION_KEY);
    try { window.dispatchEvent(new CustomEvent('auth:changed')); } catch {}
  }, [accessToken]);

  // Sync token across tabs and other hook instances
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_SESSION_KEY) setAccessToken(e.newValue);
    };
    const onCustom = () => setAccessToken(localStorage.getItem(AUTH_SESSION_KEY));
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
        setCurrentUser(me as PublicUser);
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
          setCurrentUser(me as PublicUser);
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
          setCurrentUser(me as PublicUser);
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
      const { accessToken: token } = isSupabaseEnabled()
        ? await supabaseRegister(name, email, password)
        : await apiRegister(name, email, password);
      setAccessToken(token);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Ошибка регистрации' };
    }
  };

  const login = async (email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const { accessToken: token } = isSupabaseEnabled()
        ? await supabaseLogin(email, password)
        : await apiLogin(email, password);
      setAccessToken(token);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Неверный логин или пароль' };
    }
  };

  const logout = () => {
    if (isSupabaseEnabled()) {
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
    updateProfile,
  };
};
