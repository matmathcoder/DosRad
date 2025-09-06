import * as THREE from 'three';

export default class ViewManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    
    this.cutPlaneRef = null;
    this.solidAngleLinesRef = [];
  }
  
  initialize() {
    // Initialize view-related features
  }
  
  // Change view mode for all objects
  changeViewMode(mode) {
    this.state.setViewMode(mode);
    
    this.refs.geometriesRef.current.forEach(mesh => {
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
  }
  
  // Change material mode for all objects
  changeMaterialMode(mode) {
    this.state.setMaterialMode(mode);
    
    this.refs.geometriesRef.current.forEach(mesh => {
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
  }
  
  // View menu action handlers
  toggleMesh() {
    this.state.setShowMesh(prev => {
      const newValue = !prev;
      // Toggle mesh visualization (wireframe mode) instead of hiding geometries
      this.refs.geometriesRef.current.forEach(mesh => {
        if (mesh.material) {
          // Store original wireframe state if not already stored
          if (mesh.userData.originalWireframe === undefined) {
            mesh.userData.originalWireframe = mesh.material.wireframe;
          }
          
          if (newValue) {
            // Show mesh visualization - enable wireframe for all objects
            mesh.material.wireframe = true;
            mesh.material.transparent = true;
            mesh.material.opacity = 0.7;
          } else {
            // Hide mesh visualization - restore original material properties
            mesh.material.wireframe = mesh.userData.originalWireframe || false;
            mesh.material.transparent = false;
            mesh.material.opacity = 1.0;
          }
          mesh.material.needsUpdate = true;
        }
      });
      return newValue;
    });
  }
  
  toggleCutPlane() {
    this.state.setShowCutPlane(prev => {
      const newValue = !prev;
      if (newValue) {
        this.createCutPlane();
      } else {
        this.removeCutPlane();
      }
      return newValue;
    });
  }
  
  createCutPlane() {
    if (!this.refs.sceneRef.current || this.cutPlaneRef) return;

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
    
    this.refs.sceneRef.current.add(cutPlane);
    this.cutPlaneRef = cutPlane;
  }
  
  removeCutPlane() {
    if (this.cutPlaneRef && this.refs.sceneRef.current) {
      this.refs.sceneRef.current.remove(this.cutPlaneRef);
      if (this.cutPlaneRef.geometry) this.cutPlaneRef.geometry.dispose();
      if (this.cutPlaneRef.material) this.cutPlaneRef.material.dispose();
      this.cutPlaneRef = null;
    }
  }
  
  hideSolidAngleLines() {
    this.state.setShowSolidAngleLines(false);
    this.solidAngleLinesRef.forEach(line => {
      if (this.refs.sceneRef.current && line) {
        this.refs.sceneRef.current.remove(line);
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      }
    });
    this.solidAngleLinesRef = [];
  }
  
  addSolidAngleLines() {
    if (!this.refs.sceneRef.current) return;
    
    // Clear existing lines first
    this.hideSolidAngleLines();
    
    this.state.setShowSolidAngleLines(true);
    
    // Create solid angle lines from center to each geometry
    const center = new THREE.Vector3(0, 0, 0);
    const lines = [];
    
    this.refs.geometriesRef.current.forEach(mesh => {
      if (mesh && mesh.position) {
        const points = [];
        points.push(center);
        points.push(mesh.position.clone());
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x737373, // Handler color
          transparent: true,
          opacity: 0.8
        });
        
        const line = new THREE.Line(geometry, material);
        line.userData = { type: 'solidAngleLine' };
        
        this.refs.sceneRef.current.add(line);
        lines.push(line);
      }
    });
    
    this.solidAngleLinesRef = lines;
  }
  
  normalView() {
    // Reset all view settings to normal/default
    this.state.setShowMesh(true);
    this.state.setShowCutPlane(false);
    this.state.setShowSolidAngleLines(false);
    
    // Show all meshes
    this.refs.geometriesRef.current.forEach(mesh => {
      mesh.visible = true;
    });
    
    // Remove cut plane
    this.removeCutPlane();
    
    // Remove solid angle lines
    this.hideSolidAngleLines();
  }
  
  handleViewMenuAction(action) {
    switch (action) {
      case 'toggleMesh':
        this.toggleMesh();
        break;
      case 'toggleCutPlane':
        this.toggleCutPlane();
        break;
      case 'hideSolidAngleLines':
        this.hideSolidAngleLines();
        break;
      case 'addSolidAngleLines':
        this.addSolidAngleLines();
        break;
      case 'normalView':
        this.normalView();
        break;
      default:
        console.warn('Unknown view menu action:', action);
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
  
  cleanup() {
    // Clean up view features
    if (this.cutPlaneRef) {
      if (this.cutPlaneRef.geometry) this.cutPlaneRef.geometry.dispose();
      if (this.cutPlaneRef.material) this.cutPlaneRef.material.dispose();
    }
    
    this.solidAngleLinesRef.forEach(line => {
      if (line.geometry) line.geometry.dispose();
      if (line.material) line.material.dispose();
    });
  }
}
