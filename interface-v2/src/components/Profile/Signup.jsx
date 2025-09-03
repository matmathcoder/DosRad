import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, UserPlus, Move } from 'lucide-react';
import apiService from '../../services/api';

export default function Signup({ onClose, onSwitchToLogin, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dragging state - Start in center of screen
  const [position, setPosition] = useState({ 
    x: window.innerWidth / 2 - 200,  // Center horizontally
    y: window.innerHeight / 2 - 200  // Center vertically
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const signupRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      onSignupSuccess(formData);
    } catch (error) {
      console.error('Signup failed:', error);
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dragging functions
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within screen bounds with margins
    const margin = 20;
    const panelWidth = 400; // max-w-md = 400px
    const panelHeight = 500; // approximate panel height
    const maxX = window.innerWidth - panelWidth - margin;
    const maxY = window.innerHeight - panelHeight - margin;
    
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Prevent keyboard events from bubbling to the scene
  const handleKeyDown = (e) => {
    e.stopPropagation();
  };

  const handleKeyUp = (e) => {
    e.stopPropagation();
  };

  const handleKeyPress = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      ref={signupRef}
      className="bg-neutral-700 rounded-lg shadow-xl w-full max-w-md pointer-events-auto absolute z-50 max-h-[90vh] overflow-y-auto"
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
        <div className="flex items-center justify-between bg-neutral-800 rounded-t-lg px-4 py-3 sticky top-0 drag-handle cursor-grab">
          <div className="flex items-center space-x-2">
            <Move size={12} className="text-neutral-400" />
            <UserPlus size={16} className="text-neutral-400" />
            <span className="text-white text-sm font-medium">Sign Up</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4" onKeyDown={handleKeyDown}>
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-white text-xs font-medium mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onKeyPress={handleKeyPress}
              required
              className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              placeholder="Enter your email"
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-white text-xs font-medium mb-1">
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onKeyPress={handleKeyPress}
              required
              className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              placeholder="Choose a username"
            />
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-white text-xs font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              placeholder="Enter your first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-white text-xs font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
              placeholder="Enter your last name"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-white text-xs font-medium mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onKeyPress={handleKeyPress}
                required
                minLength={8}
                className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-400 pr-10"
                placeholder="Create a password (min 8 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="password_confirm" className="block text-white text-xs font-medium mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onKeyPress={handleKeyPress}
                required
                className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-400 pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>

          {/* Switch to Login */}
          <div className="text-center">
            <span className="text-neutral-400 text-xs">Already have an account? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-neutral-300 hover:text-white text-xs font-medium underline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
  );
}
