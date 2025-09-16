import React, { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { TacticsSection } from './components/TacticsSection';
import { QuizSection } from './components/QuizSection';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { useProgress } from './hooks/useProgress';
import { useAdminData } from './hooks/useAdminData';
import { useLocalization } from './hooks/useLocalization';
import { useNavigate, useLocation } from 'react-router-dom';

function App() {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<'landing' | 'tactics' | 'quiz' | 'admin' | 'profile'>('tactics');
  const { progress, completeQuiz } = useProgress();
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
        return <TacticsSection tactics={tactics} tacticPlaylists={playlists.filter(p => (p.kind || 'quiz') === 'tactic').map(p => ({ id: p.id, title: p.title, description: p.description, category: p.category, scenario: 'custom', thumbnail: p.thumbnail, tacticIds: p.tacticIds || [] }))} />;
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
        return (
          <AdminPanel
            tactics={tactics}
            quizzes={quizzes}
            playlists={playlists}
            onAddTactic={addTactic}
            onUpdateTactic={updateTactic}
            onDeleteTactic={deleteTactic}
            onAddQuiz={addQuiz}
            onUpdateQuiz={updateQuiz}
            onDeleteQuiz={deleteQuiz}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {true && (
        <Header
          activeSection={activeSection}
          onSectionChange={(s) => { setActiveSection(s); navigate(`/app/${s}`); }}
          progress={progress}
        />
      )}
      <main>
        {renderSection()}
      </main>
    </div>
  );
}

export default App;