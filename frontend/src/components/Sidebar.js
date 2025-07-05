import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Target, 
  MessageCircle, 
  Users, 
  User,
  X 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Tableau de bord' },
    { path: '/learning', icon: BookOpen, label: 'Parcours d\'apprentissage' },
    { path: '/assessment', icon: Target, label: 'Évaluations' },
    { path: '/mentor', icon: MessageCircle, label: 'Mentor IA' },
    { path: '/forum', icon: Users, label: 'Communauté' },
    { path: '/profile', icon: User, label: 'Mon profil' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button 
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  sidebar-item
                  ${isActive ? 'active' : ''}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              EduPlatform v1.0.0
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Alimenté par l'IA
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;