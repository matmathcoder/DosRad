import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  MousePointer2,
  RotateCcw,
  Trash2,
  Move,
  X,
  Keyboard,
  Eye,
  Hand,
  Plus, 
  Minus,
  SquaresIntersect,
  Maximize2,
  Minus as MinusIcon,
} from 'lucide-react';
import collisionDetector from '../utils/collisionDetection';

export default function HelpOverlay({ isVisible, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Dragging state - Initialize to top right position (left of sidebar)
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 420, // Left of sidebar
    y: 84   // Below navigation bar
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const overlayRef = useRef();

  if (!isVisible) return null;

  const shortcuts = [
    {
      category: "Getting Started",
      items: [
        { keys: ["Drag & Drop"], icon: Move, desc: "Drag geometry from selector to scene", priority: "high" },
        { keys: ["Click"], icon: MousePointer2, desc: "Select object to manipulate", priority: "high" },
        { keys: ["F1"], icon: Keyboard, desc: "Show/hide this help panel", priority: "medium" },
      ]
    },
    {
      category: "Object Manipulation",
      items: [
        { keys: ["Select Tool"], icon: MousePointer2, desc: "Click to select object", priority: "high" },
        { keys: ["G"], icon: Move, desc: "Switch to Move mode", priority: "high" },
        { keys: ["R"], icon: RotateCcw, desc: "Switch to Rotate mode", priority: "high" },
        { keys: ["S"], icon: null, desc: "Switch to Scale mode (TransformControls)", priority: "high" },
        { keys: ["H"], icon: null, desc: "Toggle Custom Resize Handler", priority: "medium" },
        { keys: ["F"], icon: null, desc: "Toggle Floor Constraint", priority: "medium" },
        { keys: ["Drag Gizmo"], icon: Move, desc: "Move object with precision", priority: "high" },
        { keys: ["Ctrl", "+", "Alt", "+", "Drag"], icon: RotateCcw, desc: "Rotate object (in Move mode)", priority: "medium" },
        { keys: ["Ctrl", "+", "G"], icon: Hand, desc: "Toggle Move mode", priority: "medium" },
        { keys: ["Ctrl", "+", "X"], icon: Trash2, desc: "Delete selected object", priority: "high" },
        { keys: ["Shift", "+", "Click"], icon: Trash2, desc: "Reduce volume (carve/hollow)", priority: "medium" },
        { keys: ["Ctrl", "+", "Z"], icon: RotateCcw, desc: "Undo last action", priority: "high" },
        { keys: ["Ctrl", "+", "Y"], icon: RotateCcw, desc: "Redo last action", priority: "high" },
      ]
    },
    {
      category: "Keyboard Movement",
      items: [
        { keys: ["↑"], icon: ArrowUp, desc: "Move forward (Z-axis)" },
        { keys: ["↓"], icon: ArrowDown, desc: "Move backward (Z-axis)" },
        { keys: ["←"], icon: ArrowLeft, desc: "Move left (X-axis)" },
        { keys: ["→"], icon: ArrowRight, desc: "Move right (X-axis)" },
        { keys: ["Q"], icon: null, desc: "Move up (Y-axis)" },
        { keys: ["E"], icon: null, desc: "Move down (Y-axis)" },
      ]
    },
    {
      category: "CSG Operations",
      items: [
        { keys: ["Union Tool"], icon: Plus, desc: "Combine two volumes (A + B)", priority: "medium" },
        { keys: ["Subtract Tool"], icon: Minus, desc: "Subtract volume B from A", priority: "medium" },
        { keys: ["Intersect Tool"], icon: SquaresIntersect, desc: "Keep only intersection", priority: "medium" },
        { keys: ["Select 2 Objects"], icon: MousePointer2, desc: "Click two objects to perform operation", priority: "high" },
      ]
    },
    {
      category: "Camera Controls",
      items: [
        { keys: ["Mouse Drag"], icon: Eye, desc: "Orbit camera", priority: "high" },
        { keys: ["Mouse Wheel"], icon: null, desc: "Zoom in/out", priority: "high" },
        { keys: ["H"], icon: null, desc: "Save Home view", priority: "medium" },
        { keys: ["Shift", "+", "H"], icon: null, desc: "Go to Home view", priority: "medium" },
        { keys: ["F"], icon: null, desc: "Frame all objects", priority: "medium" },
        { keys: ["Ctrl", "+", "F"], icon: null, desc: "Frame selected object", priority: "medium" },
        { keys: ["P"], icon: null, desc: "Toggle perspective/orthographic", priority: "medium" },
      ]
    },
    {
      category: "General",
      items: [
        { keys: ["Esc"], icon: null, desc: "Deselect object", priority: "high" },
        { keys: ["F1"], icon: Keyboard, desc: "Toggle this help", priority: "medium" },
        { keys: ["Space"], icon: null, desc: "Reset tool to Select", priority: "medium" },
      ]
    }
  ];

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
    
    // Check if the new position is safe (no collision with navigation and within bounds)
    const componentWidth = isMaximized ? 600 : 400;
    const componentHeight = isMaximized ? 600 : 400;
    
    const isSafe = collisionDetector.isPositionSafe(
      'helpOverlay',
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

  const handleResize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div 
      ref={overlayRef}
      className={`bg-neutral-700 rounded-lg shadow-lg pointer-events-auto absolute ${
        isMaximized ? 'w-[600px] h-[600px]' : 'w-[400px]'
      } ${isMinimized ? 'h-8' : 'h-auto'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 50
      }}
      onMouseDown={handleMouseDown}
    >
        {/* Title Bar */}
        <div className="flex items-center justify-between bg-neutral-700 border-b border-neutral-600 rounded-t-lg px-3 py-1 drag-handle cursor-grab">
          <div className="flex items-center space-x-2">
            <Keyboard size={12} className="text-neutral-400" />
            <span className="text-white text-xs font-medium">Keyboard Shortcuts</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-neutral-600 rounded text-white"
              title="Minimize"
            >
              <MinusIcon size={12} />
            </button>
            <button
              onClick={handleResize}
              className="p-1 hover:bg-neutral-600 rounded text-white"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <Maximize2 size={12} />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-600 rounded text-white"
              title="Close"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isMinimized && (
          <div className={`p-3 overflow-y-auto ${
            isMaximized ? 'h-[572px]' : 'h-[372px]'
          }`}>
            <div className="grid grid-cols-1 gap-4">
              {shortcuts.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-2">
                  <h3 className="text-blue-400 font-medium text-sm border-b border-neutral-600 pb-1">
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className={`flex items-center gap-2 p-1 rounded hover:bg-neutral-600 transition-colors ${
                        item.priority === 'high' ? 'border-l-2 border-green-500 pl-2' : ''
                      }`}>
                        {/* Priority Indicator */}
                        {item.priority === 'high' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        )}
                        
                        {/* Icon */}
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                          {item.icon && <item.icon size={12} className="text-neutral-400" />}
                        </div>
                        
                        {/* Keys */}
                        <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
                          {item.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <kbd className={`px-1 py-0.5 text-white text-[10px] rounded font-mono border ${
                                item.priority === 'high' 
                                  ? 'bg-green-600 border-green-500' 
                                  : 'bg-neutral-600 border-neutral-500'
                              }`}>
                                {key}
                              </kbd>
                              {keyIndex < item.keys.length - 1 && (
                                <span className="text-neutral-400 text-[10px]">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        
                        {/* Description */}
                        <span className="text-neutral-300 text-xs flex-1 min-w-0">
                          {item.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-neutral-600">
              <div className="text-center text-neutral-400 text-xs">
                <p className="mb-2">💡 <strong>Pro Tip:</strong> Use the sidebar tools for advanced controls</p>
                <p className="mb-2">Press <kbd className="px-1 py-0.5 bg-neutral-600 rounded text-[10px]">F1</kbd> to show/hide this help</p>
                
                {/* Progressive Learning Path */}
                        <div className="mt-3 p-2 bg-neutral-600 rounded">
          <h4 className="text-green-400 font-medium text-xs mb-1">Learning Path</h4>
          <div className="text-xs text-neutral-300 space-y-1">
            <div>1. <strong>Start:</strong> Drag geometry to scene</div>
            <div>2. <strong>Select:</strong> Click Select tool, then click object</div>
            <div>3. <strong>Transform:</strong> Press G (move), R (rotate), S (scale)</div>
            <div>4. <strong>Advanced:</strong> Try CSG operations</div>
          </div>
        </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
