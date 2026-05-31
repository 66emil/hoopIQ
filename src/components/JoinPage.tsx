import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from './AuthForm';
import { AppBackground } from './ui/Backgrounds';
import { joinTeamByCode } from '../services/supabaseTeams';

const PENDING_INVITE_KEY = 'hoopiq-pending-invite';

type Phase = 'checking' | 'need-auth' | 'joining' | 'done' | 'error';

export const JoinPage = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuthLoading, login, register } = useAuth();

  const code = inviteCode || localStorage.getItem(PENDING_INVITE_KEY) || '';
  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Persist intent so it survives the email-confirmation round-trip.
  useEffect(() => {
    if (inviteCode) localStorage.setItem(PENDING_INVITE_KEY, inviteCode);
  }, [inviteCode]);

  // Drive the join once auth state is known.
  useEffect(() => {
    if (isAuthLoading) return;
    if (!code) {
      setError('Ссылка-приглашение недействительна');
      setPhase('error');
      return;
    }
    if (!currentUser) {
      setPhase('need-auth');
      return;
    }
    let active = true;
    setPhase('joining');
    joinTeamByCode(code)
      .then(() => {
        if (!active) return;
        localStorage.removeItem(PENDING_INVITE_KEY);
        setPhase('done');
        navigate('/player', { replace: true });
      })
      .catch((e: any) => {
        if (!active) return;
        setError(e?.message || 'Не удалось вступить в команду');
        setPhase('error');
      });
    return () => {
      active = false;
    };
  }, [currentUser, isAuthLoading, code, navigate]);

  const emailRedirectTo = `${window.location.origin}/join/${code}`;

  return (
    <div className="min-h-screen relative">
      <AppBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="card p-6 w-full" style={{ maxWidth: 460 }}>
          <h1 className="font-display text-2xl mb-1">Вступление в команду</h1>
          <p className="muted-2 mb-5 text-sm">Код приглашения: <b>{code || '—'}</b></p>

          {(phase === 'checking' || phase === 'joining') && (
            <div className="muted">Подключаем вас к команде…</div>
          )}

          {phase === 'error' && (
            <div className="space-y-4">
              <div style={{ background: 'var(--brick-soft)', color: 'var(--brick)', borderRadius: 'var(--r-xs)', padding: '10px 14px', fontSize: 14 }}>
                {error}
              </div>
              <button className="btn btn-ghost w-full" onClick={() => navigate('/')}>На главную</button>
            </div>
          )}

          {phase === 'need-auth' && (
            <>
              <p className="muted-2 text-sm mb-4">
                Чтобы войти в команду, зарегистрируйтесь или войдите. После входа мы автоматически добавим вас в состав.
              </p>
              <AuthForm
                mode={authMode}
                onLogin={async (email, password) => {
                  const res = await login(email, password);
                  return res.ok ? null : res.error;
                }}
                onRegister={async (name, email, password) => {
                  const res = await register(email, password, name, { role: 'player', emailRedirectTo });
                  return res.ok ? null : res.error;
                }}
                onSwitchMode={(m) => setAuthMode(m)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
