import { useEffect, useState } from 'react';
import { Tactic, QuizQuestion, AdminData, Playlist } from '../types';
import { useAuth } from './useAuth';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { listTacticsFromSupabase, createTacticInSupabase, updateTacticInSupabase, deleteTacticInSupabase } from '../services/supabaseTactics';
import { listQuizzesFromSupabase, createQuizInSupabase, updateQuizInSupabase, deleteQuizInSupabase } from '../services/supabaseQuizzes';
import { listPlaylistsFromSupabase, createPlaylistInSupabase, updatePlaylistInSupabase, deletePlaylistInSupabase } from '../services/supabasePlaylists';
import { tacticsList, tacticsCreate, tacticsUpdate, tacticsDelete, quizzesList, quizzesCreate, quizzesUpdate, quizzesDelete, playlistsList, playlistsCreate, playlistsUpdate, playlistsDelete } from '../services/api';
import { getOrFetchCached, readCachedValue, writeCachedValue } from '../services/resourceCache';

const USE_SUPABASE = isSupabaseEnabled();

const ADMIN_STORAGE_KEY = 'basketball-iq-admin-data';
const ADMIN_CACHE_KEY = 'adminData:v1';
const ADMIN_CACHE_STORAGE_KEY = 'basketball-iq-admin-cache-v1';
const ADMIN_CACHE_TTL_MS = 10 * 60 * 1000;

const CACHE_OPTS = { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY };

async function fetchAdminData(): Promise<AdminData> {
  const [tactics, quizzes, playlists] = USE_SUPABASE
    ? await Promise.all([listTacticsFromSupabase(), listQuizzesFromSupabase(), listPlaylistsFromSupabase()])
    : await Promise.all([tacticsList(), quizzesList(), playlistsList()]);
  return { tactics, quizzes, playlists };
}

const updateCache = (next: AdminData) => writeCachedValue(ADMIN_CACHE_KEY, next, CACHE_OPTS);

export const useAdminData = () => {
  const { accessToken } = useAuth();
  const cached = readCachedValue<AdminData>(ADMIN_CACHE_KEY, CACHE_OPTS);
  const [adminData, setAdminData] = useState<AdminData>(cached ?? { tactics: [], quizzes: [], playlists: [] });
  const [isLoading, setIsLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!cached) setIsLoading(true);
        setError(null);
        const fresh = await getOrFetchCached(ADMIN_CACHE_KEY, fetchAdminData, CACHE_OPTS);
        setAdminData(fresh);

        // One-time migration of legacy localStorage data
        const savedRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (savedRaw) {
          try {
            const saved = JSON.parse(savedRaw) as AdminData;
            if (saved.tactics?.length && accessToken) {
              for (const item of saved.tactics) {
                const exists = fresh.tactics.some(x => x.title === item.title && x.description === item.description);
                if (!exists) {
                  try { await tacticsCreate({ ...item, id: undefined as any }, accessToken); } catch {}
                }
              }
            }
            if (saved.quizzes?.length && accessToken) {
              for (const item of saved.quizzes) {
                const exists = fresh.quizzes.some(x => x.title === item.title && x.question === item.question);
                if (!exists) {
                  try { await quizzesCreate({ ...item, id: undefined as any }, accessToken); } catch {}
                }
              }
            }
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            try {
              const updated = await fetchAdminData();
              updateCache(updated);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mutate = (updater: (prev: AdminData) => AdminData) => {
    setAdminData(prev => {
      const next = updater(prev);
      updateCache(next);
      return next;
    });
  };

  const addTactic = async (tactic: Omit<Tactic, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const created = USE_SUPABASE ? await createTacticInSupabase(tactic) : await tacticsCreate(tactic, accessToken);
    mutate(prev => ({ ...prev, tactics: [created, ...prev.tactics] }));
  };

  const updateTactic = async (id: string, updates: Partial<Tactic>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const updated = USE_SUPABASE ? await updateTacticInSupabase(id, updates) : await tacticsUpdate(id, updates, accessToken);
    mutate(prev => ({ ...prev, tactics: prev.tactics.map(t => t.id === id ? updated : t) }));
  };

  const deleteTactic = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    if (USE_SUPABASE) await deleteTacticInSupabase(id); else await tacticsDelete(id, accessToken);
    mutate(prev => ({ ...prev, tactics: prev.tactics.filter(t => t.id !== id) }));
  };

  const addQuiz = async (quiz: Omit<QuizQuestion, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const created = USE_SUPABASE ? await createQuizInSupabase(quiz) : await quizzesCreate(quiz, accessToken);
    mutate(prev => ({ ...prev, quizzes: [created, ...prev.quizzes] }));
  };

  const updateQuiz = async (id: string, updates: Partial<QuizQuestion>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const updated = USE_SUPABASE ? await updateQuizInSupabase(id, updates) : await quizzesUpdate(id, updates, accessToken);
    mutate(prev => ({ ...prev, quizzes: prev.quizzes.map(q => q.id === id ? updated : q) }));
  };

  const deleteQuiz = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    if (USE_SUPABASE) await deleteQuizInSupabase(id); else await quizzesDelete(id, accessToken);
    mutate(prev => ({ ...prev, quizzes: prev.quizzes.filter(q => q.id !== id) }));
  };

  const addPlaylist = async (playlist: Omit<Playlist, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const created = USE_SUPABASE ? await createPlaylistInSupabase(playlist) : await playlistsCreate(playlist, accessToken);
    mutate(prev => ({ ...prev, playlists: [created, ...prev.playlists] }));
  };

  const updatePlaylist = async (id: string, updates: Partial<Playlist>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const updated = USE_SUPABASE ? await updatePlaylistInSupabase(id, updates) : await playlistsUpdate(id, updates, accessToken);
    mutate(prev => ({ ...prev, playlists: prev.playlists.map(p => p.id === id ? updated : p) }));
  };

  const deletePlaylist = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    if (USE_SUPABASE) await deletePlaylistInSupabase(id); else await playlistsDelete(id, accessToken);
    mutate(prev => ({ ...prev, playlists: prev.playlists.filter(p => p.id !== id) }));
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
    deletePlaylist,
  };
};
