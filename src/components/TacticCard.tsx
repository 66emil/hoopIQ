import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X, ArrowLeft, ArrowRight, Clock, Sparkles, Zap, Target, Award } from 'lucide-react';
import { Tactic } from '../types';
import { AuthModal } from './AuthModal';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';

interface TacticCardProps {
  tactic: Tactic;
  isCompleted: boolean;
  onComplete: () => void;
}

const DiffPill = ({ d }: { d: string }) => {
  const map = { beginner: 'beg', intermediate: 'med', advanced: 'adv' } as const;
  return (
    <span className={`chip ${map[d as keyof typeof map] ?? ''}`}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor', opacity: 0.85 }} />
      {d[0].toUpperCase() + d.slice(1)}
    </span>
  );
};

const CatPill = ({ c }: { c: string }) => (
  <span className={`chip ${c === 'offense' ? 'offense' : 'defense'}`}>
    {c === 'offense' ? 'Offense' : 'Defense'}
  </span>
);

const HalfCourt = () => (
  <svg
    width="100%" height="100%" viewBox="0 0 1200 600"
    preserveAspectRatio="xMidYMid slice"
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
  >
    <g stroke="var(--line-2)" fill="none" strokeWidth="1.25" opacity={0.55}>
      <rect x="40" y="40" width="1120" height="520" rx="2" />
      <line x1="600" y1="40" x2="600" y2="560" />
      <circle cx="600" cy="300" r="70" />
      <rect x="40" y="200" width="190" height="200" />
      <circle cx="230" cy="300" r="50" />
      <rect x="970" y="200" width="190" height="200" />
      <circle cx="970" cy="300" r="50" />
      <path d="M40 90 Q 360 300 40 510" />
      <path d="M1160 90 Q 840 300 1160 510" />
    </g>
  </svg>
);

