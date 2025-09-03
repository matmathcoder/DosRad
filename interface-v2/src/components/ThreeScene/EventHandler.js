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
    
    // Floor constraint refs
    this.floorLevel = 0; // Grid plane is at Y=0
    this.floorConstraintEnabled = true;
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
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
    // Create resize handler geometry and material
    const handlerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const handlerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.8 
    });
    
    this.resizeHandlerRef = new THREE.Mesh(handlerGeometry, handlerMaterial);
    this.resizeHandlerRef.visible = false;
    this.resizeHandlerRef.userData = { type: 'resize-handler' };
    
    // Add to scene
    if (this.refs.sceneRef.current) {
      this.refs.sceneRef.current.add(this.resizeHandlerRef);
    }
  }
  
  setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    if (this.refs.canvasRef.current) {
      this.refs.canvasRef.current.addEventListener('pointerdown', this.handlePointerDown);
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
      
      if (this.keyState['ArrowUp']) { targetMesh.position.z -= 0.1; moved = true; }
      if (this.keyState['ArrowDown']) { targetMesh.position.z += 0.1; moved = true; }
      if (this.keyState['ArrowLeft']) { targetMesh.position.x -= 0.1; moved = true; }
      if (this.keyState['ArrowRight']) { targetMesh.position.x += 0.1; moved = true; }
      if (this.keyState['KeyQ']) { targetMesh.position.y += 0.1; moved = true; }
      if (this.keyState['KeyE']) { targetMesh.position.y -= 0.1; moved = true; }
      
      if (moved) {
        // Enforce floor constraint after keyboard movement
        this.enforceFloorConstraint(targetMesh);
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
          // Toggle custom resize handler mode
          event.preventDefault();
          if (this.refs.selectedGeometryRef.current) {
            // Toggle between TransformControls and custom resize handler
            if (this.transformControlsRef.visible) {
              this.transformControlsRef.visible = false;
              this.resizeHandlerRef.visible = true;
              console.log('Custom resize handler mode activated');
            } else {
              this.transformControlsRef.visible = true;
              this.resizeHandlerRef.visible = false;
              console.log('TransformControls mode activated');
            }
          }
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
          // Ensure scale handles are properly configured
          if (this.transformControlsRef) {
            // Force update of the transform controls
            this.transformControlsRef.update();
            
            // Additional debugging for scale mode
            // Check if scale handles are actually present in the scene
            const scaleHandles = this.transformControlsRef.children.filter(child => 
              child.name && child.name.includes('scale')
            );
            // Provide user feedback about scale mode
            if (this.refs.selectedGeometryRef.current) {
              const selectedObject = this.refs.selectedGeometryRef.current;
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
  
  handlePointerDown(event) {
    const tool = this.state.selectedToolRef.current;
    const isCSGTool = tool && tool.startsWith('csg-');
    
    // Only allow object selection when select tool is active
    if (!isCSGTool && tool !== 'select' && tool !== 'pan' && tool !== 'target') return;
    
    // For select tool, only allow left mouse button clicks
    if (tool === 'select' && event.button !== 0) return;
    
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
    const intersects = raycaster.intersectObjects([...this.refs.geometriesRef.current, this.resizeHandlerRef].filter(Boolean));

    if (intersects.length > 0) {
      const object = intersects[0].object;
      
      // Check if resize handler was clicked
      if (object.userData?.type === 'resize-handler') {
        this.startResize(event);
        return;
      }
      
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
                reducedMesh.material.color.set(0x00ff00); // Back to green selection
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
      } else {
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
      object.material.color.set(0x00ff00);
      // Ensure object has proper scale for transform controls
      if (object.scale.x === 0 || object.scale.y === 0 || object.scale.z === 0) {
        object.scale.set(1, 1, 1);
      }
      
      // Attach transform controls
      if (this.transformControlsRef) {
        this.transformControlsRef.attach(object);
        this.transformControlsRef.visible = true;
      } else {
        console.warn('Transform controls not available');
      }
      
      // Show custom resize handler
      this.showResizeHandler(object);
      
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
    
    // Hide custom resize handler
    this.hideResizeHandler();
    
    this.callbacks.onSelectionChange && this.callbacks.onSelectionChange(false, null);
  }
  
  deleteSelectedGeometry() {
    const mesh = this.refs.selectedGeometryRef.current;
    if (mesh) {
      // Save history state BEFORE deleting
      if (this.modules?.historyManager) {
        this.modules.historyManager.saveToHistory();
      }
      
      // Remove geometry using geometry manager
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
  
  handleCSGSelection(object, tool) {
    // Add object to CSG selection
    if (!this.csgSelectedObjects.includes(object)) {
      this.csgSelectedObjects.push(object);
      
      // Visual feedback - make selected objects glow with different colors
      const selectionCount = this.csgSelectedObjects.length;
      if (selectionCount === 1) {
        object.material.color.set(0xffff00); // Yellow for first selection
      } else if (selectionCount === 2) {
        object.material.color.set(0xff6600); // Orange for second selection
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
        }
      } else {
        this.transformControlsRef.enabled = false;
        // Re-enable OrbitControls for other tools
        const orbitControls = this.modules?.cameraController?.getOrbitControls();
        if (orbitControls) {
          orbitControls.enabled = true;
        }
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
          mesh.material.color.setHex(0x666666);
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
  
  // Custom resize handler methods
  showResizeHandler(object) {
    if (!this.resizeHandlerRef || !object) return;
    
    // Position handler at the corner of the object
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());
    
    // Position handler at the top-right-front corner
    this.resizeHandlerRef.position.set(
      center.x + size.x / 2,
      center.y + size.y / 2,
      center.z + size.z / 2
    );
    
    this.resizeHandlerRef.visible = true;
  }
  
  hideResizeHandler() {
    if (this.resizeHandlerRef) {
      this.resizeHandlerRef.visible = false;
    }
  }
  
  startResize(event) {
    if (!this.resizeHandlerRef || !this.refs.selectedGeometryRef.current) return;
    
    this.isResizing = true;
    
    // Create resize plane
    const object = this.refs.selectedGeometryRef.current;
    const camera = this.modules?.cameraController?.getActiveCamera();
    
    if (!camera) return;
    
    // Create plane perpendicular to camera view direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    this.resizePlane = new THREE.Plane();
    this.resizePlane.setFromNormalAndCoplanarPoint(
      cameraDirection,
      this.resizeHandlerRef.position
    );
    
    // Store start point and dimensions
    this.resizeStartPoint = this.resizeHandlerRef.position.clone();
    this.resizeStartDimensions = {
      width: object.geometry.parameters?.width || 1,
      height: object.geometry.parameters?.height || 1,
      depth: object.geometry.parameters?.depth || 1
    };
    
    // Add event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }
  
  handleMouseMove(event) {
    if (!this.isResizing || !this.resizePlane || !this.refs.selectedGeometryRef.current) return;
    
    const camera = this.modules?.cameraController?.getActiveCamera();
    if (!camera) return;
    
    // Calculate mouse position in 3D space
    const mouse = new THREE.Vector2();
    const rect = this.refs.rendererRef.current.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersection with resize plane
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(this.resizePlane, intersection);
    
    if (intersection) {
      // Calculate resize factor based on distance from start point
      const distance = intersection.distanceTo(this.resizeStartPoint);
      const resizeFactor = 1 + distance * 0.1; // Adjust sensitivity
      
      // Resize the object by creating new geometry
      this.resizeObject(resizeFactor);
      
      // Update handler position
      this.resizeHandlerRef.position.copy(intersection);
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
  
  cleanup() {
    // Remove event listeners
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    
    if (this.refs.canvasRef.current) {
      this.refs.canvasRef.current.removeEventListener('pointerdown', this.handlePointerDown);
    }
    
    if (this.transformControlsRef) {
      this.transformControlsRef.dispose();
    }
  }
}
