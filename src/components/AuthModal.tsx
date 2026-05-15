import React, { useState } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const { login, register } = useAuth();
  const { t } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!isLogin && !acceptedPrivacy) {
        setError(t('auth.accept.required'));
        return;
      }
      let result;

      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
      }

      if (result.ok) {
        onSuccess();
        onClose();
        setEmail('');
        setPassword('');
        setName('');
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  if (!isOpen) return null;

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
            <Mail size={24} />
          </div>
          <h3 className="font-display text-lg">{t('auth.verify.title')}</h3>
          <p className="muted-2">{error}</p>
          <button onClick={handleClose} className="btn btn-primary">
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)', backdropFilter: 'blur(8px)' }}
    >
      <div className="card animate-fade-in-scale" style={{ borderRadius: 'var(--r-xl)', maxWidth: 480, width: '100%' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)', padding: '20px 24px' }}>
          <h2 className="font-display text-xl">
            {t(isLogin ? 'auth.login.title' : 'auth.register.title')}
          </h2>
          <button onClick={handleClose} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[13px] font-semibold muted-2 mb-1.5">
                <User size={14} className="inline mr-1" />
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
                placeholder={t('auth.name')}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold muted-2 mb-1.5">
              <Mail size={14} className="inline mr-1" />
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder={t('auth.email')}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold muted-2 mb-1.5">
              <Lock size={14} className="inline mr-1" />
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder={t('auth.password')}
              required
            />
          </div>

          {!isLogin && (
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

          {error && (
            <div style={{ background: 'var(--brick-soft)', color: 'var(--brick)', borderRadius: 'var(--r-xs)', padding: '10px 14px', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!isLogin && !acceptedPrivacy)}
            className="btn btn-primary w-full"
          >
            {isLoading ? t('auth.loading') : t(isLogin ? 'auth.login.button' : 'auth.register.button')}
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="btn btn-ghost w-full"
          >
            {isLogin ? t('auth.no.account') : t('auth.have.account')}
          </button>
        </form>
      </div>
    </div>
  );
};
