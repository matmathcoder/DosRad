import React, { useState, useRef, useEffect } from 'react';
import { Box, Eclipse, Cylinder, Cone, X, Maximize2, Minus, Move } from 'lucide-react';
import collisionDetector from '../utils/collisionDetection';

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
    if (onGeometrySelect) {
      onGeometrySelect(geometryName.toLowerCase());
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
    
    // Check if the new position is safe (no collision and within bounds)
    const componentWidth = isMaximized ? 320 : 160;
    const componentHeight = isMinimized ? 32 : (isMaximized ? 320 : 160);
    
    const isSafe = collisionDetector.isPositionSafe(
      'geometrySelector',
      { x: newX, y: newY },
      componentWidth,
      componentHeight,
      window.innerWidth,
      window.innerHeight
    );
    
    // Only update position if it's safe
    if (isSafe) {
      setPosition({ x: newX, y: newY });
    }
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

  // Register with collision detector
  useEffect(() => {
    const getBounds = () => ({
      x: position.x,
      y: position.y,
      width: isMaximized ? 320 : 160,
      height: isMinimized ? 32 : (isMaximized ? 320 : 160)
    });

    collisionDetector.registerComponent('geometrySelector', getBounds);

    return () => {
      collisionDetector.unregisterComponent('geometrySelector');
    };
  }, [position, isMinimized, isMaximized]);

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
