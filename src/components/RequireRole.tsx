import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import type { UserRole } from '../types';
import { AppBackground } from './ui/Backgrounds';

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <AppBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="card p-6 w-full" style={{ maxWidth: 460 }}>{children}</div>
      </div>
    </div>
  );
}

export function RequireRole({ role: need, children }: { role: UserRole; children: ReactNode }) {
  const { currentUser, isAuthLoading } = useAuth();
  const { role, isRoleLoading } = useRole();
  const navigate = useNavigate();

  if (isAuthLoading || isRoleLoading) {
    return <Centered><div className="muted text-center">Загрузка…</div></Centered>;
  }

  if (!currentUser) {
    return (
      <Centered>
        <div className="space-y-4 text-center">
          <div className="font-display text-xl">Требуется вход</div>
          <div className="muted-2">Войдите в аккаунт, чтобы продолжить.</div>
          <button className="btn btn-primary" onClick={() => navigate('/app/profile')}>Войти</button>
        </div>
      </Centered>
    );
  }

  if (role !== need) {
    const target = role === 'coach' ? '/coach' : role === 'player' ? '/player' : '/app/profile';
    return (
      <Centered>
        <div className="space-y-4 text-center">
          <div className="font-display text-xl">Раздел не для вашей роли</div>
          <button className="btn btn-primary" onClick={() => navigate(target)}>Перейти к себе</button>
        </div>
      </Centered>
    );
  }

  return <>{children}</>;
}
