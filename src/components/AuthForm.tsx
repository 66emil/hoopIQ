import { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'register' && !acceptedPrivacy) {
        setError('Please accept the Privacy Policy');
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-orange-500/40 animate-fade-in-scale">
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center">
              <span className="text-orange-400 font-bold">@</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Verify your email</h3>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-lg hover:shadow-orange-500/25"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500" 
            required 
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500" 
          required 
        />
      </div>
      {mode === 'register' && (
        <label className="flex items-start gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            required
          />
          <span>
            I have read and agree with the{' '}
            <a href="/privacy" target="_blank" className="text-orange-400 hover:text-orange-300 underline">
              Privacy Policy
            </a>
          </span>
        </label>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500" 
          required 
        />
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <button 
        type="submit" 
        disabled={submitting || (mode === 'register' && !acceptedPrivacy)}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors shadow-lg hover:shadow-orange-500/25 disabled:cursor-not-allowed"
      >
        {submitting ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
      </button>
      {onSwitchMode && (
        <button 
          type="button" 
          className="w-full text-sm text-gray-400 hover:text-orange-400 transition-colors" 
          onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      )}
    </form>
  );
};


