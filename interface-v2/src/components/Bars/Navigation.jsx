import React, { useState } from 'react';
import { ChevronRight, Eye, Grid3X3, Frame, HelpCircle, Circle, CircleDashed, CircleDotDashed, CircleDot, LogIn, UserPlus, Laptop, Cloud, HardDriveUpload, CloudUpload, CirclePlus, Image, FileBox, Printer } from 'lucide-react';
import Login from '../Profile/Login';
import Signup from '../Profile/Signup';
import Profile from '../Profile/Profile';
import { useAuth } from '../../contexts/AuthContext';
import { exportMultipleObjectsToOBJ, downloadOBJ } from '../../utils/objExporter';
import MeshPanel from '../Navigation/Edit/VolumeForm/MeshPanel';
import ComputationPanel from '../Navigation/Scene/ComputationPanel';
import GenerateScenePanel from '../Navigation/Scene/GenerateScenePanel';
import CompositionsInspectorPanel from '../Navigation/Inspector/CompositionsInspectorPanel';
import SourcesInspectorPanel from '../Navigation/Inspector/SourcesInspectorPanel';
import SensorsInspectorPanel from '../Navigation/Inspector/SensorsInspectorPanel';
import CompositionPanel from '../Navigation/Edit/VolumeForm/CompositionPanel';
import SensorPanel from '../Navigation/Edit/Insert/SensorPanel';
import CompoundVolume from '../Navigation/Edit/Insert/CompoundVolume';

