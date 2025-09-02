import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, Move } from 'lucide-react';

export default function GeometryPanel({ isOpen, onClose, selectedGeometry, existingVolumes = [] }) {
  const [activeTab, setActiveTab] = useState('coordinates');
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState('');
  const [intersectionWarning, setIntersectionWarning] = useState(false);
  const [intersectingVolumes, setIntersectingVolumes] = useState([]);
  const [predominatingVolume, setPredominatingVolume] = useState('');
  
  // Dragging state - Initialize to original position (left of sidebar)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef();

  // Set initial position when component mounts
  useEffect(() => {
    if (isOpen && position.x === 0 && position.y === 0) {
      setPosition({
        x: Math.max(20, window.innerWidth - 400), // Right side with space for sidebar
        y: Math.max(20, window.innerHeight / 2 - 200) // Centered vertically
      });
    }
  }, [isOpen, position.x, position.y]);

  // Coordinates data
  const [coordinates, setCoordinates] = useState({
    x1: 0, y1: 0, z1: 0, x2: 0, y2: 0, z2: 0, r1: 0, r2: 0
  });

  // Links data
  const [links, setLinks] = useState({
    x1: { volume: '', data: '', distance: 0, linked: false },
    y1: { volume: '', data: '', distance: 0, linked: false },
    z1: { volume: '', data: '', distance: 0, linked: false },
    z2: { volume: '', data: '', distance: 0, linked: false },
    r1: { volume: '', data: '', distance: 0, linked: false }
  });

  // Delta data
  const [deltas, setDeltas] = useState({
    x1: { plusDelta: 0, plusContrib: '+', minusDelta: 0, minusContrib: '+' },
    y1: { plusDelta: 0, plusContrib: '+', minusDelta: 0, minusContrib: '+' },
    z1: { plusDelta: 0, plusContrib: '+', minusDelta: 0, minusContrib: '+' },
    z2: { plusDelta: 0, plusContrib: '+', minusDelta: 0, minusContrib: '+' },
    r1: { plusDelta: 0, plusContrib: '+', minusDelta: 0, minusContrib: '+' }
  });

  // Get coordinate fields based on geometry type (following the exact specifications)
  const getCoordinateFields = (geometryType, axis = 'z') => {
    switch (geometryType?.toLowerCase()) {
      case 'box':
        return ['z1', 'x1', 'y1', 'z2', 'x2']; // Z, X, Y, 2, 1 as specified
      case 'sphere':
        return ['x1', 'z1', 'y1', 'r1']; // X1, Z1, Y1, R as specified
      case 'cylinder':
        if (axis === 'x') {
          return ['x1', 'x2', 'z1', 'y1', 'r1']; // Cylinder on X-axis
        } else if (axis === 'y') {
          return ['x1', 'y1', 'y2', 'z1', 'r1']; // Cylinder on Y-axis
        } else {
          return ['x1', 'y1', 'z1', 'z2', 'r1']; // Cylinder on Z-axis (default)
        }
      case 'cone':
        // Following cylinder pattern for cone
        if (axis === 'x') {
          return ['x1', 'x2', 'z1', 'y1', 'r1'];
        } else if (axis === 'y') {
          return ['x1', 'y1', 'y2', 'z1', 'r1'];
        } else {
          return ['x1', 'y1', 'z1', 'z2', 'r1'];
        }
      case 'frustum':
        return ['x1', 'x2', 'y1', 'z1', 'r1', 'r2']; // Frustum on X-Axis as specified
      default:
        return ['x1', 'y1', 'z1'];
    }
  };

  const activeFields = getCoordinateFields(selectedGeometry?.type);

  // Check for intersections when coordinates change
  useEffect(() => {
    if (activeTab === 'coordinates' && coordinates) {
      checkIntersections();
    }
  }, [coordinates, activeTab]);

  const checkIntersections = () => {
    // Simplified intersection check - in real implementation, this would use proper 3D geometry
    const intersecting = existingVolumes.filter(volume => {
      // Basic bounding box intersection check
      const tolerance = 0.1;
      return Math.abs(volume.position.x - coordinates.x1) < tolerance ||
             Math.abs(volume.position.y - coordinates.y1) < tolerance ||
             Math.abs(volume.position.z - coordinates.z1) < tolerance;
    });

    if (intersecting.length > 0) {
      setIntersectingVolumes(intersecting);
      setIntersectionWarning(true);
    } else {
      setIntersectionWarning(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'links' || tab === 'delta') {
      setWarningType(tab);
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const dismissWarning = () => {
    setShowWarning(false);
  };

  const handleCoordinateChange = (field, value) => {
    setCoordinates(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleLinkChange = (field, property, value) => {
    setLinks(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [property]: property === 'distance' ? (parseFloat(value) || 0) : value
      }
    }));
  };

  const handleDeltaChange = (field, property, value) => {
    setDeltas(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [property]: property.includes('Delta') ? (parseFloat(value) || 0) : value
      }
    }));
  };

  const getFieldLabel = (field) => {
    const labels = {
      x1: 'X1 (cm)', y1: 'Y1 (cm)', z1: 'Z1 (cm)',
      x2: 'X2 (cm)', y2: 'Y2 (cm)', z2: 'Z2 (cm)',
      r1: 'R1 (cm)', r2: 'R2 (cm)'
    };
    return labels[field] || field.toUpperCase();
  };

  const renderCoordinatesTab = () => {
    if (!selectedGeometry) {
      return (
        <div className="space-y-3">
          <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
            <div className="flex items-start space-x-2">
              <Info className="text-neutral-400 mt-0.5" size={14} />
              <div className="text-xs text-neutral-300">
                <strong className="text-neutral-200">No Geometry Selected</strong>
                <p className="mt-1">Select a geometry object in the 3D scene first.</p>
                <p className="mt-1">Select by:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                  <li>Using Select tool (sidebar)</li>
                  <li>Clicking geometry in scene</li>
                  <li>Creating new geometry</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="text-xs text-neutral-300">
          Type: <span className="font-semibold text-white">{selectedGeometry?.type || 'Unknown'}</span>
        </div>
      
        {intersectionWarning && (
          <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="text-neutral-400 mt-0.5" size={14} />
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-200 mb-1 text-xs">Volume Intersection Warning</h4>
                <p className="text-xs text-neutral-300 mb-2">
                  Intersects with {intersectingVolumes.length} volume(s). Select predominating:
                </p>
                <select
                  value={predominatingVolume}
                  onChange={(e) => setPredominatingVolume(e.target.value)}
                  className="w-full px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                >
                  <option value="">Select predominating volume...</option>
                  {intersectingVolumes.map((volume, index) => (
                    <option key={index} value={volume.id}>
                      {volume.type} - {volume.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {activeFields.map(field => (
            <div key={field}>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                {getFieldLabel(field)}
              </label>
              <input
                type="number"
                step="0.1"
                value={coordinates[field]}
                onChange={(e) => handleCoordinateChange(field, e.target.value)}
                className="w-full px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                placeholder="0.0"
              />
            </div>
          ))}
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-750 rounded p-2">
          <div className="mb-1">
            <strong>Coordinates for {selectedGeometry?.type}:</strong>
          </div>
          {selectedGeometry?.type === 'box' && (
            <div>Z1,X1,Y1,Z2,X2 (as specified)</div>
          )}
          {selectedGeometry?.type === 'sphere' && (
            <div>X1,Z1,Y1,R1 (center + radius)</div>
          )}
          {selectedGeometry?.type === 'cylinder' && (
            <div>X1,Y1,Z1,Z2,R1 (base + height + radius)</div>
          )}
          {selectedGeometry?.type === 'cone' && (
            <div>X1,Y1,Z1,Z2,R1 (base + height + radius)</div>
          )}
          {selectedGeometry?.type === 'frustum' && (
            <div>X1,X2,Y1,Z1,R1,R2 (X-axis frustum)</div>
          )}
        </div>
      </div>
    );
  };

  const renderLinksTab = () => {
    if (!selectedGeometry) {
      return (
        <div className="space-y-3">
          <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
            <div className="flex items-start space-x-2">
              <Info className="text-neutral-400 mt-0.5" size={14} />
              <div className="text-xs text-neutral-300">
                <strong className="text-neutral-200">No Geometry Selected</strong>
                <p className="mt-1">Select a geometry object first to configure coordinate links.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Warning Message */}
        {showWarning && warningType === 'links' && (
          <div className="bg-neutral-700 border border-neutral-500 rounded p-3">
            <div className="flex items-start space-x-2 mb-2">
              <AlertTriangle className="text-neutral-300 mt-0.5" size={14} />
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1 text-xs">Links Tab Warning</h4>
                <p className="text-xs text-neutral-300 mb-2">
                  The Links tab requires careful attention. Incorrect entries may cause unexpected behavior in volume relationships.
                </p>
                <button
                  onClick={dismissWarning}
                  className="px-2 py-1 bg-neutral-500 hover:bg-neutral-400 text-white rounded text-xs transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
          <div className="flex items-start space-x-2">
            <Info className="text-neutral-400 mt-0.5" size={14} />
            <div className="text-xs text-neutral-300">
              <strong className="text-neutral-200">Links Tab:</strong> Optional. Requires care. 
              Link coordinates to other volumes for relative positioning.
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {activeFields.map(field => (
            <div key={field} className="border border-neutral-600 rounded p-2">
              <h5 className="font-medium text-white mb-2 text-xs">{getFieldLabel(field)}</h5>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Volume</label>
                  <select
                    value={links[field]?.volume || ''}
                    onChange={(e) => handleLinkChange(field, 'volume', e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                  >
                    <option value="">Select volume...</option>
                    {existingVolumes.map((volume, index) => (
                      <option key={index} value={volume.id}>
                        {volume.type} - {volume.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Data</label>
                  <select
                    value={links[field]?.data || ''}
                    onChange={(e) => handleLinkChange(field, 'data', e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                  >
                    <option value="">Select coordinate...</option>
                    <option value="x1">X1</option>
                    <option value="y1">Y1</option>
                    <option value="z1">Z1</option>
                    <option value="x2">X2</option>
                    <option value="y2">Y2</option>
                    <option value="z2">Z2</option>
                    <option value="r1">R1</option>
                    <option value="r2">R2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Distance (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={links[field]?.distance || 0}
                    onChange={(e) => handleLinkChange(field, 'distance', e.target.value)}
                    className="w-full px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                    placeholder="0.0"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-1 text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={links[field]?.linked || false}
                      onChange={(e) => handleLinkChange(field, 'linked', e.target.checked)}
                      className="rounded bg-neutral-600 border-neutral-500 text-neutral-400 focus:ring-neutral-400"
                    />
                    <span>Link</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDeltaTab = () => {
    if (!selectedGeometry) {
      return (
        <div className="space-y-3">
          <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
            <div className="flex items-start space-x-2">
              <Info className="text-neutral-400 mt-0.5" size={14} />
              <div className="text-xs text-neutral-300">
                <strong className="text-neutral-200">No Geometry Selected</strong>
                <p className="mt-1">Select a geometry object first to configure tolerance limits.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Warning Message */}
        {showWarning && warningType === 'delta' && (
          <div className="bg-neutral-700 border border-neutral-500 rounded p-3">
            <div className="flex items-start space-x-2 mb-2">
              <AlertTriangle className="text-neutral-300 mt-0.5" size={14} />
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1 text-xs">Delta Tab Warning</h4>
                <p className="text-xs text-neutral-300 mb-2">
                  The Delta tab should only be used by individuals with the necessary expertise. Incorrect tolerance settings may affect calculation accuracy.
                </p>
                <button
                  onClick={dismissWarning}
                  className="px-2 py-1 bg-neutral-500 hover:bg-neutral-400 text-white rounded text-xs transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="text-neutral-400 mt-0.5" size={14} />
            <div className="text-xs text-neutral-300">
              <strong className="text-neutral-200">Delta Tab:</strong> Optional. Requires expertise. 
              Set tolerance limits for min/max configuration calculations.
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {activeFields.map(field => (
            <div key={field} className="border border-neutral-600 rounded p-2">
              <h5 className="font-medium text-white mb-2 text-xs">{getFieldLabel(field)}</h5>
              
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">+ Delta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deltas[field]?.plusDelta || 0}
                    onChange={(e) => handleDeltaChange(field, 'plusDelta', e.target.value)}
                    className="w-full px-1 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Contrib</label>
                  <select
                    value={deltas[field]?.plusContrib || '+'}
                    onChange={(e) => handleDeltaChange(field, 'plusContrib', e.target.value)}
                    className="w-full px-1 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                  >
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">- Delta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={deltas[field]?.minusDelta || 0}
                    onChange={(e) => handleDeltaChange(field, 'minusDelta', e.target.value)}
                    className="w-full px-1 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Contrib</label>
                  <select
                    value={deltas[field]?.minusContrib || '+'}
                    onChange={(e) => handleDeltaChange(field, 'minusContrib', e.target.value)}
                    className="w-full px-1 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-xs focus:border-neutral-400 focus:outline-none"
                  >
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-750 rounded p-2">
          <strong>Note:</strong> "+" contribution increases result, "-" reduces result.
          Define tolerance ranges for min/max calculations.
        </div>
      </div>
    );
  };

  const handleSave = () => {
    const geometryData = {
      type: selectedGeometry?.type,
      coordinates,
      links,
      deltas,
      predominatingVolume: intersectionWarning ? predominatingVolume : null
    };
    
    console.log('Saving geometry data:', geometryData);
    onClose(geometryData);
  };

  // Dragging functions
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Starting drag on GeometryPanel');
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
    
    // Keep within screen bounds with margins
    const margin = 20;
    const maxX = window.innerWidth - 320 - margin; // panel width
    const maxY = window.innerHeight - 400 - margin; // approximate panel height
    
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

  if (!isOpen) return null;

  return (
    <>
      <div 
        ref={panelRef}
        className="bg-neutral-800 rounded-lg shadow-xl w-80 max-h-[80vh] overflow-hidden border border-neutral-600 absolute pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'default',
          zIndex: 1000
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          console.log('GeometryPanel clicked');
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-600 bg-neutral-750 drag-handle cursor-grab">
          <div className="flex items-center space-x-2">
            <Move size={14} className="text-neutral-400" />
            <h3 className="text-sm font-semibold text-white">
              Geometry Panel{selectedGeometry ? ` - ${selectedGeometry.type}` : ''}
            </h3>
          </div>
          <button
            onClick={() => onClose()}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-600">
          {['coordinates', 'links', 'delta'].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-neutral-400 bg-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-3 overflow-y-auto max-h-[60vh]">
          {activeTab === 'coordinates' && renderCoordinatesTab()}
          {activeTab === 'links' && renderLinksTab()}
          {activeTab === 'delta' && renderDeltaTab()}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-3 border-t border-neutral-600 bg-neutral-750">
          <button
            onClick={() => onClose()}
            className="px-3 py-1 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-neutral-500 hover:bg-neutral-400 text-white rounded text-xs transition-colors"
            disabled={!selectedGeometry}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
