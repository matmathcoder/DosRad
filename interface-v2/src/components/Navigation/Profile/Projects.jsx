import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Copy, 
  X,
  Move,
  Minus
} from 'lucide-react';
import apiService from '../../../services/api.js';

export default function Projects({ user, onClose, onLoadProject }) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const projectsRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's projects
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError('');
    try {
      const projectsData = await apiService.getProjects();
      setProjects(projectsData.results || projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

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
    const maxX = window.innerWidth - (projectsRef.current?.offsetWidth || 400);
    const maxY = window.innerHeight - (projectsRef.current?.offsetHeight || 300);
    
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

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleProjectAction = async (action, projectId) => {
    try {
      switch (action) {
        case 'delete':
          await apiService.deleteProject(projectId);
          break;
        case 'duplicate':
          await apiService.duplicateProject(projectId);
          break;
        case 'load':
          if (onLoadProject) {
            // Load complete project data using the new API
            const completeProject = await apiService.getCompleteProject(projectId);
            onLoadProject(completeProject);
          }
          break;
      }
      fetchProjects(); // Refresh projects list
    } catch (error) {
      console.error(`Project ${action} failed:`, error);
      setError(`Failed to ${action} project`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isMinimized) {
    return (
      <div
        ref={projectsRef}
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
            <FolderOpen size={14} className="text-neutral-400" />
            <span className="text-white text-xs font-medium">Projects</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-neutral-600 rounded text-white"
              title="Maximize"
            >
              <Plus size={12} />
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
      ref={projectsRef}
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
          <FolderOpen size={16} className="text-neutral-400" />
          <span className="text-white text-sm font-medium">My Projects</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              // Handle new project creation
         }}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="New Project"
          >
            <Plus size={16} />
          </button>
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
      <div className="p-4 max-h-[60vh] overflow-y-auto">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-neutral-400 py-8">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">
            No projects found. Create your first project!
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-neutral-600 rounded-lg p-3 border border-neutral-500"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white text-sm font-medium">{project.name}</h3>
                    <p className="text-neutral-400 text-xs mt-1">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-400">
                      <span>Created: {formatDate(project.created_at)}</span>
                      <span>Updated: {formatDate(project.updated_at)}</span>
                      <span>{project.geometries_count || 0} objects</span>
                      <span>{project.volumes_count || 0} volumes</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleProjectAction('load', project.id)}
                      className="p-1 hover:bg-neutral-500 rounded text-neutral-300 hover:text-white"
                      title="Load Project"
                    >
                      <FolderOpen size={14} />
                    </button>
                    <button
                      onClick={() => handleProjectAction('duplicate', project.id)}
                      className="p-1 hover:bg-neutral-500 rounded text-neutral-300 hover:text-white"
                      title="Duplicate Project"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleProjectAction('delete', project.id)}
                      className="p-1 hover:bg-red-600 rounded text-neutral-300 hover:text-red-300"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
