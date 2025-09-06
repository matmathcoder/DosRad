import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Box,
  Eclipse, 
  Cylinder, 
  Cone, 
  Activity, 
  Database, 
  Zap, 
  FileText, 
  Settings,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Move,
  X,
  Minus
} from 'lucide-react';
import collisionDetector from '../utils/collisionDetection';

export default function Directory({ 
  isVisible, 
  onClose, 
  existingVolumes = [], 
  existingSensors = [], 
  existingCompositions = [],
  existingSpectra = [],
  onRenameObject,
  onDeleteObject,
  onSelectObject,
  onToggleVisibility,
  selectedObjectId
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({
    scene: true,
    objects: true,
    sources: true,
    compositions: true,
    sensors: true,
    spectra: true
  });
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  // Dragging state - Start lower to avoid Geometry Selector
  const [position, setPosition] = useState({ x: 20, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const directoryRef = useRef();
  
  // Resizing state
  const [size, setSize] = useState({ width: 350, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState('');

  // Get sources (volumes with isSource: true)
  const sources = existingVolumes.filter(volume => volume.userData?.isSource);
  
  // Get compositions from volumes
  const compositions = existingVolumes
    .map(volume => volume.userData?.composition)
    .filter(Boolean)
    .filter((comp, index, arr) => 
      arr.findIndex(c => c.name === comp.name) === index
    );

  const getResizeDirection = (e) => {
    const rect = directoryRef.current.getBoundingClientRect();
    const threshold = 8; // pixels from edge to trigger resize
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let direction = '';
    
    // Check if near right edge
    if (x >= rect.width - threshold) {
      direction += 'e'; // east
    }
    
    // Check if near bottom edge
    if (y >= rect.height - threshold) {
      direction += 's'; // south
    }
    
    // Check if near left edge
    if (x <= threshold) {
      direction += 'w'; // west
    }
    
    // Check if near top edge
    if (y <= threshold) {
      direction += 'n'; // north
    }
    
    return direction;
  };

  const getResizeCursor = () => {
    switch (resizeDirection) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'default';
    }
  };

  const getResizeCursorFromDirection = (direction) => {
    switch (direction) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'default';
    }
  };

  const handleMouseDown = (e) => {
    // Check if clicking on resize handle
    const resizeDir = getResizeDirection(e);
    if (resizeDir) {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeDirection(resizeDir);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height
      });
      return;
    }
    
    // Check if clicking on drag handle
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
    e.preventDefault();
    
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = position.x;
      let newY = position.y;
      
      // Apply resize based on direction
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(200, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(200, resizeStart.height + deltaY);
      }
      if (resizeDirection.includes('w')) {
        newWidth = Math.max(200, resizeStart.width - deltaX);
        newX = position.x + (resizeStart.width - newWidth);
      }
      if (resizeDirection.includes('n')) {
        newHeight = Math.max(200, resizeStart.height - deltaY);
        newY = position.y + (resizeStart.height - newHeight);
      }
      
      // Check if the new position and size are safe
      const isSafe = collisionDetector.isPositionSafe(
        'directory',
        { x: newX, y: newY },
        newWidth,
        newHeight,
        window.innerWidth,
        window.innerHeight
      );
      
      if (isSafe) {
        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    } else if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Check if the new position is safe (no collision and within bounds)
      const componentWidth = size.width;
      const componentHeight = isMinimized ? 32 : size.height;
      
      const isSafe = collisionDetector.isPositionSafe(
        'directory',
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
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  // Register with collision detector
  useEffect(() => {
    const getBounds = () => ({
      x: position.x,
      y: position.y,
      width: size.width,
      height: isMinimized ? 32 : size.height
    });

    collisionDetector.registerComponent('directory', getBounds);

    return () => {
      collisionDetector.unregisterComponent('directory');
    };
  }, [position, size, isMinimized]);

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const startEdit = (itemId, currentName) => {
    setEditingItem(itemId);
    setEditValue(currentName);
  };

  const saveEdit = () => {
    if (editingItem && editValue.trim() && onRenameObject) {
      onRenameObject(editingItem, editValue.trim());
    }
    setEditingItem(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleRightClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (item.type === 'folder') return;
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is outside the directory component
      if (directoryRef.current && !directoryRef.current.contains(e.target)) {
        closeContextMenu();
        // Optionally clear selection when clicking outside
        // setSelectedItemId(null);
      }
    };
    
    const handleKeyDown = (e) => {
      // Handle F2 for rename
      if (e.key === 'F2' && selectedItemId) {
        e.preventDefault();
        e.stopPropagation();
        
        const findItem = (items, id) => {
          for (const item of items) {
            if (item.id === id) {
              return item;
            }
            if (item.children) {
              const found = findItem(item.children, id);
              if (found) return found;
            }
          }
          return null;
        };
        
        const selectedItem = findItem(directoryStructure, selectedItemId);
        if (selectedItem && selectedItem.type !== 'folder') {
          startEdit(selectedItem.id, selectedItem.name);
        }
      }
      
      // Handle Escape to cancel editing
      if (e.key === 'Escape') {
        if (editingItem) {
          cancelEdit();
        } else if (contextMenu) {
          closeContextMenu();
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItemId, editingItem, contextMenu, onDeleteObject]);

  const getObjectIcon = (type) => {
    switch (type) {
      case 'cube': return <Box size={14} className="text-blue-400" />;
      case 'sphere': return <Eclipse size={14} className="text-green-400" />;
      case 'cylinder': return <Cylinder size={14} className="text-yellow-400" />;
      case 'cone': return <Cone size={14} className="text-purple-400" />;
      default: return <Box size={14} className="text-gray-400" />;
    }
  };

  const renderItem = (item, level = 0) => {
    const isExpanded = expandedFolders[item.id];
    const isSelected = selectedItemId === item.id;
    const isEditing = editingItem === item.id;
    
    return (
      <div key={item.id} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 hover:bg-neutral-600 cursor-pointer group ${
            isSelected ? 'bg-blue-600' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.id);
            } else {
              setSelectedItemId(item.id);
              if (onSelectObject) {
                onSelectObject(item);
              }
            }
          }}
          onContextMenu={(e) => handleRightClick(e, item)}
        >
          {/* Expand/Collapse Icon */}
          {item.type === 'folder' && (
            <div className="mr-1">
              {isExpanded ? (
                <ChevronDown size={12} className="text-neutral-400" />
              ) : (
                <ChevronRight size={12} className="text-neutral-400" />
              )}
            </div>
          )}
          
          {/* Item Icon */}
          <div className="mr-2">
            {item.type === 'folder' ? (
              isExpanded ? (
                <FolderOpen size={14} className="text-yellow-400" />
              ) : (
                <Folder size={14} className="text-yellow-400" />
              )
            ) : (
              getObjectIcon(item.objectType)
            )}
          </div>
          
          {/* Item Name */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={saveEdit}
                className="w-full bg-neutral-700 text-white text-xs px-1 py-0.5 rounded border border-neutral-500 focus:outline-none focus:border-blue-400"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-white text-xs truncate">{item.name}</span>
            )}
          </div>
          
          {/* Action Buttons */}
          {!isEditing && item.type !== 'folder' && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(item.id, item.name);
                }}
                className="p-1 hover:bg-neutral-500 rounded"
                title="Rename"
              >
                <Edit2 size={10} className="text-neutral-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleVisibility) {
                    onToggleVisibility(item.id, !item.visible);
                  }
                }}
                className="p-1 hover:bg-neutral-500 rounded"
                title={item.visible ? "Hide" : "Show"}
              >
                {item.visible ? (
                  <Eye size={10} className="text-green-400" />
                ) : (
                  <EyeOff size={10} className="text-red-400" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDeleteObject) {
                    onDeleteObject(item.id);
                  }
                }}
                className="p-1 hover:bg-neutral-500 rounded"
                title="Delete"
              >
                <Trash2 size={10} className="text-red-400" />
              </button>
            </div>
          )}
        </div>
        
        {/* Children */}
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Build the directory structure
  const directoryStructure = [
    {
      id: 'scene',
      name: 'Scene',
      type: 'folder',
      children: [
        {
          id: 'objects',
          name: 'Objects',
          type: 'folder',
          children: existingVolumes.map(volume => ({
            id: volume.id,
            name: volume.userData?.volumeName || volume.name || 'Unnamed Volume',
            type: 'object',
            objectType: volume.type,
            visible: volume.visible !== false, // Use actual visibility state, default to true
            data: volume
          }))
        },
        {
          id: 'sources',
          name: 'Sources',
          type: 'folder',
          children: sources.map(source => ({
            id: source.id,
            name: source.userData?.volumeName || source.name || 'Unnamed Source',
            type: 'source',
            objectType: source.type,
            visible: source.visible !== false, // Use actual visibility state, default to true
            data: source
          }))
        },
        {
          id: 'compositions',
          name: 'Compositions',
          type: 'folder',
          children: compositions.map((comp, index) => ({
            id: `comp-${index}`,
            name: comp.name,
            type: 'composition',
            visible: true,
            data: comp
          }))
        },
        {
          id: 'sensors',
          name: 'Sensors',
          type: 'folder',
          children: existingSensors.map(sensor => ({
            id: sensor.id,
            name: sensor.name || 'Unnamed Sensor',
            type: 'sensor',
            visible: true,
            data: sensor
          }))
        },
        {
          id: 'spectra',
          name: 'Spectra',
          type: 'folder',
          children: existingSpectra.map((spectrum, index) => ({
            id: `spectrum-${index}`,
            name: spectrum.name,
            type: 'spectrum',
            visible: true,
            data: spectrum
          }))
        }
      ]
    }
  ];

  if (!isVisible) return null;

  return (
    <div 
      ref={directoryRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 max-h-[80vh] pointer-events-auto absolute focus:outline-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${isMinimized ? 32 : size.height}px`,
        cursor: isDragging ? 'grabbing' : (isResizing ? getResizeCursor() : 'default'),
        zIndex: 25
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => {
        if (!isDragging && !isResizing) {
          const resizeDir = getResizeDirection(e);
          if (resizeDir) {
            e.currentTarget.style.cursor = getResizeCursorFromDirection(resizeDir);
          } else {
            e.currentTarget.style.cursor = 'default';
          }
        }
      }}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-700 rounded-t-lg px-4 py-3 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Move size={14} className="text-neutral-400" />
          <h2 className="text-white font-medium">Project Directory</h2>
          <span className="text-xs text-neutral-400">(F2: Rename)</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            <Minus size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-2 max-h-[calc(80vh-120px)] overflow-y-auto">
          {directoryStructure.map(item => renderItem(item))}
          
          {/* Empty state messages */}
          {existingVolumes.length === 0 && (
            <div className="text-neutral-500 text-xs text-center py-4">
              No objects in scene
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-neutral-700 border border-neutral-600 rounded shadow-lg py-1 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setSelectedItemId(contextMenu.item.id);
              startEdit(contextMenu.item.id, contextMenu.item.name);
              closeContextMenu();
            }}
            className="w-full px-3 py-2 text-left text-white text-xs hover:bg-neutral-600 flex items-center space-x-2"
          >
            <Edit2 size={12} />
            <span>Rename</span>
          </button>
          <button
            onClick={() => {
              setSelectedItemId(contextMenu.item.id);
              if (onToggleVisibility) {
                onToggleVisibility(contextMenu.item.id, !contextMenu.item.visible);
              }
              closeContextMenu();
            }}
            className="w-full px-3 py-2 text-left text-white text-xs hover:bg-neutral-600 flex items-center space-x-2"
          >
            {contextMenu.item.visible ? (
              <>
                <EyeOff size={12} />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye size={12} />
                <span>Show</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setSelectedItemId(contextMenu.item.id);
              if (onDeleteObject) {
                if (window.confirm(`Are you sure you want to delete "${contextMenu.item.name}"?`)) {
                  onDeleteObject(contextMenu.item.id);
                }
              }
              closeContextMenu();
            }}
            className="w-full px-3 py-2 text-left text-red-400 text-xs hover:bg-neutral-600 flex items-center space-x-2"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
