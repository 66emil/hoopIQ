import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdminData } from '../../hooks/useAdminData';
import type { Assignment, AssignmentStatus, Team, MaterialRef } from '../../types';
import { listMyTeams } from '../../services/supabaseTeams';
import { listAssignments, getAssignmentStatus, deleteAssignment } from '../../services/supabaseAssignments';

const keyOf = (m: MaterialRef) => `${m.type}:${m.id}`;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function AssignmentRow({
  assignment,
  teamName,
  titleFor,
  onDeleted,
}: {
  assignment: Assignment;
  teamName: string;
  titleFor: (m: MaterialRef) => string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AssignmentStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || status) return;
    setLoading(true);
    getAssignmentStatus(assignment.id, assignment.teamId)
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [open]);

  const handleDelete = async () => {
    if (!confirm('Удалить задание?')) return;
    try {
      await deleteAssignment(assignment.id);
      onDeleted();
    } catch (e: any) {
      alert(e?.message || 'Не удалось удалить задание');
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <button className="text-left flex-1" onClick={() => setOpen((v) => !v)}>
          <div className="font-semibold">{assignment.title || 'Задание'}</div>
          <div className="muted-2 text-sm">
            {teamName} · дедлайн: {formatDate(assignment.deadline)}
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)}>{open ? 'Скрыть' : 'Статус'}</button>
          <button className="btn btn-ghost btn-sm" onClick={handleDelete}>Удалить</button>
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--line)' }}>
          {loading ? (
            <div className="muted text-sm">Загрузка статуса…</div>
          ) : !status ? (
            <div className="muted text-sm">Не удалось загрузить статус.</div>
          ) : status.players.length === 0 ? (
            <div className="muted text-sm">Нет получателей (в команде нет игроков).</div>
          ) : (
            <div className="space-y-3">
              <div className="text-[13px] muted-2">
                Материалы: {status.materials.map((m) => titleFor(m)).join(', ')}
              </div>
              <ul className="space-y-2">
                {status.players.map((p) => {
                  const complete = p.doneCount === p.totalCount && p.totalCount > 0;
                  return (
                    <li key={p.playerId} className="flex items-center justify-between text-sm">
                      <span>{p.displayName || 'Игрок'}</span>
                      <span className="flex items-center gap-3">
                        <span className="muted-2">
                          {status.materials.reduce((sum, m) => sum + (p.perMaterial[keyOf(m)]?.score || 0), 0)} очк.
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: complete ? 'var(--grass-soft, #e6f5e6)' : 'var(--brick-soft)',
                            color: complete ? 'var(--grass, #2a7)' : 'var(--brick)',
                          }}
                        >
                          {p.doneCount}/{p.totalCount}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CoachAssignments() {
  const { currentUser } = useAuth();
  const { quizzes, tactics } = useAdminData();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([listAssignments(currentUser.id), listMyTeams(currentUser.id)])
      .then(([a, t]) => {
        setAssignments(a);
        setTeams(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentUser?.id]);

  const teamName = useMemo(() => {
    const map = new Map(teams.map((t) => [t.id, t.name]));
    return (id: string) => map.get(id) || 'Команда';
  }, [teams]);

  const titleFor = useMemo(() => {
    const map = new Map<string, string>();
    quizzes.forEach((q) => map.set(`quiz:${q.id}`, q.title));
    tactics.forEach((t) => map.set(`tactic:${t.id}`, t.title));
    return (m: MaterialRef) => map.get(keyOf(m)) || '—';
  }, [quizzes, tactics]);

  if (loading) return <div className="muted">Загрузка заданий…</div>;
  if (assignments.length === 0) {
    return <div className="card p-6 text-center muted-2">Заданий пока нет. Создайте первое во вкладке «Библиотека».</div>;
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => (
        <AssignmentRow key={a.id} assignment={a} teamName={teamName(a.teamId)} titleFor={titleFor} onDeleted={load} />
      ))}
    </div>
  );
}
