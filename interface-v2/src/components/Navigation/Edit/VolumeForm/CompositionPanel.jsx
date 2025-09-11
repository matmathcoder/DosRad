import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Save, RotateCcw, Move } from 'lucide-react';
import apiService from '../../../../services/api.js';

const PREDEFINED_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#A9DFBF'
];

const COMMON_ELEMENTS = [
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
  'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
  'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
  'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn',
  'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
  'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb',
  'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
  'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th',
  'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm'
];

export default function CompositionPanel({ 
  isVisible, 
  onClose, 
  onUse, 
  onStore, 
  initialComposition = null,
  existingCompositions = [],
  projectId,
  onCompositionCreated
}) {
  const [position, setPosition] = useState({ x: 250, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  const [compositionData, setCompositionData] = useState({
    name: '',
    density: '',
    color: PREDEFINED_COLORS[0],
    elements: [] // Array of {element, percentage}
  });

  const [currentElement, setCurrentElement] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [selectedElementIndex, setSelectedElementIndex] = useState(-1);
  const [nameError, setNameError] = useState('');

  // Initialize with existing composition if provided
  useEffect(() => {
    if (initialComposition) {
      setCompositionData(initialComposition);
    } else {
      setCompositionData({
        name: '',
        density: '',
        color: PREDEFINED_COLORS[0],
        elements: []
      });
    }
  }, [initialComposition]);

  // Validate composition name uniqueness
  const validateName = (name) => {
    if (!name.trim()) {
      setNameError('Composition name is required');
      return false;
    }
    
    const isDuplicate = existingCompositions.some(comp => 
      comp.name.toLowerCase() === name.toLowerCase() && 
      comp.name !== initialComposition?.name
    );
    
    if (isDuplicate) {
      setNameError('Composition name must be unique');
      return false;
    }
    
    setNameError('');
    return true;
  };

  const handleInputChange = (field, value) => {
    setCompositionData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'name') {
      validateName(value);
    }
  };

  const handleAddElement = () => {
    if (!currentElement || !currentPercentage) return;
    
    const percentage = parseFloat(currentPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) return;

    const newElements = [...compositionData.elements];
    const existingIndex = newElements.findIndex(el => el.element === currentElement);
    
    if (existingIndex >= 0) {
      // Replace existing element
      newElements[existingIndex] = { element: currentElement, percentage };
    } else {
      // Add new element
      newElements.push({ element: currentElement, percentage });
    }
    
    setCompositionData(prev => ({
      ...prev,
      elements: newElements
    }));
    
    setCurrentElement('');
    setCurrentPercentage('');
  };

  const handleDeleteElement = () => {
    if (selectedElementIndex >= 0) {
      const newElements = compositionData.elements.filter((_, index) => index !== selectedElementIndex);
      setCompositionData(prev => ({
        ...prev,
        elements: newElements
      }));
      setSelectedElementIndex(-1);
    }
  };

  const handleElementSelect = (index) => {
    setSelectedElementIndex(index);
    const element = compositionData.elements[index];
    setCurrentElement(element.element);
    setCurrentPercentage(element.percentage.toString());
  };

  const handleCancel = () => {
    if (initialComposition) {
      setCompositionData(initialComposition);
    } else {
      setCompositionData({
        name: '',
        density: '',
        color: PREDEFINED_COLORS[0],
        elements: []
      });
    }
    setCurrentElement('');
    setCurrentPercentage('');
    setSelectedElementIndex(-1);
    setNameError('');
    onClose();
  };

  const handleUse = () => {
    if (!validateName(compositionData.name)) return;
    if (compositionData.elements.length === 0) return;
    
    const totalPercentage = compositionData.elements.reduce((sum, el) => sum + el.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      alert('Total element percentages must equal 100%');
      return;
    }
    
    onUse(compositionData);
    onClose();
  };

  const handleStore = async () => {
    if (!validateName(compositionData.name)) return;
    if (compositionData.elements.length === 0) return;
    
    const totalPercentage = compositionData.elements.reduce((sum, el) => sum + el.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      alert('Total element percentages must equal 100%');
      return;
    }
    
    try {
      const compositionPayload = {
        name: compositionData.name,
        density: parseFloat(compositionData.density) || 0,
        color: compositionData.color,
        elements: compositionData.elements
      };
      
      const savedComposition = await apiService.createComposition(projectId, compositionPayload);
      
      // Notify parent about new composition
      if (onCompositionCreated) {
        onCompositionCreated(savedComposition);
      }
      
      // Call original onStore
      onStore(savedComposition);
      onClose();
    } catch (error) {
      console.error('Error saving composition:', error);
      alert('Error saving composition. Please try again.');
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
    const maxX = window.innerWidth - 600 - margin;
    const maxY = window.innerHeight - 700 - margin;
    
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

  const totalPercentage = compositionData.elements.reduce((sum, el) => sum + el.percentage, 0);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('component-type', 'composition-panel');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Composition Panel',
      type: 'composition-panel',
      compositionData,
      selectedElementIndex
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      ref={formRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[600px] max-h-[80vh] overflow-y-auto pointer-events-auto absolute z-50"
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
          <h2 className="text-white font-medium">Composition Editor</h2>
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
        {/* Composition Info */}
        <div className="mb-4">
          <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Composition Properties</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Composition Name *
              </label>
              <input
                type="text"
                value={compositionData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-2 py-1.5 bg-neutral-700 border rounded text-white text-xs focus:outline-none ${
                  nameError ? 'border-red-500 focus:border-red-400' : 'border-neutral-600 focus:border-neutral-400'
                }`}
                placeholder="Enter composition name"
              />
              {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
            </div>
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Density (g/cm³)
              </label>
              <input
                type="number"
                step="0.001"
                value={compositionData.density}
                onChange={(e) => handleInputChange('density', e.target.value)}
                className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                placeholder="0.000"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <label className="block text-white text-xs font-medium mb-2">
              Composition Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_COLORS.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleInputChange('color', color)}
                  className={`w-6 h-6 rounded border-2 ${
                    compositionData.color === color ? 'border-white' : 'border-neutral-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Element Entry */}
        <div className="mb-4">
          <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Add/Modify Elements</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Element
              </label>
              <select
                value={currentElement}
                onChange={(e) => setCurrentElement(e.target.value)}
                className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
              >
                <option value="">Select element</option>
                {COMMON_ELEMENTS.map(element => (
                  <option key={element} value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Percentage (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={currentPercentage}
                onChange={(e) => setCurrentPercentage(e.target.value)}
                className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleAddElement}
                disabled={!currentElement || !currentPercentage}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
              >
                <Plus size={12} />
                Add
              </button>
              <button
                onClick={handleDeleteElement}
                disabled={selectedElementIndex < 0}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Elements Table */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium text-sm">Composition Elements</h3>
            <span className={`text-xs px-2 py-1 rounded ${
              Math.abs(totalPercentage - 100) < 0.01 ? 'bg-green-600' : 'bg-red-600'
            } text-white`}>
              Total: {totalPercentage.toFixed(2)}%
            </span>
          </div>
          <div className="bg-neutral-700 rounded border border-neutral-600 max-h-32 overflow-y-auto">
            {compositionData.elements.length === 0 ? (
              <div className="p-3 text-neutral-400 text-xs text-center">
                No elements added yet
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-600">
                    <th className="text-left p-2 text-white">Element</th>
                    <th className="text-right p-2 text-white">Percentage (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {compositionData.elements.map((element, index) => (
                    <tr
                      key={index}
                      onClick={() => handleElementSelect(index)}
                      className={`cursor-pointer hover:bg-neutral-600 ${
                        selectedElementIndex === index ? 'bg-neutral-600' : ''
                      }`}
                    >
                      <td className="p-2 text-white">{element.element}</td>
                      <td className="p-2 text-white text-right">{element.percentage.toFixed(2)}</td>
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
          onClick={handleUse}
          disabled={!compositionData.name || compositionData.elements.length === 0 || nameError}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded"
        >
          USE
        </button>
        <button
          onClick={handleStore}
          disabled={!compositionData.name || compositionData.elements.length === 0 || nameError}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
        >
          <Save size={12} />
          STORE
        </button>
      </div>
    </div>
  );
}
