import { useMemo, useState } from 'react';
import { QuizCard } from './QuizCard';
import { Playlist, QuizQuestion } from '../types';
import { Video } from 'lucide-react';
import { useQuizVideos } from '../hooks/useQuizVideos';
// import { QuizVideo } from '../services/api';

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
  onCompleteQuiz
}) => {
  const { videos, isLoading: videosLoading, error: videosError } = useQuizVideos();
  const [activeCategory, setActiveCategory] = useState<'all' | 'offense' | 'defense'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [activePlaylistId, setActivePlaylistId] = useState<string>('all');
  // const [showVideosFromDB, setShowVideosFromDB] = useState(false);

  // Объединяем локальные квизы с видео из БД
  const allQuizzes = useMemo(() => {
    // if (!showVideosFromDB) return quizzes;
    
    const dbQuizzes: QuizQuestion[] = videos.map(video => ({
      id: video.id,
      title: video.title,
      question: video.description || 'Analyze the game situation',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0,
      explanation: 'Explanation will be added later',
      explanationVideoUrl: video.explanationVideoUrl || undefined,
      difficulty: video.difficulty,
      category: video.category,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail || undefined
    }));

    return [...quizzes, ...dbQuizzes];
  }, [quizzes, videos]);

  const filteredQuizzes = useMemo(() => {
    let list = allQuizzes;
    if (activeCategory !== 'all') {
      list = list.filter(q => q.category === activeCategory);
    }
    if (activeDifficulty !== 'all') {
      list = list.filter(q => q.difficulty === activeDifficulty);
    }
    if (activePlaylistId !== 'all') {
      const pl = playlists.find(p => (p.kind || 'quiz') === 'quiz' && p.id === activePlaylistId);
      if (pl) list = list.filter(q => pl.quizIds.includes(q.id));
    }
    return list;
  }, [allQuizzes, activeCategory, activeDifficulty, activePlaylistId, playlists]);

  const completedCount = completedQuizzes.filter(id => filteredQuizzes.some(q => q.id === id)).length;
  const totalCount = filteredQuizzes.length;

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

        {/* Переключатель между локальными квизами и видео из БД */}
        {/* Удален, так как теперь все данные только из БД */}
        {/* <div className="mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowVideosFromDB(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showVideosFromDB 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              Local quizzes ({quizzes.length})
            </button>
            <button
              onClick={() => setShowVideosFromDB(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showVideosFromDB 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              Videos from DB ({videos.length})
            </button>
          </div>
        </div> */}

        <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-3 md:space-y-0 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select 
              value={activeCategory} 
              onChange={(e) => setActiveCategory(e.target.value as any)} 
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
              onChange={(e) => setActiveDifficulty(e.target.value as any)} 
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
              onChange={(e) => setActivePlaylistId(e.target.value)} 
              className="px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="all">All playlists</option>
              {playlists.filter(p => (p.kind || 'quiz') === 'quiz').map(playlist => (
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
            <span className="text-sm text-orange-300">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {videosLoading && (
        <div className="text-center py-8">
          <div className="text-gray-400">Loading videos...</div>
        </div>
      )}

      {videosError && (
        <div className="text-center py-8">
          <div className="text-red-400">Failed to load videos: {videosError}</div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {filteredQuizzes.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            isCompleted={completedQuizzes.includes(quiz.id)}
            onComplete={(score) => onCompleteQuiz(quiz.id, score)}
          />
        ))}
      </div>
    </div>
  );
};