import { useAuth } from '../../../contexts/AuthContext';
import { exportMultipleObjectsToOBJ, downloadOBJ } from '../../../utils/objExporter';
import { visibilityMap } from './NavigationData';
import { createDefaultProject, loadProjectById } from '../../../utils/projectInitializer';

/**
 * Custom hook for handling navigation actions and file operations
 */
export default function useNavigationHandlers({
  sceneData,
  onShowVolumeForm,
  onAxisChange,
  onViewModeChange,
  onMaterialChange,
  onViewMenuAction,
  onShowGeometryPanel,
  onShowSensorPanel,
  onShowCompoundVolume,
  onShowPhysicsPanel,
  onShowDecaySimulator,
  onSaveToComputer,
  onSaveToCloud,
  onLoadFromComputer,
  onLoadFromCloud,
  onCreateNewProject,
  onExportImage,
  onToggleComponentVisibility,
  onMeshValidate,
  onComputationComplete,
  onSceneGenerated,
  onShowCompositionsInspector,
  onShowSourcesInspector,
  onShowSensorsInspector,
  onShowCompositionPanel,
  state,
  actions
}) {
  const { user, login, signup, logout } = useAuth();

  const handleCreateNewProject = async () => {
    try {
      // Create a new project
      const project = await createDefaultProject();
      
      // Update URL without reloading
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('projectId', project.id);
      window.history.replaceState({}, '', newUrl);
      
      // Update state
      if (actions.setCurrentProjectId) {
        actions.setCurrentProjectId(project.id);
      }
      
      // Clear existing scene data
      if (actions.resetSceneData) {
        actions.resetSceneData();
      }

      // Call parent handler if provided
      if (onCreateNewProject) {
        onCreateNewProject(project);
      }
      
      console.log('Created new project:', project);
    } catch (error) {
      console.error('Failed to create new project:', error);
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      actions.setShowLogin(true);
      return;
    }
    
    if (!sceneData) {
      console.error('No scene data available to save');
      return;
    }
    
    // Check if we have a current project ID
    console.log('Current state.currentProjectId:', state.currentProjectId);
    console.log('Current state:', state);
    if (!state.currentProjectId) {
      console.error('No current project ID available');
      alert('No current project found. Please create a new project first.');
      return;
    }
    
    // Check if current project is temporary - if so, we'll migrate it
    const isTemporary = state.currentProjectId.startsWith('temp_');
    
    try {
      // Import the API service
      const apiService = (await import('../../../services/api')).default;
      
      // Ask user for project name
      const projectName = prompt(
        'Enter a name for your project:',
        sceneData.metadata?.name || 'Untitled Project'
      );
      
      if (!projectName) return; // User cancelled
      
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
          type: obj.geometry?.type || 'box',
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
      let newProjectId = state.currentProjectId;
      
      if (isTemporary) {
        // Migrate temporary project to permanent project
        const { migrateTemporaryProjectToPermanent } = await import('../../../utils/projectInitializer');
        const migratedProject = await migrateTemporaryProjectToPermanent(state.currentProjectId);
        newProjectId = migratedProject.id;
        
        // Update the migrated project with the new name and data
        savedProject = await apiService.updateCompleteProject(newProjectId, completeProjectData);
      } else {
        // Update the current project with the new name and data
        savedProject = await apiService.updateCompleteProject(state.currentProjectId, completeProjectData);
      }
      
      // Update the URL with the new project name
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('projectId', newProjectId);
      newUrl.searchParams.set('name', projectName);
      window.history.replaceState({}, '', newUrl);
      
      // Update the scene metadata with the new name
      if (window.updateSceneMetadata) {
        window.updateSceneMetadata({ name: projectName });
      }
      
      // Show success message
      alert(`Project "${savedProject.name}" saved successfully to your account!\n\nSaved:\n- ${savedProject.geometries?.length || 0} geometries\n- ${savedProject.compositions?.length || 0} compositions\n- ${savedProject.spectra?.length || 0} spectra\n- ${savedProject.sensors?.length || 0} sensors\n- ${savedProject.volumes?.length || 0} volumes`);
      
    } catch (error) {
      console.error('Failed to save project to cloud:', error);
      alert('Failed to save project to cloud. Please try again.');
    }
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
        break;
    }
    
    // Close dropdowns
    actions.closeDropdowns();
  };

  const handleAxisClick = (axis) => {
    actions.setActiveAxis(axis);
    if (onAxisChange) {
      onAxisChange(axis);
    }
  };

  const handleViewModeClick = (mode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const handleMaterialModeClick = (mode) => {
    actions.setMaterialMode(mode);
    if (onMaterialChange) {
      onMaterialChange(mode);
    }
  };

  // Authentication handlers
  const handleLoginSuccess = async (credentials) => {
    try {
      await login(credentials);
      actions.setShowLogin(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignupSuccess = async (userData) => {
    try {
      await signup(userData);
      actions.setShowSignup(false);
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
    actions.setShowLogin(false);
    actions.setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    actions.setShowSignup(false);
    actions.setShowLogin(true);
  };

  // Export and Print handlers
  const handleExportOBJ = () => {
    if (sceneData) {
      const objData = exportMultipleObjectsToOBJ(sceneData);
      downloadOBJ(objData);
    }
  };

  const handleExportImage = () => {
    if (onExportImage) {
      onExportImage();
    }
  };

  const handleLoadFromComputer = () => {
    if (onLoadFromComputer) {
      onLoadFromComputer();
    }
  };

  const handleLoadFromCloud = () => {
    if (!user) {
      actions.setShowLogin(true);
      return;
    }

    if (onLoadFromCloud) {
      onLoadFromCloud();
    }
  };

  const handleSaveToComputer = () => {
    if (onSaveToComputer && sceneData) {
      onSaveToComputer(sceneData);
    }
  };

  return {
    handleItemClick,
    handleAxisClick,
    handleViewModeClick,
    handleMaterialModeClick,
    handleLoginSuccess,
    handleSignupSuccess,
    handleLogout,
    handleSwitchToSignup,
    handleSwitchToLogin,
    handleSaveToComputer,
    handleSaveToCloud,
    handleLoadFromComputer,
    handleLoadFromCloud,
    handleCreateNewProject,
    handleExportImage,
    handleExportOBJ
  };
}
