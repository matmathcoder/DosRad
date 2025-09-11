import React from 'react';
import { Circle, CircleDashed, CircleDotDashed, CircleDot } from 'lucide-react';

/**
 * Navigation Controls Component
 * Renders axis controls, material mode controls, and authentication controls
 */
export default function NavigationControls({
  activeAxis,
  materialMode,
  user,
  onAxisClick,
  onMaterialModeClick,
  onShowLogin,
  onShowSignup,
  onLogout,
  ProfileComponent,
  setCurrentProjectId
}) {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2 mr-2 sm:mr-4">
      {/* Axis Controls */}
      <div className="flex items-center space-x-1 border-l border-neutral-600 pl-2 sm:pl-3">
        <span className="text-white text-[10px] sm:text-xs mr-1 sm:mr-2">Axis:</span>
        {['X', 'Y', 'Z'].map((axis) => (
          <button
            key={axis}
            onClick={() => onAxisClick(axis)}
            className={`px-1 sm:px-2 py-1 text-[10px] sm:text-xs font-medium rounded ${
              activeAxis === axis
                ? 'bg-neutral-400 text-black'
                : 'bg-neutral-600 text-white hover:bg-neutral-500'
            }`}
          >
            {axis}
          </button>
        ))}
      </div>

      {/* Material Mode Controls */}
      <div className="flex items-center space-x-1 border-l border-neutral-600 pl-3 mr-20">
        <span className="text-white text-xs mr-2">Material:</span>
        <button
          onClick={() => onMaterialModeClick('solid')}
          className={`p-1 rounded ${
            materialMode === 'solid'
              ? 'bg-neutral-400 text-black'
              : 'text-white hover:bg-neutral-600'
          }`}
          title="Solid Material"
        >
          <Circle size={16} />
        </button>
        <button
          onClick={() => onMaterialModeClick('wireframe')}
          className={`p-1 rounded ${
            materialMode === 'wireframe'
              ? 'bg-neutral-400 text-black'
              : 'text-white hover:bg-neutral-600'
          }`}
          title="Wireframe Material"
        >
          <CircleDashed size={16} />
        </button>
        <button
          onClick={() => onMaterialModeClick('transparent')}
          className={`p-1 rounded ${
            materialMode === 'transparent'
              ? 'bg-neutral-400 text-black'
              : 'text-white hover:bg-neutral-600'
          }`}
          title="Transparent Material"
        >
          <CircleDotDashed size={16} />
        </button>
        <button
          onClick={() => onMaterialModeClick('points')}
          className={`p-1 rounded ${
            materialMode === 'points'
              ? 'bg-neutral-400 text-black'
              : 'text-white hover:bg-neutral-600'
          }`}
          title="Points Material"
        >
          <CircleDot size={16} />
        </button>
      </div>

      {/* Authentication Controls */}
      <div className="flex items-center space-x-1 border-l border-neutral-600 pl-3">
        {user ? (
          <ProfileComponent 
            user={user} 
            onLogout={onLogout}
            onClose={() => {}}
            setCurrentProjectId={setCurrentProjectId}
          />
        ) : (
          <>
            <button
              onClick={onShowLogin}
              className="flex items-center space-x-1 px-2 py-1 bg-neutral-600 hover:bg-neutral-500 rounded text-white text-xs transition-colors"
              title="Login"
            >
              <span className="hidden sm:inline">Login</span>
            </button>
            <button
              onClick={onShowSignup}
              className="flex items-center space-x-1 px-2 py-1 bg-neutral-600 hover:bg-neutral-500 rounded text-white text-xs transition-colors"
              title="Sign Up"
            >
              <span className="hidden sm:inline">Sign Up</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
