import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Target, 
  BookOpen, 
  Users,
  MessageCircle,
  ChevronRight,
  Star,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { authService } from '../services/authService';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const weeklyProgressData = [
    { name: 'Lun', completed: 4, total: 6 },
    { name: 'Mar', completed: 3, total: 5 },
    { name: 'Mer', completed: 6, total: 8 },
    { name: 'Jeu', completed: 2, total: 4 },
    { name: 'Ven', completed: 5, total: 7 },
    { name: 'Sam', completed: 3, total: 3 },
    { name: 'Dim', completed: 1, total: 2 }
  ];

  const skillDistribution = [
    { name: 'Programmation', value: 35, color: '#3b82f6' },
    { name: 'Design', value: 25, color: '#10b981' },
    { name: 'Marketing', value: 20, color: '#f59e0b' },
    { name: 'Langues', value: 20, color: '#ef4444' }
  ];

  const userStats = stats?.user_stats || {};
  const recentActivities = stats?.recent_activities || {};

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bonjour {user?.full_name || 'Apprenant'} ! 👋
            </h1>
            <p className="text-primary-100 mb-4">
              Prêt à continuer votre parcours d'apprentissage ?
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-300 mr-1" />
                <span className="font-medium">{userStats.total_points || 0} points</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 text-yellow-300 mr-1" />
                <span className="font-medium">{userStats.badges?.length || 0} badges</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-2xl font-bold">{Math.round(userStats.completion_rate || 0)}%</div>
              <div className="text-sm text-primary-100">Progression</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Modules terminés</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.completed_modules || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps d'étude</p>
              <p className="text-2xl font-bold text-gray-900">24h</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz réussis</p>
              <p className="text-2xl font-bold text-gray-900">12/15</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rang communauté</p>
              <p className="text-2xl font-bold text-gray-900">#42</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Progression de la semaine</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#3b82f6" />
              <Bar dataKey="total" fill="#e5e7eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Répartition des compétences</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skillDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {skillDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Activités récentes</h3>
          <div className="space-y-4">
            {recentActivities.chats?.slice(0, 3).map((chat, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Session avec le mentor IA</p>
                  <p className="text-xs text-gray-500">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {recentActivities.quizzes?.slice(0, 2).map((quiz, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Quiz terminé: {quiz.topic}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-primary-600 mr-3" />
                <span className="font-medium text-primary-900">Continuer le cours</span>
              </div>
              <ChevronRight className="w-5 h-5 text-primary-600" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-secondary-600 mr-3" />
                <span className="font-medium text-secondary-900">Nouveau quiz</span>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary-600" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="font-medium text-yellow-900">Poser une question</span>
              </div>
              <ChevronRight className="w-5 h-5 text-yellow-600" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">Rejoindre la communauté</span>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Vos badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {userStats.badges?.map((badge, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{badge}</p>
            </div>
          ))}
          
          {/* Empty badges */}
          {[...Array(Math.max(0, 6 - (userStats.badges?.length || 0)))].map((_, index) => (
            <div key={index} className="text-center opacity-50">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">À débloquer</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;