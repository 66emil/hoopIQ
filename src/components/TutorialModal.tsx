import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, BookOpen, Video, Trophy, User, Play } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TutorialStep {
  id: number;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  contentKey: string;
}

export const TutorialModal = ({ isOpen, onClose, onComplete }: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLocalization();

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      titleKey: 'tutorial.step1.title',
      descriptionKey: 'tutorial.step1.description',
      icon: <Trophy size={48} style={{ color: 'var(--accent)' }} />,
      contentKey: 'step1'
    },
    {
      id: 2,
      titleKey: 'tutorial.step2.title',
      descriptionKey: 'tutorial.step2.description',
      icon: <BookOpen size={48} style={{ color: 'var(--accent)' }} />,
      contentKey: 'step2'
    },
    {
      id: 3,
      titleKey: 'tutorial.step3.title',
      descriptionKey: 'tutorial.step3.description',
      icon: <Video size={48} style={{ color: 'var(--accent)' }} />,
      contentKey: 'step3'
    },
    {
      id: 4,
      titleKey: 'tutorial.step4.title',
      descriptionKey: 'tutorial.step4.description',
      icon: <Trophy size={48} style={{ color: 'var(--accent)' }} />,
      contentKey: 'step4'
    },
    {
      id: 5,
      titleKey: 'tutorial.step5.title',
      descriptionKey: 'tutorial.step5.description',
      icon: <User size={48} style={{ color: 'var(--accent)' }} />,
      contentKey: 'step5'
    },
    {
      id: 6,
      titleKey: 'tutorial.step6.title',
      descriptionKey: 'tutorial.step6.description',
      icon: <Play size={48} style={{ color: 'var(--accent)' }} />,
      contentKey: 'step6'
    }
  ];

  const renderStepContent = (contentKey: string) => {
    switch (contentKey) {
      case 'step1':
        return (
          <div className="text-center space-y-4">
            <h3 className="text-display text-2xl" style={{ color: 'var(--accent)' }}>{t('tutorial.step1.content.title')}</h3>
            <p className="muted-2 text-lg">
              {t('tutorial.step1.content.subtitle')}
            </p>
            <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 16 }}>
              <p className="muted-2">
                {t('tutorial.step1.content.description')}
              </p>
            </div>
          </div>
        );

      case 'step2':
        return (
          <div className="space-y-4">
            <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 16 }}>
              <h4 className="font-display text-lg mb-2">{t('tutorial.step2.content.title')}</h4>
              <ul className="muted-2 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                  <span>{t('tutorial.step2.content.item1')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                  <span>{t('tutorial.step2.content.item2')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                  <span>{t('tutorial.step2.content.item3')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                  <span>{t('tutorial.step2.content.item4')}</span>
                </li>
              </ul>
            </div>
            <div style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-soft)', borderRadius: 'var(--r-sm)', padding: 12 }}>
              <p className="text-sm" style={{ color: 'var(--accent-deep)' }}>
                💡 {t('tutorial.step2.content.tip')}
              </p>
            </div>
          </div>
        );

      case 'step3':
        return (
          <div className="space-y-4">
            <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 16 }}>
              <h4 className="font-display text-lg mb-2">{t('tutorial.step3.content.title')}</h4>
              <ul className="muted-2 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                  <span>{t('tutorial.step3.content.item1')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                  <span>{t('tutorial.step3.content.item2')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                  <span>{t('tutorial.step3.content.item3')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }}></div>
                  <span>{t('tutorial.step3.content.item4')}</span>
                </li>
              </ul>
            </div>
            <div style={{ background: 'var(--slate-soft)', border: '1px solid var(--slate)', borderRadius: 'var(--r-sm)', padding: 12 }}>
              <p className="text-sm" style={{ color: 'var(--slate)' }}>
                🎯 {t('tutorial.step3.content.tip')}
              </p>
            </div>
          </div>
        );

      case 'step4':
        return (
          <div className="space-y-4">
            <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 16 }}>
              <h4 className="font-display text-lg mb-2">{t('tutorial.step4.content.title')}</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-soft)', borderRadius: 'var(--r-sm)', padding: 12 }}>
                  <div className="font-display text-2xl" style={{ color: 'var(--accent-deep)' }}>0</div>
                  <div className="text-sm" style={{ color: 'var(--accent-deep)' }}>{t('tutorial.step4.content.level')}</div>
                </div>
                <div style={{ background: 'var(--slate-soft)', border: '1px solid var(--slate)', borderRadius: 'var(--r-sm)', padding: 12 }}>
                  <div className="font-display text-2xl" style={{ color: 'var(--slate)' }}>0</div>
                  <div className="text-sm" style={{ color: 'var(--slate)' }}>{t('tutorial.step4.content.score')}</div>
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--sage-soft)', border: '1px solid var(--sage)', borderRadius: 'var(--r-sm)', padding: 12 }}>
              <p className="text-sm" style={{ color: 'var(--sage)' }}>
                📈 {t('tutorial.step4.content.tip')}
              </p>
            </div>
          </div>
        );

      case 'step5':
        return (
          <div className="space-y-4">
            <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 16 }}>
              <h4 className="font-display text-lg mb-2">{t('tutorial.step5.content.title')}</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 rounded" style={{ background: 'var(--bg-elev)' }}>
                  <BookOpen size={20} style={{ color: 'var(--accent)' }} />
                  <span className="muted-2">{t('tutorial.step5.content.tactics')}</span>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded" style={{ background: 'var(--bg-elev)' }}>
                  <Video size={20} style={{ color: 'var(--accent)' }} />
                  <span className="muted-2">{t('tutorial.step5.content.quiz')}</span>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded" style={{ background: 'var(--bg-elev)' }}>
                  <Trophy size={20} style={{ color: 'var(--accent)' }} />
                  <span className="muted-2">{t('tutorial.step5.content.profile')}</span>
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--gold-soft)', border: '1px solid var(--gold)', borderRadius: 'var(--r-sm)', padding: 12 }}>
              <p className="text-sm" style={{ color: 'var(--gold)' }}>
                🎮 {t('tutorial.step5.content.tip')}
              </p>
            </div>
          </div>
        );

      case 'step6':
        return (
          <div className="text-center space-y-6">
            <div style={{ background: 'var(--sage-soft)', border: '1px solid var(--sage)', borderRadius: 'var(--r-md)', padding: 24 }}>
              <h3 className="font-display text-xl mb-3">🎉 {t('tutorial.step6.content.title')}</h3>
              <p className="muted-2">
                {t('tutorial.step6.content.subtitle')}
              </p>
            </div>
            <div style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-soft)', borderRadius: 'var(--r-sm)', padding: 16 }}>
              <p style={{ color: 'var(--accent-deep)' }}>
                💡 {t('tutorial.step6.content.tip')}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    setCurrentStep(0);
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
  };

  const handleSkip = () => {
    onComplete();
    setCurrentStep(0);
  };

  if (!isOpen) return null;

  const currentTutorialStep = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)', backdropFilter: 'blur(8px)' }}
    >
      <div className="card w-full" style={{ borderRadius: 'var(--r-xl)', maxWidth: 672 }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)', padding: '20px 24px' }}>
          <div className="flex items-center space-x-3">
            {currentTutorialStep.icon}
            <div>
              <h2 className="font-display text-xl">{t(currentTutorialStep.titleKey)}</h2>
              <p className="muted text-sm">{t(currentTutorialStep.descriptionKey)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleSkip} className="btn btn-ghost btn-sm">
              <Play size={14} />
              <span>{t('tutorial.skip')}</span>
            </button>
            <button onClick={handleClose} className="btn btn-ghost btn-sm">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="muted text-sm">{t('tutorial.step')} {currentStep + 1} {t('tutorial.of')} {tutorialSteps.length}</span>
            <span className="muted text-sm">{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-bar"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent(currentTutorialStep.contentKey)}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--line)', padding: '16px 24px' }}>
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className="btn btn-secondary btn-sm"
          >
            <ChevronUp size={16} />
            <span>{t('tutorial.back')}</span>
          </button>

          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className="w-3 h-3 rounded-full transition-colors"
                style={index === currentStep ? { background: 'var(--accent)' } : { background: 'var(--line-2)' }}
              />
            ))}
          </div>

          {isLastStep ? (
            <button onClick={handleComplete} className="btn btn-primary btn-sm">
              <span>{t('tutorial.start')}</span>
              <Play size={14} />
            </button>
          ) : (
            <button onClick={nextStep} className="btn btn-primary btn-sm">
              <span>{t('tutorial.next')}</span>
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
