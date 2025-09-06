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
import ContextMenu from './ContextMenu';
import MeshPropertiesPanel from './MeshPropertiesPanel';

export default function ThreeScene({ 
  selectedTool, 
  onGeometryCreate, 
  onToolSelect, 
  onSelectionChange, 
  onAxisChange, 
  onViewModeChange,
  onGeometryDeleted,
  onGeometryVisibilityChanged,
  onGeometryChanged,
  existingCompositions = [],
  existingSensors = [],
  existingSpectra = [],
  onCompositionsChange,
  onSensorsChange,
  onSpectraChange
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
  
  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuObject, setContextMenuObject] = useState(null);
  
  // Panel states
  const [geometryPanelVisible, setGeometryPanelVisible] = useState(false);
  const [volumePanelVisible, setVolumePanelVisible] = useState(false);
  const [meshPropertiesVisible, setMeshPropertiesVisible] = useState(false);
  
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
      selectedToolRef,
      compositions: existingCompositions,
      setCompositions: onCompositionsChange,
      sensors: existingSensors,
      setSensors: onSensorsChange,
      spectra: existingSpectra,
      setSpectra: onSpectraChange
    };
    
    const callbacks = {
      onGeometryCreate,
      onToolSelect,
      onSelectionChange,
      onAxisChange,
      onViewModeChange,
      onGeometryDeleted,
      onGeometryVisibilityChanged,
      onGeometryChanged,
      detachTransformControls: () => {
        if (eventHandler.current) {
          eventHandler.current.detachTransformControls();
        }
      },
      onContextMenuShow: (data) => {
        setContextMenuVisible(data.visible);
        setContextMenuPosition(data.position);
        setContextMenuObject(data.object);
      },
      onContextMenuHide: () => {
        setContextMenuVisible(false);
        setContextMenuObject(null);
      },
      onOpenGeometryPanel: (object) => {
        setGeometryPanelVisible(true);
        setContextMenuObject(object);
      },
      onOpenVolumePanel: (object) => {
        setVolumePanelVisible(true);
        setContextMenuObject(object);
      },
      onOpenMeshProperties: (object) => {
        setMeshPropertiesVisible(true);
        setContextMenuObject(object);
      }
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

  // Expose sensor creation function to parent
  useEffect(() => {
    if (geometryManager.current) {
      window.createSensor = (sensorData) => {
        const sensor = geometryManager.current.createSensor(sensorData);
        if (sensor && eventHandler.current) {
          // Auto-select the newly created sensor
          eventHandler.current.selectGeometry(sensor);
        }
        return sensor;
      };
    }
  }, []);
  
  // Handle tool selection changes
  useEffect(() => {
    if (eventHandler.current) {
      eventHandler.current.handleToolChange(selectedTool);
    } else {
      console.warn('EventHandler not available for tool change');
    }
  }, [selectedTool]);
  
  // Expose global functions
  useEffect(() => {
    if (cameraController.current) {
      window.setAxisView = (axis) => cameraController.current.setAxisView(axis);
      window.setZoomLevel = (zoom) => cameraController.current.setZoomLevel(zoom);
      window.togglePerspective = () => cameraController.current.togglePerspective();
      window.getCameraPosition = () => {
        const camera = cameraController.current.getActiveCamera();
        return camera ? camera.position : { x: 0, y: 5, z: 10 };
      };
      window.getCameraRotation = () => {
        const camera = cameraController.current.getActiveCamera();
        return camera ? camera.rotation : { x: 0, y: 0, z: 0 };
      };
    }
    
    if (viewManager.current) {
      window.setViewMode = (mode) => viewManager.current.changeViewMode(mode);
      window.setMaterialMode = (mode) => viewManager.current.changeMaterialMode(mode);
      window.handleViewMenuAction = (action) => viewManager.current.handleViewMenuAction(action);
      window.getViewMode = () => viewMode;
      window.getMaterialMode = () => materialMode;
    }
    
    if (persistenceManager.current) {
      window.saveScene = () => persistenceManager.current.saveScene();
      window.clearSavedScene = () => persistenceManager.current.clearScene();
      window.clearScene = () => {
        // Clear all geometries from the scene
        if (geometryManager.current) {
          const geometries = geometryManager.current.refs.geometriesRef.current;
          geometries.forEach(geometry => {
            geometryManager.current.deleteGeometry(geometry);
          });
        }
      };
    }
    
    if (cameraController.current) {
      window.setSceneRotation = (rotation) => cameraController.current.setSceneRotation(rotation);
    }
    
    // Expose geometry creation from data function
    if (geometryManager.current) {
      window.createGeometryFromData = (objData) => {
        try {
          const geometry = geometryManager.current.createGeometryFromData(objData);
          if (geometry && eventHandler.current) {
            // Auto-select the newly created geometry
            eventHandler.current.selectGeometry(geometry);
          }
          return geometry;
        } catch (error) {
          console.error('Error creating geometry from data:', error);
          return null;
        }
      };
      
      // Expose geometry deletion function
      window.removeGeometry = (geometryId) => {
        try {
          const geometries = geometriesRef.current;
          const geometry = geometries.find(g => g.userData?.id === geometryId);
          if (geometry) {
            geometryManager.current.deleteGeometry(geometry);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error removing geometry:', error);
          return false;
        }
      };
      
      // Expose geometry selection function
      window.selectGeometry = (geometryData) => {
        try {
          const geometries = geometriesRef.current;
          const geometry = geometries.find(g => g.userData?.id === geometryData.id);
          if (geometry && eventHandler.current) {
            eventHandler.current.selectGeometry(geometry);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error selecting geometry:', error);
          return false;
        }
      };
      
      // Expose geometry visibility toggle function
      window.toggleGeometryVisibility = (geometryId, visible) => {
        try {
          const geometries = geometriesRef.current;
          const geometry = geometries.find(g => g.userData?.id === geometryId);
          if (geometry) {
            geometry.visible = visible;
            // Also update the userData for consistency
            if (geometry.userData) {
              geometry.userData.visible = visible;
            }
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error toggling geometry visibility:', error);
          return false;
        }
      };
      
      // Expose function to get all geometries for export
      window.getAllGeometries = () => {
        try {
          return geometriesRef.current.filter(geometry => 
            geometry.userData && 
            geometry.userData.type && 
            geometry.userData.type !== 'solidAngleLine'
          );
        } catch (error) {
          console.error('Error getting geometries:', error);
          return [];
        }
      };
      
      // Expose function to update geometry name
      window.updateGeometryName = (geometryId, newName) => {
        try {
          const geometries = geometriesRef.current;
          const geometry = geometries.find(g => g.userData?.id === geometryId);
          if (geometry && geometry.userData) {
            geometry.userData.volumeName = newName;
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error updating geometry name:', error);
          return false;
        }
      };
      
      // Expose function to update geometry position
      window.updateGeometryPosition = (geometryId, newPosition) => {
        try {
          const geometries = geometriesRef.current;
          const geometry = geometries.find(g => g.userData?.id === geometryId);
          if (geometry) {
            geometry.position.set(newPosition.x, newPosition.y, newPosition.z);
            geometry.updateMatrixWorld();
            
            // Trigger geometry change callback
            if (callbacks.onGeometryChanged) {
              callbacks.onGeometryChanged(geometryId, {
                position: newPosition,
                scale: geometry.scale,
                rotation: geometry.rotation
              });
            }
            
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error updating geometry position:', error);
          return false;
        }
      };
      
      // Expose function to update geometry scale
      window.updateGeometryScale = (geometryId, newScale) => {
        try {
          const geometries = geometriesRef.current;
          const geometry = geometries.find(g => g.userData?.id === geometryId);
          if (geometry) {
            geometry.scale.set(newScale.x, newScale.y, newScale.z);
            geometry.updateMatrixWorld();
            
            // Trigger geometry change callback
            if (callbacks.onGeometryChanged) {
              callbacks.onGeometryChanged(geometryId, {
                position: geometry.position,
                scale: newScale,
                rotation: geometry.rotation
              });
            }
            
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error updating geometry scale:', error);
          return false;
        }
      };
      
      // Expose function to update geometry coordinates (general)
      window.updateGeometryCoordinates = (geometryId, coordinates) => {
        try {
          const geometries = geometriesRef.current;
          const geometry = geometries.find(g => g.userData?.id === geometryId);
          if (geometry) {
            // Update position
            geometry.position.set(coordinates.x1, coordinates.y1, coordinates.z1);
            
            // Update scale based on geometry type
            const geometryType = geometry.userData?.type;
            if (geometryType === 'box' || geometryType === 'cube') {
              geometry.scale.set(coordinates.x2, coordinates.y2, coordinates.z2);
            } else if (geometryType === 'sphere') {
              geometry.scale.set(coordinates.r1, coordinates.r1, coordinates.r1);
            } else if (geometryType === 'cylinder' || geometryType === 'cone') {
              geometry.scale.set(coordinates.r1, coordinates.r1, coordinates.z2);
            }
            
            geometry.updateMatrixWorld();
            
            // Trigger geometry change callback to update parent state
            if (callbacks.onGeometryChanged) {
              callbacks.onGeometryChanged(geometryId, {
                position: { x: coordinates.x1, y: coordinates.y1, z: coordinates.z1 },
                scale: geometry.scale,
                rotation: geometry.rotation
              });
            }
            
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error updating geometry coordinates:', error);
          return false;
        }
      };
    }
  }, [viewMode, materialMode]);

  // Ensure context menu event listener is set up
  useEffect(() => {
    if (canvasRef.current && eventHandler.current) {
      // Re-setup event listeners to ensure context menu is included
      eventHandler.current.setupEventListeners();
    }
  }, [canvasRef.current]);

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%', 
          outline: 'none',
          touchAction: 'none' // Prevent default touch behaviors on mobile
        }}
        onDragOver={(e) => eventHandler.current?.handleDragOver(e)}
        onDragLeave={(e) => eventHandler.current?.handleDragLeave(e)}
        onDrop={(e) => eventHandler.current?.handleDrop(e)}
      />
      
      {/* Context Menu */}
      <ContextMenu
        isVisible={contextMenuVisible}
        position={contextMenuPosition}
        onClose={() => setContextMenuVisible(false)}
        onDelete={() => {
          if (contextMenuObject) {
            geometryManager.current?.deleteGeometry(contextMenuObject);
          }
        }}
        onCopy={() => {
          // Copy functionality (implement if needed)
          console.log('Copy object:', contextMenuObject);
        }}
        onDuplicate={() => {
          if (contextMenuObject) {
            geometryManager.current?.duplicateGeometry(contextMenuObject);
          }
        }}
        onOpenGeometryProperties={() => setGeometryPanelVisible(true)}
        onOpenVolumeProperties={() => setVolumePanelVisible(true)}
        onOpenMeshProperties={() => setMeshPropertiesVisible(true)}
        selectedObject={contextMenuObject}
      />
      
      {/* Mesh Properties Panel */}
      <MeshPropertiesPanel
        isVisible={meshPropertiesVisible}
        onClose={() => setMeshPropertiesVisible(false)}
        onSave={(meshData) => {
          console.log('Mesh properties saved:', meshData);
        }}
        selectedObject={contextMenuObject}
      />
    </div>
  );
}
