import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { Team, RosterPlayer } from '../../types';
import { createTeam, listMyTeams, getTeamRoster, removePlayer, deleteTeam } from '../../services/supabaseTeams';

function inviteLink(code: string) {
  return `${window.location.origin}/join/${code}`;
}

function TeamCard({ team, onChanged }: { team: Team; onChanged: () => void }) {
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadRoster = () => {
    setLoading(true);
    getTeamRoster(team.id)
      .then(setRoster)
      .catch(() => setRoster([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadRoster, [team.id]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink(team.inviteCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleRemove = async (playerId: string) => {
    try {
      await removePlayer(team.id, playerId);
      loadRoster();
    } catch (e: any) {
      alert(e?.message || 'Не удалось удалить игрока');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить команду «${team.name}»? Это действие необратимо.`)) return;
    try {
      await deleteTeam(team.id);
      onChanged();
    } catch (e: any) {
      alert(e?.message || 'Не удалось удалить команду');
    }
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg">{team.name}</div>
          <div className="muted-2 text-sm">Код: <b>{team.inviteCode}</b></div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleDelete}>Удалить</button>
      </div>

      <div className="flex items-center gap-2">
        <input className="field flex-1" readOnly value={inviteLink(team.inviteCode)} />
        <button className="btn btn-primary btn-sm" onClick={copy}>{copied ? 'Скопировано' : 'Копировать'}</button>
      </div>

      <div>
        <div className="text-[13px] font-semibold muted-2 mb-2">Состав ({roster.length})</div>
        {loading ? (
          <div className="muted text-sm">Загрузка…</div>
        ) : roster.length === 0 ? (
          <div className="muted text-sm">Пока никто не вступил. Отправьте ссылку игрокам.</div>
        ) : (
          <ul className="space-y-1">
            {roster.map((p) => (
              <li key={p.playerId} className="flex items-center justify-between text-sm py-1">
                <span>{p.displayName || 'Игрок'}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(p.playerId)}>Убрать</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function CoachTeams() {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = () => {
    if (!currentUser) return;
    setLoading(true);
    listMyTeams(currentUser.id)
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentUser?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newName.trim()) return;
    setCreating(true);
    try {
      await createTeam(newName.trim(), currentUser.id);
      setNewName('');
      load();
    } catch (e: any) {
      alert(e?.message || 'Не удалось создать команду');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="card p-5 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-[13px] font-semibold muted-2 mb-1.5">Новая команда</label>
          <input className="field" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Например: U16 Молодёжка" required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating || !newName.trim()}>
          {creating ? 'Создаём…' : 'Создать'}
        </button>
      </form>

      {loading ? (
        <div className="muted">Загрузка команд…</div>
      ) : teams.length === 0 ? (
        <div className="card p-6 text-center muted-2">Команд пока нет. Создайте первую — получите ссылку для игроков.</div>
      ) : (
        <div className="space-y-4">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}
