export type LevelInfo = {
  level: number;
  name: string;
  badge: string; // emoji badge
  min: number;
  max?: number; // inclusive upper bound if present
};

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Rookie',        badge: '🏀',  min: 0,    max: 100 },
  { level: 2, name: 'Bench Player',  badge: '🪑',  min: 100,  max: 250 },
  { level: 3, name: 'Role Player',   badge: '🎯',  min: 250,  max: 500 },
  { level: 4, name: 'Starter',       badge: '🚀',  min: 500,  max: 1000 },
  { level: 5, name: 'Sixth Man',     badge: '🔥',  min: 1000, max: 1500 },
  { level: 6, name: 'All-Star',      badge: '⭐️', min: 1500, max: 2250 },
  { level: 7, name: 'Captain',       badge: '🛡️', min: 2250, max: 2500 },
  { level: 8, name: 'MVP',           badge: '🏆',  min: 2500, max: 3000 },
  { level: 9, name: 'Hall of Famer', badge: '🏅',  min: 3000 },
];

export function getLevelFromXP(points: number): number {
  const p = Math.max(0, Math.floor(points));
  let lvl = 1;
  for (const def of LEVELS) {
    if (def.max == null) {
      if (p >= def.min) lvl = def.level;
    } else if (p >= def.min && p < def.max) {
      lvl = def.level;
      break;
    }
  }
  return lvl;
}

export function getLevelInfo(points: number): LevelInfo {
  const lvl = getLevelFromXP(points);
  return LEVELS.find(l => l.level === lvl)!;
}

export function getProgressWithinLevel(points: number): { current: number; total: number | null; percent: number } {
  const info = getLevelInfo(points);
  if (info.max == null) {
    return { current: 0, total: null, percent: 100 };
  }
  const current = Math.max(0, Math.floor(points) - info.min);
  const total = info.max - info.min;
  const percent = Math.max(0, Math.min(100, (current / total) * 100));
  return { current, total, percent };
}


