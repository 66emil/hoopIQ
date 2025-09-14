import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Star } from 'lucide-react';
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
  const { currentUser } = useAuth();

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
      case 'beginner': return 'Начальный';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
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
      case 'offense': return 'Нападение';
      case 'defense': return 'Защита';
      default: return category;
    }
  };

  const handleShowDetails = () => {
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleAuthSuccess = () => {
    setIsExpanded(true);
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
              <p className="text-gray-300 mb-3">{tactic.description}</p>
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
            className="flex items-center justify-between w-full bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 transition-colors duration-200 border border-gray-600"
          >
            <span className="text-sm font-medium text-gray-200">
              {isExpanded ? 'Скрыть детали' : 'Показать детали'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-600 animate-in slide-in-from-top duration-200">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Шаги выполнения:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  {tactic.steps.map((step, index) => (
                    <li key={index} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>
              
              {tactic.animation && (
                <div className="mt-4">
                  <TacticAnimator animation={tactic.animation} />
                </div>
              )}
              
              {!isCompleted && (
                <button
                  onClick={onComplete}
                  className="mt-4 flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-orange-500/25"
                >
                  <Star className="h-4 w-4" />
                  <span>Изучено! (+50 очков)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};