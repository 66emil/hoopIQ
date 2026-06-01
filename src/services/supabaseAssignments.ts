import { getSupabaseClient } from './supabaseClient';
import { getTeamRoster } from './supabaseTeams';
import type {
  Assignment,
  AssignmentInput,
  AssignmentStatus,
  AssignmentPlayerStatus,
  MaterialRef,
} from '../types';

const ASSIGNMENTS = 'assignments';
const MATERIALS = 'assignment_materials';
const TARGETS = 'assignment_targets';
const RESULTS = 'results';

const ASSIGNMENT_COLS = 'id, coach_id, team_id, title, deadline, created_at';

function mapAssignment(r: any): Assignment {
  return {
    id: String(r.id),
    coachId: String(r.coach_id),
    teamId: String(r.team_id),
    title: r.title ?? null,
    deadline: r.deadline ?? null,
    createdAt: r.created_at,
  };
}

const matKey = (m: MaterialRef) => `${m.type}:${m.id}`;

export async function createAssignment(input: AssignmentInput): Promise<Assignment> {
  const supabase = getSupabaseClient();

  const { data: created, error } = await supabase
    .from(ASSIGNMENTS)
    .insert({
      coach_id: input.coachId,
      team_id: input.teamId,
      title: input.title?.trim() || null,
      deadline: input.deadline || null,
    })
    .select(ASSIGNMENT_COLS)
    .single();
  if (error) throw new Error(error.message || 'Не удалось создать задание');

  const assignment = mapAssignment(created);

  // Materials (required)
  if (input.materials.length === 0) {
    await supabase.from(ASSIGNMENTS).delete().eq('id', assignment.id);
    throw new Error('Выберите хотя бы один материал');
  }
  const matRows = input.materials.map((m) => ({
    assignment_id: assignment.id,
    material_type: m.type,
    material_id: m.id,
  }));
  const { error: matErr } = await supabase.from(MATERIALS).insert(matRows);
  if (matErr) {
    await supabase.from(ASSIGNMENTS).delete().eq('id', assignment.id);
    throw new Error(matErr.message || 'Не удалось сохранить материалы задания');
  }

  // Targets (optional — empty means whole team)
  if (input.targetPlayerIds.length > 0) {
    const tgtRows = input.targetPlayerIds.map((pid) => ({
      assignment_id: assignment.id,
      player_id: pid,
    }));
    const { error: tgtErr } = await supabase.from(TARGETS).insert(tgtRows);
    if (tgtErr) {
      await supabase.from(ASSIGNMENTS).delete().eq('id', assignment.id);
      throw new Error(tgtErr.message || 'Не удалось сохранить получателей задания');
    }
  }

  return assignment;
}

export async function listAssignments(coachId: string, teamId?: string): Promise<Assignment[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from(ASSIGNMENTS).select(ASSIGNMENT_COLS).eq('coach_id', coachId);
  if (teamId) query = query.eq('team_id', teamId);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Не удалось загрузить задания');
  return (data || []).map(mapAssignment);
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from(ASSIGNMENTS).delete().eq('id', assignmentId);
  if (error) throw new Error(error.message || 'Не удалось удалить задание');
}

export async function getAssignmentMaterials(assignmentId: string): Promise<MaterialRef[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(MATERIALS)
    .select('material_type, material_id')
    .eq('assignment_id', assignmentId);
  if (error) throw new Error(error.message || 'Не удалось загрузить материалы');
  return (data || []).map((r: any) => ({ type: r.material_type, id: String(r.material_id) }));
}

/** Composes who-completed-what for one assignment (coach view). */
export async function getAssignmentStatus(
  assignmentId: string,
  teamId: string
): Promise<AssignmentStatus> {
  const supabase = getSupabaseClient();

  const [materials, targetsRes, resultsRes, roster] = await Promise.all([
    getAssignmentMaterials(assignmentId),
    supabase.from(TARGETS).select('player_id').eq('assignment_id', assignmentId),
    supabase.from(RESULTS).select('player_id, material_type, material_id, score').eq('assignment_id', assignmentId),
    getTeamRoster(teamId),
  ]);

  if (targetsRes.error) throw new Error(targetsRes.error.message);
  if (resultsRes.error) throw new Error(resultsRes.error.message);

  const targetIds = (targetsRes.data || []).map((r: any) => String(r.player_id));
  const targetSet = new Set(targetIds);
  const targetPlayers = targetIds.length > 0 ? roster.filter((p) => targetSet.has(p.playerId)) : roster;

  // index results by `${playerId}|${type}:${id}`
  const resultIndex = new Map<string, number>();
  for (const r of resultsRes.data || []) {
    resultIndex.set(`${String(r.player_id)}|${r.material_type}:${String(r.material_id)}`, Number(r.score) || 0);
  }

  const players: AssignmentPlayerStatus[] = targetPlayers.map((p) => {
    const perMaterial: AssignmentPlayerStatus['perMaterial'] = {};
    let done = 0;
    for (const m of materials) {
      const key = matKey(m);
      const score = resultIndex.get(`${p.playerId}|${key}`);
      const isDone = score !== undefined;
      perMaterial[key] = { done: isDone, score: score ?? 0 };
      if (isDone) done += 1;
    }
    return {
      playerId: p.playerId,
      displayName: p.displayName,
      doneCount: done,
      totalCount: materials.length,
      perMaterial,
    };
  });

  return { materials, players };
}
