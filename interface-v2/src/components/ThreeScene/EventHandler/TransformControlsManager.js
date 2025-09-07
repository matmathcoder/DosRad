import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class TransformControlsManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.transformControlsRef = null;
    this.modules = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    this.setupTransformControls();
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
  }
  
  cleanup() {
    if (this.transformControlsRef) {
      this.transformControlsRef.dispose();
    }
  }
}
