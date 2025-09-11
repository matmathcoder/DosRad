import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Save, RotateCcw, Move, Search } from 'lucide-react';
import apiService from '../../../../services/api.js';

// Sample isotopes data - in a real app this would come from a database or API
const SAMPLE_ISOTOPES = [
  { symbol: 'U-235', name: 'Uranium-235', halfLife: '7.04×10⁸ years', activity: 'High' },
  { symbol: 'U-238', name: 'Uranium-238', halfLife: '4.47×10⁹ years', activity: 'Medium' },
  { symbol: 'Pu-239', name: 'Plutonium-239', halfLife: '24,110 years', activity: 'High' },
  { symbol: 'Co-60', name: 'Cobalt-60', halfLife: '5.27 years', activity: 'High' },
  { symbol: 'Cs-137', name: 'Cesium-137', halfLife: '30.17 years', activity: 'Medium' },
  { symbol: 'I-131', name: 'Iodine-131', halfLife: '8.02 days', activity: 'High' },
  { symbol: 'Ra-226', name: 'Radium-226', halfLife: '1,600 years', activity: 'High' },
  { symbol: 'Am-241', name: 'Americium-241', halfLife: '432.2 years', activity: 'Medium' },
  { symbol: 'Sr-90', name: 'Strontium-90', halfLife: '28.8 years', activity: 'Medium' },
  { symbol: 'Tc-99m', name: 'Technetium-99m', halfLife: '6.01 hours', activity: 'High' },
  { symbol: 'H-3', name: 'Tritium', halfLife: '12.32 years', activity: 'Low' },
  { symbol: 'C-14', name: 'Carbon-14', halfLife: '5,730 years', activity: 'Low' },
  { symbol: 'Kr-85', name: 'Krypton-85', halfLife: '10.76 years', activity: 'Medium' },
  { symbol: 'Xe-133', name: 'Xenon-133', halfLife: '5.24 days', activity: 'Medium' },
  { symbol: 'Ba-133', name: 'Barium-133', halfLife: '10.51 years', activity: 'Medium' }
];