export const TacticCard: React.FC<TacticCardProps> = ({ tactic, isCompleted, onComplete }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [pendingOpen, setPendingOpen] = useState(false);
  const { currentUser, accessToken, isAuthLoading } = useAuth();
  const { t, language } = useLocalization();

  const loc = (val: string) => {
    try { const p = JSON.parse(val); if (p?.en) return p[language] || p.en; } catch {}
    return val;
  };
  const navigate = useNavigate();

  const isOff = tactic.category === 'offense';
  const stepsCount = tactic.steps?.length ?? 0;

  const handleFinish = () => {
    try { if (!isCompleted) onComplete(); }
    finally { setShowModal(false); navigate('/app/tactics', { replace: true }); }
  };

  const handleShowDetails = () => {
    if (currentUser || accessToken) { setShowModal(true); setActiveStep(0); return; }
    if (isAuthLoading) { setPendingOpen(true); return; }
    setShowAuthModal(true);
  };

  useEffect(() => {
    if (!pendingOpen || isAuthLoading) return;
    if (currentUser || accessToken) { setShowModal(true); setActiveStep(0); }
    else setShowAuthModal(true);
    setPendingOpen(false);
  }, [pendingOpen, isAuthLoading, currentUser, accessToken]);

  const coverBg = isOff
    ? 'linear-gradient(135deg, color-mix(in oklab, var(--accent-tint) 80%, var(--bg-soft)) 0%, color-mix(in oklab, var(--accent-soft) 50%, var(--bg-elev)) 100%)'
    : 'linear-gradient(135deg, color-mix(in oklab, var(--slate-soft) 75%, var(--bg-soft)) 0%, color-mix(in oklab, var(--slate-soft) 50%, var(--bg-elev)) 100%)';

  const spotlight = isOff
    ? 'radial-gradient(circle at 50% 55%, color-mix(in oklab, var(--accent-glow) 30%, transparent) 0%, transparent 60%)'
    : 'radial-gradient(circle at 50% 55%, color-mix(in oklab, var(--slate) 25%, transparent) 0%, transparent 60%)';

  const tileBg = isOff
    ? 'linear-gradient(160deg, var(--accent-glow), var(--accent) 55%, var(--accent-deep))'
    : 'linear-gradient(160deg, color-mix(in oklab, var(--slate) 70%, white), var(--slate), color-mix(in oklab, var(--slate) 80%, black))';

  const tileShadow = `0 18px 36px color-mix(in oklab, ${isOff ? 'var(--accent)' : 'var(--slate)'} 45%, transparent), inset 0 1px 0 rgba(255,255,255,.35)`;

  return (
    <>
      <article className="card" style={{ padding: 0 }}>
        {/* Cover */}
        <div
          style={{
            position: 'relative', aspectRatio: '16 / 9',
            background: coverBg, overflow: 'hidden',
            borderTopLeftRadius: 'var(--r-lg)', borderTopRightRadius: 'var(--r-lg)',
          }}
        >
          {tactic.thumbnail ? (
            <img src={tactic.thumbnail} alt={loc(tactic.title)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <HalfCourt />
              <div style={{ position: 'absolute', inset: 0, background: spotlight }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    position: 'relative', width: 88, height: 88, borderRadius: 24,
                    background: tileBg, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: tileShadow,
                  }}
                >
                  {isOff ? <Zap size={44} /> : <Target size={44} />}
                  <span
                    style={{
                      position: 'absolute', inset: -6, borderRadius: 30,
                      border: '1px dashed color-mix(in oklab, currentColor 30%, transparent)',
                      color: isOff ? 'var(--accent)' : 'var(--slate)',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ position: 'absolute', left: 14, top: 14 }}><DiffPill d={tactic.difficulty} /></div>
          <div style={{ position: 'absolute', right: 14, top: 14 }}><CatPill c={tactic.category} /></div>
          <div style={{ position: 'absolute', left: 14, bottom: 14 }}>
            <span className="chip" style={{ background: 'var(--bg-card)' }}>
              <Sparkles size={11} /> {stepsCount} {t('common.steps')}
            </span>
          </div>
          {isCompleted && (
            <div style={{ position: 'absolute', right: 14, bottom: 14 }}>
              <span
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: 999, boxShadow: '0 0 0 1px var(--line) inset', color: 'var(--sage)' }}
              >
                <CheckCircle size={14} /> Done
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '18px 22px 22px' }}>
          <h3 className="text-display" style={{ fontSize: 20, lineHeight: 1.2 }}>{loc(tactic.title)}</h3>
          <p className="muted-2" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>{loc(tactic.description)}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
              <Clock size={14} /> {stepsCount} {t('common.steps')}
            </span>
            <button className="btn btn-primary btn-sm" onClick={handleShowDetails} disabled={isAuthLoading}>
              {t('common.open')} <ArrowRight size={14} className="arrow" />
            </button>
          </div>
        </div>
      </article>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => { setShowAuthModal(false); setShowModal(true); setActiveStep(0); }}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 pt-safe pb-safe">
          <div
            className="absolute inset-0"
            onClick={() => setShowModal(false)}
            style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)', backdropFilter: 'blur(8px) saturate(120%)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="modal-viewport flex w-full max-w-6xl flex-col overflow-hidden"
              style={{ background: 'var(--bg-card)', borderRadius: 32, boxShadow: 'var(--shadow-3), 0 0 0 1px var(--line)', maxHeight: '90vh' }}
            >
              <div className="flex items-center gap-3" style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
                <span className="icon-soft" style={{ width: 38, height: 38 }}>
                  {isOff ? <Zap size={18} /> : <Target size={18} />}
                </span>
                <div style={{ lineHeight: 1.2 }}>
                  <div className="muted" style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {tactic.category} · {tactic.difficulty}
                  </div>
                  <h3 className="text-display" style={{ fontSize: 20 }}>{loc(tactic.title)}</h3>
                </div>
                <span style={{ flex: 1 }} />
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 min-h-0 flex-1">
                <div className="relative md:h-[560px] aspect-16-9 md:aspect-auto" style={{ background: 'var(--bg-soft)' }}>
                  {tactic.stepImages?.[activeStep]?.trim() ? (
                    <img src={tactic.stepImages[activeStep]} alt={`step-${activeStep + 1}`} className="w-full h-full object-contain" />
                  ) : tactic.thumbnail ? (
                    <img src={tactic.thumbnail} alt="thumbnail" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center muted">No image</div>
                  )}
                </div>
                <div className="modal-scroll p-6 md:h-[560px] overflow-y-auto">
                  <div key={activeStep} className="animate-fade-in-scale">
                    <div className="font-display text-2xl leading-snug mb-3">Step {activeStep + 1}</div>
                    <p className="muted-2" style={{ fontSize: 16, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                      {tactic.steps?.[activeStep] || ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3" style={{ padding: '16px 24px', borderTop: '1px solid var(--line)' }}>
                <button className="btn btn-secondary btn-sm" disabled={activeStep === 0} onClick={() => setActiveStep(s => Math.max(0, s - 1))}>
                  <ArrowLeft size={14} /> Prev
                </button>
                <span className="muted tabular" style={{ fontSize: 13, fontWeight: 600 }}>{activeStep + 1} / {stepsCount}</span>
                {activeStep === stepsCount - 1 ? (
                  <button className="btn btn-primary btn-sm" onClick={handleFinish} disabled={isCompleted}>
                    <Award size={16} /> {isCompleted ? 'Completed' : 'Mark complete · +10'}
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveStep(s => Math.min(stepsCount - 1, s + 1))}>
                    Next <ArrowRight size={14} className="arrow" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
