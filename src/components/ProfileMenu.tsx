import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, Sun, Moon, Globe, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLocalization } from '../hooks/useLocalization';
import { getLevelInfo } from '../services/levels';
import { badgeForLevel } from './icons/Badges';

interface ProfileMenuProps {
  score: number;
  userName: string;
  onOpenProfile: () => void;
  onSignOut?: () => void;
}

export const ProfileMenu = ({ score, userName, onOpenProfile, onSignOut }: ProfileMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLocalization();

  const lvl = getLevelInfo(score);
  const LvlBadge = badgeForLevel(lvl.name);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3"
        style={{
          padding: '6px 12px 6px 6px',
          borderRadius: 999,
          background: 'var(--bg-card)',
          boxShadow: open
            ? '0 0 0 1.5px var(--accent) inset, 0 8px 22px color-mix(in oklab, var(--accent) 25%, transparent)'
            : '0 0 0 1px var(--line) inset, var(--shadow-1)',
          transition: 'box-shadow .3s cubic-bezier(.22,1,.36,1)',
          border: 0,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 32, height: 32, borderRadius: 999,
            background: 'radial-gradient(circle at 30% 30%, var(--accent-glow), var(--accent) 60%, var(--accent-deep))',
            color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3)',
          }}
        >
          <LvlBadge size={18} />
        </span>
        <div className="text-left hidden sm:block" style={{ lineHeight: 1.15 }}>
          <div className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{userName}</div>
          <div className="text-[11px]" style={{ color: 'var(--ink-3)' }}>{lvl.name}</div>
        </div>
        <ChevronRight
          size={14}
          style={{
            color: 'var(--ink-3)',
            transform: open ? 'rotate(270deg)' : 'rotate(90deg)',
            transition: 'transform .3s cubic-bezier(.22,1,.36,1)',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            width: 280, padding: 8,
            background: 'var(--bg-card)',
            borderRadius: 18,
            boxShadow: 'var(--shadow-3), 0 0 0 1px var(--line)',
            zIndex: 60,
            animation: 'rise-fade .25s cubic-bezier(.22,1,.36,1) both',
          }}
        >
          {/* User header */}
          <div
            className="flex items-center gap-3"
            style={{ padding: '10px 12px 14px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}
          >
            <span
              style={{
                width: 44, height: 44, borderRadius: 999,
                background: 'radial-gradient(circle at 30% 30%, var(--accent-glow), var(--accent) 60%, var(--accent-deep))',
                color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3), 0 6px 16px color-mix(in oklab, var(--accent) 30%, transparent)',
              }}
            >
              <LvlBadge size={26} />
            </span>
            <div className="flex flex-col" style={{ lineHeight: 1.25 }}>
              <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{userName}</div>
              <div className="text-xs" style={{ color: 'var(--ink-3)' }}>{lvl.name} · {score} pts</div>
            </div>
          </div>

          <MenuItem
            icon={<UserIcon size={16} />}
            label={t('menu.viewProfile')}
            onClick={() => { setOpen(false); onOpenProfile(); }}
            chevron
          />

          <MenuRow label={t('menu.theme')} icon={theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}>
            <SegSmall
              value={theme}
              options={[
                { v: 'light', label: t('menu.light'), ico: <Sun size={13} /> },
                { v: 'dark',  label: t('menu.dark'),  ico: <Moon size={13} /> },
              ]}
              onChange={v => setTheme(v as 'light' | 'dark')}
            />
          </MenuRow>

          <MenuRow label={t('menu.language')} icon={<Globe size={16} />}>
            <SegSmall
              value={language}
              options={[
                { v: 'en', label: 'EN', flag: '🇬🇧' },
                { v: 'ru', label: 'RU', flag: '🇷🇺' },
              ]}
              onChange={v => setLanguage(v as 'en' | 'ru')}
            />
          </MenuRow>

          <div style={{ height: 1, background: 'var(--line)', margin: '6px 4px' }} />

          <MenuItem icon={<Settings size={16} />} label={t('menu.settings')} muted chevron />
          <MenuItem icon={<LogOut size={16} />} label={t('menu.signOut')} muted onClick={onSignOut} />
        </div>
      )}
    </div>
  );
};

/* ───────────── Internal building blocks ───────────── */

const MenuItem = ({
  icon, label, onClick, muted, chevron,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  muted?: boolean;
  chevron?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 12,
      background: 'transparent', textAlign: 'left',
      color: muted ? 'var(--ink-2)' : 'var(--ink)',
      fontSize: 14, fontWeight: 500, border: 0, cursor: 'pointer',
      transition: 'background .2s cubic-bezier(.22,1,.36,1)',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-soft)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
  >
    <span style={{ color: 'var(--ink-3)', display: 'inline-flex' }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {chevron && <ChevronRight size={14} style={{ color: 'var(--ink-4)' }} />}
  </button>
);

const MenuRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 12 }}>
    <span style={{ color: 'var(--ink-3)', display: 'inline-flex' }}>{icon}</span>
    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{label}</span>
    {children}
  </div>
);

type SegOption = { v: string; label: string; ico?: React.ReactNode; flag?: string };

const SegSmall = ({ value, options, onChange }: { value: string; options: SegOption[]; onChange: (v: string) => void }) => (
  <div style={{ display: 'inline-flex', padding: 3, background: 'var(--bg-soft)', borderRadius: 999, boxShadow: '0 0 0 1px var(--line) inset' }}>
    {options.map(o => {
      const active = value === o.v;
      return (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            padding: '4px 10px', borderRadius: 999,
            fontSize: 12, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: active ? 'var(--bg-card)' : 'transparent',
            color: active ? 'var(--ink)' : 'var(--ink-3)',
            boxShadow: active ? 'var(--shadow-1), 0 0 0 1px var(--line)' : 'none',
            transition: 'all .2s cubic-bezier(.22,1,.36,1)',
            border: 0, cursor: 'pointer',
          }}
        >
          {o.flag && <span style={{ fontSize: 13 }}>{o.flag}</span>}
          {o.ico}
          {o.label}
        </button>
      );
    })}
  </div>
);
