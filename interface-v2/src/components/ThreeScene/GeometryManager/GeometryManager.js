import MaterialManager from './MaterialManager.js';
import GeometryCreator from './GeometryCreator.js';
import IndicatorManager from './IndicatorManager.js';
import ViewManager from './ViewManager.js';

export default class GeometryManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by ThreeScene
    
    // Initialize all sub-managers
    this.materialManager = new MaterialManager(refs, state, callbacks);
    this.geometryCreator = new GeometryCreator(refs, state, callbacks);
    this.indicatorManager = new IndicatorManager(refs, state, callbacks);
    this.viewManager = new ViewManager(refs, state, callbacks);
  }
  
  setModules(modules) {
    this.modules = modules;
    
    // Create a modules object that includes all managers for cross-referencing
    const modulesWithManagers = {
      ...modules,
      materialManager: this.materialManager,
      geometryCreator: this.geometryCreator,
      indicatorManager: this.indicatorManager,
      viewManager: this.viewManager,
      geometryManager: this
    };
    
    // Pass modules to all managers
    this.materialManager.setModules(modulesWithManagers);
    this.geometryCreator.setModules(modulesWithManagers);
    this.indicatorManager.setModules(modulesWithManagers);
    this.viewManager.setModules(modulesWithManagers);
  }
  
  // Material Management Methods
  createMaterial(geometryType, composition = null, isSource = false, isSensor = false) {
    return this.materialManager.createMaterial(geometryType, composition, isSource, isSensor);
  }
  
  updateObjectMaterial(mesh, composition = null, isSource = false, isSensor = false) {
    return this.materialManager.updateObjectMaterial(mesh, composition, isSource, isSensor);
  }
  
  createMaterialForMode(materialMode) {
    return this.materialManager.createMaterialForMode(materialMode);
  }
  
  // Geometry Creation Methods
  createGeometry(geometryType) {
    return this.geometryCreator.createGeometry(geometryType);
  }
  
  createSensor(sensorData) {
    return this.geometryCreator.createSensor(sensorData);
  }
  
  createGeometryFromData(objData) {
    return this.geometryCreator.createGeometryFromData(objData);
  }
  
  createGeometryAtPosition(geometryType, position) {
    return this.geometryCreator.createGeometryAtPosition(geometryType, position);
  }
  
  duplicateGeometry(mesh) {
    return this.geometryCreator.duplicateGeometry(mesh);
  }
  
  addSolidAngleLine(mesh) {
    return this.geometryCreator.addSolidAngleLine(mesh);
  }
  
  // Indicator Management Methods
  createObjectIndicator(mesh) {
    return this.indicatorManager.createObjectIndicator(mesh);
  }
  
  removeObjectIndicators(mesh) {
    return this.indicatorManager.removeObjectIndicators(mesh);
  }
  
  cleanupAllIndicators() {
    return this.indicatorManager.cleanupAllIndicators();
  }
  
  addSensorLabel(sensor, name) {
    return this.indicatorManager.addSensorLabel(sensor, name);
  }
  
  
  // View Management Methods
  applyViewMode(mesh, mode) {
    return this.viewManager.applyViewMode(mesh, mode);
  }
  
  applyMaterialMode(mesh, mode) {
    return this.viewManager.applyMaterialMode(mesh, mode);
  }
  
  // Core Geometry Management Methods
  deleteGeometry(mesh) {
    console.log('deleteGeometry called for mesh:', {
      id: mesh.userData?.id,
      name: mesh.userData?.volumeName,
      type: mesh.userData?.type,
      geometriesCount: this.refs.geometriesRef.current.length
    });
    
    const index = this.refs.geometriesRef.current.indexOf(mesh);
    
    if (index > -1) {
      // Store the geometry ID before deletion for callback
      const geometryId = mesh.userData?.id;
      
      // Check if this is the currently selected geometry and clear selection
      if (this.refs.selectedGeometryRef.current === mesh) {
        this.refs.selectedGeometryRef.current = null;
        
        // Clear transform controls if they're attached to this mesh
        if (this.modules?.eventHandler?.transformControlsRef) {
          const transformControls = this.modules.eventHandler.transformControlsRef;
          if (transformControls.object === mesh) {
            transformControls.detach();
            transformControls.enabled = false;
            transformControls.visible = false;
          }
        }
        
        // Clear vertex helpers if they exist
        if (this.modules?.eventHandler?.hideVertexHelpers) {
          this.modules.eventHandler.hideVertexHelpers();
        }
        
        // Notify parent component that selection has changed
        if (this.callbacks?.onSelectionChange) {
          this.callbacks.onSelectionChange(null);
        }
      }
      
      this.refs.geometriesRef.current.splice(index, 1);
      
      this.refs.sceneGroupRef.current.remove(mesh);
      
      // Remove visual indicators
      this.indicatorManager.removeObjectIndicators(mesh);
      
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      
      // Invalidate shadow maps to prevent shadow persistence
      this.invalidateShadowMaps();
      
      // Notify parent component about the deletion
      if (this.callbacks?.onGeometryDeleted && geometryId) {
        this.callbacks.onGeometryDeleted(geometryId);
      }
      
      // Sync with localStorage
      if (window.handleGeometryDeleted && geometryId) {
        window.handleGeometryDeleted(geometryId);
      }
      
      return true;
    }
    return false;
  }
  
  // Method to invalidate shadow maps and force re-render
  invalidateShadowMaps() {
    if (this.refs.sceneRef.current) {
      // Force shadow map update by marking all shadow-casting lights as needing update
      this.refs.sceneRef.current.traverse((object) => {
        if (object.isDirectionalLight && object.castShadow) {
          object.shadow.needsUpdate = true;
        }
        if (object.isPointLight && object.castShadow) {
          object.shadow.needsUpdate = true;
        }
        if (object.isSpotLight && object.castShadow) {
          object.shadow.needsUpdate = true;
        }
      });
    }
  }
  
  cleanup() {
    // Cleanup is handled by SceneManager
  }
}
