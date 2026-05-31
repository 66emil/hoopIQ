import { getSupabaseClient } from './supabaseClient';
import type { Team, RosterPlayer, LeaderboardEntry } from '../types';

const TEAMS = 'teams';
const MEMBERS = 'team_members';

function mapTeam(r: any): Team {
  return {
    id: String(r.id),
    coachId: String(r.coach_id),
    name: r.name,
    inviteCode: r.invite_code,
    createdAt: r.created_at,
  };
}

const TEAM_COLS = 'id, coach_id, name, invite_code, created_at';

// --- Coach ---

export async function createTeam(name: string, coachId: string): Promise<Team> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TEAMS)
    .insert({ name, coach_id: coachId })
    .select(TEAM_COLS)
    .single();
  if (error) throw new Error(error.message || 'Не удалось создать команду');
  return mapTeam(data);
}

export async function listMyTeams(coachId: string): Promise<Team[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TEAMS)
    .select(TEAM_COLS)
    .eq('coach_id', coachId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message || 'Не удалось загрузить команды');
  return (data || []).map(mapTeam);
}

export async function renameTeam(teamId: string, name: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TEAMS).update({ name }).eq('id', teamId);
  if (error) throw new Error(error.message || 'Не удалось переименовать команду');
}

export async function deleteTeam(teamId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(TEAMS).delete().eq('id', teamId);
  if (error) throw new Error(error.message || 'Не удалось удалить команду');
}

export async function getTeamRoster(teamId: string): Promise<RosterPlayer[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('get_team_roster', { p_team: teamId });
  if (error) throw new Error(error.message || 'Не удалось загрузить состав');
  return (data || []).map((r: any) => ({
    playerId: String(r.player_id),
    displayName: r.display_name ?? null,
    joinedAt: r.joined_at,
  }));
}

export async function removePlayer(teamId: string, playerId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(MEMBERS)
    .delete()
    .eq('team_id', teamId)
    .eq('player_id', playerId);
  if (error) throw new Error(error.message || 'Не удалось удалить игрока');
}

export async function getTeamLeaderboard(teamId: string): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('get_team_leaderboard', { p_team: teamId });
  if (error) throw new Error(error.message || 'Не удалось загрузить рейтинг');
  return (data || []).map((r: any) => ({
    playerId: String(r.player_id),
    displayName: r.display_name ?? null,
    totalScore: Number(r.total_score) || 0,
  }));
}

// --- Player ---

/** Join a team by invite code. Returns the team id. Idempotent. */
export async function joinTeamByCode(inviteCode: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('join_team', { p_invite_code: inviteCode.trim() });
  if (error) {
    const msg = error.message || '';
    if (msg.includes('INVALID_INVITE_CODE')) throw new Error('Команда с таким кодом не найдена');
    if (msg.includes('ALREADY_IN_A_TEAM')) throw new Error('Вы уже состоите в другой команде');
    throw new Error(msg || 'Не удалось вступить в команду');
  }
  return String(data);
}

/** The single team the current player belongs to (MVP: one team per player). */
export async function getMyTeam(playerId: string): Promise<Team | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(MEMBERS)
    .select('team_id, teams(id, coach_id, name, invite_code, created_at)')
    .eq('player_id', playerId)
    .maybeSingle();
  if (error) throw new Error(error.message || 'Не удалось загрузить команду');
  if (!data || !(data as any).teams) return null;
  return mapTeam((data as any).teams);
}
