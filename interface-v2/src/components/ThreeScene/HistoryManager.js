import * as THREE from 'three';

export default class HistoryManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    
    // Undo/Redo History System
    this.historyStack = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50; // Limit history to prevent memory issues
    this.isRestoringHistory = false; // Flag to prevent history recording during undo/redo
  }
  
  saveToHistory() {
    if (this.isRestoringHistory) return; // Don't save history during undo/redo
    
      // Create a snapshot of the current scene state
      const snapshot = {
        timestamp: Date.now(),
        geometries: this.refs.geometriesRef.current.map(mesh => ({
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
          // Save geometry parameters for proper restoration
          geometryParameters: this.getGeometryParameters(mesh),
          userData: { ...mesh.userData }
        })),
      camera: this.getCameraSnapshot(),
      sceneRotation: this.getSceneRotationSnapshot(),
      viewSettings: this.getViewSettingsSnapshot()
    };

    // Remove future history if we're not at the end
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    }

    // Add new snapshot
    this.historyStack.push(snapshot);
    this.historyIndex = this.historyStack.length - 1;

    // Limit history size
    if (this.historyStack.length > this.maxHistorySize) {
      this.historyStack.shift();
      this.historyIndex--;
    }
  }
  
  getCameraSnapshot() {
    // This would need access to cameraController
    // For now, return a basic snapshot
    return {
      position: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 100
    };
  }
  
  getSceneRotationSnapshot() {
    return {
      x: this.refs.sceneGroupRef.current?.rotation.x || 0,
      y: this.refs.sceneGroupRef.current?.rotation.y || 0,
      z: this.refs.sceneGroupRef.current?.rotation.z || 0
    };
  }
  
  getViewSettingsSnapshot() {
    return {
      showMesh: this.state.showMesh,
      showCutPlane: this.state.showCutPlane,
      showSolidAngleLines: this.state.showSolidAngleLines,
      materialMode: this.state.materialMode,
      viewMode: this.state.viewMode
    };
  }
  
  getGeometryParameters(mesh) {
    // Extract geometry parameters based on the geometry type
    const geometry = mesh.geometry;
    const userData = mesh.userData;
    
    // Check if we have custom parameters in userData first
    if (userData.parameters) {
      return userData.parameters;
    }
    
    // Extract parameters from the actual geometry
    switch (mesh.userData.type) {
      case 'cube':
        if (geometry.parameters) {
          return {
            width: geometry.parameters.width,
            height: geometry.parameters.height,
            depth: geometry.parameters.depth
          };
        }
        break;
      case 'sphere':
        if (geometry.parameters) {
          return {
            radius: geometry.parameters.radius,
            widthSegments: geometry.parameters.widthSegments,
            heightSegments: geometry.parameters.heightSegments
          };
        }
        break;
      case 'cylinder':
        if (geometry.parameters) {
          return {
            radiusTop: geometry.parameters.radiusTop,
            radiusBottom: geometry.parameters.radiusBottom,
            height: geometry.parameters.height,
            radialSegments: geometry.parameters.radialSegments
          };
        }
        break;
      case 'cone':
        if (geometry.parameters) {
          return {
            radius: geometry.parameters.radius,
            height: geometry.parameters.height,
            radialSegments: geometry.parameters.radialSegments
          };
        }
        break;
    }
    
    // Fallback to default parameters if we can't extract them
    return this.getDefaultGeometryParameters(mesh.userData.type);
  }
  
  getDefaultGeometryParameters(type) {
    switch (type) {
      case 'cube':
        return { width: 1, height: 1, depth: 1 };
      case 'sphere':
        return { radius: 0.5, widthSegments: 32, heightSegments: 32 };
      case 'cylinder':
        return { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 };
      case 'cone':
        return { radius: 0.5, height: 1, radialSegments: 32 };
      default:
        return {};
    }
  }
  
  restoreFromHistory(snapshot) {
    if (!snapshot) return;
    
    this.isRestoringHistory = true;
    
    try {
      // Clear current geometries
      this.refs.geometriesRef.current.forEach(mesh => {
        this.refs.sceneGroupRef.current?.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });
      this.refs.geometriesRef.current = [];

      // Deselect current object and detach transform controls
      if (this.refs.selectedGeometryRef.current) {
        // Detach transform controls if they exist
        if (this.callbacks.detachTransformControls) {
          this.callbacks.detachTransformControls();
        }
        this.refs.selectedGeometryRef.current = null;
        this.callbacks.onSelectionChange && this.callbacks.onSelectionChange(false, null);
      }

      // Restore geometries
      snapshot.geometries.forEach(geomData => {
        let geometry;
        
        // Use saved geometry parameters or fallback to defaults
        const params = geomData.geometryParameters || this.getDefaultGeometryParameters(geomData.type);
        
        // Create geometry based on type with saved parameters
        switch (geomData.type) {
          case 'cube':
            geometry = new THREE.BoxGeometry(
              params.width || 1, 
              params.height || 1, 
              params.depth || 1
            );
            break;
          case 'sphere':
            geometry = new THREE.SphereGeometry(
              params.radius || 0.5, 
              params.widthSegments || 32, 
              params.heightSegments || 32
            );
            break;
          case 'cylinder':
            geometry = new THREE.CylinderGeometry(
              params.radiusTop || 0.5, 
              params.radiusBottom || 0.5, 
              params.height || 1, 
              params.radialSegments || 32
            );
            break;
          case 'cone':
            geometry = new THREE.ConeGeometry(
              params.radius || 0.5, 
              params.height || 1, 
              params.radialSegments || 32
            );
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
        
        // Restore userData and ensure originalColor is preserved
        mesh.userData = { ...geomData.userData };
        if (!mesh.userData.originalColor) {
          mesh.userData.originalColor = geomData.material.color;
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.refs.sceneGroupRef.current?.add(mesh);
        this.refs.geometriesRef.current.push(mesh);
      });

      // Restore scene rotation
      if (this.refs.sceneGroupRef.current && snapshot.sceneRotation) {
        this.refs.sceneGroupRef.current.rotation.set(
          snapshot.sceneRotation.x,
          snapshot.sceneRotation.y,
          snapshot.sceneRotation.z
        );
      }

      // Restore view settings
      this.state.setShowMesh(snapshot.viewSettings.showMesh);
      this.state.setShowCutPlane(snapshot.viewSettings.showCutPlane);
      this.state.setShowSolidAngleLines(snapshot.viewSettings.showSolidAngleLines);
      this.state.setMaterialMode(snapshot.viewSettings.materialMode);
      this.state.setViewMode(snapshot.viewSettings.viewMode);

      // Update material mode for all meshes
      this.refs.geometriesRef.current.forEach(mesh => {
        this.updateMeshMaterial(mesh, snapshot.viewSettings.materialMode);
      });

      // Update mesh visibility
      this.refs.geometriesRef.current.forEach(mesh => {
        mesh.visible = snapshot.viewSettings.showMesh;
      });

    } catch (error) {
      console.error('Error restoring from history:', error);
    } finally {
      this.isRestoringHistory = false;
    }
  }
  
  updateMeshMaterial(mesh, materialMode) {
    if (!mesh.material) return;
    
    // Reset to original state first
    mesh.material.wireframe = false;
    mesh.material.transparent = false;
    mesh.material.opacity = 1.0;
    mesh.material.side = THREE.FrontSide;
    
    switch (materialMode) {
      case 'solid':
        // Default solid material - already reset above
        break;
      case 'wireframe':
        mesh.material.wireframe = true;
        break;
      case 'transparent':
        mesh.material.transparent = true;
        mesh.material.opacity = 0.6;
        mesh.material.side = THREE.DoubleSide;
        break;
      case 'points':
        mesh.material.transparent = true;
        mesh.material.opacity = 0.8;
        break;
    }
    mesh.material.needsUpdate = true;
  }
  
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const snapshot = this.historyStack[this.historyIndex];
      this.restoreFromHistory(snapshot);
      
      // Visual feedback
      if (this.refs.rendererRef.current) {
        const originalClearColor = this.refs.rendererRef.current.getClearColor();
        this.refs.rendererRef.current.setClearColor(0x004400); // Brief green flash
        setTimeout(() => {
          this.refs.rendererRef.current.setClearColor(originalClearColor);
        }, 150);
      }
    }
  }
  
  redo() {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      const snapshot = this.historyStack[this.historyIndex];
      this.restoreFromHistory(snapshot);
      
      // Visual feedback
      if (this.refs.rendererRef.current) {
        const originalClearColor = this.refs.rendererRef.current.getClearColor().getHex();
        this.refs.rendererRef.current.setClearColor(0x440044); // Brief purple flash
        setTimeout(() => {
          this.refs.rendererRef.current.setClearColor(originalClearColor);
        }, 150);
      }
    }
  }
  
  canUndo() {
    return this.historyIndex > 0;
  }
  
  canRedo() {
    return this.historyIndex < this.historyStack.length - 1;
  }
  
  clearHistory() {
    this.historyStack = [];
    this.historyIndex = -1;
  }
  
  initializeHistory() {
    // Initialize history with empty scene state
    setTimeout(() => {
      // Create initial empty state snapshot
      const emptySnapshot = {
        timestamp: Date.now(),
        geometries: [],
        camera: this.getCameraSnapshot(),
        sceneRotation: this.getSceneRotationSnapshot(),
        viewSettings: this.getViewSettingsSnapshot()
      };
      
      // Add empty state to history
      this.historyStack = [emptySnapshot];
      this.historyIndex = 0;
    }, 500); // Wait for scene to fully initialize
  }
  
  cleanup() {
    this.clearHistory();
  }
}
