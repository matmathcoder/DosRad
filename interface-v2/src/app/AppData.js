/**
 * App Data Utilities
 * Contains data processing functions and example data
 */

/**
 * Create compound volumes based on example data
 */
export function createCompoundVolumes(exampleData) {
  const volumes = [];
  // Use a timestamp-based ID to ensure uniqueness across multiple loads
  const baseId = Date.now();
  let volumeId = 0;
  
  switch (exampleData.id) {
    case 'contaminated-tube':
      // TUBTUTOT.PCS - Contaminated Steel Tube with UO2 Layer
      volumes.push(
        {
          type: 'cylinder',
          parameters: { radiusTop: 0.1, radiusBottom: 0.1, height: 0.5 },
          position: { x: 0, y: 1.25, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Outer Steel Tube',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'Outer Steel Tube',
            isSource: false,
            composition: { name: 'Stainless Steel', density: 7.85, color: '#A9A9A9' },
            importedFrom: exampleData.name,
            isExample: true
          }
        },
        {
          type: 'cylinder',
          parameters: { radiusTop: 0.095, radiusBottom: 0.095, height: 0.5 },
          position: { x: 0, y: 1.25, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'UO2 Source Layer',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'UO2 Source Layer',
            isSource: true,
            composition: { name: 'Uranium Oxide', density: 10.97, color: '#FFD700' },
            importedFrom: exampleData.name,
            isExample: true
          }
        },
        {
          type: 'cylinder',
          parameters: { radiusTop: 0.09, radiusBottom: 0.09, height: 0.5 },
          position: { x: 0, y: 1.25, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Air Space',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'Air Space',
            isSource: false,
            composition: { name: 'Air', density: 0.001225, color: '#87CEEB' },
            importedFrom: exampleData.name,
            isExample: true
          }
        }
      );
      break;
      
    case 'reactor-vessel':
      // REACTOR_VESSEL.PCS - Nuclear Reactor Pressure Vessel
      volumes.push(
        {
          type: 'cylinder',
          parameters: { radiusTop: 2.25, radiusBottom: 2.25, height: 12 },
          position: { x: 0, y: 6, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Steel Shell',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'Steel Shell',
            isSource: false,
            composition: { name: 'Carbon Steel', density: 7.85, color: '#A9A9A9' },
            importedFrom: exampleData.name,
            isExample: true
          }
        },
        {
          type: 'cylinder',
          parameters: { radiusTop: 2.23, radiusBottom: 2.23, height: 12 },
          position: { x: 0, y: 6, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Stainless Steel Liner',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'Stainless Steel Liner',
            isSource: false,
            composition: { name: 'SS304', density: 8.0, color: '#C0C0C0' },
            importedFrom: exampleData.name,
            isExample: true
          }
        },
        {
          type: 'cylinder',
          parameters: { radiusTop: 3.25, radiusBottom: 3.25, height: 12 },
          position: { x: 0, y: 6, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Concrete Shield',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'Concrete Shield',
            isSource: false,
            composition: { name: 'Heavy Concrete', density: 2.4, color: '#8B7355' },
            importedFrom: exampleData.name,
            isExample: true
          }
        }
      );
      break;
      
    case 'waste-container':
      // WASTE_CONTAINER.PCS - High-Level Waste Storage Container
      volumes.push(
        {
          type: 'cylinder',
          parameters: { radiusTop: 0.75, radiusBottom: 0.75, height: 2 },
          position: { x: 0, y: 2, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Lead Shield',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'Lead Shield',
            isSource: false,
            composition: { name: 'Lead', density: 11.34, color: '#708090' },
            importedFrom: exampleData.name,
            isExample: true
          }
        },
        {
          type: 'cylinder',
          parameters: { radiusTop: 0.7, radiusBottom: 0.7, height: 2 },
          position: { x: 0, y: 2, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Steel Container',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'Steel Container',
            isSource: false,
            composition: { name: 'Stainless Steel', density: 7.85, color: '#A9A9A9' },
            importedFrom: exampleData.name,
            isExample: true
          }
        },
        {
          type: 'cylinder',
          parameters: { radiusTop: 1.25, radiusBottom: 1.25, height: 2 },
          position: { x: 0, y: 2, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Concrete Overpack',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'cylinder',
            volumeName: 'Concrete Overpack',
            isSource: false,
            composition: { name: 'Reinforced Concrete', density: 2.4, color: '#8B7355' },
            importedFrom: exampleData.name,
            isExample: true
          }
        }
      );
      break;
      
    case 'fuel-assembly':
      // FUEL_ASSEMBLY.PCS - Nuclear Fuel Assembly
      volumes.push(
        {
          type: 'box',
          parameters: { width: 0.2, height: 4.5, depth: 0.2 },
          position: { x: 0, y: 3.25, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Fuel Assembly Structure',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'box',
            volumeName: 'Fuel Assembly Structure',
            isSource: false,
            composition: { name: 'Zircaloy-4', density: 6.56, color: '#C0C0C0' },
            importedFrom: exampleData.name,
            isExample: true
          }
        },
        {
          type: 'box',
          parameters: { width: 0.18, height: 4.5, depth: 0.18 },
          position: { x: 0, y: 3.25, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: 'Fuel Rods',
          userData: {
            id: `volume-${baseId}-${volumeId++}`,
            type: 'box',
            volumeName: 'Fuel Rods',
            isSource: true,
            composition: { name: 'UO2 Pellets', density: 10.97, color: '#FFD700' },
            importedFrom: exampleData.name,
            isExample: true
          }
        }
      );
      break;
      
    default:
      console.warn('Unknown example type:', exampleData.id);
  }
  
  return volumes;
}

/**
 * Load example scene
 */
export function loadExampleScene(exampleData, existingVolumes, actions) {
  // Check if this example is already loaded to prevent duplicates
  const existingExampleVolumes = existingVolumes.filter(vol => 
    vol.userData?.isExample === true && 
    (vol.userData?.importedFrom === exampleData.name || 
     vol.userData?.volumeName?.includes(exampleData.name) ||
     vol.userData?.volumeName?.includes('Steel Tube') ||
     vol.userData?.volumeName?.includes('UO2') ||
     vol.userData?.volumeName?.includes('Air Space'))
  );
  
  if (existingExampleVolumes.length > 0) {
    return;
  }
  
  // Clear existing scene first
  if (window.clearScene) {
    window.clearScene();
  }
  // Clear existing volumes from state
  actions.setExistingVolumes([]);
  actions.setHasObjects(false);
  actions.setSelectedGeometry(null);
  actions.setHasSelectedObject(false);
  
  // Create compound volumes based on the example
  const volumes = createCompoundVolumes(exampleData);
  
  // Add each volume to the scene using createGeometryFromData
  volumes.forEach(volume => {
    if (window.createGeometryFromData) {
      const objData = {
        type: volume.type,
        geometry: {
          type: volume.type,
          parameters: volume.parameters
        },
        position: volume.position,
        scale: volume.scale,
        userData: volume.userData
      };
      
      const geometry = window.createGeometryFromData(objData);
      if (geometry) {
        // Add to existing volumes list
        const volumeData = {
          id: geometry.userData.id || Date.now(),
          type: geometry.userData.type,
          position: geometry.position,
          visible: geometry.userData.visible !== false,
          userData: geometry.userData
        };
        actions.setExistingVolumes(prev => [...prev, volumeData]);
      }
    }
  });
  
  actions.setHasObjects(true);
}


/**
 * Function to collect current scene data
 */
export function getSceneData(state) {
  const sceneData = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    metadata: {
      name: 'Mercurad Scene',
      description: '3D Scene with volumes and geometries',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    },
    scene: {
      camera: {
        mode: state.cameraMode,
        position: window.getCameraPosition ? window.getCameraPosition() : { x: 0, y: 5, z: 10 },
        rotation: window.getCameraRotation ? window.getCameraRotation() : { x: 0, y: 0, z: 0 }
      },
      view: {
        mode: window.getViewMode ? window.getViewMode() : 'solid',
        material: window.getMaterialMode ? window.getMaterialMode() : 'solid'
      },
      axis: window.getAxisView ? window.getAxisView() : 'Z'
    },
    objects: state.existingVolumes.map(volume => ({
      id: volume.id,
      type: volume.type,
      name: volume.userData?.volumeName || 'Unnamed Volume',
      position: volume.position,
      geometry: {
        type: volume.type,
        parameters: volume.userData?.geometryParameters || {}
      },
      volume: {
        name: volume.userData?.volumeName || 'Unnamed Volume',
        type: volume.userData?.volumeType || 'Unknown',
        composition: volume.userData?.composition || null,
        realDensity: volume.userData?.realDensity || 0,
        tolerance: volume.userData?.tolerance || 0,
        isSource: volume.userData?.isSource || false,
        calculation: volume.userData?.calculation || null,
        gammaSelectionMode: volume.userData?.gammaSelectionMode || null,
        spectrum: volume.userData?.spectrum || null
      },
      userData: volume.userData
    })),
    sensors: state.existingSensors,
    compositions: state.existingCompositions,
    spectra: state.existingSpectra,
    settings: {
      componentVisibility: state.componentVisibility,
      selectedTool: state.selectedTool,
      hasObjects: state.hasObjects,
      hasSelectedObject: state.hasSelectedObject
    }
  };
  
  return sceneData;
}

