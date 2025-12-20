import React, { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TacticsSection } from './components/TacticsSection';
import { QuizSection } from './components/QuizSection';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { useProgress } from './hooks/useProgress';
import { useAdminData } from './hooks/useAdminData';
import { useLocalization } from './hooks/useLocalization';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsAdmin } from './hooks/useIsAdmin';
import { getOrFetchCached } from './services/resourceCache';
import { isSupabaseEnabled } from './services/supabaseClient';
import { listVideosFromSupabase } from './services/supabaseVideos';
import { videosList } from './services/api';

function App() {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<'landing' | 'tactics' | 'quiz' | 'admin' | 'profile'>('tactics');
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
    deletePlaylist
  } = useAdminData();

  // Префетч тяжелых данных (в фоне), чтобы при заходе во вкладки они уже были в кэше.
  useEffect(() => {
    const prefetch = async () => {
      try {
        await getOrFetchCached(
          'quizVideos:v1',
          async () => {
            const useSupabase = isSupabaseEnabled();
            return useSupabase ? await listVideosFromSupabase() : await videosList();
          },
          { ttlMs: 10 * 60 * 1000, storageKey: 'basketball-iq-videos-cache-v1' }
        );
      } catch {
        // не мешаем UX
      }
    };
    prefetch();
  }, []);

  // Обертки для соответствия сигнатурам AdminPanel (void, не Promise, и полный объект)
  const handleAddTactic = (t: Omit<any, 'id'>) => { addTactic(t).catch(e => alert(e?.message || 'Не удалось сохранить тактику')); };
  const handleUpdateTactic = (id: string, t: any) => { updateTactic(id, t).catch(e => alert(e?.message || 'Не удалось обновить тактику')); };
  const handleDeleteTactic = (id: string) => { deleteTactic(id).catch(e => alert(e?.message || 'Не удалось удалить тактику')); };

  const handleAddQuiz = (q: Omit<any, 'id'>) => { addQuiz(q).catch(e => alert(e?.message || 'Не удалось сохранить квиз')); };
  const handleUpdateQuiz = (id: string, q: any) => { updateQuiz(id, q).catch(e => alert(e?.message || 'Не удалось обновить квиз')); };
  const handleDeleteQuiz = (id: string) => { deleteQuiz(id).catch(e => alert(e?.message || 'Не удалось удалить квиз')); };

  const handleStartLearning = () => {
    setActiveSection('tactics');
    navigate('/app/tactics');
  };

  useEffect(() => {
    // синхронизируем состояние с URL
    const path = location.pathname.replace(/^\/app\/?/, '') || 'tactics';
    if (['tactics','quiz','admin','profile'].includes(path)) {
      setActiveSection(path as any);
    }
  }, [location.pathname]);

  const renderSection = () => {
    switch (activeSection) {
      case 'landing':
        return <Landing onStartLearning={handleStartLearning} />;
      case 'tactics':
        return (
          <TacticsSection
            tactics={tactics}
            tacticPlaylists={playlists
              .filter(p => (p.kind || 'quiz') === 'tactic')
              .map(p => ({ id: p.id, title: p.title, description: p.description, category: p.category, scenario: 'custom', thumbnail: p.thumbnail, tacticIds: p.tacticIds || [] }))}
            progress={progress}
            onCompleteTactic={(tacticId) => completeTactic(tacticId)}
          />
        );
      case 'quiz':
        return (
          <QuizSection
            quizzes={quizzes}
            playlists={playlists}
            completedQuizzes={progress.completedQuizzes}
            onCompleteQuiz={(quizId, score) => completeQuiz(quizId, score)}
          />
        );
      case 'admin':
        if (isAdminLoading) {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-300">Loading…</div>
          );
        }
        if (!isAdmin) {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <div className="text-2xl font-semibold text-white mb-2">403 Forbidden</div>
                <div className="text-gray-300 mb-6">У вас нет доступа к этому разделу.</div>
                <button
                  onClick={() => { setActiveSection('tactics'); navigate('/app/tactics'); }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
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
            onAddPlaylist={addPlaylist}
            onUpdatePlaylist={updatePlaylist}
            onDeletePlaylist={deletePlaylist}
          />
        );
      case 'profile':
        return <Profile progress={progress} />;
      default:
        return <Landing onStartLearning={handleStartLearning} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {true && (
        <Header
          activeSection={activeSection}
          onSectionChange={(s) => { setActiveSection(s); navigate(`/app/${s}`); }}
          progress={progress}
        />
      )}
      <main className="flex-1">
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}

export default App;