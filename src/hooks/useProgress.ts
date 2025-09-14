import { useState, useEffect } from 'react';
import { UserProgress } from '../types';
import { useAuth } from './useAuth';
import { apiUpdateProgress } from '../services/api';

const getStorageKey = (userId: string) => `basketball-iq-progress-${userId}`;

export const useProgress = () => {
  const { currentUser, accessToken } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(() => {
    return {
      completedTactics: [],
      completedQuizzes: [],
      totalScore: 0,
      level: 0
    };
  });

  // Синхронизация прогресса с текущим пользователем
  useEffect(() => {
    if (!currentUser) {
      // Сброс прогресса при выходе из аккаунта
      setProgress({
        completedTactics: [],
        completedQuizzes: [],
        totalScore: 0,
        level: 0
      });
      return;
    }

    // Загружаем прогресс для конкретного пользователя
    const storageKey = getStorageKey(currentUser.id);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProgress;
        setProgress(parsed);
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
      setProgress({
        completedTactics: [],
        completedQuizzes: [],
        totalScore: 0,
        level: 0
      });
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
    if (!accessToken) return;
    
    const syncWithServer = async () => {
      try {
        await apiUpdateProgress(accessToken, progress.level, progress.totalScore);
      } catch (error) {
        console.error('Ошибка синхронизации прогресса с сервером:', error);
      }
    };

    // Синхронизируем только если уровень > 0 или очки > 0
    if (progress.level > 0 || progress.totalScore > 0) {
      syncWithServer();
    }
  }, [progress.level, progress.totalScore, accessToken]);

  const completeTactic = (tacticId: string) => {
    if (!progress.completedTactics.includes(tacticId)) {
      setProgress(prev => ({
        ...prev,
        completedTactics: [...prev.completedTactics, tacticId],
        totalScore: prev.totalScore + 50,
        level: Math.floor((prev.totalScore + 50) / 200)
      }));
    }
  };

  const completeQuiz = (quizId: string, score: number) => {
    if (!progress.completedQuizzes.includes(quizId)) {
      setProgress(prev => ({
        ...prev,
        completedQuizzes: [...prev.completedQuizzes, quizId],
        totalScore: prev.totalScore + score,
        level: Math.floor((prev.totalScore + score) / 200)
      }));
    }
  };

  const resetProgress = () => {
    setProgress({
      completedTactics: [],
      completedQuizzes: [],
      totalScore: 0,
      level: 0
    });
  };

  return {
    progress,
    completeTactic,
    completeQuiz,
    resetProgress
  };
};