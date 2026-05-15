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

const difficultyChipMap: Record<string, string> = {
  beginner: 'beg',
  intermediate: 'med',
  advanced: 'adv',
};

export const QuizCard: FC<QuizCardProps> = ({ quiz, isCompleted, onComplete }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, isAuthLoading } = useAuth();

  const handleAnswerSelect = (index: number) => {
    if (!showResult) setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    if (!isCompleted) {
      onComplete(selectedAnswer === quiz.correctAnswer ? 25 : 0);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleStartQuiz = () => {
    if (isAuthLoading) return;
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setShowQuiz(true);
    }
  };

  const handleAuthSuccess = () => setShowQuiz(true);

  if (showQuiz) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col pt-safe pb-safe" style={{ background: 'var(--bg)' }}>
        <div className="p-3 sm:p-4 flex items-center justify-between" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--line)' }}>
          <h2 className="font-display text-xl">{quiz.title}</h2>
          <button onClick={() => setShowQuiz(false)} className="btn btn-ghost btn-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row">
          <div className="w-full md:flex-1 p-3 sm:p-4">
            <div className="aspect-16-9 md:h-full md:aspect-auto">
              <VideoPlayer
                src={showResult ? (quiz.explanationVideoUrl || quiz.videoUrl) : quiz.videoUrl}
                className="w-full h-full"
                hideOverlayControls
              />
            </div>
          </div>

          <div className="w-full md:w-96 p-4 md:p-6 overflow-y-auto modal-scroll" style={{ background: 'var(--bg-elev)', borderLeft: '1px solid var(--line)' }}>
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-lg mb-2">Question:</h3>
                <p className="muted-2">{quiz.question}</p>
              </div>

              {!showResult ? (
                <>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Options:</h4>
                    {quiz.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className="w-full text-left transition-all duration-200"
                        style={
                          selectedAnswer === index
                            ? { background: 'var(--accent-tint)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', padding: '12px', color: 'var(--accent-deep)' }
                            : { background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px', color: 'var(--ink)' }
                        }
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="btn btn-primary w-full"
                  >
                    Submit answer
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div
                    style={
                      selectedAnswer === quiz.correctAnswer
                        ? { background: 'var(--sage-soft)', border: '1px solid var(--sage)', borderRadius: 'var(--r-sm)', padding: 16 }
                        : { background: 'var(--brick-soft)', border: '1px solid var(--brick)', borderRadius: 'var(--r-sm)', padding: 16 }
                    }
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {selectedAnswer === quiz.correctAnswer
                        ? <Award size={20} style={{ color: 'var(--sage)' }} />
                        : <XCircle size={20} style={{ color: 'var(--brick)' }} />}
                      <span className="font-semibold" style={{ color: selectedAnswer === quiz.correctAnswer ? 'var(--sage)' : 'var(--brick)' }}>
                        {selectedAnswer === quiz.correctAnswer ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                  </div>

                  {quiz.explanation && (
                    <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: 16 }}>
                      <p className="text-sm font-medium mb-1">Explanation</p>
                      <p className="muted-2 whitespace-pre-line">{quiz.explanation}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button onClick={resetQuiz} className="btn btn-secondary flex-1">
                      Try again
                    </button>
                    <button onClick={() => setShowQuiz(false)} className="btn btn-primary flex-1">
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

  return (
    <>
      <div className="card">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-display text-xl">{quiz.title}</h3>
                {isCompleted && <CheckCircle size={20} style={{ color: 'var(--sage)' }} />}
              </div>
              <p className="muted-2 mb-3">{quiz.question}</p>
              <div className="flex space-x-2">
                <span className={`chip ${difficultyChipMap[quiz.difficulty] ?? ''}`}>
                  {quiz.difficulty}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            {quiz.thumbnail ? (
              <img
                src={quiz.thumbnail}
                alt={quiz.title}
                className="w-full h-48 object-cover rounded-lg border-line"
                style={{ border: '1px solid var(--line)' }}
              />
            ) : (
              <div className="w-full h-48 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--line)' }} />
            )}
          </div>

          <button
            onClick={handleStartQuiz}
            className="btn btn-primary w-full"
          >
            <Play size={18} />
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
