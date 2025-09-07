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
  const handleLoadProject = (completeProject) => {
    try {
      
      // Convert complete backend project data to scene data format
      const sceneData = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        metadata: {
          name: completeProject.name,
          description: completeProject.description || 'Loaded from projects panel',
          created: completeProject.created_at,
          modified: completeProject.updated_at,
          loaded_from_projects: true
        },
        
        // Complete scene configuration
        scene: {
          camera: {
            position: completeProject.scene_config?.camera_position || {},
            rotation: completeProject.scene_config?.camera_rotation || {},
            type: completeProject.scene_config?.camera_type || 'perspective',
            fov: completeProject.scene_config?.camera_fov || 75.0,
            near: completeProject.scene_config?.camera_near || 0.1,
            far: completeProject.scene_config?.camera_far || 1000.0
          },
          view: {
            mode: 'solid', // Default view mode
            material: 'solid' // Default material mode
          },
          axis: 'Z', // Default axis
          background: completeProject.scene_config?.background_color || '#262626',
          ambient_light: completeProject.scene_config?.ambient_light_intensity || 1.2,
          directional_light: completeProject.scene_config?.directional_light_intensity || 3.0,
          grid_size: completeProject.scene_config?.grid_size || 10.0,
          grid_divisions: completeProject.scene_config?.grid_divisions || 10,
          floor_constraint: completeProject.scene_config?.floor_constraint_enabled !== false,
          floor_level: completeProject.scene_config?.floor_level || 0.0
        },
        
        // Convert geometries to objects format
        objects: completeProject.geometries?.map(geom => {
          // Find associated volume
          const volume = completeProject.volumes?.find(v => v.geometry === geom.id);
          
          return {
            id: geom.id,
            type: geom.geometry_type,
            name: geom.name || 'Unnamed Geometry',
            position: geom.position || { x: 0, y: 0, z: 0 },
            rotation: geom.rotation || { x: 0, y: 0, z: 0 },
            scale: geom.scale || { x: 1, y: 1, z: 1 },
            color: geom.color || '#888888',
            opacity: geom.opacity || 1.0,
            transparent: geom.transparent || false,
            geometry: {
              type: geom.geometry_type,
              parameters: geom.geometry_parameters || {}
            },
            volume: volume ? {
              name: volume.volume_name,
              type: volume.volume_type,
              composition: volume.composition,
              spectrum: volume.spectrum,
              realDensity: volume.real_density,
              tolerance: volume.tolerance,
              isSource: volume.is_source,
              gammaSelectionMode: volume.gamma_selection_mode,
              calculationMode: volume.calculation_mode
            } : null,
            userData: geom.user_data || {}
          };
        }) || [],
        
        // Convert compositions
        compositions: completeProject.compositions?.map(comp => ({
          id: comp.id,
          name: comp.name,
          density: comp.density,
          color: comp.color,
          elements: comp.elements || []
        })) || [],
        
        // Convert spectra
        spectra: completeProject.spectra?.map(spec => ({
          id: spec.id,
          name: spec.name,
          type: spec.spectrum_type,
          multiplier: spec.multiplier,
          lines: spec.lines || [],
          isotopes: spec.isotopes || []
        })) || [],
        
        // Convert sensors
        sensors: completeProject.sensors?.map(sensor => ({
          id: sensor.id,
          name: sensor.name,
          coordinates: sensor.coordinates,
          buildup_type: sensor.buildup_type,
          equi_importance: sensor.equi_importance,
          response_function: sensor.response_function
        })) || [],
        
        // Settings - Don't include componentVisibility to preserve current UI state
        settings: {
          selectedTool: 'select',
          hasObjects: (completeProject.geometries?.length || 0) > 0,
          hasSelectedObject: false
        }
      };
      
      // Load the complete scene data using the global function
      if (window.loadSceneData) {
        window.loadSceneData(sceneData);
        
        const objectCount = sceneData.objects?.length || 0;
        const compositionCount = sceneData.compositions?.length || 0;
        const spectrumCount = sceneData.spectra?.length || 0;
        const sensorCount = sceneData.sensors?.length || 0;
        
        alert(`Project "${completeProject.name}" loaded successfully!\n\nLoaded:\n- ${objectCount} objects/volumes\n- ${compositionCount} compositions\n- ${spectrumCount} spectra\n- ${sensorCount} sensors\n\nAll properties and configurations restored.`);
        
        // Close the projects panel
        setShowProjects(false);
      } else {
        console.error('loadSceneData function not available');
        alert('Failed to load project. Please try again.');
      }
      
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project. Please try again.');
    }
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
