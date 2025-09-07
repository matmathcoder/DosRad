import * as THREE from 'three';

export class BoxSelectionManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    
    // Box selection state
    this.isBoxSelecting = false;
    this.boxSelectStart = null;
    this.boxSelectEnd = null;
    this.boxSelectGeometry = null;
    this.boxSelectMaterial = null;
    this.mouseDown = false;
    this.mousePosition = null;
    this.boxSelectTimer = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    // Box selection manager initialization
  }
  
  // Box selection methods
  startBoxSelection(startPoint) {
    this.isBoxSelecting = true;
    this.boxSelectStart = startPoint;
    this.boxSelectEnd = startPoint;
    
    // Create box selection geometry
    this.createBoxSelectionGeometry();
  }
  
  updateBoxSelection(endPoint) {
    if (!this.isBoxSelecting) return;
    
    this.boxSelectEnd = endPoint;
    this.updateBoxSelectionGeometry();
    this.performBoxSelection();
  }
  
  endBoxSelection() {
    if (!this.isBoxSelecting) return;
    
    this.isBoxSelecting = false;
    this.removeBoxSelectionGeometry();
    
    // Clear selection if no objects were selected
    if (this.modules?.selectionManager && this.modules.selectionManager.selectedObjects.size === 0) {
      this.modules.selectionManager.clearSelection();
    }
  }
  
  createBoxSelectionGeometry() {
    if (!this.refs.sceneRef.current) return;
    
    const geometry = new THREE.PlaneGeometry(1, 1);
    this.boxSelectMaterial = new THREE.MeshBasicMaterial({
      color: 0x0080ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    
    this.boxSelectGeometry = new THREE.Mesh(geometry, this.boxSelectMaterial);
    this.boxSelectGeometry.visible = false;
    this.refs.sceneRef.current.add(this.boxSelectGeometry);
  }
  
  updateBoxSelectionGeometry() {
    if (!this.boxSelectGeometry || !this.boxSelectStart || !this.boxSelectEnd) return;
    
    const start = this.boxSelectStart;
    const end = this.boxSelectEnd;
    
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    
    if (width > 0 && height > 0) {
      this.boxSelectGeometry.scale.set(width, height, 1);
      this.boxSelectGeometry.position.set(centerX, centerY, 0);
      this.boxSelectGeometry.visible = true;
    }
  }
  
  performBoxSelection() {
    if (!this.boxSelectStart || !this.boxSelectEnd) return;
    
    const start = this.boxSelectStart;
    const end = this.boxSelectEnd;
    
    // Normalize coordinates
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    
    // Check each geometry against the selection box
    this.refs.geometriesRef.current.forEach(object => {
      const position = object.position;
      const screenPosition = this.worldToScreen(position);
      
      if (screenPosition.x >= minX && screenPosition.x <= maxX &&
          screenPosition.y >= minY && screenPosition.y <= maxY) {
        if (this.modules?.selectionManager) {
          this.modules.selectionManager.addToSelection(object);
        }
      }
    });
  }
  
  worldToScreen(worldPosition) {
    const vector = worldPosition.clone();
    
    // Get the active camera from the camera controller
    const camera = this.modules?.cameraController?.getActiveCamera();
    if (!camera) {
      console.warn('No camera available for worldToScreen conversion');
      return { x: 0, y: 0 };
    }
    
    vector.project(camera);
    
    const width = this.refs.rendererRef.current.domElement.clientWidth;
    const height = this.refs.rendererRef.current.domElement.clientHeight;
    
    return {
      x: (vector.x * 0.5 + 0.5) * width,
      y: (vector.y * -0.5 + 0.5) * height
    };
  }
  
  removeBoxSelectionGeometry() {
    if (this.boxSelectGeometry) {
      this.refs.sceneRef.current.remove(this.boxSelectGeometry);
      this.boxSelectGeometry.geometry.dispose();
      this.boxSelectGeometry.material.dispose();
      this.boxSelectGeometry = null;
    }
    if (this.boxSelectMaterial) {
      this.boxSelectMaterial.dispose();
      this.boxSelectMaterial = null;
    }
  }
  
  handleToolChange(selectedTool) {
    // Handle tool-specific box selection behavior
    if (selectedTool === 'select') {
      // Enable box selection for select tool
    } else {
      // Disable box selection for other tools
      if (this.isBoxSelecting) {
        this.endBoxSelection();
      }
    }
  }
  
  cleanup() {
    // Clean up box selection state
    if (this.isBoxSelecting) {
      this.endBoxSelection();
    }
    
    if (this.boxSelectTimer) {
      clearTimeout(this.boxSelectTimer);
      this.boxSelectTimer = null;
    }
    
    this.removeBoxSelectionGeometry();
  }
}
