import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { TransformControlsManager } from './TransformControlsManager.js';
import { VertexHelpersManager } from './VertexHelpersManager.js';
import { RotationManager } from './RotationManager.js';
import { SelectionManager } from './SelectionManager.js';
import { BoxSelectionManager } from './BoxSelectionManager.js';
import { CSGManager } from './CSGManager.js';
import { ContextMenuManager } from './ContextMenuManager.js';
import { DragDropManager } from './DragDropManager.js';
import { KeyboardManager } from './KeyboardManager.js';
import { FloorConstraintManager } from './FloorConstraintManager.js';

export default class EventHandler {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    
    // Movement speed configuration (units per frame)
    this.movementSpeed = 0.02;
    
    this.keyState = {};
    this.modules = null; // Will be set by ThreeScene
    
    // Initialize managers
    this.transformControlsManager = new TransformControlsManager(refs, state, callbacks);
    this.vertexHelpersManager = new VertexHelpersManager(refs, state, callbacks);
    this.rotationManager = new RotationManager(refs, state, callbacks);
    this.selectionManager = new SelectionManager(refs, state, callbacks);
    this.boxSelectionManager = new BoxSelectionManager(refs, state, callbacks);
    this.csgManager = new CSGManager(refs, state, callbacks);
    this.contextMenuManager = new ContextMenuManager(refs, state, callbacks);
    this.dragDropManager = new DragDropManager(refs, state, callbacks);
    this.keyboardManager = new KeyboardManager(refs, state, callbacks);
    this.floorConstraintManager = new FloorConstraintManager(refs, state, callbacks);
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleCanvasMouseMove = this.handleCanvasMouseMove.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.hideContextMenu = this.hideContextMenu.bind(this);
    this.handleContextMenuAction = this.handleContextMenuAction.bind(this);
  }
  
  setModules(modules) {
    this.modules = modules;
    
    // Create a modules object that includes all managers for cross-referencing
    const modulesWithManagers = {
      ...modules,
      transformControlsManager: this.transformControlsManager,
      vertexHelpersManager: this.vertexHelpersManager,
      rotationManager: this.rotationManager,
      selectionManager: this.selectionManager,
      boxSelectionManager: this.boxSelectionManager,
      csgManager: this.csgManager,
      contextMenuManager: this.contextMenuManager,
      dragDropManager: this.dragDropManager,
      keyboardManager: this.keyboardManager,
      floorConstraintManager: this.floorConstraintManager
    };
    
    // Pass modules to all managers
    this.transformControlsManager.setModules(modulesWithManagers);
    this.vertexHelpersManager.setModules(modulesWithManagers);
    this.rotationManager.setModules(modulesWithManagers);
    this.selectionManager.setModules(modulesWithManagers);
    this.boxSelectionManager.setModules(modulesWithManagers);
    this.csgManager.setModules(modulesWithManagers);
    this.contextMenuManager.setModules(modulesWithManagers);
    this.dragDropManager.setModules(modulesWithManagers);
    this.keyboardManager.setModules(modulesWithManagers);
    this.floorConstraintManager.setModules(modulesWithManagers);
  }
  
  initialize() {
    this.transformControlsManager.initialize();
    this.vertexHelpersManager.initialize();
    this.rotationManager.initialize();
    this.selectionManager.initialize();
    this.boxSelectionManager.initialize();
    this.csgManager.initialize();
    this.contextMenuManager.initialize();
    this.dragDropManager.initialize();
    this.keyboardManager.initialize();
    this.floorConstraintManager.initialize();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Remove existing listeners first to avoid duplicates
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    
    if (this.refs.canvasRef.current) {
      this.refs.canvasRef.current.removeEventListener('pointerdown', this.handlePointerDown);
      this.refs.canvasRef.current.removeEventListener('mousemove', this.handleCanvasMouseMove);
      this.refs.canvasRef.current.removeEventListener('pointerup', this.handlePointerUp);
      this.refs.canvasRef.current.removeEventListener('contextmenu', this.handleContextMenu);
    }
    
    // Add listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    if (this.refs.canvasRef.current) {
      this.refs.canvasRef.current.addEventListener('pointerdown', this.handlePointerDown);
      this.refs.canvasRef.current.addEventListener('mousemove', this.handleCanvasMouseMove);
      this.refs.canvasRef.current.addEventListener('pointerup', this.handlePointerUp);
      this.refs.canvasRef.current.addEventListener('contextmenu', this.handleContextMenu);
    }
  }
  
  update() {
    // Handle continuous keyboard movement
    const targetMesh = this.refs.selectedGeometryRef.current;
    if (targetMesh && this.transformControlsManager.transformControlsRef && !this.transformControlsManager.transformControlsRef.dragging) {
      let moved = false;
      
      // Save history before first movement in this session
      if (!targetMesh.userData.movementStarted && (
        this.keyState['ArrowUp'] || this.keyState['ArrowDown'] || this.keyState['ArrowLeft'] || 
        this.keyState['ArrowRight'] || this.keyState['KeyQ'] || this.keyState['KeyE']
      )) {
        targetMesh.userData.movementStarted = true;
      }
      
      // Get camera for camera-relative movement
      const camera = this.modules?.cameraController?.getActiveCamera();
      if (camera) {
        // Calculate camera-relative directions in perpendicular plane
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        
        // Right vector (perpendicular to camera direction and up)
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, camera.up).normalize();
        
        // Up vector in the perpendicular plane (camera's up vector)
        const cameraUp = camera.up.clone().normalize();
        
        // Up/down movement in perpendicular plane
        if (this.keyState['ArrowUp']) { 
          targetMesh.position.addScaledVector(cameraUp, this.movementSpeed); 
          moved = true; 
        }
        if (this.keyState['ArrowDown']) { 
          targetMesh.position.addScaledVector(cameraUp, -this.movementSpeed); 
          moved = true; 
        }
        
        // Left/right movement in perpendicular plane
        if (this.keyState['ArrowLeft']) { 
          targetMesh.position.addScaledVector(cameraRight, -this.movementSpeed); 
          moved = true; 
        }
        if (this.keyState['ArrowRight']) { 
          targetMesh.position.addScaledVector(cameraRight, this.movementSpeed); 
          moved = true; 
        }
      } else {
        // Fallback to world space movement if camera not available
        if (this.keyState['ArrowUp']) { targetMesh.position.z -= this.movementSpeed; moved = true; }
        if (this.keyState['ArrowDown']) { targetMesh.position.z += this.movementSpeed; moved = true; }
        if (this.keyState['ArrowLeft']) { targetMesh.position.x -= this.movementSpeed; moved = true; }
        if (this.keyState['ArrowRight']) { targetMesh.position.x += this.movementSpeed; moved = true; }
      }
      
      // Q/E still move up/down in world space (Y axis)
      if (this.keyState['KeyQ']) { targetMesh.position.y += this.movementSpeed; moved = true; }
      if (this.keyState['KeyE']) { targetMesh.position.y -= this.movementSpeed; moved = true; }
      
      if (moved) {
        // Enforce floor constraint after keyboard movement
        this.floorConstraintManager.enforceFloorConstraint(targetMesh);
        // Update vertex helpers positions
        this.vertexHelpersManager.updateVertexHelpersPositions(targetMesh);
      }
    }
  }
  
  handleKeyDown(event) {
    this.keyState[event.code] = true;
    this.keyboardManager.handleKeyDown(event);
  }
  
  handleKeyUp(event) {
    this.keyState[event.code] = false;
    this.keyboardManager.handleKeyUp(event);
  }
  
  handleCanvasMouseMove(event) {
    // Handle box selection
    if (this.boxSelectionManager.isBoxSelecting && this.boxSelectionManager.mouseDown) {
      const renderer = this.refs.rendererRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      const mousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      this.boxSelectionManager.updateBoxSelection(mousePosition);
      return;
    }
    
    // Handle rotation tool - call updateRotation if actively rotating
    if (this.state.selectedToolRef.current === 'rotate' && this.rotationManager.isRotating) {
      this.rotationManager.updateRotation(event);
      return;
    }
    
    // For resize tool, we need to handle vertex helpers even if they don't exist yet
    if (!this.refs.selectedGeometryRef.current) return;
    
    // If resize tool is active but no vertex helpers exist, create them
    if (this.state.selectedToolRef.current === 'resize' && this.vertexHelpersManager.vertexHelpers.length === 0) {
      this.vertexHelpersManager.createVertexHelpers(this.refs.selectedGeometryRef.current);
      this.vertexHelpersManager.showVertexHelpers();
    }
    
    const renderer = this.refs.rendererRef.current;
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / rect.width) * 2 - 1;
    mouse.y = -(event.clientY / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    if (this.modules?.cameraController) {
      const activeCamera = this.modules.cameraController.getActiveCamera();
      raycaster.setFromCamera(mouse, activeCamera);
    }
    
    const object = this.refs.selectedGeometryRef.current;
    
    // 1. MOVE SELECTED VERTEX HELPERS
    if (this.vertexHelpersManager.SELECTED) {
      this.vertexHelpersManager.resizePlane.position.copy(this.vertexHelpersManager.SELECTED.position);
      this.vertexHelpersManager.resizePlane.lookAt(this.modules?.cameraController?.getActiveCamera().position);
      const intersects = raycaster.intersectObject(this.vertexHelpersManager.resizePlane);
      
      if (intersects.length > 0) {
        if (this.vertexHelpersManager.resizeMode === 'resize') {
          // Calculate distance ratio for scaling (JSFiddle approach)
          const increaseRatio = intersects[0].point.distanceTo(object.position) / 
                               this.vertexHelpersManager.SELECTED.position.distanceTo(object.position);
          
          // Scale the object
          object.scale.multiplyScalar(increaseRatio);
          
          // Update all vertex helpers positions
          this.vertexHelpersManager.updateVertexHelpersPositions(object);
        } else if (this.vertexHelpersManager.resizeMode === 'edit') {
          // Move the vertex helper
          this.vertexHelpersManager.SELECTED.position.copy(intersects[0].point);
        }
      }
      return;
    }
    
    // 2. PICK OBJECTS AND VERTEX HELPERS
    const intersects = raycaster.intersectObjects([object, ...this.vertexHelpersManager.vertexHelpers].filter(Boolean));
    let metObject = false;
    let metVertex = undefined;
    
    for (let i = 0; i < intersects.length; i++) {
      const result = intersects[i].object;
      if (result === object) metObject = true;
      if (result.userData?.type === 'vertex-helper' && !metVertex) metVertex = result;
    }
    
    if (metVertex) {
      if (this.vertexHelpersManager.INTERSECTED !== metVertex) this.vertexHelpersManager.INTERSECTED = metVertex;
      document.body.style.cursor = 'move';
    } else {
      this.vertexHelpersManager.INTERSECTED = null;
      document.body.style.cursor = 'auto';
    }
    
    // Show/hide vertex helpers based on hover (only for resize tool)
    if (this.state.selectedToolRef.current === 'resize') {
      if ((metVertex || metObject) && !this.vertexHelpersManager.mouseDown) {
        object.material.opacity = 0.5;
        this.vertexHelpersManager.showVertexHelpers();
      } else {
        object.material.opacity = 1;
        this.vertexHelpersManager.hideVertexHelpers();
      }
    } else {
      // For other tools, just show/hide based on object hover
      if (metObject && !this.vertexHelpersManager.mouseDown) {
        object.material.opacity = 0.5;
      } else {
        object.material.opacity = 1;
      }
    }
  }

  handlePointerDown(event) {
    const tool = this.state.selectedToolRef.current;
    const isCSGTool = tool && tool.startsWith('csg-');
    
    // Only allow object selection when select, pan, resize, rotate, or target tool is active
    if (!isCSGTool && tool !== 'select' && tool !== 'pan' && tool !== 'resize' && tool !== 'rotate' && tool !== 'target') return;
    
    // For select and resize tools, only allow left mouse button clicks
    if ((tool === 'select' || tool === 'resize') && event.button !== 0) return;
    
    this.vertexHelpersManager.mouseDown = true;
    
    // Store mouse position for box selection
    const renderer = this.refs.rendererRef.current;
    const rect = renderer.domElement.getBoundingClientRect();
    this.boxSelectionManager.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    // Check if we should start box selection (select tool + no Ctrl key + no object clicked)
    if (tool === 'select' && !event.ctrlKey && !event.shiftKey) {
      // Start box selection timer (short delay to distinguish from click)
      this.boxSelectionManager.boxSelectTimer = setTimeout(() => {
        if (this.vertexHelpersManager.mouseDown) {
          this.boxSelectionManager.startBoxSelection(this.boxSelectionManager.mousePosition);
        }
      }, 150); // 150ms delay
    }
    
    // Check if vertex helper was clicked
    if (this.vertexHelpersManager.INTERSECTED && this.vertexHelpersManager.INTERSECTED.userData?.type === 'vertex-helper') {
      // Disable orbit controls during vertex manipulation
      const orbitControls = this.modules?.cameraController?.getOrbitControls();
      if (orbitControls) {
        orbitControls.enabled = false;
      }
      this.vertexHelpersManager.SELECTED = this.vertexHelpersManager.INTERSECTED;
      return;
    }
    
    const pointer = new THREE.Vector2();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    if (this.modules?.cameraController) {
      const activeCamera = this.modules.cameraController.getActiveCamera();
      raycaster.setFromCamera(pointer, activeCamera);
    }
    const geometries = [...this.refs.geometriesRef.current].filter(Boolean);
    const intersects = raycaster.intersectObjects(geometries);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      
      // Handle Shift+Click for volume reduction
      if (event.shiftKey && (tool === 'select' || tool === 'pan')) {
        // Calculate the click point in world coordinates
        const clickPoint = intersects[0].point;
        
        // Perform volume reduction
        if (this.modules?.geometryManager) {
          const reducedMesh = this.modules.geometryManager.reduceVolume(object, clickPoint);
          if (reducedMesh) {
            this.selectionManager.selectGeometry(reducedMesh);
            // Brief visual feedback
            setTimeout(() => {
              if (reducedMesh.material) {
                const originalColor = reducedMesh.userData?.originalColor || 0x404040;
                const lighterColor = this.selectionManager.lightenColor(originalColor, 0.3);
                reducedMesh.material.color.setHex(lighterColor);
              }
            }, 1000);
          }
        }
        return;
      }
      
      // Handle CSG mode
      if (isCSGTool && this.state.csgMode) {
        this.csgManager.handleCSGSelection(object, tool);
        return;
      }
      
      // Regular tool handling
      if (tool === 'target') {
        // Zoom to fit selected object
        if (this.modules?.cameraController) {
          this.modules.cameraController.zoomToFit([object]);
        }
        this.callbacks.onToolSelect && this.callbacks.onToolSelect(null);
      } else if (tool === 'pan') {
        // In pan mode, select the object and attach transform controls
        this.selectionManager.selectGeometry(object, event.ctrlKey);
        // Ensure transform controls are attached to the selected object
        if (this.transformControlsManager.transformControlsRef && this.refs.selectedGeometryRef.current) {
          this.transformControlsManager.transformControlsRef.attach(this.refs.selectedGeometryRef.current);
        }
      } else if (tool === 'resize') {
        // In resize mode, select the object and show vertex helpers
        this.selectionManager.selectGeometry(object, event.ctrlKey);
        // Vertex helpers are already created and shown in selectGeometry for resize tool
      } else if (tool === 'rotate') {
        // In rotate mode, select the object and start rotation
        this.selectionManager.selectGeometry(object, event.ctrlKey);
        this.rotationManager.beginRotation(event);
      } else {
        // Default select tool behavior
        this.selectionManager.selectGeometry(object, event.ctrlKey);
      }
    } else {
      if (!this.state.csgMode) {
        this.selectionManager.deselect();
      }
    }
  }
  
  handlePointerUp(event) {
    this.vertexHelpersManager.mouseDown = false;
    
    // Clear box selection timer
    if (this.boxSelectionManager.boxSelectTimer) {
      clearTimeout(this.boxSelectionManager.boxSelectTimer);
      this.boxSelectionManager.boxSelectTimer = null;
    }
    
    // Handle box selection end
    if (this.boxSelectionManager.isBoxSelecting) {
      this.boxSelectionManager.endBoxSelection();
    }
    
    // Handle rotation end
    if (this.state.selectedToolRef.current === 'rotate') {
      this.rotationManager.endRotation();
      return;
    }
    
    if (this.vertexHelpersManager.SELECTED) {
      // Re-enable orbit controls
      const orbitControls = this.modules?.cameraController?.getOrbitControls();
      if (orbitControls) {
        orbitControls.enabled = true;
      }
      this.vertexHelpersManager.SELECTED = null;
      document.body.style.cursor = 'auto';
    }
  }
  
  handleDragOver(e) {
    this.dragDropManager.handleDragOver(e);
  }
  
  handleDragLeave(e) {
    this.dragDropManager.handleDragLeave(e);
  }
  
  handleDrop(e) {
    this.dragDropManager.handleDrop(e);
  }
  
  handleContextMenu(event) {
    this.contextMenuManager.handleContextMenu(event);
  }

  hideContextMenu() {
    this.contextMenuManager.hideContextMenu();
  }

  handleContextMenuAction(action) {
    this.contextMenuManager.handleContextMenuAction(action);
  }
  
  handleToolChange(selectedTool) {
    this.transformControlsManager.handleToolChange(selectedTool);
    this.vertexHelpersManager.handleToolChange(selectedTool);
    this.rotationManager.handleToolChange(selectedTool);
    this.selectionManager.handleToolChange(selectedTool);
    this.boxSelectionManager.handleToolChange(selectedTool);
    this.csgManager.handleToolChange(selectedTool);
    this.contextMenuManager.handleToolChange(selectedTool);
    this.dragDropManager.handleToolChange(selectedTool);
    this.keyboardManager.handleToolChange(selectedTool);
    this.floorConstraintManager.handleToolChange(selectedTool);
  }
  
  // Public API methods that delegate to appropriate managers
  selectGeometry(object, multiSelect = false) {
    return this.selectionManager.selectGeometry(object, multiSelect);
  }
  
  deselect() {
    return this.selectionManager.deselect();
  }
  
  deleteSelectedGeometry() {
    return this.selectionManager.deleteSelectedGeometry();
  }
  
  duplicateSelectedGeometry() {
    return this.selectionManager.duplicateSelectedGeometry();
  }
  
  createVertexHelpers(object) {
    return this.vertexHelpersManager.createVertexHelpers(object);
  }
  
  showVertexHelpers() {
    return this.vertexHelpersManager.showVertexHelpers();
  }
  
  hideVertexHelpers() {
    return this.vertexHelpersManager.hideVertexHelpers();
  }
  
  removeVertexHelpers() {
    return this.vertexHelpersManager.removeVertexHelpers();
  }
  
  updateVertexHelpersPositions(object) {
    return this.vertexHelpersManager.updateVertexHelpersPositions(object);
  }
  
  enforceFloorConstraint(object) {
    return this.floorConstraintManager.enforceFloorConstraint(object);
  }
  
  enforceFloorConstraintOnAllObjects() {
    return this.floorConstraintManager.enforceFloorConstraintOnAllObjects();
  }
  
  // Access to transform controls for external use
  get transformControlsRef() {
    return this.transformControlsManager.transformControlsRef;
  }
  
  // Access to vertex helpers for external use
  get vertexHelpers() {
    return this.vertexHelpersManager.vertexHelpers;
  }
  
  // Access to selected objects for external use
  get selectedObjects() {
    return this.selectionManager.selectedObjects;
  }
  
  cleanup() {
    // Remove event listeners
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    
    if (this.refs.canvasRef.current) {
      this.refs.canvasRef.current.removeEventListener('pointerdown', this.handlePointerDown);
      this.refs.canvasRef.current.removeEventListener('mousemove', this.handleCanvasMouseMove);
      this.refs.canvasRef.current.removeEventListener('pointerup', this.handlePointerUp);
      this.refs.canvasRef.current.removeEventListener('contextmenu', this.handleContextMenu);
    }
    
    // Clean up all managers
    this.transformControlsManager.cleanup();
    this.vertexHelpersManager.cleanup();
    this.rotationManager.cleanup();
    this.selectionManager.cleanup();
    this.boxSelectionManager.cleanup();
    this.csgManager.cleanup();
    this.contextMenuManager.cleanup();
    this.dragDropManager.cleanup();
    this.keyboardManager.cleanup();
    this.floorConstraintManager.cleanup();
  }
}
