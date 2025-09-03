import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  MousePointer2,
  Move,
  RotateCcw,
  Info,
  X,
  Maximize2,
  Minus as MinusIcon,
  Monitor,
  Camera,
  MousePointer
} from 'lucide-react';

export default function ContextualHelp({ selectedTool, hasSelectedObject, hasObjects, cameraMode, windowSize }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Dragging state - Initialize to top right position (left of sidebar)
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 320, // Left of sidebar
    y: 84   // Below navigation bar
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const helpRef = useRef();
  const getHelpMessage = () => {
    if (!hasObjects) {
      return {
        title: "Get Started",
        message: "Use the Geometry Selector (top-left) to add objects to the scene",
        icon: Info,
        color: "text-blue-400",
        nextSteps: [
          "Drag geometry from selector to scene",
          "Click geometry buttons to add at random position",
          "Use F1 for keyboard shortcuts help"
        ]
      };
    }

    if (selectedTool === 'target') {
      return {
        title: "Target Mode",
        message: "Click any object to zoom and focus on it",
        icon: MousePointer2,
        color: "text-yellow-400",
        nextSteps: [
          "Click an object to zoom to it",
          "Press Space to return to Select tool",
          "Use H to save current view as home"
        ]
      };
    }

    if (!hasSelectedObject && (selectedTool === 'select' || selectedTool === 'pan')) {
      return {
        title: "Select an Object",
        message: "Click on any object to select and manipulate it",
        icon: MousePointer2,
        color: "text-green-400",
        nextSteps: [
          "Click on any object in the scene",
          "Use Ctrl+G to switch to Move mode",
          "Press F to frame all objects"
        ]
      };
    }

    if (hasSelectedObject) {
      if (selectedTool === 'pan') {
        return {
          title: "Move Mode Active",
          message: "Drag the gizmo to move • Hold Ctrl to rotate",
          icon: RotateCcw,
          color: "text-purple-400",
          nextSteps: [
            "Drag colored arrows to move",
            "Hold Ctrl+Alt while dragging to rotate",
            "Use arrow keys for precise movement",
            "Press Ctrl+X to delete selected object"
          ]
        };
      }

      return {
        title: "Object Selected",
        message: "Use arrow keys to move • Drag gizmo for precision • Ctrl+X to delete",
        icon: Move,
        color: "text-green-400",
        nextSteps: [
          "Use arrow keys to move object",
          "Drag gizmo handles for precise control",
          "Press Ctrl+X to delete",
          "Use Shift+Click to reduce volume"
        ]
      };
    }

    return null;
  };

  const getNextHelpTips = () => {
    const tips = [];
    
    // General tips based on current state
    if (!hasObjects) {
      tips.push("💡 Try dragging different geometries to see how they look");
      tips.push("💡 Use the camera tool to switch between perspective/orthographic");
    } else if (!hasSelectedObject) {
      tips.push("💡 Select an object to start manipulating it");
      tips.push("💡 Use Ctrl+G to switch to Move mode for easier manipulation");
    } else {
      tips.push("💡 Try Shift+Click to reduce volume of selected object");
      tips.push("💡 Use CSG tools to combine or subtract objects");
    }

    // Tool-specific tips
    if (selectedTool === 'csg-union' || selectedTool === 'csg-subtract' || selectedTool === 'csg-intersect') {
      tips.push("💡 Select two objects to perform the CSG operation");
      tips.push("💡 The result will replace both selected objects");
    }

    if (selectedTool === 'camera') {
      tips.push("💡 Switch between perspective and orthographic views");
      tips.push("💡 Use H to save current view as home position");
    }

    return tips;
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
    const maxX = window.innerWidth - (isMaximized ? 400 : 300) - margin;
    const maxY = window.innerHeight - (isMaximized ? 400 : 200) - margin;
    
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

  const handleResize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const helpData = getHelpMessage();

  return (
    <div 
      ref={helpRef}
      className={`bg-neutral-700 rounded-lg shadow-lg pointer-events-auto absolute ${
        isMaximized ? 'w-[400px] h-[400px]' : 'w-[300px]'
      } ${isMinimized ? 'h-8' : 'h-auto'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 40
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-neutral-700 border-b border-neutral-600 rounded-t-lg px-3 py-1 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Info size={12} className="text-neutral-400" />
          <span className="text-white text-xs font-medium">Contextual Help</span>
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
        </div>
      </div>

      {/* Content Area */}
      {!isMinimized && (
        <div className={`p-3 overflow-y-auto ${
          isMaximized ? 'h-[372px]' : 'h-[172px]'
        }`}>
          {/* System Info Section */}
          <div className="mb-3 pb-2 border-b border-neutral-600">
            <h3 className="text-blue-400 font-medium text-xs mb-2">System Info</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Monitor size={10} className="text-neutral-400" />
                <span className="text-neutral-300">Window:</span>
                <span className="text-white">{windowSize?.width || 0}×{windowSize?.height || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Camera size={10} className="text-neutral-400" />
                <span className="text-neutral-300">Camera:</span>
                <span className="text-white capitalize">{cameraMode || 'perspective'}</span>
              </div>
              <div className="flex items-center gap-1">
                <MousePointer size={10} className="text-neutral-400" />
                <span className="text-neutral-300">Tool:</span>
                <span className="text-white capitalize">{selectedTool || 'none'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-neutral-300">Objects:</span>
                <span className="text-white">{hasObjects ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Contextual Help Section */}
          {helpData && (
            <div>
              <h3 className="text-green-400 font-medium text-xs mb-2">Current Help</h3>
              <div className="flex items-start gap-2 p-2 rounded bg-neutral-600">
                {helpData.icon && <helpData.icon size={12} className={`${helpData.color} flex-shrink-0 mt-0.5`} />}
                <div className="min-w-0">
                  <h4 className="text-white font-medium text-xs mb-1">{helpData.title}</h4>
                  <p className="text-neutral-300 text-xs leading-relaxed">{helpData.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps Section */}
          {helpData?.nextSteps && (
            <div className="mt-3 pt-2 border-t border-neutral-600">
              <h3 className="text-blue-400 font-medium text-xs mb-2">Next Steps</h3>
              <div className="space-y-1">
                {helpData.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-400 font-bold">→</span>
                    <span className="text-neutral-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helpful Tips Section */}
          <div className="mt-3 pt-2 border-t border-neutral-600">
            <h3 className="text-yellow-400 font-medium text-xs mb-2">Helpful Tips</h3>
            <div className="space-y-1">
              {getNextHelpTips().map((tip, index) => (
                <div key={index} className="text-xs text-neutral-300 leading-relaxed">
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard hints for selected object */}
          {hasSelectedObject && (
            <div className="mt-3 pt-2 border-t border-neutral-600">
              <h3 className="text-yellow-400 font-medium text-xs mb-2">Quick Controls</h3>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>Move:</span>
                <div className="flex items-center gap-1">
                  <ArrowUp size={10} />
                  <ArrowDown size={10} />
                  <ArrowLeft size={10} />
                  <ArrowRight size={10} />
                  <span className="mx-1">•</span>
                  <kbd className="px-1 py-0.5 bg-neutral-600 rounded text-[10px]">Q</kbd>
                  <kbd className="px-1 py-0.5 bg-neutral-600 rounded text-[10px]">E</kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
