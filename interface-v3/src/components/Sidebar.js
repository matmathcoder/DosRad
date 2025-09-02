import { 
  MousePointer2, 
  Hand, 
  House, 
  HousePlus, 
  Eye, 
  Crosshair, 
  Cctv 
} from 'lucide';

export class Sidebar {
  constructor(container, selectedTool = null, onToolSelect = null) {
    this.container = container;
    this.selectedTool = selectedTool;
    this.onToolSelect = onToolSelect;
    this.element = null;
    
    // Define tools with SVG strings as fallback
    this.tools = [
      { 
        icon: MousePointer2, 
        name: 'Select', 
        id: 'select',
        fallbackSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>'
      },
      { 
        icon: Hand, 
        name: 'Move Cube', 
        id: 'pan',
        fallbackSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>'
      },
      { 
        icon: House, 
        name: 'Home', 
        id: 'home',
        fallbackSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>'
      },
      { 
        icon: HousePlus, 
        name: 'Add Home', 
        id: 'add-home',
        fallbackSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.22 2.416a2 2 0 0 0-2.511.057l-7 5.999A2 2 0 0 0 3 10v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-.709-1.528l-7-5.999z"/><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M15 6h4"/><path d="M17 4v4"/></svg>'
      },
      { 
        icon: Eye, 
        name: 'View', 
        id: 'view',
        fallbackSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
      },
      { 
        icon: Crosshair, 
        name: 'Target', 
        id: 'target',
        fallbackSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>'
      },
      { 
        icon: Cctv, 
        name: 'Camera', 
        id: 'camera',
        fallbackSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97"/><path d="M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z"/><path d="M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15"/><path d="M2 21v-4"/><path d="M7 9h.01"/></svg>'
      }
    ];

    this.init();
  }

  init() {
    this.createElement();
    this.render();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'bg-neutral-700 rounded-lg shadow-lg pointer-events-auto';
    this.container.appendChild(this.element);
  }

  render() {
    const toolsContainer = document.createElement('div');
    toolsContainer.className = 'flex flex-col p-2 gap-1';

    this.tools.forEach(({ icon: IconClass, name, id, fallbackSvg }) => {
      const button = document.createElement('button');
      button.className = `p-3 rounded-md hover:bg-neutral-600 cursor-pointer group relative ${
        this.selectedTool === id ? 'bg-neutral-600' : ''
      }`;
      button.title = name;
      
      // Create icon element
      const iconContainer = document.createElement('div');
      iconContainer.className = `text-white ${this.selectedTool === id ? 'text-blue-400' : ''}`;
      
      // Try to use Lucide icon, fallback to SVG string
      try {
        iconContainer.innerHTML = IconClass.toSvg({
          size: 20,
          'stroke-width': 1.5
        });
      } catch (error) {
        console.warn(`Failed to load Lucide icon for ${name}, using fallback`);
        iconContainer.innerHTML = fallbackSvg;
      }
      
      // Create tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none';
      tooltip.textContent = name;
      
      button.appendChild(iconContainer);
      button.appendChild(tooltip);
      
      button.addEventListener('click', () => this.handleToolClick(id));
      
      toolsContainer.appendChild(button);
    });

    this.element.innerHTML = '';
    this.element.appendChild(toolsContainer);
  }

  handleToolClick(toolId) {
    const newSelectedTool = this.selectedTool === toolId ? null : toolId;
    this.setSelectedTool(newSelectedTool);
    if (this.onToolSelect) {
      this.onToolSelect(newSelectedTool);
    }
    console.log(`Selected tool: ${toolId}`);
  }

  setSelectedTool(toolId) {
    this.selectedTool = toolId;
    this.render(); // Re-render to update active states
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
