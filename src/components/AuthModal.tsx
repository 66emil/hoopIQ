import React, { useState } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
      }

      if (result.ok) {
        onSuccess();
        onClose();
        // Сброс формы
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-orange-500/40 animate-fade-in-scale">
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center">
              <Mail className="h-6 w-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Verify your email</h3>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={handleClose}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Login' : 'Register'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                placeholder="Enter your name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg hover:shadow-orange-500/25 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
