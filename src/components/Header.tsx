import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useLocalization } from '../hooks/useLocalization';
import { getProgressWithinLevel } from '../services/levels';
import { UserProgress } from '../types';
import { BookOpen, Video, Settings } from 'lucide-react';
import { HoopLogo } from './icons/Badges';
import { ProfileMenu } from './ProfileMenu';

interface HeaderProps {
  activeSection: 'tactics' | 'quiz' | 'admin' | 'profile';
  onSectionChange: (section: 'tactics' | 'quiz' | 'admin' | 'profile') => void;
  progress: UserProgress;
  onLogoClick?: () => void;
}

export const Header = ({ activeSection, onSectionChange, progress, onLogoClick }: HeaderProps) => {
  const { currentUser, isAuthLoading, logout } = useAuth();
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const { t } = useLocalization();
  const prog = getProgressWithinLevel(progress.totalScore);

  const tabs: { id: HeaderProps['activeSection']; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'tactics', label: t('header.nav.tactics'), Icon: BookOpen },
    { id: 'quiz',    label: t('header.nav.quiz'),    Icon: Video },
    ...((isAdmin || isAdminLoading) ? [{ id: 'admin' as const, label: t('header.nav.admin'), Icon: Settings }] : []),
  ];

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumb, setThumb] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const el = tabRefs.current[activeSection];
    if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeSection, tabs.length]);

  const userName = isAuthLoading ? '…' : currentUser?.name || t('header.guest');

  return (
    <header
      className="sticky top-0 z-40 pt-safe"
      style={{
        background: 'color-mix(in oklab, var(--bg) 86%, transparent)',
        backdropFilter: 'saturate(160%) blur(14px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3">
          <button
            onClick={() => onLogoClick ? onLogoClick() : onSectionChange('tactics')}
            className="flex items-center gap-3"
            style={{ padding: '4px 6px', borderRadius: 14, border: 0, background: 'transparent', cursor: 'pointer' }}
          >
            <HoopLogo size={36} />
            <div className="text-left">
              <div className="font-display text-xl leading-none" style={{ letterSpacing: '-.03em' }}>hoopIQ</div>
              <div className="muted text-[11px] uppercase tracking-widest mt-1">{t('header.subtitle')}</div>
            </div>
          </button>

          <div className="flex-1" />

          {/* Segmented nav */}
          <nav className="relative inline-flex p-[5px]" style={{ background: 'var(--bg-soft)', borderRadius: 999, boxShadow: '0 0 0 1px var(--line) inset' }}>
            <span
              style={{
                position: 'absolute', top: 5, bottom: 5,
                left: thumb.left, width: thumb.width,
                background: 'var(--bg-card)', borderRadius: 999,
                boxShadow: 'var(--shadow-1), 0 0 0 1px var(--line)',
                transition: 'left .35s cubic-bezier(.22,1,.36,1), width .35s cubic-bezier(.22,1,.36,1)',
                zIndex: 1,
              }}
            />
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                ref={el => (tabRefs.current[id] = el)}
                onClick={() => onSectionChange(id)}
                className="relative z-[2] inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
                style={{ color: activeSection === id ? 'var(--ink)' : 'var(--ink-3)', borderRadius: 999, border: 0, background: 'transparent', cursor: 'pointer' }}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>

          <ProfileMenu
            score={progress.totalScore}
            userName={userName}
            onOpenProfile={() => onSectionChange('profile')}
            onSignOut={logout}
          />
        </div>

        {/* Progress bar */}
        <div className="pb-2 flex items-center gap-3">
          <span className="muted text-[11px] uppercase tracking-widest font-semibold" style={{ minWidth: 78 }}>
            {t('header.progress.text')}
          </span>
          <div className="flex-1 progress-track">
            <div className="progress-bar" style={{ width: `${prog.total ? prog.percent : 100}%` }} />
          </div>
          <span className="tabular text-[12px] font-semibold muted-2 text-right" style={{ minWidth: 60 }}>
            {prog.total ? `${prog.current}/${prog.total}` : 'MAX'}
          </span>
        </div>
      </div>
    </header>
  );
};
