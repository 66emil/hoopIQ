import { useEffect, useMemo, useState } from 'react';
import { User } from '../types';
import { apiLogin, apiMe, apiRegister } from '../services/api';

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
    // оповестим другие инстансы хуков
    try { window.dispatchEvent(new CustomEvent('auth:changed')); } catch {}
  }, [accessToken]);

  // подписка на изменения токена из других вкладок/компонентов
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

  useEffect(() => {
    (async () => {
      if (!accessToken) { setCurrentUser(null); return; }
      try {
        const me = await apiMe(accessToken);
        setCurrentUser({ ...me } as PublicUser);
      } catch {
        setCurrentUser(null);
        setAccessToken(null);
      }
    })();
  }, [accessToken]);

  const register = async (email: string, password: string, name: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const { accessToken } = await apiRegister(name, email, password);
      setAccessToken(accessToken);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Ошибка регистрации' };
    }
  };

  const login = async (email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const { accessToken } = await apiLogin(email, password);
      setAccessToken(accessToken);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Неверный логин или пароль' };
    }
  };

  const logout = () => setAccessToken(null);

  const updateProfile = (updates: Partial<Pick<User, 'name'>>) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return {
    currentUser,
    accessToken,
    register,
    login,
    logout,
    updateProfile
  };
};