/**
 * Function to load scene data
 */
export function loadSceneData(sceneData, state, actions) {
  try {
    // Load scene settings
    if (sceneData.scene) {
      // Load camera settings
      if (sceneData.scene.camera) {
        if (window.setCameraPosition && sceneData.scene.camera.position) {
          // Note: Camera position will be handled by ThreeScene component
        }
        if (window.setAxisView && sceneData.scene.camera.mode) {
          // Set camera mode if different
          if (sceneData.scene.camera.mode !== state.cameraMode) {
            actions.setCameraMode(sceneData.scene.camera.mode);
          }
        }
      }
      
      // Load view settings
      if (sceneData.scene.view) {
        if (window.setViewMode && sceneData.scene.view.mode) {
          window.setViewMode(sceneData.scene.view.mode);
        }
        if (window.setMaterialMode && sceneData.scene.view.material) {
          window.setMaterialMode(sceneData.scene.view.material);
        }
      }
      
      // Load axis setting
      if (sceneData.scene.axis && window.setAxisView) {
        window.setAxisView(sceneData.scene.axis);
      }
    }
    
    // Load objects/volumes
    if (sceneData.objects && Array.isArray(sceneData.objects)) {
      // Clear existing volumes first
      actions.setExistingVolumes([]);
      
      // Load each object
      sceneData.objects.forEach(obj => {
        if (window.createGeometryFromData) {
          const geometry = window.createGeometryFromData(obj);
          if (geometry) {
            actions.setExistingVolumes(prev => [...prev, {
              id: obj.id,
              type: obj.type,
              name: obj.name,
              position: obj.position,
              visible: obj.visible !== false, // Include visibility state
              userData: obj.userData
            }]);
          }
        }
      });
      
      // Update object states
      actions.setHasObjects(sceneData.objects.length > 0);
      actions.setHasSelectedObject(false);
    }
    
    // Load sensors
    if (sceneData.sensors && Array.isArray(sceneData.sensors)) {
      actions.setExistingSensors(sceneData.sensors);
      
      // Create sensors in 3D scene
      sceneData.sensors.forEach(sensor => {
        if (window.createSensor) {
          window.createSensor(sensor);
        }
      });
    }
    
    // Load compositions
    if (sceneData.compositions && Array.isArray(sceneData.compositions)) {
      actions.setExistingCompositions(sceneData.compositions);
    }
    
    // Load spectra
    if (sceneData.spectra && Array.isArray(sceneData.spectra)) {
      actions.setExistingSpectra(sceneData.spectra);
    }
    
    // Preserve current UI state instead of loading saved component visibility
    // This prevents the directory watcher from disappearing and rotation sliders from appearing
    // when loading projects. Users can manually adjust UI layout as needed.
    
    // Only load selected tool if it's different from current
    if (sceneData.settings && sceneData.settings.selectedTool && sceneData.settings.selectedTool !== state.selectedTool) {
      actions.setSelectedTool(sceneData.settings.selectedTool);
    }
  } catch (error) {
    console.error('Error loading scene data:', error);
  }
}

