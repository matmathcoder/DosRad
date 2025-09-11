import React, { useMemo, useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import useAppState from './useAppState';
import useAppHandlers from './useAppHandlers';
import useAppEffects from './useAppEffects';
import AppLayout from './AppLayout';
import { getSceneData, loadSceneData, loadFromLocalStorage, loadExampleScene } from './AppData';
import { initializeProject } from '../utils/projectInitializer';

/**
 * Main App Component
 * Orchestrates all app functionality through modular components
 */
export default function App() {
  // Use custom hooks for state management and handlers
  const state = useAppState();
  
  // Memoize actions object to prevent infinite re-renders
  // Note: useState setter functions are stable references, so no dependencies needed
  const actions = useMemo(() => ({
    setSelectedTool: state.setSelectedTool,
    setCameraMode: state.setCameraMode,
    setComponentVisibility: state.setComponentVisibility,
    setShowVolumeForm: state.setShowVolumeForm,
    setShowGeometryPanel: state.setShowGeometryPanel,
    setShowSensorPanel: state.setShowSensorPanel,
    setShowCompoundVolume: state.setShowCompoundVolume,
    setShowVolumeProperties: state.setShowVolumeProperties,
    setShowPhysicsPanel: state.setShowPhysicsPanel,
    setShowDecaySimulator: state.setShowDecaySimulator,
    setSelectedVolumeData: state.setSelectedVolumeData,
    setPhysicsSimulationResults: state.setPhysicsSimulationResults,
    setIsPhysicsSimulating: state.setIsPhysicsSimulating,
    setPhysicsSimulationProgress: state.setPhysicsSimulationProgress,
    setSelectedGeometry: state.setSelectedGeometry,
    setExistingVolumes: state.setExistingVolumes,
    setExistingSensors: state.setExistingSensors,
    setCreateGeometryFunction: state.setCreateGeometryFunction,
    setShowHelp: state.setShowHelp,
    setHasObjects: state.setHasObjects,
    setHasSelectedObject: state.setHasSelectedObject,
    setWindowSize: state.setWindowSize,
    setShowCompositionPanel: state.setShowCompositionPanel,
    setShowLineSpectrumPanel: state.setShowLineSpectrumPanel,
    setShowGroupSpectrumPanel: state.setShowGroupSpectrumPanel,
    setCurrentComposition: state.setCurrentComposition,
    setCurrentSpectrum: state.setCurrentSpectrum,
    setExistingCompositions: state.setExistingCompositions,
    setExistingSpectra: state.setExistingSpectra
  }), []); // Empty dependency array since useState setters are stable
  
  const handlers = useAppHandlers({
    state,
    actions
  });

  // Add additional handlers that need access to data functions
  const enhancedHandlers = useMemo(() => ({
    ...handlers,
    getSceneData: () => getSceneData(state),
    loadSceneData: (sceneData) => loadSceneData(sceneData, state, {
      setExistingVolumes: state.setExistingVolumes,
      setExistingSensors: state.setExistingSensors,
      setExistingCompositions: state.setExistingCompositions,
      setExistingSpectra: state.setExistingSpectra,
      setHasObjects: state.setHasObjects,
      setHasSelectedObject: state.setHasSelectedObject,
      setCameraMode: state.setCameraMode,
      setSelectedTool: state.setSelectedTool
    }),
    loadFromLocalStorage: () => loadFromLocalStorage({
      setExistingVolumes: state.setExistingVolumes,
      setExistingSensors: state.setExistingSensors,
      setExistingCompositions: state.setExistingCompositions,
      setExistingSpectra: state.setExistingSpectra
    }),
    loadExampleScene: (exampleData) => loadExampleScene(exampleData, state.existingVolumes, {
      setExistingVolumes: state.setExistingVolumes,
      setHasObjects: state.setHasObjects,
      setSelectedGeometry: state.setSelectedGeometry,
      setHasSelectedObject: state.setHasSelectedObject
    }),
    handleRenameObject: async (id, newName) => {
      try {
        // Update the object name in the 3D scene
        if (window.updateGeometryName) {
          window.updateGeometryName(id, newName);
        }
        
        // Update the object name in the volumes list
        state.setExistingVolumes(prev => prev.map(volume => 
          volume.id === id 
            ? { ...volume, userData: { ...volume.userData, volumeName: newName } }
            : volume
        ));
        
        // Update the volume name in localStorage
        try {
          const savedData = localStorage.getItem('mercurad_scene');
          if (savedData) {
            const sceneData = JSON.parse(savedData);
            if (sceneData.geometries && Array.isArray(sceneData.geometries)) {
              // Find and update the geometry in localStorage
              const updatedGeometries = sceneData.geometries.map(geometry => {
                if (geometry.id === id) {
                  return {
                    ...geometry,
                    volumeName: newName // Add volumeName to localStorage data
                  };
                }
                return geometry;
              });
              
              // Update the scene data with new geometries
              const updatedSceneData = {
                ...sceneData,
                geometries: updatedGeometries
              };
              
              // Save back to localStorage
              localStorage.setItem('mercurad_scene', JSON.stringify(updatedSceneData));
            }
          }
        } catch (error) {
          console.error('Failed to update volume name in localStorage:', error);
        }
        
        // Update the volume name in the backend if we have a current project
        if (state.currentProject) {
          try {
            const apiService = (await import('../services/api')).default;
            await apiService.updateVolumeName(state.currentProject.id, id, newName);
          } catch (error) {
            console.error('Failed to update volume name in backend:', error);
            // Don't show error to user as the frontend update already succeeded
          }
        }
      } catch (error) {
        console.error('Error updating volume name:', error);
      }
    },
    handleDeleteObject: (id, objectType) => {
      // Handle different object types
      switch (objectType) {
        case 'composition':
          // Remove from compositions list
          state.setExistingCompositions(prev => prev.filter(comp => comp.id !== id));
          // Sync with localStorage
          if (window.handleCompositionDeleted) {
            window.handleCompositionDeleted(id);
          }
          break;
          
        case 'source':
          // Remove from sources list (sources are volumes with isSource: true)
          state.setExistingVolumes(prev => prev.filter(volume => volume.id !== id));
          // Sync with localStorage
          if (window.handleSourceDeleted) {
            window.handleSourceDeleted(id);
          }
          break;
          
        case 'sensor':
          // Remove from sensors list
          state.setExistingSensors(prev => prev.filter(sensor => sensor.id !== id));
          // Sync with localStorage
          if (window.handleSensorDeleted) {
            window.handleSensorDeleted(id);
          }
          break;
          
        case 'spectrum':
          // Remove from spectra list
          state.setExistingSpectra(prev => prev.filter(spectrum => spectrum.id !== id));
          // Sync with localStorage
          if (window.handleSpectrumDeleted) {
            window.handleSpectrumDeleted(id);
          }
          break;
          
        case 'object':
        default:
          // Handle regular geometry objects
          if (window.removeGeometry) {
            const success = window.removeGeometry(id);
            if (success) {
              // The onGeometryDeleted callback will handle updating existingVolumes
            } else {
              console.warn(`Failed to delete geometry ${id} from 3D scene`);
              // Fallback: remove from volumes list manually
              state.setExistingVolumes(prev => prev.filter(volume => volume.id !== id));
            }
          } else {
            // Fallback: remove from volumes list manually
            state.setExistingVolumes(prev => prev.filter(volume => volume.id !== id));
          }
          break;
      }
    },
    handleSelectObject: (object) => {
      // Handle example loading differently
      if (object.type === 'example') {
        enhancedHandlers.loadExampleScene(object.data);
      } else {
        // Select the object in the 3D scene
        if (window.selectGeometry) {
          window.selectGeometry(object.data);
        }
        // Update the selected geometry state
        state.setSelectedGeometry({
          type: object.objectType || object.type,
          id: object.id,
          position: object.data.position,
          userData: object.data.userData
        });
        state.setHasSelectedObject(true);
      }
    },
    handleToggleVisibility: (id, visible) => {
      // Toggle object visibility in 3D scene
      if (window.toggleGeometryVisibility) {
        const success = window.toggleGeometryVisibility(id, visible);
        if (success) {
          // The onGeometryVisibilityChanged callback will handle updating existingVolumes
        } else {
          console.warn(`Failed to toggle geometry ${id} visibility`);
        }
      }
    },
    handleShowProperties: (item) => {
      // Show comprehensive properties for the selected object
      if (item.data) {
        // Set the volume data for the properties panel
        state.setSelectedVolumeData(item.data);
        state.setShowVolumeProperties(true);
        
        // Also set selected geometry for the geometry panel if needed
        state.setSelectedGeometry({
          type: item.objectType || item.type,
          id: item.id,
          name: item.name,
          position: item.data.position,
          rotation: item.data.rotation,
          scale: item.data.scale,
          userData: item.data.userData
        });
      } else {
        // For other items, show appropriate panel
      }
    }
  }), [handlers, state]); // Depend on handlers and state

  // Initialize project on app load
  useEffect(() => {
    const initProject = async () => {
      try {
        // Only initialize if no project is currently loaded
        if (!state.currentProjectId) {
          console.log('No project loaded, initializing...');
          await initializeProject(state.setCurrentProjectId);
        }
      } catch (error) {
        console.error('Project initialization failed:', error);
        // Don't throw error to prevent app crash, just log it
      }
    };
    
    initProject();
  }, []); // Run once on mount

  // Use custom hook for effects
  useAppEffects({
    state,
    actions: {
      setShowHelp: actions.setShowHelp,
      setComponentVisibility: actions.setComponentVisibility,
      setWindowSize: actions.setWindowSize
    },
    handlers: enhancedHandlers
  });

  return (
    <AuthProvider>
      <AppLayout
        state={state}
        handlers={enhancedHandlers}
        layoutConfig={state.layoutConfig}
        setLayoutConfig={state.setLayoutConfig}
      />
    </AuthProvider>
  );
}
