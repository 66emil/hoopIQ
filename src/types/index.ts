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
  stepImages?: string[]; // optional images for steps, indexed by step
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
  explanationVideoUrl?: string; // explanation video URL
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'offense' | 'defense';
  // completed?: boolean;
}

export interface UserProgress {
  completedTactics: string[];
  completedQuizzes: string[];
  totalScore: number;
  level: number; // numeric level index (1..9)
  streakCount?: number;
  lastActionDate?: string | null; // YYYY-MM-DD of last learning action
  lastStreakAwardDate?: string | null; // YYYY-MM-DD when streak bonus was last granted
}

export interface VideoQuiz extends QuizQuestion {
  videoFile?: File;
  videoTimestamp?: number; // time in seconds to stop video for question
}

export interface AdminData {
  tactics: Tactic[];
  quizzes: QuizQuestion[];
  playlists: Playlist[];
}

export type PlaylistScenario =
  | 'endgame'
  | 'transition'
  | 'vs_zone'
  | 'stars_breakdown'
  | 'custom';

export type PlaylistKind = 'quiz' | 'tactic';

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  category: 'offense' | 'defense';
  scenario: PlaylistScenario;
  thumbnail?: string;
  quizIds: string[]; // quiz ids included into playlist
  kind?: PlaylistKind; // optional for backward compatibility
  tacticIds?: string[]; // tactic ids included into playlist (when kind==='tactic')
}

export interface TacticPlaylist {
  id: string;
  title: string;
  description?: string;
  category: 'offense' | 'defense';
  scenario: PlaylistScenario;
  thumbnail?: string;
  tacticIds: string[]; // tactic ids included into playlist
  kind?: PlaylistKind; // should be 'tactic'
}

export interface TacticAnimation {
  courtWidth: number; // arbitrary units
  courtHeight: number;
  players: Array<{
    id: string;
    team: 'offense' | 'defense';
    color?: string;
    path: Array<{ x: number; y: number; t: number }>; // t in seconds
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

export type UserRole = 'coach' | 'player';

export interface Team {
  id: string;
  coachId: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export interface RosterPlayer {
  playerId: string;
  displayName: string | null;
  joinedAt: string;
}

export interface LeaderboardEntry {
  playerId: string;
  displayName: string | null;
  totalScore: number;
}

export interface QuizVideo {
  id: string;
  title: string;
  description?: string | null;
  category: 'offense' | 'defense';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl: string;
  thumbnail?: string | null;
  explanationVideoUrl?: string | null;
  createdAt: string;
}