import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Tactic, QuizQuestion, Playlist, PlaylistScenario } from '../types';
import { getDifficultyColor, getDifficultyText, getCategoryColor, getCategoryText } from '../utils/badgeUtils';

interface AdminPanelProps {
  tactics?: Tactic[];
  quizzes?: QuizQuestion[];
  playlists?: Playlist[];
  onAddTactic?: (tactic: Omit<Tactic, 'id'>) => void;
  onUpdateTactic?: (id: string, tactic: Tactic) => void;
  onDeleteTactic?: (id: string) => void;
  onAddQuiz?: (quiz: Omit<QuizQuestion, 'id'>) => void;
  onUpdateQuiz?: (id: string, quiz: QuizQuestion) => void;
  onDeleteQuiz?: (id: string) => void;
  onAddPlaylist?: (playlist: Omit<Playlist, 'id'>) => void;
  onUpdatePlaylist?: (id: string, playlist: Playlist) => void;
  onDeletePlaylist?: (id: string) => void;
}

interface TacticForm {
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  category: 'offense' | 'defense';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  thumbnail: string;
  stepImages: string[];
}

interface QuizForm {
  title: string;
  titleRu: string;
  question: string;
  questionRu: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'offense' | 'defense';
  videoUrl: string;
  thumbnail: string;
  explanationVideoUrl: string;
}

interface PlaylistForm {
  title: string;
  description: string;
  category: 'offense' | 'defense';
  scenario: PlaylistScenario;
  kind: 'quiz' | 'tactic';
  thumbnail: string;
  quizIds: string[];
  tacticIds: string[];
}

const EMPTY_TACTIC_FORM: TacticForm = {
  title: '',
  titleRu: '',
  description: '',
  descriptionRu: '',
  category: 'offense',
  difficulty: 'beginner',
  steps: [''],
  thumbnail: '',
  stepImages: [''],
};

const EMPTY_QUIZ_FORM: QuizForm = {
  title: '',
  titleRu: '',
  question: '',
  questionRu: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  difficulty: 'beginner',
  category: 'offense',
  videoUrl: '',
  thumbnail: '',
  explanationVideoUrl: '',
};

