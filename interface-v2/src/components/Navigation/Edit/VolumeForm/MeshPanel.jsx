import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Plus, Trash2, Check, AlertTriangle, Info } from 'lucide-react';

export default function MeshPanel({ isVisible, onClose, selectedVolume, onMeshValidate }) {
  const [activeCoordinate, setActiveCoordinate] = useState('x');
  const [bounds, setBounds] = useState({});
  const [subdivisions, setSubdivisions] = useState({});
  const [isValidated, setIsValidated] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef();

  // Set initial position when component mounts
  useEffect(() => {
    if (isVisible && position.x === 0 && position.y === 0) {
      setPosition({
        x: Math.max(20, (window.innerWidth - 500) / 2),
        y: Math.max(20, (window.innerHeight - 600) / 2)
      });
    }
  }, [isVisible, position.x, position.y]);

  // Initialize mesh data based on volume type
  useEffect(() => {
    if (selectedVolume) {
      initializeMeshData();
    }
  }, [selectedVolume]);

  const initializeMeshData = () => {
    const volumeType = selectedVolume.type?.toLowerCase();
    let coordinateSystem = 'cartesian';
    let coordinates = ['x', 'y', 'z'];

    if (volumeType === 'cylinder' || volumeType === 'cone' || volumeType === 'frustum') {
      coordinateSystem = 'cylindrical';
      coordinates = ['r', 'phi', 'z'];
    } else if (volumeType === 'sphere') {
      coordinateSystem = 'spherical';
      coordinates = ['r', 'theta', 'phi'];
    }

    // Initialize bounds based on volume dimensions
    const newBounds = {};
    const newSubdivisions = {};

    coordinates.forEach(coord => {
      newBounds[coord] = getDefaultBounds(coord, selectedVolume);
      newSubdivisions[coord] = [];
    });

    setBounds(newBounds);
    setSubdivisions(newSubdivisions);
    setActiveCoordinate(coordinates[0]);
  };

  const getDefaultBounds = (coord, volume) => {
    const scale = volume.scale || { x: 1, y: 1, z: 1 };
    const position = volume.position || { x: 0, y: 0, z: 0 };

    switch (coord) {
      case 'x':
        return {
          min: position.x - scale.x / 2,
          max: position.x + scale.x / 2,
          proposed: [position.x - scale.x / 2, position.x + scale.x / 2]
        };
      case 'y':
        return {
          min: position.y - scale.y / 2,
          max: position.y + scale.y / 2,
          proposed: [position.y - scale.y / 2, position.y + scale.y / 2]
        };
      case 'z':
        return {
          min: position.z - scale.z / 2,
          max: position.z + scale.z / 2,
          proposed: [position.z - scale.z / 2, position.z + scale.z / 2]
        };
      case 'r':
        return {
          min: 0,
          max: Math.max(scale.x, scale.y) / 2,
          proposed: [0, Math.max(scale.x, scale.y) / 2]
        };
      case 'phi':
        return {
          min: 0,
          max: 2 * Math.PI,
          proposed: [0, 2 * Math.PI]
        };
      case 'theta':
        return {
          min: 0,
          max: Math.PI,
          proposed: [0, Math.PI]
        };
      default:
        return { min: 0, max: 1, proposed: [0, 1] };
    }
  };

  const getCoordinateLabel = (coord) => {
    const labels = {
      x: 'X (cm)',
      y: 'Y (cm)',
      z: 'Z (cm)',
      r: 'R (cm)',
      phi: 'Φ (rad)',
      theta: 'θ (rad)'
    };
    return labels[coord] || coord.toUpperCase();
  };

  const getCoordinateSystem = () => {
    const volumeType = selectedVolume?.type?.toLowerCase();
    if (volumeType === 'cylinder' || volumeType === 'cone' || volumeType === 'frustum') {
      return 'cylindrical';
    } else if (volumeType === 'sphere') {
      return 'spherical';
    }
    return 'cartesian';
  };

  const getCoordinates = () => {
    const coordinateSystem = getCoordinateSystem();
    if (coordinateSystem === 'cylindrical') {
      return ['r', 'phi', 'z'];
    } else if (coordinateSystem === 'spherical') {
      return ['r', 'theta', 'phi'];
    }
    return ['x', 'y', 'z'];
  };

  const addBound = (coord, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setBounds(prev => ({
      ...prev,
      [coord]: {
        ...prev[coord],
        proposed: [...prev[coord].proposed, numValue].sort((a, b) => a - b)
      }
    }));
  };

  const removeBound = (coord, index) => {
    setBounds(prev => ({
      ...prev,
      [coord]: {
        ...prev[coord],
        proposed: prev[coord].proposed.filter((_, i) => i !== index)
      }
    }));
  };

  const addSubdivision = (coord, intervalIndex, data) => {
    const newSubdivision = {
      interval: intervalIndex,
      partitions: parseInt(data.partitions) || 1,
      mode: data.mode || 'linear',
      direction: data.direction || 'increasing'
    };

    setSubdivisions(prev => ({
      ...prev,
      [coord]: [...prev[coord], newSubdivision]
    }));
  };

  const removeSubdivision = (coord, index) => {
    setSubdivisions(prev => ({
      ...prev,
      [coord]: prev[coord].filter((_, i) => i !== index)
    }));
  };

  const validateMesh = () => {
    const errors = [];
    const coordinates = getCoordinates();

    // Check if all coordinates have bounds
    coordinates.forEach(coord => {
      if (!bounds[coord] || bounds[coord].proposed.length < 2) {
        errors.push(`${getCoordinateLabel(coord)}: At least 2 bounds required`);
      }
    });

    // Check if all intervals have subdivisions
    coordinates.forEach(coord => {
      if (bounds[coord] && bounds[coord].proposed.length >= 2) {
        const intervals = bounds[coord].proposed.length - 1;
        const coordSubdivisions = subdivisions[coord] || [];
        
        for (let i = 0; i < intervals; i++) {
          const hasSubdivision = coordSubdivisions.some(sub => sub.interval === i);
          if (!hasSubdivision) {
            errors.push(`${getCoordinateLabel(coord)}: Interval ${i + 1} needs subdivision`);
          }
        }
      }
    });

    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setIsValidated(true);
      if (onMeshValidate) {
        onMeshValidate({
          coordinateSystem: getCoordinateSystem(),
          bounds,
          subdivisions,
          volumeId: selectedVolume?.id
        });
      }
    } else {
      setIsValidated(false);
    }
  };

  const handleCancel = () => {
    setIsValidated(false);
    setValidationErrors([]);
    onClose();
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
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const margin = 20;
    const maxX = window.innerWidth - 500 - margin;
    const maxY = window.innerHeight - 600 - margin;
    
    setPosition({
      x: Math.max(margin, Math.min(newX, maxX)),
      y: Math.max(margin, Math.min(newY, maxY))
    });
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

  const coordinates = getCoordinates();
  const currentBounds = bounds[activeCoordinate] || { proposed: [] };
  const currentSubdivisions = subdivisions[activeCoordinate] || [];

  const handleDragStart = (e) => {
    e.dataTransfer.setData('component-type', 'mesh-panel');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Mesh Panel',
      type: 'mesh-panel',
      selectedVolume,
      meshData
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      ref={panelRef}
      className="bg-neutral-800 rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden border border-neutral-600 fixed pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 50
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      draggable="true"
      onDragStart={handleDragStart}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-600 bg-neutral-750 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Move size={16} className="text-neutral-400" />
          <h3 className="text-lg font-semibold text-white">
            Mesh Configuration
          </h3>
          {selectedVolume && (
            <span className="text-sm text-neutral-400">
              - {selectedVolume.type} Source
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Coordinate System Info */}
        <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
          <div className="flex items-start space-x-2">
            <Info className="text-neutral-400 mt-0.5" size={16} />
            <div className="text-sm text-neutral-300">
              <strong className="text-neutral-200">Coordinate System:</strong> {getCoordinateSystem().toUpperCase()}
              <br />
              <span className="text-xs">
                {getCoordinateSystem() === 'cartesian' && 'X, Y, Z coordinates'}
                {getCoordinateSystem() === 'cylindrical' && 'R, Φ, Z coordinates'}
                {getCoordinateSystem() === 'spherical' && 'R, θ, Φ coordinates'}
              </span>
            </div>
          </div>
        </div>

        {/* Coordinate Selection */}
        <div>
          <h4 className="text-white font-medium mb-3">Select Variable to Subdivide:</h4>
          <div className="flex space-x-2">
            {coordinates.map(coord => (
              <button
                key={coord}
                onClick={() => setActiveCoordinate(coord)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  activeCoordinate === coord
                    ? 'bg-neutral-400 text-black'
                    : 'bg-neutral-600 text-white hover:bg-neutral-500'
                }`}
              >
                {getCoordinateLabel(coord)}
              </button>
            ))}
          </div>
        </div>

        {/* Bounds Configuration */}
        <div>
          <h4 className="text-white font-medium mb-3">Mesh Bounds - {getCoordinateLabel(activeCoordinate)}</h4>
          
          {/* Proposed Bounds */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Proposed Bounds:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Add bound"
                  className="px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-sm w-24 focus:border-neutral-400 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addBound(activeCoordinate, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    addBound(activeCoordinate, input.value);
                    input.value = '';
                  }}
                  className="p-1 bg-neutral-600 hover:bg-neutral-500 rounded text-white"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              {currentBounds.proposed.map((bound, index) => (
                <div key={index} className="flex items-center justify-between bg-neutral-700 p-2 rounded">
                  <span className="text-sm text-white">{bound.toFixed(3)}</span>
                  <button
                    onClick={() => removeBound(activeCoordinate, index)}
                    className="p-1 hover:bg-neutral-600 rounded text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subdivision Configuration */}
        {currentBounds.proposed.length >= 2 && (
          <div>
            <h4 className="text-white font-medium mb-3">Subdivision Configuration</h4>
            
            {/* Intervals */}
            <div className="space-y-3">
              {Array.from({ length: currentBounds.proposed.length - 1 }, (_, i) => {
                const intervalSubdivisions = currentSubdivisions.filter(sub => sub.interval === i);
                return (
                  <div key={i} className="bg-neutral-700 p-3 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">
                        Interval {i + 1}: {currentBounds.proposed[i].toFixed(3)} → {currentBounds.proposed[i + 1].toFixed(3)}
                      </span>
                      <button
                        onClick={() => {
                          const partitions = prompt('Number of partitions:', '10');
                          const mode = prompt('Mode (linear/exponential):', 'linear');
                          const direction = mode === 'exponential' ? prompt('Direction (increasing/decreasing):', 'increasing') : 'increasing';
                          
                          if (partitions && mode) {
                            addSubdivision(activeCoordinate, i, {
                              partitions: parseInt(partitions),
                              mode,
                              direction
                            });
                          }
                        }}
                        className="px-2 py-1 bg-neutral-600 hover:bg-neutral-500 rounded text-white text-xs"
                      >
                        Add Subdivision
                      </button>
                    </div>
                    
                    {intervalSubdivisions.map((sub, subIndex) => (
                      <div key={subIndex} className="flex items-center justify-between bg-neutral-600 p-2 rounded mt-1">
                        <span className="text-xs text-white">
                          {sub.partitions} partitions, {sub.mode} {sub.mode === 'exponential' && `(${sub.direction})`}
                        </span>
                        <button
                          onClick={() => removeSubdivision(activeCoordinate, currentSubdivisions.findIndex(s => s === sub))}
                          className="p-1 hover:bg-neutral-500 rounded text-red-400"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-900/20 border border-red-500 rounded p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="text-red-400 mt-0.5" size={16} />
              <div>
                <h4 className="text-red-400 font-medium text-sm">Validation Errors:</h4>
                <ul className="text-xs text-red-300 mt-1 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Validation Status */}
        {isValidated && (
          <div className="bg-green-900/20 border border-green-500 rounded p-3">
            <div className="flex items-center space-x-2">
              <Check className="text-green-400" size={16} />
              <span className="text-green-400 text-sm font-medium">Mesh validated successfully!</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-4 border-t border-neutral-600 bg-neutral-750">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <div className="flex space-x-2">
          <button
            onClick={validateMesh}
            className="px-4 py-2 bg-neutral-500 hover:bg-neutral-400 text-white rounded text-sm transition-colors"
          >
            Validate Mesh
          </button>
        </div>
      </div>
    </div>
  );
}
