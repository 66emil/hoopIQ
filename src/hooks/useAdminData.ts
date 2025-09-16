import { useState, useEffect } from 'react';
import { Tactic, QuizQuestion, AdminData, Playlist } from '../types';
// import { tactics as initialTactics } from '../data/tactics';
// import { quizzes as initialQuizzes } from '../data/quizzes';
// import { playlists as initialPlaylists } from '../data/playlists';

const ADMIN_STORAGE_KEY = 'basketball-iq-admin-data';

export const useAdminData = () => {
  const [adminData, setAdminData] = useState<AdminData>(() => {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AdminData;
        const isCompletelyEmpty =
          (!parsed.tactics || parsed.tactics.length === 0) &&
          (!parsed.quizzes || parsed.quizzes.length === 0) &&
          (!parsed.playlists || parsed.playlists.length === 0);
        if (isCompletelyEmpty) {
          return { tactics: [], quizzes: [], playlists: [] } as AdminData;
        }
        return {
          tactics: parsed.tactics ?? [],
          quizzes: parsed.quizzes ?? [],
          playlists: parsed.playlists ?? []
        };
      } catch {
        return { tactics: [], quizzes: [], playlists: [] } as AdminData;
      }
    }
    return {
      tactics: [],
      quizzes: [],
      playlists: []
    };
  });

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
  }, [adminData]);

  const addTactic = (tactic: Omit<Tactic, 'id'>) => {
    const newTactic: Tactic = {
      ...tactic,
      id: Date.now().toString(),
      completed: false
    };
    
    setAdminData(prev => ({
      ...prev,
      tactics: [...prev.tactics, newTactic]
    }));
  };

  const updateTactic = (id: string, updates: Partial<Tactic>) => {
    setAdminData(prev => ({
      ...prev,
      tactics: prev.tactics.map(tactic => 
        tactic.id === id ? { ...tactic, ...updates } : tactic
      )
    }));
  };

  const deleteTactic = (id: string) => {
    setAdminData(prev => ({
      ...prev,
      tactics: prev.tactics.filter(tactic => tactic.id !== id)
    }));
  };

  const addQuiz = (quiz: Omit<QuizQuestion, 'id'>) => {
    const newQuiz: QuizQuestion = {
      ...quiz,
      id: Date.now().toString(),
      completed: false
    };
    
    setAdminData(prev => ({
      ...prev,
      quizzes: [...prev.quizzes, newQuiz]
    }));
  };

  const updateQuiz = (id: string, updates: Partial<QuizQuestion>) => {
    setAdminData(prev => ({
      ...prev,
      quizzes: prev.quizzes.map(quiz => 
        quiz.id === id ? { ...quiz, ...updates } : quiz
      )
    }));
  };

  const deleteQuiz = (id: string) => {
    setAdminData(prev => ({
      ...prev,
      quizzes: prev.quizzes.filter(quiz => quiz.id !== id)
    }));
  };

  const addPlaylist = (playlist: Omit<Playlist, 'id'>) => {
    const newPlaylist: Playlist = {
      ...playlist,
      id: Date.now().toString(),
    };
    setAdminData(prev => ({
      ...prev,
      playlists: [...prev.playlists, newPlaylist]
    }));
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    setAdminData(prev => ({
      ...prev,
      playlists: prev.playlists.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deletePlaylist = (id: string) => {
    setAdminData(prev => ({
      ...prev,
      playlists: prev.playlists.filter(p => p.id !== id)
    }));
  };


  return {
    tactics: adminData.tactics,
    quizzes: adminData.quizzes,
    playlists: adminData.playlists,
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