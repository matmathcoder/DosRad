/**
 * Navigation Data Utilities
 * Contains menu structure, icons, and data processing functions
 */

import { 
  Laptop, 
  Cloud, 
  HardDriveUpload, 
  CloudUpload, 
  CirclePlus, 
  Image, 
  FileBox, 
  Printer,
  Atom
} from 'lucide-react';

/**
 * Main menu structure
 */
export const menuStructure = {
  File: [
    'Save to Computer',
    'Save to Cloud',
    'Load from Computer',
    'Load from Cloud',
    'Create New Project',
    'Export (Image)',
    'Export (OBJ)',
    'Print',
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
    'Start Computation',
    'Physics Simulation',
    'Decay Simulator'
  ],
  Mesh: [
    'Configure Mesh...'
  ],
  View: [
    'Mesh',
    'Cut Plane',
    'Hide Solid Angle Lines',
    'Add Solid Angle Lines...',
    'Normal View',
    '---',
    'Contextual Help',
    'Help Overlay',
    'Geometry Selector',
    'Volume Form',
    'Sensor Panel',
    'Compound Volume',
    'Directory',
    'Rotation Sliders',
    'Debug Panel'
  ]
};

/**
 * File menu icons mapping
 */
export const fileMenuIcons = {
  'Save to Computer': Laptop,
  'Save to Cloud': Cloud,
  'Load from Computer': HardDriveUpload,
  'Load from Cloud': CloudUpload,
  'Create New Project': CirclePlus,
  'Export (Image)': Image,
  'Export (OBJ)': FileBox,
  'Print': Printer
};

/**
 * Scene menu icons mapping
 */
export const sceneMenuIcons = {
  'Decay Simulator': Atom
};

/**
 * Component visibility mapping
 */
export const visibilityMap = {
  'Contextual Help': 'contextualHelp',
  'Help Overlay': 'helpOverlay',
  'Geometry Selector': 'geometrySelector',
  'Volume Form': 'volumeForm',
  'Sensor Panel': 'sensorPanel',
  'Compound Volume': 'compoundVolume',
  'Directory': 'directory',
  'Rotation Sliders': 'rotationSliders',
  'Debug Panel': 'debugPanel'
};

/**
 * Default component visibility state
 */
export const defaultComponentVisibility = {
  contextualHelp: false,
  helpOverlay: true,
  geometrySelector: true,
  volumeForm: false,
  sensorPanel: false,
  compoundVolume: false,
  directory: true,
  rotationSliders: false,
  debugPanel: false
};

/**
 * Default expanded folders state
 */
export const defaultExpandedFolders = {
  scene: true,
  objects: true,
  sources: true,
  compositions: true,
  sensors: true,
  spectra: true,
  examples: true
};
