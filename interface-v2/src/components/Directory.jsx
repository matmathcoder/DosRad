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
  X,
  Minus,
  Layers,
  Package,
  Rainbow,
  Dam,
  RectangleCircle,
  Atom,
  Torus,
  LineSquiggle,
  Shapes,
  Circle,
  CircleSmall,
  Club,
  Diamond,
  Hexagon
} from 'lucide-react';

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
  onClearAllObjects,
  onShowProperties,
  selectedObjectId,
  layoutPosition = 'left'
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({
    scene: true,
    objects: true,
    sources: true,
    compositions: true,
    sensors: true,
    spectra: true,
    examples: true
  });
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  // Fixed positioning - no dragging or resizing
  const directoryRef = useRef();

  // Debug: Log when existingVolumes changes
  useEffect(() => {
  }, [existingVolumes]);

  // Synchronize selectedItemId with selectedObjectId prop
  useEffect(() => {
    if (selectedObjectId === null) {
      setSelectedItemId(null);
    }
  }, [selectedObjectId]);


  // Get sources (volumes with isSource: true)
  const sources = existingVolumes.filter(volume => volume.userData?.isSource);
  
  // Get compositions from volumes
  const compositions = existingVolumes
    .map(volume => volume.userData?.composition)
    .filter(Boolean)
    .filter((comp, index, arr) => 
      arr.findIndex(c => c.name === comp.name) === index
    );

  // Example compound volumes and contaminated tube
  const exampleVolumes = [
    {
      id: 'contaminated-tube',
      name: 'TUBTUTOT.PCS',
      type: 'compound',
      description: 'Contaminated Steel Tube with UO2 Layer',
      components: [
        { name: 'Outer Steel Tube', material: 'Stainless Steel', thickness: '0.5cm' },
        { name: 'UO2 Source Layer', material: 'Uranium Oxide', thickness: '0.5cm' },
        { name: 'Air Space', material: 'Air', thickness: 'Variable' }
      ],
      dimensions: { length: '0.5m', diameter: '0.2m' },
      source: 'U-235',
      visible: true
    },
    {
      id: 'reactor-vessel',
      name: 'REACTOR_VESSEL.PCS',
      type: 'compound',
      description: 'Nuclear Reactor Pressure Vessel',
      components: [
        { name: 'Steel Shell', material: 'Carbon Steel', thickness: '15cm' },
        { name: 'Stainless Steel Liner', material: 'SS304', thickness: '2cm' },
        { name: 'Concrete Shield', material: 'Heavy Concrete', thickness: '100cm' }
      ],
      dimensions: { height: '12m', diameter: '4.5m' },
      source: 'Mixed Fission Products',
      visible: true
    },
    {
      id: 'waste-container',
      name: 'WASTE_CONTAINER.PCS',
      type: 'compound',
      description: 'High-Level Waste Storage Container',
      components: [
        { name: 'Lead Shield', material: 'Lead', thickness: '20cm' },
        { name: 'Steel Container', material: 'Stainless Steel', thickness: '5cm' },
        { name: 'Concrete Overpack', material: 'Reinforced Concrete', thickness: '50cm' }
      ],
      dimensions: { height: '2m', diameter: '1.5m' },
      source: 'Cs-137, Sr-90',
      visible: true
    },
    {
      id: 'fuel-assembly',
      name: 'FUEL_ASSEMBLY.PCS',
      type: 'compound',
      description: 'Nuclear Fuel Assembly',
      components: [
        { name: 'Fuel Rods', material: 'UO2 Pellets', count: '264' },
        { name: 'Cladding', material: 'Zircaloy-4', thickness: '0.6mm' },
        { name: 'Assembly Structure', material: 'Zircaloy-4', thickness: '2mm' }
      ],
      dimensions: { height: '4.5m', width: '20cm', depth: '20cm' },
      source: 'U-235, Pu-239',
      visible: true
    }
  ];




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

  const handleInputKeyDown = (e) => {
    // Directory has full priority when editing - no scene shortcuts should interfere
    // Handle editing-specific keys
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
    // All other keys are handled normally by the input field
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
      case 'capsule': return <CircleSmall size={14} className="text-red-400" />;
      case 'dodecahedron': return <Diamond size={14} className="text-teal-400" />;
      case 'extrude': return <Shapes size={14} className="text-blue-300" />;
      case 'icosahedron': return <Hexagon size={14} className="text-green-300" />;
      case 'lathe': return <LineSquiggle size={14} className="text-yellow-300" />;
      case 'octahedron': return <Club size={14} className="text-purple-300" />;
      case 'plane': return <Circle size={14} className="text-green-300" />;
      case 'ring': return <Circle size={14} className="text-yellow-400" />;
      case 'shape': return <Shapes size={14} className="text-purple-300" />;
      case 'tetrahedron': return <Diamond size={14} className="text-blue-300" />;
      case 'torus': return <Torus size={14} className="text-orange-300" />;
      case 'torusknot': return <Torus size={14} className="text-green-300" />;
      case 'tube': return <Cylinder size={14} className="text-pink-300" />;
      case 'compound': return <Layers size={14} className="text-orange-400" />;
      case 'source': return <Atom size={14} className="text-red-400" />;
      case 'composition': return <RectangleCircle size={14} className="text-cyan-400" />;
      case 'sensor': return <Dam size={14} className="text-yellow-300" />;
      case 'spectrum': return <Rainbow size={14} className="text-pink-400" />;
      case 'example': return <Package size={14} className="text-indigo-400" />;
      default: return <Box size={14} className="text-gray-400" />;
    }
  };

  // Debug: Log volumes on component mount/update and remove duplicates
  useEffect(() => {
    console.log('Directory received volumes:', existingVolumes.length, existingVolumes.map(v => ({ id: v.id, name: v.name || v.userData?.volumeName })));
    
    // Additional safeguard: Check for duplicates in the received data
    const ids = existingVolumes.map(v => v.id);
    const uniqueIds = [...new Set(ids)];
    if (ids.length !== uniqueIds.length) {
      console.warn('Directory received duplicate volumes! IDs:', ids);
    }
  }, [existingVolumes]);

  const renderItem = (item, level = 0) => {
    const isExpanded = expandedFolders[item.id];
    const isSelected = selectedItemId === item.id;
    const isEditing = editingItem === item.id;
    
    // Debug: Log duplicate keys
    if (item.id && existingVolumes.filter(v => v.id === item.id).length > 1) {
      console.warn('Duplicate volume ID found:', item.id, item);
    }
    
    // Generate unique key to prevent React warnings
    const uniqueKey = `${item.id}-${item.type}-${level}`;
    
    return (
      <div key={uniqueKey} className="select-none">
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
              getObjectIcon(item.objectType || item.type)
            )}
          </div>
          
          {/* Item Name */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={saveEdit}
                className="w-full bg-neutral-700 text-white text-xs px-1 py-0.5 rounded border border-neutral-500 focus:outline-none focus:border-blue-400"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex flex-col">
                <span className="text-white text-xs truncate">{item.name}</span>
                {item.description && (
                  <span className="text-neutral-400 text-xs truncate" title={item.description}>
                    {item.description}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          {!isEditing && item.type !== 'folder' && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Load button for examples */}
              {item.type === 'example' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectObject) {
                      onSelectObject(item);
                    }
                    // You could add a specific handler for loading examples here
                  }}
                  className="p-1 hover:bg-neutral-500 rounded"
                  title="Load Example"
                >
                  <Package size={10} className="text-indigo-400" />
                </button>
              )}
              
              {/* Regular action buttons for non-example items */}
              {item.type !== 'example' && (
                <>
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
                        onDeleteObject(item.id, item.type);
                      }
                    }}
                    className="p-1 hover:bg-neutral-500 rounded"
                    title="Delete"
                  >
                    <Trash2 size={10} className="text-red-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShowProperties) {
                        onShowProperties(item);
                      }
                    }}
                    className="p-1 hover:bg-neutral-500 rounded"
                    title="Properties"
                  >
                    <Settings size={10} className="text-blue-400" />
                  </button>
                </>
              )}
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
    },
    {
      id: 'examples',
      name: 'Examples',
      type: 'folder',
      children: [
        {
          id: 'compound-volumes',
          name: 'Compound Volumes',
          type: 'folder',
          children: exampleVolumes.map(example => ({
            id: example.id,
            name: example.name,
            type: 'example',
            objectType: 'compound',
            visible: example.visible,
            data: example,
            description: example.description
          }))
        },
        {
          id: 'contaminated-tube',
          name: 'TUBTUTOT.PCS',
          type: 'example',
          objectType: 'compound',
          visible: true,
          data: exampleVolumes[0], // The contaminated tube example
          description: 'Contaminated Steel Tube with UO2 Layer - Example from documentation'
        }
      ]
    }
  ];

  if (!isVisible) return null;

  // Calculate position based on layout
  const getPositionStyle = () => {
    const baseStyle = {
      width: '350px',
      height: isMinimized ? '48px' : '80vh', // Similar height to sidebar (80vh)
      top: '72px', // Start with small gap below navbar
      zIndex: 25
    };

    switch (layoutPosition) {
      case 'right':
        return { ...baseStyle, right: '0px' }; // No gap from right edge
      case 'left':
        return { ...baseStyle, left: '0px' }; // No gap from left edge
      case 'top':
        return { 
          ...baseStyle, 
          top: '72px', // Small gap below navbar
          left: '50%',
          transform: 'translateX(-50%)',
          height: isMinimized ? '48px' : '60vh' // Shorter height for top position
        };
      case 'bottom':
        return { 
          ...baseStyle, 
          top: 'calc(100vh - 60vh - 72px)', // Position above bottom with margin
          left: '50%',
          transform: 'translateX(-50%)',
          height: isMinimized ? '48px' : '60vh' // Shorter height for bottom position
        };
      default:
        return { ...baseStyle, left: '0px' }; // No gap from left edge
    }
  };

  return (
    <div 
      ref={directoryRef}
      className="bg-neutral-800 shadow-2xl border border-neutral-600 rounded-lg pointer-events-auto fixed focus:outline-none"
      style={getPositionStyle()}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-700 px-4 py-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-white font-medium">Project Directory</h2>
          <span className="text-xs text-neutral-400">(F2: Rename)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Clear All Button */}
          {existingVolumes.length > 0 && onClearAllObjects && (
            <button
              onClick={onClearAllObjects}
              className="p-1 hover:bg-red-600 rounded text-white transition-colors"
              title="Clear All Objects"
            >
              <Trash2 size={16} className="text-red-400" />
            </button>
          )}
          
          {/* Toggle Icon - Positioned based on directory location */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`p-1 hover:bg-neutral-600 rounded text-white transition-colors ${
              layoutPosition === 'left' ? 'ml-2' : 'mr-2'
            }`}
            title={isMinimized ? "Expand Directory" : "Minimize Directory"}
          >
            {isMinimized ? (
              <ChevronRight 
                size={16} 
                className={`text-neutral-400 ${
                  layoutPosition === 'left' ? 'rotate-0' : 'rotate-180'
                }`} 
              />
            ) : (
              <ChevronDown 
                size={16} 
                className={`text-neutral-400 ${
                  layoutPosition === 'left' ? 'rotate-0' : 'rotate-180'
                }`} 
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div 
          className="relative p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800"
            style={{
              height: 'calc(80vh - 60px)', // 80vh minus header height (60px)
              maxHeight: 'calc(80vh - 60px)' // Ensure it doesn't exceed the container
            }}
        >
          {directoryStructure.map(item => renderItem(item))}
          
          {/* Empty state messages */}
          {existingVolumes.length === 0 && (
            <div className="text-neutral-500 text-xs text-center py-4">
              No objects in scene
            </div>
          )}
          
          {/* Scroll indicator - subtle gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
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
          {/* Example items context menu */}
          {contextMenu.item.type === 'example' ? (
            <>
              <button
                onClick={() => {
                  setSelectedItemId(contextMenu.item.id);
                  if (onSelectObject) {
                    onSelectObject(contextMenu.item);
                  }
                  closeContextMenu();
                }}
                className="w-full px-3 py-2 text-left text-indigo-400 text-xs hover:bg-neutral-600 flex items-center space-x-2"
              >
                <Package size={12} />
                <span>Load Example</span>
              </button>
              <button
                onClick={() => {
                  setSelectedItemId(contextMenu.item.id);
                  closeContextMenu();
                }}
                className="w-full px-3 py-2 text-left text-white text-xs hover:bg-neutral-600 flex items-center space-x-2"
              >
                <FileText size={12} />
                <span>View Details</span>
              </button>
            </>
          ) : (
            /* Regular items context menu */
            <>
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
                      onDeleteObject(contextMenu.item.id, contextMenu.item.type);
                    }
                  }
                  closeContextMenu();
                }}
                className="w-full px-3 py-2 text-left text-red-400 text-xs hover:bg-neutral-600 flex items-center space-x-2"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
