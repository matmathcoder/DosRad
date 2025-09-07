import React from 'react';
import Login from '../../Navigation/Profile/Login';
import Signup from '../../Navigation/Profile/Signup';
import Profile from '../../Navigation/Profile/Profile';
import MeshPanel from '../../Navigation/Edit/VolumeForm/MeshPanel';
import ComputationPanel from '../../Navigation/Scene/ComputationPanel';
import GenerateScenePanel from '../../Navigation/Scene/GenerateScenePanel';
import CompositionsInspectorPanel from '../../Navigation/Inspector/CompositionsInspectorPanel';
import SourcesInspectorPanel from '../../Navigation/Inspector/SourcesInspectorPanel';
import SensorsInspectorPanel from '../../Navigation/Inspector/SensorsInspectorPanel';
import CompositionPanel from '../../Navigation/Edit/VolumeForm/CompositionPanel';
import SensorPanel from '../../Navigation/Edit/Insert/SensorPanel';
import CompoundVolume from '../../Navigation/Edit/Insert/CompoundVolume';

/**
 * Navigation Modals Component
 * Renders all modal dialogs and panels
 */
export default function NavigationModals({
  // Authentication modals
  showLogin,
  showSignup,
  user,
  onCloseLogin,
  onCloseSignup,
  onSwitchToSignup,
  onSwitchToLogin,
  onLoginSuccess,
  onSignupSuccess,
  onLogout,
  
  // Panel visibility states
  showMeshPanel,
  showComputationPanel,
  showGenerateScenePanel,
  showCompositionsInspector,
  showSourcesInspector,
  showSensorsInspector,
  showCompositionPanel,
  showSensorPanel,
  showCompoundVolume,
  
  // Panel props
  selectedVolume,
  sceneData,
  compositions,
  sources,
  sensors,
  existingCompositions,
  existingSensors,
  
  // Panel handlers
  onMeshValidate,
  onComputationComplete,
  onSceneGenerated,
  onEditComposition,
  onDeleteComposition,
  onCreateComposition,
  onEditSource,
  onDeleteSource,
  onCreateSource,
  onEditSensor,
  onDeleteSensor,
  onCreateSensor,
  onUseComposition,
  onStoreComposition,
  onValidateSensors,
  onSaveAsSensors,
  onValidateVolume,
  onSaveAsVolume,
  onCloseMeshPanel,
  onCloseComputationPanel,
  onCloseGenerateScenePanel,
  onCloseCompositionsInspector,
  onCloseSourcesInspector,
  onCloseSensorsInspector,
  onCloseCompositionPanel,
  onCloseSensorPanel,
  onCloseCompoundVolume
}) {
  return (
    <>
      {/* Authentication Modals */}
      {showLogin && (
        <Login
          onClose={onCloseLogin}
          onSwitchToSignup={onSwitchToSignup}
          onLoginSuccess={onLoginSuccess}
        />
      )}

      {showSignup && (
        <Signup
          onClose={onCloseSignup}
          onSwitchToLogin={onSwitchToLogin}
          onSignupSuccess={onSignupSuccess}
        />
      )}

      {/* Mesh Panel */}
      {showMeshPanel && (
        <MeshPanel
          isVisible={showMeshPanel}
          onClose={onCloseMeshPanel}
          selectedVolume={selectedVolume}
          onMeshValidate={onMeshValidate}
        />
      )}

      {/* Computation Panel */}
      {showComputationPanel && (
        <ComputationPanel
          isVisible={showComputationPanel}
          onClose={onCloseComputationPanel}
          sceneData={sceneData}
          onComputationComplete={onComputationComplete}
        />
      )}

      {/* Generate Scene Panel */}
      {showGenerateScenePanel && (
        <GenerateScenePanel
          isVisible={showGenerateScenePanel}
          onClose={onCloseGenerateScenePanel}
          sceneData={sceneData}
          onSceneGenerated={onSceneGenerated}
        />
      )}

      {/* Inspector Panels */}
      {showCompositionsInspector && (
        <CompositionsInspectorPanel
          isVisible={showCompositionsInspector}
          onClose={onCloseCompositionsInspector}
          compositions={compositions}
          onEditComposition={onEditComposition}
          onDeleteComposition={onDeleteComposition}
          onCreateComposition={onCreateComposition}
        />
      )}

      {showSourcesInspector && (
        <SourcesInspectorPanel
          isVisible={showSourcesInspector}
          onClose={onCloseSourcesInspector}
          sources={sources}
          onEditSource={onEditSource}
          onDeleteSource={onDeleteSource}
          onCreateSource={onCreateSource}
        />
      )}

      {showSensorsInspector && (
        <SensorsInspectorPanel
          isVisible={showSensorsInspector}
          onClose={onCloseSensorsInspector}
          sensors={sensors}
          onEditSensor={onEditSensor}
          onDeleteSensor={onDeleteSensor}
          onCreateSensor={onCreateSensor}
        />
      )}

      {/* Creation Panels */}
      {showCompositionPanel && (
        <CompositionPanel
          isVisible={showCompositionPanel}
          onClose={onCloseCompositionPanel}
          onUse={onUseComposition}
          onStore={onStoreComposition}
          existingCompositions={existingCompositions}
        />
      )}

      {showSensorPanel && (
        <SensorPanel
          isVisible={showSensorPanel}
          onClose={onCloseSensorPanel}
          onValidate={onValidateSensors}
          onSaveAs={onSaveAsSensors}
          existingSensors={existingSensors}
          existingCompositions={existingCompositions}
        />
      )}

      {showCompoundVolume && (
        <CompoundVolume
          isVisible={showCompoundVolume}
          onClose={onCloseCompoundVolume}
          onValidate={onValidateVolume}
          onSaveAs={onSaveAsVolume}
          existingCompositions={existingCompositions}
        />
      )}
    </>
  );
}
