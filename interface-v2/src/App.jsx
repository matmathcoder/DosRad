import React, { useState, useEffect, useCallback } from 'react';
import ThreeScene from './components/ThreeScene';
import Navigation from './components/Navigation';
import GeometrySelector from './components/GeometrySelector';
import Sidebar from './components/Sidebar';
import VolumeForm from './components/VolumeForm/VolumeForm';
import CompositionPanel from './components/VolumeForm/CompositionPanel';
import LineSpectrumPanel from './components/VolumeForm/LineSpectrumPanel';
import GroupSpectrumPanel from './components/VolumeForm/GroupSpectrumPanel';
import GeometryPanel from './components/GeometryPanel';
import HelpOverlay from './components/HelpOverlay';
import ContextualHelp from './components/ContextualHelp';
import BottomBar from './components/BottomBar';
import RotationSliders from './components/RotationSliders';

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
    console.log('Volume created:', volumeData);
    
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
        
        console.log('3D Volume created successfully with data:', geometry.userData);
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
    console.log('Storing composition:', compositionData);
    handleCompositionUse(compositionData);
  };

  const handleSpectrumValidate = (spectrumData) => {
    setCurrentSpectrum(spectrumData);
    setShowLineSpectrumPanel(false);
    setShowGroupSpectrumPanel(false);
  };

  const handleSpectrumSaveAs = (spectrumData) => {
    // In real app, this would save to database
    console.log('Saving spectrum:', spectrumData);
    handleSpectrumValidate(spectrumData);
  };

  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId);
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
    console.log(`Material mode changed to: ${mode}`);
  };

  const handleZoomChange = (zoomLevel) => {
    if (window.setZoomLevel) {
      window.setZoomLevel(zoomLevel);
    }
    console.log(`Zoom level changed to: ${zoomLevel}%`);
  };

  const handleLanguageChange = (language) => {
    console.log(`Language changed to: ${language.name}`);
    // TODO: Implement language switching logic
  };

  const handleUnitChange = (unit) => {
    console.log(`Unit changed to: ${unit.name}`);
    // TODO: Implement unit conversion logic
  };

  const handleModeChange = (modeData) => {
    console.log(`Mode changed:`, modeData);
    // TODO: Implement mode switching logic
  };

  const handleSceneRotationChange = (rotation) => {
    if (window.setSceneRotation) {
      window.setSceneRotation(rotation);
    }
    console.log(`Scene rotation changed:`, rotation);
  };

  const handleViewMenuAction = (action) => {
    if (window.handleViewMenuAction) {
      window.handleViewMenuAction(action);
    }
    console.log(`View menu action: ${action}`);
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
    console.log('Opening geometry panel. Selected geometry:', selectedGeometry);
  };

  const handleGeometryPanelClose = (geometryData = null) => {
    if (geometryData) {
      console.log('Geometry panel saved:', geometryData);
      // TODO: Apply geometry changes to the 3D scene
      if (window.updateGeometry) {
        window.updateGeometry(selectedGeometry.id, geometryData);
      }
    }
    setShowGeometryPanel(false);
  };

  // Handle help toggle from F1 key
  useEffect(() => {
    const handleToggleHelp = () => {
      setShowHelp(prev => !prev);
    };

    window.addEventListener('toggleHelp', handleToggleHelp);
    return () => window.removeEventListener('toggleHelp', handleToggleHelp);
  }, []);

  return (
    <div className="bg-neutral-800 h-screen relative ">
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
          />
        </div>
        
        {/* Geometry Selector - Draggable */}
        <GeometrySelector onGeometrySelect={handleGeometrySelect} />

        {/* Rotation Sliders - Draggable */}
        <RotationSliders onRotationChange={handleSceneRotationChange} />

        {/* Volume Form - Draggable */}
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

        {/* Sidebar - Right Side */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-auto">
          <Sidebar selectedTool={selectedTool} onToolSelect={handleToolSelect} />
        </div>

        {/* Geometry Panel - Draggable */}
        <GeometryPanel 
          isOpen={showGeometryPanel}
          onClose={handleGeometryPanelClose}
          selectedGeometry={selectedGeometry}
          existingVolumes={existingVolumes}
        />

        {/* Contextual Help - Bottom Left */}
        <ContextualHelp 
          selectedTool={selectedTool}
          hasSelectedObject={hasSelectedObject}
          hasObjects={hasObjects}
        />

        {/* Bottom Bar - Bottom Center */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
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
      <HelpOverlay 
        isVisible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}

