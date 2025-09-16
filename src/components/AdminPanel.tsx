import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Tactic, QuizQuestion, Playlist, PlaylistScenario, TacticPlaylist } from '../types';

interface AdminPanelProps {
  tactics?: Tactic[];
  quizzes?: QuizQuestion[];
  playlists?: Playlist[];
  tacticPlaylists?: TacticPlaylist[];
  onAddTactic?: (tactic: Omit<Tactic, 'id'>) => void;
  onUpdateTactic?: (id: string, tactic: Tactic) => void;
  onDeleteTactic?: (id: string) => void;
  onAddQuiz?: (quiz: Omit<QuizQuestion, 'id'>) => void;
  onUpdateQuiz?: (id: string, quiz: QuizQuestion) => void;
  onDeleteQuiz?: (id: string) => void;
  onAddPlaylist?: (playlist: Omit<Playlist, 'id'>) => void;
  onUpdatePlaylist?: (id: string, playlist: Playlist) => void;
  onDeletePlaylist?: (id: string) => void;
  onAddTacticPlaylist?: (playlist: Omit<TacticPlaylist, 'id'>) => void;
  onUpdateTacticPlaylist?: (id: string, playlist: TacticPlaylist) => void;
  onDeleteTacticPlaylist?: (id: string) => void;
}

interface TacticForm {
  title: string;
  description: string;
  category: 'offense' | 'defense';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  thumbnail?: string;
  stepImages?: string[];
}

interface QuizForm {
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'offense' | 'defense';
  videoUrl: string;
  thumbnail?: string;
  explanationVideoUrl?: string;
}

