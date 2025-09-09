import * as THREE from 'three';

export default class PersistenceManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    
    this.autoSaveInterval = null;
    this.sceneCleared = false; // Flag to track if scene was explicitly cleared
  }
  
  setModules(modules) {
    this.modules = modules;
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
          originalColor: mesh.userData.originalColor,
          volumeName: mesh.userData.volumeName || `Volume_${mesh.userData.id}`,
          // Include geometry parameters for proper restoration
          geometry: {
            type: mesh.userData.type,
            parameters: mesh.userData.geometryParameters || {}
          },
          // Include volume data structure for proper restoration
          volume: {
            type: mesh.userData.volumeType || 'Unknown',
            composition: mesh.userData.composition || null,
            realDensity: mesh.userData.realDensity || 0,
            tolerance: mesh.userData.tolerance || 0,
            isSource: mesh.userData.isSource || false,
            calculation: mesh.userData.calculation || null,
            gammaSelectionMode: mesh.userData.gammaSelectionMode || null,
            spectrum: mesh.userData.spectrum || null
          },
          // Include additional userData for persistence
          userData: mesh.userData,
          visible: mesh.userData.visible !== false
        })),
        // Include compositions, sensors, sources, and spectra
        compositions: this.state.compositions || [],
        sensors: this.state.sensors || [],
        sources: this.state.sources || [],
        spectra: this.state.spectra || [],
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
      
      // Only remove the cleared flag when there are actually objects to save
      // This prevents auto-save from overriding the cleared state when scene is empty
      if (sceneData.geometries && sceneData.geometries.length > 0) {
        localStorage.removeItem('mercurad_scene_cleared');
      }
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
    
    // Clear existing geometries and their indicators
    this.refs.geometriesRef.current.forEach(mesh => {
      // Remove object indicators first
      if (this.modules?.geometryManager && mesh.userData?.indicators) {
        this.modules.geometryManager.removeObjectIndicators(mesh);
      }
      
      this.refs.sceneGroupRef.current.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    this.refs.geometriesRef.current.length = 0;
    
    // Additional cleanup: Remove any orphaned indicators from the scene
    // This handles cases where indicators might not be properly cleaned up
    const sceneChildren = this.refs.sceneGroupRef.current.children.slice();
    sceneChildren.forEach(child => {
      if (child.userData?.isIndicator) {
        this.refs.sceneGroupRef.current.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    });
    
    // Restore saved geometries using the same method as createGeometryFromData
    savedGeometries.forEach(geometryData => {
      // Use the existing createGeometryFromData method for proper restoration
      if (this.modules?.geometryManager) {
        const objData = {
          type: geometryData.type,
          geometry: geometryData.geometry || { type: geometryData.type, parameters: {} },
          position: geometryData.position,
          rotation: geometryData.rotation,
          scale: geometryData.scale,
          userData: geometryData.userData,
          volume: geometryData.volume,
          visible: geometryData.visible !== false,
          name: geometryData.volumeName
        };
        
        const mesh = this.modules.geometryManager.createGeometryFromData(objData);
        if (mesh) {
          this.refs.sceneGroupRef.current.add(mesh);
          this.refs.geometriesRef.current.push(mesh);
        }
      } else {
        // Fallback to basic restoration if geometryManager is not available
        this.restoreGeometryBasic(geometryData);
      }
    });
  }
  
  restoreGeometryBasic(geometryData) {
    let geometry, material;
    
    // Use saved geometry parameters if available, otherwise use defaults
    const params = geometryData.geometry?.parameters || {};
    
    switch (geometryData.type) {
      case 'cube':
      case 'box':
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
        return;
    }
    
    // Create material with proper color and properties
    material = new THREE.MeshStandardMaterial({ 
      color: geometryData.originalColor || 0x404040 
    });
    
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
      originalColor: geometryData.originalColor,
      volumeName: geometryData.volumeName || `Volume_${geometryData.id}`,
      geometryParameters: geometryData.geometry?.parameters || {},
      volumeType: geometryData.volume?.type || 'Unknown',
      composition: geometryData.volume?.composition || null,
      realDensity: geometryData.volume?.realDensity || 0,
      tolerance: geometryData.volume?.tolerance || 0,
      isSource: geometryData.volume?.isSource || false,
      calculation: geometryData.volume?.calculation || null,
      gammaSelectionMode: geometryData.volume?.gammaSelectionMode || null,
      spectrum: geometryData.volume?.spectrum || null,
      visible: geometryData.visible !== false,
      ...geometryData.userData
    };
    
    // Apply current material and view modes
    this.applyMaterialMode(mesh, this.state.materialMode);
    this.applyViewMode(mesh, this.state.viewMode);
    
    this.refs.sceneGroupRef.current.add(mesh);
    this.refs.geometriesRef.current.push(mesh);
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
    
    // Restore compositions, sensors, sources, and spectra
    if (sceneData.compositions && this.state.setCompositions) {
      this.state.setCompositions(sceneData.compositions);
    }
    
    if (sceneData.sensors && this.state.setSensors) {
      this.state.setSensors(sceneData.sensors);
    }
    
    if (sceneData.sources && this.state.setSources) {
      this.state.setSources(sceneData.sources);
    }
    
    if (sceneData.spectra && this.state.setSpectra) {
      this.state.setSpectra(sceneData.spectra);
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
    // Check if scene was explicitly cleared in a previous session
    const sceneCleared = localStorage.getItem('mercurad_scene_cleared') === 'true';
    
    // Don't restore if scene was explicitly cleared
    if (this.sceneCleared || sceneCleared) {
      // Remove the cleared flag since we've acknowledged it
      localStorage.removeItem('mercurad_scene_cleared');
      return;
    }
    
    const savedScene = this.loadSceneFromLocalStorage();
    if (savedScene) {
      this.restoreSceneState(savedScene);
    } else {
    }
  }
  
  saveScene() {
    this.saveSceneToLocalStorage();
  }
  
  clearScene() {
    try {
      localStorage.removeItem('mercurad_scene');
      // Set a flag in localStorage to prevent restoration on next load
      localStorage.setItem('mercurad_scene_cleared', 'true');
      this.sceneCleared = true; // Mark that scene was explicitly cleared
    } catch (error) {
      console.error('Failed to clear saved scene:', error);
    }
  }
  
  removeGeometryFromLocalStorage(geometryId) {
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) {
        return;
      }
      
      const sceneData = JSON.parse(savedData);
      if (sceneData.geometries) {
        // Remove the geometry with the specified ID
        const originalLength = sceneData.geometries.length;
        sceneData.geometries = sceneData.geometries.filter(geom => geom.id !== geometryId);
        
        
        // Only save if something was actually removed
        if (sceneData.geometries.length < originalLength) {
          sceneData.timestamp = Date.now();
          localStorage.setItem('mercurad_scene', JSON.stringify(sceneData));
          
          // If no geometries left, mark scene as cleared
          if (sceneData.geometries.length === 0) {
            localStorage.setItem('mercurad_scene_cleared', 'true');
          }
        }
      }
    } catch (error) {
      console.error('Failed to remove geometry from localStorage:', error);
    }
  }
  
  updateGeometryInLocalStorage(geometryId, updatedData) {
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) return;
      
      const sceneData = JSON.parse(savedData);
      if (sceneData.geometries) {
        const geometryIndex = sceneData.geometries.findIndex(geom => geom.id === geometryId);
        if (geometryIndex > -1) {
          // Update the geometry data
          sceneData.geometries[geometryIndex] = {
            ...sceneData.geometries[geometryIndex],
            ...updatedData,
            timestamp: Date.now()
          };
          
          sceneData.timestamp = Date.now();
          localStorage.setItem('mercurad_scene', JSON.stringify(sceneData));
        }
      }
    } catch (error) {
      console.error('Failed to update geometry in localStorage:', error);
    }
  }
  
  removeCompositionFromLocalStorage(compositionId) {
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) return;
      
      const sceneData = JSON.parse(savedData);
      if (sceneData.compositions) {
        const originalLength = sceneData.compositions.length;
        sceneData.compositions = sceneData.compositions.filter(comp => comp.id !== compositionId);
        
        if (sceneData.compositions.length < originalLength) {
          sceneData.timestamp = Date.now();
          localStorage.setItem('mercurad_scene', JSON.stringify(sceneData));
        }
      }
    } catch (error) {
      console.error('Failed to remove composition from localStorage:', error);
    }
  }
  
  removeSourceFromLocalStorage(sourceId) {
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) return;
      
      const sceneData = JSON.parse(savedData);
      if (sceneData.sources) {
        const originalLength = sceneData.sources.length;
        sceneData.sources = sceneData.sources.filter(source => source.id !== sourceId);
        
        if (sceneData.sources.length < originalLength) {
          sceneData.timestamp = Date.now();
          localStorage.setItem('mercurad_scene', JSON.stringify(sceneData));
        }
      }
    } catch (error) {
      console.error('Failed to remove source from localStorage:', error);
    }
  }
  
  removeSensorFromLocalStorage(sensorId) {
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) return;
      
      const sceneData = JSON.parse(savedData);
      if (sceneData.sensors) {
        const originalLength = sceneData.sensors.length;
        sceneData.sensors = sceneData.sensors.filter(sensor => sensor.id !== sensorId);
        
        if (sceneData.sensors.length < originalLength) {
          sceneData.timestamp = Date.now();
          localStorage.setItem('mercurad_scene', JSON.stringify(sceneData));
        }
      }
    } catch (error) {
      console.error('Failed to remove sensor from localStorage:', error);
    }
  }
  
  removeSpectrumFromLocalStorage(spectrumId) {
    try {
      const savedData = localStorage.getItem('mercurad_scene');
      if (!savedData) return;
      
      const sceneData = JSON.parse(savedData);
      if (sceneData.spectra) {
        const originalLength = sceneData.spectra.length;
        sceneData.spectra = sceneData.spectra.filter(spectrum => spectrum.id !== spectrumId);
        
        if (sceneData.spectra.length < originalLength) {
          sceneData.timestamp = Date.now();
          localStorage.setItem('mercurad_scene', JSON.stringify(sceneData));
        }
      }
    } catch (error) {
      console.error('Failed to remove spectrum from localStorage:', error);
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
