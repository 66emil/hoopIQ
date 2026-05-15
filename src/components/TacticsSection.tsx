import React, { useState, useEffect, useMemo } from 'react';
import { TacticCard } from './TacticCard';
import { Tactic, TacticPlaylist } from '../types';
import { BookOpen, Info } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { TutorialModal } from './TutorialModal';
import type { UserProgress } from '../types';

interface TacticsSectionProps {
  tactics: Tactic[];
  tacticPlaylists?: TacticPlaylist[];
  progress: UserProgress;
  onCompleteTactic: (tacticId: string) => void;
}

export const TacticsSection = ({ tactics, tacticPlaylists = [], progress, onCompleteTactic }: TacticsSectionProps) => {
  const { t } = useLocalization();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('siteTutorialSeen')) setShowTutorial(true);
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('siteTutorialSeen', 'true');
    setShowTutorial(false);
  };

  const filteredTactics = useMemo(() => {
    let filtered = tactics;
    if (selectedDifficulty !== 'all') filtered = filtered.filter(tac => tac.difficulty === selectedDifficulty);
    if (selectedCategory !== 'all') filtered = filtered.filter(tac => tac.category === selectedCategory);
    if (selectedPlaylistId !== 'all') {
      const pl = tacticPlaylists.find(p => p.id === selectedPlaylistId);
      if (pl) filtered = filtered.filter(tac => pl.tacticIds.includes(tac.id));
    }
    return filtered;
  }, [tactics, selectedDifficulty, selectedCategory, selectedPlaylistId, tacticPlaylists]);

  const difficultyOptions = useMemo(
    () => Array.from(new Set(tactics.map(tac => tac.difficulty))).map(d => ({
      value: d,
      label: d === 'beginner' ? t('tactics.filter.beginner')
           : d === 'intermediate' ? t('tactics.filter.intermediate')
           : d === 'advanced' ? t('tactics.filter.advanced')
           : d,
    })),
    [tactics, t],
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(tactics.map(tac => tac.category))).map(c => ({
      value: c,
      label: c === 'offense' ? t('tactics.filter.offense')
           : c === 'defense' ? t('tactics.filter.defense')
           : c,
    })),
    [tactics, t],
  );

  const playlistOptions = useMemo(
    () => tacticPlaylists.map(p => ({ value: p.id, label: p.title })),
    [tacticPlaylists],
  );

  const completedCount = useMemo(
    () => tactics.filter(tac => progress.completedTactics.includes(tac.id)).length,
    [tactics, progress.completedTactics],
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-orange-500 p-2 sm:p-3 rounded-full">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">{t('tactics.title')}</h1>
            </div>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto">
              {t('tactics.description')}
            </p>
          </div>

          {/* Progress Overview */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-orange-400">{t('tactics.progress.title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-400">{completedCount}</div>
                <div className="text-gray-400">{t('tactics.progress.completed')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">{tactics.length}</div>
                <div className="text-gray-400">{t('tactics.progress.total')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-400">{progress.level}</div>
                <div className="text-gray-400">{t('tactics.progress.level')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-400">{progress.totalScore}</div>
                <div className="text-gray-400">{t('tactics.progress.score')}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('tactics.filter.difficulty')}
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">{t('tactics.filter.all')}</option>
                  {difficultyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('tactics.filter.category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">{t('tactics.filter.all')}</option>
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Playlists</label>
                <select
                  value={selectedPlaylistId}
                  onChange={e => setSelectedPlaylistId(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All playlists</option>
                  {playlistOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-600">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-blue-300 mb-2">
                  {t('tactics.info.title')}
                </h3>
                <p className="text-blue-200 text-sm sm:text-base">
                  {t('tactics.info.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Tactics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTactics.map(tactic => (
              <TacticCard
                key={tactic.id}
                tactic={tactic}
                isCompleted={progress.completedTactics.includes(tactic.id)}
                onComplete={() => onCompleteTactic(tactic.id)}
              />
            ))}
          </div>

          {filteredTactics.length === 0 && (
            <div className="text-center py-10 sm:py-12">
              <div className="text-gray-400 text-base sm:text-lg">{t('tactics.noResults')}</div>
            </div>
          )}
        </div>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={closeTutorial}
      />
    </>
  );
};
