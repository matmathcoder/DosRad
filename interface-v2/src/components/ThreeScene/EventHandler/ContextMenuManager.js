import * as THREE from 'three';

export class ContextMenuManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    
    // Context menu refs
    this.contextMenuVisible = false;
    this.contextMenuPosition = { x: 0, y: 0 };
    this.contextMenuObject = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    // Context menu manager initialization
  }
  
  // Context Menu Methods
  handleContextMenu(event) {
    event.preventDefault();
    
    // Get mouse position
    const rect = this.refs.canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast to find intersected object
    const raycaster = new THREE.Raycaster();
    const camera = this.modules?.cameraController?.getActiveCamera();
    
    if (!camera) {
      return;
    }

    // Get all objects from the scene group
    const sceneGroup = this.refs.sceneGroupRef.current;
    if (!sceneGroup) {
      return;
    }

    // Get all meshes from the scene group
    const allObjects = [];
    sceneGroup.traverse((child) => {
      if (child.isMesh && child.userData && child.userData.id) {
        allObjects.push(child);
      }
    });

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(allObjects, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      
      // Find the mesh (not helper objects)
      let mesh = intersectedObject;
      while (mesh.parent && mesh.parent.type !== 'Scene') {
        mesh = mesh.parent;
      }
      
      if (mesh.userData && mesh.userData.id) {
        this.contextMenuObject = mesh;
        this.contextMenuPosition = { x: event.clientX, y: event.clientY };
        this.contextMenuVisible = true;
        
        // Notify parent component
        this.callbacks.onContextMenuShow && this.callbacks.onContextMenuShow({
          visible: true,
          position: this.contextMenuPosition,
          object: this.contextMenuObject
        });
      }
    }
  }

  hideContextMenu() {
    this.contextMenuVisible = false;
    this.contextMenuObject = null;
    
    // Notify parent component
    this.callbacks.onContextMenuHide && this.callbacks.onContextMenuHide();
  }

  handleContextMenuAction(action) {
    if (!this.contextMenuObject) return;

    switch (action) {
      case 'delete':
        this.modules?.geometryManager?.deleteGeometry(this.contextMenuObject);
        break;
      case 'copy':
        // Copy to clipboard (implement if needed)
        break;
      case 'duplicate':
        this.modules?.geometryManager?.duplicateGeometry(this.contextMenuObject);
        break;
      case 'geometry':
        this.callbacks.onOpenGeometryPanel && this.callbacks.onOpenGeometryPanel(this.contextMenuObject);
        break;
      case 'volume':
        this.callbacks.onOpenVolumePanel && this.callbacks.onOpenVolumePanel(this.contextMenuObject);
        break;
      case 'mesh':
        this.callbacks.onOpenMeshProperties && this.callbacks.onOpenMeshProperties(this.contextMenuObject);
        break;
    }
    
    this.hideContextMenu();
  }
  
  handleToolChange(selectedTool) {
    // Handle tool-specific context menu behavior
    // Context menu behavior doesn't change based on tool
  }
  
  cleanup() {
    // Clean up context menu state
    this.contextMenuVisible = false;
    this.contextMenuObject = null;
    this.contextMenuPosition = { x: 0, y: 0 };
  }
}
