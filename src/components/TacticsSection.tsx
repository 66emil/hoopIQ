import React, { useState, useEffect } from 'react';
import { TacticCard } from './TacticCard';
import { Tactic, TacticPlaylist } from '../types';
import { useProgress } from '../hooks/useProgress';
import { BookOpen, Info } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { TutorialModal } from './TutorialModal';

interface TacticsSectionProps {
  tactics: Tactic[];
  tacticPlaylists?: TacticPlaylist[];
}

export const TacticsSection = ({ tactics, tacticPlaylists = [] }: TacticsSectionProps) => {
  const { t } = useLocalization();
  const { progress, completeTactic } = useProgress();
  const [filteredTactics, setFilteredTactics] = useState<Tactic[]>(tactics);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial for new users (first time visiting tactics section)
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('siteTutorialSeen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('siteTutorialSeen', 'true');
    setShowTutorial(false);
  };

  const handleTutorialClose = () => {
    localStorage.setItem('siteTutorialSeen', 'true');
    setShowTutorial(false);
  };

  useEffect(() => {
    let filtered = tactics;

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(tactic => tactic.difficulty === selectedDifficulty);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tactic => tactic.category === selectedCategory);
    }

    if (selectedPlaylistId !== 'all') {
      const pl = tacticPlaylists.find(p => p.id === selectedPlaylistId);
      if (pl) filtered = filtered.filter(t => pl.tacticIds.includes(t.id));
    }

    setFilteredTactics(filtered);
  }, [tactics, selectedDifficulty, selectedCategory, selectedPlaylistId, tacticPlaylists]);

  const getDifficultyOptions = () => {
    const difficulties = Array.from(new Set(tactics.map(tactic => tactic.difficulty)));
    return difficulties.map(difficulty => ({
      value: difficulty,
      label: difficulty === 'beginner' ? t('tactics.filter.beginner') : 
             difficulty === 'intermediate' ? t('tactics.filter.intermediate') : 
             difficulty === 'advanced' ? t('tactics.filter.advanced') : difficulty
    }));
  };

  const getCategoryOptions = () => {
    const categories = Array.from(new Set(tactics.map(tactic => tactic.category)));
    return categories.map(category => ({
      value: category,
      label: category === 'offense' ? t('tactics.filter.offense') : 
             category === 'defense' ? t('tactics.filter.defense') : 
             category === 'transition' ? t('tactics.filter.transition') : category
    }));
  };

  const getPlaylistOptions = () => {
    return tacticPlaylists.map(p => ({ value: p.id, label: p.title }));
  };

  const completedTactics = tactics.filter(tactic => 
    progress.completedTactics.includes(tactic.id)
  ).length;

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
                <div className="text-2xl sm:text-3xl font-bold text-orange-400">{completedTactics}</div>
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
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">{t('tactics.filter.all')}</option>
                  {getDifficultyOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('tactics.filter.category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">{t('tactics.filter.all')}</option>
                  {getCategoryOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Playlists
                </label>
                <select
                  value={selectedPlaylistId}
                  onChange={(e) => setSelectedPlaylistId(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All playlists</option>
                  {getPlaylistOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
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
            {filteredTactics.map((tactic) => (
              <TacticCard
                key={tactic.id}
                tactic={tactic}
                isCompleted={progress.completedTactics.includes(tactic.id)}
                onComplete={() => completeTactic(tactic.id)}
              />
            ))}
          </div>

          {filteredTactics.length === 0 && (
            <div className="text-center py-10 sm:py-12">
              <div className="text-gray-400 text-base sm:text-lg">
                {t('tactics.noResults')}
              </div>
            </div>
          )}
        </div>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        onComplete={handleTutorialComplete}
      />
    </>
  );
};