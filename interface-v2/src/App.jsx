import React, { useState, useEffect, useCallback } from 'react';
import { MousePointer2, Cctv } from 'lucide-react';
import ThreeScene from './components/ThreeScene';
import Navigation from './components/Bars/Navigation';
import GeometrySelector from './components/GeometrySelector';
import Sidebar from './components/Bars/Sidebar';
import VolumeForm from './components/VolumeForm/VolumeForm';
import CompositionPanel from './components/VolumeForm/CompositionPanel';
import LineSpectrumPanel from './components/VolumeForm/LineSpectrumPanel';
import GroupSpectrumPanel from './components/VolumeForm/GroupSpectrumPanel';
import GeometryPanel from './components/GeometryPanel';
import HelpOverlay from './components/HelpOverlay';
import ContextualHelp from './components/ContextualHelp';
import BottomBar from './components/Bars/BottomBar';
import RotationSliders from './components/RotationSliders';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  const [showVolumeForm, setShowVolumeForm] = useState(false);
  const [showGeometryPanel, setShowGeometryPanel] = useState(false);
  const [selectedGeometry, setSelectedGeometry] = useState(null);
  const [existingVolumes, setExistingVolumes] = useState([]);
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
    rotationSliders: true,
    debugPanel: false
  });

  // Panel visibility states for volume form panels
  const [showCompositionPanel, setShowCompositionPanel] = useState(false);
  const [showLineSpectrumPanel, setShowLineSpectrumPanel] = useState(false);
  const [showGroupSpectrumPanel, setShowGroupSpectrumPanel] = useState(false);

  // Current composition and spectrum data
  const [currentComposition, setCurrentComposition] = useState(null);
  const [currentSpectrum, setCurrentSpectrum] = useState(null);

  // Mock data - in real app this would come from database/API
  const [existingCompositions] = useState([
    { name: 'Steel', density: 7.85, color: '#A9A9A9', elements: [{ element: 'Fe', percentage: 98 }, { element: 'C', percentage: 2 }] },
    { name: 'Aluminum', density: 2.70, color: '#C0C0C0', elements: [{ element: 'Al', percentage: 100 }] },
    { name: 'Water', density: 1.00, color: '#87CEEB', elements: [{ element: 'H', percentage: 11.19 }, { element: 'O', percentage: 88.81 }] }
  ]);

  const [existingSpectra] = useState([
    { name: 'Co-60 Standard', type: 'line', multiplier: 1.0, lines: [{ energy: 1173.2, intensity: 99.85 }, { energy: 1332.5, intensity: 99.98 }] },
    { name: 'Cs-137 Standard', type: 'line', multiplier: 1.0, lines: [{ energy: 661.7, intensity: 85.1 }] },
    { name: 'Mixed Fission', type: 'group', multiplier: 1.0, isotopes: ['Cs-137', 'Sr-90', 'I-131'] }
  ]);

  const handleShowVolumeForm = () => {
    setShowVolumeForm(true);
  };

  const handleVolumeFormClose = () => {
    setShowVolumeForm(false);
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
          userData: geometry.userData
        }]);
      }
    }
    
    setShowVolumeForm(false);
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

  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId);
    
    // Update camera mode when camera tool is used
    if (toolId === 'camera') {
      setCameraMode(prev => prev === 'perspective' ? 'orthographic' : 'perspective');
    }
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
    setHasSelectedObject(hasSelection);
    
    // If an object is selected, prepare it for the geometry panel
    if (hasSelection && selectedObject) {
      setSelectedGeometry({
        type: selectedObject.userData?.type || 'unknown',
        id: selectedObject.userData?.id,
        position: selectedObject.position,
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

  const handleToggleComponentVisibility = (componentKey, isVisible) => {
    setComponentVisibility(prev => ({
      ...prev,
      [componentKey]: isVisible
    }));
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
    console.log('Loading scene data:', sceneData);
    
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
                userData: obj.userData
              }]);
            }
          }
        });
        
        // Update object states
        setHasObjects(sceneData.objects.length > 0);
        setHasSelectedObject(false);
      }
      
      // Load component visibility settings
      if (sceneData.settings && sceneData.settings.componentVisibility) {
        setComponentVisibility(sceneData.settings.componentVisibility);
      }
      
      // Load selected tool
      if (sceneData.settings && sceneData.settings.selectedTool) {
        setSelectedTool(sceneData.settings.selectedTool);
      }
      
      console.log('Scene data loaded successfully');
    } catch (error) {
      console.error('Error loading scene data:', error);
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

    return () => {
      window.removeEventListener('toggleHelp', handleToggleHelp);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      delete window.loadSceneData;
    };
  }, []);

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
            onToggleComponentVisibility={handleToggleComponentVisibility}
            sceneData={getSceneData()}
          />
        </div>
        
        {/* Geometry Selector - Draggable */}
        {componentVisibility.geometrySelector && (
          <GeometrySelector onGeometrySelect={handleGeometrySelect} />
        )}

        {/* Rotation Sliders - Draggable */}
        {componentVisibility.rotationSliders && (
          <RotationSliders onRotationChange={handleSceneRotationChange} />
        )}

        {/* Volume Form - Draggable */}
        {componentVisibility.volumeForm && (
          <VolumeForm
            isVisible={showVolumeForm}
            onClose={handleVolumeFormClose}
            onSave={handleVolumeFormSave}
            onShowCompositionPanel={() => setShowCompositionPanel(true)}
            onShowLineSpectrumPanel={() => setShowLineSpectrumPanel(true)}
            onShowGroupSpectrumPanel={() => setShowGroupSpectrumPanel(true)}
            onCompositionChange={handleCompositionChange}
            onSpectrumChange={handleSpectrumChange}
          />
        )}

        {/* Sidebar - Right Side - Responsive positioning */}
        <div className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 pointer-events-auto">
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

