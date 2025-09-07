import * as THREE from 'three';

export default class ViewManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by main GeometryManager
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  applyViewMode(mesh, mode) {
    if (!mesh.material) return;
    
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
        break;
    }
    mesh.material.needsUpdate = true;
  }
  
  applyMaterialMode(mesh, mode) {
    if (!mesh.material) return;
    
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
        break;
    }
    mesh.material.needsUpdate = true;
  }
}
