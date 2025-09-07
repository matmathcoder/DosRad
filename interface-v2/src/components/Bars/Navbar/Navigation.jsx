import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import NavigationHeader from './NavigationHeader';
import NavigationControls from './NavigationControls';
import NavigationModals from './NavigationModals';
import MenuDropdown from './MenuDropdown';
import Profile from '../../Navigation/Profile/Profile';
import useNavigationState from './useNavigationState';
import useNavigationHandlers from './useNavigationHandlers';
import { menuStructure } from './NavigationData';

/**
 * Main Navigation Component
 * Orchestrates all navigation functionality through modular components
 */
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
  // Use custom hooks for state management and handlers
  const state = useNavigationState();
  const handlers = useNavigationHandlers({
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
    actions: {
      setActiveAxis: state.setActiveAxis,
      setMaterialMode: state.setMaterialMode,
      toggleComponentVisibility: state.toggleComponentVisibility,
      closeDropdowns: state.closeDropdowns,
      setShowLogin: state.setShowLogin,
      setShowSignup: state.setShowSignup,
      setShowMeshPanel: state.setShowMeshPanel,
      setShowComputationPanel: state.setShowComputationPanel,
      setShowGenerateScenePanel: state.setShowGenerateScenePanel,
      setShowCompositionsInspector: state.setShowCompositionsInspector,
      setShowSourcesInspector: state.setShowSourcesInspector,
      setShowSensorsInspector: state.setShowSensorsInspector,
      setShowCompositionPanel: state.setShowCompositionPanel,
      setShowSensorPanel: state.setShowSensorPanel,
      setShowCompoundVolume: state.setShowCompoundVolume
    }
  });

  const { user } = useAuth();

  return (
    <nav className="bg-neutral-700 w-full pointer-events-auto relative z-40">
      <div className="flex justify-between items-center">
        {/* Left side - Logo and Menu items */}
        <NavigationHeader
          menuStructure={menuStructure}
          activeDropdown={state.activeDropdown}
          activeSubDropdown={state.activeSubDropdown}
          componentVisibility={state.componentVisibility}
          onMenuClick={state.handleMenuClick}
          onSubMenuClick={state.handleSubMenuClick}
          onItemClick={handlers.handleItemClick}
          MenuDropdownComponent={MenuDropdown}
        />

        {/* Right side - Axis, View Mode controls, and Authentication */}
        <NavigationControls
          activeAxis={state.activeAxis}
          materialMode={state.materialMode}
          user={user}
          onAxisClick={handlers.handleAxisClick}
          onMaterialModeClick={handlers.handleMaterialModeClick}
          onShowLogin={() => state.setShowLogin(true)}
          onShowSignup={() => state.setShowSignup(true)}
          onLogout={handlers.handleLogout}
          ProfileComponent={Profile}
        />
      </div>
      
      {/* Overlay to close dropdowns when clicking outside */}
      {state.activeDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={state.closeDropdowns}
        />
      )}

      {/* All Modals and Panels */}
      <NavigationModals
        // Authentication modals
        showLogin={state.showLogin}
        showSignup={state.showSignup}
        user={user}
        onCloseLogin={() => state.setShowLogin(false)}
        onCloseSignup={() => state.setShowSignup(false)}
        onSwitchToSignup={handlers.handleSwitchToSignup}
        onSwitchToLogin={handlers.handleSwitchToLogin}
        onLoginSuccess={handlers.handleLoginSuccess}
        onSignupSuccess={handlers.handleSignupSuccess}
        onLogout={handlers.handleLogout}
        
        // Panel visibility states
        showMeshPanel={state.showMeshPanel}
        showComputationPanel={state.showComputationPanel}
        showGenerateScenePanel={state.showGenerateScenePanel}
        showCompositionsInspector={state.showCompositionsInspector}
        showSourcesInspector={state.showSourcesInspector}
        showSensorsInspector={state.showSensorsInspector}
        showCompositionPanel={state.showCompositionPanel}
        showSensorPanel={state.showSensorPanel}
        showCompoundVolume={state.showCompoundVolume}
        
        // Panel props
        selectedVolume={selectedVolume}
        sceneData={sceneData}
        compositions={compositions}
        sources={sources}
        sensors={sensors}
        existingCompositions={existingCompositions}
        existingSensors={existingSensors}
        
        // Panel handlers
        onMeshValidate={onMeshValidate}
        onComputationComplete={onComputationComplete}
        onSceneGenerated={onSceneGenerated}
        onEditComposition={(composition) => {
          console.log('Edit composition:', composition);
        }}
        onDeleteComposition={(composition) => {
          console.log('Delete composition:', composition);
        }}
        onCreateComposition={() => {
          state.setShowCompositionPanel(true);
        }}
        onEditSource={(source) => {
          console.log('Edit source:', source);
        }}
        onDeleteSource={(source) => {
          console.log('Delete source:', source);
        }}
        onCreateSource={() => {
          state.setShowCompoundVolume(true);
        }}
        onEditSensor={(sensor) => {
          console.log('Edit sensor:', sensor);
        }}
        onDeleteSensor={(sensor) => {
          console.log('Delete sensor:', sensor);
        }}
        onCreateSensor={() => {
          state.setShowSensorPanel(true);
        }}
        onUseComposition={(composition) => {
          console.log('Use composition:', composition);
          state.setShowCompositionPanel(false);
        }}
        onStoreComposition={(composition) => {
          console.log('Store composition:', composition);
          state.setShowCompositionPanel(false);
        }}
        onValidateSensors={(sensors) => {
          console.log('Validate sensors:', sensors);
        }}
        onSaveAsSensors={(sensors) => {
          console.log('Save sensors:', sensors);
          state.setShowSensorPanel(false);
        }}
        onValidateVolume={(volume) => {
          console.log('Validate volume:', volume);
        }}
        onSaveAsVolume={(volume) => {
          console.log('Save volume:', volume);
          state.setShowCompoundVolume(false);
        }}
        onCloseMeshPanel={() => state.setShowMeshPanel(false)}
        onCloseComputationPanel={() => state.setShowComputationPanel(false)}
        onCloseGenerateScenePanel={() => state.setShowGenerateScenePanel(false)}
        onCloseCompositionsInspector={() => state.setShowCompositionsInspector(false)}
        onCloseSourcesInspector={() => state.setShowSourcesInspector(false)}
        onCloseSensorsInspector={() => state.setShowSensorsInspector(false)}
        onCloseCompositionPanel={() => state.setShowCompositionPanel(false)}
        onCloseSensorPanel={() => state.setShowSensorPanel(false)}
        onCloseCompoundVolume={() => state.setShowCompoundVolume(false)}
      />
    </nav>
  );
}
