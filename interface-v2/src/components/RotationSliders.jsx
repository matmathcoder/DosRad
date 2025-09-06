import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, RotateCw, X, Maximize2, Minus, Move } from 'lucide-react';

export default function RotationSliders({ onRotationChange }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [horizontalRotation, setHorizontalRotation] = useState(0);
  const [verticalRotation, setVerticalRotation] = useState(0);
  const [isDragging, setIsDragging] = useState({ horizontal: false, vertical: false });
  const horizontalWheelRef = useRef();
  const verticalWheelRef = useRef();
  
  // Panel dragging state - Initialize to original position (below GeometrySelector)
  const [position, setPosition] = useState({ 
    x: 20,  // Original left margin (ml-5 = 20px)
    y: 320  // Original top position (top-80 = 320px)
  });
  const [isPanelDragging, setIsPanelDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef();

  const handleClose = () => {
    // TODO: Implement close functionality
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    console.log(`Rotation sliders ${isMinimized ? 'restored' : 'minimized'}`);
  };

  const handleWheelInteraction = (wheelType, event, rect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const degrees = (angle * 180) / Math.PI;
    const normalizedDegrees = ((degrees + 360) % 360);

    if (wheelType === 'horizontal') {
      setHorizontalRotation(normalizedDegrees);
      onRotationChange && onRotationChange({ horizontal: normalizedDegrees, vertical: verticalRotation });
    } else {
      setVerticalRotation(normalizedDegrees);
      onRotationChange && onRotationChange({ horizontal: horizontalRotation, vertical: normalizedDegrees });
    }
  };

  const handleWheelMouseDown = (wheelType) => (event) => {
    setIsDragging(prev => ({ ...prev, [wheelType]: true }));
    const rect = event.currentTarget.getBoundingClientRect();
    handleWheelInteraction(wheelType, event, rect);
  };

  const handleWheelMouseMove = (event) => {
    if (isDragging.horizontal && horizontalWheelRef.current) {
      const rect = horizontalWheelRef.current.getBoundingClientRect();
      handleWheelInteraction('horizontal', event, rect);
    }
    if (isDragging.vertical && verticalWheelRef.current) {
      const rect = verticalWheelRef.current.getBoundingClientRect();
      handleWheelInteraction('vertical', event, rect);
    }
  };

  const handleWheelMouseUp = () => {
    setIsDragging({ horizontal: false, vertical: false });
  };

  useEffect(() => {
    if (isDragging.horizontal || isDragging.vertical) {
      document.addEventListener('mousemove', handleWheelMouseMove);
      document.addEventListener('mouseup', handleWheelMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleWheelMouseMove);
        document.removeEventListener('mouseup', handleWheelMouseUp);
      };
    }
  }, [isDragging.horizontal, isDragging.vertical]);

  const resetRotation = () => {
    setHorizontalRotation(0);
    setVerticalRotation(0);
    onRotationChange && onRotationChange({ horizontal: 0, vertical: 0 });
  };

  // Panel dragging functions
  const handleMouseDown = (e) => {
    // Only start panel dragging if clicking on the drag handle and not on wheel controls or buttons
    // But don't interfere with HTML5 drag and drop on the title bar
    if (e.target.closest('.drag-handle') && 
        !e.target.closest('.wheel-control') && 
        !e.target.closest('button') &&
        !e.target.closest('[draggable="true"]')) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanelDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanelDragging) return;
    
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within screen bounds with margins
    const margin = 20;
    const panelWidth = isMinimized ? 160 : 160; // w-40 = 160px (same as GeometrySelector)
    const panelHeight = isMinimized ? 32 : 300; // approximate panel height
    const maxX = window.innerWidth - panelWidth - margin;
    const maxY = window.innerHeight - panelHeight - margin;
    
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsPanelDragging(false);
  };

  useEffect(() => {
    if (isPanelDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanelDragging]);

  const WheelComponent = ({ rotation, onMouseDown, wheelRef, label, icon: Icon }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-neutral-400" />
        <span className="text-white text-xs font-medium">{label}</span>
      </div>
      <div className="relative">
        <div
          ref={wheelRef}
          onMouseDown={onMouseDown}
          className="w-20 h-20 rounded-full border-4 border-neutral-600 bg-neutral-800 cursor-grab active:cursor-grabbing hover:border-neutral-500 relative wheel-control"
          style={{ userSelect: 'none' }}
        >
          {/* Wheel markings */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <div
              key={angle}
              className="absolute w-0.5 h-3 bg-neutral-500"
              style={{
                top: '2px',
                left: '50%',
                transformOrigin: '50% 38px',
                transform: `translateX(-50%) rotate(${angle}deg)`,
              }}
            />
          ))}
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-neutral-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Rotation indicator */}
          <div
            className="absolute w-1 h-8 bg-white rounded-full"
            style={{
              top: '6px',
              left: '50%',
              transformOrigin: '50% 34px',
              transform: `translateX(-50%) rotate(${rotation}deg)`,
            }}
          />
        </div>
        
        {/* Degree display */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <span className="text-white text-xs font-mono bg-neutral-700 px-2 py-1 rounded">
            {Math.round(rotation)}°
          </span>
        </div>
      </div>
    </div>
  );

  const handleDragStart = (e) => {
    console.log('RotationSliders: Starting drag');
    e.dataTransfer.setData('component-type', 'rotation-sliders');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Scene Rotation',
      type: 'rotation-sliders',
      horizontalRotation,
      verticalRotation
    }));
    e.dataTransfer.effectAllowed = 'move';
    console.log('RotationSliders: Drag data set', e.dataTransfer.types);
  };

  return (
    <div 
      ref={panelRef}
      className={`rounded-md bg-neutral-700 pointer-events-auto absolute ${
        isMinimized ? 'w-40 h-8' : 'w-40'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isPanelDragging ? 'grabbing' : 'default',
        zIndex: 50
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div 
        className="flex items-center justify-between bg-neutral-800 rounded-t-md px-3 py-1 drag-handle cursor-grab"
        draggable="true"
        onDragStart={handleDragStart}
      >
        <div className="flex items-center space-x-2">
          <Move size={12} className="text-neutral-400" />
          <span className="text-white text-xs font-medium">Scene Rotation</span>
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
        <div className="p-4 space-y-6">
          {/* Horizontal Rotation Wheel */}
          <WheelComponent
            rotation={horizontalRotation}
            onMouseDown={handleWheelMouseDown('horizontal')}
            wheelRef={horizontalWheelRef}
            label="Horizontal"
            icon={RotateCw}
          />

          {/* Vertical Rotation Wheel */}
          <WheelComponent
            rotation={verticalRotation}
            onMouseDown={handleWheelMouseDown('vertical')}
            wheelRef={verticalWheelRef}
            label="Vertical"
            icon={RotateCcw}
          />

          {/* Reset Button */}
          <div className="flex justify-center pt-2 border-t border-neutral-600">
            <button
              onClick={resetRotation}
              className="px-3 py-1 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
