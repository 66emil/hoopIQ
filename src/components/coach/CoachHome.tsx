import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBackground } from '../ui/Backgrounds';
import { RequireRole } from '../RequireRole';
import { CoachTeams } from './CoachTeams';
import { CoachLibrary } from './CoachLibrary';
import { CoachAssignments } from './CoachAssignments';

type Tab = 'teams' | 'library' | 'assignments';

const TABS: { key: Tab; label: string }[] = [
  { key: 'teams', label: 'Команды' },
  { key: 'library', label: 'Библиотека' },
  { key: 'assignments', label: 'Задания' },
];

function CoachDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('teams');

  return (
    <div className="min-h-screen relative">
      <AppBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">Кабинет тренера</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/profile')}>Профиль</button>
        </div>

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'teams' && <CoachTeams />}
        {tab === 'library' && <CoachLibrary />}
        {tab === 'assignments' && <CoachAssignments />}
      </div>
    </div>
  );
}

export const CoachHome = () => (
  <RequireRole role="coach">
    <CoachDashboard />
  </RequireRole>
);
