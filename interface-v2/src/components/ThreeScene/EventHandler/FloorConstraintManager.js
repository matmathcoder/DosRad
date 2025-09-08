import * as THREE from 'three';

export class FloorConstraintManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    
    // Floor constraint refs
    this.floorLevel = 0; // Grid plane is at Y=0
    this.floorConstraintEnabled = true;
    
    // Scene boundary constraints
    this.sceneBounds = null;
    this.boundaryConstraintsEnabled = true;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    // Get scene bounds from SceneManager
    if (this.modules?.sceneManager) {
      this.sceneBounds = this.modules.sceneManager.getSceneBounds();
    }
  }
  
  // Floor constraint methods
  enforceFloorConstraint(object) {
    if (!object) return;
    
    // Apply floor constraint
    if (this.floorConstraintEnabled) {
      this.enforceFloorLevel(object);
    }
    
    // Apply scene boundary constraints
    if (this.boundaryConstraintsEnabled && this.sceneBounds) {
      this.enforceSceneBoundaries(object);
    }
  }
  
  enforceFloorLevel(object) {
    // Get object bounding box
    const boundingBox = new THREE.Box3().setFromObject(object);
    const objectBottom = boundingBox.min.y;
    
    // If object bottom is below floor level, move it up
    if (objectBottom < this.floorLevel) {
      const offset = this.floorLevel - objectBottom;
      object.position.y += offset;
    }
  }
  
  enforceSceneBoundaries(object) {
    if (!this.sceneBounds) return;
    
    // Get object bounding box
    const boundingBox = new THREE.Box3().setFromObject(object);
    const bounds = this.sceneBounds;
    
    // Check and constrain X position
    if (boundingBox.min.x < bounds.minX) {
      object.position.x += bounds.minX - boundingBox.min.x;
    } else if (boundingBox.max.x > bounds.maxX) {
      object.position.x -= boundingBox.max.x - bounds.maxX;
    }
    
    // Check and constrain Y position
    if (boundingBox.min.y < bounds.minY) {
      object.position.y += bounds.minY - boundingBox.min.y;
    } else if (boundingBox.max.y > bounds.maxY) {
      object.position.y -= boundingBox.max.y - bounds.maxY;
    }
    
    // Check and constrain Z position
    if (boundingBox.min.z < bounds.minZ) {
      object.position.z += bounds.minZ - boundingBox.min.z;
    } else if (boundingBox.max.z > bounds.maxZ) {
      object.position.z -= boundingBox.max.z - bounds.maxZ;
    }
  }
  
  // Check if a position would be within scene bounds
  isPositionWithinBounds(position) {
    if (!this.sceneBounds) return true;
    
    const bounds = this.sceneBounds;
    return (
      position.x >= bounds.minX && position.x <= bounds.maxX &&
      position.y >= bounds.minY && position.y <= bounds.maxY &&
      position.z >= bounds.minZ && position.z <= bounds.maxZ
    );
  }
  
  // Clamp a position to scene bounds
  clampPositionToBounds(position) {
    if (!this.sceneBounds) return position;
    
    const bounds = this.sceneBounds;
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
      z: Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z))
    };
  }
  
  enforceFloorConstraintOnAllObjects() {
    if (!this.floorConstraintEnabled) return;
    
    this.refs.geometriesRef.current.forEach(object => {
      this.enforceFloorConstraint(object);
    });
  }
  
  handleToolChange(selectedTool) {
    // Handle tool-specific floor constraint behavior
    // Floor constraint behavior doesn't change based on tool
  }
  
  cleanup() {
    // Clean up floor constraint state
    this.floorConstraintEnabled = true;
    this.floorLevel = 0;
    this.sceneBounds = null;
    this.boundaryConstraintsEnabled = true;
  }
}
