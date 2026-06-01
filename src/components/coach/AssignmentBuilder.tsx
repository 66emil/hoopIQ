import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { Team, RosterPlayer, MaterialRef } from '../../types';
import { listMyTeams, getTeamRoster } from '../../services/supabaseTeams';
import { createAssignment } from '../../services/supabaseAssignments';

interface BuilderItem {
  ref: MaterialRef;
  title: string;
}

interface Props {
  items: BuilderItem[];
  onClose: () => void;
  onCreated: () => void;
}

export function AssignmentBuilder({ items, onClose, onCreated }: Props) {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState('');
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [targetMode, setTargetMode] = useState<'all' | 'select'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    listMyTeams(currentUser.id)
      .then((t) => {
        setTeams(t);
        if (t.length > 0) setTeamId(t[0].id);
      })
      .catch(() => setTeams([]));
  }, [currentUser?.id]);

  useEffect(() => {
    if (!teamId) { setRoster([]); return; }
    setTargetMode('all');
    setSelected(new Set());
    getTeamRoster(teamId).then(setRoster).catch(() => setRoster([]));
  }, [teamId]);

  const toggle = (playerId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(playerId) ? next.delete(playerId) : next.add(playerId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !teamId) return;
    setError(null);
    setSubmitting(true);
    try {
      await createAssignment({
        coachId: currentUser.id,
        teamId,
        title: title.trim() || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        materials: items.map((i) => i.ref),
        targetPlayerIds: targetMode === 'all' ? [] : [...selected],
      });
      onCreated();
    } catch (e: any) {
      setError(e?.message || 'Не удалось создать задание');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)', backdropFilter: 'blur(8px)' }}
    >
      <div className="card animate-fade-in-scale w-full" style={{ borderRadius: 'var(--r-xl)', maxWidth: 540, maxHeight: '90vh', overflow: 'auto' }}>
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)', padding: '18px 22px' }}>
          <h2 className="font-display text-xl">Новое задание</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <div className="text-[13px] font-semibold muted-2 mb-2">Материалы ({items.length})</div>
            <ul className="space-y-1">
              {items.map((i) => (
                <li key={`${i.ref.type}:${i.ref.id}`} className="text-sm flex items-center gap-2">
                  <span className="badge">{i.ref.type === 'quiz' ? 'Квиз' : 'Тактика'}</span>
                  <span>{i.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-[13px] font-semibold muted-2 mb-1.5">Команда</label>
            {teams.length === 0 ? (
              <div className="muted text-sm">Сначала создайте команду во вкладке «Команды».</div>
            ) : (
              <select className="field" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-semibold muted-2 mb-1.5">Кому</label>
            <div className="flex gap-2 mb-2">
              <button type="button" className={`btn btn-sm ${targetMode === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTargetMode('all')}>Вся команда</button>
              <button type="button" className={`btn btn-sm ${targetMode === 'select' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTargetMode('select')}>Выбрать игроков</button>
            </div>
            {targetMode === 'select' && (
              roster.length === 0 ? (
                <div className="muted text-sm">В команде пока нет игроков.</div>
              ) : (
                <ul className="space-y-1 max-h-40 overflow-auto">
                  {roster.map((p) => (
                    <li key={p.playerId}>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selected.has(p.playerId)} onChange={() => toggle(p.playerId)} />
                        {p.displayName || 'Игрок'}
                      </label>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold muted-2 mb-1.5">Название (необязательно)</label>
              <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Напр.: Разбор зоны" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold muted-2 mb-1.5">Дедлайн (необязательно)</label>
              <input type="datetime-local" className="field" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--brick-soft)', color: 'var(--brick)', borderRadius: 'var(--r-xs)', padding: '10px 14px', fontSize: 14 }}>
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Отмена</button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={submitting || !teamId || items.length === 0 || (targetMode === 'select' && selected.size === 0)}
            >
              {submitting ? 'Создаём…' : 'Назначить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
