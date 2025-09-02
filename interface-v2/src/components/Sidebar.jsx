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
  Split
} from 'lucide-react';

export default function Sidebar({ selectedTool, onToolSelect }) {

  const tools = [
    { icon: MousePointer2, name: 'Select', id: 'select', description: 'Direct object manipulation' },
    { icon: Hand, name: 'Move', id: 'pan', description: 'Move/rotate objects (Ctrl+Alt for rotation)' },
    { icon: House, name: 'Home', id: 'home', description: 'Return to saved viewpoint' },
    { icon: HousePlus, name: 'Add Home', id: 'add-home', description: 'Save current viewpoint' },
    { icon: Eye, name: 'View All', id: 'view', description: 'Frame entire scene' },
    { icon: Crosshair, name: 'Target', id: 'target', description: 'Zoom to selected object' },
    { icon: Cctv, name: 'Camera', id: 'camera', description: 'Toggle perspective/orthographic' },
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
    <div className="bg-neutral-700 rounded-lg shadow-lg pointer-events-auto">
      <div className="flex flex-col p-2 gap-1">
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
              className={`p-3 rounded-md hover:bg-neutral-600 cursor-pointer group relative ${
                isActive ? (isCSGTool ? 'bg-yellow-600 ring-2 ring-yellow-400' : 'bg-neutral-600') : ''
              }`}
              title={`${name}: ${description}${isCSGTool ? '\n\nClick to activate, then select two objects in the scene' : ''}`}
            >
              <Icon 
                size={20} 
                className={`${isActive && isCSGTool ? 'text-black' : 'text-white'} ${isActive && !isCSGTool ? 'text-neutral-300' : ''}`} 
              />
              
              {/* Enhanced Tooltip */}
              <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                <div className="font-medium">{name}</div>
                <div className="text-neutral-300">{description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
