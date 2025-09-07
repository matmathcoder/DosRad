export class KeyboardManager {
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
  
  cleanup() {
    // Clean up keyboard state
    // No persistent state to clean up
  }
}
