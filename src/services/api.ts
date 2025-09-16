const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5174';

export type LoginResponse = { accessToken: string };

export async function apiRegister(name: string, email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Registration failed');
    }
    
    return res.json();
  } catch (error) {
    console.error('API Register Error:', error);
    throw error;
  }
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Invalid email or password');
    }
    
    return res.json();
  } catch (error) {
    console.error('API Login Error:', error);
    throw error;
  }
}

export async function apiMe(accessToken: string): Promise<{ id: string; email: string; name: string; level: number; points: number; createdAt: string }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function apiUpdateProgress(accessToken: string, level: number, points: number): Promise<{ success: boolean; level: number; points: number }> {
  const res = await fetch(`${API_BASE}/auth/progress`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    credentials: 'include',
    body: JSON.stringify({ level, points })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update progress');
  }
  
  return res.json();
}

export type QuizVideo = {
  id: string;
  title: string;
  description?: string | null;
  category: 'offense' | 'defense';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl: string;
  thumbnail?: string | null;
  explanationVideoUrl?: string | null;
  createdAt: string;
};

export async function videosList(): Promise<QuizVideo[]> {
  const res = await fetch(`${API_BASE}/videos`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load videos');
  return res.json();
}

export async function videosCreate(payload: Omit<QuizVideo, 'id' | 'createdAt'>): Promise<QuizVideo> {
  const res = await fetch(`${API_BASE}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create video');
  return res.json();
}

export async function videosUpdate(id: string, payload: Partial<Omit<QuizVideo, 'id' | 'createdAt'>>): Promise<QuizVideo> {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update video');
  return res.json();
}

export async function videosDelete(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete video');
}

// Tactics API
import type { Tactic, QuizQuestion } from '../types';

export async function tacticsList(): Promise<Tactic[]> {
  const res = await fetch(`${API_BASE}/tactics`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load tactics');
  return res.json();
}

export async function tacticsCreate(payload: Omit<Tactic, 'id'>, accessToken: string): Promise<Tactic> {
  const res = await fetch(`${API_BASE}/tactics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create tactic');
  }
  return res.json();
}

export async function tacticsUpdate(id: string, payload: Partial<Omit<Tactic, 'id'>>, accessToken: string): Promise<Tactic> {
  const res = await fetch(`${API_BASE}/tactics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update tactic');
  }
  return res.json();
}

export async function tacticsDelete(id: string, accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tactics/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete tactic');
  }
}

// Quizzes API
export async function quizzesList(): Promise<QuizQuestion[]> {
  const res = await fetch(`${API_BASE}/quizzes`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load quizzes');
  return res.json();
}

export async function quizzesCreate(payload: Omit<QuizQuestion, 'id'>, accessToken: string): Promise<QuizQuestion> {
  const res = await fetch(`${API_BASE}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create quiz');
  }
  return res.json();
}

export async function quizzesUpdate(id: string, payload: Partial<Omit<QuizQuestion, 'id'>>, accessToken: string): Promise<QuizQuestion> {
  const res = await fetch(`${API_BASE}/quizzes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update quiz');
  }
  return res.json();
}

export async function quizzesDelete(id: string, accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/quizzes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete quiz');
  }
}

// Playlists API
import type { Playlist } from '../types';

export async function playlistsList(): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE}/playlists`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load playlists');
  return res.json();
}

export async function playlistsCreate(payload: Omit<Playlist, 'id'>, accessToken: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create playlist');
  }
  return res.json();
}

export async function playlistsUpdate(id: string, payload: Partial<Omit<Playlist, 'id'>>, accessToken: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/playlists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update playlist');
  }
  return res.json();
}

export async function playlistsDelete(id: string, accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/playlists/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete playlist');
  }
}

export async function playlistItemsList(id: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/playlists/${id}/items`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load playlist items');
  return res.json();
}

export async function playlistItemsAdd(id: string, payload: { videoId?: string; tacticId?: string; position?: number }, accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/playlists/${id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add item');
  }
}

export async function playlistItemsUpdatePosition(id: string, itemId: string, position: number, accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/playlists/${id}/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    credentials: 'include',
    body: JSON.stringify({ position })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update position');
  }
}

export async function playlistItemsDelete(id: string, itemId: string, accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/playlists/${id}/items/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete item');
  }
}

