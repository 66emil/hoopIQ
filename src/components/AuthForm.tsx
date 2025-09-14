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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
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
        disabled={submitting}
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


