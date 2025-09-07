import * as THREE from 'three';

export class DragDropManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    // Drag drop manager initialization
  }
  
  // Drag and drop handlers
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    // Add visual feedback to canvas during drag
    if (this.refs.canvasRef.current) {
      this.refs.canvasRef.current.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5)';
      this.refs.canvasRef.current.style.filter = 'brightness(1.1)';
    }
  }
  
  handleDragLeave(e) {
    // Remove visual feedback when drag leaves canvas
    if (this.refs.canvasRef.current) {
      this.refs.canvasRef.current.style.boxShadow = 'none';
      this.refs.canvasRef.current.style.filter = 'none';
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    
    // Remove visual feedback
    if (this.refs.canvasRef.current) {
      this.refs.canvasRef.current.style.boxShadow = 'none';
      this.refs.canvasRef.current.style.filter = 'none';
    }
    
    const geometryType = e.dataTransfer.getData('text/plain');
    
    if (geometryType && this.refs.canvasRef.current) {
      // Calculate 3D position from drop coordinates
      const rect = this.refs.canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Use raycaster to find drop position in 3D space
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      let dropPosition = new THREE.Vector3(0, 2, 0); // Default position
      
      if (this.modules?.cameraController) {
        const activeCamera = this.modules.cameraController.getActiveCamera();
        raycaster.setFromCamera(mouse, activeCamera);
        
        // Try to intersect with existing objects first
        const intersects = raycaster.intersectObjects([...this.refs.geometriesRef.current]);
        
        if (intersects.length > 0) {
          // Drop on top of existing object
          dropPosition = intersects[0].point.clone();
          dropPosition.y += 1; // Place slightly above the intersected object
        } else {
          // Drop in empty space - use a default distance from camera
          const direction = raycaster.ray.direction.clone();
          dropPosition = activeCamera.position.clone().add(direction.multiplyScalar(5));
        }
      }
      
      // Create geometry at drop position
      if (this.modules?.geometryManager) {
        const mesh = this.modules.geometryManager.createGeometryAtPosition(geometryType, dropPosition);
        if (mesh) {
          // Enforce floor constraint on newly created object
          if (this.modules?.floorConstraintManager) {
            this.modules.floorConstraintManager.enforceFloorConstraint(mesh);
          }
          
          // Select the new geometry
          if (this.modules?.selectionManager) {
            this.modules.selectionManager.selectGeometry(mesh);
          }
          
          // Notify App.jsx about the new geometry creation
          if (this.callbacks.onGeometryCreated) {
            this.callbacks.onGeometryCreated(mesh);
          }
        }
      }
    }
  }
  
  handleToolChange(selectedTool) {
    // Handle tool-specific drag drop behavior
    // Drag drop behavior doesn't change based on tool
  }
  
  cleanup() {
    // Clean up drag drop state
    // No persistent state to clean up
  }
}
