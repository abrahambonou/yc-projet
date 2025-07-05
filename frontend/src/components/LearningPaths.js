import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  BookOpen, 
  Clock, 
  Target, 
  Star, 
  ChevronRight,
  Filter,
  Search,
  Play,
  CheckCircle,
  Circle
} from 'lucide-react';
import { authService } from '../services/authService';

const LearningPaths = ({ user }) => {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      const data = await authService.getLearningPaths();
      setPaths(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewPath = async (preferences) => {
    try {
      setLoading(true);
      const newPath = await authService.generateLearningPath(preferences);
      setPaths([...paths, newPath]);
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPaths = paths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || path.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading && paths.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parcours d'apprentissage</h1>
          <p className="text-gray-600 mt-1">Découvrez vos parcours personnalisés générés par l'IA</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau parcours
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un parcours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="input-field"
        >
          <option value="all">Toutes les difficultés</option>
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
        </select>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <div
            key={path.id}
            className="learning-card"
            onClick={() => setSelectedPath(path)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                path.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                path.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {path.difficulty === 'beginner' ? 'Débutant' :
                 path.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {path.estimated_duration}h
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{path.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{path.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="w-4 h-4 mr-1" />
                {path.modules?.length || 0} modules
              </div>
              <div className="flex items-center text-sm text-yellow-600">
                <Star className="w-4 h-4 mr-1" />
                4.8
              </div>
            </div>

            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.random() * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPaths.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun parcours trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterDifficulty !== 'all' 
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Créez votre premier parcours d\'apprentissage personnalisé'
            }
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Créer un parcours
          </button>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreatePathModal
          onClose={() => setShowCreateForm(false)}
          onCreate={createNewPath}
          loading={loading}
        />
      )}

      {/* Path Details Modal */}
      {selectedPath && (
        <PathDetailsModal
          path={selectedPath}
          onClose={() => setSelectedPath(null)}
        />
      )}
    </div>
  );
};

// Create Path Modal Component
const CreatePathModal = ({ onClose, onCreate, loading }) => {
  const [formData, setFormData] = useState({
    topics: '',
    difficulty: 'intermediate',
    learningStyle: 'mixed',
    timeCommitment: '5',
    goals: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const preferences = {
      topics_of_interest: formData.topics.split(',').map(t => t.trim()),
      difficulty_preference: formData.difficulty,
      learning_style: formData.learningStyle,
      time_commitment_hours: parseInt(formData.timeCommitment),
      learning_goals: formData.goals
    };

    onCreate(preferences);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Créer un nouveau parcours</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujets d'intérêt (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.topics}
              onChange={(e) => setFormData({...formData, topics: e.target.value})}
              className="input-field"
              placeholder="Ex: JavaScript, React, Node.js"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau de difficulté
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              className="input-field"
            >
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style d'apprentissage
            </label>
            <select
              value={formData.learningStyle}
              onChange={(e) => setFormData({...formData, learningStyle: e.target.value})}
              className="input-field"
            >
              <option value="visual">Visuel</option>
              <option value="auditory">Auditif</option>
              <option value="kinesthetic">Kinesthésique</option>
              <option value="mixed">Mixte</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temps disponible (heures par semaine)
            </label>
            <input
              type="number"
              value={formData.timeCommitment}
              onChange={(e) => setFormData({...formData, timeCommitment: e.target.value})}
              className="input-field"
              min="1"
              max="40"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectifs d'apprentissage
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
              className="input-field resize-none"
              rows="3"
              placeholder="Décrivez vos objectifs d'apprentissage..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Path Details Modal Component
const PathDetailsModal = ({ path, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{path.title}</h2>
            <p className="text-gray-600 mt-1">{path.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{path.modules?.length || 0}</div>
            <div className="text-sm text-gray-500">Modules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600">{path.estimated_duration}h</div>
            <div className="text-sm text-gray-500">Durée</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{path.difficulty}</div>
            <div className="text-sm text-gray-500">Niveau</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Modules du parcours</h3>
          {path.modules?.map((module, index) => (
            <div key={index} className="learning-path-item">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{module.title}</h4>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{module.duration || '2h'}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 btn-outline"
          >
            Fermer
          </button>
          <button className="flex-1 btn-primary">
            <Play className="w-5 h-5 mr-2" />
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;