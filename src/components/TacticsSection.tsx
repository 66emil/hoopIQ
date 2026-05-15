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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="icon-soft">
              <BookOpen size={22} />
            </span>
            <h1 className="text-display text-4xl">{t('tactics.title')}</h1>
          </div>
          <p className="muted-2 text-base sm:text-xl max-w-3xl mx-auto">
            {t('tactics.description')}
          </p>
        </div>

        {/* Progress Overview */}
        <div className="card p-6 mb-8">
          <h2 className="font-display text-xl sm:text-2xl mb-4" style={{ color: 'var(--accent)' }}>{t('tactics.progress.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--accent)' }}>{completedCount}</div>
              <div className="muted">{t('tactics.progress.completed')}</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--slate)' }}>{tactics.length}</div>
              <div className="muted">{t('tactics.progress.total')}</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--sage)' }}>{progress.level}</div>
              <div className="muted">{t('tactics.progress.level')}</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl sm:text-3xl" style={{ color: 'var(--gold)' }}>{progress.totalScore}</div>
              <div className="muted">{t('tactics.progress.score')}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold muted-2 mb-1.5">
                {t('tactics.filter.difficulty')}
              </label>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="field"
              >
                <option value="all">{t('tactics.filter.all')}</option>
                {difficultyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold muted-2 mb-1.5">
                {t('tactics.filter.category')}
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="field"
              >
                <option value="all">{t('tactics.filter.all')}</option>
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold muted-2 mb-1.5">Playlists</label>
              <select
                value={selectedPlaylistId}
                onChange={e => setSelectedPlaylistId(e.target.value)}
                className="field"
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
        <div className="mb-6 sm:mb-8" style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-soft)', borderRadius: 'var(--r-md)', padding: '20px 24px' }}>
          <div className="flex items-start space-x-3">
            <Info size={20} style={{ color: 'var(--accent-deep)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <h3 className="font-display text-base sm:text-lg mb-2" style={{ color: 'var(--accent-deep)' }}>
                {t('tactics.info.title')}
              </h3>
              <p className="text-sm sm:text-base" style={{ color: 'var(--accent-deep)' }}>
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
            <div className="muted text-base sm:text-lg">{t('tactics.noResults')}</div>
          </div>
        )}
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={closeTutorial}
      />
    </>
  );
};