interface PlaylistForm {
  title: string;
  description: string;
  category: 'offense' | 'defense';
  scenario: PlaylistScenario;
  thumbnail?: string;
  quizIds: string[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tactics = [],
  quizzes = [],
  playlists = [],
  tacticPlaylists = [],
  onAddTactic,
  onUpdateTactic,
  onDeleteTactic,
  onAddQuiz,
  onUpdateQuiz,
  onDeleteQuiz,
  onAddPlaylist,
  onUpdatePlaylist,
  onDeletePlaylist,
  onAddTacticPlaylist,
  onUpdateTacticPlaylist,
  onDeleteTacticPlaylist
}) => {
  const [activeTab, setActiveTab] = useState<'tactics' | 'quizzes' | 'playlists'>('tactics');
  
  // Tactics
  const [tacticForm, setTacticForm] = useState<TacticForm>({
    title: '',
    description: '',
    category: 'offense',
    difficulty: 'beginner',
    steps: [''],
    thumbnail: '',
    stepImages: ['']
  });
  const [editingTactic, setEditingTactic] = useState<Tactic | null>(null);

  // Quizzes
  const [quizForm, setQuizForm] = useState<QuizForm>({
    title: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'beginner',
    category: 'offense',
    videoUrl: '',
    thumbnail: '',
    explanationVideoUrl: ''
  });
  const [editingQuiz, setEditingQuiz] = useState<QuizQuestion | null>(null);

  // Playlists
  const [playlistForm, setPlaylistForm] = useState<PlaylistForm>({
    title: '',
    description: '',
    category: 'offense',
    scenario: 'custom',
    thumbnail: '',
    quizIds: []
  });
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  // Tactic Playlists
  type TacticPlaylistForm = {
    title: string;
    description: string;
    category: 'offense' | 'defense';
    thumbnail?: string;
    tacticIds: string[];
  };
  const [tacticPlaylistForm, setTacticPlaylistForm] = useState<TacticPlaylistForm>({
    title: '',
    description: '',
    category: 'offense',
    thumbnail: '',
    tacticIds: []
  });
  const [editingTacticPlaylist, setEditingTacticPlaylist] = useState<TacticPlaylist | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Admin Panel</h2>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {(['tactics', 'quizzes', 'playlists'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab === 'tactics' && 'Tactics'}
              {tab === 'quizzes' && 'Quizzes'}
              {tab === 'playlists' && 'Playlists'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'tactics' && (
        <div className="space-y-6">
          {/* Add/Edit Tactic Form */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingTactic ? 'Edit tactic' : 'Add tactic'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={tacticForm.title}
                  onChange={(e) => setTacticForm({ ...tacticForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={tacticForm.category}
                  onChange={(e) => setTacticForm({ ...tacticForm, category: e.target.value as any })}
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
                  onChange={(e) => setTacticForm({ ...tacticForm, difficulty: e.target.value as any })}
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
                  value={tacticForm.thumbnail || ''}
                  onChange={(e) => setTacticForm({ ...tacticForm, thumbnail: e.target.value })}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={tacticForm.description}
                onChange={(e) => setTacticForm({ ...tacticForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Steps</label>
              {tacticForm.steps.map((step, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...tacticForm.steps];
                      newSteps[index] = e.target.value;
                      setTacticForm({ ...tacticForm, steps: newSteps });
                    }}
                    placeholder={`Step ${index + 1} text`}
                    className="px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={tacticForm.stepImages?.[index] || ''}
                    onChange={(e) => {
                      const imgs = [...(tacticForm.stepImages || [])];
                      imgs[index] = e.target.value;
                      setTacticForm({ ...tacticForm, stepImages: imgs });
                    }}
                    placeholder="Step image URL"
                    className="px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={() => {
                        const newSteps = tacticForm.steps.filter((_, i) => i !== index);
                        const imgs = (tacticForm.stepImages || []).filter((_, i) => i !== index);
                        setTacticForm({ ...tacticForm, steps: newSteps, stepImages: imgs });
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setTacticForm({ ...tacticForm, steps: [...tacticForm.steps, ''], stepImages: [...(tacticForm.stepImages || []), ''] })}
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
                      if (onUpdateTactic) {
                        onUpdateTactic(editingTactic.id, {
                          ...editingTactic,
                          ...tacticForm
                        });
                      }
                      setEditingTactic(null);
                      setTacticForm({
                        title: '',
                        description: '',
                        category: 'offense',
                        difficulty: 'beginner',
                        steps: [''],
                        thumbnail: '',
                        stepImages: ['']
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingTactic(null);
                      setTacticForm({
                        title: '',
                        description: '',
                        category: 'offense',
                        difficulty: 'beginner',
                        steps: [''],
                        thumbnail: '',
                        stepImages: ['']
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (onAddTactic) {
                      onAddTactic({
                        ...tacticForm
                      });
                    }
                    setTacticForm({
                      title: '',
                      description: '',
                      category: 'offense',
                      difficulty: 'beginner',
                      steps: [''],
                      thumbnail: '',
                      stepImages: ['']
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add tactic</span>
                </button>
              )}
            </div>
          </div>

          {/* Tactics List */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">Tactics list</h3>
            <div className="space-y-3">
              {tactics.map((tactic) => (
                <div key={tactic.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{tactic.title}</h4>
                    <p className="text-sm text-gray-300">{tactic.description}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tactic.category === 'offense' 
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-600' 
                          : 'bg-red-900/30 text-red-400 border border-red-600'
                      }`}>
                        {tactic.category === 'offense' ? 'Offense' : 'Defense'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        tactic.difficulty === 'beginner' 
                          ? 'bg-green-900/30 text-green-400 border border-green-600'
                          : tactic.difficulty === 'intermediate'
                          ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-600'
                          : 'bg-red-900/30 text-red-400 border border-red-600'
                      }`}>
                        {tactic.difficulty === 'beginner' ? 'Beginner' : 
                         tactic.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingTactic(tactic);
                        setTacticForm({
                          title: tactic.title,
                          description: tactic.description,
                          category: tactic.category,
                          difficulty: tactic.difficulty,
                          steps: tactic.steps,
                          thumbnail: tactic.thumbnail,
                          stepImages: tactic.stepImages && tactic.stepImages.length ? tactic.stepImages : tactic.steps.map(() => '')
                        });
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTactic?.(tactic.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Add/Edit Quiz Form */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingQuiz ? 'Edit quiz' : 'Add quiz'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={quizForm.category}
                  onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value as any })}
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
                  onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value as any })}
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
                  value={quizForm.thumbnail || ''}
                  onChange={(e) => setQuizForm({ ...quizForm, thumbnail: e.target.value })}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Question</label>
              <textarea
                value={quizForm.question}
                onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Video URL</label>
              <input
                type="text"
                value={quizForm.videoUrl}
                onChange={(e) => setQuizForm({ ...quizForm, videoUrl: e.target.value })}
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
                    onChange={() => setQuizForm({ ...quizForm, correctAnswer: index })}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...quizForm.options];
                      newOptions[index] = e.target.value;
                      setQuizForm({ ...quizForm, options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Explanation</label>
              <textarea
                value={quizForm.explanation}
                onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Explanation Video URL</label>
              <input
                type="text"
                value={quizForm.explanationVideoUrl}
                onChange={(e) => setQuizForm({ ...quizForm, explanationVideoUrl: e.target.value })}
                placeholder="Explanation video URL"
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div className="flex space-x-2">
              {editingQuiz ? (
                <>
                  <button
                    onClick={() => {
                      if (onUpdateQuiz) {
                        onUpdateQuiz(editingQuiz.id, {
                          ...editingQuiz,
                          ...quizForm
                        });
                      }
                      setEditingQuiz(null);
                      setQuizForm({
                        title: '',
                        question: '',
                        options: ['', '', '', ''],
                        correctAnswer: 0,
                        explanation: '',
                        difficulty: 'beginner',
                        category: 'offense',
                        videoUrl: '',
                        thumbnail: '',
                        explanationVideoUrl: ''
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuiz(null);
                      setQuizForm({
                        title: '',
                        question: '',
                        options: ['', '', '', ''],
                        correctAnswer: 0,
                        explanation: '',
                        difficulty: 'beginner',
                        category: 'offense',
                        videoUrl: '',
                        thumbnail: '',
                        explanationVideoUrl: ''
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (onAddQuiz) {
                      onAddQuiz({
                        ...quizForm
                      });
                    }
                    setQuizForm({
                      title: '',
                      question: '',
                      options: ['', '', '', ''],
                      correctAnswer: 0,
                      explanation: '',
                      difficulty: 'beginner',
                      category: 'offense',
                      videoUrl: '',
                      thumbnail: '',
                      explanationVideoUrl: ''
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Quizzes List */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">Quizzes list</h3>
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{quiz.title}</h4>
                    <p className="text-sm text-gray-300">{quiz.question}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        quiz.category === 'offense' 
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-600' 
                          : 'bg-red-900/30 text-red-400 border border-red-600'
                      }`}>
                        {quiz.category === 'offense' ? 'Offense' : 'Defense'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        quiz.difficulty === 'beginner' 
                          ? 'bg-green-900/30 text-green-400 border border-green-600'
                          : quiz.difficulty === 'intermediate'
                          ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-600'
                          : 'bg-red-900/30 text-red-400 border border-red-600'
                      }`}>
                        {quiz.difficulty === 'beginner' ? 'Beginner' : 
                         quiz.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingQuiz(quiz);
                        setQuizForm({
                          title: quiz.title,
                          question: quiz.question,
                          options: quiz.options,
                          correctAnswer: quiz.correctAnswer,
                          explanation: quiz.explanation,
                          difficulty: quiz.difficulty,
                          category: quiz.category,
                          videoUrl: quiz.videoUrl,
                          thumbnail: quiz.thumbnail,
                          explanationVideoUrl: quiz.explanationVideoUrl
                        });
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteQuiz?.(quiz.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'playlists' && (
        <div className="space-y-6">
          {/* Add/Edit Playlist Form */}
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
                  onChange={(e) => setPlaylistForm({ ...playlistForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Kind</label>
                <select
                  value={(playlistForm as any).kind || 'quiz'}
                  onChange={(e) => setPlaylistForm({ ...(playlistForm as any), kind: e.target.value as any })}
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
                  onChange={(e) => setPlaylistForm({ ...playlistForm, category: e.target.value as any })}
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
                  value={playlistForm.thumbnail || ''}
                  onChange={(e) => setPlaylistForm({ ...playlistForm, thumbnail: e.target.value })}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={playlistForm.description || ''}
                onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            {((playlistForm as any).kind || 'quiz') === 'quiz' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Quizzes in playlist</label>
                <div className="space-y-2">
                  {quizzes.map((quiz) => (
                    <label key={quiz.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={playlistForm.quizIds.includes(quiz.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPlaylistForm({
                              ...playlistForm,
                              quizIds: [...playlistForm.quizIds, quiz.id]
                            });
                          } else {
                            setPlaylistForm({
                              ...playlistForm,
                              quizIds: playlistForm.quizIds.filter(id => id !== quiz.id)
                            });
                          }
                        }}
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
                  {tactics.map((t) => (
                    <label key={t.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={((playlistForm as any).tacticIds || []).includes(t.id)}
                        onChange={(e) => {
                          const current = ((playlistForm as any).tacticIds || []) as string[];
                          const next = e.target.checked ? [...current, t.id] : current.filter(id => id !== t.id);
                          setPlaylistForm({ ...(playlistForm as any), tacticIds: next });
                        }}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-gray-300">{t.title}</span>
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
                      if (onUpdatePlaylist) {
                        const kind = (playlistForm as any).kind || 'quiz';
                        const payload: Playlist = {
                          ...editingPlaylist,
                          ...playlistForm,
                          kind,
                          quizIds: kind === 'quiz' ? playlistForm.quizIds : [],
                          tacticIds: kind === 'tactic' ? ((playlistForm as any).tacticIds || []) : []
                        } as any;
                        onUpdatePlaylist(editingPlaylist.id, payload);
                      }
                      setEditingPlaylist(null);
                      setPlaylistForm({
                        title: '',
                        description: '',
                        category: 'offense',
                        thumbnail: '',
                        quizIds: []
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingPlaylist(null);
                      setPlaylistForm({
                        title: '',
                        description: '',
                        category: 'offense',
                        thumbnail: '',
                        quizIds: []
                      });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (onAddPlaylist) {
                      const kind = (playlistForm as any).kind || 'quiz';
                      const payload: Omit<Playlist, 'id'> = {
                        ...playlistForm,
                        kind,
                        quizIds: kind === 'quiz' ? playlistForm.quizIds : [],
                        tacticIds: kind === 'tactic' ? ((playlistForm as any).tacticIds || []) : []
                      } as any;
                      onAddPlaylist(payload);
                    }
                    setPlaylistForm({
                      title: '',
                      description: '',
                      category: 'offense',
                      thumbnail: '',
                      quizIds: []
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add playlist</span>
                </button>
              )}
            </div>
          </div>

          {/* Playlists List */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">Playlists list</h3>
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{playlist.title}</h4>
                    <p className="text-sm text-gray-300">{playlist.description}</p>
                    <div className="flex space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        playlist.category === 'offense' 
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-600' 
                          : 'bg-red-900/30 text-red-400 border border-red-600'
                      }`}>
                        {playlist.category === 'offense' ? 'Offense' : 'Defense'}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-600 text-gray-300">
                        {playlist.quizIds.length} quizzes
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingPlaylist(playlist);
                        setPlaylistForm({
                          title: playlist.title,
                          description: playlist.description || '',
                          category: playlist.category,
                          thumbnail: playlist.thumbnail || '',
                          quizIds: playlist.quizIds
                        });
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeletePlaylist?.(playlist.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
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