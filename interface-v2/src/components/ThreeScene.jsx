import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useRef, useEffect, useState, useCallback } from 'react';

export default function ThreeScene({ selectedTool, onGeometryCreate, onToolSelect, onSelectionChange, onAxisChange, onViewModeChange }) {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const geometriesRef = useRef([]);
  const selectedGeometryRef = useRef(null);
  const collisionPairsRef = useRef(new Set());
  const collisionCheckCounter = useRef(0);

  // Core components refs
  const rendererRef = useRef();
  const orbitControlsRef = useRef();
  const transformControlsRef = useRef();
  const pCameraRef = useRef();
  const oCameraRef = useRef();
  const activeCameraRef = useRef();

  // State refs
  const homeViewState = useRef(null);
  const cameraAnimation = useRef(null);
  const [isPerspective, setIsPerspective] = useState(true);
  const [currentAxis, setCurrentAxis] = useState('Z');
  const [viewMode, setViewMode] = useState('solid');
  const [materialMode, setMaterialMode] = useState('solid');
  const selectedToolRef = useRef('select');
  const baseDistanceRef = useRef(10); // Store base camera distance
  const currentZoomRef = useRef(100);
  
  // CSG operation refs and state
  const csgSelectedObjects = useRef([]);
  const csgOperation = useRef(null);
  const [csgMode, setCsgMode] = useState(false);
  const sceneGroupRef = useRef(); // Reference to the scene group for rotation
  const autoSaveIntervalRef = useRef(); // Reference for auto-save interval

  // Undo/Redo History System
  const historyStack = useRef([]);
  const historyIndex = useRef(-1);
  const maxHistorySize = 50; // Limit history to prevent memory issues
  const isRestoringHistory = useRef(false); // Flag to prevent history recording during undo/redo
  
  // View features state
  const [showMesh, setShowMesh] = useState(true);
  const [showCutPlane, setShowCutPlane] = useState(false);
  const [showSolidAngleLines, setShowSolidAngleLines] = useState(false);
  const cutPlaneRef = useRef();
  const solidAngleLinesRef = useRef([]);
  useEffect(() => { selectedToolRef.current = selectedTool; }, [selectedTool]);

  // Scene persistence functions
  const saveSceneToLocalStorage = useCallback(() => {
    try {
      const sceneData = {
        geometries: geometriesRef.current.map(mesh => ({
          type: mesh.userData.type,
          position: {
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z
          },
          rotation: {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z
          },
          scale: {
            x: mesh.scale.x,
            y: mesh.scale.y,
            z: mesh.scale.z
          },
          id: mesh.userData.id,
          originalColor: mesh.userData.originalColor
        })),
        camera: {
          position: activeCameraRef.current ? {
            x: activeCameraRef.current.position.x,
            y: activeCameraRef.current.position.y,
            z: activeCameraRef.current.position.z
          } : null,
          target: orbitControlsRef.current ? {
            x: orbitControlsRef.current.target.x,
            y: orbitControlsRef.current.target.y,
            z: orbitControlsRef.current.target.z
          } : null,
          isPerspective,
          zoom: currentZoomRef.current
        },
        sceneSettings: {
          viewMode,
          materialMode,
          currentAxis,
          sceneRotation: sceneGroupRef.current ? {
            x: sceneGroupRef.current.rotation.x,
            y: sceneGroupRef.current.rotation.y,
            z: sceneGroupRef.current.rotation.z
          } : { x: 0, y: 0, z: 0 }
        },
        homeView: homeViewState.current,
        timestamp: Date.now()
      };
      
      localStorage.setItem('mercurad_scene', JSON.stringify(sceneData));
    } catch (error) {
      console.error('Failed to save scene:', error);
    }
  }, [isPerspective, viewMode, materialMode, currentAxis]);

  const loadSceneFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) return null;
      
      const sceneData = JSON.parse(savedData);
      return sceneData;
    } catch (error) {
      console.error('Failed to load scene:', error);
      return null;
    }
  }, []);

  const restoreGeometries = useCallback((savedGeometries) => {
    if (!savedGeometries || !sceneGroupRef.current) return;
    
    // Clear existing geometries
    geometriesRef.current.forEach(mesh => {
      sceneGroupRef.current.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    geometriesRef.current.length = 0;
    
    // Restore saved geometries
    savedGeometries.forEach(geometryData => {
      let geometry, material;
      
      switch (geometryData.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry(1, 1, 1);
          material = new THREE.MeshStandardMaterial({ color: geometryData.originalColor });
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(0.5, 32, 32);
          material = new THREE.MeshStandardMaterial({ color: geometryData.originalColor });
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
          material = new THREE.MeshStandardMaterial({ color: geometryData.originalColor });
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(0.5, 1, 32);
          material = new THREE.MeshStandardMaterial({ color: geometryData.originalColor });
          break;
        default:
      return;
    }
    
      const mesh = new THREE.Mesh(geometry, material);
      
      // Restore position, rotation, and scale
      mesh.position.set(geometryData.position.x, geometryData.position.y, geometryData.position.z);
      mesh.rotation.set(geometryData.rotation.x, geometryData.rotation.y, geometryData.rotation.z);
      mesh.scale.set(geometryData.scale.x, geometryData.scale.y, geometryData.scale.z);
      
      // Restore properties
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        type: geometryData.type,
        id: geometryData.id,
        originalColor: geometryData.originalColor
      };
      
      // Apply current material and view modes
      switch (materialMode) {
        case 'wireframe':
          material.wireframe = true;
          break;
        case 'transparent':
          material.transparent = true;
          material.opacity = 0.6;
          material.side = THREE.DoubleSide;
          break;
        case 'points':
          material.transparent = true;
          material.opacity = 0.8;
          break;
      }
      
      switch (viewMode) {
        case 'wireframe':
          material.wireframe = true;
          break;
        case 'points':
          material.transparent = true;
          material.opacity = 0.3;
          break;
      }
      
      material.needsUpdate = true;
      
      sceneGroupRef.current.add(mesh);
      geometriesRef.current.push(mesh);
    });
    
      }, [materialMode, viewMode]);

  const restoreSceneState = useCallback((sceneData) => {
    if (!sceneData) return;
    
    // Restore geometries
    if (sceneData.geometries) {
      restoreGeometries(sceneData.geometries);
    }
    
    // Restore camera state
    if (sceneData.camera && activeCameraRef.current && orbitControlsRef.current) {
      if (sceneData.camera.position) {
        activeCameraRef.current.position.set(
          sceneData.camera.position.x,
          sceneData.camera.position.y,
          sceneData.camera.position.z
        );
      }
      
      if (sceneData.camera.target) {
        orbitControlsRef.current.target.set(
          sceneData.camera.target.x,
          sceneData.camera.target.y,
          sceneData.camera.target.z
        );
      }
      
      if (typeof sceneData.camera.isPerspective === 'boolean') {
        setIsPerspective(sceneData.camera.isPerspective);
      }
      
      if (sceneData.camera.zoom) {
        currentZoomRef.current = sceneData.camera.zoom;
        // Zoom will be applied after setZoomLevel is defined
      }
      
      orbitControlsRef.current.update();
    }
    
    // Restore scene settings
    if (sceneData.sceneSettings) {
      if (sceneData.sceneSettings.viewMode) {
        setViewMode(sceneData.sceneSettings.viewMode);
      }
      
      if (sceneData.sceneSettings.materialMode) {
        setMaterialMode(sceneData.sceneSettings.materialMode);
      }
      
      if (sceneData.sceneSettings.currentAxis) {
        setCurrentAxis(sceneData.sceneSettings.currentAxis);
      }
      
      if (sceneData.sceneSettings.sceneRotation && sceneGroupRef.current) {
        sceneGroupRef.current.rotation.set(
          sceneData.sceneSettings.sceneRotation.x,
          sceneData.sceneSettings.sceneRotation.y,
          sceneData.sceneSettings.sceneRotation.z
        );
      }
    }
    
    // Restore home view
    if (sceneData.homeView) {
      homeViewState.current = sceneData.homeView;
    }
    
  }, [restoreGeometries]);

  const clearSavedScene = useCallback(() => {
    try {
      localStorage.removeItem('mercurad_scene');
    } catch (error) {
      console.error('Failed to clear saved scene:', error);
    }
  }, []);

  // Collision detection, geometry creation, and particle effects...
  // (Assuming these functions exist and are correct from previous steps)
  // Helper function to calculate bounding sphere radius for different geometries
  const getBoundingSphereRadius = (mesh) => {
    if (!mesh || !mesh.userData.type) return 0.5; // Default radius
    switch (mesh.userData.type) {
      case 'cube':
        return Math.sqrt(3) * 0.5; // Half diagonal of unit cube
      case 'sphere':
        return 0.5; // Sphere radius
      case 'cylinder':
        return Math.sqrt(0.5 * 0.5 + 0.5 * 0.5); // sqrt(radius^2 + half_height^2)
      case 'cone':
        return Math.sqrt(0.5 * 0.5 + 0.5 * 0.5); // Similar to cylinder
      default:
        return 0.5;
    }
  };

  // Collision detection function
  const checkCollisions = () => {
    const allGeometries = [...geometriesRef.current].filter(Boolean);
    const currentCollisions = new Set();
    
    for (let i = 0; i < allGeometries.length; i++) {
      for (let j = i + 1; j < allGeometries.length; j++) {
        const meshA = allGeometries[i];
        const meshB = allGeometries[j];
        
        if (!meshA.userData || !meshB.userData) continue;

        const distance = meshA.position.distanceTo(meshB.position);
        const radiusA = getBoundingSphereRadius(meshA);
        const radiusB = getBoundingSphereRadius(meshB);
        const collisionDistance = radiusA + radiusB;
        
        const pairKey = `${meshA.userData.id}-${meshB.userData.id}`;
        
        if (distance < collisionDistance) {
          currentCollisions.add(pairKey);
          
          // Check if this is a new collision
          if (!collisionPairsRef.current.has(pairKey)) {
            handleCollision(meshA, meshB, distance, collisionDistance);
          }
        }
      }
    }
    
    // Update collision pairs
    collisionPairsRef.current = currentCollisions;
  };

  // Handle collision response
  const handleCollision = (meshA, meshB, distance, collisionDistance) => {
    // Calculate collision normal (direction from A to B)
    const normal = new THREE.Vector3()
      .subVectors(meshB.position, meshA.position)
      .normalize();
    
    // Calculate overlap amount
    const overlap = collisionDistance - distance;
    
    // Separate objects by moving them apart
    const separationA = normal.clone().multiplyScalar(-overlap * 0.5);
    const separationB = normal.clone().multiplyScalar(overlap * 0.5);
    
    meshA.position.add(separationA);
    meshB.position.add(separationB);
    
    // Visual feedback - flash colors
    const originalColorA = meshA.userData.originalColor;
    const originalColorB = meshB.userData.originalColor;
    
    // Flash to bright colors
    meshA.material.color.setHex(0xffff00); // Yellow
    meshB.material.color.setHex(0xffff00); // Yellow
    
    // Calculate collision intensity based on overlap
    const intensity = Math.min(overlap / 0.1, 1.0); // Normalize to 0-1
    
    // Create impact effect particles with intensity-based scaling
    createImpactEffect(meshA.position.clone().lerp(meshB.position, 0.5), intensity);
    
    // Reset colors after a short delay
    setTimeout(() => {
      if (selectedGeometryRef.current !== meshA) {
        meshA.material.color.setHex(originalColorA);
      }
      if (selectedGeometryRef.current !== meshB) {
        meshB.material.color.setHex(originalColorB);
      }
    }, 200);
    
    const intensityLevel = intensity > 0.7 ? "HARD" : intensity > 0.3 ? "MEDIUM" : "SOFT";
      };

  // Create impact effect at collision point
  const createImpactEffect = (position, intensity = 0.5) => {
    if (!sceneRef.current) return;
    
    const particleCount = Math.floor(8 * (0.5 + intensity * 0.5)); // 4-8 particles based on intensity
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      
      particle.position.copy(position);
      
      // Random velocity scaled by intensity
      const velocityScale = 0.05 + intensity * 0.1; // 0.05-0.15 based on intensity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * velocityScale,
        (Math.random() - 0.5) * velocityScale,
        (Math.random() - 0.5) * velocityScale
      );
      
      particle.userData = {
        velocity,
        life: 1.0,
        maxLife: 1.0
      };
      
      particles.push(particle);
      sceneRef.current.add(particle);
    }
    
    // Animate particles
    const animateParticles = () => {
      particles.forEach((particle, index) => {
        if (particle.userData.life <= 0) {
          sceneRef.current.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
          particles.splice(index, 1);
      return;
    }
    
        // Update position
        particle.position.add(particle.userData.velocity);
        
        // Apply gravity
        particle.userData.velocity.y -= 0.005;
        
        // Fade out
        particle.userData.life -= 0.05;
        const alpha = particle.userData.life / particle.userData.maxLife;
        particle.material.opacity = alpha;
        particle.material.transparent = true;
        
        // Shrink
        const scale = alpha;
        particle.scale.setScalar(scale);
      });
      
      if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
      }
    };
    
    animateParticles();
  };

  // Geometry creation function
  const createGeometry = useCallback((geometryType) => {
    if (!sceneRef.current) return;
    
    // Save history state BEFORE creating new geometry
    saveToHistory();
    
    let geometry, material, mesh;
    const scene = sceneRef.current;
    
    // Generate random position
    const randomPosition = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      Math.random() * 3 + 0.5,
      (Math.random() - 0.5) * 6
    );
    
    switch (geometryType) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshStandardMaterial({ color: 0x525252 });
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        material = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        material = new THREE.MeshStandardMaterial({ color: 0x7ed321 });
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        material = new THREE.MeshStandardMaterial({ color: 0xf5a623 });
        break;
      default:
        return;
    }
    
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(randomPosition);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { 
      type: geometryType, 
      id: Date.now(),
      originalColor: material.color.getHex()
    };
    
    // Apply current view mode to new object
    switch (viewMode) {
      case 'wireframe':
        material.wireframe = true;
        break;
      case 'points':
        material.transparent = true;
        material.opacity = 0.7;
        break;
      default:
        // solid mode is default
        break;
    }
    
    // Apply current material mode to new object
    switch (materialMode) {
      case 'wireframe':
        material.wireframe = true;
        break;
      case 'transparent':
        material.transparent = true;
        material.opacity = 0.6;
        material.side = THREE.DoubleSide;
        break;
      case 'points':
        material.transparent = true;
        material.opacity = 0.8;
        break;
      default:
        // solid mode is default
        break;
    }
    
    sceneGroupRef.current.add(mesh);
    geometriesRef.current.push(mesh);
    
    // If solid angle lines are enabled, add line to new object
    if (showSolidAngleLines) {
      const center = new THREE.Vector3(0, 0, 0);
      const points = [center, mesh.position.clone()];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8
      });
      
      const line = new THREE.Line(geometry, material);
      line.userData = { type: 'solidAngleLine' };
      
      sceneRef.current.add(line);
      solidAngleLinesRef.current.push(line);
    }
    
      // Auto-save scene after creating geometry
  saveSceneToLocalStorage();

  
  return mesh; // Return the created mesh
}, [viewMode, materialMode, showSolidAngleLines, saveSceneToLocalStorage]);

