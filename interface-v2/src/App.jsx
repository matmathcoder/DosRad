import React, { useState, useEffect, useCallback } from 'react';
import { MousePointer2, Cctv } from 'lucide-react';
import ThreeScene from './components/ThreeScene';
import Navigation from './components/Bars/Navigation';
import GeometrySelector from './components/GeometrySelector';
import Sidebar from './components/Bars/Sidebar';
import VolumeForm from './components/Navigation/Edit/VolumeForm/VolumeForm';
import CompositionPanel from './components/Navigation/Edit/VolumeForm/CompositionPanel';
import LineSpectrumPanel from './components/Navigation/Edit/VolumeForm/LineSpectrumPanel';
import GroupSpectrumPanel from './components/Navigation/Edit/VolumeForm/GroupSpectrumPanel';
import GeometryPanel from './components/Navigation/Inspector/GeometryPanel';
import SensorPanel from './components/Navigation/Edit/Insert/SensorPanel';
import CompoundVolume from './components/Navigation/Edit/Insert/CompoundVolume';
import HelpOverlay from './components/HelpOverlay';
import ContextualHelp from './components/ContextualHelp';
import BottomBar from './components/Bars/BottomBar';
import RotationSliders from './components/RotationSliders';
import Directory from './components/Directory';
import DockingConnector from './components/DockingConnector';
import VolumePropertiesPanel from './components/VolumePropertiesPanel';
import PhysicsControlPanel from './components/PhysicsControlPanel';
import { AuthProvider } from './contexts/AuthContext';
import ApiService from './services/api';

