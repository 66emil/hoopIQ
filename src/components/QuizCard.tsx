import { useState, FC } from 'react';
import { Play, CheckCircle, XCircle, Award, X } from 'lucide-react';
import { QuizQuestion } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { AuthModal } from './AuthModal';
import { useAuth } from '../hooks/useAuth';

interface QuizCardProps {
  quiz: QuizQuestion;
  isCompleted: boolean;
  onComplete: (score: number) => void;
}

export const QuizCard: FC<QuizCardProps> = ({ quiz, isCompleted, onComplete }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, isAuthLoading } = useAuth();

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

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    
    if (!isCompleted) {
      const score = selectedAnswer === quiz.correctAnswer ? 25 : 0;
      onComplete(score);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleStartQuiz = () => {
    if (isAuthLoading) return; // не дергать модалку, пока статус загружается
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setShowQuiz(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowQuiz(true);
  };

  // Полноэкранный модал для квиза
  if (showQuiz) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Заголовок */}
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
          <button
            onClick={() => setShowQuiz(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex">
          {/* Левая часть - видео */}
          <div className="flex-1 p-4">
            <div className="h-full">
              {!showResult ? (
                <VideoPlayer 
                  src={quiz.videoUrl} 
                  className="h-full"
                  hideOverlayControls
                />
              ) : (
                <div className="h-full">
                  <VideoPlayer 
                    src={quiz.explanationVideoUrl || quiz.videoUrl} 
                    className="h-full"
                    hideOverlayControls
                  />
                </div>
              )}
            </div>
          </div>

          {/* Правая часть - квиз */}
          <div className="w-96 bg-gray-800 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Question:</h3>
                <p className="text-gray-300">{quiz.question}</p>
              </div>

              {!showResult ? (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Options:</h4>
                    {quiz.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                          selectedAnswer === index
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    Submit answer
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    selectedAnswer === quiz.correctAnswer 
                      ? 'bg-green-900/30 border border-green-600' 
                      : 'bg-red-900/30 border border-red-600'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {selectedAnswer === quiz.correctAnswer ? (
                        <Award className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span className={`font-semibold ${
                        selectedAnswer === quiz.correctAnswer ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedAnswer === quiz.correctAnswer ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    {/* Explanation text removed to avoid layout shift */}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={resetQuiz}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Try again
                    </button>
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      {selectedAnswer === quiz.correctAnswer ? '+25 points' : 'Close'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Обычная карточка квиза
  return (
    <>
      <div className="bg-gray-800 rounded-xl shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 border-l-4 border-orange-500">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                {isCompleted && (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                )}
              </div>
              <p className="text-gray-300 mb-3">{quiz.question}</p>
              <div className="flex space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                  {getDifficultyText(quiz.difficulty)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            {quiz.thumbnail ? (
              <img 
                src={quiz.thumbnail} 
                alt={quiz.title}
                className="w-full h-48 object-cover rounded-lg border border-gray-600"
              />
            ) : (
              <div className="w-full h-48 bg-gray-700 rounded-lg border border-gray-600">
              </div>
            )}
          </div>
          
          <button
            onClick={handleStartQuiz}
            className="flex items-center justify-center space-x-2 w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-orange-500/25"
          >
            <Play className="h-5 w-5" />
            <span>Start quiz</span>
          </button>
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