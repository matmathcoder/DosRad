import { ChevronRight } from 'lucide';

export class Navigation {
  constructor(container, onShowVolumeForm = null) {
    this.container = container;
    this.onShowVolumeForm = onShowVolumeForm;
    this.element = null;
    this.activeDropdown = null;
    this.activeSubDropdown = null;
    this.overlay = null;
    
    this.menuStructure = {
      File: [
        'Open Scene',
        'Create Scene',
        'Save',
        'Save as...',
        'Print',
        'Export (Image)',
        'Quit Mercurad'
      ],
      Edit: [
        'New Volume',
        'Select Volume',
        {
          name: 'Insert',
          submenu: ['Compound Volume', 'Sensor']
        },
        'Remove'
      ],
      Inspector: [
        'Geometry',
        'Compositions',
        'Sources',
        'Sensor',
        {
          name: 'Calculation Results',
          submenu: [
            {
              name: 'Nom Config',
              submenu: ['Simple', 'Complete']
            },
            'Min Config',
            'Max Config'
          ]
        }
      ],
      Scene: [
        'Generate Scene...',
        'Start Computation'
      ],
      View: [
        'Mesh',
        'Cut Plane',
        'Hide Solid Angle Lines',
        'Add Solid Angle Lines...',
        'Normal View'
      ]
    };

    this.init();
  }

  init() {
    this.createElement();
    this.render();
    this.setupEventListeners();
  }

  createElement() {
    this.element = document.createElement('nav');
    this.element.className = 'bg-neutral-700 w-full pointer-events-auto relative z-40';
    this.container.appendChild(this.element);
  }

  render() {
    const ul = document.createElement('ul');
    ul.className = 'flex text-sm';

    Object.keys(this.menuStructure).forEach((menuName) => {
      const li = document.createElement('li');
      li.className = 'relative';

      const button = document.createElement('button');
      button.className = `px-4 py-2 cursor-pointer text-white ${
        this.activeDropdown === menuName ? 'bg-neutral-600' : 'hover:bg-neutral-600'
      }`;
      button.textContent = menuName;
      button.addEventListener('click', () => this.handleMenuClick(menuName));

      li.appendChild(button);

      if (this.activeDropdown === menuName) {
        const dropdown = this.createDropdown(this.menuStructure[menuName]);
        li.appendChild(dropdown);
      }

      ul.appendChild(li);
    });

    this.element.innerHTML = '';
    this.element.appendChild(ul);

    // Create overlay if dropdown is active
    if (this.activeDropdown && !this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'fixed inset-0 z-30';
      this.overlay.addEventListener('click', () => this.closeDropdowns());
      document.body.appendChild(this.overlay);
    }
  }

  createDropdown(items, level = 0) {
    const ul = document.createElement('ul');
    ul.className = 'absolute top-full left-0 bg-neutral-700 border border-neutral-600 rounded shadow-lg min-w-max z-50';

    items.forEach((item) => {
      const li = this.createMenuItem(item, level);
      ul.appendChild(li);
    });

    return ul;
  }

  createMenuItem(item, level = 0) {
    const li = document.createElement('li');

    if (typeof item === 'string') {
      li.className = 'px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-sm whitespace-nowrap';
      li.textContent = item;
      li.addEventListener('click', () => this.handleItemClick(item));
      return li;
    }

    if (typeof item === 'object' && item.submenu) {
      li.className = 'relative';
      
      const div = document.createElement('div');
      div.className = 'px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-sm whitespace-nowrap flex items-center justify-between';
      
      const span = document.createElement('span');
      span.textContent = item.name;
      
      const iconContainer = document.createElement('div');
      const isActive = this.activeSubDropdown === item.name;
      iconContainer.innerHTML = ChevronRight.toSvg({
        size: 14,
        class: isActive ? 'rotate-90' : ''
      });
      
      div.appendChild(span);
      div.appendChild(iconContainer);
      div.addEventListener('click', () => this.handleSubMenuClick(item.name));
      
      li.appendChild(div);

      if (isActive) {
        const submenu = document.createElement('ul');
        submenu.className = 'absolute left-full top-0 bg-neutral-700 border border-neutral-600 rounded shadow-lg min-w-max z-50';
        
        item.submenu.forEach((subItem) => {
          const subLi = this.createMenuItem(subItem, level + 1);
          submenu.appendChild(subLi);
        });
        
        li.appendChild(submenu);
      }
    }

    return li;
  }

  setupEventListeners() {
    // Event listeners are handled in the render methods
  }

  handleMenuClick(menuName) {
    this.activeDropdown = this.activeDropdown === menuName ? null : menuName;
    this.activeSubDropdown = null;
    this.render();
  }

  handleSubMenuClick(subMenuName) {
    this.activeSubDropdown = this.activeSubDropdown === subMenuName ? null : subMenuName;
    this.render();
  }

  handleItemClick(item) {
    console.log(`Clicked: ${item}`);
    
    // Handle specific menu actions
    if (item === 'New Volume' && this.onShowVolumeForm) {
      this.onShowVolumeForm();
    }
    
    // Close dropdowns
    this.closeDropdowns();
  }

  closeDropdowns() {
    this.activeDropdown = null;
    this.activeSubDropdown = null;
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
    }
    this.render();
  }

  destroy() {
    if (this.overlay) {
      document.body.removeChild(this.overlay);
      this.overlay = null;
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
