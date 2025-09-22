import { useState, useEffect } from 'react';
import { UserProgress } from '../types';
import { useAuth } from './useAuth';
import { apiUpdateProgress } from '../services/api';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { upsertProfileProgress, getProfile } from '../services/supabaseProfile';
import { getLevelFromXP } from '../services/levels';

const getStorageKey = (userId: string) => `basketball-iq-progress-${userId}`;

export const useProgress = () => {
  const { currentUser, accessToken } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(() => {
    const initialPoints = 0;
    return {
      completedTactics: [],
      completedQuizzes: [],
      totalScore: initialPoints,
      level: getLevelFromXP(initialPoints),
      streakCount: 0,
      lastActionDate: null,
      lastStreakAwardDate: null
    };
  });

  // Синхронизация прогресса с текущим пользователем
  useEffect(() => {
    if (!currentUser) {
      // Сброс прогресса при выходе из аккаунта
      const initialPoints = 0;
      setProgress({
        completedTactics: [],
        completedQuizzes: [],
        totalScore: initialPoints,
        level: getLevelFromXP(initialPoints),
        streakCount: 0,
        lastActionDate: null,
        lastStreakAwardDate: null
      });
      return;
    }

    // Загружаем прогресс для конкретного пользователя
    const storageKey = getStorageKey(currentUser.id);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProgress;
        // Backward compatibility defaults
        setProgress({
          completedTactics: parsed.completedTactics ?? [],
          completedQuizzes: parsed.completedQuizzes ?? [],
          totalScore: parsed.totalScore ?? 0,
          level: parsed.level ? parsed.level : getLevelFromXP(parsed.totalScore ?? 0),
          streakCount: parsed.streakCount ?? 0,
          lastActionDate: parsed.lastActionDate ?? null,
          lastStreakAwardDate: parsed.lastStreakAwardDate ?? null
        });
      } catch {
        // Если ошибка парсинга, сбрасываем к начальным значениям
        setProgress({
          completedTactics: [],
          completedQuizzes: [],
          totalScore: 0,
          level: 0
        });
      }
    } else {
      // Новый пользователь - начинаем с 0
      const initialPoints = 0;
      setProgress({
        completedTactics: [],
        completedQuizzes: [],
        totalScore: initialPoints,
        level: getLevelFromXP(initialPoints),
        streakCount: 0,
        lastActionDate: null,
        lastStreakAwardDate: null
      });
    }

    // Если включен Supabase, подтягиваем level/xp из таблицы profiles
    if (isSupabaseEnabled()) {
      (async () => {
        try {
          const p = await getProfile(currentUser.id);
          if (p && (p.level != null || p.xp != null)) {
            setProgress(prev => {
              const total = typeof p.xp === 'number' ? p.xp : prev.totalScore;
              const lvl = typeof p.level === 'number' ? p.level : getLevelFromXP(total);
              return {
                ...prev,
                totalScore: total,
                level: lvl
              };
            });
          }
        } catch (e) {
          // молча, чтобы не мешать UX
        }
      })();
    }
  }, [currentUser]);

  // Сохранение прогресса при изменениях
  useEffect(() => {
    if (!currentUser) return;
    const storageKey = getStorageKey(currentUser.id);
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, currentUser]);

  // Синхронизация с сервером при изменении уровня или очков
  useEffect(() => {
    const useSupabase = isSupabaseEnabled();
    // Если используется Supabase — обновляем таблицу profiles
    if (useSupabase) {
      if (!currentUser) return;
      const syncToSupabase = async () => {
        try {
          await upsertProfileProgress({ id: currentUser.id, level: progress.level, xp: progress.totalScore });
        } catch (error) {
          console.error('Ошибка синхронизации прогресса с Supabase:', error);
        }
      };
      if (progress.level >= 0 && progress.totalScore >= 0) {
        syncToSupabase();
      }
      return;
    }

    // Иначе шлем на локальный сервер (старый режим)
    if (!accessToken) return;

    const syncWithServer = async () => {
      try {
        await apiUpdateProgress(accessToken, progress.level, progress.totalScore);
      } catch (error) {
        console.error('Ошибка синхронизации прогресса с сервером:', error);
      }
    };

    if (progress.level > 0 || progress.totalScore > 0) {
      syncWithServer();
    }
  }, [progress.level, progress.totalScore, accessToken, currentUser]);

  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isYesterday = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date(getTodayStr() + 'T00:00:00');
    const diffMs = today.getTime() - d.getTime();
    return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
  };

  const applyAction = (prev: UserProgress, basePoints: number): UserProgress => {
    const today = getTodayStr();
    let streak = prev.streakCount ?? 0;
    // Update streak counter based on last action date
    if (prev.lastActionDate === today) {
      // same day, keep streak as is
    } else if (isYesterday(prev.lastActionDate ?? null)) {
      streak = (streak || 0) + 1;
    } else {
      streak = 1; // start new streak
    }

    // Award streak bonus once per day
    let bonus = 0;
    const alreadyAwardedToday = prev.lastStreakAwardDate === today;
    if (!alreadyAwardedToday) {
      const capped = Math.min(streak, 10); // cap at 10 days => 200 XP
      bonus = 20 * capped;
    }

    const newTotal = prev.totalScore + basePoints + bonus;
    return {
      ...prev,
      totalScore: newTotal,
      level: getLevelFromXP(newTotal),
      streakCount: streak,
      lastActionDate: today,
      lastStreakAwardDate: alreadyAwardedToday ? prev.lastStreakAwardDate || today : today
    };
  };

  const completeTactic = (tacticId: string) => {
    if (!progress.completedTactics.includes(tacticId)) {
      setProgress(prev => {
        const updated = applyAction(prev, 10);
        return {
          ...updated,
          completedTactics: [...prev.completedTactics, tacticId]
        };
      });
    }
  };

  const completeQuiz = (quizId: string, score: number) => {
    if (!progress.completedQuizzes.includes(quizId)) {
      setProgress(prev => {
        const base = Math.max(0, score | 0);
        const updated = applyAction(prev, base);
        return {
          ...updated,
          completedQuizzes: [...prev.completedQuizzes, quizId]
        };
      });
    }
  };

  const resetProgress = () => {
    const initialPoints = 0;
    setProgress({
      completedTactics: [],
      completedQuizzes: [],
      totalScore: initialPoints,
      level: getLevelFromXP(initialPoints),
      streakCount: 0,
      lastActionDate: null,
      lastStreakAwardDate: null
    });
  };

  return {
    progress,
    completeTactic,
    completeQuiz,
    resetProgress
  };
};