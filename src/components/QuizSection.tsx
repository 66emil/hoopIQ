import { useMemo, useState } from 'react';
import { QuizCard } from './QuizCard';
import { Playlist, QuizQuestion } from '../types';
import { Video } from 'lucide-react';

interface QuizSectionProps {
  quizzes: QuizQuestion[];
  playlists?: Playlist[];
  completedQuizzes: string[];
  onCompleteQuiz: (quizId: string, score: number) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  quizzes,
  playlists = [],
  completedQuizzes,
  onCompleteQuiz,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'offense' | 'defense'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [activePlaylistId, setActivePlaylistId] = useState<string>('all');

  const filteredQuizzes = useMemo(() => {
    let list = quizzes;
    if (activeCategory !== 'all') list = list.filter(q => q.category === activeCategory);
    if (activeDifficulty !== 'all') list = list.filter(q => q.difficulty === activeDifficulty);
    if (activePlaylistId !== 'all') {
      const pl = playlists.find(p => (p.kind ?? 'quiz') === 'quiz' && p.id === activePlaylistId);
      if (pl) list = list.filter(q => pl.quizIds.includes(q.id));
    }
    return list;
  }, [quizzes, activeCategory, activeDifficulty, activePlaylistId, playlists]);

  const completedCount = useMemo(
    () => completedQuizzes.filter(id => filteredQuizzes.some(q => q.id === id)).length,
    [completedQuizzes, filteredQuizzes],
  );

  const quizPlaylists = useMemo(
    () => playlists.filter(p => (p.kind ?? 'quiz') === 'quiz'),
    [playlists],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Video className="h-8 w-8 text-orange-500" />
          <h2 className="text-3xl font-bold text-white">Reading Combinations</h2>
        </div>
        <p className="text-gray-300 mb-4">
          Analyze game situations and make the right decisions.
          Correct answer gives +25 XP.
        </p>

        <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-3 md:space-y-0 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value as typeof activeCategory)}
              className="px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">All</option>
              <option value="offense">Offense</option>
              <option value="defense">Defense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
            <select
              value={activeDifficulty}
              onChange={e => setActiveDifficulty(e.target.value as typeof activeDifficulty)}
              className="px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">All</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Playlist</label>
            <select
              value={activePlaylistId}
              onChange={e => setActivePlaylistId(e.target.value)}
              className="px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">All playlists</option>
              {quizPlaylists.map(playlist => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.title} ({playlist.quizIds.length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-400">Quiz progress</span>
            <span className="text-sm text-orange-300">{completedCount}/{filteredQuizzes.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${filteredQuizzes.length > 0 ? (completedCount / filteredQuizzes.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {filteredQuizzes.map(quiz => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            isCompleted={completedQuizzes.includes(quiz.id)}
            onComplete={score => onCompleteQuiz(quiz.id, score)}
          />
        ))}
      </div>
    </div>
  );
};