/**
 * Function to load data from localStorage and sync with existingVolumes
 */
export function loadFromLocalStorage(actions) {
  try {
    // Check if scene was explicitly cleared in a previous session
    const sceneCleared = localStorage.getItem('mercurad_scene_cleared') === 'true';
    if (sceneCleared) {
      console.log('Scene restoration skipped - scene was explicitly cleared');
      localStorage.removeItem('mercurad_scene_cleared');
      return;
    }
    
    // Check if we're already restoring to prevent multiple calls
    if (window.isRestoringFromLocalStorage) {
      console.log('Already restoring from localStorage, skipping duplicate call');
      return;
    }
    
    // Set a flag to prevent duplicate additions during restoration
    window.isRestoringFromLocalStorage = true;
    
    const savedData = localStorage.getItem('mercurad_scene');
    if (!savedData) {
      window.isRestoringFromLocalStorage = false;
      return;
    }
    
    const sceneData = JSON.parse(savedData);
    
    if (sceneData.geometries && Array.isArray(sceneData.geometries)) {
      // Check for excessive volumes (likely duplicates)
      if (sceneData.geometries.length > 20) {
        console.warn(`Detected ${sceneData.geometries.length} volumes, which seems excessive. Clearing localStorage to prevent duplicates.`);
        localStorage.removeItem('mercurad_scene');
        window.isRestoringFromLocalStorage = false;
        return;
      }
      
      // Convert localStorage geometries to existingVolumes format
      let volumes = sceneData.geometries.map(geometryData => ({
        id: geometryData.id,
        type: geometryData.type,
        name: geometryData.volumeName || `Volume_${geometryData.id}`,
        userData: {
          volumeName: geometryData.volumeName || `Volume_${geometryData.id}`,
          id: geometryData.id,
          type: geometryData.type,
          originalColor: geometryData.originalColor,
          visible: true,
          // Include additional userData if available
          ...geometryData.userData
        },
        position: geometryData.position,
        rotation: geometryData.rotation,
        scale: geometryData.scale
      }));
      
      // Remove duplicates based on ID (more reliable than position-based)
      const uniqueVolumes = [];
      const seenIds = new Set();
      
      volumes.forEach(volume => {
        if (!seenIds.has(volume.id)) {
          seenIds.add(volume.id);
          uniqueVolumes.push(volume);
        } else {
          console.warn('Duplicate volume ID detected and removed:', volume.id, volume.userData?.volumeName);
        }
      });
      
      if (uniqueVolumes.length !== volumes.length) {
        console.log(`Removed ${volumes.length - uniqueVolumes.length} duplicate volumes`);
      }
      
      console.log('Setting existingVolumes:', uniqueVolumes.length, 'volumes');
      actions.setExistingVolumes(uniqueVolumes);
      
      // Create geometries in the 3D scene (with delay to ensure ThreeScene is initialized)
      setTimeout(() => {
        uniqueVolumes.forEach(volume => {
          if (window.createGeometryFromData) {
            const objData = {
              type: volume.type,
              geometry: {
                type: volume.type,
                parameters: volume.userData?.geometryParameters || {}
              },
              position: volume.position,
              rotation: volume.rotation,
              scale: volume.scale,
              userData: volume.userData,
              volume: volume.userData,
              visible: volume.visible !== false,
              name: volume.name
            };
            
            const geometry = window.createGeometryFromData(objData);
            if (geometry) {
              console.log('Restored geometry in scene:', volume.name);
            }
          } else {
            console.warn('createGeometryFromData not available yet');
          }
        });
        
        // Clear the restoration flag after all geometries are created
        window.isRestoringFromLocalStorage = false;
      }, 200);
    } else {
      // No geometries to restore, clear the flag immediately
      window.isRestoringFromLocalStorage = false;
    }
    
    // Load compositions, sensors, and spectra from localStorage
    if (sceneData.compositions && Array.isArray(sceneData.compositions)) {
      actions.setExistingCompositions(sceneData.compositions);
    }
    
    if (sceneData.sensors && Array.isArray(sceneData.sensors)) {
      actions.setExistingSensors(sceneData.sensors);
    }
    
    if (sceneData.spectra && Array.isArray(sceneData.spectra)) {
      actions.setExistingSpectra(sceneData.spectra);
    }
    
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    // Clear the restoration flag even on error
    window.isRestoringFromLocalStorage = false;
  }
}
