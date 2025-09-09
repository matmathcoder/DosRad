import * as THREE from 'three';

export class VertexHelpersManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    
    // Custom resize handler refs
    this.resizeHandlerRef = null;
    this.isResizing = false;
    this.resizePlane = null;
    this.resizeStartPoint = null;
    this.resizeStartDimensions = null;
    
    // Vertex helpers for resizing (JSFiddle approach)
    this.vertexHelpers = [];
    this.selectedVertexHelper = null;
    this.resizeMode = 'resize'; // 'resize' or 'edit'
    this.mouseDown = false;
    this.INTERSECTED = null;
    this.SELECTED = null;
    this.wireframeBox = null; // Wireframe box connecting vertex helpers
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    this.setupResizeHandler();
  }
  
  setupResizeHandler() {
    // Create invisible plane for dragging (JSFiddle approach)
    const planeGeometry = new THREE.PlaneGeometry(8, 8);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      transparent: true, 
      opacity: 0, 
      depthWrite: false, 
      side: THREE.DoubleSide,
      visible: false
    });
    
    this.resizePlane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.resizePlane.visible = false; // Keep invisible by default
    this.resizePlane.castShadow = false;
    this.resizePlane.receiveShadow = false;
    this.resizePlane.frustumCulled = false; // Don't cull for intersection testing
    this.resizePlane.userData = { type: 'resize-plane' };
    
    // Add to scene
    if (this.refs.sceneRef.current) {
      this.refs.sceneRef.current.add(this.resizePlane);
    }
  }
  
  // Vertex helper methods (Professional Blender-style approach)
  createVertexHelpers(object) {
    // Remove existing vertex helpers
    this.removeVertexHelpers();
    
    if (!object || !object.geometry) return;
    
    // Ensure object's world matrix is updated
    object.updateMatrixWorld(true);
    
    // Create professional vertex helpers (smaller, more precise)
    const sphereGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x737373, // Handler color
      transparent: true,
      opacity: 0.9
    });
    
    // Get bounding box from geometry in local space
    const localBoundingBox = new THREE.Box3().setFromBufferAttribute(object.geometry.attributes.position);
    const localSize = localBoundingBox.getSize(new THREE.Vector3());
    const localCenter = localBoundingBox.getCenter(new THREE.Vector3());
    
    // Create 8 corner positions in local space
    const localCorners = [
      new THREE.Vector3(localCenter.x - localSize.x/2, localCenter.y - localSize.y/2, localCenter.z - localSize.z/2), // bottom-left-back
      new THREE.Vector3(localCenter.x + localSize.x/2, localCenter.y - localSize.y/2, localCenter.z - localSize.z/2), // bottom-right-back
      new THREE.Vector3(localCenter.x - localSize.x/2, localCenter.y + localSize.y/2, localCenter.z - localSize.z/2), // top-left-back
      new THREE.Vector3(localCenter.x + localSize.x/2, localCenter.y + localSize.y/2, localCenter.z - localSize.z/2), // top-right-back
      new THREE.Vector3(localCenter.x - localSize.x/2, localCenter.y - localSize.y/2, localCenter.z + localSize.z/2), // bottom-left-front
      new THREE.Vector3(localCenter.x + localSize.x/2, localCenter.y - localSize.y/2, localCenter.z + localSize.z/2), // bottom-right-front
      new THREE.Vector3(localCenter.x - localSize.x/2, localCenter.y + localSize.y/2, localCenter.z + localSize.z/2), // top-left-front
      new THREE.Vector3(localCenter.x + localSize.x/2, localCenter.y + localSize.y/2, localCenter.z + localSize.z/2)  // top-right-front
    ];
    
    // Transform local corners to world space using object's world matrix
    const worldCorners = localCorners.map(corner => {
      const worldCorner = corner.clone();
      worldCorner.applyMatrix4(object.matrixWorld);
      return worldCorner;
    });
    
    // Create vertex helpers for each corner
    worldCorners.forEach((corner, i) => {
      const vertexHelper = new THREE.Mesh(sphereGeometry, sphereMaterial);
      vertexHelper.position.copy(corner);
      vertexHelper.visible = false; // Hidden by default
      vertexHelper.userData = { 
        type: 'vertex-helper', 
        index: i,
        parentObject: object,
        corner: corner.clone(),
        localCorner: localCorners[i].clone() // Store local position for updates
      };
      
      this.vertexHelpers.push(vertexHelper);
      this.refs.sceneRef.current.add(vertexHelper);
    });
    
    // Create wireframe box connecting the vertex helpers
    this.createWireframeBox(worldCorners);
  }
  
  createWireframeBox(corners) {
    // Remove existing wireframe box
    if (this.wireframeBox) {
      this.refs.sceneRef.current.remove(this.wireframeBox);
    }
    
    // Create wireframe box edges (like Blender's bounding box)
    const edges = [
      // Bottom face edges
      [0, 1], [1, 3], [3, 2], [2, 0],
      // Top face edges  
      [4, 5], [5, 7], [7, 6], [6, 4],
      // Vertical edges
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    
    const points = [];
    edges.forEach(edge => {
      points.push(corners[edge[0]], corners[edge[1]]);
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x737373, // Handler color
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    });
    
    this.wireframeBox = new THREE.LineSegments(geometry, material);
    this.wireframeBox.visible = false; // Hidden by default
    this.wireframeBox.userData = { type: 'wireframe-box' };
    
    this.refs.sceneRef.current.add(this.wireframeBox);
  }
  
  removeVertexHelpers() {
    this.vertexHelpers.forEach(helper => {
      this.refs.sceneRef.current.remove(helper);
      if (helper.geometry) helper.geometry.dispose();
      if (helper.material) helper.material.dispose();
    });
    this.vertexHelpers = [];
    this.selectedVertexHelper = null;
    
    // Remove wireframe box
    if (this.wireframeBox) {
      this.refs.sceneRef.current.remove(this.wireframeBox);
      if (this.wireframeBox.geometry) this.wireframeBox.geometry.dispose();
      if (this.wireframeBox.material) this.wireframeBox.material.dispose();
      this.wireframeBox = null;
    }
  }
  
  showVertexHelpers() {
    this.vertexHelpers.forEach(helper => {
      helper.visible = true;
    });
    if (this.wireframeBox) {
      this.wireframeBox.visible = true;
    }
    // Resize plane stays invisible - we use bounding box intersection instead
  }
  
  hideVertexHelpers() {
    this.vertexHelpers.forEach(helper => {
      helper.visible = false;
    });
    if (this.wireframeBox) {
      this.wireframeBox.visible = false;
    }
    // Resize plane stays invisible
  }
  
  updateResizePlane() {
    if (!this.resizePlane || !this.refs.selectedGeometryRef.current) return;
    
    const object = this.refs.selectedGeometryRef.current;
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());
    
    // Make the resize plane larger than the object to ensure easy intersection
    const planeSize = Math.max(size.x, size.y, size.z) * 1.5;
    
    // Update the resize plane geometry
    this.resizePlane.geometry.dispose();
    this.resizePlane.geometry = new THREE.PlaneGeometry(planeSize, planeSize);
    
    // Position the resize plane at the object center
    this.resizePlane.position.copy(center);
    
    // Orient the resize plane to face the camera
    if (this.modules?.cameraController) {
      const camera = this.modules.cameraController.getActiveCamera();
      this.resizePlane.lookAt(camera.position);
    }
  }

  updateVertexHelpersPositions(object) {
    // Update vertex helpers positions based on object's current transformation
    // Ensure object's world matrix is updated
    object.updateMatrixWorld(true);
    
    // Get bounding box from geometry in local space
    const localBoundingBox = new THREE.Box3().setFromBufferAttribute(object.geometry.attributes.position);
    const localSize = localBoundingBox.getSize(new THREE.Vector3());
    const localCenter = localBoundingBox.getCenter(new THREE.Vector3());
    
    // Create 8 corner positions in local space
    const localCorners = [
      new THREE.Vector3(localCenter.x - localSize.x/2, localCenter.y - localSize.y/2, localCenter.z - localSize.z/2), // bottom-left-back
      new THREE.Vector3(localCenter.x + localSize.x/2, localCenter.y - localSize.y/2, localCenter.z - localSize.z/2), // bottom-right-back
      new THREE.Vector3(localCenter.x - localSize.x/2, localCenter.y + localSize.y/2, localCenter.z - localSize.z/2), // top-left-back
      new THREE.Vector3(localCenter.x + localSize.x/2, localCenter.y + localSize.y/2, localCenter.z - localSize.z/2), // top-right-back
      new THREE.Vector3(localCenter.x - localSize.x/2, localCenter.y - localSize.y/2, localCenter.z + localSize.z/2), // bottom-left-front
      new THREE.Vector3(localCenter.x + localSize.x/2, localCenter.y - localSize.y/2, localCenter.z + localSize.z/2), // bottom-right-front
      new THREE.Vector3(localCenter.x - localSize.x/2, localCenter.y + localSize.y/2, localCenter.z + localSize.z/2), // top-left-front
      new THREE.Vector3(localCenter.x + localSize.x/2, localCenter.y + localSize.y/2, localCenter.z + localSize.z/2)  // top-right-front
    ];
    
    // Transform local corners to world space using object's world matrix
    const worldCorners = localCorners.map(corner => {
      const worldCorner = corner.clone();
      worldCorner.applyMatrix4(object.matrixWorld);
      return worldCorner;
    });
    
    this.vertexHelpers.forEach((helper, i) => {
      if (worldCorners[i]) {
        helper.position.copy(worldCorners[i]);
        helper.userData.corner = worldCorners[i].clone();
        helper.userData.localCorner = localCorners[i].clone(); // Update local position too
      }
    });
    
    // Update wireframe box
    this.updateWireframeBox(worldCorners);
  }
  
  updateWireframeBox(corners) {
    if (!this.wireframeBox) return;
    
    // Create wireframe box edges (like Blender's bounding box)
    const edges = [
      // Bottom face edges
      [0, 1], [1, 3], [3, 2], [2, 0],
      // Top face edges  
      [4, 5], [5, 7], [7, 6], [6, 4],
      // Vertical edges
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    
    const points = [];
    edges.forEach(edge => {
      points.push(corners[edge[0]], corners[edge[1]]);
    });
    
    // Update geometry
    this.wireframeBox.geometry.dispose();
    this.wireframeBox.geometry = new THREE.BufferGeometry().setFromPoints(points);
  }
  
  handleMouseUp() {
    if (this.isResizing) {
      this.isResizing = false;
      this.resizePlane = null;
      this.resizeStartPoint = null;
      this.resizeStartDimensions = null;
      
      // Remove event listeners
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      
      // Enforce floor constraint after resize
      if (this.refs.selectedGeometryRef.current) {
        this.enforceFloorConstraint(this.refs.selectedGeometryRef.current);
      }
      
      // Save history and auto-save
      if (this.modules?.historyManager) {
        this.modules.historyManager.saveToHistory();
      }
      if (this.modules?.persistenceManager) {
        this.modules.persistenceManager.saveScene();
      }
    }
  }
  
  resizeObject(factor) {
    const object = this.refs.selectedGeometryRef.current;
    if (!object || !this.resizeStartDimensions) return;
    
    // Create new geometry with updated dimensions
    const newWidth = this.resizeStartDimensions.width * factor;
    const newHeight = this.resizeStartDimensions.height * factor;
    const newDepth = this.resizeStartDimensions.depth * factor;
    
    // Create new geometry based on object type
    let newGeometry;
    if (object.geometry.type === 'BoxGeometry') {
      newGeometry = new THREE.BoxGeometry(newWidth, newHeight, newDepth);
    } else if (object.geometry.type === 'SphereGeometry') {
      newGeometry = new THREE.SphereGeometry(newWidth / 2, 32, 32);
    } else if (object.geometry.type === 'CylinderGeometry') {
      newGeometry = new THREE.CylinderGeometry(newWidth / 2, newWidth / 2, newHeight, 32);
    } else {
      // Default to box geometry
      newGeometry = new THREE.BoxGeometry(newWidth, newHeight, newDepth);
    }
    
    // Dispose old geometry and assign new one
    object.geometry.dispose();
    object.geometry = newGeometry;
    
    // Reset scale to (1,1,1) since we're changing actual dimensions
    object.scale.set(1, 1, 1);
  }
  
  enforceFloorConstraint(object) {
    if (!object) return;
    
    // Get object bounding box
    const boundingBox = new THREE.Box3().setFromObject(object);
    const objectBottom = boundingBox.min.y;
    const floorLevel = 0; // Grid plane is at Y=0
    
    // If object bottom is below floor level, move it up
    if (objectBottom < floorLevel) {
      const offset = floorLevel - objectBottom;
      object.position.y += offset;
    }
  }
  
  handleToolChange(selectedTool) {
    if (selectedTool === 'resize') {
      // Create and show vertex helpers if an object is selected
      if (this.refs.selectedGeometryRef.current) {
        this.createVertexHelpers(this.refs.selectedGeometryRef.current);
        this.showVertexHelpers();
      }
    } else {
      // Hide vertex helpers when switching away from resize tool
      this.hideVertexHelpers();
    }
  }
  
  cleanup() {
    // Clean up vertex helpers
    this.removeVertexHelpers();
  }
}
