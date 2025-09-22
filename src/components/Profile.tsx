import { useEffect, useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useAuth } from '../hooks/useAuth';
import { getLevelInfo } from '../services/levels';
import { UserProgress } from '../types';
import { AuthForm } from './AuthForm';
import { isSupabaseEnabled } from '../services/supabaseClient';
import { getProfile, upsertProfile } from '../services/supabaseProfile';

interface ProfileProps {
  progress: UserProgress;
}

export const Profile = ({ progress }: ProfileProps) => {
  const { currentUser, logout, updateProfile, login, register, isAuthLoading } = useAuth();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem('profile-avatar'));
  const [bio, setBio] = useState<string>(() => localStorage.getItem('profile-bio') || '');
  const [position, setPosition] = useState<string>(() => localStorage.getItem('profile-position') || '');
  const [avatarCrop, setAvatarCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [avatarZoom, setAvatarZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setName(currentUser?.name ?? ''); }, [currentUser?.name]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      setAvatar(url);
      localStorage.setItem('profile-avatar', url);
      setDirty(true);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const saveBio = (v: string) => { setBio(v); localStorage.setItem('profile-bio', v); setDirty(true); };
  const savePosition = (v: string) => { setPosition(v); localStorage.setItem('profile-position', v); setDirty(true); };

  // Load profile from Supabase if enabled
  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      if (!isSupabaseEnabled()) return;
      try {
        const p = await getProfile(currentUser.id);
        if (p) {
          if (p.nickname) { setName(p.nickname); }
          if (p.avatarUrl) { setAvatar(p.avatarUrl); }
          if (p.bio) { setBio(p.bio); }
          if (p.position) { setPosition(p.position); }
          if (p.avatarCropX != null && p.avatarCropY != null) { setAvatarCrop({ x: p.avatarCropX, y: p.avatarCropY }); }
          if (p.avatarScale != null) { setAvatarZoom(p.avatarScale); }
        }
      } catch {}
    };
    load();
  }, [currentUser?.id]);

  const saveProfileToSupabase = async () => {
    if (!currentUser) return;
    if (!isSupabaseEnabled()) return;
    try {
      await upsertProfile({
        id: currentUser.id,
        nickname: name,
        avatarUrl: avatar,
        bio,
        position,
        avatarCropX: avatarCrop.x,
        avatarCropY: avatarCrop.y,
        avatarScale: avatarZoom,
        level: progress.level,
        xp: progress.totalScore
      });
      setDirty(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (isAuthLoading) {
    return <div className="max-w-5xl mx-auto p-6 text-gray-300">Loading profile…</div>;
  }

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-white mb-4">My profile</h2>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Login / Registration</h3>
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
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-bold text-white">My profile</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden mb-2 border border-gray-600 relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Click to upload</div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="text-gray-300 text-xs mb-4 truncate max-w-full">{currentUser.email}</div>
          <div className="w-full mt-2 grid grid-cols-2 gap-4">
            {(() => {
              const info = getLevelInfo(progress.totalScore);
              return (
                <>
                  <div className="bg-orange-900/30 p-4 rounded border border-orange-600 col-span-2">
                    <div className="text-sm text-orange-400">Level</div>
                    <div className="text-2xl font-bold text-orange-300 flex items-center space-x-2 truncate">
                      <span className="shrink-0">{info.badge}</span>
                      <span className="truncate max-w-full">{info.name}</span>
                    </div>
                  </div>
                  <div className="bg-blue-900/30 p-4 rounded border border-blue-600 col-span-2">
                    <div className="text-sm text-blue-400">XP</div>
                    <div className="text-2xl font-bold text-blue-300 truncate">{progress.totalScore}</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="md:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nickname</label>
            <input 
              value={name}
              onChange={(e) => { setName(e.target.value); setDirty(true); }}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => saveBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500 min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
            <select
              value={position}
              onChange={(e) => savePosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="">Select position</option>
              <option value="Point Guard">Point Guard</option>
              <option value="Shooting Guard">Shooting Guard</option>
              <option value="Small Forward">Small Forward</option>
              <option value="Power Forward">Power Forward</option>
              <option value="Center">Center</option>
            </select>
          </div>

          

          <div className="pt-4">
            <button
              disabled={!dirty}
              onClick={saveProfileToSupabase}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${dirty ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-700/60 text-white/60 cursor-not-allowed'}`}
            >
              Save changes
            </button>
          </div>
          <div className="pt-2">
            <button onClick={logout} className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors">Logout</button>
          </div>
        </div>
      </div>

      {showCropper && avatar && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg p-4">
            <div className="relative w-full h-72 bg-black rounded-lg overflow-hidden">
              <Cropper
                image={avatar}
                crop={avatarCrop}
                zoom={avatarZoom}
                aspect={1}
                cropShape="round"
                onCropChange={(c) => { setAvatarCrop(c); setDirty(true); }}
                onZoomChange={(z) => { setAvatarZoom(z); setDirty(true); }}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels as any)}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input type="range" min={0.5} max={2} step={0.01} value={avatarZoom} onChange={(e) => setAvatarZoom(parseFloat(e.target.value))} className="flex-1" />
              <button className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={async () => {
                if (!avatar || !croppedAreaPixels) { setShowCropper(false); return; }
                try {
                  const croppedDataUrl = await (async () => {
                    const image = new Image();
                    image.src = avatar;
                    await new Promise((res, rej) => { image.onload = () => res(null); image.onerror = rej; });
                    const canvas = document.createElement('canvas');
                    canvas.width = croppedAreaPixels.width;
                    canvas.height = croppedAreaPixels.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Canvas not supported');
                    ctx.drawImage(
                      image,
                      croppedAreaPixels.x,
                      croppedAreaPixels.y,
                      croppedAreaPixels.width,
                      croppedAreaPixels.height,
                      0,
                      0,
                      croppedAreaPixels.width,
                      croppedAreaPixels.height
                    );
                    return canvas.toDataURL('image/png');
                  })();
                  setAvatar(croppedDataUrl);
                  localStorage.setItem('profile-avatar', croppedDataUrl);
                } catch {}
                setShowCropper(false);
              }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


