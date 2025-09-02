import * as THREE from 'three';

export default class PersistenceManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    
    this.autoSaveInterval = null;
  }
  
  saveSceneToLocalStorage() {
    try {
      const sceneData = {
        geometries: this.refs.geometriesRef.current.map(mesh => ({
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
        camera: this.getCameraData(),
        sceneSettings: {
          viewMode: this.state.viewMode,
          materialMode: this.state.materialMode,
          currentAxis: this.state.currentAxis,
          sceneRotation: this.refs.sceneGroupRef.current ? {
            x: this.refs.sceneGroupRef.current.rotation.x,
            y: this.refs.sceneGroupRef.current.rotation.y,
            z: this.refs.sceneGroupRef.current.rotation.z
          } : { x: 0, y: 0, z: 0 }
        },
        homeView: this.getHomeViewData(),
        timestamp: Date.now()
      };
      
      localStorage.setItem('mercurad_scene', JSON.stringify(sceneData));
    } catch (error) {
      console.error('Failed to save scene:', error);
    }
  }
  
  getCameraData() {
    // This would need access to cameraController
    // For now, return basic camera data
    return {
      position: { x: 5, y: 5, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      isPerspective: this.state.isPerspective,
      zoom: 100
    };
  }
  
  getHomeViewData() {
    // This would need access to cameraController
    // For now, return null
    return null;
  }
  
  loadSceneFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) return null;
      
      const sceneData = JSON.parse(savedData);
      return sceneData;
    } catch (error) {
      console.error('Failed to load scene:', error);
      return null;
    }
  }
  
  restoreGeometries(savedGeometries) {
    if (!savedGeometries || !this.refs.sceneGroupRef.current) return;
    
    // Clear existing geometries
    this.refs.geometriesRef.current.forEach(mesh => {
      this.refs.sceneGroupRef.current.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    this.refs.geometriesRef.current.length = 0;
    
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
      this.applyMaterialMode(mesh, this.state.materialMode);
      this.applyViewMode(mesh, this.state.viewMode);
      
      this.refs.sceneGroupRef.current.add(mesh);
      this.refs.geometriesRef.current.push(mesh);
    });
  }
  
  applyMaterialMode(mesh, materialMode) {
    switch (materialMode) {
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
  
  applyViewMode(mesh, viewMode) {
    switch (viewMode) {
      case 'wireframe':
        mesh.material.wireframe = true;
        break;
      case 'points':
        mesh.material.transparent = true;
        mesh.material.opacity = 0.3;
        break;
    }
    mesh.material.needsUpdate = true;
  }
  
  restoreSceneState(sceneData) {
    if (!sceneData) return;
    
    // Restore geometries
    if (sceneData.geometries) {
      this.restoreGeometries(sceneData.geometries);
    }
    
    // Restore scene settings
    if (sceneData.sceneSettings) {
      if (sceneData.sceneSettings.viewMode) {
        this.state.setViewMode(sceneData.sceneSettings.viewMode);
      }
      
      if (sceneData.sceneSettings.materialMode) {
        this.state.setMaterialMode(sceneData.sceneSettings.materialMode);
      }
      
      if (sceneData.sceneSettings.currentAxis) {
        this.state.setCurrentAxis(sceneData.sceneSettings.currentAxis);
      }
      
      if (sceneData.sceneSettings.sceneRotation && this.refs.sceneGroupRef.current) {
        this.refs.sceneGroupRef.current.rotation.set(
          sceneData.sceneSettings.sceneRotation.x,
          sceneData.sceneSettings.sceneRotation.y,
          sceneData.sceneSettings.sceneRotation.z
        );
      }
    }
  }
  
  loadScene() {
    const savedScene = this.loadSceneFromLocalStorage();
    if (savedScene) {
      this.restoreSceneState(savedScene);
    }
  }
  
  saveScene() {
    this.saveSceneToLocalStorage();
  }
  
  clearScene() {
    try {
      localStorage.removeItem('mercurad_scene');
    } catch (error) {
      console.error('Failed to clear saved scene:', error);
    }
  }
  
  setupAutoSave() {
    // Set up auto-save interval (every 30 seconds)
    this.autoSaveInterval = setInterval(() => {
      if (this.refs.geometriesRef.current.length > 0) {
        this.saveSceneToLocalStorage();
      }
    }, 30000);

    // Save scene before page unload
    this.handleBeforeUnload = () => {
      this.saveSceneToLocalStorage();
    };
    
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }
  
  cleanup() {
    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    // Remove event listeners
    if (this.handleBeforeUnload) {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }
}