// CSG Operations
const performCSGOperation = useCallback((operation, objectA, objectB) => {
  if (!objectA || !objectB) {
    console.warn('CSG operation requires two objects');
    return null;
  }
  
  // Save history state BEFORE CSG operation
  saveToHistory();

  
  // Create a simple combined geometry based on operation type
  let resultGeometry;
  let resultMaterial;
  
  // For now, we'll create a basic implementation
  // In a full implementation, you'd use a proper CSG library like THREE-CSGMesh
  switch (operation) {
    case 'union':
      // Simple union - create a group containing both objects
      resultGeometry = new THREE.BoxGeometry(
        Math.max(objectA.scale.x, objectB.scale.x) * 1.2,
        Math.max(objectA.scale.y, objectB.scale.y) * 1.2,
        Math.max(objectA.scale.z, objectB.scale.z) * 1.2
      );
      resultMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.8
      });
      break;
      
    case 'subtract':
      // Simple subtraction - create smaller geometry
      resultGeometry = new THREE.BoxGeometry(
        Math.abs(objectA.scale.x - objectB.scale.x * 0.5),
        Math.abs(objectA.scale.y - objectB.scale.y * 0.5),
        Math.abs(objectA.scale.z - objectB.scale.z * 0.5)
      );
      resultMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x666666,
        transparent: true,
        opacity: 0.9
      });
      break;
      
    case 'intersect':
      // Simple intersection - create geometry at intersection
      resultGeometry = new THREE.SphereGeometry(
        Math.min(objectA.scale.x, objectB.scale.x) * 0.8,
        32, 32
      );
      resultMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.7
      });
      break;
      
    default:
      console.warn('Unknown CSG operation:', operation);
      return null;
  }

  // Create the result mesh
  const resultMesh = new THREE.Mesh(resultGeometry, resultMaterial);
  
  // Position at midpoint between objects
  resultMesh.position.copy(
    new THREE.Vector3().addVectors(objectA.position, objectB.position).multiplyScalar(0.5)
  );
  
  resultMesh.castShadow = true;
  resultMesh.receiveShadow = true;
  resultMesh.userData = {
    type: `csg-${operation}`,
    id: Date.now(),
    originalColor: resultMaterial.color.getHex(),
    csgOperation: operation,
    sourceObjects: [objectA.userData.id, objectB.userData.id],
    volumeName: `${operation.toUpperCase()}_${objectA.userData.volumeName || 'A'}_${objectB.userData.volumeName || 'B'}`
  };

  // Add to scene
  sceneGroupRef.current.add(resultMesh);
  geometriesRef.current.push(resultMesh);

  // Remove original objects
  sceneGroupRef.current.remove(objectA);
  sceneGroupRef.current.remove(objectB);
  
  // Remove from geometries array
  geometriesRef.current = geometriesRef.current.filter(
    obj => obj !== objectA && obj !== objectB
  );

  // Clean up solid angle lines if they exist
  if (showSolidAngleLines) {
    // Remove lines for deleted objects and add for new object
    hideSolidAngleLines();
    addSolidAngleLines();
  }

    saveSceneToLocalStorage();
  
  return resultMesh;
}, [showSolidAngleLines, saveSceneToLocalStorage]);

