import React, { useState } from 'react';
import { ChevronRight, Eye, Grid3X3, Frame, HelpCircle, Circle, CircleDashed, CircleDotDashed, CircleDot } from 'lucide-react';

export default function Navigation({ onShowVolumeForm, onAxisChange, onViewModeChange, onMaterialChange, onToggleHelp, onViewMenuAction, onShowGeometryPanel }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  const [activeAxis, setActiveAxis] = useState('Z');
  const [materialMode, setMaterialMode] = useState('solid');

  const menuStructure = {
    File: [
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

  const handleMenuClick = (menuName) => {
    setActiveDropdown(activeDropdown === menuName ? null : menuName);
    setActiveSubDropdown(null);
  };

  const handleSubMenuClick = (subMenuName) => {
    setActiveSubDropdown(activeSubDropdown === subMenuName ? null : subMenuName);
  };

  const handleItemClick = (item) => {
    console.log(`Clicked: ${item}`);
    
    // Handle specific menu actions
    if (item === 'New Volume') {
      onShowVolumeForm();
    }
    
    if (item === 'Geometry') {
      if (onShowGeometryPanel) {
        onShowGeometryPanel();
      }
    }
    
    // Handle View menu actions
    if (onViewMenuAction) {
      switch (item) {
        case 'Mesh':
          onViewMenuAction('toggleMesh');
          break;
        case 'Cut Plane':
          onViewMenuAction('toggleCutPlane');
          break;
        case 'Hide Solid Angle Lines':
          onViewMenuAction('hideSolidAngleLines');
          break;
        case 'Add Solid Angle Lines...':
          onViewMenuAction('addSolidAngleLines');
          break;
        case 'Normal View':
          onViewMenuAction('normalView');
          break;
      }
    }
    
    // Close dropdowns
    setActiveDropdown(null);
    setActiveSubDropdown(null);
  };

  const handleAxisClick = (axis) => {
    setActiveAxis(axis);
    console.log(`Axis changed to: ${axis}`);
    if (onAxisChange) {
      onAxisChange(axis);
    }
  };

  const handleViewModeClick = (mode) => {
    setViewMode(mode);
    console.log(`View mode changed to: ${mode}`);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const handleMaterialModeClick = (mode) => {
    setMaterialMode(mode);
    console.log(`Material mode changed to: ${mode}`);
    if (onMaterialChange) {
      onMaterialChange(mode);
    }
  };

  const renderMenuItem = (item, level = 0) => {
    if (typeof item === 'string') {
      return (
        <li
          key={item}
          onClick={() => handleItemClick(item)}
          className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-sm whitespace-nowrap"
        >
          {item}
        </li>
      );
    }

    if (typeof item === 'object' && item.submenu) {
      const isActive = activeSubDropdown === item.name;
      return (
        <li key={item.name} className="relative">
          <div
            onClick={() => handleSubMenuClick(item.name)}
            className="px-3 py-2 hover:bg-neutral-600 cursor-pointer text-white text-sm whitespace-nowrap flex items-center justify-between"
          >
            {item.name}
            <ChevronRight size={14} className={isActive ? 'rotate-90' : ''} />
          </div>
          {isActive && (
            <ul className="absolute left-full top-0 bg-neutral-700 border border-neutral-600 rounded shadow-lg min-w-max z-50">
              {item.submenu.map((subItem) => renderMenuItem(subItem, level + 1))}
            </ul>
          )}
        </li>
      );
    }
  };

  return (
    <nav className="bg-neutral-700 w-full pointer-events-auto relative z-40">
      <div className="flex justify-between items-center">
        {/* Left side - Menu items */}
        <ul className="flex text-sm ">
          {Object.keys(menuStructure).map((menuName) => (
            <li key={menuName} className="relative">
              <button
                onClick={() => handleMenuClick(menuName)}
                className={`px-4 py-3 cursor-pointer text-white ${
                  activeDropdown === menuName ? 'bg-neutral-600' : 'hover:bg-neutral-600'
                }`}
              >
                {menuName}
              </button>
              
              {activeDropdown === menuName && (
                <ul className="absolute top-full left-0 bg-neutral-700 border border-neutral-600 rounded shadow-lg min-w-max z-50">
                  {menuStructure[menuName].map((item) => renderMenuItem(item))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Right side - Axis and View Mode controls */}
        <div className="flex items-center space-x-2 mr-4">
          {/* Axis Controls */}
          <div className="flex items-center space-x-1 border-l border-neutral-600 pl-3">
            <span className="text-white text-xs mr-2">Axis:</span>
            {['X', 'Y', 'Z'].map((axis) => (
              <button
                key={axis}
                onClick={() => handleAxisClick(axis)}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  activeAxis === axis
                    ? 'bg-neutral-400 text-black'
                    : 'bg-neutral-600 text-white hover:bg-neutral-500'
                }`}
              >
                {axis}
              </button>
            ))}
          </div>

          {/* Material Mode Controls */}
          <div className="flex items-center space-x-1 border-l border-neutral-600 pl-3">
            <span className="text-white text-xs mr-2">Material:</span>
            <button
              onClick={() => handleMaterialModeClick('solid')}
              className={`p-1 rounded ${
                materialMode === 'solid'
                  ? 'bg-neutral-400 text-black'
                  : 'text-white hover:bg-neutral-600'
              }`}
              title="Solid Material"
            >
              <Circle size={16} />
            </button>
            <button
              onClick={() => handleMaterialModeClick('wireframe')}
              className={`p-1 rounded ${
                materialMode === 'wireframe'
                  ? 'bg-neutral-400 text-black'
                  : 'text-white hover:bg-neutral-600'
              }`}
              title="Wireframe Material"
            >
              <CircleDashed size={16} />
            </button>
            <button
              onClick={() => handleMaterialModeClick('transparent')}
              className={`p-1 rounded ${
                materialMode === 'transparent'
                  ? 'bg-neutral-400 text-black'
                  : 'text-white hover:bg-neutral-600'
              }`}
              title="Transparent Material"
            >
              <CircleDotDashed size={16} />
            </button>
            <button
              onClick={() => handleMaterialModeClick('points')}
              className={`p-1 rounded ${
                materialMode === 'points'
                  ? 'bg-neutral-400 text-black'
                  : 'text-white hover:bg-neutral-600'
              }`}
              title="Points Material"
            >
              <CircleDot size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdowns when clicking outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setActiveDropdown(null);
            setActiveSubDropdown(null);
          }}
        />
      )}
    </nav>
  );
}
