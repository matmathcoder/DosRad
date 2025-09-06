import React, { useState } from 'react';
import { 
  MousePointer2, 
  Hand, 
  House, 
  HousePlus, 
  Eye, 
  Crosshair, 
  Cctv,
  Plus,
  Minus,
  SquaresIntersect,
  Split,
  Move3D,
  MoveDiagonal,
  RotateCcw
} from 'lucide-react';

export default function Sidebar({ selectedTool, onToolSelect, cameraMode }) {

  const tools = [
    { icon: MousePointer2, name: 'Select', id: 'select', description: 'Select and move objects with transform controls' },
    { icon: Hand, name: 'Move', id: 'pan', description: 'Move/rotate objects (Ctrl+Alt for rotation)' },
    { icon: MoveDiagonal, name: 'Resize', id: 'resize', description: 'Resize objects with vertex handlers and wireframe box' },
    { icon: RotateCcw, name: 'Rotate', id: 'rotate', description: 'Rotate selected object with smooth mouse control' },
    { icon: House, name: 'Home', id: 'home', description: 'Return to saved viewpoint' },
    { icon: HousePlus, name: 'Add Home', id: 'add-home', description: 'Save current viewpoint' },
    { icon: Eye, name: 'View All', id: 'view', description: 'Frame entire scene' },
    { icon: Crosshair, name: 'Target', id: 'target', description: 'Zoom to selected object' },
    { icon: Cctv, name: 'Camera', id: 'camera', description: `Toggle perspective/orthographic (Current: ${cameraMode || 'perspective'})` },
    // CSG Operations separator
    { separator: true },
    { icon: Plus, name: 'Union', id: 'csg-union', description: 'Combine two volumes (A + B)' },
    { icon: Minus, name: 'Subtract', id: 'csg-subtract', description: 'Subtract volume B from A (A - B)' },
    { icon: SquaresIntersect, name: 'Intersect', id: 'csg-intersect', description: 'Keep only intersection (A ∩ B)' },
    { icon: Split, name: 'Split', id: 'csg-split', description: 'Split volume with cutting plane' }
  ];

  const handleToolClick = (toolId) => {
    const newSelectedTool = selectedTool === toolId ? null : toolId;
    onToolSelect(newSelectedTool);
    console.log(`Selected tool: ${toolId}`);
  };

  return (
    <div className="bg-neutral-700 rounded-lg shadow-lg pointer-events-auto max-h-[80vh] overflow-y-auto relative" style={{ zIndex: 20 }}>
      <div className="flex flex-col p-1 sm:p-2 gap-1">
        {tools.map((tool, index) => {
          // Handle separator
          if (tool.separator) {
            return (
              <div key={`separator-${index}`} className="border-t border-neutral-600 my-1"></div>
            );
          }

          const { icon: Icon, name, id, description } = tool;
          const isCSGTool = id.startsWith('csg-');
          const isActive = selectedTool === id;
          
          return (
            <button
              key={id}
              onClick={() => handleToolClick(id)}
              className={`p-2 sm:p-3 rounded-md hover:bg-neutral-600 cursor-pointer group relative ${
                isActive ? (isCSGTool ? 'bg-yellow-600 ring-2 ring-yellow-400' : 'bg-neutral-600') : ''
              }`}
              title={`${name}: ${description}${isCSGTool ? '\n\nClick to activate, then select two objects in the scene' : ''}`}
            >
              <Icon 
                size={18} 
                className={`${isActive && isCSGTool ? 'text-black' : 'text-white'} ${isActive && !isCSGTool ? 'text-neutral-300' : ''}`} 
              />
              
              {/* Enhanced Tooltip - Responsive */}
              <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 max-w-[200px] sm:max-w-none">
                <div className="font-medium">{name}</div>
                <div className="text-neutral-300 text-[10px] sm:text-xs">{description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