// History Management Functions
const saveToHistory = useCallback(() => {
  if (isRestoringHistory.current) return; // Don't save history during undo/redo
  
  // Create a snapshot of the current scene state
  const snapshot = {
    timestamp: Date.now(),
    geometries: geometriesRef.current.map(mesh => ({
      id: mesh.userData.id,
      type: mesh.userData.type,
      position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
      rotation: { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z },
      scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
      material: {
        color: mesh.material.color.getHex(),
        opacity: mesh.material.opacity,
        transparent: mesh.material.transparent
      },
      userData: { ...mesh.userData }
    })),
    camera: {
      position: { x: activeCameraRef.current.position.x, y: activeCameraRef.current.position.y, z: activeCameraRef.current.position.z },
      target: { x: orbitControlsRef.current.target.x, y: orbitControlsRef.current.target.y, z: orbitControlsRef.current.target.z },
      zoom: activeCameraRef.current.zoom
    },
    sceneRotation: {
      x: sceneGroupRef.current?.rotation.x || 0,
      y: sceneGroupRef.current?.rotation.y || 0,
      z: sceneGroupRef.current?.rotation.z || 0
    },
    viewSettings: {
      showMesh,
      showCutPlane,
      showSolidAngleLines,
      materialMode,
      viewMode
    }
  };

  // Remove future history if we're not at the end
  if (historyIndex.current < historyStack.current.length - 1) {
    historyStack.current = historyStack.current.slice(0, historyIndex.current + 1);
  }

  // Add new snapshot
  historyStack.current.push(snapshot);
  historyIndex.current = historyStack.current.length - 1;

  // Limit history size
  if (historyStack.current.length > maxHistorySize) {
    historyStack.current.shift();
    historyIndex.current--;
  }

  }, [showMesh, showCutPlane, showSolidAngleLines, materialMode, viewMode, saveSceneToLocalStorage]);