export default function Navigation({ 
  onShowVolumeForm, 
  onAxisChange, 
  onViewModeChange, 
  onMaterialChange, 
  onToggleHelp, 
  onViewMenuAction, 
  onShowGeometryPanel,
  onShowSensorPanel,
  onShowCompoundVolume,
  onShowPhysicsPanel,
  onSaveToComputer,
  onSaveToCloud,
  onLoadFromComputer,
  onLoadFromCloud,
  onCreateNewProject,
  onExportImage,
  onToggleComponentVisibility,
  sceneData,
  selectedVolume,
  onMeshValidate,
  onComputationComplete,
  onSceneGenerated,
  // Inspector panel props
  onShowCompositionsInspector,
  onShowSourcesInspector,
  onShowSensorsInspector,
  compositions = [],
  sources = [],
  sensors = [],
  // Creation panel props
  onShowCompositionPanel,
  existingCompositions = [],
  existingSensors = []
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
    sensorPanel: false,
    compoundVolume: false,
    directory: true,
    rotationSliders: false,
    debugPanel: false
  });
  
  // Authentication state
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { user, login, signup, logout } = useAuth();

  // Panel visibility states
  const [showMeshPanel, setShowMeshPanel] = useState(false);
  const [showComputationPanel, setShowComputationPanel] = useState(false);
  const [showGenerateScenePanel, setShowGenerateScenePanel] = useState(false);
  
  // Inspector panel visibility states
  const [showCompositionsInspector, setShowCompositionsInspector] = useState(false);
  const [showSourcesInspector, setShowSourcesInspector] = useState(false);
  const [showSensorsInspector, setShowSensorsInspector] = useState(false);
  
  // Creation panel visibility states
  const [showCompositionPanel, setShowCompositionPanel] = useState(false);
  const [showSensorPanel, setShowSensorPanel] = useState(false);
  const [showCompoundVolume, setShowCompoundVolume] = useState(false);

  const menuStructure = {
    File: [
      'Save to Computer',
      'Save to Cloud',
      'Load from Computer',
      'Load from Cloud',
      'Create New Project',
      'Export (Image)',
      'Export (OBJ)',
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
      'Start Computation',
      'Physics Simulation'
    ],
    Mesh: [
      'Configure Mesh...'
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
      'Sensor Panel',
      'Compound Volume',
      'Directory',
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
      case 'Export (OBJ)':
        handleExportOBJ();
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
      case 'Sensor':
        setShowSensorsInspector(true);
        break;
      case 'Compound Volume':
        if (onShowCompoundVolume) {
          onShowCompoundVolume();
        }
        break;
      case 'Generate Scene...':
        setShowGenerateScenePanel(true);
        break;
      case 'Start Computation':
        setShowComputationPanel(true);
        break;
      case 'Physics Simulation':
        if (onShowPhysicsPanel) {
          onShowPhysicsPanel();
        }
        break;
      case 'Configure Mesh...':
        setShowMeshPanel(true);
        break;
      case 'Compositions':
        setShowCompositionsInspector(true);
        break;
      case 'Sources':
        setShowSourcesInspector(true);
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
          'Sensor Panel': 'sensorPanel',
          'Compound Volume': 'compoundVolume',
          'Directory': 'directory',
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
    if (onAxisChange) {
      onAxisChange(axis);
    }
  };

  const handleViewModeClick = (mode) => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const handleMaterialModeClick = (mode) => {
    setMaterialMode(mode);
    if (onMaterialChange) {
      onMaterialChange(mode);
    }
  };

  // Authentication handlers
  const handleLoginSuccess = async (credentials) => {
    try {
      await login(credentials);
      setShowLogin(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignupSuccess = async (userData) => {
    try {
      await signup(userData);
      setShowSignup(false);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
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
      // Create comprehensive scene data with all components
      const completeSceneData = {
        ...sceneData,
        
        // Ensure all components are included
        metadata: {
          ...sceneData.metadata,
          saved_at: new Date().toISOString(),
          version: '2.0.0',
          description: sceneData.metadata?.description || 'Complete Mercurad scene with all objects, compositions, sources, spectra, and sensors'
        },
        
        // Include complete scene configuration
        scene: {
          ...sceneData.scene,
          camera: sceneData.scene?.camera || {},
          view: sceneData.scene?.view || {},
          axis: sceneData.scene?.axis || 'Z',
          background: sceneData.scene?.background || '#262626',
          ambient_light: sceneData.scene?.ambient_light || 1.2,
          directional_light: sceneData.scene?.directional_light || 3.0,
          grid_size: sceneData.scene?.grid_size || 10.0,
          grid_divisions: sceneData.scene?.grid_divisions || 10,
          floor_constraint: sceneData.scene?.floor_constraint !== false,
          floor_level: sceneData.scene?.floor_level || 0.0
        },
        
        // Include all objects with complete properties
        objects: sceneData.objects?.map(obj => ({
          ...obj,
          // Ensure all geometry properties are preserved
          geometry: {
            ...obj.geometry,
            type: obj.geometry?.type || obj.type,
            parameters: obj.geometry?.parameters || {},
            // Preserve any additional geometry data
            ...obj.geometry
          },
          // Ensure all volume properties are preserved
          volume: {
            ...obj.volume,
            type: obj.volume?.type || 'solid',
            composition: obj.volume?.composition || null,
            spectrum: obj.volume?.spectrum || null,
            realDensity: obj.volume?.realDensity || null,
            tolerance: obj.volume?.tolerance || null,
            isSource: obj.volume?.isSource || false,
            gammaSelectionMode: obj.volume?.gammaSelectionMode || 'by-lines',
            calculationMode: obj.volume?.calculationMode || 'by-lines',
            // Preserve any additional volume data
            ...obj.volume
          },
          // Preserve all position, rotation, scale data
          position: obj.position || { x: 0, y: 0, z: 0 },
          rotation: obj.rotation || { x: 0, y: 0, z: 0 },
          scale: obj.scale || { x: 1, y: 1, z: 1 },
          // Preserve all user data
          userData: obj.userData || {},
          // Preserve all other properties
          ...obj
        })) || [],
        
        // Include all compositions with complete properties
        compositions: sceneData.compositions?.map(comp => ({
          ...comp,
          name: comp.name || 'Unnamed Composition',
          density: comp.density || 1.0,
          color: comp.color || '#888888',
          elements: comp.elements || [],
          // Preserve any additional composition data
          ...comp
        })) || [],
        
        // Include all spectra with complete properties
        spectra: sceneData.spectra?.map(spec => ({
          ...spec,
          name: spec.name || 'Unnamed Spectrum',
          type: spec.type || 'line',
          multiplier: spec.multiplier || 1.0,
          lines: spec.lines || [],
          isotopes: spec.isotopes || [],
          // Preserve any additional spectrum data
          ...spec
        })) || [],
        
        // Include all sensors with complete properties
        sensors: sceneData.sensors?.map(sensor => ({
          ...sensor,
          name: sensor.name || 'SENSOR1',
          coordinates: sensor.coordinates || { x: 0, y: 0, z: 0 },
          buildup_type: sensor.buildup_type || 'automatic',
          equi_importance: sensor.equi_importance || false,
          response_function: sensor.response_function || 'ambient_dose',
          // Preserve any additional sensor data
          ...sensor
        })) || [],
        
        // Include settings but preserve current UI state
        settings: {
          ...sceneData.settings,
          selectedTool: sceneData.settings?.selectedTool || 'select',
          hasObjects: (sceneData.objects?.length || 0) > 0,
          hasSelectedObject: sceneData.settings?.hasSelectedObject || false
        }
      };
      
      const dataStr = JSON.stringify(completeSceneData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mercurad-complete-scene-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      
      // Show success message with details
      const objectCount = completeSceneData.objects?.length || 0;
      const compositionCount = completeSceneData.compositions?.length || 0;
      const spectrumCount = completeSceneData.spectra?.length || 0;
      const sensorCount = completeSceneData.sensors?.length || 0;
      
      alert(`Complete scene saved to computer!\n\nSaved:\n- ${objectCount} objects/volumes\n- ${compositionCount} compositions\n- ${spectrumCount} spectra\n- ${sensorCount} sensors\n\nAll properties, positions, and configurations preserved.`);
      
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
      
      // Prepare complete project data with all scene components
      const completeProjectData = {
        name: projectName,
        description: sceneData.metadata?.description || '3D Scene with volumes and geometries',
        is_public: false,
        
        // Scene configuration
        scene_configuration: {
          camera: sceneData.scene?.camera || {},
          view: sceneData.scene?.view || {},
          axis: sceneData.scene?.axis || 'Z',
          background: sceneData.scene?.background || '#262626',
          ambient_light: sceneData.scene?.ambient_light || 1.2,
          directional_light: sceneData.scene?.directional_light || 3.0,
          grid_size: sceneData.scene?.grid_size || 10.0,
          grid_divisions: sceneData.scene?.grid_divisions || 10,
          floor_constraint: sceneData.scene?.floor_constraint !== false,
          floor_level: sceneData.scene?.floor_level || 0.0
        },
        
        // Complete geometries data
        geometries: sceneData.objects?.map(obj => ({
          id: obj.id,
          name: obj.name || 'Unnamed Geometry',
          type: obj.geometry?.type || obj.type,
          position: obj.position || { x: 0, y: 0, z: 0 },
          rotation: obj.rotation || { x: 0, y: 0, z: 0 },
          scale: obj.scale || { x: 1, y: 1, z: 1 },
          color: obj.color || '#888888',
          opacity: obj.opacity || 1.0,
          transparent: obj.transparent || false,
          parameters: obj.geometry?.parameters || {},
          userData: obj.userData || {}
        })) || [],
        
        // Complete compositions data
        compositions: sceneData.compositions?.map(comp => ({
          id: comp.id,
          name: comp.name,
          density: comp.density,
          color: comp.color,
          elements: comp.elements || []
        })) || [],
        
        // Complete spectra data
        spectra: sceneData.spectra?.map(spec => ({
          id: spec.id,
          name: spec.name,
          type: spec.type,
          multiplier: spec.multiplier || 1.0,
          lines: spec.lines || [],
          isotopes: spec.isotopes || []
        })) || [],
        
        // Complete sensors data
        sensors: sceneData.sensors?.map(sensor => ({
          id: sensor.id,
          name: sensor.name,
          coordinates: sensor.coordinates,
          buildup_type: sensor.buildup_type || 'automatic',
          equi_importance: sensor.equi_importance || false,
          response_function: sensor.response_function || 'ambient_dose'
        })) || [],
        
        // Complete volumes data (linking geometries, compositions, spectra)
        volumes: sceneData.objects?.map(obj => ({
          id: obj.id,
          name: obj.name || 'Unnamed Volume',
          type: obj.volume?.type || 'solid',
          geometry_id: obj.id, // Link to geometry
          composition_id: obj.volume?.composition?.id || null,
          spectrum_id: obj.volume?.spectrum?.id || null,
          real_density: obj.volume?.realDensity || null,
          tolerance: obj.volume?.tolerance || null,
          is_source: obj.volume?.isSource || false,
          gamma_selection_mode: obj.volume?.gammaSelectionMode || 'by-lines',
          calculation_mode: obj.volume?.calculationMode || 'by-lines'
        })) || [],
        
        // Additional metadata
        metadata: sceneData.metadata || {},
        settings: sceneData.settings || {}
      };
      
      let savedProject;
      
      if (existingProject) {
        // Ask if user wants to overwrite
        const overwrite = confirm(
          `A project named "${projectName}" already exists. Do you want to overwrite it?`
        );
        
        if (!overwrite) return;
        
        // Update existing project using complete project API
        savedProject = await apiService.updateCompleteProject(existingProject.id, completeProjectData);
        
      } else {
        // Create new project using complete project API
        savedProject = await apiService.createCompleteProject(completeProjectData);
      }
      
      // Show success message
      alert(`Project "${savedProject.name}" saved successfully to your account!\n\nSaved:\n- ${savedProject.geometries?.length || 0} geometries\n- ${savedProject.compositions?.length || 0} compositions\n- ${savedProject.spectra?.length || 0} spectra\n- ${savedProject.sensors?.length || 0} sensors\n- ${savedProject.volumes?.length || 0} volumes`);
      
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

  const handleExportOBJ = () => {
    try {
      // Get all geometries from the 3D scene
      const geometries = window.getAllGeometries ? window.getAllGeometries() : [];
      
      if (geometries.length === 0) {
        alert('No objects to export. Please create some objects first.');
        return;
      }
      
      // Export all objects as a single OBJ file
      const objContent = exportMultipleObjectsToOBJ(geometries, 'mercurad-scene.obj');
      const filename = `mercurad-scene-${new Date().toISOString().split('T')[0]}.obj`;
      
      downloadOBJ(objContent, filename);
      
    } catch (error) {
      console.error('Error exporting OBJ:', error);
      alert('Error exporting OBJ file. Please try again.');
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
      
      
      // Load complete project data using the new API
      const completeProject = await apiService.getCompleteProject(selectedProject.id);
      
      // Convert complete backend project data to scene data format
      const sceneData = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        metadata: {
          name: completeProject.name,
          description: completeProject.description || 'Loaded from cloud',
          created: completeProject.created_at,
          modified: completeProject.updated_at,
          loaded_from_cloud: true
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
      
      // Load the complete scene data
      if (window.loadSceneData) {
        window.loadSceneData(sceneData);
        
        const objectCount = sceneData.objects?.length || 0;
        const compositionCount = sceneData.compositions?.length || 0;
        const spectrumCount = sceneData.spectra?.length || 0;
        const sensorCount = sceneData.sensors?.length || 0;
        
        alert(`Project "${completeProject.name}" loaded successfully!\n\nLoaded:\n- ${objectCount} objects/volumes\n- ${compositionCount} compositions\n- ${spectrumCount} spectra\n- ${sensorCount} sensors\n\nAll properties and configurations restored.`);
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
      // The actual new project logic would be implemented in the parent component
    }
  };

  const handleExportImage = () => {
    if (onExportImage) {
      onExportImage();
    } else {
      // The actual export logic would be implemented in the parent component
    }
  };

  const handlePrint = () => {
    
    // Get the Three.js canvas element
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.error('No 3D canvas found to print');
      alert('No 3D scene found to print');
      return;
    }
    
    // Get current scene data for context
    const sceneInfo = sceneData ? {
      name: sceneData.metadata?.name || 'Untitled Scene',
      description: sceneData.metadata?.description || '3D Radiation Simulation Scene',
      objects: sceneData.objects?.length || 0,
      sensors: sceneData.sensors?.length || 0,
      timestamp: new Date().toLocaleString()
    } : {
      name: 'Current Scene',
      description: '3D Radiation Simulation Scene',
      objects: 0,
      sensors: 0,
      timestamp: new Date().toLocaleString()
    };
    
    // First, capture the canvas as an image
    try {
      // Convert canvas to data URL with high quality
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        alert('Please allow popups to print the scene');
        return;
      }
      
      // Create print content with the image embedded
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mercurad Scene Print - ${sceneInfo.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: white;
              color: black;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .scene-info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .scene-info h3 {
              margin-top: 0;
              color: #333;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 10px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              border-bottom: 1px solid #ddd;
            }
            .info-label {
              font-weight: bold;
            }
            .scene-canvas {
              text-align: center;
              margin: 20px 0;
              border: 1px solid #ccc;
              padding: 10px;
              background: white;
            }
            .scene-canvas img {
              max-width: 100%;
              height: auto;
              border: 1px solid #999;
              display: block;
              margin: 0 auto;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .scene-canvas { page-break-inside: avoid; }
              .scene-canvas img { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mercurad 3D Scene</h1>
            <h2>${sceneInfo.name}</h2>
          </div>
          
          <div class="scene-info">
            <h3>Scene Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Scene Name:</span>
                <span>${sceneInfo.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Description:</span>
                <span>${sceneInfo.description}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Objects:</span>
                <span>${sceneInfo.objects}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Sensors:</span>
                <span>${sceneInfo.sensors}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Generated:</span>
                <span>${sceneInfo.timestamp}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Software:</span>
                <span>Mercurad v2.0</span>
              </div>
            </div>
          </div>
          
          <div class="scene-canvas">
            <h3>3D Scene View</h3>
            <img src="${dataURL}" alt="3D Scene View" />
          </div>
          
          <div class="footer">
            <p>Generated by Mercurad - 3D Radiation Simulation Software</p>
            <p>For technical support, contact your system administrator</p>
          </div>
        </body>
        </html>
      `);
      
      // Close the document and trigger print
      printWindow.document.close();
      
      // Wait a moment for the image to load, then print
      setTimeout(() => {
        printWindow.print();
        // Keep the window open for a moment so user can see the preview
        setTimeout(() => {
          printWindow.close();
        }, 2000);
      }, 500);
      
    } catch (error) {
      console.error('Error capturing canvas:', error);
      alert('Error capturing the 3D scene. Please try again.');
    }
  };

  const handleQuit = () => {
    // This would close the application
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
        'Directory': 'directory',
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
      
      // File menu items with icons
      const fileMenuIcons = {
        'Save to Computer': Laptop,
        'Save to Cloud': Cloud,
        'Load from Computer': HardDriveUpload,
        'Load from Cloud': CloudUpload,
        'Create New Project': CirclePlus,
        'Export (Image)': Image,
        'Export (OBJ)': FileBox,
        'Print': Printer
      };
      
      const IconComponent = fileMenuIcons[item];
      
      // Regular menu items
      return (
        <li
          key={item}
          onClick={() => handleItemClick(item)}
          className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-[13px] whitespace-nowrap flex items-center space-x-2"
        >
          {IconComponent && <IconComponent size={14} className="text-neutral-400" />}
          <span>{item}</span>
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
        {/* Left side - Logo and Menu items */}
        <div className="flex items-center">
          {/* INVAP Logo */}
          <div className="flex items-center mr-4">
            <img 
              src="/INVAP.webp" 
              alt="INVAP Logo" 
              className="absolute left-0 w-24 h-20 object-contain"
            />
          </div>
          
          {/* Menu items */}
          <ul className="flex text-[13px] ml-20">
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
        </div>

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

      {/* Mesh Panel */}
      {showMeshPanel && (
        <MeshPanel
          isVisible={showMeshPanel}
          onClose={() => setShowMeshPanel(false)}
          selectedVolume={selectedVolume}
          onMeshValidate={onMeshValidate}
        />
      )}

      {/* Computation Panel */}
      {showComputationPanel && (
        <ComputationPanel
          isVisible={showComputationPanel}
          onClose={() => setShowComputationPanel(false)}
          sceneData={sceneData}
          onComputationComplete={onComputationComplete}
        />
      )}

      {/* Generate Scene Panel */}
      {showGenerateScenePanel && (
        <GenerateScenePanel
          isVisible={showGenerateScenePanel}
          onClose={() => setShowGenerateScenePanel(false)}
          sceneData={sceneData}
          onSceneGenerated={onSceneGenerated}
        />
      )}

      {/* Inspector Panels */}
      {showCompositionsInspector && (
        <CompositionsInspectorPanel
          isVisible={showCompositionsInspector}
          onClose={() => setShowCompositionsInspector(false)}
          compositions={compositions}
          onEditComposition={(composition) => {
            // TODO: Implement edit composition functionality
            console.log('Edit composition:', composition);
          }}
          onDeleteComposition={(composition) => {
            // TODO: Implement delete composition functionality
            console.log('Delete composition:', composition);
          }}
          onCreateComposition={() => {
            setShowCompositionPanel(true);
          }}
        />
      )}

      {showSourcesInspector && (
        <SourcesInspectorPanel
          isVisible={showSourcesInspector}
          onClose={() => setShowSourcesInspector(false)}
          sources={sources}
          onEditSource={(source) => {
            // TODO: Implement edit source functionality
            console.log('Edit source:', source);
          }}
          onDeleteSource={(source) => {
            // TODO: Implement delete source functionality
            console.log('Delete source:', source);
          }}
          onCreateSource={() => {
            setShowCompoundVolume(true);
          }}
        />
      )}

      {showSensorsInspector && (
        <SensorsInspectorPanel
          isVisible={showSensorsInspector}
          onClose={() => setShowSensorsInspector(false)}
          sensors={sensors}
          onEditSensor={(sensor) => {
            // TODO: Implement edit sensor functionality
            console.log('Edit sensor:', sensor);
          }}
          onDeleteSensor={(sensor) => {
            // TODO: Implement delete sensor functionality
            console.log('Delete sensor:', sensor);
          }}
          onCreateSensor={() => {
            setShowSensorPanel(true);
          }}
        />
      )}

      {/* Creation Panels */}
      {showCompositionPanel && (
        <CompositionPanel
          isVisible={showCompositionPanel}
          onClose={() => setShowCompositionPanel(false)}
          onUse={(composition) => {
            // TODO: Implement use composition functionality
            console.log('Use composition:', composition);
            setShowCompositionPanel(false);
          }}
          onStore={(composition) => {
            // TODO: Implement store composition functionality
            console.log('Store composition:', composition);
            setShowCompositionPanel(false);
          }}
          existingCompositions={existingCompositions}
        />
      )}

      {showSensorPanel && (
        <SensorPanel
          isVisible={showSensorPanel}
          onClose={() => setShowSensorPanel(false)}
          onValidate={(sensors) => {
            // TODO: Implement validate sensors functionality
            console.log('Validate sensors:', sensors);
          }}
          onSaveAs={(sensors) => {
            // TODO: Implement save sensors functionality
            console.log('Save sensors:', sensors);
            setShowSensorPanel(false);
          }}
          existingSensors={existingSensors}
          existingCompositions={existingCompositions}
        />
      )}

      {showCompoundVolume && (
        <CompoundVolume
          isVisible={showCompoundVolume}
          onClose={() => setShowCompoundVolume(false)}
          onValidate={(volume) => {
            // TODO: Implement validate volume functionality
            console.log('Validate volume:', volume);
          }}
          onSaveAs={(volume) => {
            // TODO: Implement save volume functionality
            console.log('Save volume:', volume);
            setShowCompoundVolume(false);
          }}
          existingCompositions={existingCompositions}
        />
      )}
    </nav>
  );
}