export default function GroupSpectrumPanel({ 
  isVisible, 
  onClose, 
  onValidate, 
  onSaveAs, 
  initialSpectrum = null,
  existingSpectra = [],
  projectId,
  onSpectrumCreated
}) {
  const [position, setPosition] = useState({ x: 350, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  const [spectrumData, setSpectrumData] = useState({
    name: '',
    multiplier: 1.0,
    isotopes: [] // Array of selected isotope symbols
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIsotopes, setSelectedIsotopes] = useState(new Set());
  const [nameError, setNameError] = useState('');

  // Initialize with existing spectrum if provided
  useEffect(() => {
    if (initialSpectrum) {
      setSpectrumData(initialSpectrum);
      setSelectedIsotopes(new Set(initialSpectrum.isotopes || []));
    } else {
      setSpectrumData({
        name: '',
        multiplier: 1.0,
        isotopes: []
      });
      setSelectedIsotopes(new Set());
    }
  }, [initialSpectrum]);

  // Filter isotopes based on search term
  const filteredIsotopes = SAMPLE_ISOTOPES.filter(isotope =>
    isotope.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    isotope.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validate spectrum name uniqueness
  const validateName = (name) => {
    if (!name.trim()) {
      setNameError('Spectrum name is required');
      return false;
    }
    
    const isDuplicate = existingSpectra.some(spec => 
      spec.name.toLowerCase() === name.toLowerCase() && 
      spec.name !== initialSpectrum?.name
    );
    
    if (isDuplicate) {
      setNameError('Spectrum name must be unique');
      return false;
    }
    
    setNameError('');
    return true;
  };

  const handleInputChange = (field, value) => {
    setSpectrumData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'name') {
      validateName(value);
    }
  };

  const handleIsotopeToggle = (isotopeSymbol) => {
    const newSelected = new Set(selectedIsotopes);
    if (newSelected.has(isotopeSymbol)) {
      newSelected.delete(isotopeSymbol);
    } else {
      newSelected.add(isotopeSymbol);
    }
    setSelectedIsotopes(newSelected);
    
    setSpectrumData(prev => ({
      ...prev,
      isotopes: Array.from(newSelected)
    }));
  };

  const handleSelectAll = () => {
    const allFiltered = new Set(filteredIsotopes.map(iso => iso.symbol));
    const newSelected = new Set([...selectedIsotopes, ...allFiltered]);
    setSelectedIsotopes(newSelected);
    
    setSpectrumData(prev => ({
      ...prev,
      isotopes: Array.from(newSelected)
    }));
  };

  const handleDeselectAll = () => {
    const filteredSymbols = new Set(filteredIsotopes.map(iso => iso.symbol));
    const newSelected = new Set(Array.from(selectedIsotopes).filter(iso => !filteredSymbols.has(iso)));
    setSelectedIsotopes(newSelected);
    
    setSpectrumData(prev => ({
      ...prev,
      isotopes: Array.from(newSelected)
    }));
  };

  const handleCancel = () => {
    if (initialSpectrum) {
      setSpectrumData(initialSpectrum);
      setSelectedIsotopes(new Set(initialSpectrum.isotopes || []));
    } else {
      setSpectrumData({
        name: '',
        multiplier: 1.0,
        isotopes: []
      });
      setSelectedIsotopes(new Set());
    }
    setSearchTerm('');
    setNameError('');
    onClose();
  };

  const handleValidate = () => {
    if (!validateName(spectrumData.name)) return;
    if (spectrumData.isotopes.length === 0) {
      alert('At least one isotope must be selected');
      return;
    }
    
    onValidate(spectrumData);
    onClose();
  };

  const handleSaveAs = async () => {
    if (!validateName(spectrumData.name)) return;
    if (spectrumData.isotopes.length === 0) {
      alert('At least one isotope must be selected');
      return;
    }
    
    try {
      const spectrumPayload = {
        name: spectrumData.name,
        type: 'group',
        multiplier: parseFloat(spectrumData.multiplier) || 1.0,
        lines: [],
        isotopes: spectrumData.isotopes
      };
      
      const savedSpectrum = await apiService.createSpectrum(projectId, spectrumPayload);
      
      // Notify parent about new spectrum
      if (onSpectrumCreated) {
        onSpectrumCreated(savedSpectrum);
      }
      
      // Call original onSaveAs
      onSaveAs(savedSpectrum);
      onClose();
    } catch (error) {
      console.error('Error saving spectrum:', error);
      alert('Error saving spectrum. Please try again.');
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
    
    const margin = 20;
    const maxX = window.innerWidth - 700 - margin;
    const maxY = window.innerHeight - 650 - margin;
    
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

  const handleDragStart = (e) => {
    e.dataTransfer.setData('component-type', 'group-spectrum-panel');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Group Spectrum Panel',
      type: 'group-spectrum-panel',
      spectrumData,
      selectedIsotopes
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      ref={formRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[700px] max-h-[80vh] overflow-y-auto pointer-events-auto absolute z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 50
      }}
      onMouseDown={handleMouseDown}
      draggable="true"
      onDragStart={handleDragStart}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-700 rounded-t-lg px-4 py-3 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Move size={14} className="text-neutral-400" />
          <h2 className="text-white font-medium">Group Spectrum Editor</h2>
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
        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel - General Information */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">General Information</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Spectrum Name *
                </label>
                <input
                  type="text"
                  value={spectrumData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-2 py-1.5 bg-neutral-700 border rounded text-white text-xs focus:outline-none ${
                    nameError ? 'border-red-500 focus:border-red-400' : 'border-neutral-600 focus:border-neutral-400'
                  }`}
                  placeholder="Enter spectrum name"
                />
                {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Multiplier Coefficient
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={spectrumData.multiplier}
                  onChange={(e) => handleInputChange('multiplier', parseFloat(e.target.value) || 1.0)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  placeholder="1.0"
                />
                <p className="text-neutral-400 text-xs mt-1">Applied to all isotopes in this spectrum</p>
              </div>

              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Selected Isotopes
                </label>
                <div className="bg-neutral-700 rounded border border-neutral-600 p-2 max-h-32 overflow-y-auto">
                  {selectedIsotopes.size === 0 ? (
                    <p className="text-neutral-400 text-xs">No isotopes selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {Array.from(selectedIsotopes).map(symbol => (
                        <span
                          key={symbol}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
                        >
                          {symbol}
                          <button
                            onClick={() => handleIsotopeToggle(symbol)}
                            className="hover:bg-blue-700 rounded"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Isotope Selection */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Isotope Selection</h3>
            
            {/* Search */}
            <div className="mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  placeholder="Search isotopes..."
                />
              </div>
            </div>

            {/* Selection Controls */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleSelectAll}
                className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>

        {/* Isotopes Table */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium text-sm">Available Isotopes</h3>
            <span className="text-xs text-neutral-400">
              {selectedIsotopes.size} of {filteredIsotopes.length} selected
            </span>
          </div>
          <div className="bg-neutral-700 rounded border border-neutral-600 max-h-64 overflow-y-auto">
            {filteredIsotopes.length === 0 ? (
              <div className="p-4 text-neutral-400 text-xs text-center">
                No isotopes found matching "{searchTerm}"
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-600 bg-neutral-750 sticky top-0">
                    <th className="text-left p-2 text-white w-12">Select</th>
                    <th className="text-left p-2 text-white">Symbol</th>
                    <th className="text-left p-2 text-white">Name</th>
                    <th className="text-left p-2 text-white">Half-Life</th>
                    <th className="text-left p-2 text-white">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIsotopes.map((isotope) => (
                    <tr
                      key={isotope.symbol}
                      className={`cursor-pointer hover:bg-neutral-600 ${
                        selectedIsotopes.has(isotope.symbol) ? 'bg-blue-900/30' : ''
                      }`}
                      onClick={() => handleIsotopeToggle(isotope.symbol)}
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedIsotopes.has(isotope.symbol)}
                          onChange={() => handleIsotopeToggle(isotope.symbol)}
                          className="w-3 h-3 accent-blue-600"
                        />
                      </td>
                      <td className="p-2 text-white font-mono">{isotope.symbol}</td>
                      <td className="p-2 text-white">{isotope.name}</td>
                      <td className="p-2 text-white">{isotope.halfLife}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          isotope.activity === 'High' ? 'bg-red-600 text-white' :
                          isotope.activity === 'Medium' ? 'bg-yellow-600 text-white' :
                          'bg-green-600 text-white'
                        }`}>
                          {isotope.activity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-2 p-3 bg-neutral-750 rounded-b-lg border-t border-neutral-600">
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded flex items-center gap-1"
        >
          <RotateCcw size={12} />
          Cancel
        </button>
        <button
          onClick={handleValidate}
          disabled={!spectrumData.name || spectrumData.isotopes.length === 0 || nameError}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded"
        >
          Validate
        </button>
        <button
          onClick={handleSaveAs}
          disabled={!spectrumData.name || spectrumData.isotopes.length === 0 || nameError}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
        >
          <Save size={12} />
          Save As
        </button>
      </div>
    </div>
  );
}
