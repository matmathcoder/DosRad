import { useState, useEffect } from 'react';
import { loadLayoutConfig, saveLayoutConfig } from './layoutUtils';

/**
 * Custom hook for managing App state
 * Handles all state management for the main App component
 */
export default function useAppState() {
  // Panel visibility states
  const [showVolumeForm, setShowVolumeForm] = useState(false);
  const [showGeometryPanel, setShowGeometryPanel] = useState(false);
  const [showSensorPanel, setShowSensorPanel] = useState(false);
  const [showCompoundVolume, setShowCompoundVolume] = useState(false);
  const [showVolumeProperties, setShowVolumeProperties] = useState(false);
  const [showPhysicsPanel, setShowPhysicsPanel] = useState(false);
  const [showDecaySimulator, setShowDecaySimulator] = useState(false);
  
  // Data states
  const [selectedVolumeData, setSelectedVolumeData] = useState(null);
  const [physicsSimulationResults, setPhysicsSimulationResults] = useState([]);
  const [isPhysicsSimulating, setIsPhysicsSimulating] = useState(false);
  const [physicsSimulationProgress, setPhysicsSimulationProgress] = useState(0);
  const [selectedGeometry, setSelectedGeometry] = useState(null);
  const [existingVolumes, setExistingVolumes] = useState([]);
  const [existingSensors, setExistingSensors] = useState([]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [createGeometryFunction, setCreateGeometryFunction] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [hasObjects, setHasObjects] = useState(false);
  const [hasSelectedObject, setHasSelectedObject] = useState(false);
  const [cameraMode, setCameraMode] = useState('perspective');
  const [currentProjectId, setCurrentProjectId] = useState(null);
  
  // Debug wrapper for setCurrentProjectId
  const setCurrentProjectIdWithDebug = (id) => {
    console.log('useAppState setCurrentProjectId called with:', id);
    setCurrentProjectId(id);
  };
  
  // Window size state
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

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

  // Layout configuration state - Load from localStorage on initialization
  const [layoutConfig, setLayoutConfig] = useState(() => {
    try {
      const config = loadLayoutConfig();
      return config;
    } catch (error) {
      console.warn('Failed to load layout config, using default:', error);
      return {
        sidebar: 'right', // 'right', 'left', 'top', 'bottom'
        geometrySelector: 'left', // 'left', 'right', 'top', 'bottom'
        directory: 'left' // 'left', 'right', 'top', 'bottom'
      };
    }
  });

  // Panel visibility states for volume form panels
  const [showCompositionPanel, setShowCompositionPanel] = useState(false);
  const [showLineSpectrumPanel, setShowLineSpectrumPanel] = useState(false);
  const [showGroupSpectrumPanel, setShowGroupSpectrumPanel] = useState(false);

  // Save layout configuration to localStorage whenever it changes
  useEffect(() => {
    try {
      saveLayoutConfig(layoutConfig);
    } catch (error) {
      console.warn('Failed to save layout config:', error);
    }
  }, [layoutConfig]);

  // Current project state
  const [currentProject, setCurrentProject] = useState(null);

  // Current composition and spectrum data
  const [currentComposition, setCurrentComposition] = useState(null);
  const [currentSpectrum, setCurrentSpectrum] = useState(null);

  // Mock data - in real app this would come from database/API
  const [existingCompositions, setExistingCompositions] = useState([
    { name: 'Steel', density: 7.85, color: '#A9A9A9', elements: [{ element: 'Fe', percentage: 98 }, { element: 'C', percentage: 2 }] },
    { name: 'Aluminum', density: 2.70, color: '#C0C0C0', elements: [{ element: 'Al', percentage: 100 }] },
    { name: 'Water', density: 1.00, color: '#87CEEB', elements: [{ element: 'H', percentage: 11.19 }, { element: 'O', percentage: 88.81 }] }
  ]);

  const [existingSpectra, setExistingSpectra] = useState([
    { name: 'Co-60 Standard', type: 'line', multiplier: 1.0, lines: [{ energy: 1173.2, intensity: 99.85 }, { energy: 1332.5, intensity: 99.98 }] },
    { name: 'Cs-137 Standard', type: 'line', multiplier: 1.0, lines: [{ energy: 661.7, intensity: 85.1 }] },
    { name: 'Mixed Fission', type: 'group', multiplier: 1.0, isotopes: ['Cs-137', 'Sr-90', 'I-131'] }
  ]);

  // Keep hasObjects in sync with existingVolumes
  useEffect(() => {
    setHasObjects(existingVolumes.length > 0);
  }, [existingVolumes]);

  return {
    // Panel visibility states
    showVolumeForm,
    setShowVolumeForm,
    showGeometryPanel,
    setShowGeometryPanel,
    showSensorPanel,
    setShowSensorPanel,
    showCompoundVolume,
    setShowCompoundVolume,
    showVolumeProperties,
    setShowVolumeProperties,
    showPhysicsPanel,
    setShowPhysicsPanel,
    showDecaySimulator,
    setShowDecaySimulator,
    
    // Data states
    selectedVolumeData,
    setSelectedVolumeData,
    physicsSimulationResults,
    setPhysicsSimulationResults,
    isPhysicsSimulating,
    setIsPhysicsSimulating,
    physicsSimulationProgress,
    setPhysicsSimulationProgress,
    selectedGeometry,
    setSelectedGeometry,
    existingVolumes,
    setExistingVolumes,
    existingSensors,
    setExistingSensors,
    selectedTool,
    setSelectedTool,
    createGeometryFunction,
    setCreateGeometryFunction,
    showHelp,
    setShowHelp,
    hasObjects,
    setHasObjects,
    hasSelectedObject,
    setHasSelectedObject,
    cameraMode,
    setCameraMode,
    currentProjectId,
    setCurrentProjectId: setCurrentProjectIdWithDebug,
    
    // Window size state
    windowSize,
    setWindowSize,
    
    // Component visibility state
    componentVisibility,
    setComponentVisibility,
    
    // Layout configuration state
    layoutConfig,
    setLayoutConfig,
    
    // Panel visibility states for volume form panels
    showCompositionPanel,
    setShowCompositionPanel,
    showLineSpectrumPanel,
    setShowLineSpectrumPanel,
    showGroupSpectrumPanel,
    setShowGroupSpectrumPanel,
    
    // Current project state
    currentProject,
    setCurrentProject,
    
    // Current composition and spectrum data
    currentComposition,
    setCurrentComposition,
    currentSpectrum,
    setCurrentSpectrum,
    
    // Mock data
    existingCompositions,
    setExistingCompositions,
    existingSpectra,
    setExistingSpectra
  };
}
