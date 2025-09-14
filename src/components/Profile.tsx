import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserProgress } from '../types';
import { AuthForm } from './AuthForm';

interface ProfileProps {
  progress: UserProgress;
}

export const Profile = ({ progress }: ProfileProps) => {
  const { currentUser, logout, updateProfile, login, register } = useAuth();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl space-y-6 border border-gray-600">
        <h2 className="text-2xl font-bold text-white">Login / Registration</h2>
        <AuthForm
          mode={authMode}
          onLogin={async (email, password) => {
            const res = await login(email, password);
            return res.ok ? null : res.error;
          }}
          onRegister={async (name, email, password) => {
            const res = await register(email, password, name);
            return res.ok ? null : res.error;
          }}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl space-y-4 border border-gray-600">
      <div>
        <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
        <p className="text-gray-300 text-sm">{currentUser.email}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-900/30 p-4 rounded border border-orange-600">
          <div className="text-sm text-orange-400">Level</div>
          <div className="text-2xl font-bold text-orange-300">{progress.level}</div>
        </div>
        <div className="bg-blue-900/30 p-4 rounded border border-blue-600">
          <div className="text-sm text-blue-400">Score</div>
          <div className="text-2xl font-bold text-blue-300">{progress.totalScore}</div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Name</label>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500" 
        />
        <button 
          onClick={() => updateProfile({ name })} 
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors shadow-lg hover:shadow-orange-500/25"
        >
          Save
        </button>
      </div>

      <div className="pt-4 border-t border-gray-600">
        <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors">Logout</button>
      </div>
    </div>
  );
};


