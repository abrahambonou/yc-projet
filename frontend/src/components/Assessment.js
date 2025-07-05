import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award, 
  RefreshCw,
  Brain,
  TrendingUp,
  Play,
  Plus
} from 'lucide-react';
import { authService } from '../services/authService';

const Assessment = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Timer for quiz
    if (currentQuiz && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuiz) {
      handleSubmitQuiz();
    }
  }, [timeLeft, currentQuiz]);

  const generateQuiz = async (topic, difficulty, numQuestions) => {
    try {
      setLoading(true);
      const quiz = await authService.generateQuiz(topic, difficulty, numQuestions);
      setQuizzes([...quizzes, quiz]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
    setTimeLeft(quiz.time_limit || 300); // 5 minutes default
  };

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    setTimeLeft(0);
  };

  const calculateScore = () => {
    if (!currentQuiz || !answers.length) return 0;
    
    const correctAnswers = currentQuiz.questions.filter((question, index) => {
      return answers[index] === question.correct_answer;
    }).length;
    
    return Math.round((correctAnswers / currentQuiz.questions.length) * 100);
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentQuiz && !showResults) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{currentQuiz.topic}</h2>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} sur {currentQuiz.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">Temps restant</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`quiz-option w-full text-left ${
                  answers[currentQuestionIndex] === index ? 'selected' : ''
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={resetQuiz}
              className="btn-outline"
            >
              Abandonner
            </button>
            <button
              onClick={nextQuestion}
              disabled={answers[currentQuestionIndex] === undefined}
              className="btn-primary"
            >
              {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && currentQuiz) {
    const score = calculateScore();
    const passed = score >= currentQuiz.passing_score;
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="card mb-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Félicitations !' : 'Continuez vos efforts !'}
          </h2>
          <p className="text-gray-600 mb-4">
            Vous avez obtenu {score}% ({calculateScore() * currentQuiz.questions.length / 100} bonnes réponses sur {currentQuiz.questions.length})
          </p>
          
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{score}%</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-600">{currentQuiz.passing_score}%</div>
              <div className="text-sm text-gray-500">Seuil</div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Résultats détaillés</h3>
          
          <div className="space-y-4">
            {currentQuiz.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correct_answer;
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{question.question}</h4>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-1" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`quiz-option text-sm ${
                          optionIndex === question.correct_answer ? 'correct' :
                          optionIndex === userAnswer && !isCorrect ? 'incorrect' : ''
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Explication:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={resetQuiz}
            className="btn-outline"
          >
            Retour aux quiz
          </button>
          <button
            onClick={() => startQuiz(currentQuiz)}
            className="btn-primary"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Évaluations</h1>
          <p className="text-gray-600 mt-1">Testez vos connaissances avec des quiz générés par l'IA</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary mt-4 md:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau quiz
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz terminés</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score moyen</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps total</p>
              <p className="text-2xl font-bold text-gray-900">12h</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Vos quiz</h3>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun quiz créé</h4>
            <p className="text-gray-600 mb-4">Créez votre premier quiz personnalisé</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{quiz.topic}</h4>
                    <p className="text-sm text-gray-600">{quiz.questions.length} questions</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                    quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {quiz.difficulty}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {quiz.time_limit ? `${Math.floor(quiz.time_limit / 60)} min` : '5 min'}
                  </div>
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="btn-primary text-sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Commencer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Quiz Modal */}
      {showCreateForm && (
        <CreateQuizModal
          onClose={() => setShowCreateForm(false)}
          onCreate={generateQuiz}
          loading={loading}
        />
      )}
    </div>
  );
};

// Create Quiz Modal Component
const CreateQuizModal = ({ onClose, onCreate, loading }) => {
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'intermediate',
    numQuestions: 5
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData.topic, formData.difficulty, formData.numQuestions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Créer un nouveau quiz</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet du quiz
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              className="input-field"
              placeholder="Ex: JavaScript, Histoire, Mathématiques"
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
              Nombre de questions
            </label>
            <select
              value={formData.numQuestions}
              onChange={(e) => setFormData({...formData, numQuestions: parseInt(e.target.value)})}
              className="input-field"
            >
              <option value={5}>5 questions</option>
              <option value={10}>10 questions</option>
              <option value={15}>15 questions</option>
              <option value={20}>20 questions</option>
            </select>
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

export default Assessment;