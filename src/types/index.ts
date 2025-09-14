export interface Tactic {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'offense' | 'defense';
  steps: string[];
  thumbnail?: string;
  // completed?: boolean;
  animation?: TacticAnimation;
}

export interface QuizQuestion {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  explanationVideoUrl?: string; // URL видео с объяснением
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'offense' | 'defense';
  // completed?: boolean;
}

export interface UserProgress {
  completedTactics: string[];
  completedQuizzes: string[];
  totalScore: number;
  level: number;
}

export interface VideoQuiz extends QuizQuestion {
  videoFile?: File;
  videoTimestamp?: number; // время в секундах, когда нужно остановить видео для вопроса
}

export interface AdminData {
  tactics: Tactic[];
  quizzes: QuizQuestion[];
  playlists: Playlist[];
}

export type PlaylistScenario =
  | 'endgame'            // Конец игры
  | 'transition'         // Переход из защиты в атаку
  | 'vs_zone'            // Против зоны
  | 'stars_breakdown'    // Лучшие решения звезд
  | 'custom';

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  category: 'offense' | 'defense';
  scenario: PlaylistScenario;
  thumbnail?: string;
  quizIds: string[]; // идентификаторы квизов, входящих в плейлист
}

export interface TacticAnimation {
  courtWidth: number; // условные единицы
  courtHeight: number;
  players: Array<{
    id: string;
    team: 'offense' | 'defense';
    color?: string;
    path: Array<{ x: number; y: number; t: number }>; // t в секундах
  }>;
  arrows?: Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    tStart?: number;
    tEnd?: number;
    color?: string;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}