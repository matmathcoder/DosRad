import React, { useState, useRef, useEffect } from 'react';
import { X, Save, RotateCcw, Move } from 'lucide-react';

export default function VolumeForm({ isVisible, onClose, onSave }) {
  const [formData, setFormData] = useState({
    volume: '',
    volumeType: 'solid',
    geometryType: 'cube', // Added geometry type
    composition: '',
    realDensity: '',
    tolerance: '',
    source: '',
    calculation: 'by-lines',
    gammaSelectionMode: 'automatic',
    spectrum: ''
  });

  // Dragging state - Initialize to original position (behind GeometrySelector)
  const [position, setPosition] = useState({ 
    x: 208, // Original left position (52 * 4)
    y: 64   // Original top position (16 * 4)
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving volume:', formData);
    onSave(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      volume: '',
      volumeType: 'solid',
      geometryType: 'cube', // Added geometry type
      composition: '',
      realDensity: '',
      tolerance: '',
      source: '',
      calculation: 'by-lines',
      gammaSelectionMode: 'automatic',
      spectrum: ''
    });
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
    const maxX = window.innerWidth - 500 - margin; // form width
    const maxY = window.innerHeight - 600 - margin; // approximate form height
    
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
    <div 
      ref={formRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[500px] max-h-[80vh] overflow-y-auto pointer-events-auto absolute"
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
            <h2 className="text-white font-medium">New Volume</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-600 rounded text-white"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4">
          {/* Volume Section */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Volume</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Volume Name
                </label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => handleInputChange('volume', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  placeholder="Enter volume name"
                />
              </div>
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Volume Type
                </label>
                <select
                  value={formData.volumeType}
                  onChange={(e) => handleInputChange('volumeType', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                >
                  <option value="solid">Solid</option>
                  <option value="liquid">Liquid</option>
                  <option value="gas">Gas</option>
                  <option value="compound">Compound</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3">
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Geometry Shape
                </label>
                <select
                  value={formData.geometryType}
                  onChange={(e) => handleInputChange('geometryType', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                >
                  <option value="cube">Cube</option>
                  <option value="sphere">Sphere</option>
                  <option value="cylinder">Cylinder</option>
                  <option value="cone">Cone</option>
                </select>
              </div>
            </div>
          </div>

          {/* Composition Section */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Composition</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-white text-xs font-medium mb-1">
                  Material Composition
                </label>
                <input
                  type="text"
                  value={formData.composition}
                  onChange={(e) => handleInputChange('composition', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  placeholder="Material composition"
                />
              </div>
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Real Density (g/cm³)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.realDensity}
                  onChange={(e) => handleInputChange('realDensity', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  placeholder="0.000"
                />
              </div>
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Tolerance
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.tolerance}
                  onChange={(e) => handleInputChange('tolerance', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  placeholder="0.0000"
                />
              </div>
            </div>
          </div>

          {/* Source Section */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Source</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  placeholder="Source identifier"
                />
              </div>
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Calculation
                </label>
                <select
                  value={formData.calculation}
                  onChange={(e) => handleInputChange('calculation', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                >
                  <option value="by-lines">By Lines</option>
                  <option value="by-groups">By Groups</option>
                </select>
              </div>
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Gamma Selection Mode
                </label>
                <select
                  value={formData.gammaSelectionMode}
                  onChange={(e) => handleInputChange('gammaSelectionMode', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Spectrum
                </label>
                <input
                  type="text"
                  value={formData.spectrum}
                  onChange={(e) => handleInputChange('spectrum', e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  placeholder="Spectrum configuration"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 p-3 bg-neutral-750 rounded-b-lg border-t border-neutral-600">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-neutral-500 hover:bg-neutral-400 text-white text-xs rounded flex items-center gap-1"
          >
            <Save size={12} />
            Save Volume
          </button>
        </div>
    </div>
  );
}
