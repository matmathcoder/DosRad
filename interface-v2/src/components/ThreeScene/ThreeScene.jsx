import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import SceneManager from './SceneManager';
import CameraController from './CameraController';
import GeometryManager from './GeometryManager';
import CollisionSystem from './CollisionSystem';
import HistoryManager from './HistoryManager';
import PersistenceManager from './PersistenceManager';
import ViewManager from './ViewManager';
import EventHandler from './EventHandler';

export default function ThreeScene({ 
  selectedTool, 
  onGeometryCreate, 
  onToolSelect, 
  onSelectionChange, 
  onAxisChange, 
  onViewModeChange 
}) {
  const canvasRef = useRef();
  
  // Core refs
  const sceneRef = useRef();
  const rendererRef = useRef();
  const sceneGroupRef = useRef();
  
  // Geometry refs
  const geometriesRef = useRef([]);
  const selectedGeometryRef = useRef(null);
  
  // State
  const [isPerspective, setIsPerspective] = useState(true);
  const [currentAxis, setCurrentAxis] = useState('Z');
  const [viewMode, setViewMode] = useState('solid');
  const [materialMode, setMaterialMode] = useState('solid');
  const [csgMode, setCsgMode] = useState(false);
  const [showMesh, setShowMesh] = useState(true);
  const [showCutPlane, setShowCutPlane] = useState(false);
  const [showSolidAngleLines, setShowSolidAngleLines] = useState(false);
  
  // Tool ref
  const selectedToolRef = useRef('select');
  useEffect(() => { selectedToolRef.current = selectedTool; }, [selectedTool]);
  
  // Module instances
  const sceneManager = useRef();
  const cameraController = useRef();
  const geometryManager = useRef();
  const collisionSystem = useRef();
  const historyManager = useRef();
  const persistenceManager = useRef();
  const viewManager = useRef();
  const eventHandler = useRef();
  
  // Initialize modules
  useEffect(() => {
    // Initialize core Three.js components
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    rendererRef.current = renderer;
    
    // Create scene group for rotation
    const sceneGroup = new THREE.Group();
    sceneGroupRef.current = sceneGroup;
    scene.add(sceneGroup);
    
    // Initialize all modules with shared refs and state
    const sharedRefs = {
      sceneRef,
      rendererRef,
      sceneGroupRef,
      geometriesRef,
      selectedGeometryRef,
      canvasRef
    };
    
    const sharedState = {
      isPerspective,
      setIsPerspective,
      currentAxis,
      setCurrentAxis,
      viewMode,
      setViewMode,
      materialMode,
      setMaterialMode,
      csgMode,
      setCsgMode,
      showMesh,
      setShowMesh,
      showCutPlane,
      setShowCutPlane,
      showSolidAngleLines,
      setShowSolidAngleLines,
      selectedToolRef
    };
    
    const callbacks = {
      onGeometryCreate,
      onToolSelect,
      onSelectionChange,
      onAxisChange,
      onViewModeChange
    };
    
    // Initialize modules
    sceneManager.current = new SceneManager(sharedRefs, sharedState, callbacks);
    cameraController.current = new CameraController(sharedRefs, sharedState, callbacks);
    geometryManager.current = new GeometryManager(sharedRefs, sharedState, callbacks);
    collisionSystem.current = new CollisionSystem(sharedRefs, sharedState, callbacks);
    historyManager.current = new HistoryManager(sharedRefs, sharedState, callbacks);
    persistenceManager.current = new PersistenceManager(sharedRefs, sharedState, callbacks);
    viewManager.current = new ViewManager(sharedRefs, sharedState, callbacks);
    eventHandler.current = new EventHandler(sharedRefs, sharedState, callbacks);
    
    // Pass module references to each other for inter-module communication
    const modules = {
      sceneManager: sceneManager.current,
      cameraController: cameraController.current,
      geometryManager: geometryManager.current,
      collisionSystem: collisionSystem.current,
      historyManager: historyManager.current,
      persistenceManager: persistenceManager.current,
      viewManager: viewManager.current,
      eventHandler: eventHandler.current
    };
    
    // Set module references for inter-module communication
    Object.values(modules).forEach(module => {
      if (module.setModules) {
        module.setModules(modules);
      }
    });
    
    // Setup scene
    sceneManager.current.initialize();
    cameraController.current.initialize();
    viewManager.current.initialize();
    eventHandler.current.initialize();
    
    // Start animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update modules
      cameraController.current.update();
      collisionSystem.current.update();
      eventHandler.current.update();
      
      // Render
      renderer.render(scene, cameraController.current.getActiveCamera());
    };
    
    animate();
    
    // Load saved scene
    setTimeout(() => {
      persistenceManager.current.loadScene();
    }, 100);
    
    // Setup auto-save
    persistenceManager.current.setupAutoSave();
    
    // Cleanup
    return () => {
      sceneManager.current?.cleanup();
      cameraController.current?.cleanup();
      geometryManager.current?.cleanup();
      collisionSystem.current?.cleanup();
      historyManager.current?.cleanup();
      persistenceManager.current?.cleanup();
      viewManager.current?.cleanup();
      eventHandler.current?.cleanup();
    };
  }, []);
  
  // Expose geometry creation function to parent
  useEffect(() => {
    if (onGeometryCreate && geometryManager.current) {
      const createGeometryFunction = (geometryType) => {
        const mesh = geometryManager.current.createGeometry(geometryType);
        if (mesh && eventHandler.current) {
          // Auto-select the newly created geometry
          eventHandler.current.selectGeometry(mesh);
        }
        return mesh;
      };
      onGeometryCreate(createGeometryFunction);
    }
  }, [onGeometryCreate]);
  
  // Handle tool selection changes
  useEffect(() => {
    if (eventHandler.current) {
      eventHandler.current.handleToolChange(selectedTool);
    }
  }, [selectedTool]);
  
  // Expose global functions
  useEffect(() => {
    if (cameraController.current) {
      window.setAxisView = (axis) => cameraController.current.setAxisView(axis);
      window.setZoomLevel = (zoom) => cameraController.current.setZoomLevel(zoom);
    }
    
    if (viewManager.current) {
      window.setViewMode = (mode) => viewManager.current.changeViewMode(mode);
      window.setMaterialMode = (mode) => viewManager.current.changeMaterialMode(mode);
      window.handleViewMenuAction = (action) => viewManager.current.handleViewMenuAction(action);
    }
    
    if (persistenceManager.current) {
      window.saveScene = () => persistenceManager.current.saveScene();
      window.clearSavedScene = () => persistenceManager.current.clearScene();
    }
    
    if (cameraController.current) {
      window.setSceneRotation = (rotation) => cameraController.current.setSceneRotation(rotation);
    }
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'block', width: '100%', height: '100%', outline: 'none' }}
      onDragOver={(e) => eventHandler.current?.handleDragOver(e)}
      onDragLeave={(e) => eventHandler.current?.handleDragLeave(e)}
      onDrop={(e) => eventHandler.current?.handleDrop(e)}
    />
  );
}
