import { getSupabaseClient } from './supabaseClient';
import type { Playlist } from '../types';

const PLAYLISTS = 'playlists';
const PLAYLIST_ITEMS = 'playlist_items';
const TACTIC_PLAYLIST_ITEMS = 'tactic_playlist_items';

export async function listPlaylistsFromSupabase(): Promise<Playlist[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PLAYLISTS)
    .select('id, title, description, category, scenario, thumbnail, kind, created_at');
  if (error) throw new Error(error.message || 'Failed to load playlists');

  // Load items counts per playlist to fill quizIds/tacticIds length for UI (optional)
  const result: Playlist[] = [];
  for (const p of data || []) {
    const kind = (p.kind as 'quiz' | 'tactic') || 'quiz';
    if (kind === 'tactic') {
      const { data: items, error: itemsErr } = await supabase
        .from(TACTIC_PLAYLIST_ITEMS)
        .select('tacticid')
        .eq('playlistid', p.id);
      if (itemsErr) throw new Error(itemsErr.message || 'Failed to load tactic playlist items');
      result.push({
        id: String(p.id),
        title: p.title,
        description: p.description || undefined,
        category: p.category,
        scenario: p.scenario,
        thumbnail: p.thumbnail || undefined,
        kind,
        quizIds: [],
        tacticIds: (items || []).map((i: any) => String(i.tacticid))
      });
    } else {
      const { data: items, error: itemsErr } = await supabase
        .from(PLAYLIST_ITEMS)
        .select('videoid')
        .eq('playlistid', p.id);
      if (itemsErr) throw new Error(itemsErr.message || 'Failed to load playlist items');
      result.push({
        id: String(p.id),
        title: p.title,
        description: p.description || undefined,
        category: p.category,
        scenario: p.scenario,
        thumbnail: p.thumbnail || undefined,
        kind,
        quizIds: (items || []).map((i: any) => String(i.videoid)),
        tacticIds: []
      });
    }
  }
  return result;
}

export async function createPlaylistInSupabase(payload: Omit<Playlist, 'id'>): Promise<Playlist> {
  const supabase = getSupabaseClient();
  const { quizIds = [], tacticIds = [], ...rest } = payload as any;
  const insert = { ...rest } as any;
  const { data, error } = await supabase.from(PLAYLISTS).insert(insert).select('id, title, description, category, scenario, thumbnail, kind').single();
  if (error) throw new Error(error.message || 'Failed to create playlist');
  const playlistId = String(data.id);
  if ((data.kind as 'quiz' | 'tactic') === 'tactic') {
    if (tacticIds.length) {
      const items = tacticIds.map((t: string, idx: number) => ({ playlistid: playlistId, tacticid: t, position: idx }));
      const { error: itemsErr } = await supabase.from(TACTIC_PLAYLIST_ITEMS).insert(items);
      if (itemsErr) throw new Error(itemsErr.message || 'Failed to insert tactic playlist items');
    }
    return { ...payload, id: playlistId } as Playlist;
  } else {
    if (quizIds.length) {
      const items = quizIds.map((v: string, idx: number) => ({ playlistid: playlistId, videoid: v, position: idx }));
      const { error: itemsErr } = await supabase.from(PLAYLIST_ITEMS).insert(items);
      if (itemsErr) throw new Error(itemsErr.message || 'Failed to insert playlist items');
    }
    return { ...payload, id: playlistId } as Playlist;
  }
}

export async function updatePlaylistInSupabase(id: string, updates: Partial<Playlist>): Promise<Playlist> {
  const supabase = getSupabaseClient();
  const { quizIds, tacticIds, ...rest } = updates as any;
  const { error } = await supabase.from(PLAYLISTS).update(rest).eq('id', id).select('id, title, description, category, scenario, thumbnail, kind').single();
  if (error) throw new Error(error.message || 'Failed to update playlist');
  // Update items if provided explicitly
  if (Array.isArray(quizIds)) {
    await supabase.from(PLAYLIST_ITEMS).delete().eq('playlistid', id);
    if (quizIds.length) {
      const items = quizIds.map((v: string, idx: number) => ({ playlistid: id, videoid: v, position: idx }));
      const { error: itemsErr } = await supabase.from(PLAYLIST_ITEMS).insert(items);
      if (itemsErr) throw new Error(itemsErr.message || 'Failed to insert playlist items');
    }
  }
  if (Array.isArray(tacticIds)) {
    await supabase.from(TACTIC_PLAYLIST_ITEMS).delete().eq('playlistid', id);
    if (tacticIds.length) {
      const items = tacticIds.map((t: string, idx: number) => ({ playlistid: id, tacticid: t, position: idx }));
      const { error: itemsErr } = await supabase.from(TACTIC_PLAYLIST_ITEMS).insert(items);
      if (itemsErr) throw new Error(itemsErr.message || 'Failed to insert tactic playlist items');
    }
  }
  return { id, ...(rest as any), quizIds: quizIds ?? [], tacticIds: tacticIds ?? [] } as Playlist;
}

export async function deletePlaylistInSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(PLAYLISTS).delete().eq('id', id);
  if (error) throw new Error(error.message || 'Failed to delete playlist');
}


