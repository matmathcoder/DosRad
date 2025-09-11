import { useCallback } from 'react';
import ApiService from '../services/api';

/**
 * Custom hook for handling App operations
 * Contains all the complex handler functions
 */
export default function useAppHandlers({
  state,
  actions
}) {
  const apiService = ApiService;

  const handleToolSelect = (toolId) => {
    actions.setSelectedTool(toolId);
    
    // Update camera mode when camera tool is used
    if (toolId === 'camera') {
      actions.setCameraMode(prev => prev === 'perspective' ? 'orthographic' : 'perspective');
    }
  };

  const handleShowVolumeForm = () => {
    actions.setShowVolumeForm(true);
    // Also ensure the volume form component is visible
    actions.setComponentVisibility(prev => ({
      ...prev,
      volumeForm: true
    }));
  };

  const handleVolumeFormClose = () => {
    actions.setShowVolumeForm(false);
    // Also hide the volume form component
    actions.setComponentVisibility(prev => ({
      ...prev,
      volumeForm: false
    }));
  };

  const handleVolumeFormSave = (volumeData) => {
    // Create the 3D geometry in the scene
    if (state.createGeometryFunction && volumeData.geometryType) {
      const geometry = state.createGeometryFunction(volumeData.geometryType);
      
      // If geometry was created successfully, add volume data to userData
      if (geometry) {
        // Add the volume data to the geometry's userData
        geometry.userData = {
          ...geometry.userData,
          volumeName: volumeData.volume,
          volumeType: volumeData.volumeType,
          composition: volumeData.composition,
          realDensity: parseFloat(volumeData.realDensity) || 0,
          tolerance: parseFloat(volumeData.tolerance) || 0,
          isSource: volumeData.isSource,
          calculation: volumeData.calculation,
          gammaSelectionMode: volumeData.gammaSelectionMode,
          spectrum: volumeData.spectrum
        };
        
        // Note: onGeometryCreated callback will handle adding to existingVolumes
        // to prevent duplicates
      }
    }
    
    actions.setShowVolumeForm(false);
    // Also hide the volume form component
    actions.setComponentVisibility(prev => ({
      ...prev,
      volumeForm: false
    }));
  };

  // Panel handlers
  const handleCompositionChange = (compositionData) => {
    actions.setCurrentComposition(compositionData);
  };

  const handleSpectrumChange = (spectrumData) => {
    actions.setCurrentSpectrum(spectrumData);
  };

  const handleCompositionUse = (compositionData) => {
    actions.setCurrentComposition(compositionData);
    actions.setShowCompositionPanel(false);
  };

  const handleCompositionStore = (compositionData) => {
    // In real app, this would save to database
    handleCompositionUse(compositionData);
  };

  const handleSpectrumValidate = (spectrumData) => {
    actions.setCurrentSpectrum(spectrumData);
    actions.setShowLineSpectrumPanel(false);
    actions.setShowGroupSpectrumPanel(false);
  };

  const handleSpectrumSaveAs = (spectrumData) => {
    // In real app, this would save to database
    handleSpectrumValidate(spectrumData);
  };

  const handleGeometrySelect = (geometryType) => {
    if (state.createGeometryFunction) {
      const geometry = state.createGeometryFunction(geometryType);
      // Note: onGeometryCreated callback will handle adding to existingVolumes
      // to prevent duplicates
      
      // Manually trigger the geometry created handler for click-created geometries
      // This ensures they get added to the Directory just like drag-and-drop geometries
      if (geometry) {
        handleGeometryCreated(geometry);
      }
    }
  };

  const handleGeometryCreated = (mesh) => {
    // Skip if we're restoring from localStorage to prevent duplicates
    if (window.isRestoringFromLocalStorage) {
      return;
    }
    
    // Handle geometry created via click or drag and drop
    actions.setHasObjects(true);
    
    // Add to existing volumes list for geometry panel and directory
    if (mesh && mesh.userData) {
      // Check if this geometry already exists to prevent duplicates
      const existingVolume = state.existingVolumes.find(vol => vol.id === mesh.userData.id);
      if (existingVolume) {
        return;
      }
      
      const volumeData = {
        id: mesh.userData.id,
        name: mesh.userData.volumeName || 'Unnamed Volume',
        type: mesh.userData.type || 'Unknown',
        position: {
          x: mesh.position.x,
          y: mesh.position.y,
          z: mesh.position.z
        },
        rotation: {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z
        },
        scale: {
          x: mesh.scale.x,
          y: mesh.scale.y,
          z: mesh.scale.z
        },
        visible: mesh.userData.visible !== false,
        composition: mesh.userData.composition || null,
        realDensity: mesh.userData.realDensity || 0,
        tolerance: mesh.userData.tolerance || 0,
        isSource: mesh.userData.isSource || false,
        calculation: mesh.userData.calculation || null,
        gammaSelectionMode: mesh.userData.gammaSelectionMode || null,
        spectrum: mesh.userData.spectrum || null
      };
      
      // Add to existing volumes
      actions.setExistingVolumes(prev => [...prev, volumeData]);
      
    }
  };

  const handleGeometryCreate = useCallback((createFunction) => {
    actions.setCreateGeometryFunction(() => createFunction);
  }, [actions]);

  const handleAxisChange = (axis) => {
    if (window.setAxisView) {
      window.setAxisView(axis);
    }
  };

  const handleViewModeChange = (mode) => {
    if (window.setViewMode) {
      window.setViewMode(mode);
    }
  };

  const handleMaterialChange = (mode) => {
    if (window.setMaterialMode) {
      window.setMaterialMode(mode);
    }
  };

  const handleZoomChange = (zoomLevel) => {
    if (window.setZoomLevel) {
      window.setZoomLevel(zoomLevel);
    }
  };

  const handleLanguageChange = (language) => {
    // TODO: Implement language switching logic
  };

  const handleUnitChange = (unit) => {
    // TODO: Implement unit conversion logic
  };

  const handleModeChange = (modeData) => {
    // TODO: Implement mode switching logic
  };

  const handleSceneRotationChange = (rotation) => {
    if (window.setSceneRotation) {
      window.setSceneRotation(rotation);
    }
  };

  const handleViewMenuAction = (action) => {
    if (window.handleViewMenuAction) {
      window.handleViewMenuAction(action);
    }
  };

  const handleSelectionChange = (hasSelection, selectedObject = null) => {
    actions.setHasSelectedObject(hasSelection);
    
    // If an object is selected, prepare it for the geometry panel
    if (hasSelection && selectedObject) {
      actions.setSelectedGeometry({
        type: selectedObject.userData?.type || 'unknown',
        id: selectedObject.userData?.id,
        name: selectedObject.userData?.volumeName || `Volume_${selectedObject.userData?.id || Date.now()}`,
        position: {
          x: selectedObject.position.x,
          y: selectedObject.position.y,
          z: selectedObject.position.z
        },
        rotation: {
          x: selectedObject.rotation.x,
          y: selectedObject.rotation.y,
          z: selectedObject.rotation.z
        },
        scale: {
          x: selectedObject.scale.x,
          y: selectedObject.scale.y,
          z: selectedObject.scale.z
        },
        userData: selectedObject.userData
      });
    } else {
      actions.setSelectedGeometry(null);
    }
  };

  const handleShowGeometryPanel = () => {
    // Always show the panel, even if no geometry is selected
    actions.setShowGeometryPanel(true);
  };

  const handleGeometryPanelClose = (geometryData = null) => {
    if (geometryData) {
      // TODO: Apply geometry changes to the 3D scene
      if (window.updateGeometry) {
        window.updateGeometry(state.selectedGeometry.id, geometryData);
      }
    }
    actions.setShowGeometryPanel(false);
  };

  const handleGeometryChanged = (geometryId, changes) => {
    // Update the existingVolumes state when geometry changes
    actions.setExistingVolumes(prev => prev.map(volume => {
      if (volume.id === geometryId) {
        return {
          ...volume,
          position: changes.position || volume.position,
          rotation: changes.rotation || volume.rotation,
          scale: changes.scale || volume.scale
        };
      }
      return volume;
    }));

    // Update selectedGeometry if it's the same geometry
    if (state.selectedGeometry && state.selectedGeometry.id === geometryId) {
      actions.setSelectedGeometry(prev => ({
        ...prev,
        position: changes.position || prev.position,
        rotation: changes.rotation || prev.rotation,
        scale: changes.scale || prev.scale
      }));
    }

    // Update localStorage
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (savedData) {
        const sceneData = JSON.parse(savedData);
        if (sceneData.geometries && Array.isArray(sceneData.geometries)) {
          const updatedGeometries = sceneData.geometries.map(geometry => {
            if (geometry.id === geometryId) {
              return {
                ...geometry,
                position: changes.position || geometry.position,
                rotation: changes.rotation || geometry.rotation,
                scale: changes.scale || geometry.scale
              };
            }
            return geometry;
          });
          localStorage.setItem('mercurad_scene', JSON.stringify({ ...sceneData, geometries: updatedGeometries }));
        }
      }
    } catch (error) {
      console.error('Failed to update geometry in localStorage:', error);
    }
  };

  const handleShowSensorPanel = () => {
    actions.setShowSensorPanel(true);
    actions.setComponentVisibility(prev => ({
      ...prev,
      sensorPanel: true
    }));
  };

  const handleSensorPanelClose = () => {
    actions.setShowSensorPanel(false);
    actions.setComponentVisibility(prev => ({
      ...prev,
      sensorPanel: false
    }));
  };

  const handleSensorSave = (sensorData) => {
    if (Array.isArray(sensorData)) {
      // Multiple sensors (from validation or deletion)
      actions.setExistingSensors(sensorData);
    } else {
      // Single sensor (new or updated)
      actions.setExistingSensors(prev => {
        const existingIndex = prev.findIndex(s => s.id === sensorData.id);
        if (existingIndex >= 0) {
          // Update existing sensor
          const updated = [...prev];
          updated[existingIndex] = sensorData;
          return updated;
        } else {
          // Add new sensor
          return [...prev, sensorData];
        }
      });
      
      // Create sensor in 3D scene
      if (window.createSensor) {
        window.createSensor(sensorData);
      }
    }
  };

  const handleSensorValidate = (sensors) => {
    // In a real app, this would trigger validation logic
    actions.setExistingSensors(sensors);
  };

  const handleShowCompoundVolume = () => {
    actions.setShowCompoundVolume(true);
    actions.setComponentVisibility(prev => ({
      ...prev,
      compoundVolume: true
    }));
  };

  const handleCompoundVolumeClose = () => {
    actions.setShowCompoundVolume(false);
    actions.setComponentVisibility(prev => ({
      ...prev,
      compoundVolume: false
    }));
  };

  // Physics simulation handlers
  const handlePhysicsPanelClose = () => {
    actions.setShowPhysicsPanel(false);
  };

  const handleStartPhysicsSimulation = (config) => {
    actions.setIsPhysicsSimulating(true);
    actions.setPhysicsSimulationProgress(0);
    
    // Run the simulation using the global function
    if (window.runPhysicsSimulation) {
      try {
        const results = window.runPhysicsSimulation(config);
        actions.setPhysicsSimulationResults(results || []);
        
        // Create visualization
        if (window.createPhysicsVisualization) {
          window.createPhysicsVisualization();
        }
      } catch (error) {
        console.error('Physics simulation error:', error);
      }
    } else {
      console.error('runPhysicsSimulation function not available');
    }
    
    actions.setIsPhysicsSimulating(false);
    actions.setPhysicsSimulationProgress(1);
  };

  const handleStopPhysicsSimulation = () => {
    actions.setIsPhysicsSimulating(false);
    if (window.stopPhysicsSimulation) {
      window.stopPhysicsSimulation();
    }
  };

  const handlePhysicsSimulationProgress = (progress) => {
    actions.setPhysicsSimulationProgress(progress);
  };

  const handlePhysicsSimulationComplete = (results) => {
    actions.setPhysicsSimulationResults(results);
    actions.setIsPhysicsSimulating(false);
    actions.setPhysicsSimulationProgress(1);
    
    // Create visualization
    if (window.createPhysicsVisualization) {
      window.createPhysicsVisualization();
    }
  };

  const handleCompoundVolumeImport = (importData) => {
    // In a real app, this would:
    // 1. Load the compound object from file system
    // 2. Apply conflict resolution (rename conflicting entities)
    // 3. Create geometries in the 3D scene with the specified position/rotation/scale
    // 4. Add volumes, compositions, and spectra to the scene
    
    // For now, we'll simulate the import by creating mock volumes
    const mockVolumes = importData.compoundObject.volumes ? 
      Array.from({ length: importData.compoundObject.volumes }, (_, index) => ({
        id: Date.now() + index,
        type: 'cube', // Default geometry type
        name: `Imported_${importData.compoundObject.name}_${index + 1}`,
        position: {
          x: importData.position.x + (index * 2),
          y: importData.position.y,
          z: importData.position.z
        },
        userData: {
          type: 'cube',
          id: Date.now() + index,
          originalColor: 0x888888,
          importedFrom: importData.compoundObject.name,
          importPosition: importData.position,
          importRotation: importData.position.rotation,
          importScale: importData.position.scale
        }
      })) : [];

    // Add imported volumes to existing volumes
    actions.setExistingVolumes(prev => [...prev, ...mockVolumes]);
    
    // Create geometries in 3D scene
    mockVolumes.forEach(volume => {
      if (window.createGeometryFromData) {
        window.createGeometryFromData(volume);
      }
    });
  };

  const handleToggleComponentVisibility = (componentKey, isVisible) => {
    actions.setComponentVisibility(prev => ({
      ...prev,
      [componentKey]: isVisible
    }));
  };

  // Mesh panel handlers
  const handleMeshValidate = (meshData) => {
    // In real implementation, this would save mesh data to the volume
  };

  // Computation panel handlers
  const handleComputationComplete = (results) => {
    // In real implementation, this would store results and update UI
  };

  // Generate scene panel handlers
  const handleSceneGenerated = (files) => {
    // In real implementation, this would handle file downloads
  };

  // State change handlers for persistence
  const handleCompositionsChange = (compositions) => {
    actions.setExistingCompositions(compositions);
  };

  const handleSensorsChange = (sensors) => {
    actions.setExistingSensors(sensors);
  };

  const handleSpectraChange = (spectra) => {
    actions.setExistingSpectra(spectra);
  };

  // Handlers for when new objects are created
  const handleVolumeCreated = (newVolume) => {
    console.log('handleVolumeCreated received:', newVolume);
    
    // Map backend volume data to frontend expected structure
    const processedVolume = {
      id: newVolume.id,
      name: newVolume.volume_name || 'Unnamed Volume', // Backend uses volume_name
      type: newVolume.geometry?.geometry_type || 'Unknown',
      position: newVolume.geometry?.position || { x: 0, y: 0, z: 0 },
      rotation: newVolume.geometry?.rotation || { x: 0, y: 0, z: 0 },
      scale: newVolume.geometry?.scale || { x: 1, y: 1, z: 1 },
      userData: {
        id: newVolume.id,
        volumeName: newVolume.volume_name || 'Unnamed Volume', // This is what the directory looks for
        type: newVolume.geometry?.geometry_type || 'Unknown',
        volumeType: newVolume.volume_type,
        isSource: newVolume.is_source,
        realDensity: newVolume.real_density,
        tolerance: newVolume.tolerance,
        gammaSelectionMode: newVolume.gamma_selection_mode,
        calculation: newVolume.calculation_mode
      },
      visible: true
    };
    
    console.log('handleVolumeCreated processed:', processedVolume);
    actions.setExistingVolumes(prev => [...prev, processedVolume]);
  };

  const handleCompositionCreated = (newComposition) => {
    actions.setExistingCompositions(prev => [...prev, newComposition]);
  };

  const handleSpectrumCreated = (newSpectrum) => {
    actions.setExistingSpectra(prev => [...prev, newSpectrum]);
  };

  const handleSensorCreated = (newSensor) => {
    actions.setExistingSensors(prev => [...prev, newSensor]);
  };

  const handleCompoundObjectImported = (newCompoundObject) => {
    // Compound objects might contain multiple volumes, compositions, and spectra
    // This would need to be handled based on the compound object structure
    console.log('Compound object imported:', newCompoundObject);
  };

  // Clear all objects handler
  const handleClearAllObjects = () => {
    if (window.confirm('Are you sure you want to delete ALL objects from the scene? This action cannot be undone.')) {
      // Clear from 3D scene
      if (window.clearScene) {
        window.clearScene();
      }
      
      // Clear from state
      actions.setExistingVolumes([]);
      actions.setExistingSensors([]);
      actions.setExistingCompositions([]);
      actions.setExistingSpectra([]);
      actions.setHasObjects(false);
      actions.setSelectedGeometry(null);
      actions.setHasSelectedObject(false);
      
      // Clear from localStorage
      if (window.clearSavedScene) {
        window.clearSavedScene();
      }
    }
  };

  // Create new project handler
  const handleCreateNewProject = async () => {
    try {
      // Clear current scene
      if (window.clearScene) {
        window.clearScene();
      }
      
      // Clear all compositions, sensors, and spectra
      actions.setExistingCompositions([]);
      actions.setExistingSensors([]);
      actions.setExistingSpectra([]);
      
      // Clear selected objects
      actions.setSelectedGeometry(null);
      actions.setSelectedVolumeData(null);
      
      // Clear any existing temporary project from localStorage
      const TemporaryProjectService = (await import('../services/TemporaryProjectService')).default;
      const tempProjectService = new TemporaryProjectService();
      const currentTempProjectId = tempProjectService.getCurrentTemporaryProjectId();
      if (currentTempProjectId) {
        tempProjectService.deleteTemporaryProject(currentTempProjectId);
      }
      
      // Create a new project
      const { createDefaultProject } = await import('../utils/projectInitializer');
      const newProject = await createDefaultProject();
      
      // Update the current project ID
      actions.setCurrentProjectId(newProject.id);
      
      // Save the project to localStorage as the current project
      if (newProject.is_temporary) {
        tempProjectService.setCurrentTemporaryProjectId(newProject.id);
      } else {
        // For backend projects, we need to save them to localStorage for persistence
        // This allows the project to be loaded on refresh
        const projectData = {
          id: newProject.id,
          name: newProject.name,
          description: newProject.description,
          is_public: newProject.is_public,
          is_temporary: false,
          created_at: newProject.created_at,
          updated_at: newProject.updated_at
        };
        tempProjectService.updateTemporaryProject(newProject.id, projectData);
        tempProjectService.setCurrentTemporaryProjectId(newProject.id);
      }
      
      // Update URL to include the new project ID
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('projectId', newProject.id);
      window.history.replaceState({}, '', newUrl);
      
      console.log('New project created:', newProject);
    } catch (error) {
      console.error('Failed to create new project:', error);
      alert('Failed to create new project. Please try again.');
    }
  };

  return {
    handleToolSelect,
    handleShowVolumeForm,
    handleVolumeFormClose,
    handleVolumeFormSave,
    handleCompositionChange,
    handleSpectrumChange,
    handleCompositionUse,
    handleCompositionStore,
    handleSpectrumValidate,
    handleSpectrumSaveAs,
    handleGeometrySelect,
    handleGeometryCreate,
    handleGeometryCreated,
    handleAxisChange,
    handleViewModeChange,
    handleMaterialChange,
    handleZoomChange,
    handleLanguageChange,
    handleUnitChange,
    handleModeChange,
    handleSceneRotationChange,
    handleViewMenuAction,
    handleSelectionChange,
    handleShowGeometryPanel,
    handleGeometryPanelClose,
    handleGeometryChanged,
    handleShowSensorPanel,
    handleSensorPanelClose,
    handleSensorSave,
    handleSensorValidate,
    handleShowCompoundVolume,
    handleCompoundVolumeClose,
    handlePhysicsPanelClose,
    handleStartPhysicsSimulation,
    handleStopPhysicsSimulation,
    handlePhysicsSimulationProgress,
    handlePhysicsSimulationComplete,
    handleCompoundVolumeImport,
    handleToggleComponentVisibility,
    handleMeshValidate,
    handleComputationComplete,
    handleSceneGenerated,
    handleCompositionsChange,
    handleSensorsChange,
    handleSpectraChange,
    handleVolumeCreated,
    handleCompositionCreated,
    handleSpectrumCreated,
    handleSensorCreated,
    handleCompoundObjectImported,
    handleClearAllObjects,
    handleCreateNewProject
  };
}
