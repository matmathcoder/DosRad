import React, { useState, useRef, useEffect } from 'react';
import { Box, Eclipse, Cylinder, Cone, X, Maximize2, Minus, Move } from 'lucide-react';

export default function GeometrySelector({ onGeometrySelect }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Dragging state - Initialize to original position (top left)
  const [position, setPosition] = useState({ 
    x: 20,  // Original left margin (ml-5 = 20px) 
    y: 84   // Original top position (top-16 + mt-5 = 64 + 20px)
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const selectorRef = useRef();

  const geometries = [
    { name: 'Cube', icon: Box },
    { name: 'Sphere', icon: Eclipse },
    { name: 'Cylinder', icon: Cylinder },
    { name: 'Cone', icon: Cone },
  ];

  const handleGeometrySelect = (geometryName) => {
    console.log(`Selected geometry: ${geometryName}`);
    if (onGeometrySelect) {
      onGeometrySelect(geometryName.toLowerCase());
    }
  };

  // Drag and drop handlers for geometry buttons
  const handleDragStart = (e, geometryName) => {
    console.log(`Starting drag for: ${geometryName}`);
    e.dataTransfer.setData('text/plain', geometryName.toLowerCase());
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback to the dragged element
    e.target.style.opacity = '0.5';
    e.target.style.transform = 'scale(0.9)';
    
    // Create a custom drag image with better styling
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      background: rgba(34, 197, 94, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(34, 197, 94, 1);
      pointer-events: none;
      position: absolute;
      top: -1000px;
      left: -1000px;
      z-index: 10000;
    `;
    dragImage.textContent = `Drop ${geometryName} in scene`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 75, 20);
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleDragEnd = (e) => {
    console.log('Drag ended');
    // Reset visual feedback
    e.target.style.opacity = '1';
    e.target.style.transform = 'scale(1)';
  };

  const handleClose = () => {
    console.log('Geometry selector closed');
    // TODO: Implement close functionality
  };

  const handleResize = () => {
    setIsMaximized(!isMaximized);
    console.log(`Geometry selector ${isMaximized ? 'minimized' : 'maximized'}`);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    console.log(`Geometry selector ${isMinimized ? 'restored' : 'minimized'}`);
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
    
    // Keep within screen bounds with margins
    const margin = 20;
    const maxX = window.innerWidth - (isMaximized ? 320 : 160) - margin; // selector width
    const maxY = window.innerHeight - (isMaximized ? 320 : 160) - margin; // selector height
    
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  return (
    <div 
      ref={selectorRef}
      className={`rounded-md bg-neutral-700 pointer-events-auto absolute ${
        isMaximized ? 'w-80 h-80' : 'w-40'
      } ${isMinimized ? 'h-8' : 'h-auto'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
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
        <div className={`grid grid-cols-2 grid-rows-2 p-2 ${
          isMaximized ? 'h-72' : 'h-32'
        }`}>
          {geometries.map(({ name, icon: Icon }) => (
            <div 
              key={name}
              draggable="true"
              onClick={() => handleGeometrySelect(name)}
              onDragStart={(e) => handleDragStart(e, name)}
              onDragEnd={handleDragEnd}
              className="flex flex-col items-center justify-center rounded shadow text-white hover:bg-neutral-600 cursor-pointer p-2 select-none"
              title={`Click to add ${name} or drag to scene`}
            >
              <Icon size={isMaximized ? 48 : 36} className="mb-1" />
              <span className={`text-center ${isMaximized ? 'text-sm' : 'text-xs'}`}>
                {name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
