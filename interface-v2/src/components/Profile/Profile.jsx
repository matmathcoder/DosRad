import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Copy, 
  Eye,
  EyeOff,
  X,
  Save,
  Download
} from 'lucide-react';
import apiService from '../../services/api';
import Projects from './Projects';
import ProfileDetails from './ProfileDetails';

export default function Profile({ user, onLogout, onClose }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Handle project loading
  const handleLoadProject = (projectId) => {
 // TODO: Implement project loading logic
  };

  // Handle profile editing
  const handleEditProfile = () => {
 // TODO: Implement profile editing logic
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };



  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };



  return (
    <>
      {/* Profile Button */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-neutral-600 hover:bg-neutral-500 rounded text-white text-sm transition-colors"
        >
          <div className="w-6 h-6 bg-neutral-500 rounded-full flex items-center justify-center text-xs font-medium">
            {getInitials(user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || user?.email)}
          </div>
          <span className="hidden sm:block text-xs">
            {user?.first_name || user?.username || 'User'}
          </span>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-neutral-700 rounded-lg shadow-xl border border-neutral-600 min-w-48 z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-neutral-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-neutral-500 rounded-full flex items-center justify-center text-sm font-medium">
                  {getInitials(user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || user?.email)}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">
                    {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
                  </div>
                  <div className="text-neutral-400 text-xs">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setShowProjects(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-white hover:bg-neutral-600 text-sm"
              >
                <FolderOpen size={16} />
                <span>My Projects</span>
              </button>

              <button
                onClick={() => {
                  setShowProfile(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-white hover:bg-neutral-600 text-sm"
              >
                <User size={16} />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  // Handle settings
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-white hover:bg-neutral-600 text-sm"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>

              <div className="border-t border-neutral-600 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-neutral-600 hover:text-red-300 text-sm"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Draggable Floating Components */}
      {showProjects && (
        <Projects 
          user={user}
          onClose={() => setShowProjects(false)}
          onLoadProject={handleLoadProject}
        />
      )}

      {showProfile && (
        <ProfileDetails 
          user={user}
          onClose={() => setShowProfile(false)}
          onEditProfile={handleEditProfile}
        />
      )}

      {/* Overlay to close dropdown */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
