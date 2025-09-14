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