const EMPTY_PLAYLIST_FORM: PlaylistForm = {
  title: '',
  description: '',
  category: 'offense',
  scenario: 'custom',
  kind: 'quiz',
  thumbnail: '',
  quizIds: [],
  tacticIds: [],
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tactics = [],
  quizzes = [],
  playlists = [],
  onAddTactic,
  onUpdateTactic,
  onDeleteTactic,
  onAddQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
  onAddPlaylist,
  onUpdatePlaylist,
  onDeletePlaylist,
}) => {
  const [activeTab, setActiveTab] = useState<'tactics' | 'quizzes' | 'playlists'>('tactics');
  const [tacticLang, setTacticLang] = useState<'en' | 'ru'>('en');
  const [quizLang, setQuizLang] = useState<'en' | 'ru'>('en');

  const packBilingual = (en: string, ru: string) =>
    ru.trim() ? JSON.stringify({ en, ru }) : en;

  const unpackBilingual = (value: string): { en: string; ru: string } => {
    try {
      const p = JSON.parse(value);
      if (p?.en !== undefined) return { en: p.en || '', ru: p.ru || '' };
    } catch {}
    return { en: value, ru: '' };
  };

  const [tacticForm, setTacticForm] = useState<TacticForm>(EMPTY_TACTIC_FORM);
  const [editingTactic, setEditingTactic] = useState<Tactic | null>(null);

  const [quizForm, setQuizForm] = useState<QuizForm>(EMPTY_QUIZ_FORM);
  const [editingQuiz, setEditingQuiz] = useState<QuizQuestion | null>(null);

  const [playlistForm, setPlaylistForm] = useState<PlaylistForm>(EMPTY_PLAYLIST_FORM);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  const cancelTactic = () => { setEditingTactic(null); setTacticForm(EMPTY_TACTIC_FORM); };
  const cancelQuiz = () => { setEditingQuiz(null); setQuizForm(EMPTY_QUIZ_FORM); };
  const cancelPlaylist = () => { setEditingPlaylist(null); setPlaylistForm(EMPTY_PLAYLIST_FORM); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Admin Panel</h2>
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg overflow-x-auto">
          {(['tactics', 'quizzes', 'playlists'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab === 'tactics' ? 'Tactics' : tab === 'quizzes' ? 'Quizzes' : 'Playlists'}
            </button>
          ))}
        </div>
      </div>

      {/* ── TACTICS ── */}
      {activeTab === 'tactics' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingTactic ? 'Edit tactic' : 'Add tactic'}
            </h3>

            {/* Language switcher */}
            <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg mb-4 w-fit">
              {(['en', 'ru'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setTacticLang(lang)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    tacticLang === lang ? 'bg-orange-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                {tacticLang === 'en' ? (
                  <>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title (EN)</label>
                    <input
                      key="tactic-title-en"
                      type="text"
                      value={tacticForm.title}
                      onChange={e => setTacticForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title (RU)</label>
                    <input
                      key="tactic-title-ru"
                      type="text"
                      value={tacticForm.titleRu}
                      onChange={e => setTacticForm(f => ({ ...f, titleRu: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                    />
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={tacticForm.category}
                  onChange={e => setTacticForm(f => ({ ...f, category: e.target.value as TacticForm['category'] }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="offense">Offense</option>
                  <option value="defense">Defense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                <select
                  value={tacticForm.difficulty}
                  onChange={e => setTacticForm(f => ({ ...f, difficulty: e.target.value as TacticForm['difficulty'] }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail</label>
                <input
                  type="text"
                  value={tacticForm.thumbnail}
                  onChange={e => setTacticForm(f => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="mb-4">
              {tacticLang === 'en' ? (
                <>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description (EN)</label>
                  <textarea
                    key="tactic-desc-en"
                    value={tacticForm.description}
                    onChange={e => setTacticForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description (RU)</label>
                  <textarea
                    key="tactic-desc-ru"
                    value={tacticForm.descriptionRu}
                    onChange={e => setTacticForm(f => ({ ...f, descriptionRu: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Steps</label>
              {tacticForm.steps.map((step, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={step}
                    onChange={e => setTacticForm(f => {
                      const steps = [...f.steps];
                      steps[index] = e.target.value;
                      return { ...f, steps };
                    })}
                    placeholder={`Step ${index + 1} text`}
                    className="px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={tacticForm.stepImages[index] || ''}
                    onChange={e => setTacticForm(f => {
                      const stepImages = [...f.stepImages];
                      stepImages[index] = e.target.value;
                      return { ...f, stepImages };
                    })}
                    placeholder="Step image URL"
                    className="px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={() => setTacticForm(f => ({
                        ...f,
                        steps: f.steps.filter((_, i) => i !== index),
                        stepImages: f.stepImages.filter((_, i) => i !== index),
                      }))}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setTacticForm(f => ({ ...f, steps: [...f.steps, ''], stepImages: [...f.stepImages, ''] }))}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add step</span>
              </button>
            </div>

            <div className="flex space-x-2">
              {editingTactic ? (
                <>
                  <button
                    onClick={() => {
                      const { titleRu, descriptionRu, ...rest } = tacticForm;
                      onUpdateTactic?.(editingTactic.id, {
                        ...editingTactic,
                        ...rest,
                        title: packBilingual(tacticForm.title, titleRu),
                        description: packBilingual(tacticForm.description, descriptionRu),
                      });
                      cancelTactic();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                  >
                    <Save className="h-4 w-4" /><span>Save</span>
                  </button>
                  <button onClick={cancelTactic} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                    <X className="h-4 w-4" /><span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const { titleRu, descriptionRu, ...rest } = tacticForm;
                    onAddTactic?.({
                      ...rest,
                      title: packBilingual(tacticForm.title, titleRu),
                      description: packBilingual(tacticForm.description, descriptionRu),
                    });
                    setTacticForm(EMPTY_TACTIC_FORM);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                >
                  <Plus className="h-4 w-4" /><span>Add tactic</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">Tactics list</h3>
            <div className="space-y-3">
              {tactics.map(tactic => (
                <div key={tactic.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{tactic.title}</h4>
                    <p className="text-sm text-gray-300">{tactic.description}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(tactic.category)}`}>
                        {getCategoryText(tactic.category)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(tactic.difficulty)}`}>
                        {getDifficultyText(tactic.difficulty)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingTactic(tactic);
                        const unpackedTitle = unpackBilingual(tactic.title);
                        const unpackedDesc = unpackBilingual(tactic.description);
                        setTacticForm({
                          title: unpackedTitle.en,
                          titleRu: unpackedTitle.ru,
                          description: unpackedDesc.en,
                          descriptionRu: unpackedDesc.ru,
                          category: tactic.category,
                          difficulty: tactic.difficulty,
                          steps: tactic.steps,
                          thumbnail: tactic.thumbnail ?? '',
                          stepImages: tactic.stepImages?.length ? tactic.stepImages : tactic.steps.map(() => ''),
                        });
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDeleteTactic?.(tactic.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── QUIZZES ── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingQuiz ? 'Edit quiz' : 'Add quiz'}
            </h3>

            {/* Language switcher */}
            <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg mb-4 w-fit">
              {(['en', 'ru'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setQuizLang(lang)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    quizLang === lang ? 'bg-orange-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                {quizLang === 'en' ? (
                  <>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title (EN)</label>
                    <input
                      key="quiz-title-en"
                      type="text"
                      value={quizForm.title}
                      onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title (RU)</label>
                    <input
                      key="quiz-title-ru"
                      type="text"
                      value={quizForm.titleRu}
                      onChange={e => setQuizForm(f => ({ ...f, titleRu: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                    />
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={quizForm.category}
                  onChange={e => setQuizForm(f => ({ ...f, category: e.target.value as QuizForm['category'] }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="offense">Offense</option>
                  <option value="defense">Defense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                <select
                  value={quizForm.difficulty}
                  onChange={e => setQuizForm(f => ({ ...f, difficulty: e.target.value as QuizForm['difficulty'] }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail</label>
                <input
                  type="text"
                  value={quizForm.thumbnail}
                  onChange={e => setQuizForm(f => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="mb-4">
              {quizLang === 'en' ? (
                <>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Question (EN)</label>
                  <textarea
                    key="quiz-question-en"
                    value={quizForm.question}
                    onChange={e => setQuizForm(f => ({ ...f, question: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Question (RU)</label>
                  <textarea
                    key="quiz-question-ru"
                    value={quizForm.questionRu}
                    onChange={e => setQuizForm(f => ({ ...f, questionRu: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Video URL</label>
              <input
                type="text"
                value={quizForm.videoUrl}
                onChange={e => setQuizForm(f => ({ ...f, videoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Options</label>
              {quizForm.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={quizForm.correctAnswer === index}
                    onChange={() => setQuizForm(f => ({ ...f, correctAnswer: index }))}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={e => setQuizForm(f => {
                      const options = [...f.options];
                      options[index] = e.target.value;
                      return { ...f, options };
                    })}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => {
                      if (quizForm.options.length <= 2) return;
                      const options = quizForm.options.filter((_, i) => i !== index);
                      let correctAnswer = quizForm.correctAnswer;
                      if (index === correctAnswer) correctAnswer = 0;
                      else if (index < correctAnswer) correctAnswer -= 1;
                      setQuizForm(f => ({ ...f, options, correctAnswer }));
                    }}
                    className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setQuizForm(f => ({ ...f, options: [...f.options, ''] }))}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                <Plus className="h-4 w-4" /><span>Add option</span>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Explanation</label>
              <textarea
                value={quizForm.explanation}
                onChange={e => setQuizForm(f => ({ ...f, explanation: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Explanation Video URL</label>
              <input
                type="text"
                value={quizForm.explanationVideoUrl}
                onChange={e => setQuizForm(f => ({ ...f, explanationVideoUrl: e.target.value }))}
                placeholder="Explanation video URL"
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="flex space-x-2">
              {editingQuiz ? (
                <>
                  <button
                    onClick={() => {
                      const { titleRu, questionRu, ...rest } = quizForm;
                      onUpdateQuiz?.(editingQuiz.id, {
                        ...editingQuiz,
                        ...rest,
                        title: packBilingual(quizForm.title, titleRu),
                        question: packBilingual(quizForm.question, questionRu),
                      });
                      cancelQuiz();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                  >
                    <Save className="h-4 w-4" /><span>Save</span>
                  </button>
                  <button onClick={cancelQuiz} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                    <X className="h-4 w-4" /><span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const { titleRu, questionRu, ...rest } = quizForm;
                    onAddQuiz?.({
                      ...rest,
                      title: packBilingual(quizForm.title, titleRu),
                      question: packBilingual(quizForm.question, questionRu),
                    });
                    setQuizForm(EMPTY_QUIZ_FORM);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                >
                  <Plus className="h-4 w-4" /><span>Add quiz</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">Quizzes list</h3>
            <div className="space-y-3">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{quiz.title}</h4>
                    <p className="text-sm text-gray-300">{quiz.question}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(quiz.category)}`}>
                        {getCategoryText(quiz.category)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                        {getDifficultyText(quiz.difficulty)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingQuiz(quiz);
                        const unpackedTitle = unpackBilingual(quiz.title);
                        const unpackedQuestion = unpackBilingual(quiz.question);
                        setQuizForm({
                          title: unpackedTitle.en,
                          titleRu: unpackedTitle.ru,
                          question: unpackedQuestion.en,
                          questionRu: unpackedQuestion.ru,
                          options: quiz.options,
                          correctAnswer: quiz.correctAnswer,
                          explanation: quiz.explanation,
                          difficulty: quiz.difficulty,
                          category: quiz.category,
                          videoUrl: quiz.videoUrl,
                          thumbnail: quiz.thumbnail ?? '',
                          explanationVideoUrl: quiz.explanationVideoUrl ?? '',
                        });
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDeleteQuiz?.(quiz.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PLAYLISTS ── */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingPlaylist ? 'Edit playlist' : 'Add playlist'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={playlistForm.title}
                  onChange={e => setPlaylistForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Kind</label>
                <select
                  value={playlistForm.kind}
                  onChange={e => setPlaylistForm(f => ({ ...f, kind: e.target.value as PlaylistForm['kind'] }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="quiz">Quiz playlist</option>
                  <option value="tactic">Tactic playlist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={playlistForm.category}
                  onChange={e => setPlaylistForm(f => ({ ...f, category: e.target.value as PlaylistForm['category'] }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="offense">Offense</option>
                  <option value="defense">Defense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail</label>
                <input
                  type="text"
                  value={playlistForm.thumbnail}
                  onChange={e => setPlaylistForm(f => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={playlistForm.description}
                onChange={e => setPlaylistForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {playlistForm.kind === 'quiz' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Quizzes in playlist</label>
                <div className="space-y-2">
                  {quizzes.map(quiz => (
                    <label key={quiz.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={playlistForm.quizIds.includes(quiz.id)}
                        onChange={e => setPlaylistForm(f => ({
                          ...f,
                          quizIds: e.target.checked
                            ? [...f.quizIds, quiz.id]
                            : f.quizIds.filter(id => id !== quiz.id),
                        }))}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-gray-300">{quiz.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Tactics in playlist</label>
                <div className="space-y-2">
                  {tactics.map(tac => (
                    <label key={tac.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={playlistForm.tacticIds.includes(tac.id)}
                        onChange={e => setPlaylistForm(f => ({
                          ...f,
                          tacticIds: e.target.checked
                            ? [...f.tacticIds, tac.id]
                            : f.tacticIds.filter(id => id !== tac.id),
                        }))}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-gray-300">{tac.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {editingPlaylist ? (
                <>
                  <button
                    onClick={() => {
                      const { kind, quizIds, tacticIds, ...rest } = playlistForm;
                      onUpdatePlaylist?.(editingPlaylist.id, {
                        ...editingPlaylist,
                        ...rest,
                        kind,
                        quizIds: kind === 'quiz' ? quizIds : [],
                        tacticIds: kind === 'tactic' ? tacticIds : [],
                      });
                      cancelPlaylist();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                  >
                    <Save className="h-4 w-4" /><span>Save</span>
                  </button>
                  <button onClick={cancelPlaylist} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                    <X className="h-4 w-4" /><span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const { kind, quizIds, tacticIds, ...rest } = playlistForm;
                    onAddPlaylist?.({
                      ...rest,
                      kind,
                      quizIds: kind === 'quiz' ? quizIds : [],
                      tacticIds: kind === 'tactic' ? tacticIds : [],
                    });
                    setPlaylistForm(EMPTY_PLAYLIST_FORM);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                >
                  <Plus className="h-4 w-4" /><span>Add playlist</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">Playlists list</h3>
            <div className="space-y-3">
              {playlists.map(playlist => (
                <div key={playlist.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{playlist.title}</h4>
                    <p className="text-sm text-gray-300">{playlist.description}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(playlist.category)}`}>
                        {getCategoryText(playlist.category)}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-600 text-gray-300">
                        {(playlist.kind ?? 'quiz') === 'quiz'
                          ? `${playlist.quizIds.length} quizzes`
                          : `${playlist.tacticIds?.length ?? 0} tactics`}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingPlaylist(playlist);
                        setPlaylistForm({
                          title: playlist.title,
                          description: playlist.description ?? '',
                          category: playlist.category,
                          scenario: playlist.scenario,
                          kind: playlist.kind ?? 'quiz',
                          thumbnail: playlist.thumbnail ?? '',
                          quizIds: playlist.quizIds,
                          tacticIds: playlist.tacticIds ?? [],
                        });
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDeletePlaylist?.(playlist.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
