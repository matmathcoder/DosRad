import React from 'react';
import { MousePointer2, Cctv } from 'lucide-react';
import ThreeScene from '../components/ThreeScene';
import Navigation from '../components/Bars/Navbar/Navigation';
import GeometrySelector from '../components/Panels/GeometrySelector';
import Sidebar from '../components/Bars/SideBar';
import VolumeForm from '../components/Navigation/Edit/VolumeForm/VolumeForm';
import CompositionPanel from '../components/Navigation/Edit/VolumeForm/CompositionPanel';
import LineSpectrumPanel from '../components/Navigation/Edit/VolumeForm/LineSpectrumPanel';
import GroupSpectrumPanel from '../components/Navigation/Edit/VolumeForm/GroupSpectrumPanel';
import GeometryPanel from '../components/Navigation/Inspector/GeometryPanel';
import SensorPanel from '../components/Navigation/Edit/Insert/SensorPanel';
import CompoundVolume from '../components/Navigation/Edit/Insert/CompoundVolume';
import HelpOverlay from '../components/Panels/HelpOverlay';
import ContextualHelp from '../components/Panels/ContextualHelp';
import BottomBar from '../components/Bars/BottomBar';
import RotationSliders from '../components/Panels/RotationSliders';
import Directory from '../components/Bars/Directory/Directory';
import VolumePropertiesPanel from '../components/Panels/VolumePropertiesPanel';
import PhysicsControlPanel from '../components/Panels/PhysicsControlPanel';
import { cycleLayout } from './layoutUtils';

/**
 * App Layout Component
 * Renders the main layout structure with all components
 */
