import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, LogIn, Move } from 'lucide-react';
import apiService from '../../../services/api';

export default function Login({ onClose, onSwitchToSignup, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dragging state - Start in center of screen
  const [position, setPosition] = useState({ 
    x: window.innerWidth / 2 - 200,  // Center horizontally
    y: window.innerHeight / 2 - 150  // Center vertically
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const loginRef = useRef();

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

    try {
      onLoginSuccess(formData);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
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
    const panelHeight = 300; // approximate panel height
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
      ref={loginRef}
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
        <div className="flex items-center justify-between bg-neutral-800 rounded-t-lg px-4 py-3 drag-handle cursor-grab">
          <div className="flex items-center space-x-2">
            <Move size={12} className="text-neutral-400" />
            <LogIn size={16} className="text-neutral-400" />
            <span className="text-white text-sm font-medium">Login</span>
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
              Email
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

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-white text-xs font-medium mb-1">
              Password
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
                className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-400 pr-10"
                placeholder="Enter your password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          {/* Switch to Signup */}
          <div className="text-center">
            <span className="text-neutral-400 text-xs">Don't have an account? </span>
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-neutral-300 hover:text-white text-xs font-medium underline"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
  );
}
