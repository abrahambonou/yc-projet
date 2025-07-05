import React from 'react';
import { Menu, Bell, BookOpen, User, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout, onMenuToggle }) => {
  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                EduPlatform
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.full_name || 'Utilisateur'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="w-4 h-4 mr-3" />
                    Mon profil
                  </a>
                  <hr className="border-gray-200" />
                  <button
                    onClick={onLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;