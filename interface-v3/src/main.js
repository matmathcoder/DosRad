import './style.css'
import { ThreeScene } from './components/ThreeScene.js'
import { Navigation } from './components/Navigation.js'
import { GeometrySelector } from './components/GeometrySelector.js'
import { Sidebar } from './components/Sidebar.js'
import { VolumeForm } from './components/VolumeForm.js'

class App {
  constructor() {
    this.selectedTool = null;
    this.showVolumeForm = false;
    
    // Component instances
    this.threeScene = null;
    this.navigation = null;
    this.geometrySelector = null;
    this.sidebar = null;
    this.volumeForm = null;
    
    this.init();
  }

  init() {
    this.createLayout();
    this.initializeComponents();
  }

  createLayout() {
    const app = document.querySelector('#app');
    app.className = 'bg-neutral-800 h-screen relative';
    
    app.innerHTML = `
      <!-- Three.js Scene Container - Higher z-index for interactions -->
      <div id="scene-container" class="absolute inset-0 z-20"></div>
      
      <!-- UI Overlay - Lower z-index, positioned elements -->
      <div class="absolute inset-0 z-30 pointer-events-none">
        <!-- Navigation Bar - Top -->
        <div id="navigation-container" class="absolute top-0 left-0 right-0 pointer-events-auto"></div>
        
        <!-- Geometry Selector - Top Left -->
        <div id="geometry-container" class="absolute top-16 left-0 pointer-events-auto"></div>

        <!-- Volume Form - Floating behind GeometrySelector -->
        <div id="volume-form-container" class="absolute top-16 left-52 pointer-events-auto"></div>

        <!-- Sidebar - Right Side -->
        <div id="sidebar-container" class="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-auto"></div>
      </div>
    `;
  }

  initializeComponents() {
    // Initialize Three.js Scene
    const sceneContainer = document.getElementById('scene-container');
    this.threeScene = new ThreeScene(sceneContainer, this.selectedTool);

    // Initialize Navigation
    const navigationContainer = document.getElementById('navigation-container');
    this.navigation = new Navigation(navigationContainer, () => this.handleShowVolumeForm());

    // Initialize Geometry Selector
    const geometryContainer = document.getElementById('geometry-container');
    this.geometrySelector = new GeometrySelector(geometryContainer);

    // Initialize Sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    this.sidebar = new Sidebar(sidebarContainer, this.selectedTool, (toolId) => this.handleToolSelect(toolId));

    // Volume Form will be initialized when needed
  }

  handleShowVolumeForm() {
    this.showVolumeForm = true;
    
    if (!this.volumeForm) {
      const volumeFormContainer = document.getElementById('volume-form-container');
      this.volumeForm = new VolumeForm(
        volumeFormContainer,
        true,
        () => this.handleVolumeFormClose(),
        (volumeData) => this.handleVolumeFormSave(volumeData)
      );
    } else {
      this.volumeForm.show();
    }
  }

  handleVolumeFormClose() {
    this.showVolumeForm = false;
    if (this.volumeForm) {
      this.volumeForm.hide();
    }
  }

  handleVolumeFormSave(volumeData) {
    console.log('Volume created:', volumeData);
    // TODO: Implement volume creation logic
    this.showVolumeForm = false;
    if (this.volumeForm) {
      this.volumeForm.hide();
    }
  }

  handleToolSelect(toolId) {
    this.selectedTool = toolId;
    
    // Update Three.js scene with new tool
    if (this.threeScene) {
      this.threeScene.setSelectedTool(toolId);
    }
    
    // Update sidebar to reflect selection
    if (this.sidebar) {
      this.sidebar.setSelectedTool(toolId);
    }
  }

  destroy() {
    // Clean up all components
    if (this.threeScene) {
      this.threeScene.dispose();
    }
    if (this.navigation) {
      this.navigation.destroy();
    }
    if (this.geometrySelector) {
      this.geometrySelector.destroy();
    }
    if (this.sidebar) {
      this.sidebar.destroy();
    }
    if (this.volumeForm) {
      this.volumeForm.destroy();
    }
  }
}

// Initialize the application
const app = new App();

// Handle page unload
window.addEventListener('beforeunload', () => {
  app.destroy();
});