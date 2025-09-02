import React, { useState, useRef, useEffect } from 'react';
import { X, Save, RotateCcw, Move, Edit, Plus } from 'lucide-react';

export default function VolumeForm({ 
  isVisible, 
  onClose, 
  onSave, 
  onShowCompositionPanel, 
  onShowLineSpectrumPanel, 
  onShowGroupSpectrumPanel,
  onCompositionChange,
  onSpectrumChange
}) {
  const [formData, setFormData] = useState({
    volume: '',
    volumeType: 'solid',
    geometryType: 'cube',
    compositionName: '',
    composition: null, // Full composition object
    realDensity: '',
    tolerance: '',
    isSource: false,
    gammaSelectionMode: 'by-lines',
    calculation: 'by-lines',
    spectrumName: '',
    spectrum: null // Full spectrum object
  });

  // Panel visibility is now managed by parent component

  // Mock data - in real app this would come from database/API
  const [existingCompositions] = useState([
    { name: 'Steel', density: 7.85, color: '#A9A9A9', elements: [{ element: 'Fe', percentage: 98 }, { element: 'C', percentage: 2 }] },
    { name: 'Aluminum', density: 2.70, color: '#C0C0C0', elements: [{ element: 'Al', percentage: 100 }] },
    { name: 'Water', density: 1.00, color: '#87CEEB', elements: [{ element: 'H', percentage: 11.19 }, { element: 'O', percentage: 88.81 }] }
  ]);

  const [existingSpectra] = useState([
    { name: 'Co-60 Standard', type: 'line', multiplier: 1.0, lines: [{ energy: 1173.2, intensity: 99.85 }, { energy: 1332.5, intensity: 99.98 }] },
    { name: 'Cs-137 Standard', type: 'line', multiplier: 1.0, lines: [{ energy: 661.7, intensity: 85.1 }] },
    { name: 'Mixed Fission', type: 'group', multiplier: 1.0, isotopes: ['Cs-137', 'Sr-90', 'I-131'] }
  ]);

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
      geometryType: 'cube',
      compositionName: '',
      composition: null,
      realDensity: '',
      tolerance: '',
      isSource: false,
      gammaSelectionMode: 'by-lines',
      calculation: 'by-lines',
      spectrumName: '',
      spectrum: null
    });
  };

  // Composition panel handlers
  const handleCompositionUse = (compositionData) => {
    const updatedData = {
      ...formData,
      compositionName: compositionData.name,
      composition: compositionData,
      realDensity: compositionData.density
    };
    setFormData(updatedData);
    onCompositionChange && onCompositionChange(compositionData);
  };

  const handleCompositionStore = (compositionData) => {
    // In real app, this would save to database
    console.log('Storing composition:', compositionData);
    handleCompositionUse(compositionData);
  };

  const handleCompositionSelect = (compositionName) => {
    const selectedComposition = existingCompositions.find(comp => comp.name === compositionName);
    if (selectedComposition) {
      handleCompositionUse(selectedComposition);
    }
  };

  // Spectrum panel handlers
  const handleSpectrumValidate = (spectrumData) => {
    const updatedData = {
      ...formData,
      spectrumName: spectrumData.name,
      spectrum: spectrumData
    };
    setFormData(updatedData);
    onSpectrumChange && onSpectrumChange(spectrumData);
  };

  const handleSpectrumSaveAs = (spectrumData) => {
    // In real app, this would save to database
    console.log('Saving spectrum:', spectrumData);
    handleSpectrumValidate(spectrumData);
  };

  const handleSpectrumSelect = (spectrumName) => {
    const selectedSpectrum = existingSpectra.find(spec => spec.name === spectrumName);
    if (selectedSpectrum) {
      handleSpectrumValidate(selectedSpectrum);
    }
  };

  const handleOpenSpectrumEditor = () => {
    if (formData.gammaSelectionMode === 'by-groups') {
      onShowGroupSpectrumPanel && onShowGroupSpectrumPanel();
    } else {
      onShowLineSpectrumPanel && onShowLineSpectrumPanel();
    }
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
      className="volume-form-container bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[500px] max-h-[80vh] pointer-events-auto absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 40
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
        <div className="volume-form-content p-4 max-h-[calc(80vh-120px)] overflow-y-auto">
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
                <div className="volume-form-select-container">
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
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3">
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Geometry Shape
                </label>
                <div className="volume-form-select-container">
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
          </div>

          {/* Composition Section */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Composition</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-white text-xs font-medium mb-1">
                  Material Composition
                </label>
                <div className="volume-form-select-container flex gap-2">
                  <select
                    value={formData.compositionName}
                    onChange={(e) => handleCompositionSelect(e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  >
                    <option value="">Select existing composition</option>
                    {existingCompositions.map(comp => (
                      <option key={comp.name} value={comp.name}>{comp.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => onShowCompositionPanel && onShowCompositionPanel()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded flex items-center gap-1"
                    title="Create or edit composition"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                </div>
                {formData.composition && (
                  <div className="mt-2 p-2 bg-neutral-700 rounded border border-neutral-600">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-neutral-400"
                        style={{ backgroundColor: formData.composition.color }}
                      />
                      <span className="text-white text-xs font-medium">{formData.composition.name}</span>
                    </div>
                    <div className="text-xs text-neutral-300">
                      Elements: {formData.composition.elements?.map(el => `${el.element} (${el.percentage}%)`).join(', ')}
                    </div>
                  </div>
                )}
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

          {/* Source Zone Section */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Source Zone</h3>
            
            {/* Source Volume Checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSource}
                  onChange={(e) => handleInputChange('isSource', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-white text-xs font-medium">This volume is a source volume</span>
              </label>
              {!formData.isSource && (
                <p className="text-neutral-400 text-xs mt-1">Check this box if the volume contains radioactive material</p>
              )}
            </div>

            {/* Source Configuration - Only shown if isSource is true */}
            {formData.isSource && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      Gamma Selection Mode
                    </label>
                    <div className="volume-form-select-container">
                      <select
                        value={formData.gammaSelectionMode}
                        onChange={(e) => handleInputChange('gammaSelectionMode', e.target.value)}
                        className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                      >
                        <option value="by-lines">By Lines</option>
                        <option value="by-groups">By Groups</option>
                        <option value="by-isotope">By Isotope</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      Calculation Mode
                    </label>
                    <div className="volume-form-select-container">
                      <select
                        value={formData.calculation}
                        onChange={(e) => handleInputChange('calculation', e.target.value)}
                        className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                      >
                        <option value="by-lines">By Lines</option>
                        <option value="by-groups">By Groups</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Spectrum Selection */}
                <div>
                  <label className="block text-white text-xs font-medium mb-1">
                    Spectrum Configuration
                  </label>
                  <div className="volume-form-select-container flex gap-2">
                    <select
                      value={formData.spectrumName}
                      onChange={(e) => handleSpectrumSelect(e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    >
                      <option value="">Select existing spectrum</option>
                      {existingSpectra.map(spec => (
                        <option key={spec.name} value={spec.name}>{spec.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleOpenSpectrumEditor}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded flex items-center gap-1"
                      title="Create new spectrum"
                    >
                      <Plus size={12} />
                      New
                    </button>
                  </div>
                  {formData.spectrum && (
                    <div className="mt-2 p-2 bg-neutral-700 rounded border border-neutral-600">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-xs font-medium">{formData.spectrum.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          formData.spectrum.type === 'line' ? 'bg-blue-600' : 'bg-purple-600'
                        } text-white`}>
                          {formData.spectrum.type === 'line' ? 'Line Spectrum' : 'Group Spectrum'}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-300">
                        {formData.spectrum.type === 'line' 
                          ? `${formData.spectrum.lines?.length || 0} spectral lines`
                          : `${formData.spectrum.isotopes?.length || 0} isotopes selected`
                        }
                      </div>
                      <div className="text-xs text-neutral-400">
                        Multiplier: {formData.spectrum.multiplier}
                      </div>
                    </div>
                  )}
                </div>

                {/* Calculation Note */}
                {formData.gammaSelectionMode === 'by-lines' && formData.spectrum?.lines?.length > 20 && (
                  <div className="p-2 bg-yellow-900/30 border border-yellow-600/50 rounded">
                    <p className="text-yellow-200 text-xs">
                      <strong>Note:</strong> Large number of spectral lines detected. Calculation will be performed by groups for efficiency.
                    </p>
                  </div>
                )}
              </div>
            )}
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