export default function AppLayout({
  state,
  handlers,
  layoutConfig,
  setLayoutConfig
}) {
  return (
    <div className={`bg-neutral-800 h-screen relative overflow-hidden ${
      state.windowSize.width < 640 ? 'text-xs' : 'text-sm'
    }`}>
      {/* Three.js Scene Container - Higher z-index for interactions */}
      <div className="absolute inset-0 z-20">
        <ThreeScene
          selectedTool={state.selectedTool}
          onGeometryCreate={handlers.handleGeometryCreate}
          onToolSelect={handlers.handleToolSelect}
          onSelectionChange={handlers.handleSelectionChange}
          onAxisChange={handlers.handleAxisChange}
          onViewModeChange={handlers.handleViewModeChange}
          onGeometryDeleted={(geometryId) => {
            // Remove the geometry from the existing volumes list
            state.setExistingVolumes(prev => {
              const updated = prev.filter(volume => volume.id !== geometryId);
              return updated;
            });
            // Update object states - will be updated when existingVolumes changes
            if (state.selectedGeometry?.id === geometryId) {
              state.setSelectedGeometry(null);
              state.setHasSelectedObject(false);
            }
          }}
          onGeometryVisibilityChanged={(geometryId, visible) => {
            // Update visibility in the existing volumes list
            state.setExistingVolumes(prev => prev.map(volume => 
              volume.id === geometryId 
                ? { ...volume, visible }
                : volume
            ));
          }}
          onGeometryChanged={handlers.handleGeometryChanged}
          onGeometryCreated={handlers.handleGeometryCreated}
          existingCompositions={state.existingCompositions}
          existingSensors={state.existingSensors}
          existingSpectra={state.existingSpectra}
          onCompositionsChange={handlers.handleCompositionsChange}
          onSensorsChange={handlers.handleSensorsChange}
          onSpectraChange={handlers.handleSpectraChange}
        />
      </div>
      
      {/* UI Overlay - Lower z-index, positioned elements */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {/* Navigation Bar - Top */}
        <div className="absolute top-0 left-0 right-0 pointer-events-auto">
          <Navigation 
            onShowVolumeForm={handlers.handleShowVolumeForm}
            onToggleHelp={() => state.setShowHelp(prev => !prev)}
            onAxisChange={handlers.handleAxisChange}
            onViewModeChange={handlers.handleViewModeChange}
            onMaterialChange={handlers.handleMaterialChange}
            onViewMenuAction={handlers.handleViewMenuAction}
            onShowGeometryPanel={handlers.handleShowGeometryPanel}
            onShowSensorPanel={handlers.handleShowSensorPanel}
            onShowCompoundVolume={handlers.handleShowCompoundVolume}
            onShowPhysicsPanel={() => state.setShowPhysicsPanel(true)}
            onToggleComponentVisibility={handlers.handleToggleComponentVisibility}
            sceneData={handlers.getSceneData()}
            selectedVolume={state.selectedGeometry}
            onMeshValidate={handlers.handleMeshValidate}
            onComputationComplete={handlers.handleComputationComplete}
            onSceneGenerated={handlers.handleSceneGenerated}
          />
        </div>
        
        {/* Geometry Selector - Draggable floating component positioned next to Directory */}
        {state.componentVisibility.geometrySelector && (
          <GeometrySelector 
            key={`geometry-selector-${layoutConfig.geometrySelector}`}
            onGeometrySelect={handlers.handleGeometrySelect} 
            layoutPosition={layoutConfig.directory}
          />
        )}

        {/* Directory - Full height, positioned by layout */}
        {state.componentVisibility.directory && (
          <Directory
            key={`directory-${state.existingVolumes.length}-${layoutConfig.directory}`}
            isVisible={true}
            layoutPosition={layoutConfig.directory}
            onClose={() => {
              state.setComponentVisibility(prev => ({ ...prev, directory: false }));
            }}
            existingVolumes={state.existingVolumes}
            existingSensors={state.existingSensors}
            existingCompositions={state.existingCompositions}
            existingSpectra={state.existingSpectra}
            onRenameObject={handlers.handleRenameObject}
            onDeleteObject={handlers.handleDeleteObject}
            onSelectObject={handlers.handleSelectObject}
            onToggleVisibility={handlers.handleToggleVisibility}
            onClearAllObjects={handlers.handleClearAllObjects}
            onShowProperties={handlers.handleShowProperties}
            selectedObjectId={state.selectedGeometry?.id}
          />
        )}

        {/* Rotation Sliders - Draggable */}
        {state.componentVisibility.rotationSliders && (
          <RotationSliders onRotationChange={handlers.handleSceneRotationChange} />
        )}

        {/* Volume Form - Draggable */}
        {state.componentVisibility.volumeForm && state.showVolumeForm && (
          <VolumeForm
            isVisible={true}
            onClose={handlers.handleVolumeFormClose}
            onSave={handlers.handleVolumeFormSave}
            onShowCompositionPanel={() => state.setShowCompositionPanel(true)}
            onShowLineSpectrumPanel={() => state.setShowLineSpectrumPanel(true)}
            onShowGroupSpectrumPanel={() => state.setShowGroupSpectrumPanel(true)}
            onCompositionChange={handlers.handleCompositionChange}
            onSpectrumChange={handlers.handleSpectrumChange}
          />
        )}

        {/* Layout Swap Button - Top Right */}
        <div className="absolute top-20 right-2 sm:right-4 pointer-events-auto z-30">
          <button
            onClick={() => cycleLayout(layoutConfig, setLayoutConfig)}
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
          <Sidebar selectedTool={state.selectedTool} onToolSelect={handlers.handleToolSelect} cameraMode={state.cameraMode} />
        </div>

        {/* Mobile Toolbar - Bottom Right for small screens */}
        {state.windowSize.width < 640 && (
          <div className="absolute bottom-16 right-2 pointer-events-auto">
            <div className="bg-neutral-700 rounded-lg shadow-lg p-2">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handlers.handleToolSelect('select')}
                  className={`p-2 rounded ${state.selectedTool === 'select' ? 'bg-neutral-600' : 'hover:bg-neutral-600'}`}
                  title="Select Tool"
                >
                  <MousePointer2 size={16} className="text-white" />
                </button>
                <button
                  onClick={() => handlers.handleToolSelect('camera')}
                  className={`p-2 rounded ${state.selectedTool === 'camera' ? 'bg-neutral-600' : 'hover:bg-neutral-600'}`}
                  title={`Camera (${state.cameraMode})`}
                >
                  <Cctv size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Geometry Panel - Draggable */}
        <GeometryPanel 
          isOpen={state.showGeometryPanel}
          onClose={handlers.handleGeometryPanelClose}
          selectedGeometry={state.selectedGeometry}
          existingVolumes={state.existingVolumes}
        />

        {/* Sensor Panel - Draggable */}
        <SensorPanel
          isVisible={state.showSensorPanel}
          onClose={handlers.handleSensorPanelClose}
          onValidate={handlers.handleSensorValidate}
          onSaveAs={handlers.handleSensorSave}
          existingSensors={state.existingSensors}
          existingCompositions={state.existingCompositions}
        />

        {/* Compound Volume Panel - Draggable */}
        <CompoundVolume
          isVisible={state.showCompoundVolume}
          onClose={handlers.handleCompoundVolumeClose}
          onImport={handlers.handleCompoundVolumeImport}
          onCancel={handlers.handleCompoundVolumeClose}
          existingVolumes={state.existingVolumes}
          existingCompositions={state.existingCompositions}
          existingSpectra={state.existingSpectra}
        />

        {/* Volume Properties Panel - Draggable */}
        <VolumePropertiesPanel
          isVisible={state.showVolumeProperties}
          onClose={() => state.setShowVolumeProperties(false)}
          volumeData={state.selectedVolumeData}
          onEdit={() => {
            // Open geometry panel for editing
            state.setShowGeometryPanel(true);
            state.setShowVolumeProperties(false);
          }}
          onDelete={() => {
            // Delete the volume
            if (state.selectedVolumeData && state.selectedVolumeData.userData) {
              if (window.removeGeometry) {
                window.removeGeometry(state.selectedVolumeData.userData.id);
              }
            }
            state.setShowVolumeProperties(false);
          }}
          onCopy={() => {
            // Copy volume properties to clipboard
            if (state.selectedVolumeData) {
              const propertiesText = JSON.stringify(state.selectedVolumeData, null, 2);
              navigator.clipboard.writeText(propertiesText);
            }
          }}
        />

        {/* Physics Control Panel - Draggable */}
        <PhysicsControlPanel
          isVisible={state.showPhysicsPanel}
          onClose={handlers.handlePhysicsPanelClose}
          onStartSimulation={handlers.handleStartPhysicsSimulation}
          onStopSimulation={handlers.handleStopPhysicsSimulation}
          simulationResults={state.physicsSimulationResults}
          isSimulating={state.isPhysicsSimulating}
          simulationProgress={state.physicsSimulationProgress}
        />

        {/* Contextual Help - Draggable floating component */}
        {state.componentVisibility.contextualHelp && (
          <ContextualHelp 
            selectedTool={state.selectedTool}
            hasSelectedObject={state.hasSelectedObject}
            hasObjects={state.hasObjects}
            cameraMode={state.cameraMode}
            windowSize={state.windowSize}
          />
        )}

        {/* Bottom Bar - Bottom Center - Responsive positioning */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <BottomBar 
            onZoomChange={handlers.handleZoomChange}
            onLanguageChange={handlers.handleLanguageChange}
            onUnitChange={handlers.handleUnitChange}
            onModeChange={handlers.handleModeChange}
          />
        </div>
      </div>

      {/* Floating Panels - Draggable across entire scene */}
      <CompositionPanel
        isVisible={state.showCompositionPanel}
        onClose={() => state.setShowCompositionPanel(false)}
        onUse={handlers.handleCompositionUse}
        onStore={handlers.handleCompositionStore}
        initialComposition={state.currentComposition}
        existingCompositions={state.existingCompositions}
      />

      <LineSpectrumPanel
        isVisible={state.showLineSpectrumPanel}
        onClose={() => state.setShowLineSpectrumPanel(false)}
        onValidate={handlers.handleSpectrumValidate}
        onSaveAs={handlers.handleSpectrumSaveAs}
        initialSpectrum={state.currentSpectrum?.type === 'line' ? state.currentSpectrum : null}
        existingSpectra={state.existingSpectra.filter(spec => spec.type === 'line')}
      />

      <GroupSpectrumPanel
        isVisible={state.showGroupSpectrumPanel}
        onClose={() => state.setShowGroupSpectrumPanel(false)}
        onValidate={handlers.handleSpectrumValidate}
        onSaveAs={handlers.handleSpectrumSaveAs}
        initialSpectrum={state.currentSpectrum?.type === 'group' ? state.currentSpectrum : null}
        existingSpectra={state.existingSpectra.filter(spec => spec.type === 'group')}
      />

      {/* Help Overlay */}
      {state.componentVisibility.helpOverlay && (
        <HelpOverlay 
          isVisible={state.showHelp}
          onClose={() => state.setShowHelp(false)}
        />
      )}
    </div>
  );
}
