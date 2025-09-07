import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Eclipse, Cylinder, Cone, X, Maximize2, Minus, Move, Settings,
  Torus, LineSquiggle, Shapes, Circle, CircleSmall, Club, Diamond, Hexagon
} from 'lucide-react';

export default function GeometrySelector({ onGeometrySelect, layoutPosition = 'left' }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedGeometries, setSelectedGeometries] = useState(['cube', 'sphere', 'cylinder', 'cone']);
  
  // Floating settings panel state
  const [settingsPosition, setSettingsPosition] = useState({ x: 0, y: 0 });
  const [isDraggingSettings, setIsDraggingSettings] = useState(false);
  const [settingsDragStart, setSettingsDragStart] = useState({ x: 0, y: 0 });
  const settingsRef = useRef();
  
  // Dragging state - Initialize to original position (top left)
  const [position, setPosition] = useState({ 
    x: 20,  // Original left margin (ml-5 = 20px) 
    y: 84   // Original top position (top-16 + mt-5 = 64 + 20px)
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const selectorRef = useRef();

  const allGeometries = [
    { name: 'Cube', type: 'cube', icon: Box, category: 'basic' },
    { name: 'Sphere', type: 'sphere', icon: Eclipse, category: 'basic' },
    { name: 'Cylinder', type: 'cylinder', icon: Cylinder, category: 'basic' },
    { name: 'Cone', type: 'cone', icon: Cone, category: 'basic' },
    { name: 'Capsule', type: 'capsule', icon: CircleSmall, category: 'advanced' },
    { name: 'Dodecahedron', type: 'dodecahedron', icon: Diamond, category: 'advanced' },
    { name: 'Extrude', type: 'extrude', icon: Shapes, category: 'advanced' },
    { name: 'Icosahedron', type: 'icosahedron', icon: Hexagon, category: 'advanced' },
    { name: 'Lathe', type: 'lathe', icon: LineSquiggle, category: 'advanced' },
    { name: 'Octahedron', type: 'octahedron', icon: Club, category: 'advanced' },
    { name: 'Plane', type: 'plane', icon: Circle, category: 'advanced' },
    { name: 'Ring', type: 'ring', icon: Circle, category: 'advanced' },
    { name: 'Shape', type: 'shape', icon: Shapes, category: 'advanced' },
    { name: 'Tetrahedron', type: 'tetrahedron', icon: Diamond, category: 'advanced' },
    { name: 'Torus', type: 'torus', icon: Torus, category: 'advanced' },
    { name: 'TorusKnot', type: 'torusknot', icon: Torus, category: 'advanced' },
    { name: 'Tube', type: 'tube', icon: Cylinder, category: 'advanced' },
  ];

  // Get currently selected geometries
  const geometries = allGeometries.filter(geo => selectedGeometries.includes(geo.type));

  const handleGeometrySelect = (geometryType) => {
    if (onGeometrySelect) {
      onGeometrySelect(geometryType);
    }
  };

  // Drag and drop handlers for geometry buttons
  const handleDragStart = (e, geometryName) => {
    e.dataTransfer.setData('text/plain', geometryName.toLowerCase());
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback to the dragged element
    e.target.style.opacity = '0.5';
    e.target.style.transform = 'scale(0.9)';
    
    // Create a custom drag image with geometry preview
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      background: rgba(64, 64, 64, 0.95);
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.3);
      pointer-events: none;
      position: absolute;
      top: -1000px;
      left: -1000px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    `;
    
    // Create geometry preview based on type
    const geometryPreview = document.createElement('div');
    geometryPreview.style.cssText = `
      width: 40px;
      height: 40px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Create SVG geometry preview
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '40');
    svg.setAttribute('height', '40');
    svg.setAttribute('viewBox', '0 0 40 40');
    svg.style.cssText = `
      fill: #ffffff;
      stroke: #ffffff;
      stroke-width: 1;
    `;
    
    // Create different geometry shapes based on type
    const geometryType = geometryName.toLowerCase();
    let geometryElement;
    
    switch (geometryType) {
      case 'cube':
        geometryElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        geometryElement.setAttribute('x', '8');
        geometryElement.setAttribute('y', '8');
        geometryElement.setAttribute('width', '24');
        geometryElement.setAttribute('height', '24');
        geometryElement.setAttribute('fill', 'none');
        geometryElement.setAttribute('stroke', '#ffffff');
        geometryElement.setAttribute('stroke-width', '2');
        break;
        
      case 'sphere':
        geometryElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        geometryElement.setAttribute('cx', '20');
        geometryElement.setAttribute('cy', '20');
        geometryElement.setAttribute('r', '12');
        geometryElement.setAttribute('fill', 'none');
        geometryElement.setAttribute('stroke', '#ffffff');
        geometryElement.setAttribute('stroke-width', '2');
        break;
        
      case 'cylinder':
        // Create cylinder with ellipses and lines
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Top ellipse
        const topEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        topEllipse.setAttribute('cx', '20');
        topEllipse.setAttribute('cy', '12');
        topEllipse.setAttribute('rx', '10');
        topEllipse.setAttribute('ry', '4');
        topEllipse.setAttribute('fill', 'none');
        topEllipse.setAttribute('stroke', '#ffffff');
        topEllipse.setAttribute('stroke-width', '2');
        
        // Bottom ellipse
        const bottomEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        bottomEllipse.setAttribute('cx', '20');
        bottomEllipse.setAttribute('cy', '28');
        bottomEllipse.setAttribute('rx', '10');
        bottomEllipse.setAttribute('ry', '4');
        bottomEllipse.setAttribute('fill', 'none');
        bottomEllipse.setAttribute('stroke', '#ffffff');
        bottomEllipse.setAttribute('stroke-width', '2');
        
        // Side lines
        const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftLine.setAttribute('x1', '10');
        leftLine.setAttribute('y1', '12');
        leftLine.setAttribute('x2', '10');
        leftLine.setAttribute('y2', '28');
        leftLine.setAttribute('stroke', '#ffffff');
        leftLine.setAttribute('stroke-width', '2');
        
        const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightLine.setAttribute('x1', '30');
        rightLine.setAttribute('y1', '12');
        rightLine.setAttribute('x2', '30');
        rightLine.setAttribute('y2', '28');
        rightLine.setAttribute('stroke', '#ffffff');
        rightLine.setAttribute('stroke-width', '2');
        
        group.appendChild(topEllipse);
        group.appendChild(bottomEllipse);
        group.appendChild(leftLine);
        group.appendChild(rightLine);
        geometryElement = group;
        break;
        
      case 'cone':
        // Create cone with triangle and ellipse
        const coneGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Triangle (cone body)
        const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        triangle.setAttribute('points', '20,8 10,32 30,32');
        triangle.setAttribute('fill', 'none');
        triangle.setAttribute('stroke', '#ffffff');
        triangle.setAttribute('stroke-width', '2');
        
        // Base ellipse
        const baseEllipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        baseEllipse.setAttribute('cx', '20');
        baseEllipse.setAttribute('cy', '32');
        baseEllipse.setAttribute('rx', '10');
        baseEllipse.setAttribute('ry', '2');
        baseEllipse.setAttribute('fill', 'none');
        baseEllipse.setAttribute('stroke', '#ffffff');
        baseEllipse.setAttribute('stroke-width', '2');
        
        coneGroup.appendChild(triangle);
        coneGroup.appendChild(baseEllipse);
        geometryElement = coneGroup;
        break;
        
      default:
        geometryElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        geometryElement.setAttribute('x', '8');
        geometryElement.setAttribute('y', '8');
        geometryElement.setAttribute('width', '24');
        geometryElement.setAttribute('height', '24');
        geometryElement.setAttribute('fill', 'none');
        geometryElement.setAttribute('stroke', '#ffffff');
        geometryElement.setAttribute('stroke-width', '2');
    }
    
    svg.appendChild(geometryElement);
    geometryPreview.appendChild(svg);
    
    // Add text label
    const textLabel = document.createElement('div');
    textLabel.textContent = geometryName;
    textLabel.style.cssText = `
      font-size: 10px;
      text-align: center;
      color: #ffffff;
    `;
    
    dragImage.appendChild(geometryPreview);
    dragImage.appendChild(textLabel);
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 40, 40);
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleDragEnd = (e) => {
    // Reset visual feedback
    e.target.style.opacity = '1';
    e.target.style.transform = 'scale(1)';
  };

  const handleClose = () => {
    // TODO: Implement close functionality
  };

  const handleResize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSettingsToggle = () => {
    if (!showSettings) {
      // Position the settings panel next to the geometry selector
      const settingsX = position.x + (isMaximized ? 320 : 192) + 10; // w-48 = 192px
      const settingsY = position.y;
      setSettingsPosition({ x: settingsX, y: settingsY });
    }
    setShowSettings(!showSettings);
  };

  const handleGeometryToggle = (geometryType) => {
    setSelectedGeometries(prev => {
      if (prev.includes(geometryType)) {
        // Don't allow removing all geometries
        if (prev.length > 1) {
          return prev.filter(type => type !== geometryType);
        }
        return prev;
      } else {
        // Don't allow more than 8 geometries for UI reasons
        if (prev.length < 8) {
          return [...prev, geometryType];
        }
        return prev;
      }
    });
  };

  // Dragging functions
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Basic boundary checking - keep within screen bounds
    const componentWidth = isMaximized ? 320 : 192; // w-48 = 192px
    const componentHeight = isMinimized ? 32 : (isMaximized ? 320 : 
      geometryCount <= 4 ? 176 : geometryCount <= 6 ? 192 : 224); // h-44=176px, h-48=192px, h-56=224px
    const margin = 20;
    
    const boundedX = Math.max(margin, Math.min(newX, window.innerWidth - componentWidth - margin));
    const boundedY = Math.max(60, Math.min(newY, window.innerHeight - componentHeight - margin)); // 60px for navigation
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Settings panel dragging functions
  const handleSettingsMouseDown = (e) => {
    if (e.target.closest('.settings-drag-handle')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingSettings(true);
      setSettingsDragStart({
        x: e.clientX - settingsPosition.x,
        y: e.clientY - settingsPosition.y
      });
    }
  };

  const handleSettingsMouseMove = (e) => {
    if (!isDraggingSettings) return;
    
    e.preventDefault();
    
    const newX = e.clientX - settingsDragStart.x;
    const newY = e.clientY - settingsDragStart.y;
    
    // Basic boundary checking - keep within screen bounds
    const settingsWidth = 300;
    const settingsHeight = 400;
    const margin = 20;
    
    const boundedX = Math.max(margin, Math.min(newX, window.innerWidth - settingsWidth - margin));
    const boundedY = Math.max(60, Math.min(newY, window.innerHeight - settingsHeight - margin));
    
    setSettingsPosition({ x: boundedX, y: boundedY });
  };

  const handleSettingsMouseUp = () => {
    setIsDraggingSettings(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDraggingSettings) {
      document.addEventListener('mousemove', handleSettingsMouseMove);
      document.addEventListener('mouseup', handleSettingsMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleSettingsMouseMove);
        document.removeEventListener('mouseup', handleSettingsMouseUp);
      };
    }
  }, [isDraggingSettings]);


  // Expose reset position function to window
  useEffect(() => {
    window.resetGeometrySelectorPosition = (newPosition) => {
      setPosition(newPosition);
    };

    return () => {
      delete window.resetGeometrySelectorPosition;
    };
  }, []);

  // Position Geometry Selector next to Directory
  useEffect(() => {
    const getPositionNextToDirectory = (directoryPosition) => {
      const directoryWidth = 350; // Directory width
      const geometryWidth = 192; // Geometry Selector width (w-48 = 192px)
      const margin = 8; // Small gap between components
      
      const positions = {
        'left': { 
          x: directoryWidth + margin, // To the right of Directory
          y: 84 // Same level as Directory (top-16 = 64px + 20px margin)
        },
        'right': { 
          x: window.innerWidth - directoryWidth - geometryWidth - margin, // To the left of Directory
          y: 84 // Same level as Directory
        },
        'top': { 
          x: (window.innerWidth - geometryWidth) / 2, // Center horizontally
          y: 64 + 300 + margin // Below Directory when it's at top (64px navbar + 300px directory + margin)
        },
        'bottom': { 
          x: (window.innerWidth - geometryWidth) / 2, // Center horizontally
          y: window.innerHeight - 300 - geometryWidth - margin // Above Directory when it's at bottom
        }
      };
      return positions[directoryPosition] || positions['left'];
    };

    const newPosition = getPositionNextToDirectory(layoutPosition);
    setPosition(newPosition);
  }, [layoutPosition]);


  // Calculate dynamic height based on number of geometries
  const geometryCount = geometries.length;
  const getDynamicHeight = () => {
    if (isMinimized) return 'h-8';
    if (isMaximized) return 'h-80';
    
    // Normal mode - adjust height based on geometry count
    if (geometryCount <= 4) {
      return 'h-44'; // 2x2 grid
    } else if (geometryCount <= 6) {
      return 'h-48'; // 3x2 grid
    } else {
      return 'h-56'; // 3x3 grid (for 7-8 geometries)
    }
  };

  const getGridCols = () => {
    if (geometryCount <= 4) return 'grid-cols-2';
    if (geometryCount <= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  return (
    <>
    <div 
      ref={selectorRef}
      className={`rounded-md bg-neutral-700 pointer-events-auto absolute ${
        isMaximized ? 'w-80' : 'w-48'
      } ${getDynamicHeight()}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 30
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-neutral-700 border-b border-neutral-600 rounded-t-md px-3 py-1 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Move size={12} className="text-neutral-400" />
          <span className="text-white text-xs font-medium">Geometry Selector</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSettingsToggle}
            className={`p-1 rounded text-white ${
              showSettings ? 'bg-blue-600 hover:bg-blue-500' : 'hover:bg-neutral-600'
            }`}
            title="Geometry Settings"
          >
            <Settings size={12} />
          </button>
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Minimize"
          >
            <Minus size={12} />
          </button>
          <button
            onClick={handleResize}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            <Maximize2 size={12} />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-600 rounded text-white"
            title="Close"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {!isMinimized && (
        <div className={`grid ${getGridCols()} p-2 ${
          isMaximized ? 'h-72' : geometryCount <= 4 ? 'h-32' : geometryCount <= 6 ? 'h-40' : 'h-48'
        }`}>
          {geometries.map(({ name, type, icon: Icon }) => (
            <div 
              key={type}
              draggable="true"
              onClick={() => handleGeometrySelect(type)}
              onDragStart={(e) => handleDragStart(e, name)}
              onDragEnd={handleDragEnd}
              className="flex flex-col items-center justify-center rounded shadow text-white hover:bg-neutral-600 cursor-pointer p-2 select-none"
              title={`Click to add ${name} or drag to scene`}
            >
              <Icon size={isMaximized ? 32 : geometryCount > 4 ? 20 : 24} className="mb-1" />
              <span className={`text-center ${isMaximized ? 'text-xs' : geometryCount > 4 ? 'text-[10px]' : 'text-xs'}`}>
                {name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Floating Settings Panel */}
    {showSettings && (
      <div
        ref={settingsRef}
        className="fixed bg-neutral-700 border border-neutral-600 rounded-md shadow-lg pointer-events-auto w-80 h-96"
        style={{
          left: `${settingsPosition.x}px`,
          top: `${settingsPosition.y}px`,
          cursor: isDraggingSettings ? 'grabbing' : 'default',
          zIndex: 50
        }}
        onMouseDown={handleSettingsMouseDown}
      >
        {/* Settings Panel Title Bar */}
        <div className="flex items-center justify-between bg-neutral-700 border-b border-neutral-600 rounded-t-md px-3 py-1 settings-drag-handle cursor-grab">
          <div className="flex items-center space-x-2">
            <Move size={12} className="text-neutral-400" />
            <span className="text-white text-xs font-medium">Geometry Settings</span>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:bg-red-600 rounded text-white"
            title="Close"
          >
            <X size={12} />
          </button>
        </div>

        {/* Settings Panel Content */}
        <div className="p-4 h-80 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-white text-sm font-medium mb-2">Available Geometries</h3>
            <p className="text-neutral-400 text-xs mb-4">
              Select up to 8 geometries to display in the selector
            </p>
          </div>
          
          <div className="space-y-3">
            {allGeometries.map(({ name, type, icon: Icon, category }) => (
              <label key={type} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-neutral-600">
                <input
                  type="checkbox"
                  checked={selectedGeometries.includes(type)}
                  onChange={() => handleGeometryToggle(type)}
                  className="w-4 h-4 accent-blue-600"
                  disabled={
                    (selectedGeometries.includes(type) && selectedGeometries.length === 1) ||
                    (!selectedGeometries.includes(type) && selectedGeometries.length >= 8)
                  }
                />
                <Icon size={20} className="text-white" />
                <div className="flex-1">
                  <span className="text-white text-sm">{name}</span>
                  <span className="text-neutral-500 text-xs ml-2">({category})</span>
                </div>
              </label>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-neutral-600">
            <p className="text-neutral-400 text-xs">
              Selected: {selectedGeometries.length}/8 geometries
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
