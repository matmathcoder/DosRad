import { X, Save, RotateCcw } from 'lucide';

export class VolumeForm {
  constructor(container, isVisible = false, onClose = null, onSave = null) {
    this.container = container;
    this.isVisible = isVisible;
    this.onClose = onClose;
    this.onSave = onSave;
    this.element = null;
    
    this.formData = {
      volume: '',
      volumeType: 'solid',
      composition: '',
      realDensity: '',
      tolerance: '',
      source: '',
      calculation: 'by-lines',
      gammaSelectionMode: 'automatic',
      spectrum: ''
    };

    this.init();
  }

  init() {
    if (this.isVisible) {
      this.createElement();
      this.render();
    }
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[500px] max-h-[80vh] overflow-y-auto pointer-events-auto';
    this.container.appendChild(this.element);
  }

  render() {
    if (!this.element) return;

    this.element.innerHTML = `
      <!-- Header -->
      <div class="flex items-center justify-between bg-neutral-700 rounded-t-lg px-4 py-3">
        <h2 class="text-white font-medium">New Volume</h2>
        <button id="close-btn" class="p-1 hover:bg-neutral-600 rounded text-white" title="Close">
          ${X.toSvg({ size: 16 })}
        </button>
      </div>

      <!-- Form Content -->
      <div class="p-6">
        <!-- Volume Section -->
        <div class="mb-6">
          <h3 class="text-white font-medium text-lg mb-4 border-b border-neutral-600 pb-2">Volume</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-white text-sm font-medium mb-1">Volume Name</label>
              <input
                type="text"
                id="volume"
                value="${this.formData.volume}"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Enter volume name"
              />
            </div>
            <div>
              <label class="block text-white text-sm font-medium mb-1">Volume Type</label>
              <select
                id="volumeType"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="solid" ${this.formData.volumeType === 'solid' ? 'selected' : ''}>Solid</option>
                <option value="liquid" ${this.formData.volumeType === 'liquid' ? 'selected' : ''}>Liquid</option>
                <option value="gas" ${this.formData.volumeType === 'gas' ? 'selected' : ''}>Gas</option>
                <option value="compound" ${this.formData.volumeType === 'compound' ? 'selected' : ''}>Compound</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Composition Section -->
        <div class="mb-6">
          <h3 class="text-white font-medium text-lg mb-4 border-b border-neutral-600 pb-2">Composition</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-white text-sm font-medium mb-1">Material Composition</label>
              <input
                type="text"
                id="composition"
                value="${this.formData.composition}"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Material composition"
              />
            </div>
            <div>
              <label class="block text-white text-sm font-medium mb-1">Real Density (g/cm³)</label>
              <input
                type="number"
                step="0.001"
                id="realDensity"
                value="${this.formData.realDensity}"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="0.000"
              />
            </div>
            <div>
              <label class="block text-white text-sm font-medium mb-1">Tolerance</label>
              <input
                type="number"
                step="0.0001"
                id="tolerance"
                value="${this.formData.tolerance}"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="0.0000"
              />
            </div>
          </div>
        </div>

        <!-- Source Section -->
        <div class="mb-6">
          <h3 class="text-white font-medium text-lg mb-4 border-b border-neutral-600 pb-2">Source</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-white text-sm font-medium mb-1">Source</label>
              <input
                type="text"
                id="source"
                value="${this.formData.source}"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Source identifier"
              />
            </div>
            <div>
              <label class="block text-white text-sm font-medium mb-1">Calculation</label>
              <select
                id="calculation"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="by-lines" ${this.formData.calculation === 'by-lines' ? 'selected' : ''}>By Lines</option>
                <option value="by-groups" ${this.formData.calculation === 'by-groups' ? 'selected' : ''}>By Groups</option>
              </select>
            </div>
            <div>
              <label class="block text-white text-sm font-medium mb-1">Gamma Selection Mode</label>
              <select
                id="gammaSelectionMode"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="automatic" ${this.formData.gammaSelectionMode === 'automatic' ? 'selected' : ''}>Automatic</option>
                <option value="manual" ${this.formData.gammaSelectionMode === 'manual' ? 'selected' : ''}>Manual</option>
                <option value="custom" ${this.formData.gammaSelectionMode === 'custom' ? 'selected' : ''}>Custom</option>
              </select>
            </div>
            <div>
              <label class="block text-white text-sm font-medium mb-1">Spectrum</label>
              <input
                type="text"
                id="spectrum"
                value="${this.formData.spectrum}"
                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Spectrum configuration"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-2 p-4 bg-neutral-750 rounded-b-lg border-t border-neutral-600">
        <button
          id="reset-btn"
          class="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded flex items-center gap-2"
        >
          ${RotateCcw.toSvg({ size: 14 })}
          Reset
        </button>
        <button
          id="cancel-btn"
          class="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded"
        >
          Cancel
        </button>
        <button
          id="save-btn"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center gap-2"
        >
          ${Save.toSvg({ size: 14 })}
          Save Volume
        </button>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.element) return;

    // Close button
    const closeBtn = this.element.querySelector('#close-btn');
    closeBtn?.addEventListener('click', () => this.handleClose());

    // Cancel button
    const cancelBtn = this.element.querySelector('#cancel-btn');
    cancelBtn?.addEventListener('click', () => this.handleClose());

    // Reset button
    const resetBtn = this.element.querySelector('#reset-btn');
    resetBtn?.addEventListener('click', () => this.handleReset());

    // Save button
    const saveBtn = this.element.querySelector('#save-btn');
    saveBtn?.addEventListener('click', () => this.handleSave());

    // Form inputs
    const inputs = this.element.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleInputChange(e.target.id, e.target.value));
    });
  }

  handleInputChange(field, value) {
    this.formData = {
      ...this.formData,
      [field]: value
    };
  }

  handleSave() {
    console.log('Saving volume:', this.formData);
    if (this.onSave) {
      this.onSave(this.formData);
    }
    this.handleReset();
  }

  handleReset() {
    this.formData = {
      volume: '',
      volumeType: 'solid',
      composition: '',
      realDensity: '',
      tolerance: '',
      source: '',
      calculation: 'by-lines',
      gammaSelectionMode: 'automatic',
      spectrum: ''
    };
    this.render();
  }

  handleClose() {
    if (this.onClose) {
      this.onClose();
    }
  }

  show() {
    this.isVisible = true;
    if (!this.element) {
      this.createElement();
    }
    this.render();
  }

  hide() {
    this.isVisible = false;
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  setVisible(visible) {
    if (visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
