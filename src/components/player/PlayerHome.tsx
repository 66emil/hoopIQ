import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AppBackground } from '../ui/Backgrounds';
import { RequireRole } from '../RequireRole';
import type { Team } from '../../types';
import { getMyTeam } from '../../services/supabaseTeams';

function PlayerDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getMyTeam(currentUser.id)
      .then(setTeam)
      .catch(() => setTeam(null))
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  return (
    <div className="min-h-screen relative">
      <AppBackground />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">Назначено мне</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/profile')}>Профиль</button>
        </div>

        {loading ? (
          <div className="muted">Загрузка…</div>
        ) : !team ? (
          <div className="card p-6 text-center muted-2">
            Вы пока не состоите в команде. Откройте ссылку-приглашение от тренера.
          </div>
        ) : (
          <>
            <div className="card p-5">
              <div className="muted-2 text-sm">Команда</div>
              <div className="font-display text-lg">{team.name}</div>
            </div>
            <div className="card p-6 text-center muted-2">
              Заданий пока нет. Когда тренер назначит материал — он появится здесь.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const PlayerHome = () => (
  <RequireRole role="player">
    <PlayerDashboard />
  </RequireRole>
);
