import { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface AuthFormProps {
  mode: 'login' | 'register';
  onLogin: (email: string, password: string) => Promise<string | null> | string | null;
  onRegister: (name: string, email: string, password: string) => Promise<string | null> | string | null;
  onSwitchMode?: (mode: 'login' | 'register') => void;
}

export const AuthForm = ({ mode, onLogin, onRegister, onSwitchMode }: AuthFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const { t } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'register' && !acceptedPrivacy) {
        setError(t('auth.accept.required'));
        return;
      }
      if (mode === 'login') {
        const err = await onLogin(email, password);
        setError(err);
      } else {
        const err = await onRegister(name, email, password);
        setError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const errorMessage = String(error || '');
  const lcError = errorMessage.toLowerCase();
  const isVerifyEmailError = !!error && (
    (lcError.includes('verify') && lcError.includes('email')) ||
    (lcError.includes('confirm') && lcError.includes('email')) ||
    lcError.includes('подтверд') ||
    errorMessage === 'Please verify your email to complete registration'
  );

  if (isVerifyEmailError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)', backdropFilter: 'blur(8px)' }}>
        <div className="card p-6 text-center space-y-4 animate-fade-in-scale" style={{ maxWidth: 480, width: '100%' }}>
          <div className="mx-auto icon-soft lg" style={{ margin: '0 auto' }}>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>@</span>
          </div>
          <h3 className="font-display text-lg">{t('auth.verify.title')}</h3>
          <p className="muted-2">{error}</p>
          <button
            onClick={() => setError(null)}
            className="btn btn-primary"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <div>
          <label className="block text-[13px] font-semibold muted-2 mb-1.5">{t('auth.name')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            required
          />
        </div>
      )}
      <div>
        <label className="block text-[13px] font-semibold muted-2 mb-1.5">{t('auth.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          required
        />
      </div>
      {mode === 'register' && (
        <label className="flex items-start gap-3 text-sm muted-2">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded"
            style={{ accentColor: 'var(--accent)' }}
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            required
          />
          <span>
            {t('auth.accept.privacy')}{' '}
            <a href="/privacy" target="_blank" style={{ color: 'var(--accent)' }} className="underline">
              {t('auth.privacy.link')}
            </a>
          </span>
        </label>
      )}
      <div>
        <label className="block text-[13px] font-semibold muted-2 mb-1.5">{t('auth.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          required
        />
      </div>
      {error && (
        <div style={{ background: 'var(--brick-soft)', color: 'var(--brick)', borderRadius: 'var(--r-xs)', padding: '10px 14px', fontSize: 14 }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting || (mode === 'register' && !acceptedPrivacy)}
        className="btn btn-primary w-full"
      >
        {submitting ? t('auth.loading') : t(mode === 'login' ? 'auth.login.button' : 'auth.register.button')}
      </button>
      {onSwitchMode && (
        <button
          type="button"
          className="btn btn-ghost w-full text-sm"
          onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? t('auth.no.account') : t('auth.have.account')}
        </button>
      )}
    </form>
  );
};
