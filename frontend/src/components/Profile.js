import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Award, 
  TrendingUp,
  BookOpen,
  Target,
  Edit,
  Save,
  X,
  Download
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Profile = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    learning_preferences: user?.learning_preferences || {}
  });

  const handleSave = async () => {
    try {
      // Here you would typically call an API to update user profile
      setUser({ ...user, ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const generateCertificate = () => {
    const certificateElement = document.getElementById('certificate');
    
    const options = {
      margin: 0.5,
      filename: `certificat-${user?.full_name?.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(options).from(certificateElement).save();
  };

  // Mock data for demonstration
  const stats = {
    totalPoints: 1250,
    completedCourses: 8,
    currentStreak: 12,
    totalHours: 45
  };

  const badges = [
    { name: 'Premier pas', description: 'Complété le premier cours', icon: '🎯', earned: true },
    { name: 'Studieux', description: '7 jours consécutifs', icon: '📚', earned: true },
    { name: 'Expert', description: 'Score parfait au quiz', icon: '🏆', earned: true },
    { name: 'Mentor', description: 'Aidé 5 autres apprenants', icon: '🤝', earned: false },
    { name: 'Marathonien', description: '30 jours consécutifs', icon: '🏃', earned: false },
    { name: 'Maître', description: 'Complété 20 cours', icon: '⭐', earned: false }
  ];

  const recentActivity = [
    { type: 'course', title: 'Introduction à React', date: '2024-01-15', status: 'completed' },
    { type: 'quiz', title: 'Quiz JavaScript Avancé', date: '2024-01-14', status: 'completed' },
    { type: 'forum', title: 'Discussion sur les hooks React', date: '2024-01-13', status: 'participated' },
    { type: 'mentor', title: 'Session avec le mentor IA', date: '2024-01-12', status: 'completed' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations et suivez vos progrès</p>
        </div>
        <button
          onClick={generateCertificate}
          className="btn-primary mt-4 md:mt-0"
        >
          <Download className="w-5 h-5 mr-2" />
          Télécharger certificat
        </button>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Informations personnelles</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="input-field mb-2"
                    placeholder="Nom complet"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-900">{user?.full_name}</h3>
                )}
                <p className="text-gray-600">Niveau: {user?.progress?.current_level || 'Débutant'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user?.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membre depuis</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(user?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 btn-outline"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Sauvegarder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600">Points totaux</span>
                </div>
                <span className="font-semibold text-primary-600">{stats.totalPoints}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-secondary-600" />
                  <span className="text-sm text-gray-600">Cours terminés</span>
                </div>
                <span className="font-semibold text-secondary-600">{stats.completedCourses}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Série actuelle</span>
                </div>
                <span className="font-semibold text-yellow-600">{stats.currentStreak} jours</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Heures d'étude</span>
                </div>
                <span className="font-semibold text-purple-600">{stats.totalHours}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Badges et récompenses</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`text-center p-4 rounded-lg border-2 ${
                badge.earned 
                  ? 'border-yellow-300 bg-yellow-50' 
                  : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <h4 className="font-medium text-sm">{badge.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'course' ? 'bg-blue-500' :
                  activity.type === 'quiz' ? 'bg-green-500' :
                  activity.type === 'forum' ? 'bg-purple-500' :
                  'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.type}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Certificate Template */}
      <div id="certificate" className="hidden">
        <div className="certificate-template" style={{ width: '11in', height: '8.5in', position: 'relative' }}>
          <div className="text-center" style={{ padding: '2in' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>
              Certificat de Réussite
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#6b7280' }}>
              Ceci certifie que
            </p>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#3b82f6' }}>
              {user?.full_name}
            </h2>
            <p style={{ fontSize: '1rem', marginBottom: '2rem', color: '#6b7280' }}>
              a terminé avec succès les cours sur la plateforme EduPlatform
              <br />
              et a démontré une maîtrise des compétences acquises
            </p>
            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                Délivré le {new Date().toLocaleDateString()}
              </p>
              <p style={{ fontSize: '1rem', color: '#6b7280', marginTop: '1rem' }}>
                EduPlatform - Plateforme d'apprentissage
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;