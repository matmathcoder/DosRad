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
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    this.setupTransformControls();
    this.setupEventListeners();
  }
  
  setupTransformControls() {
    // Wait for modules to be set before setting up transform controls
    setTimeout(() => {
      if (this.refs.rendererRef.current && this.modules?.cameraController) {
        const activeCamera = this.modules.cameraController.getActiveCamera();
        this.transformControlsRef = new TransformControls(activeCamera, this.refs.rendererRef.current.domElement);
        this.transformControlsRef.setMode('translate');
        this.transformControlsRef.setSize(0.8);
        this.transformControlsRef.setSpace('world');
        this.refs.sceneRef.current.add(this.transformControlsRef);

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
          } else {
            // Actions when dragging ends
            if (this.modules.collisionSystem) {
              this.modules.collisionSystem.checkCollisions();
            }
            if (this.modules.persistenceManager) {
              this.modules.persistenceManager.saveScene();
            }
          }
        });

        // Make sure gizmo is visible
        this.transformControlsRef.visible = true;
      }
    }, 100);
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
        console.log('Should save history before movement');
        targetMesh.userData.movementStarted = true;
      }
      
      if (this.keyState['ArrowUp']) { targetMesh.position.z -= 0.1; moved = true; }
      if (this.keyState['ArrowDown']) { targetMesh.position.z += 0.1; moved = true; }
      if (this.keyState['ArrowLeft']) { targetMesh.position.x -= 0.1; moved = true; }
      if (this.keyState['ArrowRight']) { targetMesh.position.x += 0.1; moved = true; }
      if (this.keyState['KeyQ']) { targetMesh.position.y += 0.1; moved = true; }
      if (this.keyState['KeyE']) { targetMesh.position.y -= 0.1; moved = true; }
      
      if (moved) {
        // Would need access to collisionSystem and persistenceManager
        console.log('Should check collisions and auto-save');
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
            console.log('Should frame selected object');
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
          console.log('Should frame all objects');
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
    
    if (!isCSGTool && tool !== 'select' && tool !== 'pan' && tool !== 'target') return;
    
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
    const intersects = raycaster.intersectObjects(this.refs.geometriesRef.current);

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
      
      // Attach transform controls
      if (this.transformControlsRef) {
        this.transformControlsRef.attach(object);
        this.transformControlsRef.visible = true;
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
      
      // Visual feedback - make selected objects glow
      object.material.color.set(0xffff00); // Yellow for CSG selection
      
      const selectionCount = this.csgSelectedObjects.length;
      
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
          }
        }
        
        // Reset CSG mode
        this.state.setCsgMode(false);
        this.csgSelectedObjects = [];
        this.csgOperation = null;
        this.callbacks.onToolSelect && this.callbacks.onToolSelect('select');
      }
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
        } else {
          this.transformControlsRef.setMode('translate'); // Select tool uses translate
        }
      } else {
        this.transformControlsRef.enabled = false;
        // Don't hide the gizmo, just disable interaction
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
          this.selectGeometry(mesh);
        }
      }
    }
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
