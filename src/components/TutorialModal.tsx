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
      icon: <Trophy className="h-12 w-12 text-orange-400" />,
      contentKey: 'step1'
    },
    {
      id: 2,
      titleKey: 'tutorial.step2.title',
      descriptionKey: 'tutorial.step2.description',
      icon: <BookOpen className="h-12 w-12 text-orange-400" />,
      contentKey: 'step2'
    },
    {
      id: 3,
      titleKey: 'tutorial.step3.title',
      descriptionKey: 'tutorial.step3.description',
      icon: <Video className="h-12 w-12 text-orange-400" />,
      contentKey: 'step3'
    },
    {
      id: 4,
      titleKey: 'tutorial.step4.title',
      descriptionKey: 'tutorial.step4.description',
      icon: <Trophy className="h-12 w-12 text-orange-400" />,
      contentKey: 'step4'
    },
    {
      id: 5,
      titleKey: 'tutorial.step5.title',
      descriptionKey: 'tutorial.step5.description',
      icon: <User className="h-12 w-12 text-orange-400" />,
      contentKey: 'step5'
    },
    {
      id: 6,
      titleKey: 'tutorial.step6.title',
      descriptionKey: 'tutorial.step6.description',
      icon: <Play className="h-12 w-12 text-orange-400" />,
      contentKey: 'step6'
    }
  ];

  const renderStepContent = (contentKey: string) => {
    switch (contentKey) {
      case 'step1':
        return (
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              <h3 className="text-2xl font-bold">{t('tutorial.step1.content.title')}</h3>
            </div>
            <p className="text-gray-300 text-lg">
              {t('tutorial.step1.content.subtitle')}
            </p>
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-300">
                {t('tutorial.step1.content.description')}
              </p>
            </div>
          </div>
        );
      
      case 'step2':
        return (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-2">{t('tutorial.step2.content.title')}</h4>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('tutorial.step2.content.item1')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('tutorial.step2.content.item2')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('tutorial.step2.content.item3')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('tutorial.step2.content.item4')}</span>
                </li>
              </ul>
            </div>
            <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-600">
              <p className="text-orange-300 text-sm">
                💡 {t('tutorial.step2.content.tip')}
              </p>
            </div>
          </div>
        );
      
      case 'step3':
        return (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-2">{t('tutorial.step3.content.title')}</h4>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('tutorial.step3.content.item1')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('tutorial.step3.content.item2')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('tutorial.step3.content.item3')}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('tutorial.step3.content.item4')}</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-600">
              <p className="text-blue-300 text-sm">
                🎯 {t('tutorial.step3.content.tip')}
              </p>
            </div>
          </div>
        );
      
      case 'step4':
        return (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-2">{t('tutorial.step4.content.title')}</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-600">
                  <div className="text-2xl font-bold text-orange-300">0</div>
                  <div className="text-orange-400 text-sm">{t('tutorial.step4.content.level')}</div>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-600">
                  <div className="text-2xl font-bold text-blue-300">0</div>
                  <div className="text-blue-400 text-sm">{t('tutorial.step4.content.score')}</div>
                </div>
              </div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-3 border border-green-600">
              <p className="text-green-300 text-sm">
                📈 {t('tutorial.step4.content.tip')}
              </p>
            </div>
          </div>
        );
      
      case 'step5':
        return (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-2">{t('tutorial.step5.content.title')}</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-gray-600/50 rounded">
                  <BookOpen className="h-5 w-5 text-orange-400" />
                  <span className="text-gray-300">{t('tutorial.step5.content.tactics')}</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gray-600/50 rounded">
                  <Video className="h-5 w-5 text-orange-400" />
                  <span className="text-gray-300">{t('tutorial.step5.content.quiz')}</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gray-600/50 rounded">
                  <Trophy className="h-5 w-5 text-orange-400" />
                  <span className="text-gray-300">{t('tutorial.step5.content.profile')}</span>
                </div>
              </div>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-600">
              <p className="text-purple-300 text-sm">
                🎮 {t('tutorial.step5.content.tip')}
              </p>
            </div>
          </div>
        );
      
      case 'step6':
        return (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-6 border border-green-600">
              <h3 className="text-xl font-bold text-white mb-3">🎉 {t('tutorial.step6.content.title')}</h3>
              <p className="text-gray-300">
                {t('tutorial.step6.content.subtitle')}
              </p>
            </div>
            <div className="bg-orange-500/20 rounded-lg p-4 border border-orange-600">
              <p className="text-orange-300">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            {currentTutorialStep.icon}
            <div>
              <h2 className="text-xl font-bold text-white">{t(currentTutorialStep.titleKey)}</h2>
              <p className="text-sm text-gray-400">{t(currentTutorialStep.descriptionKey)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkip}
              className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-orange-400 transition-colors text-sm"
            >
              <Play className="h-4 w-4" />
              <span>{t('tutorial.skip')}</span>
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 border-b border-gray-600">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>{t('tutorial.step')} {currentStep + 1} {t('tutorial.of')} {tutorialSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent(currentTutorialStep.contentKey)}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-600">
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isFirstStep
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            <ChevronUp className="h-4 w-4" />
            <span>{t('tutorial.back')}</span>
          </button>

          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-orange-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {isLastStep ? (
            <button
              onClick={handleComplete}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors shadow-lg hover:shadow-orange-500/25"
            >
              <span>{t('tutorial.start')}</span>
              <Play className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg hover:shadow-orange-500/25"
            >
              <span>{t('tutorial.next')}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
