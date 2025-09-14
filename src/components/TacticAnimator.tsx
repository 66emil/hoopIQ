import { useEffect, useMemo, useRef, useState } from 'react';
import { TacticAnimation } from '../types';

interface TacticAnimatorProps {
  animation: TacticAnimation;
  durationMs?: number;
}

export const TacticAnimator: React.FC<TacticAnimatorProps> = ({ animation, durationMs = 8000 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const now = performance.now();
      const p = Math.min(1, (now - start) / durationMs);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);

  const size = 320;
  const scaleX = size / animation.courtWidth;
  const scaleY = size * 0.6 / animation.courtHeight;

  const playersAtProgress = useMemo(() => {
    return animation.players.map(player => {
      if (player.path.length === 0) return { ...player, x: 0, y: 0 };
      const totalT = player.path[player.path.length - 1].t;
      const targetT = progress * totalT;
      let prev = player.path[0];
      let next = player.path[player.path.length - 1];
      for (let i = 1; i < player.path.length; i++) {
        if (player.path[i].t >= targetT) {
          next = player.path[i];
          prev = player.path[i - 1];
          break;
        }
      }
      const span = Math.max(1e-6, next.t - prev.t);
      const localP = Math.min(1, Math.max(0, (targetT - prev.t) / span));
      const x = prev.x + (next.x - prev.x) * localP;
      const y = prev.y + (next.y - prev.y) * localP;
      return { ...player, x, y };
    });
  }, [animation.players, progress]);

  return (
    <div ref={containerRef} className="w-full">
      <svg viewBox={`0 0 ${size} ${size * 0.6}`} className="w-full h-64 bg-amber-50 rounded-lg border">
        {/* Court outline */}
        <rect x={8} y={8} width={size - 16} height={size * 0.6 - 16} rx={12} ry={12} fill="#fff7ed" stroke="#f59e0b" />

        {/* Arrows */}
        {animation.arrows?.map((a, idx) => {
          const lastT = animation.players[0]?.path[animation.players[0]?.path.length - 1]?.t || 1;
          const visible = progress >= (a.tStart ?? 0) / lastT;
          if (!visible) return null;
          const x1 = a.from.x * scaleX;
          const y1 = a.from.y * scaleY;
          const x2 = a.to.x * scaleX;
          const y2 = a.to.y * scaleY;
          const color = a.color || '#ef4444';
          return (
            <g key={idx} stroke={color} fill="none">
              <defs>
                <marker id={`arrow-${idx}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill={color} />
                </marker>
              </defs>
              <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} markerEnd={`url(#arrow-${idx})`} />
            </g>
          );
        })}

        {/* Players */}
        {playersAtProgress.map(p => {
          const cx = p.x * scaleX;
          const cy = p.y * scaleY;
          const fill = p.color || (p.team === 'offense' ? '#3b82f6' : '#ef4444');
          return <circle key={p.id} cx={cx} cy={cy} r={7} fill={fill} stroke="#111827" strokeWidth={1} />;
        })}
      </svg>
    </div>
  );
};



