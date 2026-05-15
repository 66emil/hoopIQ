import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        position: 'relative',
        width: 60,
        height: 30,
        borderRadius: 999,
        background: 'var(--bg-soft)',
        boxShadow: '0 0 0 1px var(--line) inset',
        cursor: 'pointer',
        transition: 'background .35s cubic-bezier(.22,1,.36,1)',
        border: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: isDark ? 33 : 3,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: isDark ? 'var(--accent-soft)' : 'var(--bg-card)',
          boxShadow: 'var(--shadow-1)',
          transition: 'left .4s cubic-bezier(.22,1,.36,1), background .35s',
        }}
      />
      <Sun size={16} style={{ position: 'absolute', top: 7, left: 7, color: 'var(--ink-3)', opacity: isDark ? .5 : 1, transition: 'opacity .3s' }} />
      <Moon size={16} style={{ position: 'absolute', top: 7, right: 7, color: 'var(--ink-3)', opacity: isDark ? 1 : .5, transition: 'opacity .3s' }} />
    </button>
  );
};