export default function App() {
  const [showVolumeForm, setShowVolumeForm] = useState(false);
  const [showGeometryPanel, setShowGeometryPanel] = useState(false);
  const [showSensorPanel, setShowSensorPanel] = useState(false);
  const [showCompoundVolume, setShowCompoundVolume] = useState(false);
  const [showVolumeProperties, setShowVolumeProperties] = useState(false);
  const [selectedVolumeData, setSelectedVolumeData] = useState(null);
  const [showPhysicsPanel, setShowPhysicsPanel] = useState(false);
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

  // Layout configuration state
  const [layoutConfig, setLayoutConfig] = useState({
    sidebar: 'right', // 'right', 'left', 'top', 'bottom'
    geometrySelector: 'left', // 'left', 'right', 'top', 'bottom'
    directory: 'left' // 'left', 'right', 'top', 'bottom'
  });

  // Panel visibility states for volume form panels
  const [showCompositionPanel, setShowCompositionPanel] = useState(false);
  const [showLineSpectrumPanel, setShowLineSpectrumPanel] = useState(false);
  const [showGroupSpectrumPanel, setShowGroupSpectrumPanel] = useState(false);

  // API service and current project
  const apiService = ApiService;
  const [currentProject, setCurrentProject] = useState(null);

  // Current composition and spectrum data
  const [currentComposition, setCurrentComposition] = useState(null);
  const [currentSpectrum, setCurrentSpectrum] = useState(null);

  // Docking system state
  const [dockedComponents, setDockedComponents] = useState([]);

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

  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId);
    
    // Update camera mode when camera tool is used
    if (toolId === 'camera') {
      setCameraMode(prev => prev === 'perspective' ? 'orthographic' : 'perspective');
    }
  };

  const handleShowVolumeForm = () => {
    setShowVolumeForm(true);
    // Also ensure the volume form component is visible
    setComponentVisibility(prev => ({
      ...prev,
      volumeForm: true
    }));
  };

  const handleVolumeFormClose = () => {
    setShowVolumeForm(false);
    // Also hide the volume form component
    setComponentVisibility(prev => ({
      ...prev,
      volumeForm: false
    }));
  };

  const handleVolumeFormSave = (volumeData) => {
    // Create the 3D geometry in the scene
    if (createGeometryFunction && volumeData.geometryType) {
      const geometry = createGeometryFunction(volumeData.geometryType);
      
      // If geometry was created successfully, add it to existing volumes with volume data
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
        
        // Add to existing volumes for tracking
        setExistingVolumes(prev => [...prev, {
          id: geometry.userData.id,
          type: volumeData.geometryType,
          name: volumeData.volume,
          position: geometry.position,
          visible: geometry.userData.visible !== false, // Include visibility state
          userData: geometry.userData
        }]);
      }
    }
    
    setShowVolumeForm(false);
    // Also hide the volume form component
    setComponentVisibility(prev => ({
      ...prev,
      volumeForm: false
    }));
  };

  // Panel handlers
  const handleCompositionChange = (compositionData) => {
    setCurrentComposition(compositionData);
  };

  const handleSpectrumChange = (spectrumData) => {
    setCurrentSpectrum(spectrumData);
  };

  const handleCompositionUse = (compositionData) => {
    setCurrentComposition(compositionData);
    setShowCompositionPanel(false);
  };

  const handleCompositionStore = (compositionData) => {
    // In real app, this would save to database
    handleCompositionUse(compositionData);
  };

  const handleSpectrumValidate = (spectrumData) => {
    setCurrentSpectrum(spectrumData);
    setShowLineSpectrumPanel(false);
    setShowGroupSpectrumPanel(false);
  };

  const handleSpectrumSaveAs = (spectrumData) => {
    // In real app, this would save to database
    handleSpectrumValidate(spectrumData);
  };

  const handleGeometrySelect = (geometryType) => {
    if (createGeometryFunction) {
      const geometry = createGeometryFunction(geometryType);
      setHasObjects(true);
      
      // Add to existing volumes list for geometry panel
      if (geometry && geometry.userData) {
        const volumeData = {
          id: geometry.userData.id || Date.now(),
          type: geometry.userData.type,
          position: geometry.position,
          visible: geometry.userData.visible !== false, // Include visibility state
          userData: geometry.userData
        };
        setExistingVolumes(prev => [...prev, volumeData]);
      }
    }
  };

  const handleGeometryCreate = useCallback((createFunction) => {
    setCreateGeometryFunction(() => createFunction);
  }, []);

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

  const createCompoundVolumes = (exampleData) => {
    const volumes = [];
    // Use a timestamp-based ID to ensure uniqueness across multiple loads
    const baseId = Date.now();
    let volumeId = 0;
    
    switch (exampleData.id) {
      case 'contaminated-tube':
        // TUBTUTOT.PCS - Contaminated Steel Tube with UO2 Layer
        volumes.push(
          {
            type: 'cylinder',
            parameters: { radiusTop: 0.1, radiusBottom: 0.1, height: 0.5 },
            position: { x: 0, y: 1.25, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Outer Steel Tube',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'Outer Steel Tube',
              isSource: false,
              composition: { name: 'Stainless Steel', density: 7.85, color: '#A9A9A9' },
              importedFrom: exampleData.name,
              isExample: true
            }
          },
          {
            type: 'cylinder',
            parameters: { radiusTop: 0.095, radiusBottom: 0.095, height: 0.5 },
            position: { x: 0, y: 1.25, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'UO2 Source Layer',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'UO2 Source Layer',
              isSource: true,
              composition: { name: 'Uranium Oxide', density: 10.97, color: '#FFD700' },
              importedFrom: exampleData.name,
              isExample: true
            }
          },
          {
            type: 'cylinder',
            parameters: { radiusTop: 0.09, radiusBottom: 0.09, height: 0.5 },
            position: { x: 0, y: 1.25, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Air Space',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'Air Space',
              isSource: false,
              composition: { name: 'Air', density: 0.001225, color: '#87CEEB' },
              importedFrom: exampleData.name,
              isExample: true
            }
          }
        );
        break;
        
      case 'reactor-vessel':
        // REACTOR_VESSEL.PCS - Nuclear Reactor Pressure Vessel
        volumes.push(
          {
            type: 'cylinder',
            parameters: { radiusTop: 2.25, radiusBottom: 2.25, height: 12 },
            position: { x: 0, y: 6, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Steel Shell',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'Steel Shell',
              isSource: false,
              composition: { name: 'Carbon Steel', density: 7.85, color: '#A9A9A9' },
              importedFrom: exampleData.name,
              isExample: true
            }
          },
          {
            type: 'cylinder',
            parameters: { radiusTop: 2.23, radiusBottom: 2.23, height: 12 },
            position: { x: 0, y: 6, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Stainless Steel Liner',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'Stainless Steel Liner',
              isSource: false,
              composition: { name: 'SS304', density: 8.0, color: '#C0C0C0' },
              importedFrom: exampleData.name,
              isExample: true
            }
          },
          {
            type: 'cylinder',
            parameters: { radiusTop: 3.25, radiusBottom: 3.25, height: 12 },
            position: { x: 0, y: 6, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Concrete Shield',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'Concrete Shield',
              isSource: false,
              composition: { name: 'Heavy Concrete', density: 2.4, color: '#8B7355' },
              importedFrom: exampleData.name,
              isExample: true
            }
          }
        );
        break;
        
      case 'waste-container':
        // WASTE_CONTAINER.PCS - High-Level Waste Storage Container
        volumes.push(
          {
            type: 'cylinder',
            parameters: { radiusTop: 0.75, radiusBottom: 0.75, height: 2 },
            position: { x: 0, y: 2, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Lead Shield',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'Lead Shield',
              isSource: false,
              composition: { name: 'Lead', density: 11.34, color: '#708090' },
              importedFrom: exampleData.name,
              isExample: true
            }
          },
          {
            type: 'cylinder',
            parameters: { radiusTop: 0.7, radiusBottom: 0.7, height: 2 },
            position: { x: 0, y: 2, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Steel Container',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'Steel Container',
              isSource: false,
              composition: { name: 'Stainless Steel', density: 7.85, color: '#A9A9A9' },
              importedFrom: exampleData.name,
              isExample: true
            }
          },
          {
            type: 'cylinder',
            parameters: { radiusTop: 1.25, radiusBottom: 1.25, height: 2 },
            position: { x: 0, y: 2, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Concrete Overpack',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'cylinder',
              volumeName: 'Concrete Overpack',
              isSource: false,
              composition: { name: 'Reinforced Concrete', density: 2.4, color: '#8B7355' },
              importedFrom: exampleData.name,
              isExample: true
            }
          }
        );
        break;
        
      case 'fuel-assembly':
        // FUEL_ASSEMBLY.PCS - Nuclear Fuel Assembly
        volumes.push(
          {
            type: 'box',
            parameters: { width: 0.2, height: 4.5, depth: 0.2 },
            position: { x: 0, y: 3.25, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Fuel Assembly Structure',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'box',
              volumeName: 'Fuel Assembly Structure',
              isSource: false,
              composition: { name: 'Zircaloy-4', density: 6.56, color: '#C0C0C0' },
              importedFrom: exampleData.name,
              isExample: true
            }
          },
          {
            type: 'box',
            parameters: { width: 0.18, height: 4.5, depth: 0.18 },
            position: { x: 0, y: 3.25, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            name: 'Fuel Rods',
            userData: {
              id: `volume-${baseId}-${volumeId++}`,
              type: 'box',
              volumeName: 'Fuel Rods',
              isSource: true,
              composition: { name: 'UO2 Pellets', density: 10.97, color: '#FFD700' },
              importedFrom: exampleData.name,
              isExample: true
            }
          }
        );
        break;
        
      default:
        console.warn('Unknown example type:', exampleData.id);
    }
    
    return volumes;
  };

  const loadExampleScene = (exampleData) => {
    
    // Check if this example is already loaded to prevent duplicates
    const existingExampleVolumes = existingVolumes.filter(vol => 
      vol.userData?.isExample === true && 
      (vol.userData?.importedFrom === exampleData.name || 
       vol.userData?.volumeName?.includes(exampleData.name) ||
       vol.userData?.volumeName?.includes('Steel Tube') ||
       vol.userData?.volumeName?.includes('UO2') ||
       vol.userData?.volumeName?.includes('Air Space'))
    );
    
    if (existingExampleVolumes.length > 0) {
      return;
    }
    
    // Clear existing scene first
    if (window.clearScene) {
      window.clearScene();
    }
    // Clear existing volumes from state
    setExistingVolumes([]);
    setHasObjects(false);
    setSelectedGeometry(null);
    setHasSelectedObject(false);
    
    // Create compound volumes based on the example
    const volumes = createCompoundVolumes(exampleData);
    
    // Add each volume to the scene using createGeometryFromData
    volumes.forEach(volume => {
      if (window.createGeometryFromData) {
        const objData = {
          type: volume.type,
          geometry: {
            type: volume.type,
            parameters: volume.parameters
          },
          position: volume.position,
          scale: volume.scale,
          userData: volume.userData
        };
        
        const geometry = window.createGeometryFromData(objData);
        if (geometry) {
          // Add to existing volumes list
          const volumeData = {
            id: geometry.userData.id || Date.now(),
            type: geometry.userData.type,
            position: geometry.position,
            visible: geometry.userData.visible !== false,
            userData: geometry.userData
          };
          setExistingVolumes(prev => [...prev, volumeData]);
        }
      }
    });
    
    setHasObjects(true);
  };

  // Layout swap functionality - Only 2 layouts: left/right swap
  const cycleLayout = () => {
    setLayoutConfig(prev => {
      // Toggle between the two layouts
      if (prev.sidebar === 'right') {
        // Switch to: Sidebar left, Directory + Geometry right
        return {
          sidebar: 'left',
          geometrySelector: 'right',
          directory: 'right'
        };
      } else {
        // Switch to: Sidebar right, Directory + Geometry left
        return {
          sidebar: 'right',
          geometrySelector: 'left',
          directory: 'left'
        };
      }
    });
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

  // Docking system handlers
  const handleDockComponent = (componentType, componentData) => {
    if (dockedComponents.length >= 3) {
      console.warn('Maximum of 3 components can be docked');
      return;
    }

    const newComponent = {
      id: Date.now(),
      type: componentType,
      name: componentData.name || componentType,
      data: componentData,
      dockedAt: new Date().toISOString()
    };

    setDockedComponents(prev => [...prev, newComponent]);
  };

  const handleUndockComponent = (componentId) => {
    setDockedComponents(prev => prev.filter(comp => comp.id !== componentId));
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
    setHasSelectedObject(hasSelection);
    
    // If an object is selected, prepare it for the geometry panel
    if (hasSelection && selectedObject) {
      setSelectedGeometry({
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
      setSelectedGeometry(null);
    }
  };

  const handleShowGeometryPanel = () => {
    // Always show the panel, even if no geometry is selected
    setShowGeometryPanel(true);
  };

  const handleGeometryPanelClose = (geometryData = null) => {
    if (geometryData) {
      // TODO: Apply geometry changes to the 3D scene
      if (window.updateGeometry) {
        window.updateGeometry(selectedGeometry.id, geometryData);
      }
    }
    setShowGeometryPanel(false);
  };

  const handleGeometryChanged = (geometryId, changes) => {
    // Update the existingVolumes state when geometry changes
    setExistingVolumes(prev => prev.map(volume => {
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
    if (selectedGeometry && selectedGeometry.id === geometryId) {
      setSelectedGeometry(prev => ({
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
    setShowSensorPanel(true);
    setComponentVisibility(prev => ({
      ...prev,
      sensorPanel: true
    }));
  };

  const handleSensorPanelClose = () => {
    setShowSensorPanel(false);
    setComponentVisibility(prev => ({
      ...prev,
      sensorPanel: false
    }));
  };

  const handleSensorSave = (sensorData) => {
    if (Array.isArray(sensorData)) {
      // Multiple sensors (from validation or deletion)
      setExistingSensors(sensorData);
    } else {
      // Single sensor (new or updated)
      setExistingSensors(prev => {
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
    setExistingSensors(sensors);
  };

  const handleShowCompoundVolume = () => {
    setShowCompoundVolume(true);
    setComponentVisibility(prev => ({
      ...prev,
      compoundVolume: true
    }));
  };

  const handleCompoundVolumeClose = () => {
    setShowCompoundVolume(false);
    setComponentVisibility(prev => ({
      ...prev,
      compoundVolume: false
    }));
  };

  // Physics simulation handlers
  const handlePhysicsPanelClose = () => {
    setShowPhysicsPanel(false);
  };

  const handleStartPhysicsSimulation = (config) => {
    setIsPhysicsSimulating(true);
    setPhysicsSimulationProgress(0);
    
    // Run the simulation using the global function
    if (window.runPhysicsSimulation) {
      try {
        const results = window.runPhysicsSimulation(config);
        setPhysicsSimulationResults(results || []);
        
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
    
    setIsPhysicsSimulating(false);
    setPhysicsSimulationProgress(1);
  };

  const handleStopPhysicsSimulation = () => {
    setIsPhysicsSimulating(false);
    if (window.stopPhysicsSimulation) {
      window.stopPhysicsSimulation();
    }
  };

  const handlePhysicsSimulationProgress = (progress) => {
    setPhysicsSimulationProgress(progress);
  };

  const handlePhysicsSimulationComplete = (results) => {
    setPhysicsSimulationResults(results);
    setIsPhysicsSimulating(false);
    setPhysicsSimulationProgress(1);
    
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
    setExistingVolumes(prev => [...prev, ...mockVolumes]);
    
    // Create geometries in 3D scene
    mockVolumes.forEach(volume => {
      if (window.createGeometryFromData) {
        window.createGeometryFromData(volume);
      }
    });
    
  };

  const handleToggleComponentVisibility = (componentKey, isVisible) => {
    setComponentVisibility(prev => ({
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
    setExistingCompositions(compositions);
  };

  const handleSensorsChange = (sensors) => {
    setExistingSensors(sensors);
  };

  const handleSpectraChange = (spectra) => {
    setExistingSpectra(spectra);
  };

  // Clear all objects handler
  const handleClearAllObjects = () => {
    if (window.confirm('Are you sure you want to delete ALL objects from the scene? This action cannot be undone.')) {
      // Clear from 3D scene
      if (window.clearScene) {
        window.clearScene();
      }
      
      // Clear from state
      setExistingVolumes([]);
      setExistingSensors([]);
      setExistingCompositions([]);
      setExistingSpectra([]);
      setHasObjects(false);
      setSelectedGeometry(null);
      setHasSelectedObject(false);
      
      // Clear from localStorage
      if (window.clearSavedScene) {
        window.clearSavedScene();
      }
      
    }
  };

  // Function to collect current scene data
  const getSceneData = () => {
    const sceneData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      metadata: {
        name: 'Mercurad Scene',
        description: '3D Scene with volumes and geometries',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      scene: {
        camera: {
          mode: cameraMode,
          position: window.getCameraPosition ? window.getCameraPosition() : { x: 0, y: 5, z: 10 },
          rotation: window.getCameraRotation ? window.getCameraRotation() : { x: 0, y: 0, z: 0 }
        },
        view: {
          mode: window.getViewMode ? window.getViewMode() : 'solid',
          material: window.getMaterialMode ? window.getMaterialMode() : 'solid'
        },
        axis: window.getAxisView ? window.getAxisView() : 'Z'
      },
      objects: existingVolumes.map(volume => ({
        id: volume.id,
        type: volume.type,
        name: volume.userData?.volumeName || 'Unnamed Volume',
        position: volume.position,
        geometry: {
          type: volume.type,
          parameters: volume.userData?.geometryParameters || {}
        },
        volume: {
          name: volume.userData?.volumeName || 'Unnamed Volume',
          type: volume.userData?.volumeType || 'Unknown',
          composition: volume.userData?.composition || null,
          realDensity: volume.userData?.realDensity || 0,
          tolerance: volume.userData?.tolerance || 0,
          isSource: volume.userData?.isSource || false,
          calculation: volume.userData?.calculation || null,
          gammaSelectionMode: volume.userData?.gammaSelectionMode || null,
          spectrum: volume.userData?.spectrum || null
        },
        userData: volume.userData
      })),
      sensors: existingSensors,
      compositions: existingCompositions,
      spectra: existingSpectra,
      settings: {
        componentVisibility,
        selectedTool,
        hasObjects,
        hasSelectedObject
      }
    };
    
    return sceneData;
  };

  // Function to load scene data
  const loadSceneData = (sceneData) => {
 try {
      // Load scene settings
      if (sceneData.scene) {
        // Load camera settings
        if (sceneData.scene.camera) {
          if (window.setCameraPosition && sceneData.scene.camera.position) {
            // Note: Camera position will be handled by ThreeScene component
          }
          if (window.setAxisView && sceneData.scene.camera.mode) {
            // Set camera mode if different
            if (sceneData.scene.camera.mode !== cameraMode) {
              setCameraMode(sceneData.scene.camera.mode);
            }
          }
        }
        
        // Load view settings
        if (sceneData.scene.view) {
          if (window.setViewMode && sceneData.scene.view.mode) {
            window.setViewMode(sceneData.scene.view.mode);
          }
          if (window.setMaterialMode && sceneData.scene.view.material) {
            window.setMaterialMode(sceneData.scene.view.material);
          }
        }
        
        // Load axis setting
        if (sceneData.scene.axis && window.setAxisView) {
          window.setAxisView(sceneData.scene.axis);
        }
      }
      
      // Load objects/volumes
      if (sceneData.objects && Array.isArray(sceneData.objects)) {
        // Clear existing volumes first
        setExistingVolumes([]);
        
        // Load each object
        sceneData.objects.forEach(obj => {
          if (window.createGeometryFromData) {
            const geometry = window.createGeometryFromData(obj);
            if (geometry) {
              setExistingVolumes(prev => [...prev, {
                id: obj.id,
                type: obj.type,
                name: obj.name,
                position: obj.position,
                visible: obj.visible !== false, // Include visibility state
                userData: obj.userData
              }]);
            }
          }
        });
        
        // Update object states
        setHasObjects(sceneData.objects.length > 0);
        setHasSelectedObject(false);
      }
      
      // Load sensors
      if (sceneData.sensors && Array.isArray(sceneData.sensors)) {
        setExistingSensors(sceneData.sensors);
        
        // Create sensors in 3D scene
        sceneData.sensors.forEach(sensor => {
          if (window.createSensor) {
            window.createSensor(sensor);
          }
        });
      }
      
      // Load compositions
      if (sceneData.compositions && Array.isArray(sceneData.compositions)) {
        setExistingCompositions(sceneData.compositions);
      }
      
      // Load spectra
      if (sceneData.spectra && Array.isArray(sceneData.spectra)) {
        setExistingSpectra(sceneData.spectra);
      }
      
      // Preserve current UI state instead of loading saved component visibility
      // This prevents the directory watcher from disappearing and rotation sliders from appearing
      // when loading projects. Users can manually adjust UI layout as needed.
      
      // Only load selected tool if it's different from current
      if (sceneData.settings && sceneData.settings.selectedTool && sceneData.settings.selectedTool !== selectedTool) {
        setSelectedTool(sceneData.settings.selectedTool);
      }
 } catch (error) {
      console.error('Error loading scene data:', error);
    }
  };

  // Function to load data from localStorage and sync with existingVolumes
  const loadFromLocalStorage = () => {
    try {
      // Check if scene was explicitly cleared in a previous session
      const sceneCleared = localStorage.getItem('mercurad_scene_cleared') === 'true';
      if (sceneCleared) {
        console.log('Scene restoration skipped - scene was explicitly cleared');
        localStorage.removeItem('mercurad_scene_cleared');
        return;
      }
      
      // Set a flag to prevent duplicate additions during restoration
      window.isRestoringFromLocalStorage = true;
      
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) return;
      
      const sceneData = JSON.parse(savedData);
      
      if (sceneData.geometries && Array.isArray(sceneData.geometries)) {
        // Check for excessive volumes (likely duplicates)
        if (sceneData.geometries.length > 20) {
          console.warn(`Detected ${sceneData.geometries.length} volumes, which seems excessive. Clearing localStorage to prevent duplicates.`);
          localStorage.removeItem('mercurad_scene');
          return;
        }
        
        // Convert localStorage geometries to existingVolumes format
        let volumes = sceneData.geometries.map(geometryData => ({
          id: geometryData.id,
          type: geometryData.type,
          name: geometryData.volumeName || `Volume_${geometryData.id}`,
          userData: {
            volumeName: geometryData.volumeName || `Volume_${geometryData.id}`,
            id: geometryData.id,
            type: geometryData.type,
            originalColor: geometryData.originalColor,
            visible: true,
            // Include additional userData if available
            ...geometryData.userData
          },
          position: geometryData.position,
          rotation: geometryData.rotation,
          scale: geometryData.scale
        }));
        
        // Remove duplicates based on ID (more reliable than position-based)
        const uniqueVolumes = [];
        const seenIds = new Set();
        
        volumes.forEach(volume => {
          if (!seenIds.has(volume.id)) {
            seenIds.add(volume.id);
            uniqueVolumes.push(volume);
          } else {
            console.warn('Duplicate volume ID detected and removed:', volume.id, volume.userData?.volumeName);
          }
        });
        
        if (uniqueVolumes.length !== volumes.length) {
          console.log(`Removed ${volumes.length - uniqueVolumes.length} duplicate volumes`);
        }
        
        console.log('Setting existingVolumes:', uniqueVolumes.length, 'volumes');
        setExistingVolumes(uniqueVolumes);
        
        // Create geometries in the 3D scene (with delay to ensure ThreeScene is initialized)
        setTimeout(() => {
          uniqueVolumes.forEach(volume => {
            if (window.createGeometryFromData) {
              const objData = {
                type: volume.type,
                geometry: {
                  type: volume.type,
                  parameters: volume.userData?.geometryParameters || {}
                },
                position: volume.position,
                rotation: volume.rotation,
                scale: volume.scale,
                userData: volume.userData,
                volume: volume.userData,
                visible: volume.visible !== false,
                name: volume.name
              };
              
              const geometry = window.createGeometryFromData(objData);
              if (geometry) {
                console.log('Restored geometry in scene:', volume.name);
              }
            } else {
              console.warn('createGeometryFromData not available yet');
            }
          });
        }, 200);
      }
      
      // Load compositions, sensors, and spectra from localStorage
      if (sceneData.compositions && Array.isArray(sceneData.compositions)) {
        setExistingCompositions(sceneData.compositions);
      }
      
      if (sceneData.sensors && Array.isArray(sceneData.sensors)) {
        setExistingSensors(sceneData.sensors);
      }
      
      if (sceneData.spectra && Array.isArray(sceneData.spectra)) {
        setExistingSpectra(sceneData.spectra);
      }
      
      // Clear the restoration flag
      setTimeout(() => {
        window.isRestoringFromLocalStorage = false;
      }, 500);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Clear the restoration flag even on error
      window.isRestoringFromLocalStorage = false;
    }
  };

  // Handle help toggle from F1 key
  useEffect(() => {
    const handleToggleHelp = () => {
      setShowHelp(prev => !prev);
      // Also toggle the help overlay visibility
      setComponentVisibility(prev => ({
        ...prev,
        helpOverlay: !prev.helpOverlay
      }));
    };

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('toggleHelp', handleToggleHelp);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });

    // Expose loadSceneData function globally
    window.loadSceneData = loadSceneData;

    // Load data from localStorage on component mount
    loadFromLocalStorage();

    return () => {
      window.removeEventListener('toggleHelp', handleToggleHelp);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      delete window.loadSceneData;
    };
  }, []);

  // Keep hasObjects in sync with existingVolumes
  useEffect(() => {
    console.log('existingVolumes changed:', existingVolumes.length, 'volumes');
    setHasObjects(existingVolumes.length > 0);
  }, [existingVolumes]);


  return (
    <AuthProvider>
      <div className={`bg-neutral-800 h-screen relative overflow-hidden ${
        windowSize.width < 640 ? 'text-xs' : 'text-sm'
      }`}>
      {/* Three.js Scene Container - Higher z-index for interactions */}
      <div className="absolute inset-0 z-20">
        <ThreeScene
          selectedTool={selectedTool}
          onGeometryCreate={handleGeometryCreate}
          onToolSelect={handleToolSelect}
          onSelectionChange={handleSelectionChange}
          onAxisChange={handleAxisChange}
          onViewModeChange={handleViewModeChange}
          onGeometryDeleted={(geometryId) => {
            // Remove the geometry from the existing volumes list
            setExistingVolumes(prev => {
              const updated = prev.filter(volume => volume.id !== geometryId);
              return updated;
            });
            // Update object states - will be updated when existingVolumes changes
            if (selectedGeometry?.id === geometryId) {
              setSelectedGeometry(null);
              setHasSelectedObject(false);
            }
          }}
          onGeometryVisibilityChanged={(geometryId, visible) => {
            // Update visibility in the existing volumes list
            setExistingVolumes(prev => prev.map(volume => 
              volume.id === geometryId 
                ? { ...volume, visible }
                : volume
            ));
          }}
          onGeometryChanged={handleGeometryChanged}
          onGeometryCreated={(mesh) => {
            // Skip if we're restoring from localStorage to prevent duplicates
            if (window.isRestoringFromLocalStorage) {
              console.log('Skipping onGeometryCreated during restoration');
              return;
            }
            
            // Handle geometry created via drag and drop
            setHasObjects(true);
            
            // Add to existing volumes list for geometry panel and directory
            if (mesh && mesh.userData) {
              const volumeData = {
                id: mesh.userData.id || Date.now(),
                type: mesh.userData.type,
                position: mesh.position,
                visible: mesh.userData.visible !== false, // Include visibility state
                userData: mesh.userData
              };
              setExistingVolumes(prev => [...prev, volumeData]);
            }
          }}
          existingCompositions={existingCompositions}
          existingSensors={existingSensors}
          existingSpectra={existingSpectra}
          onCompositionsChange={handleCompositionsChange}
          onSensorsChange={handleSensorsChange}
          onSpectraChange={handleSpectraChange}
        />
      </div>
      
      {/* UI Overlay - Lower z-index, positioned elements */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {/* Navigation Bar - Top */}
        <div className="absolute top-0 left-0 right-0 pointer-events-auto">
          <Navigation 
            onShowVolumeForm={handleShowVolumeForm}
            onToggleHelp={() => setShowHelp(prev => !prev)}
            onAxisChange={handleAxisChange}
            onViewModeChange={handleViewModeChange}
            onMaterialChange={handleMaterialChange}
            onViewMenuAction={handleViewMenuAction}
            onShowGeometryPanel={handleShowGeometryPanel}
          onShowSensorPanel={handleShowSensorPanel}
          onShowCompoundVolume={handleShowCompoundVolume}
          onShowPhysicsPanel={() => setShowPhysicsPanel(true)}
          onToggleComponentVisibility={handleToggleComponentVisibility}
          sceneData={getSceneData()}
          selectedVolume={selectedGeometry}
          onMeshValidate={handleMeshValidate}
          onComputationComplete={handleComputationComplete}
          onSceneGenerated={handleSceneGenerated}
          />
        </div>
        
        {/* Geometry Selector - Draggable floating component positioned next to Directory */}
        {componentVisibility.geometrySelector && (
          <GeometrySelector 
            key={`geometry-selector-${layoutConfig.geometrySelector}`}
            onGeometrySelect={handleGeometrySelect} 
            layoutPosition={layoutConfig.directory}
          />
        )}

        {/* Directory - Full height, positioned by layout */}
        {componentVisibility.directory && (
          <Directory
            key={`directory-${existingVolumes.length}-${layoutConfig.directory}`}
            isVisible={true}
            layoutPosition={layoutConfig.directory}
            onClose={() => {
              setComponentVisibility(prev => ({ ...prev, directory: false }));
            }}
            existingVolumes={existingVolumes}
            existingSensors={existingSensors}
            existingCompositions={existingCompositions}
            existingSpectra={existingSpectra}
            onRenameObject={async (id, newName) => {
              try {
                // Update the object name in the 3D scene
                if (window.updateGeometryName) {
                  window.updateGeometryName(id, newName);
                }
                
                // Update the object name in the volumes list
                setExistingVolumes(prev => prev.map(volume => 
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
                if (currentProject && apiService) {
                  try {
                    await apiService.updateVolumeName(currentProject.id, id, newName);
                  } catch (error) {
                    console.error('Failed to update volume name in backend:', error);
                    // Don't show error to user as the frontend update already succeeded
                  }
                }
              } catch (error) {
                console.error('Error updating volume name:', error);
              }
            }}
            onDeleteObject={(id, objectType) => {
              
              // Handle different object types
              switch (objectType) {
                case 'composition':
                  // Remove from compositions list
                  setExistingCompositions(prev => prev.filter(comp => comp.id !== id));
                  // Sync with localStorage
                  if (window.handleCompositionDeleted) {
                    window.handleCompositionDeleted(id);
                  }
                  break;
                  
                case 'source':
                  // Remove from sources list (sources are volumes with isSource: true)
                  setExistingVolumes(prev => prev.filter(volume => volume.id !== id));
                  // Sync with localStorage
                  if (window.handleSourceDeleted) {
                    window.handleSourceDeleted(id);
                  }
                  break;
                  
                case 'sensor':
                  // Remove from sensors list
                  setExistingSensors(prev => prev.filter(sensor => sensor.id !== id));
                  // Sync with localStorage
                  if (window.handleSensorDeleted) {
                    window.handleSensorDeleted(id);
                  }
                  break;
                  
                case 'spectrum':
                  // Remove from spectra list
                  setExistingSpectra(prev => prev.filter(spectrum => spectrum.id !== id));
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
                      setExistingVolumes(prev => prev.filter(volume => volume.id !== id));
                    }
                  } else {
                    // Fallback: remove from volumes list manually
                    setExistingVolumes(prev => prev.filter(volume => volume.id !== id));
                  }
                  break;
              }
            }}
            onSelectObject={(object) => {
              // Handle example loading differently
              if (object.type === 'example') {
                loadExampleScene(object.data);
              } else {
                // Select the object in the 3D scene
                if (window.selectGeometry) {
                  window.selectGeometry(object.data);
                }
                // Update the selected geometry state
                setSelectedGeometry({
                  type: object.objectType || object.type,
                  id: object.id,
                  position: object.data.position,
                  userData: object.data.userData
                });
                setHasSelectedObject(true);
              }
            }}
            onToggleVisibility={(id, visible) => {
              // Toggle object visibility in 3D scene
              if (window.toggleGeometryVisibility) {
                const success = window.toggleGeometryVisibility(id, visible);
                if (success) {
                  // The onGeometryVisibilityChanged callback will handle updating existingVolumes
                } else {
                  console.warn(`Failed to toggle geometry ${id} visibility`);
                }
              }
            }}
            onClearAllObjects={handleClearAllObjects}
            onShowProperties={(item) => {
              // Show comprehensive properties for the selected object
              if (item.data) {
                // Set the volume data for the properties panel
                setSelectedVolumeData(item.data);
                setShowVolumeProperties(true);
                
                // Also set selected geometry for the geometry panel if needed
                setSelectedGeometry({
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
            }}
            selectedObjectId={selectedGeometry?.id}
          />
        )}

        {/* Docking Connector - Handles docking behind Directory */}
        {componentVisibility.directory && (
          <DockingConnector
            layoutPosition={layoutConfig.directory}
            dockedComponents={dockedComponents}
            onDockComponent={handleDockComponent}
            onUndockComponent={handleUndockComponent}
          />
        )}

        {/* Rotation Sliders - Draggable */}
        {componentVisibility.rotationSliders && (
        <RotationSliders onRotationChange={handleSceneRotationChange} />
        )}

        {/* Volume Form - Draggable */}
        {componentVisibility.volumeForm && showVolumeForm && (
        <VolumeForm
            isVisible={true}
          onClose={handleVolumeFormClose}
          onSave={handleVolumeFormSave}
          onShowCompositionPanel={() => setShowCompositionPanel(true)}
          onShowLineSpectrumPanel={() => setShowLineSpectrumPanel(true)}
          onShowGroupSpectrumPanel={() => setShowGroupSpectrumPanel(true)}
          onCompositionChange={handleCompositionChange}
          onSpectrumChange={handleSpectrumChange}
        />
        )}

        {/* Layout Swap Button - Top Right */}
        <div className="absolute top-20 right-2 sm:right-4 pointer-events-auto z-30">
          <button
            onClick={cycleLayout}
            className="bg-neutral-700 hover:bg-neutral-600 text-white p-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2"
            title="Toggle Layout (Left/Right Swap)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              <path d="M3 8h18"/>
              <path d="M8 3v18"/>
              <path d="M16 3v18"/>
            </svg>
            <span className="text-xs font-medium">Layout</span>
          </button>
        </div>

        {/* Sidebar - Responsive positioning based on layout config */}
        <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-auto ${
          layoutConfig.sidebar === 'right' ? 'right-2 sm:right-4' : 
          layoutConfig.sidebar === 'left' ? 'left-2 sm:left-4' :
          layoutConfig.sidebar === 'top' ? 'top-16 left-1/2 transform -translate-x-1/2' :
          'bottom-16 left-1/2 transform -translate-x-1/2'
        }`}>
          <Sidebar selectedTool={selectedTool} onToolSelect={handleToolSelect} cameraMode={cameraMode} />
        </div>

        {/* Mobile Toolbar - Bottom Right for small screens */}
        {windowSize.width < 640 && (
          <div className="absolute bottom-16 right-2 pointer-events-auto">
            <div className="bg-neutral-700 rounded-lg shadow-lg p-2">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleToolSelect('select')}
                  className={`p-2 rounded ${selectedTool === 'select' ? 'bg-neutral-600' : 'hover:bg-neutral-600'}`}
                  title="Select Tool"
                >
                  <MousePointer2 size={16} className="text-white" />
                </button>
                <button
                  onClick={() => handleToolSelect('camera')}
                  className={`p-2 rounded ${selectedTool === 'camera' ? 'bg-neutral-600' : 'hover:bg-neutral-600'}`}
                  title={`Camera (${cameraMode})`}
                >
                  <Cctv size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Geometry Panel - Draggable */}
        <GeometryPanel 
          isOpen={showGeometryPanel}
          onClose={handleGeometryPanelClose}
          selectedGeometry={selectedGeometry}
          existingVolumes={existingVolumes}
        />

        {/* Sensor Panel - Draggable */}
        <SensorPanel
          isVisible={showSensorPanel}
          onClose={handleSensorPanelClose}
          onValidate={handleSensorValidate}
          onSaveAs={handleSensorSave}
          existingSensors={existingSensors}
          existingCompositions={existingCompositions}
        />

        {/* Compound Volume Panel - Draggable */}
        <CompoundVolume
          isVisible={showCompoundVolume}
          onClose={handleCompoundVolumeClose}
          onImport={handleCompoundVolumeImport}
          onCancel={handleCompoundVolumeClose}
          existingVolumes={existingVolumes}
          existingCompositions={existingCompositions}
          existingSpectra={existingSpectra}
        />

        {/* Volume Properties Panel - Draggable */}
        <VolumePropertiesPanel
          isVisible={showVolumeProperties}
          onClose={() => setShowVolumeProperties(false)}
          volumeData={selectedVolumeData}
          onEdit={() => {
            // Open geometry panel for editing
            setShowGeometryPanel(true);
            setShowVolumeProperties(false);
          }}
          onDelete={() => {
            // Delete the volume
            if (selectedVolumeData && selectedVolumeData.userData) {
              if (window.removeGeometry) {
                window.removeGeometry(selectedVolumeData.userData.id);
              }
            }
            setShowVolumeProperties(false);
          }}
          onCopy={() => {
            // Copy volume properties to clipboard
            if (selectedVolumeData) {
              const propertiesText = JSON.stringify(selectedVolumeData, null, 2);
              navigator.clipboard.writeText(propertiesText);
            }
          }}
        />

        {/* Physics Control Panel - Draggable */}
        <PhysicsControlPanel
          isVisible={showPhysicsPanel}
          onClose={handlePhysicsPanelClose}
          onStartSimulation={handleStartPhysicsSimulation}
          onStopSimulation={handleStopPhysicsSimulation}
          simulationResults={physicsSimulationResults}
          isSimulating={isPhysicsSimulating}
          simulationProgress={physicsSimulationProgress}
        />

        {/* Contextual Help - Draggable floating component */}
        {componentVisibility.contextualHelp && (
        <ContextualHelp 
          selectedTool={selectedTool}
          hasSelectedObject={hasSelectedObject}
          hasObjects={hasObjects}
            cameraMode={cameraMode}
            windowSize={windowSize}
        />
        )}

        {/* Bottom Bar - Bottom Center - Responsive positioning */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <BottomBar 
            onZoomChange={handleZoomChange}
            onLanguageChange={handleLanguageChange}
            onUnitChange={handleUnitChange}
            onModeChange={handleModeChange}
          />
        </div>
      </div>

      {/* Floating Panels - Draggable across entire scene */}
      <CompositionPanel
        isVisible={showCompositionPanel}
        onClose={() => setShowCompositionPanel(false)}
        onUse={handleCompositionUse}
        onStore={handleCompositionStore}
        initialComposition={currentComposition}
        existingCompositions={existingCompositions}
      />

      <LineSpectrumPanel
        isVisible={showLineSpectrumPanel}
        onClose={() => setShowLineSpectrumPanel(false)}
        onValidate={handleSpectrumValidate}
        onSaveAs={handleSpectrumSaveAs}
        initialSpectrum={currentSpectrum?.type === 'line' ? currentSpectrum : null}
        existingSpectra={existingSpectra.filter(spec => spec.type === 'line')}
      />

      <GroupSpectrumPanel
        isVisible={showGroupSpectrumPanel}
        onClose={() => setShowGroupSpectrumPanel(false)}
        onValidate={handleSpectrumValidate}
        onSaveAs={handleSpectrumSaveAs}
        initialSpectrum={currentSpectrum?.type === 'group' ? currentSpectrum : null}
        existingSpectra={existingSpectra.filter(spec => spec.type === 'group')}
      />

      {/* Help Overlay */}
      {componentVisibility.helpOverlay && (
      <HelpOverlay 
        isVisible={showHelp}
        onClose={() => setShowHelp(false)}
      />
      )}
    </div>
    </AuthProvider>
  );
}

