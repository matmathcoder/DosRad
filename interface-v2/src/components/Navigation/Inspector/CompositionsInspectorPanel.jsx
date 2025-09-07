import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Eye, EyeOff, Move, Search, Filter } from 'lucide-react';

export default function CompositionsInspectorPanel({ 
  isVisible, 
  onClose, 
  compositions = [],
  onEditComposition,
  onDeleteComposition,
  onCreateComposition
}) {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'with-elements', 'empty'
  const [selectedComposition, setSelectedComposition] = useState(null);

  // Filter compositions based on search term and filter type
  const filteredCompositions = compositions.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterType) {
      case 'with-elements':
        matchesFilter = comp.elements && comp.elements.length > 0;
        break;
      case 'empty':
        matchesFilter = !comp.elements || comp.elements.length === 0;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleCompositionSelect = (composition) => {
    setSelectedComposition(composition);
  };

  const handleEdit = () => {
    if (selectedComposition && onEditComposition) {
      onEditComposition(selectedComposition);
    }
  };

  const handleDelete = () => {
    if (selectedComposition && onDeleteComposition) {
      if (confirm(`Are you sure you want to delete composition "${selectedComposition.name}"?`)) {
        onDeleteComposition(selectedComposition);
        setSelectedComposition(null);
      }
    }
  };

  const handleCreateNew = () => {
    if (onCreateComposition) {
      onCreateComposition();
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
    const maxY = window.innerHeight - 500 - margin;
    
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
    e.dataTransfer.setData('component-type', 'compositions-inspector-panel');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Compositions Inspector Panel',
      type: 'compositions-inspector-panel',
      selectedComposition
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
          <h2 className="text-white font-medium">Compositions Inspector</h2>
          <span className="text-xs text-neutral-400">
            ({compositions.length} compositions)
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-600 rounded text-white"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        {/* Search and Filter Controls */}
        <div className="mb-4">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                placeholder="Search compositions..."
              />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-8 pr-6 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
              >
                <option value="all">All</option>
                <option value="with-elements">With Elements</option>
                <option value="empty">Empty</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compositions List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium text-sm">Compositions</h3>
            <button
              onClick={handleCreateNew}
              className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded flex items-center gap-1"
            >
              <Plus size={12} />
              New
            </button>
          </div>
          
          <div className="bg-neutral-700 rounded border border-neutral-600 max-h-64 overflow-y-auto">
            {filteredCompositions.length === 0 ? (
              <div className="p-4 text-neutral-400 text-xs text-center">
                {searchTerm || filterType !== 'all' 
                  ? 'No compositions match the current filter' 
                  : 'No compositions created yet'
                }
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-600 bg-neutral-750 sticky top-0">
                    <th className="text-left p-2 text-white">Name</th>
                    <th className="text-left p-2 text-white">Density</th>
                    <th className="text-left p-2 text-white">Elements</th>
                    <th className="text-left p-2 text-white">Color</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompositions.map((composition, index) => (
                    <tr
                      key={composition.id || index}
                      onClick={() => handleCompositionSelect(composition)}
                      className={`cursor-pointer hover:bg-neutral-600 ${
                        selectedComposition?.id === composition.id ? 'bg-neutral-600' : ''
                      }`}
                    >
                      <td className="p-2 text-white font-medium">{composition.name}</td>
                      <td className="p-2 text-white">
                        {composition.density ? `${composition.density} g/cm³` : 'N/A'}
                      </td>
                      <td className="p-2 text-white">
                        {composition.elements ? composition.elements.length : 0}
                      </td>
                      <td className="p-2">
                        <div 
                          className="w-4 h-4 rounded border border-neutral-500"
                          style={{ backgroundColor: composition.color || '#888888' }}
                          title={composition.color || '#888888'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Selected Composition Details */}
        {selectedComposition && (
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">
              Composition Details
            </h3>
            <div className="bg-neutral-700 rounded border border-neutral-600 p-3">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Name</label>
                  <div className="text-white text-sm font-medium">{selectedComposition.name}</div>
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Density</label>
                  <div className="text-white text-sm">
                    {selectedComposition.density ? `${selectedComposition.density} g/cm³` : 'Not set'}
                  </div>
                </div>
              </div>
              
              {selectedComposition.elements && selectedComposition.elements.length > 0 && (
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Elements</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedComposition.elements.map((element, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        {element.element}: {element.percentage}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between p-3 bg-neutral-750 rounded-b-lg border-t border-neutral-600">
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={!selectedComposition}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded"
          >
            Close
          </button>
          <button
            onClick={handleEdit}
            disabled={!selectedComposition}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
          >
            <Edit size={12} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
