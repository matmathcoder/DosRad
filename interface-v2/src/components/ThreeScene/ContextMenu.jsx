import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Copy, MoveDiagonal, Settings, Box, Droplets, BrickWall } from 'lucide-react';

export default function ContextMenu({ 
  isVisible, 
  position, 
  onClose, 
  onDelete, 
  onCopy, 
  onDuplicate, 
  onOpenGeometryProperties,
  onOpenVolumeProperties,
  onOpenMeshProperties,
  selectedObject 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [menuPosition, setMenuPosition] = useState(position);
  const menuRef = useRef();

  // Update position when prop changes
  useEffect(() => {
    setMenuPosition(position);
  }, [position]);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Dragging functions
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - menuPosition.x,
        y: e.clientY - menuPosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const margin = 20;
    const maxX = window.innerWidth - 200 - margin; // menu width
    const maxY = window.innerHeight - 300 - margin; // approximate menu height
    
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));
    
    setMenuPosition({ x: boundedX, y: boundedY });
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

  const handleAction = (action) => {
    switch (action) {
      case 'delete':
        onDelete();
        break;
      case 'copy':
        onCopy();
        break;
      case 'duplicate':
        onDuplicate();
        break;
      case 'geometry':
        onOpenGeometryProperties();
        break;
      case 'volume':
        onOpenVolumeProperties();
        break;
      case 'mesh':
        onOpenMeshProperties();
        break;
    }
    onClose();
  };

  if (!isVisible || !selectedObject) return null;

  return (
    <div 
      ref={menuRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-48 pointer-events-auto absolute z-50"
      style={{
        left: `${menuPosition.x}px`,
        top: `${menuPosition.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-700 rounded-t-lg px-3 py-2 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Settings size={14} className="text-neutral-400" />
          <h3 className="text-white font-medium text-sm">Object Menu</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-600 rounded text-white"
          title="Close"
        >
          <X size={12} />
        </button>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {/* Object Info */}
        <div className="px-3 py-2 border-b border-neutral-600">
          <div className="text-white text-xs font-medium truncate">
            {selectedObject.userData?.volumeName || selectedObject.name || 'Unnamed Object'}
          </div>
          <div className="text-neutral-400 text-xs">
            {selectedObject.geometry?.type || 'Unknown Type'}
          </div>
        </div>

        {/* Actions */}
        <div className="py-1">
          {/* Delete */}
          <button
            onClick={() => handleAction('delete')}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-neutral-700 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
            <span className="text-sm">Delete</span>
          </button>

          {/* Copy */}
          <button
            onClick={() => handleAction('copy')}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-neutral-700 text-white hover:text-neutral-200 transition-colors"
          >
            <Copy size={14} />
            <span className="text-sm">Copy</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={() => handleAction('duplicate')}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-neutral-700 text-white hover:text-neutral-200 transition-colors"
          >
            <MoveDiagonal size={14} />
            <span className="text-sm">Duplicate</span>
          </button>
        </div>

        {/* Properties Section */}
        <div className="border-t border-neutral-600 py-1">
          <div className="px-3 py-1">
            <span className="text-neutral-400 text-xs font-medium">Properties</span>
          </div>
          
          {/* Geometry Properties */}
          <button
            onClick={() => handleAction('geometry')}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-neutral-700 text-white hover:text-neutral-200 transition-colors"
          >
            <Box size={14} />
            <span className="text-sm">Geometry</span>
          </button>

          {/* Volume Properties */}
          <button
            onClick={() => handleAction('volume')}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-neutral-700 text-white hover:text-neutral-200 transition-colors"
          >
            <Droplets size={14} />
            <span className="text-sm">Volume</span>
          </button>

          {/* Mesh Properties */}
          <button
            onClick={() => handleAction('mesh')}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-neutral-700 text-white hover:text-neutral-200 transition-colors"
          >
            <BrickWall size={14} />
            <span className="text-sm">Mesh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
