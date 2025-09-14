import React, { useState } from 'react';
import { Landing } from './components/Landing';
import { Header } from './components/Header';
import { TacticsSection } from './components/TacticsSection';
import { QuizSection } from './components/QuizSection';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { useProgress } from './hooks/useProgress';
import { useAdminData } from './hooks/useAdminData';
import { useLocalization } from './hooks/useLocalization';

function App() {
  const { t } = useLocalization();
  const [activeSection, setActiveSection] = useState<'landing' | 'tactics' | 'quiz' | 'admin' | 'profile'>('landing');
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
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'landing':
        return <Landing onStartLearning={handleStartLearning} />;
      case 'tactics':
        return <TacticsSection tactics={tactics} />;
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
      {activeSection !== 'landing' && (
        <Header
          activeSection={activeSection}
          onSectionChange={setActiveSection}
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