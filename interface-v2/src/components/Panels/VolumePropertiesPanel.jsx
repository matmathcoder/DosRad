import React, { useState, useRef, useEffect } from 'react';
import { X, Box, Droplets, Atom, Settings, Copy, Edit2, Trash2 } from 'lucide-react';

export default function VolumePropertiesPanel({ 
  isVisible, 
  onClose, 
  volumeData,
  onEdit,
  onDelete,
  onCopy
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState({ x: 100, y: 100 });
  const panelRef = useRef();

  // Handle clicks outside panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
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
        x: e.clientX - panelPosition.x,
        y: e.clientY - panelPosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const margin = 20;
    const maxX = window.innerWidth - 400 - margin; // panel width
    const maxY = window.innerHeight - 600 - margin; // approximate panel height
    
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));
    
    setPanelPosition({ x: boundedX, y: boundedY });
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

  if (!isVisible || !volumeData) return null;

  const userData = volumeData.userData || {};
  const composition = userData.composition || {};
  const position = volumeData.position || userData.position || {};
  const rotation = volumeData.rotation || userData.rotation || {};
  const scale = volumeData.scale || userData.scale || {};

  return (
    <div 
      ref={panelRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-96 pointer-events-auto fixed z-[100]"
      style={{
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-700 rounded-t-lg px-4 py-3 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Settings size={16} className="text-blue-400" />
          <h3 className="text-white font-medium">Volume Properties</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onCopy}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Copy Properties"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onEdit}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Edit Properties"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-600 rounded text-white"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Basic Information */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm flex items-center space-x-2">
            <Box size={14} className="text-blue-400" />
            <span>Basic Information</span>
          </h4>
          <div className="bg-neutral-700 rounded p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">Name:</span>
              <span className="text-white text-xs">{userData.volumeName || volumeData.name || 'Unnamed'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">Type:</span>
              <span className="text-white text-xs">{userData.type || volumeData.type || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">Volume Type:</span>
              <span className="text-white text-xs">{userData.volumeType || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">Visible:</span>
              <span className={`text-xs ${userData.visible !== false ? 'text-green-400' : 'text-red-400'}`}>
                {userData.visible !== false ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Transform Properties */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm flex items-center space-x-2">
            <Settings size={14} className="text-green-400" />
            <span>Transform</span>
          </h4>
          <div className="bg-neutral-700 rounded p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">Position:</span>
              <span className="text-white text-xs">
                X: {position.x?.toFixed(2) || '0.00'}, 
                Y: {position.y?.toFixed(2) || '0.00'}, 
                Z: {position.z?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">Rotation:</span>
              <span className="text-white text-xs">
                X: {rotation.x?.toFixed(2) || '0.00'}, 
                Y: {rotation.y?.toFixed(2) || '0.00'}, 
                Z: {rotation.z?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">Scale:</span>
              <span className="text-white text-xs">
                X: {scale.x?.toFixed(2) || '1.00'}, 
                Y: {scale.y?.toFixed(2) || '1.00'}, 
                Z: {scale.z?.toFixed(2) || '1.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Material Properties */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm flex items-center space-x-2">
            <Droplets size={14} className="text-purple-400" />
            <span>Material</span>
          </h4>
          <div className="bg-neutral-700 rounded p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">Color:</span>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded border border-neutral-500"
                  style={{ 
                    backgroundColor: userData.originalColor ? 
                      `#${userData.originalColor.toString(16).padStart(6, '0')}` : 
                      '#404040' 
                  }}
                />
                <span className="text-white text-xs">
                  {userData.originalColor ? 
                    `#${userData.originalColor.toString(16).padStart(6, '0')}` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Composition */}
        {composition && Object.keys(composition).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center space-x-2">
              <Droplets size={14} className="text-cyan-400" />
              <span>Composition</span>
            </h4>
            <div className="bg-neutral-700 rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Name:</span>
                <span className="text-white text-xs">{composition.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Density:</span>
                <span className="text-white text-xs">{composition.density || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Color:</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border border-neutral-500"
                    style={{ backgroundColor: composition.color || '#404040' }}
                  />
                  <span className="text-white text-xs">{composition.color || 'N/A'}</span>
                </div>
              </div>
              {composition.elements && (
                <div className="mt-2">
                  <span className="text-neutral-400 text-xs">Elements:</span>
                  <div className="mt-1 space-y-1">
                    {composition.elements.map((element, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-white">{element.element}</span>
                        <span className="text-neutral-400">{element.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source Properties */}
        {userData.isSource && (
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center space-x-2">
              <Atom size={14} className="text-red-400" />
              <span>Source Properties</span>
            </h4>
            <div className="bg-neutral-700 rounded p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Is Source:</span>
                <span className="text-red-400 text-xs">Yes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Real Density:</span>
                <span className="text-white text-xs">{userData.realDensity || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Tolerance:</span>
                <span className="text-white text-xs">{userData.tolerance || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Calculation:</span>
                <span className="text-white text-xs">{userData.calculation || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Gamma Selection:</span>
                <span className="text-white text-xs">{userData.gammaSelectionMode || 'N/A'}</span>
              </div>
              {userData.spectrum && (
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-xs">Spectrum:</span>
                  <span className="text-white text-xs">{userData.spectrum.name || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Properties */}
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm flex items-center space-x-2">
            <Settings size={14} className="text-yellow-400" />
            <span>Additional</span>
          </h4>
          <div className="bg-neutral-700 rounded p-3 space-y-2">
            {userData.importedFrom && (
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Imported From:</span>
                <span className="text-white text-xs">{userData.importedFrom}</span>
              </div>
            )}
            {userData.isExample && (
              <div className="flex justify-between">
                <span className="text-neutral-400 text-xs">Example:</span>
                <span className="text-indigo-400 text-xs">Yes</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-400 text-xs">ID:</span>
              <span className="text-white text-xs font-mono">{userData.id || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
