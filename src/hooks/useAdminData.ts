import { useEffect, useState } from 'react';
import { Tactic, QuizQuestion, AdminData, Playlist } from '../types';
import { useAuth } from './useAuth';
import { listTacticsFromSupabase, createTacticInSupabase, updateTacticInSupabase, deleteTacticInSupabase } from '../services/supabaseTactics';
import { listQuizzesFromSupabase, createQuizInSupabase, updateQuizInSupabase, deleteQuizInSupabase } from '../services/supabaseQuizzes';
import { listPlaylistsFromSupabase, createPlaylistInSupabase, updatePlaylistInSupabase, deletePlaylistInSupabase } from '../services/supabasePlaylists';
import { readCachedValue, readCachedValueStale, writeCachedValue } from '../services/resourceCache';

const ADMIN_CACHE_KEY = 'adminData:v1';
const ADMIN_CACHE_STORAGE_KEY = 'basketball-iq-admin-cache-v1';
const ADMIN_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const CACHE_OPTS = { ttlMs: ADMIN_CACHE_TTL_MS, storageKey: ADMIN_CACHE_STORAGE_KEY };

async function fetchAdminData(): Promise<AdminData> {
  const [tactics, quizzes, playlists] = await Promise.all([
    listTacticsFromSupabase(),
    listQuizzesFromSupabase(),
    listPlaylistsFromSupabase(),
  ]);
  return { tactics, quizzes, playlists };
}

const updateCache = (next: AdminData) => writeCachedValue(ADMIN_CACHE_KEY, next, CACHE_OPTS);

export const useAdminData = () => {
  const { accessToken } = useAuth();

  // Show stale data instantly (ignores TTL), then revalidate in background
  const stale = readCachedValueStale<AdminData>(ADMIN_CACHE_KEY, CACHE_OPTS);
  const fresh = stale ? null : readCachedValue<AdminData>(ADMIN_CACHE_KEY, CACHE_OPTS);
  const initial = stale ?? fresh ?? { tactics: [], quizzes: [], playlists: [] };

  const [adminData, setAdminData] = useState<AdminData>(initial);
  // Show spinner only if there is absolutely no cached data at all
  const [isLoading, setIsLoading] = useState<boolean>(!stale && !fresh);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        // If we showed stale data, fetch fresh silently without spinner
        const needsSpinner = !stale && !readCachedValue<AdminData>(ADMIN_CACHE_KEY, CACHE_OPTS);
        if (needsSpinner) setIsLoading(true);

        const freshData = await fetchAdminData();
        writeCachedValue(ADMIN_CACHE_KEY, freshData, CACHE_OPTS);
        setAdminData(freshData);
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
    const created = await createTacticInSupabase(tactic);
    mutate(prev => ({ ...prev, tactics: [created, ...prev.tactics] }));
  };

  const updateTactic = async (id: string, updates: Partial<Tactic>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const updated = await updateTacticInSupabase(id, updates);
    mutate(prev => ({ ...prev, tactics: prev.tactics.map(t => t.id === id ? updated : t) }));
  };

  const deleteTactic = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    await deleteTacticInSupabase(id);
    mutate(prev => ({ ...prev, tactics: prev.tactics.filter(t => t.id !== id) }));
  };

  const addQuiz = async (quiz: Omit<QuizQuestion, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const created = await createQuizInSupabase(quiz);
    mutate(prev => ({ ...prev, quizzes: [created, ...prev.quizzes] }));
  };

  const updateQuiz = async (id: string, updates: Partial<QuizQuestion>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const updated = await updateQuizInSupabase(id, updates);
    mutate(prev => ({ ...prev, quizzes: prev.quizzes.map(q => q.id === id ? updated : q) }));
  };

  const deleteQuiz = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    await deleteQuizInSupabase(id);
    mutate(prev => ({ ...prev, quizzes: prev.quizzes.filter(q => q.id !== id) }));
  };

  const addPlaylist = async (playlist: Omit<Playlist, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const created = await createPlaylistInSupabase(playlist);
    mutate(prev => ({ ...prev, playlists: [created, ...prev.playlists] }));
  };

  const updatePlaylist = async (id: string, updates: Partial<Playlist>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const updated = await updatePlaylistInSupabase(id, updates);
    mutate(prev => ({ ...prev, playlists: prev.playlists.map(p => p.id === id ? updated : p) }));
  };

  const deletePlaylist = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    await deletePlaylistInSupabase(id);
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
