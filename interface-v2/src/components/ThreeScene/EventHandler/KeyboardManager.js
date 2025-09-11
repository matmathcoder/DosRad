import * as THREE from 'three';

export class KeyboardManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    this.copiedObject = null; // Store copied object data
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    // Keyboard manager initialization
  }
  
  handleKeyDown(event) {
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
            if (this.modules?.selectionManager) {
              this.modules.selectionManager.deleteSelectedGeometry();
            }
          }
          break;
        case 'c':
          // Copy selected object
          if (this.refs.selectedGeometryRef.current) {
            event.preventDefault();
            this.copySelectedObject();
          }
          break;
        case 'v':
          // Paste copied object
          event.preventDefault();
          this.pasteObject();
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
            if (this.modules?.selectionManager) {
              this.modules.selectionManager.deselect();
            }
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
    if (event.ctrlKey && event.altKey && this.state.selectedToolRef.current === 'pan' && this.modules?.transformControlsManager?.transformControlsRef && this.modules.transformControlsManager.transformControlsRef.object) {
      this.modules.transformControlsManager.transformControlsRef.setMode('rotate');
    }
    
    // Handle transform mode switching for select tool
    if (this.state.selectedToolRef.current === 'select' && this.modules?.transformControlsManager?.transformControlsRef && this.refs.selectedGeometryRef.current) {
      switch (event.key.toLowerCase()) {
        case 'g':
          // Switch to translate (move) mode
          event.preventDefault();
          this.modules.transformControlsManager.transformControlsRef.setMode('translate');
          break;
        case 'r':
          // Switch to rotate mode
          event.preventDefault();
          this.modules.transformControlsManager.transformControlsRef.setMode('rotate');
          break;
        case 's':
          // Switch to scale (resize) mode
          event.preventDefault();
          this.modules.transformControlsManager.transformControlsRef.setMode('scale');
          break;
        case 'h':
          // Toggle vertex helpers visibility
          event.preventDefault();
          if (this.refs.selectedGeometryRef.current) {
            if (this.modules?.vertexHelpersManager) {
              if (this.modules.vertexHelpersManager.vertexHelpers.length > 0 && this.modules.vertexHelpersManager.vertexHelpers[0].visible) {
                this.modules.vertexHelpersManager.hideVertexHelpers();
              } else {
                this.modules.vertexHelpersManager.showVertexHelpers();
              }
            }
          }
          break;
        case 'e':
          // Toggle between resize and edit mode
          event.preventDefault();
          if (this.modules?.vertexHelpersManager) {
            this.modules.vertexHelpersManager.resizeMode = this.modules.vertexHelpersManager.resizeMode === 'resize' ? 'edit' : 'resize';
          }
          break;
        case 'f':
          // Toggle floor constraint
          event.preventDefault();
          if (this.modules?.floorConstraintManager) {
            this.modules.floorConstraintManager.floorConstraintEnabled = !this.modules.floorConstraintManager.floorConstraintEnabled;
            
            // If re-enabling, enforce constraints on all objects
            if (this.modules.floorConstraintManager.floorConstraintEnabled) {
              this.modules.floorConstraintManager.enforceFloorConstraintOnAllObjects();
            }
          }
          break;
        case 'd':
          // Duplicate selected object (Ctrl+Shift+D)
          if (event.shiftKey) {
            event.preventDefault();
            if (this.refs.selectedGeometryRef.current) {
              if (this.modules?.selectionManager) {
                this.modules.selectionManager.duplicateSelectedGeometry();
              }
            }
          }
          break;
      }
    }
  }
  
  handleKeyUp(event) {
    // Switch back to translate when either Ctrl or Alt is released
    if ((event.key === 'Control' || event.key === 'Alt') && this.state.selectedToolRef.current === 'pan' && this.modules?.transformControlsManager?.transformControlsRef && this.modules.transformControlsManager.transformControlsRef.object) {
      this.modules.transformControlsManager.transformControlsRef.setMode('translate');
    }
  }
  
  handleToolChange(selectedTool) {
    // Handle tool-specific keyboard behavior
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
          if (this.modules?.transformControlsManager?.transformControlsRef) {
            this.modules.transformControlsManager.transformControlsRef.camera = this.modules.cameraController.getActiveCamera();
          }
        } else {
          console.warn('CameraController not available');
        }
        // Reset tool selection after action
        setTimeout(() => this.callbacks.onToolSelect && this.callbacks.onToolSelect('select'), 0);
        break;
    }
  }
  
  copySelectedObject() {
    const selectedObject = this.refs.selectedGeometryRef.current;
    if (!selectedObject) return;

    // Get current transformed dimensions
    const boundingBox = new THREE.Box3().setFromObject(selectedObject);
    const size = boundingBox.getSize(new THREE.Vector3());

    // Create a complete copy of the object data with exact current state
    this.copiedObject = {
      type: selectedObject.userData.type,
      position: {
        x: selectedObject.position.x,
        y: selectedObject.position.y,
        z: selectedObject.position.z
      },
      rotation: {
        x: selectedObject.rotation.x,
        y: selectedObject.rotation.y,
        z: selectedObject.rotation.z
      },
      scale: {
        x: selectedObject.scale.x,
        y: selectedObject.scale.y,
        z: selectedObject.scale.z
      },
      // Current transformed dimensions
      currentDimensions: {
        width: size.x,
        height: size.y,
        depth: size.z
      },
      material: {
        color: selectedObject.material.color.getHex(),
        opacity: selectedObject.material.opacity,
        transparent: selectedObject.material.transparent
      },
      geometryParameters: this.getGeometryParameters(selectedObject),
      userData: { ...selectedObject.userData },
      // Include all volume data for complete persistence
      volume: {
        type: selectedObject.userData.volumeType || 'Unknown',
        composition: selectedObject.userData.composition || null,
        realDensity: selectedObject.userData.realDensity || 0,
        tolerance: selectedObject.userData.tolerance || 0,
        isSource: selectedObject.userData.isSource || false,
        calculation: selectedObject.userData.calculation || null,
        gammaSelectionMode: selectedObject.userData.gammaSelectionMode || null,
        spectrum: selectedObject.userData.spectrum || null
      }
    };

    // Visual feedback for copy (simplified to avoid renderer issues)
    console.log('Object copied successfully with exact dimensions:', this.copiedObject.currentDimensions);
  }

  pasteObject() {
    if (!this.copiedObject) {
      console.log('No object to paste');
      return;
    }

    // Use GeometryManager to create the object properly
    if (this.modules?.geometryManager) {
      // Convert copied object data to the format expected by createGeometryFromData
      const objData = {
        type: this.copiedObject.type,
        geometry: {
          type: this.copiedObject.type,
          parameters: this.copiedObject.geometryParameters || {}
        },
        position: { x: 0, y: 1, z: 0 }, // Center of scene, above grid
        rotation: this.copiedObject.rotation,
        scale: this.copiedObject.scale,
        userData: {
          ...this.copiedObject.userData,
          // Generate new unique ID for the pasted object
          id: Date.now() + Math.random(),
          volumeName: `${this.copiedObject.userData.volumeName || 'Object'}_Copy_${Date.now()}`
        },
        volume: this.copiedObject.volume || {
          type: this.copiedObject.userData.volumeType || 'Unknown',
          composition: this.copiedObject.userData.composition || null,
          realDensity: this.copiedObject.userData.realDensity || 0,
          tolerance: this.copiedObject.userData.tolerance || 0,
          isSource: this.copiedObject.userData.isSource || false,
          calculation: this.copiedObject.userData.calculation || null,
          gammaSelectionMode: this.copiedObject.userData.gammaSelectionMode || null,
          spectrum: this.copiedObject.userData.spectrum || null
        },
        visible: this.copiedObject.userData.visible !== false,
        name: this.copiedObject.userData.volumeName || `Copy_${Date.now()}`,
        // Include current dimensions for reference
        currentDimensions: this.copiedObject.currentDimensions
      };

      // Create the object using GeometryManager
      const newObject = this.modules.geometryManager.createGeometryFromData(objData);
      if (!newObject) {
        console.log('Failed to create object from copied data');
        return;
      }

      console.log('Object created and added to scene:', newObject);

      // Notify parent component about the new geometry (for directory update)
      if (this.callbacks.onGeometryCreated) {
        this.callbacks.onGeometryCreated(newObject);
      }

      // Select the new object
      this.refs.selectedGeometryRef.current = newObject;
      
      // Use the selection manager to properly select the object
      if (this.modules?.selectionManager) {
        this.modules.selectionManager.selectGeometry(newObject);
      } else if (this.callbacks.onSelectionChange) {
        this.callbacks.onSelectionChange(true, newObject);
      }

      // Visual feedback for paste (simplified to avoid renderer issues)
      console.log('Object pasted successfully');
    } else {
      console.log('GeometryManager not available');
    }
  }

  getGeometryParameters(mesh) {
    // Extract geometry parameters based on the geometry type
    const geometry = mesh.geometry;
    const userData = mesh.userData;
    
    // Check if we have custom parameters in userData first
    if (userData.parameters) {
      return userData.parameters;
    }
    
    // Extract parameters from the actual geometry
    switch (mesh.userData.type) {
      case 'cube':
        if (geometry.parameters) {
          return {
            width: geometry.parameters.width,
            height: geometry.parameters.height,
            depth: geometry.parameters.depth
          };
        }
        break;
      case 'sphere':
        if (geometry.parameters) {
          return {
            radius: geometry.parameters.radius,
            widthSegments: geometry.parameters.widthSegments,
            heightSegments: geometry.parameters.heightSegments
          };
        }
        break;
      case 'cylinder':
        if (geometry.parameters) {
          return {
            radiusTop: geometry.parameters.radiusTop,
            radiusBottom: geometry.parameters.radiusBottom,
            height: geometry.parameters.height,
            radialSegments: geometry.parameters.radialSegments
          };
        }
        break;
      case 'cone':
        if (geometry.parameters) {
          return {
            radius: geometry.parameters.radius,
            height: geometry.parameters.height,
            radialSegments: geometry.parameters.radialSegments
          };
        }
        break;
    }
    
    // Fallback to default parameters if we can't extract them
    return this.getDefaultGeometryParameters(mesh.userData.type);
  }

  getDefaultGeometryParameters(type) {
    switch (type) {
      case 'cube':
        return { width: 1, height: 1, depth: 1 };
      case 'sphere':
        return { radius: 0.5, widthSegments: 32, heightSegments: 32 };
      case 'cylinder':
        return { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 };
      case 'cone':
        return { radius: 0.5, height: 1, radialSegments: 32 };
      default:
        return {};
    }
  }


  cleanup() {
    // Clean up keyboard state
    this.copiedObject = null;
  }
}
