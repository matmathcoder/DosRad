import React, { useState, useRef } from 'react';
import { 
  User, 
  X,
  Move,
  Edit,
  Minus
} from 'lucide-react';

export default function ProfileDetails({ user, onClose, onEditProfile }) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const profileRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return; // Don't drag if clicking on buttons
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within screen bounds
    const maxX = window.innerWidth - (profileRef.current?.offsetWidth || 400);
    const maxY = window.innerHeight - (profileRef.current?.offsetHeight || 300);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
  };

  const handleKeyUp = (e) => {
    e.stopPropagation();
  };

  const handleKeyPress = (e) => {
    e.stopPropagation();
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isMinimized) {
    return (
      <div
        ref={profileRef}
        className="bg-neutral-700 rounded-lg shadow-xl w-48 pointer-events-auto absolute z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onKeyPress={handleKeyPress}
      >
        <div className="flex items-center justify-between bg-neutral-800 rounded-t-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <Move size={14} className="text-neutral-400 cursor-grab" />
            <User size={14} className="text-neutral-400" />
            <span className="text-white text-xs font-medium">Profile</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-neutral-600 rounded text-white"
              title="Maximize"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-600 rounded text-white"
              title="Close"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={profileRef}
      className="bg-neutral-700 rounded-lg shadow-xl w-full max-w-md pointer-events-auto absolute z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onKeyPress={handleKeyPress}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-800 rounded-t-lg px-4 py-3">
        <div className="flex items-center space-x-2">
          <Move size={14} className="text-neutral-400 cursor-grab" />
          <User size={16} className="text-neutral-400" />
          <span className="text-white text-sm font-medium">Profile</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Minimize"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-neutral-500 rounded-full flex items-center justify-center text-lg font-medium mx-auto mb-3">
            {getInitials(user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || user?.email)}
          </div>
          <h2 className="text-white text-lg font-medium">
            {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}
          </h2>
          <p className="text-neutral-400 text-sm">{user?.email}</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-white text-xs font-medium mb-1">Username</label>
            <div className="px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm">
              {user?.username}
            </div>
          </div>

          <div>
            <label className="block text-white text-xs font-medium mb-1">Email</label>
            <div className="px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm">
              {user?.email}
            </div>
          </div>

          {user?.bio && (
            <div>
              <label className="block text-white text-xs font-medium mb-1">Bio</label>
              <div className="px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm">
                {user.bio}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Member since: {formatDate(user?.created_at)}</span>
            <span className={user?.is_verified ? 'text-green-400' : 'text-yellow-400'}>
              {user?.is_verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => {
              if (onEditProfile) {
                onEditProfile();
              }
              console.log('Edit profile');
            }}
            className="flex-1 bg-neutral-600 hover:bg-neutral-500 text-white py-2 px-4 rounded text-sm font-medium"
          >
            Edit Profile
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-neutral-600 hover:bg-neutral-500 text-white py-2 px-4 rounded text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
