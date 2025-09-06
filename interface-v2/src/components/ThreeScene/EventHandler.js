import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export default class EventHandler {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    
    this.transformControlsRef = null;
    this.keyState = {};
    this.modules = null; // Will be set by ThreeScene
    
    // CSG operation refs
    this.csgSelectedObjects = [];
    this.csgOperation = null;
    
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
  
  // Context menu refs
  this.contextMenuVisible = false;
  this.contextMenuPosition = { x: 0, y: 0 };
  this.contextMenuObject = null;
  
  // Rotation tool refs
  this.isRotating = false;
  this.rotationStartMouse = { x: 0, y: 0 };
  this.rotationStartRotation = { x: 0, y: 0, z: 0 };
  this.rotationSensitivity = 0.01;
    
    // Floor constraint refs
    this.floorLevel = 0; // Grid plane is at Y=0
    this.floorConstraintEnabled = true;
    
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
  }
  
  initialize() {
    this.setupTransformControls();
    this.setupResizeHandler();
    this.setupEventListeners();
  }
  
  setupTransformControls() {
    // Wait for modules to be set before setting up transform controls
    setTimeout(() => {
      try {
        if (this.refs.rendererRef.current && this.modules?.cameraController) {
          const activeCamera = this.modules.cameraController.getActiveCamera();
          
          if (!activeCamera) {
            console.warn('Active camera not available for TransformControls');
            return;
          }
          this.transformControlsRef = new TransformControls(activeCamera, this.refs.rendererRef.current.domElement);
          
          if (!this.transformControlsRef) {
            console.error('Failed to create TransformControls');
            return;
          }
          // Check helper object
          const helper = this.transformControlsRef.getHelper();
          this.transformControlsRef.setMode('translate');
          this.transformControlsRef.setSize(0.8);
          this.transformControlsRef.setSpace('world');
          
          // Set neutral colors for professional appearance
          this.transformControlsRef.setTranslationSnap(0.1);
          this.transformControlsRef.setRotationSnap(0.1);
          this.transformControlsRef.setScaleSnap(0.1);
          
          // Additional configuration for better scale handles visibility
          this.transformControlsRef.showX = true;
          this.transformControlsRef.showY = true;
          this.transformControlsRef.showZ = true;
          
          // Ensure all transform modes work properly
          this.transformControlsRef.setTranslationSnap(0.1);
          this.transformControlsRef.setRotationSnap(0.1);
          this.transformControlsRef.setScaleSnap(0.1);
          
          // Add to scene using getHelper() for Three.js r169+
          if (this.refs.sceneRef.current) {
            const helper = this.transformControlsRef.getHelper();
            if (helper instanceof THREE.Object3D) {
              this.refs.sceneRef.current.add(helper);
            } else {
              console.error('TransformControls helper is not a valid Object3D');
              console.error('Helper type:', typeof helper);
              console.error('Helper constructor:', helper?.constructor);
              return;
            }
          } else {
            console.error('Scene reference not available');
            return;
          }

                  this.transformControlsRef.addEventListener('dragging-changed', (event) => {
          // Disable orbit controls during dragging
          const orbitControls = this.modules.cameraController.getOrbitControls();
          if (orbitControls) {
            orbitControls.enabled = !event.value;
          }
          
          if (event.value) {
            // Save history when dragging starts
            if (this.modules.historyManager) {
              this.modules.historyManager.saveToHistory();
            }
            
            // Show real-time scale feedback during scaling
            if (this.transformControlsRef.getMode() === 'scale' && this.transformControlsRef.object) {
              const object = this.transformControlsRef.object;
            }
          } else {
            // Actions when dragging ends
            if (this.modules.collisionSystem) {
              this.modules.collisionSystem.checkCollisions();
            }
            
            // Enforce floor constraint after dragging
            if (this.transformControlsRef.object) {
              this.enforceFloorConstraint(this.transformControlsRef.object);
            }
            
            if (this.modules.persistenceManager) {
              this.modules.persistenceManager.saveScene();
            }
            
            // Final scale feedback
            if (this.transformControlsRef.getMode() === 'scale' && this.transformControlsRef.object) {
              const object = this.transformControlsRef.object;
            }
          }
        });

          // Make sure gizmo is visible
          this.transformControlsRef.visible = true;
        } else {
          console.warn('Required dependencies not available for TransformControls setup');
        }
      } catch (error) {
        console.error('Error setting up TransformControls:', error);
      }
    }, 100);
  }
  
  setupResizeHandler() {
    // Create invisible plane for dragging (JSFiddle approach)
    const planeGeometry = new THREE.PlaneGeometry(8, 8);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      transparent: true, 
      opacity: 0.1, 
      depthWrite: false, 
      side: THREE.DoubleSide 
    });
    
    this.resizePlane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.resizePlane.visible = false; // Keep invisible by default
    this.resizePlane.userData = { type: 'resize-plane' };
    
    // Add to scene
    if (this.refs.sceneRef.current) {
      this.refs.sceneRef.current.add(this.resizePlane);
    }
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
      console.log('Context menu event listener added');
    } else {
      console.log('Canvas ref not available for event listeners');
    }
  }
  
  update() {
    // Handle continuous keyboard movement
    const targetMesh = this.refs.selectedGeometryRef.current;
    if (targetMesh && this.transformControlsRef && !this.transformControlsRef.dragging) {
      let moved = false;
      
      // Save history before first movement in this session
      if (!targetMesh.userData.movementStarted && (
        this.keyState['ArrowUp'] || this.keyState['ArrowDown'] || this.keyState['ArrowLeft'] || 
        this.keyState['ArrowRight'] || this.keyState['KeyQ'] || this.keyState['KeyE']
      )) {
        // Would need access to historyManager
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
          targetMesh.position.addScaledVector(cameraUp, 0.1); 
          moved = true; 
        }
        if (this.keyState['ArrowDown']) { 
          targetMesh.position.addScaledVector(cameraUp, -0.1); 
          moved = true; 
        }
        
        // Left/right movement in perpendicular plane
        if (this.keyState['ArrowLeft']) { 
          targetMesh.position.addScaledVector(cameraRight, -0.1); 
          moved = true; 
        }
        if (this.keyState['ArrowRight']) { 
          targetMesh.position.addScaledVector(cameraRight, 0.1); 
          moved = true; 
        }
      } else {
        // Fallback to world space movement if camera not available
        if (this.keyState['ArrowUp']) { targetMesh.position.z -= 0.1; moved = true; }
        if (this.keyState['ArrowDown']) { targetMesh.position.z += 0.1; moved = true; }
        if (this.keyState['ArrowLeft']) { targetMesh.position.x -= 0.1; moved = true; }
        if (this.keyState['ArrowRight']) { targetMesh.position.x += 0.1; moved = true; }
      }
      
      // Q/E still move up/down in world space (Y axis)
      if (this.keyState['KeyQ']) { targetMesh.position.y += 0.1; moved = true; }
      if (this.keyState['KeyE']) { targetMesh.position.y -= 0.1; moved = true; }
      
      if (moved) {
        // Enforce floor constraint after keyboard movement
        this.enforceFloorConstraint(targetMesh);
        // Update vertex helpers positions
        this.updateVertexHelpersPositions(targetMesh);
      }
    }
  }
  
  handleKeyDown(event) {
    this.keyState[event.code] = true;
    
    // Handle keyboard shortcuts
    if (event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          // Undo
          event.preventDefault();
          if (this.modules?.historyManager) {
            this.modules.historyManager.undo();
          }
          return;
        case 'y':
          // Redo
          event.preventDefault();
          if (this.modules?.historyManager) {
            this.modules.historyManager.redo();
          }
          return;
        case 'x':
          // Delete selected object
          if (this.refs.selectedGeometryRef.current) {
            event.preventDefault();
            this.deleteSelectedGeometry();
          }
          break;
        case 'g':
          // Toggle Move mode
          event.preventDefault();
          const newTool = this.state.selectedToolRef.current === 'pan' ? 'select' : 'pan';
          this.callbacks.onToolSelect && this.callbacks.onToolSelect(newTool);
          break;
        case 'f':
          // Frame selected object - would need access to cameraController
          if (this.refs.selectedGeometryRef.current) {
            event.preventDefault();
          }
          break;
      }
    } else {
      // Non-Ctrl shortcuts
      switch (event.key) {
        case 'F1':
          event.preventDefault();
          // Toggle help (handled by parent)
          window.dispatchEvent(new CustomEvent('toggleHelp'));
          break;
        case 'Escape':
          if (this.refs.selectedGeometryRef.current) {
            event.preventDefault();
            this.deselect();
          }
          break;
        case ' ':
          event.preventDefault();
          this.callbacks.onToolSelect && this.callbacks.onToolSelect('select');
          break;
        case 'h':
          if (event.shiftKey) {
            // Go to home - would need access to cameraController
            event.preventDefault();
            this.callbacks.onToolSelect && this.callbacks.onToolSelect('home');
          } else {
            // Save home - would need access to cameraController
            event.preventDefault();
            this.callbacks.onToolSelect && this.callbacks.onToolSelect('add-home');
          }
          break;
        case 'f':
          // Frame all objects - would need access to cameraController
          event.preventDefault();
          break;
        case 'p':
          // Toggle perspective - would need access to cameraController
          event.preventDefault();
          this.callbacks.onToolSelect && this.callbacks.onToolSelect('camera');
          break;
      }
    }

    // Handle Ctrl+Alt key combination for rotation in pan mode
    if (event.ctrlKey && event.altKey && this.state.selectedToolRef.current === 'pan' && this.transformControlsRef && this.transformControlsRef.object) {
      this.transformControlsRef.setMode('rotate');
    }
    
    // Handle transform mode switching for select tool
    if (this.state.selectedToolRef.current === 'select' && this.transformControlsRef && this.refs.selectedGeometryRef.current) {
      switch (event.key.toLowerCase()) {
        case 'g':
          // Switch to translate (move) mode
          event.preventDefault();
          this.transformControlsRef.setMode('translate');
          break;
        case 'r':
          // Switch to rotate mode
          event.preventDefault();
          this.transformControlsRef.setMode('rotate');
          break;
        case 's':
          // Switch to scale (resize) mode
          event.preventDefault();
          this.transformControlsRef.setMode('scale');
          break;
        case 'h':
          // Toggle vertex helpers visibility
          event.preventDefault();
          if (this.refs.selectedGeometryRef.current) {
            if (this.vertexHelpers.length > 0 && this.vertexHelpers[0].visible) {
              this.hideVertexHelpers();
              console.log('Vertex helpers hidden');
            } else {
              this.showVertexHelpers();
              console.log('Vertex helpers shown');
            }
          }
          break;
        case 'e':
          // Toggle between resize and edit mode
          event.preventDefault();
          this.resizeMode = this.resizeMode === 'resize' ? 'edit' : 'resize';
          console.log(`Vertex mode switched to: ${this.resizeMode}`);
          break;
        case 'f':
          // Toggle floor constraint
          event.preventDefault();
          this.floorConstraintEnabled = !this.floorConstraintEnabled;
          console.log(`Floor constraint ${this.floorConstraintEnabled ? 'enabled' : 'disabled'}`);
          
          // If re-enabling, enforce constraints on all objects
          if (this.floorConstraintEnabled) {
            this.enforceFloorConstraintOnAllObjects();
          }
          break;
        case 'd':
          // Duplicate selected object (Ctrl+Shift+D)
          if (event.shiftKey) {
            event.preventDefault();
            if (this.refs.selectedGeometryRef.current) {
              this.duplicateSelectedGeometry();
            }
          }
          break;
      }
    }
  }
  
  handleKeyUp(event) {
    this.keyState[event.code] = false;
    
    // Reset movement flag when movement keys are released
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyE'].includes(event.code)) {
      if (this.refs.selectedGeometryRef.current) {
        this.refs.selectedGeometryRef.current.userData.movementStarted = false;
      }
    }
    
    // Switch back to translate when either Ctrl or Alt is released
    if ((event.key === 'Control' || event.key === 'Alt') && this.state.selectedToolRef.current === 'pan' && this.transformControlsRef && this.transformControlsRef.object) {
      this.transformControlsRef.setMode('translate');
    }
  }
  
  handleCanvasMouseMove(event) {
    // Handle rotation tool
    if (this.state.selectedToolRef.current === 'rotate') {
      this.updateRotation(event);
      return;
    }
    
    if (!this.refs.selectedGeometryRef.current || this.vertexHelpers.length === 0) return;
    
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
    if (this.SELECTED) {
      this.resizePlane.position.copy(this.SELECTED.position);
      this.resizePlane.lookAt(this.modules?.cameraController?.getActiveCamera().position);
      const intersects = raycaster.intersectObject(this.resizePlane);
      
      if (intersects.length > 0) {
        if (this.resizeMode === 'resize') {
          // Calculate distance ratio for scaling (JSFiddle approach)
          const increaseRatio = intersects[0].point.distanceTo(object.position) / 
                               this.SELECTED.position.distanceTo(object.position);
          
          // Scale the object
          object.scale.multiplyScalar(increaseRatio);
          
          // Update all vertex helpers positions
          this.updateVertexHelpersPositions(object);
        } else if (this.resizeMode === 'edit') {
          // Move the vertex helper
          this.SELECTED.position.copy(intersects[0].point);
        }
      }
      return;
    }
    
    // 2. PICK OBJECTS AND VERTEX HELPERS
    const intersects = raycaster.intersectObjects([object, ...this.vertexHelpers].filter(Boolean));
    let metObject = false;
    let metVertex = undefined;
    
    for (let i = 0; i < intersects.length; i++) {
      const result = intersects[i].object;
      if (result === object) metObject = true;
      if (result.userData?.type === 'vertex-helper' && !metVertex) metVertex = result;
    }
    
    if (metVertex) {
      if (this.INTERSECTED !== metVertex) this.INTERSECTED = metVertex;
      document.body.style.cursor = 'move';
    } else {
      this.INTERSECTED = null;
      document.body.style.cursor = 'auto';
    }
    
    // Show/hide vertex helpers based on hover (only for resize tool)
    if (this.state.selectedToolRef.current === 'resize') {
      if ((metVertex || metObject) && !this.mouseDown) {
        object.material.opacity = 0.5;
        this.showVertexHelpers();
      } else {
        object.material.opacity = 1;
        this.hideVertexHelpers();
      }
    } else {
      // For other tools, just show/hide based on object hover
      if (metObject && !this.mouseDown) {
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
    
    this.mouseDown = true;
    
    // Check if vertex helper was clicked
    if (this.INTERSECTED && this.INTERSECTED.userData?.type === 'vertex-helper') {
      // Disable orbit controls during vertex manipulation
      const orbitControls = this.modules?.cameraController?.getOrbitControls();
      if (orbitControls) {
        orbitControls.enabled = false;
      }
      this.SELECTED = this.INTERSECTED;
      return;
    }
    
    const renderer = this.refs.rendererRef.current;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    if (this.modules?.cameraController) {
      const activeCamera = this.modules.cameraController.getActiveCamera();
      raycaster.setFromCamera(pointer, activeCamera);
    }
    const intersects = raycaster.intersectObjects([...this.refs.geometriesRef.current].filter(Boolean));

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
            this.selectGeometry(reducedMesh);
            // Brief visual feedback
            setTimeout(() => {
              if (reducedMesh.material) {
                reducedMesh.material.color.set(0x525252); // Back to selected color
              }
            }, 1000);
          }
        }
        return;
      }
      
      // Handle CSG mode
      if (isCSGTool && this.state.csgMode) {
        this.handleCSGSelection(object, tool);
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
        this.selectGeometry(object);
        // Ensure transform controls are attached to the selected object
        if (this.transformControlsRef && this.refs.selectedGeometryRef.current) {
          this.transformControlsRef.attach(this.refs.selectedGeometryRef.current);
        }
      } else if (tool === 'resize') {
        // In resize mode, select the object and show vertex helpers
        this.selectGeometry(object);
        // Vertex helpers are already created and shown in selectGeometry for resize tool
      } else if (tool === 'rotate') {
        // In rotate mode, select the object and start rotation
        this.selectGeometry(object);
        this.startRotation(event);
      } else {
        // Default select tool behavior
        this.selectGeometry(object);
      }
    } else {
      if (!this.state.csgMode) {
        this.deselect();
      }
    }
  }
  
  selectGeometry(object) {
    if (this.refs.selectedGeometryRef.current !== object) {
      this.deselect();
      this.refs.selectedGeometryRef.current = object;
      object.material.color.set(0x525252); // Selected color
      // Ensure object has proper scale for transform controls
      if (object.scale.x === 0 || object.scale.y === 0 || object.scale.z === 0) {
        object.scale.set(1, 1, 1);
      }
      
      // Attach transform controls (only for select, pan, and rotate tools)
      if (this.transformControlsRef && this.state.selectedToolRef.current !== 'resize') {
        this.transformControlsRef.attach(object);
        this.transformControlsRef.visible = true;
        
        // Set appropriate mode based on tool
        if (this.state.selectedToolRef.current === 'rotate') {
          this.transformControlsRef.setMode('rotate');
        } else if (this.state.selectedToolRef.current === 'pan') {
          this.transformControlsRef.setMode('translate');
        } else {
          this.transformControlsRef.setMode('translate');
        }
      } else if (this.state.selectedToolRef.current === 'resize') {
        // For resize tool, ensure transform controls are completely hidden
        this.transformControlsRef.detach();
        this.transformControlsRef.visible = false;
      } else {
        console.warn('Transform controls not available');
      }
      
      // Create vertex helpers for resizing (only create and show if resize tool is active)
      if (this.state.selectedToolRef.current === 'resize') {
        this.createVertexHelpers(object);
        this.showVertexHelpers();
      }
      
      this.callbacks.onSelectionChange && this.callbacks.onSelectionChange(true, object);
    }
  }
  
  deselect() {
    if (this.refs.selectedGeometryRef.current) {
      this.refs.selectedGeometryRef.current.material.color.setHex(this.refs.selectedGeometryRef.current.userData.originalColor);
    }
    this.refs.selectedGeometryRef.current = null;
    if (this.transformControlsRef) {
      this.transformControlsRef.detach();
    }
    
    // Remove vertex helpers
    this.removeVertexHelpers();
    
    this.callbacks.onSelectionChange && this.callbacks.onSelectionChange(false, null);
  }
  
  deleteSelectedGeometry() {
    const mesh = this.refs.selectedGeometryRef.current;
    if (mesh) {
      // Save history state BEFORE deleting
      if (this.modules?.historyManager) {
        this.modules.historyManager.saveToHistory();
      }
      
      // Remove geometry using geometry manager (this will invalidate shadow maps)
      if (this.modules?.geometryManager) {
        this.modules.geometryManager.deleteGeometry(mesh);
      }
      
      // Deselect and clean up transform controls
      this.deselect();
      
      // Auto-save scene after deleting geometry
      if (this.modules?.persistenceManager) {
        this.modules.persistenceManager.saveScene();
      }
    }
  }
  
  duplicateSelectedGeometry() {
    const mesh = this.refs.selectedGeometryRef.current;
    if (mesh && this.modules?.geometryManager) {
      // Save history state BEFORE duplicating
      if (this.modules?.historyManager) {
        this.modules.historyManager.saveToHistory();
      }
      
      // Duplicate the geometry
      const duplicatedMesh = this.modules.geometryManager.duplicateGeometry(mesh);
      
      if (duplicatedMesh) {
        // Select the duplicated object
        this.selectGeometry(duplicatedMesh);
        
        // Auto-save scene after duplicating geometry
        if (this.modules?.persistenceManager) {
          this.modules.persistenceManager.saveScene();
        }
        
        console.log('Object duplicated successfully');
      }
    }
  }
  
  // Rotation tool methods
  startRotation(event) {
    if (this.state.selectedToolRef.current !== 'rotate' || !this.refs.selectedGeometryRef.current) {
      return;
    }
    
    this.isRotating = true;
    this.rotationStartMouse.x = event.clientX;
    this.rotationStartMouse.y = event.clientY;
    
    // Store the initial rotation
    const object = this.refs.selectedGeometryRef.current;
    this.rotationStartRotation.x = object.rotation.x;
    this.rotationStartRotation.y = object.rotation.y;
    this.rotationStartRotation.z = object.rotation.z;
    
    // Disable OrbitControls during rotation
    const orbitControls = this.modules?.cameraController?.getOrbitControls();
    if (orbitControls) {
      orbitControls.enabled = false;
    }
  }
  
  updateRotation(event) {
    if (!this.isRotating || this.state.selectedToolRef.current !== 'rotate' || !this.refs.selectedGeometryRef.current) {
      return;
    }
    
    const deltaX = event.clientX - this.rotationStartMouse.x;
    const deltaY = event.clientY - this.rotationStartMouse.y;
    
    const object = this.refs.selectedGeometryRef.current;
    
    // Calculate new rotation
    const newRotationY = this.rotationStartRotation.y + deltaX * this.rotationSensitivity;
    const newRotationX = this.rotationStartRotation.x + deltaY * this.rotationSensitivity;
    
    // Apply rotation constraints to prevent viewing from below
    const maxRotationX = Math.PI / 2 - 0.1; // Slightly less than 90 degrees
    const minRotationX = -Math.PI / 2 + 0.1; // Slightly more than -90 degrees
    
    // Clamp X rotation to prevent viewing from below
    const clampedRotationX = Math.max(minRotationX, Math.min(maxRotationX, newRotationX));
    
    // Apply the rotation
    object.rotation.y = newRotationY;
    object.rotation.x = clampedRotationX;
    
    // Update the object's matrix
    object.updateMatrix();
    
    // Update transform controls to stay synchronized
    if (this.transformControlsRef && this.transformControlsRef.object === object) {
      // Trigger the change event to update the visual representation
      this.transformControlsRef.dispatchEvent({ type: 'change' });
    }
  }
  
  endRotation() {
    if (!this.isRotating) {
      return;
    }
    
    this.isRotating = false;
    
    // Final synchronization of transform controls
    if (this.transformControlsRef && this.refs.selectedGeometryRef.current) {
      this.transformControlsRef.dispatchEvent({ type: 'change' });
    }
    
    // Re-enable OrbitControls
    const orbitControls = this.modules?.cameraController?.getOrbitControls();
    if (orbitControls) {
      orbitControls.enabled = true;
    }
    
    // Save history state after rotation
    if (this.modules?.historyManager) {
      this.modules.historyManager.saveToHistory();
    }
    
    // Auto-save scene after rotation
    if (this.modules?.persistenceManager) {
      this.modules.persistenceManager.saveScene();
    }
  }
  
  handleCSGSelection(object, tool) {
    // Add object to CSG selection
    if (!this.csgSelectedObjects.includes(object)) {
      this.csgSelectedObjects.push(object);
      
      // Visual feedback - make selected objects glow with different colors
      const selectionCount = this.csgSelectedObjects.length;
      if (selectionCount === 1) {
        object.material.color.set(0x737373); // Handler color for first selection
      } else if (selectionCount === 2) {
        object.material.color.set(0x525252); // Selected color for second selection
      }
      // If we have two objects, perform the operation
      if (selectionCount === 2) {
        const [objectA, objectB] = this.csgSelectedObjects;
        const operation = tool.replace('csg-', '');
        // Perform CSG operation
        if (this.modules?.geometryManager) {
          const result = this.modules.geometryManager.performCSGOperation(operation, objectA, objectB);
          if (result) {
            // Select the new object
            this.selectGeometry(result);
          } else {
            console.warn(`CSG ${operation} operation failed`);
          }
        }
        
        // Reset CSG mode
        this.state.setCsgMode(false);
        this.csgSelectedObjects = [];
        this.csgOperation = null;
        
        // Reset object colors to original
        this.refs.geometriesRef.current.forEach(mesh => {
          if (mesh.material && mesh.userData.originalColor) {
            mesh.material.color.setHex(mesh.userData.originalColor);
          }
        });
        
        this.callbacks.onToolSelect && this.callbacks.onToolSelect('select');
      }
    } else {
    }
  }
  
  handleToolChange(selectedTool) {
    // Handle tool selection changes
    if (this.transformControlsRef) {
      if (selectedTool === 'select' || selectedTool === 'pan') {
        this.transformControlsRef.enabled = true;
        this.transformControlsRef.visible = true;
        
        // Set initial mode based on tool
        if (selectedTool === 'pan') {
          this.transformControlsRef.setMode('translate'); // Start with translate, Ctrl switches to rotate
          // Disable OrbitControls when pan tool is active to prevent interference
          const orbitControls = this.modules?.cameraController?.getOrbitControls();
          if (orbitControls) {
            orbitControls.enabled = false;
          }
        } else if (selectedTool === 'select') {
          // Select tool starts with translate mode
          this.transformControlsRef.setMode('translate');
          // Re-enable OrbitControls for select tool
          const orbitControls = this.modules?.cameraController?.getOrbitControls();
          if (orbitControls) {
            orbitControls.enabled = true;
          }
        } else if (selectedTool === 'resize') {
          // Resize tool - completely hide transform controls, show only vertex helpers
          this.transformControlsRef.enabled = false;
          this.transformControlsRef.visible = false;
          this.transformControlsRef.detach(); // Detach from any selected object
          // Re-enable OrbitControls for resize tool
          const orbitControls = this.modules?.cameraController?.getOrbitControls();
          if (orbitControls) {
            orbitControls.enabled = true;
          }
          // Create and show vertex helpers if an object is selected
          if (this.refs.selectedGeometryRef.current) {
            this.createVertexHelpers(this.refs.selectedGeometryRef.current);
            this.showVertexHelpers();
          }
        } else if (selectedTool === 'rotate') {
          // Rotate tool - show transform controls in rotate mode
          this.transformControlsRef.enabled = true;
          this.transformControlsRef.visible = true;
          this.transformControlsRef.setMode('rotate');
          // Disable OrbitControls when rotate tool is active to prevent interference
          const orbitControls = this.modules?.cameraController?.getOrbitControls();
          if (orbitControls) {
            orbitControls.enabled = false;
          }
          // Hide vertex helpers when using rotate tool
          this.hideVertexHelpers();
        }
      } else {
        this.transformControlsRef.enabled = false;
        // Re-enable OrbitControls for other tools
        const orbitControls = this.modules?.cameraController?.getOrbitControls();
        if (orbitControls) {
          orbitControls.enabled = true;
        }
        // Hide vertex helpers when switching away from resize tool
        this.hideVertexHelpers();
      }
    }

    // Handle special tool actions
    switch (selectedTool) {
      case 'add-home':
        if (this.modules?.cameraController) {
          this.modules.cameraController.saveHomeView();
        }
        // Reset tool selection after action
        setTimeout(() => this.callbacks.onToolSelect && this.callbacks.onToolSelect('select'), 0);
        break;
        
      case 'home':
        if (this.modules?.cameraController) {
          this.modules.cameraController.goToHomeView();
        }
        // Reset tool selection after action
        setTimeout(() => this.callbacks.onToolSelect && this.callbacks.onToolSelect('select'), 0);
        break;
        
      case 'view':
        if (this.modules?.cameraController) {
          this.modules.cameraController.zoomToFit(this.refs.geometriesRef.current);
        }
        // Reset tool selection after action
        setTimeout(() => this.callbacks.onToolSelect && this.callbacks.onToolSelect('select'), 0);
        break;
        
      case 'camera':
        if (this.modules?.cameraController) {
          this.modules.cameraController.togglePerspective();
          
          // Update transform controls camera
          if (this.transformControlsRef) {
            this.transformControlsRef.camera = this.modules.cameraController.getActiveCamera();
          }
        } else {
          console.warn('CameraController not available');
        }
        // Reset tool selection after action
        setTimeout(() => this.callbacks.onToolSelect && this.callbacks.onToolSelect('select'), 0);
        break;
    }

    // Handle CSG operations
    if (selectedTool && selectedTool.startsWith('csg-')) {
      const operation = selectedTool.replace('csg-', '');
      this.csgOperation = operation;
      this.state.setCsgMode(true);
      this.csgSelectedObjects = [];
      
      // Clear any existing selections
      this.deselect();
      // Visual feedback - highlight all objects to show they're selectable
      this.refs.geometriesRef.current.forEach(mesh => {
        if (mesh.material) {
          // Store original color if not already stored
          if (!mesh.userData.originalColor) {
            mesh.userData.originalColor = mesh.material.color.getHex();
          }
          // Make objects slightly brighter to indicate they're selectable
          mesh.material.color.setHex(0x737373); // Handler color for selectable
        }
      });
    }
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
          this.enforceFloorConstraint(mesh);
          this.selectGeometry(mesh);
        }
      }
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
  }
  
  hideVertexHelpers() {
    this.vertexHelpers.forEach(helper => {
      helper.visible = false;
    });
    if (this.wireframeBox) {
      this.wireframeBox.visible = false;
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
  
  handlePointerUp(event) {
    this.mouseDown = false;
    
    // Handle rotation end
    if (this.state.selectedToolRef.current === 'rotate') {
      this.endRotation();
    }
    
    if (this.SELECTED) {
      // Re-enable orbit controls
      const orbitControls = this.modules?.cameraController?.getOrbitControls();
      if (orbitControls) {
        orbitControls.enabled = true;
      }
      this.SELECTED = null;
      document.body.style.cursor = 'auto';
    }
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
    
    console.log(`Resized object: ${newWidth.toFixed(2)} x ${newHeight.toFixed(2)} x ${newDepth.toFixed(2)}`);
  }
  
  // Floor constraint methods
  enforceFloorConstraint(object) {
    if (!this.floorConstraintEnabled || !object) return;
    
    // Get object bounding box
    const boundingBox = new THREE.Box3().setFromObject(object);
    const objectBottom = boundingBox.min.y;
    
    // If object bottom is below floor level, move it up
    if (objectBottom < this.floorLevel) {
      const offset = this.floorLevel - objectBottom;
      object.position.y += offset;
      console.log(`Floor constraint: Moved object up by ${offset.toFixed(2)} units`);
    }
  }
  
  enforceFloorConstraintOnAllObjects() {
    if (!this.floorConstraintEnabled) return;
    
    this.refs.geometriesRef.current.forEach(object => {
      this.enforceFloorConstraint(object);
    });
  }

  // Context Menu Methods
  handleContextMenu(event) {
    event.preventDefault();
    console.log('Right-click detected');
    
    // Get mouse position
    const rect = this.refs.canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast to find intersected object
    const raycaster = new THREE.Raycaster();
    const camera = this.modules?.cameraController?.getActiveCamera();
    
    if (!camera) {
      console.log('No camera found');
      return;
    }

    // Get all objects from the scene group
    const sceneGroup = this.refs.sceneGroupRef.current;
    if (!sceneGroup) {
      console.log('No scene group found');
      return;
    }

    // Get all meshes from the scene group
    const allObjects = [];
    sceneGroup.traverse((child) => {
      if (child.isMesh && child.userData && child.userData.id) {
        allObjects.push(child);
      }
    });

    console.log('Available objects for raycasting:', allObjects.length);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(allObjects, true);

    console.log('Raycast intersects:', intersects.length);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      console.log('Intersected object:', intersectedObject);
      console.log('Object userData:', intersectedObject.userData);
      
      // Find the mesh (not helper objects)
      let mesh = intersectedObject;
      while (mesh.parent && mesh.parent.type !== 'Scene') {
        mesh = mesh.parent;
      }
      
      if (mesh.userData && mesh.userData.id) {
        console.log('Valid mesh found, showing context menu');
        this.contextMenuObject = mesh;
        this.contextMenuPosition = { x: event.clientX, y: event.clientY };
        this.contextMenuVisible = true;
        
        // Notify parent component
        this.callbacks.onContextMenuShow && this.callbacks.onContextMenuShow({
          visible: true,
          position: this.contextMenuPosition,
          object: this.contextMenuObject
        });
      } else {
        console.log('Mesh does not have valid userData.id');
      }
    } else {
      console.log('No objects intersected');
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
        console.log('Copy object:', this.contextMenuObject);
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
    
    // Clean up vertex helpers
    this.removeVertexHelpers();
    
    if (this.transformControlsRef) {
      this.transformControlsRef.dispose();
    }
  }
}
