import React, { useState } from 'react';
import { ChevronRight, Eye, Grid3X3, Frame, HelpCircle, Circle, CircleDashed, CircleDotDashed, CircleDot, LogIn, UserPlus } from 'lucide-react';
import Login from '../Profile/Login';
import Signup from '../Profile/Signup';
import Profile from '../Profile/Profile';
import { useAuth } from '../../contexts/AuthContext';

export default function Navigation({ 
  onShowVolumeForm, 
  onAxisChange, 
  onViewModeChange, 
  onMaterialChange, 
  onToggleHelp, 
  onViewMenuAction, 
  onShowGeometryPanel,
  onSaveToComputer,
  onSaveToCloud,
  onLoadFromComputer,
  onLoadFromCloud,
  onCreateNewProject,
  onExportImage,
  onToggleComponentVisibility,
  sceneData
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  const [activeAxis, setActiveAxis] = useState('Z');
  const [materialMode, setMaterialMode] = useState('solid');
  
  // Component visibility state
  const [componentVisibility, setComponentVisibility] = useState({
    contextualHelp: false,
    helpOverlay: true,
    geometrySelector: true,
    volumeForm: false,
    rotationSliders: true,
    debugPanel: false
  });
  
  // Authentication state
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { user, login, signup, logout } = useAuth();

  const menuStructure = {
    File: [
      'Save to Computer',
      'Save to Cloud',
      'Load from Computer',
      'Load from Cloud',
      'Create New Project',
      'Export (Image)',
      'Print',
      'Quit Mercurad'
    ],
    Edit: [
      'New Volume',
      'Select Volume',
      {
        name: 'Insert',
        submenu: ['Compound Volume', 'Sensor']
      },
      'Remove'
    ],
    Inspector: [
      'Geometry',
      'Compositions',
      'Sources',
      'Sensor',
      {
        name: 'Calculation Results',
        submenu: [
          {
            name: 'Nom Config',
            submenu: ['Simple', 'Complete']
          },
          'Min Config',
          'Max Config'
        ]
      }
    ],
    Scene: [
      'Generate Scene...',
      'Start Computation'
    ],
    View: [
      'Mesh',
      'Cut Plane',
      'Hide Solid Angle Lines',
      'Add Solid Angle Lines...',
      'Normal View',
      '---',
      'Contextual Help',
      'Help Overlay',
      'Geometry Selector',
      'Volume Form',
      'Rotation Sliders',
      'Debug Panel'
    ]
  };

  const handleMenuClick = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
    setActiveSubDropdown(null);
  };

  const handleSubMenuClick = (subMenuName) => {
    setActiveSubDropdown(activeSubDropdown === subMenuName ? null : subMenuName);
  };

  const handleItemClick = (item) => {
    console.log(`Clicked: ${item}`);
    
    // Handle File menu actions
    switch (item) {
      case 'Save to Computer':
        handleSaveToComputer();
        break;
      case 'Save to Cloud':
        handleSaveToCloud();
        break;
      case 'Load from Computer':
        handleLoadFromComputer();
        break;
      case 'Load from Cloud':
        handleLoadFromCloud();
        break;
      case 'Create New Project':
        handleCreateNewProject();
        break;
      case 'Export (Image)':
        handleExportImage();
        break;
      case 'Print':
        handlePrint();
        break;
      case 'Quit Mercurad':
        handleQuit();
        break;
      case 'New Volume':
        onShowVolumeForm();
        break;
      case 'Geometry':
        if (onShowGeometryPanel) {
          onShowGeometryPanel();
        }
        break;
      default:
        // Handle View menu actions
        if (onViewMenuAction) {
          switch (item) {
            case 'Mesh':
              onViewMenuAction('toggleMesh');
              break;
            case 'Cut Plane':
              onViewMenuAction('toggleCutPlane');
              break;
            case 'Hide Solid Angle Lines':
              onViewMenuAction('hideSolidAngleLines');
              break;
            case 'Add Solid Angle Lines...':
              onViewMenuAction('addSolidAngleLines');
              break;
            case 'Normal View':
              onViewMenuAction('normalView');
              break;
          }
        }
        
        // Handle component visibility toggles
        if (item === '---') {
          return; // Don't close dropdown for separator
        }
        
        const visibilityMap = {
          'Contextual Help': 'contextualHelp',
          'Help Overlay': 'helpOverlay',
          'Geometry Selector': 'geometrySelector',
          'Volume Form': 'volumeForm',
          'Rotation Sliders': 'rotationSliders',
          'Debug Panel': 'debugPanel'
        };
        
        if (visibilityMap[item]) {
          const componentKey = visibilityMap[item];
          const newVisibility = !componentVisibility[componentKey];
          setComponentVisibility(prev => ({
            ...prev,
            [componentKey]: newVisibility
          }));
          
          if (onToggleComponentVisibility) {
            onToggleComponentVisibility(componentKey, newVisibility);
          }
          return; // Don't close dropdown for visibility toggles
        }
        break;
    }
    
    // Close dropdowns
    setActiveDropdown(null);
    setActiveSubDropdown(null);
  };

  const handleAxisClick = (axis) => {
    setActiveAxis(axis);
    console.log(`Axis changed to: ${axis}`);
    if (onAxisChange) {
      onAxisChange(axis);
    }
  };

  const handleViewModeClick = (mode) => {
    setViewMode(mode);
    console.log(`View mode changed to: ${mode}`);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const handleMaterialModeClick = (mode) => {
    setMaterialMode(mode);
    console.log(`Material mode changed to: ${mode}`);
    if (onMaterialChange) {
      onMaterialChange(mode);
    }
  };

  // Authentication handlers
  const handleLoginSuccess = async (credentials) => {
    try {
      await login(credentials);
      setShowLogin(false);
      console.log('User logged in successfully');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignupSuccess = async (userData) => {
    try {
      await signup(userData);
      setShowSignup(false);
      console.log('User signed up successfully');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  // File operation handlers
  const handleSaveToComputer = () => {
    if (sceneData) {
      const dataStr = JSON.stringify(sceneData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mercurad-scene-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Scene saved to computer:', sceneData);
    } else {
      console.error('No scene data available to save');
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    
    if (!sceneData) {
      console.error('No scene data available to save');
      return;
    }
    
    try {
      // Import the API service
      const apiService = (await import('../../services/api')).default;
      
      // Ask user for project name
      const projectName = prompt(
        'Enter a name for your project:',
        sceneData.metadata?.name || 'Untitled Project'
      );
      
      if (!projectName) return; // User cancelled
      
      // Check if project with this name already exists
      const existingProjects = await apiService.getProjects();
      const projects = existingProjects.results || existingProjects;
      const existingProject = projects.find(p => p.name === projectName);
      
      let savedProject;
      
      if (existingProject) {
        // Ask if user wants to overwrite
        const overwrite = confirm(
          `A project named "${projectName}" already exists. Do you want to overwrite it?`
        );
        
        if (!overwrite) return;
        
        // Update existing project
        const projectData = {
          name: projectName,
          description: sceneData.metadata?.description || '3D Scene with volumes and geometries',
          is_public: false,
          scene_configuration: {
            camera: sceneData.scene?.camera || {},
            view: sceneData.scene?.view || {},
            axis: sceneData.scene?.axis || 'Z'
          },
          geometries: sceneData.objects?.map(obj => ({
            geometry_type: obj.geometry?.type || obj.type,
            parameters: obj.geometry?.parameters || {},
            position: obj.position || { x: 0, y: 0, z: 0 },
            rotation: obj.rotation || { x: 0, y: 0, z: 0 },
            scale: obj.scale || { x: 1, y: 1, z: 1 },
            user_data: obj.userData || {}
          })) || [],
          volumes: sceneData.objects?.map(obj => ({
            name: obj.name || 'Unnamed Volume',
            volume_type: obj.volume?.type || 'Unknown',
            composition: obj.volume?.composition || null,
            real_density: obj.volume?.realDensity || 0,
            tolerance: obj.volume?.tolerance || 0,
            is_source: obj.volume?.isSource || false,
            calculation: obj.volume?.calculation || null,
            gamma_selection_mode: obj.volume?.gammaSelectionMode || null,
            spectrum: obj.volume?.spectrum || null
          })) || []
        };
        
        savedProject = await apiService.updateProject(existingProject.id, projectData);
        console.log('Project updated successfully:', savedProject);
        
      } else {
        // Create new project
        const projectData = {
          name: projectName,
          description: sceneData.metadata?.description || '3D Scene with volumes and geometries',
          is_public: false,
          scene_configuration: {
            camera: sceneData.scene?.camera || {},
            view: sceneData.scene?.view || {},
            axis: sceneData.scene?.axis || 'Z'
          },
          geometries: sceneData.objects?.map(obj => ({
            geometry_type: obj.geometry?.type || obj.type,
            parameters: obj.geometry?.parameters || {},
            position: obj.position || { x: 0, y: 0, z: 0 },
            rotation: obj.rotation || { x: 0, y: 0, z: 0 },
            scale: obj.scale || { x: 1, y: 1, z: 1 },
            user_data: obj.userData || {}
          })) || [],
          volumes: sceneData.objects?.map(obj => ({
            name: obj.name || 'Unnamed Volume',
            volume_type: obj.volume?.type || 'Unknown',
            composition: obj.volume?.composition || null,
            real_density: obj.volume?.realDensity || 0,
            tolerance: obj.volume?.tolerance || 0,
            is_source: obj.volume?.isSource || false,
            calculation: obj.volume?.calculation || null,
            gamma_selection_mode: obj.volume?.gammaSelectionMode || null,
            spectrum: obj.volume?.spectrum || null
          })) || []
        };
        
        console.log('Saving project to cloud:', projectData);
        savedProject = await apiService.createProject(projectData);
        console.log('Project saved successfully:', savedProject);
      }
      
      // Show success message
      alert(`Project "${savedProject.name}" saved successfully to your account!`);
      
    } catch (error) {
      console.error('Failed to save project to cloud:', error);
      alert('Failed to save project to cloud. Please try again.');
    }
  };

  const handleLoadFromComputer = () => {
    if (onLoadFromComputer) {
      onLoadFromComputer();
    } else {
      // Fallback: Create file input for loading scene data
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const sceneData = JSON.parse(event.target.result);
              console.log('Scene loaded from computer:', sceneData);
              
              // Load the scene data into the application
              if (window.loadSceneData) {
                window.loadSceneData(sceneData);
              } else {
                console.error('loadSceneData function not available');
              }
            } catch (error) {
              console.error('Failed to load scene file:', error);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  const handleLoadFromCloud = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    
    try {
      // Import the API service
      const apiService = (await import('../../services/api')).default;
      
      // Get user's projects
      const projectsResponse = await apiService.getProjects();
      const projects = projectsResponse.results || projectsResponse;
      
      if (projects.length === 0) {
        alert('No projects found in your account. Create a project first!');
        return;
      }
      
      // Show project selection dialog
      const projectNames = projects.map(p => p.name);
      const selectedProjectName = prompt(
        `Select a project to load:\n\n${projectNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\nEnter the project name:`
      );
      
      if (!selectedProjectName) return;
      
      // Find the selected project
      const selectedProject = projects.find(p => p.name === selectedProjectName);
      
      if (!selectedProject) {
        alert('Project not found!');
        return;
      }
      
      console.log('Loading project from cloud:', selectedProject);
      
      // Convert backend project data to scene data format
      const sceneData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        metadata: {
          name: selectedProject.name,
          description: selectedProject.description || 'Loaded from cloud',
          created: selectedProject.created_at,
          modified: selectedProject.updated_at
        },
        scene: {
          camera: selectedProject.scene_configuration?.camera || {},
          view: selectedProject.scene_configuration?.view || {},
          axis: selectedProject.scene_configuration?.axis || 'Z'
        },
        objects: selectedProject.geometries?.map((geom, index) => ({
          id: geom.id || Date.now() + index,
          type: geom.geometry_type,
          name: selectedProject.volumes?.[index]?.name || 'Unnamed Volume',
          position: geom.position || { x: 0, y: 0, z: 0 },
          rotation: geom.rotation || { x: 0, y: 0, z: 0 },
          scale: geom.scale || { x: 1, y: 1, z: 1 },
          geometry: {
            type: geom.geometry_type,
            parameters: geom.parameters || {}
          },
          volume: selectedProject.volumes?.[index] ? {
            name: selectedProject.volumes[index].name,
            type: selectedProject.volumes[index].volume_type,
            composition: selectedProject.volumes[index].composition,
            realDensity: selectedProject.volumes[index].real_density,
            tolerance: selectedProject.volumes[index].tolerance,
            isSource: selectedProject.volumes[index].is_source,
            calculation: selectedProject.volumes[index].calculation,
            gammaSelectionMode: selectedProject.volumes[index].gamma_selection_mode,
            spectrum: selectedProject.volumes[index].spectrum
          } : null,
          userData: geom.user_data || {}
        })) || [],
        settings: {
          componentVisibility: {
            contextualHelp: false,
            helpOverlay: true,
            geometrySelector: true,
            volumeForm: false,
            rotationSliders: true,
            debugPanel: false
          },
          selectedTool: 'select',
          hasObjects: (selectedProject.geometries?.length || 0) > 0,
          hasSelectedObject: false
        }
      };
      
      // Load the scene data
      if (window.loadSceneData) {
        window.loadSceneData(sceneData);
        alert(`Project "${selectedProject.name}" loaded successfully!`);
      } else {
        console.error('loadSceneData function not available');
        alert('Failed to load project. Please try again.');
      }
      
    } catch (error) {
      console.error('Failed to load project from cloud:', error);
      alert('Failed to load project from cloud. Please try again.');
    }
  };

  const handleCreateNewProject = () => {
    if (onCreateNewProject) {
      onCreateNewProject();
    } else {
      console.log('Creating new project...');
      // The actual new project logic would be implemented in the parent component
    }
  };

  const handleExportImage = () => {
    if (onExportImage) {
      onExportImage();
    } else {
      console.log('Exporting image...');
      // The actual export logic would be implemented in the parent component
    }
  };

  const handlePrint = () => {
    // This would print the current scene
    console.log('Printing...');
    window.print();
  };

  const handleQuit = () => {
    // This would close the application
    console.log('Quitting Mercurad...');
    // In a web app, this might just show a confirmation dialog
    if (window.confirm('Are you sure you want to quit Mercurad?')) {
      window.close();
    }
  };

  const renderMenuItem = (item, level = 0) => {
    if (typeof item === 'string') {
      // Handle separator
      if (item === '---') {
        return (
          <li key="separator" className="border-t border-neutral-600 my-1"></li>
        );
      }
      
      // Handle visibility toggle items
      const visibilityMap = {
        'Contextual Help': 'contextualHelp',
        'Help Overlay': 'helpOverlay',
        'Geometry Selector': 'geometrySelector',
        'Volume Form': 'volumeForm',
        'Rotation Sliders': 'rotationSliders',
        'Debug Panel': 'debugPanel'
      };
      
      if (visibilityMap[item]) {
        const componentKey = visibilityMap[item];
        const isVisible = componentVisibility[componentKey];
        
        return (
          <li
            key={item}
            onClick={() => handleItemClick(item)}
            className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-[13px] whitespace-nowrap flex items-center justify-between"
          >
            <span>{item}</span>
            <div className={`w-3 h-3 border border-neutral-400 rounded ${isVisible ? 'bg-neutral-400' : 'bg-transparent'}`}>
              {isVisible && (
                <div className="w-1.5 h-1.5 bg-neutral-700 rounded-sm m-0.5"></div>
              )}
            </div>
          </li>
        );
      }
      
      // Regular menu items
      return (
        <li
          key={item}
          onClick={() => handleItemClick(item)}
          className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-[13px] whitespace-nowrap"
        >
          {item}
        </li>
      );
    }

    if (typeof item === 'object' && item.submenu) {
      const isActive = activeSubDropdown === item.name;
      return (
        <li key={item.name} className="relative">
          <div
            onClick={() => handleSubMenuClick(item.name)}
            className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-sm whitespace-nowrap flex items-center justify-between"
          >
            {item.name}
            <ChevronRight size={14} className={isActive ? 'rotate-90' : ''} />
          </div>
          {isActive && (
            <ul className="absolute left-full top-0 bg-neutral-700 border border-neutral-600 rounded shadow-lg min-w-max z-50">
              {item.submenu.map((subItem) => renderMenuItem(subItem, level + 1))}
            </ul>
          )}
        </li>
      );
    }
  };

  return (
    <nav className="bg-neutral-700 w-full pointer-events-auto relative z-40">
      <div className="flex justify-between items-center">
        {/* Left side - Menu items */}
        <ul className="flex text-[13px]">
          {Object.keys(menuStructure).map((menuName) => (
            <li key={menuName} className="relative">
              <button
                onClick={() => handleMenuClick(menuName)}
                className={`px-2 sm:px-4 py-2 sm:py-3 cursor-pointer text-white ${
                  activeDropdown === menuName ? 'bg-neutral-600' : 'hover:bg-neutral-600'
                }`}
              >
                {menuName}
              </button>
              
              {activeDropdown === menuName && (
                <ul className="absolute top-full left-0 bg-neutral-700 border border-neutral-600 rounded shadow-lg min-w-max z-50">
                  {menuStructure[menuName].map((item) => renderMenuItem(item))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Right side - Axis, View Mode controls, and Authentication */}
        <div className="flex items-center space-x-1 sm:space-x-2 mr-2 sm:mr-4">
          {/* Axis Controls */}
          <div className="flex items-center space-x-1 border-l border-neutral-600 pl-2 sm:pl-3">
            <span className="text-white text-[10px] sm:text-xs mr-1 sm:mr-2">Axis:</span>
            {['X', 'Y', 'Z'].map((axis) => (
              <button
                key={axis}
                onClick={() => handleAxisClick(axis)}
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
              onClick={() => handleMaterialModeClick('solid')}
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
              onClick={() => handleMaterialModeClick('wireframe')}
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
              onClick={() => handleMaterialModeClick('transparent')}
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
              onClick={() => handleMaterialModeClick('points')}
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
              <Profile 
                user={user} 
                onLogout={handleLogout}
                onClose={() => {}}
              />
            ) : (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-1 px-2 py-1 bg-neutral-600 hover:bg-neutral-500 rounded text-white text-xs transition-colors"
                  title="Login"
                >
                  <LogIn size={14} />
                  <span className="hidden sm:inline">Login</span>
                </button>
                <button
                  onClick={() => setShowSignup(true)}
                  className="flex items-center space-x-1 px-2 py-1 bg-neutral-600 hover:bg-neutral-500 rounded text-white text-xs transition-colors"
                  title="Sign Up"
                >
                  <UserPlus size={14} />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdowns when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setActiveDropdown(null);
            setActiveSubDropdown(null);
          }}
        />
      )}

      {/* Authentication Modals */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={handleSwitchToSignup}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={handleSwitchToLogin}
          onSignupSuccess={handleSignupSuccess}
        />
      )}
    </nav>
  );
}