const restoreFromHistory = useCallback((snapshot) => {
  if (!snapshot) return;
  
  isRestoringHistory.current = true;
  
  try {
    // Clear current geometries
    geometriesRef.current.forEach(mesh => {
      sceneGroupRef.current?.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    geometriesRef.current = [];

    // Deselect current object
    if (selectedGeometryRef.current) {
      selectedGeometryRef.current = null;
      transformControlsRef.current?.detach();
      transformControlsRef.current && (transformControlsRef.current.visible = false);
      onSelectionChange && onSelectionChange(false, null);
    }

    // Restore geometries
    snapshot.geometries.forEach(geomData => {
      let geometry;
      
      // Create geometry based on type
      switch (geomData.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(0.5, 32, 32);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(0.5, 1, 32);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
      }

      const material = new THREE.MeshStandardMaterial({
        color: geomData.material.color,
        opacity: geomData.material.opacity,
        transparent: geomData.material.transparent,
        roughness: 0.3,
        metalness: 0.1
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // Restore position, rotation, scale
      mesh.position.set(geomData.position.x, geomData.position.y, geomData.position.z);
      mesh.rotation.set(geomData.rotation.x, geomData.rotation.y, geomData.rotation.z);
      mesh.scale.set(geomData.scale.x, geomData.scale.y, geomData.scale.z);
      
      // Restore userData
      mesh.userData = { ...geomData.userData };
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      sceneGroupRef.current?.add(mesh);
      geometriesRef.current.push(mesh);
    });

    // Restore camera
    activeCameraRef.current.position.set(
      snapshot.camera.position.x,
      snapshot.camera.position.y,
      snapshot.camera.position.z
    );
    orbitControlsRef.current.target.set(
      snapshot.camera.target.x,
      snapshot.camera.target.y,
      snapshot.camera.target.z
    );
    activeCameraRef.current.zoom = snapshot.camera.zoom;
    activeCameraRef.current.updateProjectionMatrix();
    orbitControlsRef.current.update();

    // Restore scene rotation
    if (sceneGroupRef.current && snapshot.sceneRotation) {
      sceneGroupRef.current.rotation.set(
        snapshot.sceneRotation.x,
        snapshot.sceneRotation.y,
        snapshot.sceneRotation.z
      );
    }

    // Restore view settings
    setShowMesh(snapshot.viewSettings.showMesh);
    setShowCutPlane(snapshot.viewSettings.showCutPlane);
    setShowSolidAngleLines(snapshot.viewSettings.showSolidAngleLines);
    setMaterialMode(snapshot.viewSettings.materialMode);
    setViewMode(snapshot.viewSettings.viewMode);

    // Update material mode for all meshes
    geometriesRef.current.forEach(mesh => {
      updateMeshMaterial(mesh, snapshot.viewSettings.materialMode);
    });

    // Update mesh visibility
    geometriesRef.current.forEach(mesh => {
      mesh.visible = snapshot.viewSettings.showMesh;
    });

    // Handle solid angle lines
    if (snapshot.viewSettings.showSolidAngleLines) {
      setTimeout(() => addSolidAngleLines(), 100);
    } else {
      hideSolidAngleLines();
    }

        
  } catch (error) {
    console.error('Error restoring from history:', error);
  } finally {
    isRestoringHistory.current = false;
  }
}, [onSelectionChange, setShowMesh, setShowCutPlane, setShowSolidAngleLines, setMaterialMode, setViewMode]);

const undo = useCallback(() => {
  if (historyIndex.current > 0) {
    historyIndex.current--;
    const snapshot = historyStack.current[historyIndex.current];
    restoreFromHistory(snapshot);
        
    // Visual feedback
    if (rendererRef.current) {
      const originalClearColor = rendererRef.current.getClearColor().getHex();
      rendererRef.current.setClearColor(0x004400); // Brief green flash
      setTimeout(() => {
        rendererRef.current.setClearColor(originalClearColor);
      }, 150);
    }
  } else {
      }
}, [restoreFromHistory]);

const redo = useCallback(() => {
  if (historyIndex.current < historyStack.current.length - 1) {
    historyIndex.current++;
    const snapshot = historyStack.current[historyIndex.current];
    restoreFromHistory(snapshot);
        
    // Visual feedback
    if (rendererRef.current) {
      const originalClearColor = rendererRef.current.getClearColor().getHex();
      rendererRef.current.setClearColor(0x440044); // Brief purple flash
      setTimeout(() => {
        rendererRef.current.setClearColor(originalClearColor);
      }, 150);
    }
  } else {
      }
}, [restoreFromHistory]);

// Volume Reduction Function
const reduceVolume = useCallback((targetMesh, reductionPoint) => {
  if (!targetMesh) {
    console.warn('Volume reduction requires a target mesh');
    return null;
  }
  
  // Save history state BEFORE volume reduction
  saveToHistory();

  
  // Create a smaller geometry to represent the reduced volume
  let reducedGeometry;
  let reducedMaterial;
  
  // Calculate reduction based on original geometry
  const originalGeometry = targetMesh.geometry;
  const boundingBox = new THREE.Box3().setFromObject(targetMesh);
  const size = boundingBox.getSize(new THREE.Vector3());
  
  // Create a reduced version based on geometry type
  switch (targetMesh.userData.type) {
    case 'cube':
      reducedGeometry = new THREE.BoxGeometry(
        size.x * 0.7,  // Reduce by 30%
        size.y * 0.7,
        size.z * 0.7
      );
      break;
      
    case 'sphere':
      const radius = Math.max(size.x, size.y, size.z) / 2;
      reducedGeometry = new THREE.SphereGeometry(radius * 0.7, 32, 32);
      break;
      
    case 'cylinder':
      reducedGeometry = new THREE.CylinderGeometry(
        size.x * 0.35,  // Reduce radius
        size.x * 0.35,
        size.y * 0.7,   // Reduce height
        32
      );
      break;
      
    case 'cone':
      reducedGeometry = new THREE.ConeGeometry(
        size.x * 0.35,  // Reduce radius
        size.y * 0.7,   // Reduce height
        32
      );
      break;
      
    default:
      // For CSG or unknown types, create a generic reduced box
      reducedGeometry = new THREE.BoxGeometry(
        size.x * 0.7,
        size.y * 0.7,
        size.z * 0.7
      );
      break;
  }

  // Create material with slightly different appearance to show reduction
  reducedMaterial = new THREE.MeshStandardMaterial({ 
    color: targetMesh.material.color.getHex(),
    transparent: true,
    opacity: 0.9,
    roughness: 0.3,
    metalness: 0.1
  });

  // Create the reduced mesh
  const reducedMesh = new THREE.Mesh(reducedGeometry, reducedMaterial);
  
  // Keep same position and rotation
  reducedMesh.position.copy(targetMesh.position);
  reducedMesh.rotation.copy(targetMesh.rotation);
  reducedMesh.scale.copy(targetMesh.scale);
  
  reducedMesh.castShadow = true;
  reducedMesh.receiveShadow = true;
  reducedMesh.userData = {
    ...targetMesh.userData,
    id: Date.now(),
    originalColor: reducedMaterial.color.getHex(),
    volumeReduced: true,
    reductionHistory: [
      ...(targetMesh.userData.reductionHistory || []),
      {
        timestamp: Date.now(),
        reductionPoint: reductionPoint,
        reductionFactor: 0.7
      }
    ],
    volumeName: `${targetMesh.userData.volumeName || 'Volume'}_Reduced`
  };

  // Replace the original mesh
  sceneGroupRef.current.remove(targetMesh);
  sceneGroupRef.current.add(reducedMesh);
  
  // Update geometries array
  const index = geometriesRef.current.indexOf(targetMesh);
  if (index !== -1) {
    geometriesRef.current[index] = reducedMesh;
  }

  // Clean up solid angle lines if they exist
  if (showSolidAngleLines) {
    hideSolidAngleLines();
    addSolidAngleLines();
  }

    saveSceneToLocalStorage();
  
  return reducedMesh;
}, [showSolidAngleLines, saveSceneToLocalStorage]);

  const animateCameraTo = useCallback((targetPosition, targetLookAt) => {
    cameraAnimation.current = {
      startPosition: activeCameraRef.current.position.clone(),
      endPosition: targetPosition.clone(),
      startTarget: orbitControlsRef.current.target.clone(),
      endTarget: targetLookAt.clone(),
      alpha: 0,
    };
  }, []);

  const zoomToFit = useCallback((objects) => {
    if (!objects || objects.length === 0) return;

    const box = new THREE.Box3();
    objects.forEach(obj => box.expandByObject(obj));

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const cam = activeCameraRef.current;
    const renderer = rendererRef.current;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir); // points from camera toward scene

    if (cam.isPerspectiveCamera) {
      const fov = cam.fov * (Math.PI / 180);
      let distance = maxDim / (2 * Math.tan(fov / 2));
      distance *= 1.5; // padding
      const newPos = center.clone().addScaledVector(dir, -distance);
      animateCameraTo(newPos, center);
    } else if (cam.isOrthographicCamera) {
      const sizeVec = new THREE.Vector2();
      renderer.getSize(sizeVec);
      const aspect = sizeVec.x / sizeVec.y;
      const halfHeight = (size.y / 2) * 1.2; // padding
      const halfWidth = Math.max(halfHeight * aspect, (size.x / 2) * 1.2);
      cam.left = -halfWidth;
      cam.right = halfWidth;
      cam.top = halfHeight;
      cam.bottom = -halfHeight;
      cam.updateProjectionMatrix();
      const dist = cam.position.distanceTo(center);
      const newPos = center.clone().addScaledVector(dir, -Math.max(dist, 0.001));
      animateCameraTo(newPos, center);
    }
  }, [animateCameraTo]);

  // Set camera to view along specific axis
  const setAxisView = useCallback((axis) => {
    const distance = 10;
    const center = new THREE.Vector3(0, 0, 0);
    let newPosition;

    switch (axis.toUpperCase()) {
      case 'X':
        newPosition = new THREE.Vector3(distance, 0, 0);
        break;
      case 'Y':
        newPosition = new THREE.Vector3(0, distance, 0);
        break;
      case 'Z':
        newPosition = new THREE.Vector3(0, 0, distance);
        break;
      default:
        return;
    }

    setCurrentAxis(axis.toUpperCase());
    animateCameraTo(newPosition, center);
      }, [animateCameraTo]);

  // Change view mode for all objects
  const changeViewMode = useCallback((mode) => {
    setViewMode(mode);
    
    geometriesRef.current.forEach(mesh => {
      if (!mesh.material) return;
      
      // Store original material if not already stored
      if (!mesh.userData.originalMaterial) {
        mesh.userData.originalMaterial = {
          wireframe: mesh.material.wireframe,
          transparent: mesh.material.transparent,
          opacity: mesh.material.opacity
        };
      }
      
      switch (mode) {
        case 'solid':
          mesh.material.wireframe = false;
          mesh.material.transparent = false;
          mesh.material.opacity = 1.0;
          break;
        case 'wireframe':
          mesh.material.wireframe = true;
          mesh.material.transparent = false;
          mesh.material.opacity = 1.0;
          break;
        case 'points':
          mesh.material.wireframe = false;
          mesh.material.transparent = true;
          mesh.material.opacity = 0.3;
          // Create point cloud effect by making material very transparent
          break;
      }
      mesh.material.needsUpdate = true;
    });
    
      }, []);

  // Change material mode for all objects
  const changeMaterialMode = useCallback((mode) => {
    setMaterialMode(mode);
    
    geometriesRef.current.forEach(mesh => {
      if (!mesh.material) return;
      
      // Store original material properties if not already stored
      if (!mesh.userData.originalMaterial) {
        mesh.userData.originalMaterial = {
          wireframe: mesh.material.wireframe,
          transparent: mesh.material.transparent,
          opacity: mesh.material.opacity,
          side: mesh.material.side
        };
      }
      
      // Reset to original state first
      mesh.material.wireframe = false;
      mesh.material.transparent = false;
      mesh.material.opacity = 1.0;
      mesh.material.side = THREE.FrontSide;
      
      switch (mode) {
        case 'solid':
          // Default solid material - already reset above
          break;
        case 'wireframe':
          mesh.material.wireframe = true;
          break;
        case 'transparent':
          mesh.material.transparent = true;
          mesh.material.opacity = 0.6;
          mesh.material.side = THREE.DoubleSide; // Show both sides for transparency
          break;
        case 'points':
          mesh.material.transparent = true;
          mesh.material.opacity = 0.8;
          // Create points by using very small geometry or point material
          // For now, we'll make it semi-transparent with visible edges
          mesh.material.wireframe = false;
          break;
      }
      mesh.material.needsUpdate = true;
    });
    
      }, []);

  // Zoom control function
  const setZoomLevel = useCallback((zoomPercent) => {
    if (!activeCameraRef.current || !orbitControlsRef.current) return;
    
    const zoomFactor = zoomPercent / 100;
    const camera = activeCameraRef.current;
    const controls = orbitControlsRef.current;
    
    currentZoomRef.current = zoomPercent;
    
    if (camera.isPerspectiveCamera) {
      // For perspective camera, adjust camera position relative to target
      const target = controls.target.clone();
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      // Calculate new distance based on zoom
      const newDistance = baseDistanceRef.current / zoomFactor;
      
      // Position camera at new distance
      const newPosition = target.clone().addScaledVector(direction, -newDistance);
      camera.position.copy(newPosition);
      
      // Update controls
      controls.update();
      
    } else if (camera.isOrthographicCamera) {
      // For orthographic camera, adjust the viewing volume
      const baseSize = 5; // Base size when zoom is 100%
      const size = baseSize / zoomFactor;
      const aspect = rendererRef.current ? 
        rendererRef.current.domElement.clientWidth / rendererRef.current.domElement.clientHeight : 
        window.innerWidth / window.innerHeight;
      
      camera.left = -size * aspect;
      camera.right = size * aspect;
      camera.top = size;
      camera.bottom = -size;
      camera.updateProjectionMatrix();
    }
    
      }, []);

  // Expose functions to parent
  useEffect(() => {
    if (onAxisChange) {
      window.setAxisView = setAxisView;
    }
  }, [setAxisView, onAxisChange]);

  useEffect(() => {
    if (onViewModeChange) {
      window.setViewMode = changeViewMode;
    }
  }, [changeViewMode, onViewModeChange]);

  useEffect(() => {
    window.setMaterialMode = changeMaterialMode;
  }, [changeMaterialMode]);

  useEffect(() => {
    window.setZoomLevel = setZoomLevel;
  }, [setZoomLevel]);

  // Scene rotation control function
  const setSceneRotation = useCallback((rotation) => {
    if (!sceneGroupRef.current) return;
    
    const { horizontal, vertical } = rotation;
    
    // Convert degrees to radians
    const horizontalRad = (horizontal * Math.PI) / 180;
    const verticalRad = (vertical * Math.PI) / 180;
    
    // Apply rotations to the scene group
    sceneGroupRef.current.rotation.y = horizontalRad; // Horizontal rotation around Y-axis
    sceneGroupRef.current.rotation.x = verticalRad;   // Vertical rotation around X-axis
    
      }, []);

  // View menu action handlers
  const toggleMesh = useCallback(() => {
    setShowMesh(prev => {
      const newValue = !prev;
      geometriesRef.current.forEach(mesh => {
        mesh.visible = newValue;
      });
            return newValue;
    });
  }, []);

  const toggleCutPlane = useCallback(() => {
    setShowCutPlane(prev => {
      const newValue = !prev;
      if (newValue) {
        createCutPlane();
        } else {
        removeCutPlane();
      }
            return newValue;
    });
  }, []);

  const createCutPlane = useCallback(() => {
    if (!sceneRef.current || cutPlaneRef.current) return;

    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const cutPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    cutPlane.position.set(0, 0, 0);
    cutPlane.userData = { type: 'cutPlane' };
    
    sceneRef.current.add(cutPlane);
    cutPlaneRef.current = cutPlane;
    
      }, []);

  const removeCutPlane = useCallback(() => {
    if (cutPlaneRef.current && sceneRef.current) {
      sceneRef.current.remove(cutPlaneRef.current);
      if (cutPlaneRef.current.geometry) cutPlaneRef.current.geometry.dispose();
      if (cutPlaneRef.current.material) cutPlaneRef.current.material.dispose();
      cutPlaneRef.current = null;
          }
  }, []);

  const hideSolidAngleLines = useCallback(() => {
    setShowSolidAngleLines(false);
    solidAngleLinesRef.current.forEach(line => {
      if (sceneRef.current && line) {
        sceneRef.current.remove(line);
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      }
    });
    solidAngleLinesRef.current = [];
      }, []);

  const addSolidAngleLines = useCallback(() => {
    if (!sceneRef.current) return;
    
    // Clear existing lines first
    hideSolidAngleLines();
    
    setShowSolidAngleLines(true);
    
    // Create solid angle lines from center to each geometry
    const center = new THREE.Vector3(0, 0, 0);
    const lines = [];
    
    geometriesRef.current.forEach(mesh => {
      if (mesh && mesh.position) {
        const points = [];
        points.push(center);
        points.push(mesh.position.clone());
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.8
        });
        
        const line = new THREE.Line(geometry, material);
        line.userData = { type: 'solidAngleLine' };
        
        sceneRef.current.add(line);
        lines.push(line);
      }
    });
    
    solidAngleLinesRef.current = lines;
      }, [hideSolidAngleLines]);

  const normalView = useCallback(() => {
    // Reset all view settings to normal/default
    setShowMesh(true);
    setShowCutPlane(false);
    setShowSolidAngleLines(false);
    
    // Show all meshes
    geometriesRef.current.forEach(mesh => {
      mesh.visible = true;
    });
    
    // Remove cut plane
    removeCutPlane();
    
    // Remove solid angle lines
    hideSolidAngleLines();
    
    // Reset camera to default position
    animateCameraTo(new THREE.Vector3(5, 5, 5), new THREE.Vector3(0, 0, 0));
    
      }, [removeCutPlane, hideSolidAngleLines, animateCameraTo]);

  const handleViewMenuAction = useCallback((action) => {
    switch (action) {
      case 'toggleMesh':
        toggleMesh();
        break;
      case 'toggleCutPlane':
        toggleCutPlane();
        break;
      case 'hideSolidAngleLines':
        hideSolidAngleLines();
        break;
      case 'addSolidAngleLines':
        addSolidAngleLines();
        break;
      case 'normalView':
        normalView();
        break;
      default:
            }
  }, [toggleMesh, toggleCutPlane, hideSolidAngleLines, addSolidAngleLines, normalView]);

  useEffect(() => {
    window.setSceneRotation = setSceneRotation;
    window.clearSavedScene = clearSavedScene;
    window.saveScene = saveSceneToLocalStorage;
    window.handleViewMenuAction = handleViewMenuAction;
  }, [setSceneRotation, clearSavedScene, saveSceneToLocalStorage, handleViewMenuAction]);

  // Main setup useEffect
  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create a group for all scene objects that can be rotated
    const sceneGroup = new THREE.Group();
    sceneGroupRef.current = sceneGroup;
    scene.add(sceneGroup);
    
    // Add grid helper to the rotatable group
    sceneGroup.add(new THREE.GridHelper(10, 10, 0x888888, 0x444444));
    
    // Add a ground plane for shadows to the rotatable group
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333, 
      transparent: true, 
      opacity: 0.1 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -0.01; // Slightly below grid
    ground.receiveShadow = true;
    sceneGroup.add(ground);

    // Cameras
    pCameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    pCameraRef.current.position.set(5, 5, 5);
    const aspect = window.innerWidth / window.innerHeight;
    oCameraRef.current = new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 1000);
    oCameraRef.current.position.set(5, 5, 5);
    activeCameraRef.current = pCameraRef.current;
    
    // Set base distance for zoom calculations
    const initialDistance = pCameraRef.current.position.distanceTo(new THREE.Vector3(0, 0, 0));
    baseDistanceRef.current = initialDistance;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x262626);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    
    // Enhanced Lighting Setup
    // Main directional light (sun-like)
    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Secondary directional light from opposite side for fill lighting
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(-5, 5, -7.5);
    scene.add(fillLight);

    // Ambient light for overall brightness
    const ambientLight = new THREE.AmbientLight(0x606060, 1.2);
    scene.add(ambientLight);

    // Additional point lights for better object visibility
    const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1.5, 50);
    pointLight2.position.set(-10, 10, -10);
    scene.add(pointLight2);

    // Hemisphere light for natural sky/ground lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.8);
    scene.add(hemisphereLight);

    // Controls
    orbitControlsRef.current = new OrbitControls(activeCameraRef.current, renderer.domElement);
    orbitControlsRef.current.enableDamping = true;
    orbitControlsRef.current.dampingFactor = 0.05;
    
    // Listen for zoom changes from orbit controls
    orbitControlsRef.current.addEventListener('change', () => {
      if (activeCameraRef.current && activeCameraRef.current.isPerspectiveCamera) {
        const currentDistance = activeCameraRef.current.position.distanceTo(orbitControlsRef.current.target);
        const zoomPercent = Math.round((baseDistanceRef.current / currentDistance) * 100);
        currentZoomRef.current = zoomPercent;
        
        // Notify bottom bar of zoom change
        window.dispatchEvent(new CustomEvent('zoomUpdate', { 
          detail: { zoom: zoomPercent }
        }));
      }
    });
    
    transformControlsRef.current = new TransformControls(activeCameraRef.current, renderer.domElement);
    transformControlsRef.current.setMode('translate');
    transformControlsRef.current.setSize(0.8); // Make gizmo slightly smaller
    transformControlsRef.current.setSpace('world'); // Use world space
    scene.add(transformControlsRef.current);

    transformControlsRef.current.addEventListener('dragging-changed', (event) => {
      orbitControlsRef.current.enabled = !event.value;
      if (event.value) {
        // Save history when dragging starts
        saveToHistory();
      } else {
        // Actions when dragging ends
        checkCollisions();
        // Auto-save scene after object transformation
        saveSceneToLocalStorage();
      }
    });

    // Make sure gizmo is visible
    transformControlsRef.current.visible = true;

    // Initialize history with empty scene state
    setTimeout(() => {
      saveToHistory();
          }, 500); // Wait for scene to fully initialize

    const deselect = () => {
      if (selectedGeometryRef.current) {
        selectedGeometryRef.current.material.color.setHex(selectedGeometryRef.current.userData.originalColor);
      }
      selectedGeometryRef.current = null;
      transformControlsRef.current.detach();
      onSelectionChange && onSelectionChange(false, null);
    };

    const onPointerDown = (event) => {
      const tool = selectedToolRef.current;
      const isCSGTool = tool && tool.startsWith('csg-');
      
      if (!isCSGTool && tool !== 'select' && tool !== 'pan' && tool !== 'target') return;
      
            
      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, activeCameraRef.current);
      const intersects = raycaster.intersectObjects(geometriesRef.current);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        
        // Handle Shift+Click for volume reduction
        if (event.shiftKey && (tool === 'select' || tool === 'pan')) {
                    
          // Calculate the click point in world coordinates
          const clickPoint = intersects[0].point;
          
          // Perform volume reduction
          const reducedMesh = reduceVolume(object, clickPoint);
          
          if (reducedMesh) {
            // Select the reduced mesh
            deselect();
            selectedGeometryRef.current = reducedMesh;
            reducedMesh.material.color.set(0xff6600); // Orange to show reduction
            transformControlsRef.current.attach(reducedMesh);
            transformControlsRef.current.visible = true;
            onSelectionChange && onSelectionChange(true, reducedMesh);
            
            // Brief visual feedback
            setTimeout(() => {
              if (reducedMesh.material) {
                reducedMesh.material.color.set(0x00ff00); // Back to green selection
              }
            }, 1000);
          }
          return; // Don't do regular selection after volume reduction
        }
        
        // Handle CSG mode
        if (isCSGTool && csgMode) {
          // Add object to CSG selection
          if (!csgSelectedObjects.current.includes(object)) {
            csgSelectedObjects.current.push(object);
            
            // Visual feedback - make selected objects glow
            object.material.color.set(0xffff00); // Yellow for CSG selection
            
            const selectionCount = csgSelectedObjects.current.length;
                        
            // Show progress message
            if (selectionCount === 1) {
                          }
            
            // If we have two objects, perform the operation
            if (selectionCount === 2) {
              const [objectA, objectB] = csgSelectedObjects.current;
                            
              const result = performCSGOperation(csgOperation.current, objectA, objectB);
              
              if (result) {
                // Reset CSG mode
                setCsgMode(false);
                csgSelectedObjects.current = [];
                csgOperation.current = null;
                onToolSelect && onToolSelect('select');
                
                // Select the new object
                selectedGeometryRef.current = result;
                result.material.color.set(0x00ff00);
                transformControlsRef.current.attach(result);
                transformControlsRef.current.visible = true;
                onSelectionChange && onSelectionChange(true, result);
                
                              }
            }
          } else {
                      }
          return; // Don't do regular selection in CSG mode
        }
        
        // Regular tool handling
        if (tool === 'target') {
          zoomToFit([object]);
          onToolSelect && onToolSelect(null);
        } else {
          if (selectedGeometryRef.current !== object) {
            deselect();
            selectedGeometryRef.current = object;
            object.material.color.set(0x00ff00);
            
            // Attach transform controls with debug logging
                        transformControlsRef.current.attach(object);
            transformControlsRef.current.visible = true;
            
            onSelectionChange && onSelectionChange(true, object);
          }
        }
      } else {
        if (!csgMode) {
          deselect();
        }
      }
    };
    canvasRef.current.addEventListener('pointerdown', onPointerDown);

    const keyState = {};
    const handleKeyDown = (event) => {
      keyState[event.code] = true;
      
      // Handle keyboard shortcuts
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            // Undo
            event.preventDefault();
            undo();
            return;
          case 'y':
            // Redo
            event.preventDefault();
            redo();
            return;
          case 'x':
            // Delete selected object
            if (selectedGeometryRef.current) {
              event.preventDefault();
              // Save history state BEFORE deleting
              saveToHistory();
              const mesh = selectedGeometryRef.current;
              const index = geometriesRef.current.indexOf(mesh);
              if (index > -1) {
                geometriesRef.current.splice(index, 1);
                sceneGroupRef.current.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                transformControlsRef.current.detach();
                selectedGeometryRef.current = null;
                
                // Remove associated solid angle line if it exists
                const associatedLineIndex = solidAngleLinesRef.current.findIndex(line => {
                  if (line && line.geometry) {
                    const positions = line.geometry.attributes.position.array;
                    const endPoint = new THREE.Vector3(positions[3], positions[4], positions[5]);
                    return endPoint.distanceTo(mesh.position) < 0.1; // Small tolerance
                  }
                  return false;
                });
                
                if (associatedLineIndex !== -1) {
                  const line = solidAngleLinesRef.current[associatedLineIndex];
                  if (sceneRef.current && line) {
                    sceneRef.current.remove(line);
                    if (line.geometry) line.geometry.dispose();
                    if (line.material) line.material.dispose();
                  }
                  solidAngleLinesRef.current.splice(associatedLineIndex, 1);
                }
                
                // Auto-save scene after deleting geometry
                saveSceneToLocalStorage();
                
                              }
            }
            break;
          case 'g':
            // Toggle Move mode
        event.preventDefault();
            const newTool = selectedToolRef.current === 'pan' ? 'select' : 'pan';
            onToolSelect && onToolSelect(newTool);
            break;
          case 'f':
            // Frame selected object
            if (selectedGeometryRef.current) {
              event.preventDefault();
              zoomToFit([selectedGeometryRef.current]);
            }
            break;
        }
      } else {
        // Non-Ctrl shortcuts
        switch (event.key) {
          case 'F1':
            event.preventDefault();
            // Toggle help (handled by parent)
            window.dispatchEvent(new CustomEvent('toggleHelp'));
            break;
          case 'Escape':
            if (selectedGeometryRef.current) {
              event.preventDefault();
              deselect();
            }
            break;
          case ' ':
            event.preventDefault();
            onToolSelect && onToolSelect('select');
            break;
          case 'h':
            if (event.shiftKey) {
              // Go to home
              event.preventDefault();
              onToolSelect && onToolSelect('home');
            } else {
              // Save home
              event.preventDefault();
              onToolSelect && onToolSelect('add-home');
            }
            break;
          case 'f':
            // Frame all objects
            event.preventDefault();
            zoomToFit(geometriesRef.current);
            break;
          case 'p':
            // Toggle perspective
        event.preventDefault();
            onToolSelect && onToolSelect('camera');
            break;
        }
      }

      // Handle Ctrl+Alt key combination for rotation in pan mode
      if (event.ctrlKey && event.altKey && selectedToolRef.current === 'pan' && transformControlsRef.current.object) {
        transformControlsRef.current.setMode('rotate');
            }
    };
    
    const handleKeyUp = (event) => {
      keyState[event.code] = false;
      
      // Reset movement flag when movement keys are released
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyE'].includes(event.code)) {
        if (selectedGeometryRef.current) {
          selectedGeometryRef.current.userData.movementStarted = false;
        }
      }
      
      // Switch back to translate when either Ctrl or Alt is released
      if ((event.key === 'Control' || event.key === 'Alt') && selectedToolRef.current === 'pan' && transformControlsRef.current.object) {
        transformControlsRef.current.setMode('translate');
            }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      if (pCameraRef.current) {
        pCameraRef.current.aspect = w / h;
        pCameraRef.current.updateProjectionMatrix();
      }
      if (oCameraRef.current) {
        const halfHeight = (oCameraRef.current.top - oCameraRef.current.bottom) / 2;
        const halfWidth = halfHeight * (w / h);
        oCameraRef.current.left = -halfWidth;
        oCameraRef.current.right = halfWidth;
        oCameraRef.current.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      orbitControlsRef.current.update();

      if (cameraAnimation.current) {
        const anim = cameraAnimation.current;
        anim.alpha += 0.06;
        const t = Math.min(anim.alpha, 1);
        activeCameraRef.current.position.lerpVectors(anim.startPosition, anim.endPosition, t);
        orbitControlsRef.current.target.lerpVectors(anim.startTarget, anim.endTarget, t);
        activeCameraRef.current.lookAt(orbitControlsRef.current.target);
        if (t >= 1) cameraAnimation.current = null;
      }
      
      const targetMesh = selectedGeometryRef.current;
      if (targetMesh && !transformControlsRef.current.dragging) {
        let moved = false;
        
        // Save history before first movement in this session
        if (!targetMesh.userData.movementStarted && (
          keyState['ArrowUp'] || keyState['ArrowDown'] || keyState['ArrowLeft'] || 
          keyState['ArrowRight'] || keyState['KeyQ'] || keyState['KeyE']
        )) {
          saveToHistory();
          targetMesh.userData.movementStarted = true;
        }
        
        if (keyState['ArrowUp']) { targetMesh.position.z -= 0.1; moved = true; }
        if (keyState['ArrowDown']) { targetMesh.position.z += 0.1; moved = true; }
        if (keyState['ArrowLeft']) { targetMesh.position.x -= 0.1; moved = true; }
        if (keyState['ArrowRight']) { targetMesh.position.x += 0.1; moved = true; }
        if (keyState['KeyQ']) { targetMesh.position.y += 0.1; moved = true; }
        if (keyState['KeyE']) { targetMesh.position.y -= 0.1; moved = true; }
        
        if (moved) {
          checkCollisions();
          // Debounced auto-save for keyboard movement
          if (!targetMesh.userData.saveTimeout) {
            targetMesh.userData.saveTimeout = setTimeout(() => {
              saveSceneToLocalStorage();
              targetMesh.userData.saveTimeout = null;
            }, 1000); // Save after 1 second of no movement
          } else {
            clearTimeout(targetMesh.userData.saveTimeout);
            targetMesh.userData.saveTimeout = setTimeout(() => {
              saveSceneToLocalStorage();
              targetMesh.userData.saveTimeout = null;
            }, 1000);
          }
        }
      }
      
      collisionCheckCounter.current++;
      if (collisionCheckCounter.current % 3 === 0) {
        checkCollisions();
      }

      renderer.render(scene, activeCameraRef.current);
    };
    animate();

    // Load and restore saved scene after everything is initialized
    setTimeout(() => {
      const savedScene = loadSceneFromLocalStorage();
      if (savedScene) {
        restoreSceneState(savedScene);
        
        // Apply zoom after setZoomLevel is available
        if (savedScene.camera && savedScene.camera.zoom) {
          setTimeout(() => {
            if (window.setZoomLevel) {
              window.setZoomLevel(savedScene.camera.zoom);
            }
          }, 200);
        }
        
              }
    }, 100);

    // Set up auto-save interval (every 30 seconds)
    autoSaveIntervalRef.current = setInterval(() => {
      if (geometriesRef.current.length > 0) {
        saveSceneToLocalStorage();
      }
    }, 30000);

    // Save scene before page unload
    const handleBeforeUnload = () => {
      saveSceneToLocalStorage();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clear auto-save interval
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      
      // Remove event listeners
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (canvasRef.current) canvasRef.current.removeEventListener('pointerdown', onPointerDown);
      if (transformControlsRef.current) transformControlsRef.current.dispose();
      if (orbitControlsRef.current) orbitControlsRef.current.dispose && orbitControlsRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
      geometriesRef.current.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });
      
      // Clean up view features
      if (cutPlaneRef.current) {
        if (cutPlaneRef.current.geometry) cutPlaneRef.current.geometry.dispose();
        if (cutPlaneRef.current.material) cutPlaneRef.current.material.dispose();
      }
      
      solidAngleLinesRef.current.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      });
    };
  }, [zoomToFit]);

      // Tool selection logic
  useEffect(() => {
    const transformControls = transformControlsRef.current;
    if (!transformControls) return;

    if (selectedTool === 'select' || selectedTool === 'pan') {
      transformControls.enabled = true;
      transformControls.visible = true;
      
      // Set initial mode based on tool
      if (selectedTool === 'pan') {
        transformControls.setMode('translate'); // Start with translate, Ctrl switches to rotate
      } else {
        transformControls.setMode('translate'); // Select tool uses translate
      }
      
          } else {
      transformControls.enabled = false;
      // Don't hide the gizmo, just disable interaction
    }

    switch (selectedTool) {
      case 'add-home':
        homeViewState.current = {
          position: activeCameraRef.current.position.clone(),
          target: orbitControlsRef.current.target.clone(),
          perspective: isPerspective,
        };
                // Reset tool selection after action
        setTimeout(() => onToolSelect && onToolSelect('select'), 0);
        break;
      case 'home':
        if (homeViewState.current) {
          if (typeof homeViewState.current.perspective === 'boolean' && homeViewState.current.perspective !== isPerspective) {
            setIsPerspective(homeViewState.current.perspective);
          }
          animateCameraTo(homeViewState.current.position, homeViewState.current.target);
        } else {
                  }
        // Reset tool selection after action
        setTimeout(() => onToolSelect && onToolSelect('select'), 0);
        break;
      case 'view':
        zoomToFit(geometriesRef.current);
        // Reset tool selection after action
        setTimeout(() => onToolSelect && onToolSelect('select'), 0);
        break;
      case 'camera':
        const newMode = !isPerspective;
                setIsPerspective(newMode);
        // Reset tool selection after action
        setTimeout(() => onToolSelect && onToolSelect('select'), 0);
        break;
        
      // CSG Operations
      case 'csg-union':
      case 'csg-subtract':
      case 'csg-intersect':
      case 'csg-split':
        const operation = selectedTool.replace('csg-', '');
        csgOperation.current = operation;
        setCsgMode(true);
        csgSelectedObjects.current = [];
        
        // Clear any existing selections
        if (selectedGeometryRef.current) {
          selectedGeometryRef.current.material.color.setHex(selectedGeometryRef.current.userData.originalColor);
          selectedGeometryRef.current = null;
          transformControlsRef.current.detach();
          transformControlsRef.current.visible = false;
          onSelectionChange && onSelectionChange(false, null);
        }
        
        const operationNames = {
          'union': 'UNION (A + B) - Combine two volumes',
          'subtract': 'SUBTRACT (A - B) - Remove second volume from first',
          'intersect': 'INTERSECT (A ∩ B) - Keep only overlapping parts',
          'split': 'SPLIT - Divide volume with cutting plane'
        };
        
                        break;
    }
  }, [selectedTool, animateCameraTo, zoomToFit, isPerspective, onToolSelect]);

  useEffect(() => {
        activeCameraRef.current = isPerspective ? pCameraRef.current : oCameraRef.current;
        
    if (orbitControlsRef.current) {
      orbitControlsRef.current.object = activeCameraRef.current;
          }
    if (transformControlsRef.current) {
      transformControlsRef.current.camera = activeCameraRef.current;
            // Force update the gizmo after camera change
      if (selectedGeometryRef.current) {
        transformControlsRef.current.attach(selectedGeometryRef.current);
      }
    }
  }, [isPerspective]);

  // Expose createGeometry function to parent via callback
  useEffect(() => {
    if (onGeometryCreate) {
      onGeometryCreate(createGeometry);
    }
  }, [onGeometryCreate, createGeometry]);

  // Drag and drop handlers for the canvas
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    // Add visual feedback to canvas during drag
    if (canvasRef.current) {
      canvasRef.current.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5)';
      canvasRef.current.style.filter = 'brightness(1.1)';
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Remove visual feedback when drag leaves canvas
    if (canvasRef.current) {
      canvasRef.current.style.boxShadow = 'none';
      canvasRef.current.style.filter = 'none';
    }
  }, []);

  // Create geometry at specific position
  const createGeometryAtPosition = useCallback((geometryType, position) => {
    if (!sceneRef.current) return null;
    
    // Save history state BEFORE creating new geometry
    saveToHistory();
    
    let geometry, material, mesh;
    const scene = sceneRef.current;
    
    // Create geometry based on type
    switch (geometryType) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        break;
      default:
        console.warn(`Unknown geometry type: ${geometryType}`);
        return null;
    }

    // Create material based on current material mode
    switch (materialMode) {
      case 'wireframe':
        material = new THREE.MeshBasicMaterial({ 
          color: 0x00ff00, 
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
        break;
      case 'transparent':
        material = new THREE.MeshStandardMaterial({ 
          color: 0x00ff00, 
          transparent: true, 
          opacity: 0.5,
          roughness: 0.3,
          metalness: 0.1
        });
        break;
      case 'points':
        material = new THREE.PointsMaterial({ 
          color: 0x00ff00, 
          size: 0.05 
        });
        mesh = new THREE.Points(geometry, material);
        break;
      default: // solid
        material = new THREE.MeshStandardMaterial({ 
          color: 0x00ff00,
          roughness: 0.3,
          metalness: 0.1
        });
        break;
    }

    if (!mesh) {
      mesh = new THREE.Mesh(geometry, material);
    }
    
    // Set position to drop location
    mesh.position.copy(position);
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      id: Date.now(),
      type: geometryType,
      originalColor: material.color.getHex(),
      volumeName: `${geometryType.charAt(0).toUpperCase() + geometryType.slice(1)}_${Date.now()}`
    };

    // Add to scene group instead of scene directly for rotation support
    sceneGroupRef.current.add(mesh);
    geometriesRef.current.push(mesh);

    // Add solid angle line if enabled
    if (showSolidAngleLines) {
      const line = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), // Scene center
        mesh.position.clone()
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
      const solidAngleLine = new THREE.Line(line, lineMaterial);
      sceneRef.current.add(solidAngleLine);
      solidAngleLinesRef.current.push(solidAngleLine);
    }
    
    // Auto-save scene after creating geometry
    saveSceneToLocalStorage();

    
    return mesh;
  }, [materialMode, showSolidAngleLines, saveSceneToLocalStorage, saveToHistory]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    
    // Remove visual feedback
    if (canvasRef.current) {
      canvasRef.current.style.boxShadow = 'none';
      canvasRef.current.style.filter = 'none';
    }
    
    const geometryType = e.dataTransfer.getData('text/plain');
    
    if (geometryType && canvasRef.current) {
            
      // Calculate 3D position from drop coordinates
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Use raycaster to find drop position in 3D space
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, activeCameraRef.current);
      
      // Try to intersect with existing objects first
      const intersects = raycaster.intersectObjects([...geometriesRef.current]);
      let dropPosition;
      
      if (intersects.length > 0) {
        // Drop on top of existing object
        dropPosition = intersects[0].point.clone();
        dropPosition.y += 1; // Place slightly above the intersected object
      } else {
        // Drop on ground plane or in empty space
        const groundIntersect = raycaster.intersectObjects(sceneRef.current.children.filter(child => 
          child.geometry && child.geometry.type === 'PlaneGeometry'
        ));
        
        if (groundIntersect.length > 0) {
          dropPosition = groundIntersect[0].point.clone();
          dropPosition.y += 0.5; // Place above ground
        } else {
          // Drop in empty space - use a default distance from camera
          const direction = raycaster.ray.direction.clone();
          dropPosition = activeCameraRef.current.position.clone().add(direction.multiplyScalar(5));
        }
      }
      
      // Create geometry at drop position
      const mesh = createGeometryAtPosition(geometryType, dropPosition);
      
      // Select the newly created geometry
      if (mesh) {
        if (selectedGeometryRef.current) {
          selectedGeometryRef.current.material.color.setHex(selectedGeometryRef.current.userData.originalColor);
        }
        selectedGeometryRef.current = mesh;
        mesh.material.color.set(0x00ff00);
        transformControlsRef.current.attach(mesh);
        transformControlsRef.current.visible = true;
        onSelectionChange && onSelectionChange(true, mesh);
        
              }
    }
  }, [createGeometryAtPosition, onSelectionChange]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'block', width: '100%', height: '100%', outline: 'none' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );
}
