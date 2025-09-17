import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle, Star, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Tactic } from '../types';
import { TacticAnimator } from './TacticAnimator';
import { AuthModal } from './AuthModal';
import { useAuth } from '../hooks/useAuth';

interface TacticCardProps {
  tactic: Tactic;
  isCompleted: boolean;
  onComplete: () => void;
}

export const TacticCard: React.FC<TacticCardProps> = ({ tactic, isCompleted, onComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { currentUser, accessToken, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900/30 text-green-400 border border-green-600';
      case 'intermediate': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-600';
      case 'advanced': return 'bg-red-900/30 text-red-400 border border-red-600';
      default: return 'bg-gray-800 text-gray-300 border border-gray-600';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return difficulty;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'offense': return 'bg-blue-900/30 text-blue-400 border border-blue-600';
      case 'defense': return 'bg-red-900/30 text-red-400 border border-red-600';
      default: return 'bg-gray-800 text-gray-300 border border-gray-600';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'offense': return 'Offense';
      case 'defense': return 'Defense';
      default: return category;
    }
  };

  const handleFinish = () => {
    try {
      if (!isCompleted) {
        try {
          onComplete();
        } catch (err) {
          console.error('onComplete error:', err);
        }
      }
    } finally {
      setShowModal(false);
      navigate('/app/tactics', { replace: true });
    }
  };

  const [pendingOpen, setPendingOpen] = useState(false);

  const handleShowDetails = () => {
    // Если есть токен или пользователь уже загружен — открываем детали без авторизации
    if (currentUser || accessToken) {
      setShowModal(true);
      setActiveStep(0);
      setIsExpanded(true);
      return;
    }
    // Если авторизация ещё определяется — дождаться и открыть соответствующее окно
    if (isAuthLoading) {
      setPendingOpen(true);
      return;
    }
    // Иначе просим залогиниться
    setShowAuthModal(true);
  };

  useEffect(() => {
    if (!pendingOpen) return;
    if (isAuthLoading) return;
    if (currentUser || accessToken) {
      setShowModal(true);
      setActiveStep(0);
      setIsExpanded(true);
    } else {
      setShowAuthModal(true);
    }
    setPendingOpen(false);
  }, [pendingOpen, isAuthLoading, currentUser, accessToken]);

  const handleAuthSuccess = () => {
    setIsExpanded(true);
    setShowModal(true);
    setActiveStep(0);
  };

  return (
    <>
      <div className="bg-gray-800 rounded-xl shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 border-l-4 border-orange-500">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-white">{tactic.title}</h3>
                {isCompleted && (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                )}
              </div>
              <p className="text-gray-300 mb-3 animate-fade-in-scale">{tactic.description}</p>
              <div className="flex space-x-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tactic.difficulty)}`}>
                  {getDifficultyText(tactic.difficulty)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tactic.category)}`}>
                  {getCategoryText(tactic.category)}
                </span>
              </div>
            </div>
            {tactic.thumbnail && (
              <img 
                src={tactic.thumbnail} 
                alt={tactic.title}
                className="w-16 h-16 object-cover rounded-lg ml-4 border border-gray-600"
              />
            )}
          </div>
          
          <button
            onClick={handleShowDetails}
            disabled={isAuthLoading}
            className="flex items-center justify-between w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/60 disabled:cursor-not-allowed rounded-lg px-4 py-2 transition-colors duration-200 border border-gray-600"
          >
            <span className="text-sm font-medium text-gray-200">
              {isExpanded ? 'Hide details' : 'Show details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {/* Inline details removed in favor of modal */}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {showModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/60" onClick={() => setShowModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">{tactic.title}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative bg-gray-900 aspect-square md:aspect-auto md:h-[560px]">
                  {tactic.stepImages && tactic.stepImages[activeStep] && tactic.stepImages[activeStep].trim() !== '' ? (
                    <img src={tactic.stepImages[activeStep]} alt={`step-${activeStep+1}`} className="w-full h-full object-contain" />
                  ) : tactic.thumbnail ? (
                    <img src={tactic.thumbnail} alt="thumbnail" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                  )}
                </div>
                <div className="p-6 md:h-[560px] overflow-y-auto flex items-center">
                  <div key={activeStep} className="text-gray-300 text-lg whitespace-pre-line animate-fade-in-scale w-full">
                    {tactic.steps?.[activeStep] || ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border-t border-gray-700">
                <button
                  onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                  disabled={activeStep === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded ${activeStep === 0 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>
                <div className="text-sm text-gray-400">Step {activeStep + 1} / {tactic.steps.length}</div>
                {activeStep === tactic.steps.length - 1 ? (
                  <button
                    onClick={handleFinish}
                    disabled={isCompleted}
                    className={`flex items-center space-x-2 px-4 py-2 rounded ${isCompleted ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                  >
                    <span>{isCompleted ? 'Completed' : '+10 ponts'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveStep(s => Math.min(tactic.steps.length - 1, s + 1))}
                    className="flex items-center space-x-2 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
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