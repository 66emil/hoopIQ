import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X, ArrowLeft, ArrowRight, Clock, Sparkles, Zap, Target, Award } from 'lucide-react';
import { Tactic } from '../types';
import { AuthModal } from './AuthModal';
import { useAuth } from '../hooks/useAuth';

interface TacticCardProps {
  tactic: Tactic;
  isCompleted: boolean;
  onComplete: () => void;
}

const DiffPill = ({ d }: { d: string }) => {
  const map = { beginner: 'beg', intermediate: 'med', advanced: 'adv' } as const;
  return <span className={`chip ${map[d as keyof typeof map] ?? ''}`}>
    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor', opacity: .85 }} />
    {d[0].toUpperCase() + d.slice(1)}
  </span>;
};

const CatPill = ({ c }: { c: string }) => (
  <span className={`chip ${c === 'offense' ? 'offense' : 'defense'}`}>
    {c === 'offense' ? 'Offense' : 'Defense'}
  </span>
);

export const TacticCard: React.FC<TacticCardProps> = ({ tactic, isCompleted, onComplete }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [pendingOpen, setPendingOpen] = useState(false);
  const { currentUser, accessToken, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const handleFinish = () => {
    try {
      if (!isCompleted) onComplete();
    } finally {
      setShowModal(false);
      navigate('/app/tactics', { replace: true });
    }
  };

  const handleShowDetails = () => {
    if (currentUser || accessToken) {
      setShowModal(true); setActiveStep(0); return;
    }
    if (isAuthLoading) { setPendingOpen(true); return; }
    setShowAuthModal(true);
  };

  useEffect(() => {
    if (!pendingOpen || isAuthLoading) return;
    if (currentUser || accessToken) { setShowModal(true); setActiveStep(0); }
    else setShowAuthModal(true);
    setPendingOpen(false);
  }, [pendingOpen, isAuthLoading, currentUser, accessToken]);

  return (
    <>
      <article className="card" style={{ padding: 0 }}>
        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <span className="icon-soft lg">
            {tactic.category === 'offense' ? <Zap size={26} /> : <Target size={26} />}
          </span>
          <div className="flex items-center gap-2">
            <DiffPill d={tactic.difficulty} />
            <CatPill c={tactic.category} />
          </div>
        </div>

        <div className="px-6 pt-3 pb-6">
          <div className="flex items-start justify-between gap-3 mt-3">
            <h3 className="font-display text-xl leading-tight">{tactic.title}</h3>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: 'var(--sage)' }}>
                <CheckCircle size={16} /> Done
              </span>
            )}
          </div>
          <p className="muted-2 mt-2 text-sm leading-relaxed">{tactic.description}</p>

          <div className="flex items-center gap-4 mt-5 text-[12px] font-semibold muted">
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {tactic.steps.length} steps</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles size={14} /> Step-by-step</span>
            <span className="flex-1" />
            <button onClick={handleShowDetails} disabled={isAuthLoading} className="btn btn-ghost btn-sm">
              Open <ArrowRight size={14} className="arrow" />
            </button>
          </div>
        </div>
      </article>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => { setShowAuthModal(false); setShowModal(true); setActiveStep(0); }} />

      {showModal && (
        <div className="fixed inset-0 z-50 pt-safe pb-safe">
          <div
            className="absolute inset-0"
            onClick={() => setShowModal(false)}
            style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)', backdropFilter: 'blur(8px) saturate(120%)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="modal-viewport w-full max-w-6xl flex flex-col overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                borderRadius: 32,
                boxShadow: 'var(--shadow-3), 0 0 0 1px var(--line)',
                maxHeight: '90vh',
              }}
            >
              <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
                <span className="icon-soft" style={{ width: 38, height: 38 }}>
                  {tactic.category === 'offense' ? <Zap size={18} /> : <Target size={18} />}
                </span>
                <div className="leading-tight">
                  <div className="muted text-[11px] uppercase tracking-widest">{tactic.category} · {tactic.difficulty}</div>
                  <h3 className="font-display text-xl">{tactic.title}</h3>
                </div>
                <span className="flex-1" />
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
                <div className="relative modal-scroll md:overflow-hidden" style={{ background: 'var(--bg-soft)' }}>
                  {tactic.stepImages?.[activeStep]?.trim() ? (
                    <img src={tactic.stepImages[activeStep]} alt={`step-${activeStep + 1}`} className="w-full h-full object-contain" />
                  ) : tactic.thumbnail ? (
                    <img src={tactic.thumbnail} alt="thumbnail" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center muted">No image</div>
                  )}
                </div>
                <div className="p-6 md:overflow-y-auto modal-scroll">
                  <div key={activeStep} className="animate-fade-in-scale">
                    <div className="font-display text-2xl leading-snug mb-3">Step {activeStep + 1}</div>
                    <p className="muted-2 text-base leading-relaxed whitespace-pre-line">
                      {tactic.steps?.[activeStep] || ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--line)' }}>
                <button className="btn btn-secondary btn-sm" disabled={activeStep === 0} onClick={() => setActiveStep(s => Math.max(0, s - 1))}>
                  <ArrowLeft size={14} /> Prev
                </button>
                <span className="muted text-[13px] font-semibold tabular">{activeStep + 1} / {tactic.steps.length}</span>
                {activeStep === tactic.steps.length - 1 ? (
                  <button className="btn btn-primary btn-sm" onClick={handleFinish} disabled={isCompleted}>
                    <Award size={16} /> {isCompleted ? 'Completed' : 'Mark complete · +10'}
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveStep(s => Math.min(tactic.steps.length - 1, s + 1))}>
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
