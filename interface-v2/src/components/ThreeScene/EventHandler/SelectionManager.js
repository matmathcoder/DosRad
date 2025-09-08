import * as THREE from 'three';

export class SelectionManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    
    // Multi-selection state
    this.selectedObjects = new Set();
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    // Selection manager initialization
  }
  
  selectGeometry(object, multiSelect = false) {
    if (multiSelect) {
      // Multi-selection mode: toggle selection
      this.toggleSelection(object);
    } else {
      // Single selection mode: clear previous selection and select new object
      this.clearSelection();
      this.addToSelection(object);
    }
    
    // Update transform controls for single selection
    if (this.selectedObjects.size === 1) {
      const selectedObject = Array.from(this.selectedObjects)[0];
      this.refs.selectedGeometryRef.current = selectedObject;
      
      // Ensure object has proper scale for transform controls
      if (selectedObject.scale.x === 0 || selectedObject.scale.y === 0 || selectedObject.scale.z === 0) {
        selectedObject.scale.set(1, 1, 1);
      }
      
      // Attach transform controls (only for select, pan, and rotate tools)
      if (this.modules?.transformControlsManager?.transformControlsRef && this.state.selectedToolRef.current !== 'resize') {
        // Try immediate attachment first
        this.attachTransformControlsImmediate(selectedObject);
        
        // Use a small delay to ensure object is fully added to scene graph
        setTimeout(() => {
          // Check if object is in the scene graph before attaching
          if (this.refs.sceneGroupRef.current && this.refs.sceneGroupRef.current.children.includes(selectedObject)) {
            this.modules.transformControlsManager.transformControlsRef.attach(selectedObject);
            this.modules.transformControlsManager.transformControlsRef.visible = true;
          } else {
            console.warn('Cannot attach TransformControls: object not in scene graph');
            // Try to attach anyway - sometimes the object is there but not detected
            try {
              this.modules.transformControlsManager.transformControlsRef.attach(selectedObject);
              this.modules.transformControlsManager.transformControlsRef.visible = true;
            } catch (error) {
              console.warn('Failed to attach TransformControls:', error);
            }
          }
          // Set appropriate mode based on tool
          if (this.state.selectedToolRef.current === 'rotate') {
            this.modules.transformControlsManager.transformControlsRef.setMode('rotate');
          } else if (this.state.selectedToolRef.current === 'pan') {
            this.modules.transformControlsManager.transformControlsRef.setMode('translate');
          } else {
            this.modules.transformControlsManager.transformControlsRef.setMode('translate');
          }
        }, 10); // Small delay to ensure object is in scene graph
      } else if (this.state.selectedToolRef.current === 'resize') {
        // For resize tool, ensure transform controls are completely hidden
        if (this.modules?.transformControlsManager?.transformControlsRef) {
          this.modules.transformControlsManager.transformControlsRef.detach();
          this.modules.transformControlsManager.transformControlsRef.visible = false;
        }
      } else {
        console.warn('Transform controls not available');
      }
      
      // Create vertex helpers for resizing (only create and show if resize tool is active)
      if (this.state.selectedToolRef.current === 'resize') {
        if (this.modules?.vertexHelpersManager) {
          this.modules.vertexHelpersManager.createVertexHelpers(selectedObject);
          this.modules.vertexHelpersManager.showVertexHelpers();
        }
      }
    } else {
      // Multi-selection: detach transform controls
      if (this.modules?.transformControlsRef) {
        this.modules.transformControlsRef.detach();
        this.modules.transformControlsRef.visible = false;
      }
      this.refs.selectedGeometryRef.current = null;
    }
  }
  
  deselect() {
    this.clearSelection();
    this.refs.selectedGeometryRef.current = null;
    if (this.modules?.transformControlsManager?.transformControlsRef) {
      this.modules.transformControlsManager.transformControlsRef.detach();
    }
  }
  
  detachTransformControls() {
    if (this.modules?.transformControlsManager?.transformControlsRef) {
      this.modules.transformControlsManager.transformControlsRef.detach();
      this.modules.transformControlsManager.transformControlsRef.visible = false;
    }
    
    // Remove vertex helpers
    if (this.modules?.vertexHelpersManager) {
      this.modules.vertexHelpersManager.removeVertexHelpers();
    }
    
    this.callbacks.onSelectionChange && this.callbacks.onSelectionChange(false, null);
  }
  
  // Multi-selection methods
  addToSelection(object) {
    if (!this.selectedObjects.has(object)) {
      this.selectedObjects.add(object);
      this.highlightObject(object, true);
      this.updateSelectionCallbacks();
    }
  }
  
  removeFromSelection(object) {
    if (this.selectedObjects.has(object)) {
      this.selectedObjects.delete(object);
      this.highlightObject(object, false);
      this.updateSelectionCallbacks();
    }
  }
  
  toggleSelection(object) {
    if (this.selectedObjects.has(object)) {
      this.removeFromSelection(object);
    } else {
      this.addToSelection(object);
    }
  }
  
  clearSelection() {
    this.selectedObjects.forEach(object => {
      this.highlightObject(object, false);
    });
    this.selectedObjects.clear();
    this.updateSelectionCallbacks();
  }
  
  highlightObject(object, selected) {
    if (selected) {
      // Use a lighter version of the original color for selection
      const originalColor = object.userData?.originalColor || 0x404040;
      const lighterColor = this.lightenColor(originalColor, 0.3); // 30% lighter
      object.material.color.setHex(lighterColor);
    } else {
      // Restore original color
      if (object.userData?.originalColor) {
        object.material.color.setHex(object.userData.originalColor);
      } else {
        object.material.color.set(0x404040); // Default color
      }
    }
  }

  // Helper method to lighten a color
  lightenColor(color, factor) {
    // Convert hex to RGB
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    
    // Lighten each component
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
    
    // Convert back to hex
    return (newR << 16) | (newG << 8) | newB;
  }
  
  updateSelectionCallbacks() {
    const hasSelection = this.selectedObjects.size > 0;
    const selectedObject = this.selectedObjects.size === 1 ? Array.from(this.selectedObjects)[0] : null;
    
    this.callbacks.onSelectionChange && this.callbacks.onSelectionChange(hasSelection, selectedObject);
  }
  
  deleteSelectedGeometry() {
    // Check if there's a selected geometry (single selection)
    if (this.refs.selectedGeometryRef.current) {
      // Save history state BEFORE deleting
      if (this.modules?.historyManager) {
        this.modules.historyManager.saveToHistory();
      }
      
      // Delete the selected geometry
      if (this.modules?.geometryManager) {
        this.modules.geometryManager.deleteGeometry(this.refs.selectedGeometryRef.current);
      }
      
      return;
    }
    
    // Check for multi-selection
    if (this.selectedObjects.size === 0) return;
    
    // Save history state BEFORE deleting
    if (this.modules?.historyManager) {
      this.modules.historyManager.saveToHistory();
    }
    
    // Delete all selected objects
    const objectsToDelete = Array.from(this.selectedObjects);
    objectsToDelete.forEach(mesh => {
      if (this.modules?.geometryManager) {
        this.modules.geometryManager.deleteGeometry(mesh);
      }
    });
    
    // Clear selection
    this.clearSelection();
    this.refs.selectedGeometryRef.current = null;
    
    // Auto-save scene after deleting geometry
    if (this.modules?.persistenceManager) {
      this.modules.persistenceManager.saveScene();
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
      }
    }
  }
  
  attachTransformControlsImmediate(selectedObject) {
    if (!this.modules?.transformControlsManager?.transformControlsRef) return;
    
    try {
      // Try to attach immediately without checking scene graph
      this.modules.transformControlsManager.transformControlsRef.attach(selectedObject);
      this.modules.transformControlsManager.transformControlsRef.visible = true;
      
      // Set appropriate mode based on tool
      if (this.state.selectedToolRef.current === 'rotate') {
        this.modules.transformControlsManager.transformControlsRef.setMode('rotate');
      } else if (this.state.selectedToolRef.current === 'pan') {
        this.modules.transformControlsManager.transformControlsRef.setMode('translate');
      } else {
        this.modules.transformControlsManager.transformControlsRef.setMode('translate');
      }
    } catch (error) {
      // Silently fail - the setTimeout will try again
    }
  }

  handleToolChange(selectedTool) {
    // Handle tool-specific selection behavior
    if (selectedTool === 'resize' && this.refs.selectedGeometryRef.current) {
      // Create vertex helpers for resize tool
      if (this.modules?.vertexHelpersManager) {
        this.modules.vertexHelpersManager.createVertexHelpers(this.refs.selectedGeometryRef.current);
        this.modules.vertexHelpersManager.showVertexHelpers();
      }
    }
  }
  
  cleanup() {
    // Clean up selection state
    this.clearSelection();
    this.refs.selectedGeometryRef.current = null;
  }
}
