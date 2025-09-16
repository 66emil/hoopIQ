import { useState, useEffect } from 'react';
import { Tactic, QuizQuestion, AdminData, Playlist } from '../types';
import { useAuth } from './useAuth';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { listTacticsFromSupabase, createTacticInSupabase, updateTacticInSupabase, deleteTacticInSupabase } from '../services/supabaseTactics';
import { listQuizzesFromSupabase, createQuizInSupabase, updateQuizInSupabase, deleteQuizInSupabase } from '../services/supabaseQuizzes';
import { listPlaylistsFromSupabase, createPlaylistInSupabase, updatePlaylistInSupabase, deletePlaylistInSupabase } from '../services/supabasePlaylists';
import { tacticsList, tacticsCreate, tacticsUpdate, tacticsDelete, quizzesList, quizzesCreate, quizzesUpdate, quizzesDelete, playlistsList, playlistsCreate, playlistsUpdate, playlistsDelete } from '../services/api';
// import { tactics as initialTactics } from '../data/tactics';
// import { quizzes as initialQuizzes } from '../data/quizzes';
// import { playlists as initialPlaylists } from '../data/playlists';

const ADMIN_STORAGE_KEY = 'basketball-iq-admin-data';

export const useAdminData = () => {
  const { accessToken } = useAuth();
  const [adminData, setAdminData] = useState<AdminData>({ tactics: [], quizzes: [], playlists: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных с сервера
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const useSupabase = isSupabaseEnabled();
        const [t, q, p] = useSupabase
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
        setAdminData(prev => ({ ...prev, tactics: t, quizzes: q, playlists: p }));

        // Одноразовая миграция локальных данных (если есть)
        const savedRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (savedRaw) {
          try {
            const saved = JSON.parse(savedRaw) as AdminData;
            if (saved.tactics?.length) {
              for (const item of saved.tactics) {
                const exists = t.some(x => x.title === item.title && x.description === item.description);
                if (!exists && accessToken) {
                  try { await tacticsCreate({ ...item, id: undefined as any }, accessToken); } catch {}
                }
              }
            }
            if (saved.quizzes?.length) {
              for (const item of saved.quizzes) {
                const exists = q.some(x => x.title === item.title && x.question === item.question);
                if (!exists && accessToken) {
                  try { await quizzesCreate({ ...item, id: undefined as any }, accessToken); } catch {}
                }
              }
            }
            // После миграции очищаем
            localStorage.removeItem(ADMIN_STORAGE_KEY);
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
    setAdminData(prev => ({ ...prev, tactics: [created, ...prev.tactics] }));
  };

  const updateTactic = async (id: string, updates: Partial<Tactic>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const updated = useSupabase ? await updateTacticInSupabase(id, updates) : await tacticsUpdate(id, updates, accessToken);
    setAdminData(prev => ({ ...prev, tactics: prev.tactics.map(t => t.id === id ? updated : t) }));
  };

  const deleteTactic = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    if (useSupabase) await deleteTacticInSupabase(id); else await tacticsDelete(id, accessToken);
    setAdminData(prev => ({ ...prev, tactics: prev.tactics.filter(t => t.id !== id) }));
  };

  const addQuiz = async (quiz: Omit<QuizQuestion, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const created = useSupabase ? await createQuizInSupabase(quiz) : await quizzesCreate(quiz, accessToken);
    setAdminData(prev => ({ ...prev, quizzes: [created, ...prev.quizzes] }));
  };

  const updateQuiz = async (id: string, updates: Partial<QuizQuestion>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const updated = useSupabase ? await updateQuizInSupabase(id, updates) : await quizzesUpdate(id, updates, accessToken);
    setAdminData(prev => ({ ...prev, quizzes: prev.quizzes.map(q => q.id === id ? updated : q) }));
  };

  const deleteQuiz = async (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    if (useSupabase) await deleteQuizInSupabase(id); else await quizzesDelete(id, accessToken);
    setAdminData(prev => ({ ...prev, quizzes: prev.quizzes.filter(q => q.id !== id) }));
  };

  const addPlaylist = (playlist: Omit<Playlist, 'id'>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const promise = useSupabase ? createPlaylistInSupabase(playlist) : playlistsCreate(playlist, accessToken);
    return promise.then((created) => {
      setAdminData(prev => ({ ...prev, playlists: [created, ...prev.playlists] }));
    });
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const promise = useSupabase ? updatePlaylistInSupabase(id, updates) : playlistsUpdate(id, updates, accessToken);
    return promise.then(updated => {
      setAdminData(prev => ({ ...prev, playlists: prev.playlists.map(p => p.id === id ? updated : p) }));
    });
  };

  const deletePlaylist = (id: string) => {
    if (!accessToken) throw new Error('Требуется авторизация');
    const useSupabase = isSupabaseEnabled();
    const promise = useSupabase ? deletePlaylistInSupabase(id) : playlistsDelete(id, accessToken);
    return promise.then(() => {
      setAdminData(prev => ({ ...prev, playlists: prev.playlists.filter(p => p.id !== id) }));
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