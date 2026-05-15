import React from 'react';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { AppBackground } from './components/ui/Backgrounds';
import { Footer } from './components/Footer';
import { TacticsSection } from './components/TacticsSection';
import { QuizSection } from './components/QuizSection';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { useProgress } from './hooks/useProgress';
import { useAdminData } from './hooks/useAdminData';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsAdmin } from './hooks/useIsAdmin';
import { Tactic, QuizQuestion, Playlist } from './types';

type SectionKey = 'tactics' | 'quiz' | 'admin' | 'profile';
const VALID_SECTIONS = new Set<string>(['tactics', 'quiz', 'admin', 'profile']);

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { progress, completeQuiz, completeTactic } = useProgress();
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const {
    tactics,
    quizzes,
    playlists,
    addTactic,
    updateTactic,
    deleteTactic,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
  } = useAdminData();

  // Derive active section from URL — no state needed
  const rawPath = location.pathname.replace(/^\/app\/?/, '') || 'tactics';
  const activeSection: SectionKey = VALID_SECTIONS.has(rawPath) ? (rawPath as SectionKey) : 'tactics';

  const handleSectionChange = (section: SectionKey) => navigate(`/app/${section}`);

  const handleStartLearning = () => navigate('/app/tactics');

  // Wrap async CRUD handlers to surface errors via alert
  const wrapHandler = <T extends unknown[]>(
    fn: (...args: T) => Promise<void>,
    errorMsg: string,
  ) => (...args: T) => fn(...args).catch((e: any) => alert(e?.message || errorMsg));

  const handleAddTactic = wrapHandler((t: Omit<Tactic, 'id'>) => addTactic(t), 'Не удалось сохранить тактику');
  const handleUpdateTactic = wrapHandler((id: string, t: Tactic) => updateTactic(id, t), 'Не удалось обновить тактику');
  const handleDeleteTactic = wrapHandler((id: string) => deleteTactic(id), 'Не удалось удалить тактику');

  const handleAddQuiz = wrapHandler((q: Omit<QuizQuestion, 'id'>) => addQuiz(q), 'Не удалось сохранить квиз');
  const handleUpdateQuiz = wrapHandler((id: string, q: QuizQuestion) => updateQuiz(id, q), 'Не удалось обновить квиз');
  const handleDeleteQuiz = wrapHandler((id: string) => deleteQuiz(id), 'Не удалось удалить квиз');

  const handleAddPlaylist = wrapHandler((p: Omit<Playlist, 'id'>) => addPlaylist(p), 'Не удалось сохранить плейлист');
  const handleUpdatePlaylist = wrapHandler((id: string, p: Playlist) => updatePlaylist(id, p), 'Не удалось обновить плейлист');
  const handleDeletePlaylist = wrapHandler((id: string) => deletePlaylist(id), 'Не удалось удалить плейлист');

  const renderSection = () => {
    switch (activeSection) {
      case 'tactics':
        return (
          <TacticsSection
            tactics={tactics}
            tacticPlaylists={playlists
              .filter(p => (p.kind ?? 'quiz') === 'tactic')
              .map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                category: p.category,
                scenario: 'custom' as const,
                thumbnail: p.thumbnail,
                tacticIds: p.tacticIds ?? [],
              }))}
            progress={progress}
            onCompleteTactic={completeTactic}
          />
        );
      case 'quiz':
        return (
          <QuizSection
            quizzes={quizzes}
            playlists={playlists}
            completedQuizzes={progress.completedQuizzes}
            onCompleteQuiz={completeQuiz}
          />
        );
      case 'admin':
        if (isAdminLoading) {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 muted">Loading…</div>
          );
        }
        if (!isAdmin) {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="card p-8 text-center">
                <div className="font-display text-2xl mb-2">403 Forbidden</div>
                <div className="muted-2 mb-6">У вас нет доступа к этому разделу.</div>
                <button
                  onClick={() => navigate('/app/tactics')}
                  className="btn btn-primary"
                >
                  На главную
                </button>
              </div>
            </div>
          );
        }
        return (
          <AdminPanel
            tactics={tactics}
            quizzes={quizzes}
            playlists={playlists}
            onAddTactic={handleAddTactic}
            onUpdateTactic={handleUpdateTactic}
            onDeleteTactic={handleDeleteTactic}
            onAddQuiz={handleAddQuiz}
            onUpdateQuiz={handleUpdateQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onAddPlaylist={handleAddPlaylist}
            onUpdatePlaylist={handleUpdatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
          />
        );
      case 'profile':
        return <Profile progress={progress} />;
      default:
        return <Landing onStartLearning={handleStartLearning} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AppBackground />
      <Header
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        progress={progress}
      />
      <main className="flex-1 relative z-10">
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
