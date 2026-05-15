import { useState, useEffect } from 'react';
import { UserProgress } from '../types';
import { useAuth } from './useAuth';
import { apiUpdateProgress } from '../services/api';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { upsertProfileProgress, getProfile } from '../services/supabaseProfile';
import { getLevelFromXP } from '../services/levels';

const getStorageKey = (userId: string) => `basketball-iq-progress-${userId}`;

const EMPTY_PROGRESS: UserProgress = {
  completedTactics: [],
  completedQuizzes: [],
  totalScore: 0,
  level: getLevelFromXP(0),
  streakCount: 0,
  lastActionDate: null,
  lastStreakAwardDate: null,
};

const getTodayStr = (): string => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

const isYesterday = (dateStr: string | null): boolean => {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(getTodayStr() + 'T00:00:00');
  const diffMs = today.getTime() - d.getTime();
  return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
};

export const useProgress = () => {
  const { currentUser, accessToken } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(EMPTY_PROGRESS);
  const [isProgressLoaded, setIsProgressLoaded] = useState<boolean>(false);

  // Load progress when user changes
  useEffect(() => {
    if (!currentUser) {
      setProgress(EMPTY_PROGRESS);
      setIsProgressLoaded(true);
      return;
    }

    const storageKey = getStorageKey(currentUser.id);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProgress;
        setProgress({
          completedTactics: parsed.completedTactics ?? [],
          completedQuizzes: parsed.completedQuizzes ?? [],
          totalScore: parsed.totalScore ?? 0,
          level: parsed.level ? parsed.level : getLevelFromXP(parsed.totalScore ?? 0),
          streakCount: parsed.streakCount ?? 0,
          lastActionDate: parsed.lastActionDate ?? null,
          lastStreakAwardDate: parsed.lastStreakAwardDate ?? null,
        });
      } catch {
        setProgress(EMPTY_PROGRESS);
      }
    } else {
      setProgress(EMPTY_PROGRESS);
    }

    if (isSupabaseEnabled()) {
      (async () => {
        try {
          const p = await getProfile(currentUser.id);
          if (p && (p.level != null || p.xp != null)) {
            setProgress(prev => {
              const total = typeof p.xp === 'number' ? p.xp : prev.totalScore;
              const lvl = typeof p.level === 'number' ? p.level : getLevelFromXP(total);
              return { ...prev, totalScore: total, level: lvl };
            });
          }
        } catch {
          // silent — don't disrupt UX
        } finally {
          setIsProgressLoaded(true);
        }
      })();
    } else {
      setIsProgressLoaded(true);
    }
  }, [currentUser]);

  // Persist to localStorage on every change
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(getStorageKey(currentUser.id), JSON.stringify(progress));
  }, [progress, currentUser]);

  // Sync score/level to server
  useEffect(() => {
    if (!currentUser || !isProgressLoaded) return;
    if (progress.totalScore === 0 && progress.level === 0) return;

    if (isSupabaseEnabled()) {
      upsertProfileProgress({ id: currentUser.id, level: progress.level, xp: progress.totalScore })
        .catch(err => console.error('Ошибка синхронизации прогресса с Supabase:', err));
      return;
    }

    if (!accessToken) return;
    if (progress.level > 0 || progress.totalScore > 0) {
      apiUpdateProgress(accessToken, progress.level, progress.totalScore)
        .catch(err => console.error('Ошибка синхронизации прогресса с сервером:', err));
    }
  }, [progress.level, progress.totalScore, accessToken, currentUser, isProgressLoaded]);

  const applyAction = (prev: UserProgress, basePoints: number): UserProgress => {
    const today = getTodayStr();
    let streak = prev.streakCount ?? 0;

    if (prev.lastActionDate === today) {
      // same day — keep streak
    } else if (isYesterday(prev.lastActionDate ?? null)) {
      streak += 1;
    } else {
      streak = 1;
    }

    const alreadyAwardedToday = prev.lastStreakAwardDate === today;
    const bonus = alreadyAwardedToday ? 0 : 20 * Math.min(streak, 10);

    const newTotal = prev.totalScore + basePoints + bonus;
    return {
      ...prev,
      totalScore: newTotal,
      level: getLevelFromXP(newTotal),
      streakCount: streak,
      lastActionDate: today,
      lastStreakAwardDate: alreadyAwardedToday ? prev.lastStreakAwardDate ?? today : today,
    };
  };

  const completeTactic = (tacticId: string) => {
    if (progress.completedTactics.includes(tacticId)) return;
    setProgress(prev => ({
      ...applyAction(prev, 10),
      completedTactics: [...prev.completedTactics, tacticId],
    }));
  };

  const completeQuiz = (quizId: string, score: number) => {
    if (progress.completedQuizzes.includes(quizId)) return;
    setProgress(prev => ({
      ...applyAction(prev, Math.max(0, Math.trunc(score))),
      completedQuizzes: [...prev.completedQuizzes, quizId],
    }));
  };

  const resetProgress = () => setProgress(EMPTY_PROGRESS);

  return { progress, completeTactic, completeQuiz, resetProgress };
};
