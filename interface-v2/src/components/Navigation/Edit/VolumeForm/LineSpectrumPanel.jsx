import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Save, RotateCcw, Move, Edit3 } from 'lucide-react';
import apiService from '../../../../services/api.js';

export default function LineSpectrumPanel({ 
  isVisible, 
  onClose, 
  onValidate, 
  onSaveAs, 
  initialSpectrum = null,
  existingSpectra = [],
  projectId,
  onSpectrumCreated
}) {
  const [position, setPosition] = useState({ x: 300, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  const [spectrumData, setSpectrumData] = useState({
    name: '',
    multiplier: 1.0,
    lines: [] // Array of {energy, intensity}
  });

  const [currentEnergy, setCurrentEnergy] = useState('');
  const [currentIntensity, setCurrentIntensity] = useState('');
  const [selectedLineIndex, setSelectedLineIndex] = useState(-1);
  const [nameError, setNameError] = useState('');

  // Initialize with existing spectrum if provided
  useEffect(() => {
    if (initialSpectrum) {
      setSpectrumData(initialSpectrum);
    } else {
      setSpectrumData({
        name: '',
        multiplier: 1.0,
        lines: []
      });
    }
  }, [initialSpectrum]);

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

  const handleAddLine = () => {
    if (!currentEnergy || !currentIntensity) return;
    
    const energy = parseFloat(currentEnergy);
    const intensity = parseFloat(currentIntensity);
    
    if (isNaN(energy) || isNaN(intensity) || energy <= 0 || intensity <= 0) return;

    const newLines = [...spectrumData.lines];
    const existingIndex = newLines.findIndex(line => Math.abs(line.energy - energy) < 0.001);
    
    if (existingIndex >= 0) {
      // Replace existing line
      newLines[existingIndex] = { energy, intensity };
    } else {
      // Add new line and sort by energy
      newLines.push({ energy, intensity });
      newLines.sort((a, b) => a.energy - b.energy);
    }
    
    setSpectrumData(prev => ({
      ...prev,
      lines: newLines
    }));
    
    setCurrentEnergy('');
    setCurrentIntensity('');
    setSelectedLineIndex(-1);
  };

  const handleDeleteLine = () => {
    if (selectedLineIndex >= 0) {
      const newLines = spectrumData.lines.filter((_, index) => index !== selectedLineIndex);
      setSpectrumData(prev => ({
        ...prev,
        lines: newLines
      }));
      setSelectedLineIndex(-1);
      setCurrentEnergy('');
      setCurrentIntensity('');
    }
  };

  const handleLineSelect = (index) => {
    setSelectedLineIndex(index);
    const line = spectrumData.lines[index];
    setCurrentEnergy(line.energy.toString());
    setCurrentIntensity(line.intensity.toString());
  };

  const handleModifyLine = () => {
    if (selectedLineIndex >= 0 && currentEnergy && currentIntensity) {
      const energy = parseFloat(currentEnergy);
      const intensity = parseFloat(currentIntensity);
      
      if (isNaN(energy) || isNaN(intensity) || energy <= 0 || intensity <= 0) return;

      const newLines = [...spectrumData.lines];
      newLines[selectedLineIndex] = { energy, intensity };
      newLines.sort((a, b) => a.energy - b.energy);
      
      setSpectrumData(prev => ({
        ...prev,
        lines: newLines
      }));
      
      setCurrentEnergy('');
      setCurrentIntensity('');
      setSelectedLineIndex(-1);
    }
  };

  const handleCancel = () => {
    if (initialSpectrum) {
      setSpectrumData(initialSpectrum);
    } else {
      setSpectrumData({
        name: '',
        multiplier: 1.0,
        lines: []
      });
    }
    setCurrentEnergy('');
    setCurrentIntensity('');
    setSelectedLineIndex(-1);
    setNameError('');
    onClose();
  };

  const handleValidate = () => {
    if (!validateName(spectrumData.name)) return;
    if (spectrumData.lines.length === 0) {
      alert('At least one spectral line is required');
      return;
    }
    
    onValidate(spectrumData);
    onClose();
  };

  const handleSaveAs = async () => {
    if (!validateName(spectrumData.name)) return;
    if (spectrumData.lines.length === 0) {
      alert('At least one spectral line is required');
      return;
    }
    
    try {
      const spectrumPayload = {
        name: spectrumData.name,
        type: 'line',
        multiplier: parseFloat(spectrumData.multiplier) || 1.0,
        lines: spectrumData.lines,
        isotopes: []
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

  const handleDragStart = (e) => {
    e.dataTransfer.setData('component-type', 'line-spectrum-panel');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Line Spectrum Panel',
      type: 'line-spectrum-panel',
      spectrumData,
      selectedLineIndex
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
          <h2 className="text-white font-medium">Line Spectrum Editor</h2>
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
                  Number of Lines
                </label>
                <input
                  type="text"
                  value={spectrumData.lines.length}
                  readOnly
                  className="w-full px-2 py-1.5 bg-neutral-600 border border-neutral-600 rounded text-neutral-300 text-xs"
                />
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
              </div>
            </div>
          </div>

          {/* Right Panel - Line Entry */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Spectral Lines</h3>
            
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white text-xs font-medium mb-1">
                    Energy (keV)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={currentEnergy}
                    onChange={(e) => setCurrentEnergy(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <label className="block text-white text-xs font-medium mb-1">
                    Intensity (emission)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={currentIntensity}
                    onChange={(e) => setCurrentIntensity(e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                    placeholder="0.000"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddLine}
                  disabled={!currentEnergy || !currentIntensity}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add
                </button>
                <button
                  onClick={handleModifyLine}
                  disabled={selectedLineIndex < 0 || !currentEnergy || !currentIntensity}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
                >
                  <Edit3 size={12} />
                  Modify
                </button>
                <button
                  onClick={handleDeleteLine}
                  disabled={selectedLineIndex < 0}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lines Table */}
        <div className="mt-6">
          <h3 className="text-white font-medium text-sm mb-2">Spectral Lines</h3>
          <div className="bg-neutral-700 rounded border border-neutral-600 max-h-48 overflow-y-auto">
            {spectrumData.lines.length === 0 ? (
              <div className="p-4 text-neutral-400 text-xs text-center">
                No spectral lines added yet
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-600 bg-neutral-750">
                    <th className="text-left p-2 text-white">Energy (keV)</th>
                    <th className="text-right p-2 text-white">Intensity</th>
                    <th className="text-right p-2 text-white">Effective Intensity</th>
                  </tr>
                </thead>
                <tbody>
                  {spectrumData.lines.map((line, index) => (
                    <tr
                      key={index}
                      onClick={() => handleLineSelect(index)}
                      className={`cursor-pointer hover:bg-neutral-600 ${
                        selectedLineIndex === index ? 'bg-neutral-600' : ''
                      }`}
                    >
                      <td className="p-2 text-white">{line.energy.toFixed(3)}</td>
                      <td className="p-2 text-white text-right">{line.intensity.toFixed(3)}</td>
                      <td className="p-2 text-white text-right">
                        {(line.intensity * spectrumData.multiplier).toFixed(3)}
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
          disabled={!spectrumData.name || spectrumData.lines.length === 0 || nameError}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded"
        >
          Validate
        </button>
        <button
          onClick={handleSaveAs}
          disabled={!spectrumData.name || spectrumData.lines.length === 0 || nameError}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
        >
          <Save size={12} />
          Save As
        </button>
      </div>
    </div>
  );
}
