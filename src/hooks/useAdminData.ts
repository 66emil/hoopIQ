import { useEffect, useMemo, useState } from 'react';
import { Tactic, QuizQuestion, AdminData, Playlist } from '../types';
import { useAuth } from './useAuth';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { listTacticsFromSupabase, createTacticInSupabase, updateTacticInSupabase, deleteTacticInSupabase } from '../services/supabaseTactics';
import { listQuizzesFromSupabase, createQuizInSupabase, updateQuizInSupabase, deleteQuizInSupabase } from '../services/supabaseQuizzes';
import { listPlaylistsFromSupabase, createPlaylistInSupabase, updatePlaylistInSupabase, deletePlaylistInSupabase } from '../services/supabasePlaylists';
import { tacticsList, tacticsCreate, tacticsUpdate, tacticsDelete, quizzesList, quizzesCreate, quizzesUpdate, quizzesDelete, playlistsList, playlistsCreate, playlistsUpdate, playlistsDelete } from '../services/api';
import { getOrFetchCached, readCachedValue, writeCachedValue } from '../services/resourceCache';
// import { tactics as initialTactics } from '../data/tactics';
// import { quizzes as initialQuizzes } from '../data/quizzes';
// import { playlists as initialPlaylists } from '../data/playlists';

const ADMIN_STORAGE_KEY = 'basketball-iq-admin-data';
const ADMIN_CACHE_KEY = 'adminData:v1';
const ADMIN_CACHE_STORAGE_KEY = 'basketball-iq-admin-cache-v1';
const ADMIN_CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchAdminData(): Promise<AdminData> {
  const useSupabase = isSupabaseEnabled();
  const [tactics, quizzes, playlists] = useSupabase
    ? await Promise.all([
        listTacticsFromSupabase(),
        listQuizzesFromSupabase(),
        listPlaylistsFromSupabase()
      ])
    : await Promise.all([
        tacticsList(),
        quizzesList(),
        playlistsList()
      ]);
  return { tactics, quizzes, playlists };
}

export const useAdminData = () => {
  const { accessToken } = useAuth();
  const cached = useMemo(() => {
    return readCachedValue<AdminData>(ADMIN_CACHE_KEY, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
  }, []);
  const [adminData, setAdminData] = useState<AdminData>(cached ?? { tactics: [], quizzes: [], playlists: [] });
  const [isLoading, setIsLoading] = useState<boolean>(() => !cached);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных с сервера
  useEffect(() => {
    (async () => {
      try {
        // Если кэш уже есть — не показываем пустой экран, а обновляем в фоне.
        if (!cached) setIsLoading(true);
        setError(null);
        const fresh = await getOrFetchCached(ADMIN_CACHE_KEY, fetchAdminData, {
          ttlMs: ADMIN_CACHE_TTL_MS,
          storageKey: ADMIN_CACHE_STORAGE_KEY
        });
        setAdminData(fresh);

        // Одноразовая миграция локальных данных (если есть)
        const savedRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (savedRaw) {
          try {
            const saved = JSON.parse(savedRaw) as AdminData;
            if (saved.tactics?.length) {
              for (const item of saved.tactics) {
                const exists = fresh.tactics.some(x => x.title === item.title && x.description === item.description);
                if (!exists && accessToken) {
                  try { await tacticsCreate({ ...item, id: undefined as any }, accessToken); } catch {}
                }
              }
            }
            if (saved.quizzes?.length) {
              for (const item of saved.quizzes) {
                const exists = fresh.quizzes.some(x => x.title === item.title && x.question === item.question);
                if (!exists && accessToken) {
                  try { await quizzesCreate({ ...item, id: undefined as any }, accessToken); } catch {}
                }
              }
            }
            // После миграции очищаем
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            // После возможной миграции — принудительно обновим кэш, чтобы UI не требовал рефреша.
            try {
              const updated = await fetchAdminData();
              writeCachedValue(ADMIN_CACHE_KEY, updated, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
              setAdminData(updated);
            } catch {}
          } catch {}
        }
      } catch (e: any) {
        console.error('Failed to load admin data', e);
        setError(e?.message || 'Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const addTactic = async (tactic: Omit<Tactic, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const created = useSupabase ? await createTacticInSupabase(tactic) : await tacticsCreate(tactic, accessToken);
    setAdminData(prev => {
      const next = { ...prev, tactics: [created, ...prev.tactics] };
      writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
      return next;
    });
  };

  const updateTactic = async (id: string, updates: Partial<Tactic>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const updated = useSupabase ? await updateTacticInSupabase(id, updates) : await tacticsUpdate(id, updates, accessToken);
    setAdminData(prev => {
      const next = { ...prev, tactics: prev.tactics.map(t => t.id === id ? updated : t) };
      writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
      return next;
    });
  };

  const deleteTactic = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    if (useSupabase) await deleteTacticInSupabase(id); else await tacticsDelete(id, accessToken);
    setAdminData(prev => {
      const next = { ...prev, tactics: prev.tactics.filter(t => t.id !== id) };
      writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
      return next;
    });
  };

  const addQuiz = async (quiz: Omit<QuizQuestion, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const created = useSupabase ? await createQuizInSupabase(quiz) : await quizzesCreate(quiz, accessToken);
    setAdminData(prev => {
      const next = { ...prev, quizzes: [created, ...prev.quizzes] };
      writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
      return next;
    });
  };

  const updateQuiz = async (id: string, updates: Partial<QuizQuestion>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const updated = useSupabase ? await updateQuizInSupabase(id, updates) : await quizzesUpdate(id, updates, accessToken);
    setAdminData(prev => {
      const next = { ...prev, quizzes: prev.quizzes.map(q => q.id === id ? updated : q) };
      writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
      return next;
    });
  };

  const deleteQuiz = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    if (useSupabase) await deleteQuizInSupabase(id); else await quizzesDelete(id, accessToken);
    setAdminData(prev => {
      const next = { ...prev, quizzes: prev.quizzes.filter(q => q.id !== id) };
      writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
      return next;
    });
  };

  const addPlaylist = (playlist: Omit<Playlist, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const promise = useSupabase ? createPlaylistInSupabase(playlist) : playlistsCreate(playlist, accessToken);
    return promise.then((created) => {
      setAdminData(prev => {
        const next = { ...prev, playlists: [created, ...prev.playlists] };
        writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
        return next;
      });
    });
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const promise = useSupabase ? updatePlaylistInSupabase(id, updates) : playlistsUpdate(id, updates, accessToken);
    return promise.then(updated => {
      setAdminData(prev => {
        const next = { ...prev, playlists: prev.playlists.map(p => p.id === id ? updated : p) };
        writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
        return next;
      });
    });
  };

  const deletePlaylist = (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const promise = useSupabase ? deletePlaylistInSupabase(id) : playlistsDelete(id, accessToken);
    return promise.then(() => {
      setAdminData(prev => {
        const next = { ...prev, playlists: prev.playlists.filter(p => p.id !== id) };
        writeCachedValue(ADMIN_CACHE_KEY, next, { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY });
        return next;
      });
    });
  };


  return {
    tactics: adminData.tactics,
    quizzes: adminData.quizzes,
    playlists: adminData.playlists,
    isLoading,
    error,
    addTactic,
    updateTactic,
    deleteTactic,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    addPlaylist,
    updatePlaylist,
    deletePlaylist
  };
};