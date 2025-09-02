import { Box, Diameter, Cylinder, Cone, X, Maximize2, Minus } from 'lucide';

export class GeometrySelector {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.isMinimized = false;
    this.isMaximized = false;
    
    this.geometries = [
      { name: 'Cube', icon: Box },
      { name: 'Sphere', icon: Diameter },
      { name: 'Cylinder', icon: Cylinder },
      { name: 'Cone', icon: Cone },
    ];

    this.init();
  }

  init() {
    this.createElement();
    this.render();
  }

  createElement() {
    this.element = document.createElement('div');
    this.updateElementClasses();
    this.container.appendChild(this.element);
  }

  updateElementClasses() {
    if (!this.element) return;
    
    this.element.className = `mt-5 ml-5 rounded-md bg-neutral-700 pointer-events-auto ${
      this.isMaximized ? 'w-80 h-80' : 'w-40'
    } ${this.isMinimized ? 'h-8' : 'h-auto'}`;
  }

  render() {
    if (!this.element) return;

    this.updateElementClasses();

    this.element.innerHTML = `
      <!-- Title Bar -->
      <div class="flex items-center justify-between bg-neutral-800 rounded-t-md px-3 py-1">
        <span class="text-white text-xs font-medium">Geometry Selector</span>
        <div class="flex items-center gap-1">
          <button
            id="minimize-btn"
            class="p-1 hover:bg-neutral-600 rounded text-white"
            title="Minimize"
          >
            ${Minus.toSvg({ size: 12 })}
          </button>
          <button
            id="maximize-btn"
            class="p-1 hover:bg-neutral-600 rounded text-white"
            title="${this.isMaximized ? "Restore" : "Maximize"}"
          >
            ${Maximize2.toSvg({ size: 12 })}
          </button>
          <button
            id="close-btn"
            class="p-1 hover:bg-red-600 rounded text-white"
            title="Close"
          >
            ${X.toSvg({ size: 12 })}
          </button>
        </div>
      </div>

      ${!this.isMinimized ? `
        <!-- Content Area -->
        <div class="grid grid-cols-2 grid-rows-2 p-2 ${
          this.isMaximized ? 'h-72' : 'h-32'
        }">
          ${this.geometries.map(({ name, icon: IconClass }) => `
            <div 
              class="flex flex-col items-center justify-center rounded shadow text-white hover:bg-neutral-600 cursor-pointer p-2 geometry-item"
              data-geometry="${name}"
            >
              ${IconClass.toSvg({ 
                size: this.isMaximized ? 48 : 36,
                class: "mb-1"
              })}
              <span class="text-center ${this.isMaximized ? 'text-sm' : 'text-xs'}">
                ${name}
              </span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.element) return;

    // Minimize button
    const minimizeBtn = this.element.querySelector('#minimize-btn');
    minimizeBtn?.addEventListener('click', () => this.handleMinimize());

    // Maximize button
    const maximizeBtn = this.element.querySelector('#maximize-btn');
    maximizeBtn?.addEventListener('click', () => this.handleResize());

    // Close button
    const closeBtn = this.element.querySelector('#close-btn');
    closeBtn?.addEventListener('click', () => this.handleClose());

    // Geometry items
    const geometryItems = this.element.querySelectorAll('.geometry-item');
    geometryItems.forEach(item => {
      item.addEventListener('click', () => {
        const geometryName = item.getAttribute('data-geometry');
        this.handleGeometrySelect(geometryName);
      });
    });
  }

  handleGeometrySelect(geometryName) {
    console.log(`Selected geometry: ${geometryName}`);
    // TODO: Implement geometry switching logic
  }

  handleClose() {
    console.log('Geometry selector closed');
    // TODO: Implement close functionality
    this.destroy();
  }

  handleResize() {
    this.isMaximized = !this.isMaximized;
    console.log(`Geometry selector ${this.isMaximized ? 'maximized' : 'minimized'}`);
    this.render();
  }

  handleMinimize() {
    this.isMinimized = !this.isMinimized;
    console.log(`Geometry selector ${this.isMinimized ? 'minimized' : 'restored'}`);
    this.render();
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
