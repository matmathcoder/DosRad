import { useState } from 'react';
import { defaultComponentVisibility } from './NavigationData';

/**
 * Custom hook for managing navigation state
 * Handles all state management for the navigation component
 */
export default function useNavigationState() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  const [activeAxis, setActiveAxis] = useState('Z');
  const [materialMode, setMaterialMode] = useState('solid');
  
  // Component visibility state
  const [componentVisibility, setComponentVisibility] = useState(defaultComponentVisibility);
  
  // Authentication state
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Panel visibility states
  const [showMeshPanel, setShowMeshPanel] = useState(false);
  const [showComputationPanel, setShowComputationPanel] = useState(false);
  const [showGenerateScenePanel, setShowGenerateScenePanel] = useState(false);
  
  // Inspector panel visibility states
  const [showCompositionsInspector, setShowCompositionsInspector] = useState(false);
  const [showSourcesInspector, setShowSourcesInspector] = useState(false);
  const [showSensorsInspector, setShowSensorsInspector] = useState(false);
  
  // Creation panel visibility states
  const [showCompositionPanel, setShowCompositionPanel] = useState(false);
  const [showSensorPanel, setShowSensorPanel] = useState(false);
  const [showCompoundVolume, setShowCompoundVolume] = useState(false);

  const handleMenuClick = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
    setActiveSubDropdown(null);
  };

  const handleSubMenuClick = (subMenuName) => {
    setActiveSubDropdown(activeSubDropdown === subMenuName ? null : subMenuName);
  };

  const handleAxisClick = (axis) => {
    setActiveAxis(axis);
  };

  const handleMaterialModeClick = (mode) => {
    setMaterialMode(mode);
  };

  const toggleComponentVisibility = (componentKey, newVisibility) => {
    setComponentVisibility(prev => ({
      ...prev,
      [componentKey]: newVisibility
    }));
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setActiveSubDropdown(null);
  };

  return {
    // State
    activeDropdown,
    activeSubDropdown,
    activeAxis,
    materialMode,
    componentVisibility,
    showLogin,
    showSignup,
    showMeshPanel,
    showComputationPanel,
    showGenerateScenePanel,
    showCompositionsInspector,
    showSourcesInspector,
    showSensorsInspector,
    showCompositionPanel,
    showSensorPanel,
    showCompoundVolume,
    
    // Actions
    setActiveDropdown,
    setActiveSubDropdown,
    setActiveAxis,
    setMaterialMode,
    setComponentVisibility,
    setShowLogin,
    setShowSignup,
    setShowMeshPanel,
    setShowComputationPanel,
    setShowGenerateScenePanel,
    setShowCompositionsInspector,
    setShowSourcesInspector,
    setShowSensorsInspector,
    setShowCompositionPanel,
    setShowSensorPanel,
    setShowCompoundVolume,
    handleMenuClick,
    handleSubMenuClick,
    handleAxisClick,
    handleMaterialModeClick,
    toggleComponentVisibility,
    closeDropdowns
  };
}
