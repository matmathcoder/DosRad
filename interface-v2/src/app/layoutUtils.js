/**
 * Layout utility functions
 * Contains layout-related functions to avoid circular dependencies
 */

/**
 * Load layout configuration from localStorage
 */
export function loadLayoutConfig() {
  try {
    const saved = localStorage.getItem('mercurad_layout_config');
    
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Validate the loaded config has the required properties
      if (parsed.sidebar && parsed.geometrySelector && parsed.directory) {
        return parsed;
      } else {
        console.warn('Layout config missing required properties:', parsed);
      }
    } else {
    }
  } catch (error) {
    console.warn('Failed to load layout config from localStorage:', error);
  }
  
  // Return default layout if loading fails
  return {
    sidebar: 'right',
    geometrySelector: 'left',
    directory: 'left'
  };
}

/**
 * Save layout configuration to localStorage
 */
export function saveLayoutConfig(layoutConfig) {
  try {
    localStorage.setItem('mercurad_layout_config', JSON.stringify(layoutConfig));
  } catch (error) {
    console.warn('Failed to save layout config to localStorage:', error);
  }
}

/**
 * Layout swap functionality - Only 2 layouts: left/right swap
 */
export function cycleLayout(layoutConfig, setLayoutConfig) {
  setLayoutConfig(prev => {
    let newConfig;
    
    // Toggle between the two layouts
    if (prev.sidebar === 'right') {
      // Switch to: Sidebar left, Directory + Geometry right
      newConfig = {
        sidebar: 'left',
        geometrySelector: 'right',
        directory: 'right'
      };
    } else {
      // Switch to: Sidebar right, Directory + Geometry left
      newConfig = {
        sidebar: 'right',
        geometrySelector: 'left',
        directory: 'left'
      };
    }
    
    // Save to localStorage
    saveLayoutConfig(newConfig);
    
    return newConfig;
  });
}
