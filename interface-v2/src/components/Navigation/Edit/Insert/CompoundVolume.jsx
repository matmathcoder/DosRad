import React, { useState, useRef, useEffect } from 'react';
import { X, FolderPlus, Upload, Move, FolderOpen, File, AlertTriangle, Info } from 'lucide-react';

// Mock compound objects data - in real app this would come from file system or API
const MOCK_COMPOUND_OBJECTS = [
  // Example Scenes
  {
    name: 'CBFK-Type-Container',
    path: '/Examples/Container/CBFK-Type-Container.mercurad',
    size: '1.2 MB',
    created: '2024-01-01',
    description: 'Standard storage container with mild steel walls and homogeneous source (1m x 1m x 1m)',
    volumes: 3,
    compositions: 3,
    spectra: 0,
    category: 'Examples',
    isExample: true
  },
  {
    name: 'DUMTUTOR-PCS',
    path: '/Examples/Drum/DUMTUTOR-PCS.mercurad',
    size: '1.0 MB',
    created: '2024-01-01',
    description: 'Steel drum containing glass matrix source (1m high, 0.6m diameter)',
    volumes: 3,
    compositions: 3,
    spectra: 0,
    category: 'Examples',
    isExample: true
  },

];

export default function CompoundVolume({ 
  isVisible, 
  onClose, 
  onImport, 
  onCancel,
  existingVolumes = [],
  existingCompositions = [],
  existingSpectra = []
}) {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  // Directory and file management
  const [currentDirectory, setCurrentDirectory] = useState('/MercuradObjects');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObject, setSelectedObject] = useState(null);
  const [showNewDirectoryDialog, setShowNewDirectoryDialog] = useState(false);
  const [newDirectoryName, setNewDirectoryName] = useState('');
  
  // Position dialog
  const [showPositionDialog, setShowPositionDialog] = useState(false);
  const [positionData, setPositionData] = useState({
    x: 0,
    y: 0,
    z: 0,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  });

  // Conflict resolution
  const [conflicts, setConflicts] = useState([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  // Filter compound objects based on search term
  const filteredObjects = MOCK_COMPOUND_OBJECTS.filter(obj =>
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check for naming conflicts
  const checkConflicts = (compoundObject) => {
    const conflicts = [];
    
    // Check volume name conflicts
    compoundObject.volumes?.forEach(volume => {
      const existingVolume = existingVolumes.find(v => 
        v.name?.toLowerCase() === volume.name?.toLowerCase()
      );
      if (existingVolume) {
        conflicts.push({
          type: 'volume',
          originalName: volume.name,
          suggestedName: resolveConflict(volume.name, existingVolumes.map(v => v.name))
        });
      }
    });

    // Check composition conflicts
    compoundObject.compositions?.forEach(composition => {
      const existingComposition = existingCompositions.find(c => 
        c.name?.toLowerCase() === composition.name?.toLowerCase()
      );
      if (existingComposition) {
        conflicts.push({
          type: 'composition',
          originalName: composition.name,
          suggestedName: resolveConflict(composition.name, existingCompositions.map(c => c.name))
        });
      }
    });

    // Check spectrum conflicts
    compoundObject.spectra?.forEach(spectrum => {
      const existingSpectrum = existingSpectra.find(s => 
        s.name?.toLowerCase() === spectrum.name?.toLowerCase()
      );
      if (existingSpectrum) {
        conflicts.push({
          type: 'spectrum',
          originalName: spectrum.name,
          suggestedName: resolveConflict(spectrum.name, existingSpectra.map(s => s.name))
        });
      }
    });

    return conflicts;
  };

  // Resolve naming conflicts
  const resolveConflict = (originalName, existingNames) => {
    const existingSet = new Set(existingNames.map(name => name.toLowerCase()));
    
    // Check if name ends with a number
    const numberMatch = originalName.match(/(.+?)(\d+)$/);
    
    if (numberMatch) {
      const baseName = numberMatch[1];
      let number = parseInt(numberMatch[2]);
      
      while (existingSet.has(`${baseName}${number}`.toLowerCase())) {
        number++;
      }
      
      return `${baseName}${number}`;
    } else {
      // Add suffix starting with 1
      let suffix = 1;
      let newName = `${originalName}${suffix}`;
      
      while (existingSet.has(newName.toLowerCase())) {
        suffix++;
        newName = `${originalName}${suffix}`;
      }
      
      // Truncate if too long (assuming 50 char limit)
      if (newName.length > 50) {
        newName = newName.substring(0, 47) + '...';
      }
      
      return newName;
    }
  };

  const handleObjectSelect = (object) => {
    setSelectedObject(object);
    const detectedConflicts = checkConflicts(object);
    setConflicts(detectedConflicts);
    
    if (detectedConflicts.length > 0) {
      setShowConflictDialog(true);
    } else {
      setShowPositionDialog(true);
    }
  };

  const handleImport = () => {
    if (!selectedObject) return;
    
    const importData = {
      compoundObject: selectedObject,
      position: positionData,
      conflicts: conflicts,
      resolvedNames: conflicts.reduce((acc, conflict) => {
        acc[conflict.originalName] = conflict.suggestedName;
        return acc;
      }, {})
    };
    
    onImport(importData);
    handleCancel();
  };

  const handleCancel = () => {
    setSelectedObject(null);
    setConflicts([]);
    setShowConflictDialog(false);
    setShowPositionDialog(false);
    setShowNewDirectoryDialog(false);
    setNewDirectoryName('');
    setPositionData({
      x: 0,
      y: 0,
      z: 0,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });
    onClose();
  };

  const handleCreateDirectory = () => {
    if (!newDirectoryName.trim()) return;
    
    // In a real app, this would create the directory
 setShowNewDirectoryDialog(false);
    setNewDirectoryName('');
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
    
    const margin = 20;
    const maxX = window.innerWidth - 700 - margin;
    const maxY = window.innerHeight - 600 - margin;
    
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

  if (!isVisible) return null;

  return (
    <>
      <div 
        ref={formRef}
        className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[700px] max-h-[80vh] overflow-y-auto pointer-events-auto absolute z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-700 rounded-t-lg px-4 py-3 drag-handle cursor-grab">
          <div className="flex items-center space-x-2">
            <Move size={14} className="text-neutral-400" />
            <h2 className="text-white font-medium">Import Compound Volume</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {/* Directory Navigation */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Directory</h3>
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen size={16} className="text-neutral-400" />
              <span className="text-white text-xs">Search in:</span>
              <span className="text-neutral-300 text-xs font-mono">{currentDirectory}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewDirectoryDialog(true)}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded flex items-center gap-1"
              >
                <FolderPlus size={12} />
                New Directory
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Search</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-400"
              placeholder="Search compound objects..."
            />
          </div>

          {/* Compound Objects List */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Available Objects</h3>
            <div className="bg-neutral-700 rounded border border-neutral-600 max-h-64 overflow-y-auto">
              {filteredObjects.length === 0 ? (
                <div className="p-4 text-neutral-400 text-xs text-center">
                  {searchTerm ? `No objects found matching "${searchTerm}"` : 'No compound objects available'}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredObjects.map((obj, index) => (
                    <div
                      key={index}
                      onClick={() => handleObjectSelect(obj)}
                      className={`p-3 rounded cursor-pointer hover:bg-neutral-600 transition-colors ${
                        selectedObject?.name === obj.name ? 'bg-neutral-600 border border-neutral-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <File size={14} className="text-neutral-400" />
                            <span className="text-white font-medium text-sm">{obj.name}</span>
                            <span className="text-neutral-400 text-xs">({obj.size})</span>
                            {obj.isExample && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                                Example
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-300 text-xs mb-2">{obj.description}</p>
                          <div className="flex gap-4 text-xs text-neutral-400">
                            <span>{obj.volumes} volumes</span>
                            <span>{obj.compositions} compositions</span>
                            <span>{obj.spectra} spectra</span>
                            <span>Created: {obj.created}</span>
                            {obj.category && (
                              <span className="text-blue-400">{obj.category}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleObjectSelect(obj);
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
                        >
                          Import
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Object Info */}
          {selectedObject && (
            <div className="mb-4">
              <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Selected Object</h3>
              <div className="bg-neutral-700 rounded border border-neutral-600 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <File size={16} className="text-neutral-400" />
                  <span className="text-white font-medium">{selectedObject.name}</span>
                </div>
                <p className="text-neutral-300 text-xs mb-2">{selectedObject.description}</p>
                <div className="text-xs text-neutral-400">
                  Path: <span className="font-mono">{selectedObject.path}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 p-3 bg-neutral-750 rounded-b-lg border-t border-neutral-600">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedObject && handleObjectSelect(selectedObject)}
            disabled={!selectedObject}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
          >
            <Upload size={12} />
            Import Selected
          </button>
        </div>
      </div>

      {/* New Directory Dialog */}
      {showNewDirectoryDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-neutral-800 rounded-lg p-4 max-w-md mx-4 border border-neutral-600">
            <h3 className="text-white font-medium mb-3">Create New Directory</h3>
            <div className="mb-4">
              <label className="block text-white text-xs font-medium mb-1">
                Directory Name
              </label>
              <input
                type="text"
                value={newDirectoryName}
                onChange={(e) => setNewDirectoryName(e.target.value)}
                className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                placeholder="Enter directory name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewDirectoryDialog(false)}
                className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDirectory}
                disabled={!newDirectoryName.trim()}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Resolution Dialog */}
      {showConflictDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-neutral-800 rounded-lg p-4 max-w-lg mx-4 border border-neutral-600">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="text-yellow-400 mt-0.5" size={20} />
              <div>
                <h3 className="text-white font-medium mb-2">Naming Conflicts Detected</h3>
                <p className="text-neutral-300 text-sm mb-3">
                  The following names conflict with existing objects in the scene:
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {conflicts.map((conflict, index) => (
                <div key={index} className="bg-neutral-700 rounded p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white text-xs font-medium">{conflict.type}: </span>
                      <span className="text-neutral-300 text-xs">{conflict.originalName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-xs">→</span>
                      <span className="text-green-400 text-xs font-medium">{conflict.suggestedName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConflictDialog(false)}
                className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConflictDialog(false);
                  setShowPositionDialog(true);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
              >
                Continue with Renaming
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Position Dialog */}
      {showPositionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-neutral-800 rounded-lg p-4 max-w-md mx-4 border border-neutral-600">
            <h3 className="text-white font-medium mb-3">Position Compound Volume</h3>
            <p className="text-neutral-300 text-sm mb-4">
              Set the position of the compound volume relative to the scene reference point (0,0,0):
            </p>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-white text-xs font-medium mb-1">Position (cm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">X</label>
                    <input
                      type="number"
                      step="0.1"
                      value={positionData.x}
                      onChange={(e) => setPositionData(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">Y</label>
                    <input
                      type="number"
                      step="0.1"
                      value={positionData.y}
                      onChange={(e) => setPositionData(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">Z</label>
                    <input
                      type="number"
                      step="0.1"
                      value={positionData.z}
                      onChange={(e) => setPositionData(prev => ({ ...prev, z: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white text-xs font-medium mb-1">Rotation (degrees)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">X</label>
                    <input
                      type="number"
                      step="1"
                      value={positionData.rotation.x}
                      onChange={(e) => setPositionData(prev => ({ 
                        ...prev, 
                        rotation: { ...prev.rotation, x: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">Y</label>
                    <input
                      type="number"
                      step="1"
                      value={positionData.rotation.y}
                      onChange={(e) => setPositionData(prev => ({ 
                        ...prev, 
                        rotation: { ...prev.rotation, y: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">Z</label>
                    <input
                      type="number"
                      step="1"
                      value={positionData.rotation.z}
                      onChange={(e) => setPositionData(prev => ({ 
                        ...prev, 
                        rotation: { ...prev.rotation, z: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white text-xs font-medium mb-1">Scale</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">X</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={positionData.scale.x}
                      onChange={(e) => setPositionData(prev => ({ 
                        ...prev, 
                        scale: { ...prev.scale, x: parseFloat(e.target.value) || 1 }
                      }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">Y</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={positionData.scale.y}
                      onChange={(e) => setPositionData(prev => ({ 
                        ...prev, 
                        scale: { ...prev.scale, y: parseFloat(e.target.value) || 1 }
                      }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-xs mb-1">Z</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={positionData.scale.z}
                      onChange={(e) => setPositionData(prev => ({ 
                        ...prev, 
                        scale: { ...prev.scale, z: parseFloat(e.target.value) || 1 }
                      }))}
                      className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPositionDialog(false)}
                className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded flex items-center gap-1"
              >
                <Upload size={12} />
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
