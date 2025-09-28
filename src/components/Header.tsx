// no React import needed for JSX with react-jsx runtime
import { Trophy, User, BookOpen, Video, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { useLocalization } from '../hooks/useLocalization';
import { getLevelInfo, getProgressWithinLevel } from '../services/levels';
import { UserProgress } from '../types';

interface HeaderProps {
  activeSection: 'tactics' | 'quiz' | 'admin' | 'profile';
  onSectionChange: (section: 'tactics' | 'quiz' | 'admin' | 'profile') => void;
  progress: UserProgress;
}

export const Header = ({ activeSection, onSectionChange, progress }: HeaderProps) => {
  const { currentUser, isAuthLoading } = useAuth();
  const { isAdmin, isAdminLoading } = useIsAdmin();
  const { t } = useLocalization();

  return (
    <header className="bg-gray-900 shadow-2xl border-b-4 border-orange-500 sticky top-0 z-40 pt-safe">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-lg shrink-0">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">{t('header.title')}</h1>
              <p className="text-xs sm:text-sm text-gray-300">{t('header.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1 overflow-x-auto no-scrollbar max-w-[60vw] sm:max-w-none pr-1">
              <button
                onClick={() => onSectionChange('tactics')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeSection === 'tactics'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                }`}
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:block">{t('header.nav.tactics')}</span>
              </button>
              <button
                onClick={() => onSectionChange('quiz')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeSection === 'quiz'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                }`}
              >
                <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:block">{t('header.nav.quiz')}</span>
              </button>
              {(isAdmin || isAdminLoading) && (
                <button
                  onClick={() => onSectionChange('admin')}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeSection === 'admin'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  } ${isAdminLoading && !isAdmin ? 'opacity-50 cursor-wait' : ''}`}
                  disabled={isAdminLoading && !isAdmin}
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:block">{t('header.nav.admin')}</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button onClick={() => onSectionChange('profile')} className="flex items-center space-x-2 sm:space-x-3 bg-gray-800 px-3 sm:px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                {(() => {
                  const info = getLevelInfo(progress.totalScore);
                  return (
                    <div className="text-xs sm:text-sm text-left">
                      <div className="font-semibold text-white truncate max-w-[36vw] sm:max-w-none">
                        {isAuthLoading ? '…' : (currentUser ? currentUser.name : t('header.guest'))}
                      </div>
                      <div className="text-orange-300 inline-flex items-center space-x-1">
                        <span>{info.badge}</span>
                        <span>{info.name}</span>
                      </div>
                    </div>
                  );
                })()}
              </button>
            </div>
          </div>
        </div>
        
        <div className="pb-2">
          {(() => {
            const prog = getProgressWithinLevel(progress.totalScore);
            return (
              <>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${prog.total ? prog.percent : 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{t('header.progress.text')}</span>
                  <span>{prog.total ? `${prog.current}/${prog.total}` : 'MAX'}</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </header>
  );
};