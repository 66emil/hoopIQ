import { FC } from 'react';

type IconProps = { size?: number; className?: string };

export const BadgeBall: FC<IconProps> = ({ size = 24, className }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
    <defs>
      <radialGradient id="bbg" cx="35%" cy="30%">
        <stop offset="0" stopColor="var(--accent-glow)" />
        <stop offset=".7" stopColor="var(--accent)" />
        <stop offset="1" stopColor="var(--accent-deep)" />
      </radialGradient>
    </defs>
    <circle cx="16" cy="16" r="13" fill="url(#bbg)" />
    <g stroke="rgba(45,28,15,.55)" strokeWidth="1.15" fill="none" strokeLinecap="round">
      <path d="M3 16h26" />
      <path d="M16 3v26" />
      <path d="M6.5 6.5q9 9 0 19" />
      <path d="M25.5 6.5q-9 9 0 19" />
    </g>
    <ellipse cx="11" cy="11" rx="3" ry="2" fill="rgba(255,255,255,.18)" />
  </svg>
);

export const BadgeWhistle: FC<IconProps> = ({ size = 24, className }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13.5h12l5-3v11l-5-3H5a3.5 3.5 0 0 1 0-5z" fill="var(--accent-tint)" />
    <circle cx="10" cy="16" r="2.2" fill="currentColor" opacity=".25" />
    <path d="M22 10.5l4.5-3M22 21.5l4.5 3M25 16h3.5" />
  </svg>
);

export const BadgeBullseye: FC<IconProps> = ({ size = 24, className }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="16" cy="16" r="12" fill="var(--accent-tint)" />
    <circle cx="16" cy="16" r="12" />
    <circle cx="16" cy="16" r="8" fill="var(--accent-soft)" />
    <circle cx="16" cy="16" r="4" fill="var(--accent)" />
    <circle cx="16" cy="16" r="1.4" fill="#fff" />
    <path d="M16 3v3M16 26v3M3 16h3M26 16h3" strokeLinecap="round" stroke="var(--accent-deep)" strokeWidth="1.25" />
  </svg>
);

export const BadgeStar: FC<IconProps> = ({ size = 24, className }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
    <defs>
      <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="var(--accent-glow)" />
        <stop offset="1" stopColor="var(--accent-deep)" />
      </linearGradient>
    </defs>
    <path d="M16 3.5l3.6 8 8.4.9-6.3 5.9 1.8 8.6L16 22.6l-7.5 4.3 1.8-8.6L4 12.4l8.4-.9z" fill="url(#sg)" stroke="var(--accent-deep)" strokeWidth="1" strokeLinejoin="round" />
    <path d="M16 7l2.5 5.5 5.7.6" stroke="rgba(255,255,255,.45)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

export const BadgeCrown: FC<IconProps> = ({ size = 24, className }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
    <defs>
      <linearGradient id="cg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="var(--accent-glow)" />
        <stop offset="1" stopColor="var(--accent-deep)" />
      </linearGradient>
    </defs>
    <path d="M5 11l4 6 7-10 7 10 4-6v13H5z" fill="url(#cg)" stroke="var(--accent-deep)" strokeWidth="1" strokeLinejoin="round" />
    <circle cx="5" cy="11" r="1.6" fill="var(--accent-deep)" />
    <circle cx="16" cy="7" r="1.6" fill="var(--accent-deep)" />
    <circle cx="27" cy="11" r="1.6" fill="var(--accent-deep)" />
    <rect x="9" y="22.5" width="14" height="1" fill="rgba(0,0,0,.15)" />
  </svg>
);

export const BadgeBrain: FC<IconProps> = ({ size = 24, className }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 6c-3 0-5 2-5 4-2 0-3.5 1.5-3.5 3.5 0 1.2.6 2.2 1.5 2.8C8 17.5 8 19 9 20c.5 1.5 2 2.5 4 2.5 1.5 0 2.5-.5 3-1.5V6z" fill="var(--accent-tint)" />
    <path d="M16 6c3 0 5 2 5 4 2 0 3.5 1.5 3.5 3.5 0 1.2-.6 2.2-1.5 2.8 1 1.2 1 2.7 0 3.7-.5 1.5-2 2.5-4 2.5-1.5 0-2.5-.5-3-1.5V6z" fill="var(--accent-soft)" />
  </svg>
);

export const BadgeFlame: FC<IconProps> = ({ size = 24, className }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
    <defs>
      <linearGradient id="fg" x1="0" x2="0" y1="1" y2="0">
        <stop offset="0" stopColor="var(--accent-deep)" />
        <stop offset=".55" stopColor="var(--accent)" />
        <stop offset="1" stopColor="var(--accent-glow)" />
      </linearGradient>
    </defs>
    <path d="M16 3c0 4-3 5.5-3 9 0 1.8 1.2 3 3 3s3-1.2 3-3c0-1.4-.8-2.4-1.5-3.5C20.5 11 23 13.5 23 17.5 23 22.7 19.4 27 16 27S9 22.7 9 17.5C9 13 12.5 10 16 3z" fill="url(#fg)" stroke="var(--accent-deep)" strokeWidth=".9" strokeLinejoin="round" />
  </svg>
);

export const HoopLogo: FC<IconProps> = ({ size = 36, className }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden>
    <defs>
      <linearGradient id="hlg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="var(--accent)" />
        <stop offset="1" stopColor="var(--accent-deep)" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="15" fill="url(#hlg)" />
    <path d="M5 20 H35" stroke="rgba(255,255,255,.55)" strokeWidth="1.4" fill="none" />
    <path d="M20 5 V35" stroke="rgba(255,255,255,.55)" strokeWidth="1.4" fill="none" />
    <path d="M9 9 Q20 20 9 31" stroke="rgba(255,255,255,.55)" strokeWidth="1.4" fill="none" />
    <path d="M31 9 Q20 20 31 31" stroke="rgba(255,255,255,.55)" strokeWidth="1.4" fill="none" />
  </svg>
);

export const badgeForLevel = (name: string) => {
  const map: Record<string, FC<IconProps>> = {
    Rookie:       BadgeBall,
    Starter:      BadgeWhistle,
    Sharpshooter: BadgeBullseye,
    'All-Star':   BadgeStar,
    MVP:          BadgeCrown,
  };
  return map[name] || BadgeBall;
};
