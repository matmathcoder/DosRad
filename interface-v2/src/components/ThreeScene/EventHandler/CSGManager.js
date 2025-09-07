export class CSGManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    
    // CSG operation refs
    this.csgSelectedObjects = [];
    this.csgOperation = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    // CSG manager initialization
  }
  
  handleCSGSelection(object, tool) {
    // Add object to CSG selection
    if (!this.csgSelectedObjects.includes(object)) {
      this.csgSelectedObjects.push(object);
      
      // Visual feedback - make selected objects glow with different colors
      const selectionCount = this.csgSelectedObjects.length;
      if (selectionCount === 1) {
        // First selection - use a medium lightening
        const originalColor = object.userData?.originalColor || 0x404040;
        const mediumLighterColor = this.lightenColor(originalColor, 0.2);
        object.material.color.setHex(mediumLighterColor);
      } else if (selectionCount === 2) {
        // Second selection - use a stronger lightening
        const originalColor = object.userData?.originalColor || 0x404040;
        const lighterColor = this.lightenColor(originalColor, 0.4);
        object.material.color.setHex(lighterColor);
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
            if (this.modules?.selectionManager) {
              this.modules.selectionManager.selectGeometry(result);
            }
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
  
  handleToolChange(selectedTool) {
    // Handle CSG operations
    if (selectedTool && selectedTool.startsWith('csg-')) {
      const operation = selectedTool.replace('csg-', '');
      this.csgOperation = operation;
      this.state.setCsgMode(true);
      this.csgSelectedObjects = [];
      
      // Clear any existing selections
      if (this.modules?.selectionManager) {
        this.modules.selectionManager.deselect();
      }
      
      // Visual feedback - highlight all objects to show they're selectable
      this.refs.geometriesRef.current.forEach(mesh => {
        if (mesh.material) {
          // Store original color if not already stored
          if (!mesh.userData.originalColor) {
            mesh.userData.originalColor = mesh.material.color.getHex();
          }
          // Make objects slightly brighter to indicate they're selectable
          const originalColor = mesh.userData?.originalColor || 0x404040;
          const selectableColor = this.lightenColor(originalColor, 0.15); // 15% lighter for selectable indication
          mesh.material.color.setHex(selectableColor);
        }
      });
    }
  }
  
  cleanup() {
    // Clean up CSG state
    this.csgSelectedObjects = [];
    this.csgOperation = null;
  }
}
