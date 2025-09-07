import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Eye, EyeOff, Move, Search, Filter, Zap } from 'lucide-react';

export default function SourcesInspectorPanel({ 
  isVisible, 
  onClose, 
  sources = [],
  onEditSource,
  onDeleteSource,
  onCreateSource
}) {
  const [position, setPosition] = useState({ x: 250, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'active', 'inactive'
  const [selectedSource, setSelectedSource] = useState(null);

  // Filter sources based on search term and filter type
  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterType) {
      case 'active':
        matchesFilter = source.isActive !== false;
        break;
      case 'inactive':
        matchesFilter = source.isActive === false;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
  };

  const handleEdit = () => {
    if (selectedSource && onEditSource) {
      onEditSource(selectedSource);
    }
  };

  const handleDelete = () => {
    if (selectedSource && onDeleteSource) {
      if (confirm(`Are you sure you want to delete source "${selectedSource.name}"?`)) {
        onDeleteSource(selectedSource);
        setSelectedSource(null);
      }
    }
  };

  const handleCreateNew = () => {
    if (onCreateSource) {
      onCreateSource();
    }
  };

  const handleToggleActive = () => {
    if (selectedSource) {
      const updatedSource = {
        ...selectedSource,
        isActive: !selectedSource.isActive
      };
      if (onEditSource) {
        onEditSource(updatedSource);
      }
      setSelectedSource(updatedSource);
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
    const maxX = window.innerWidth - 650 - margin;
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
    e.dataTransfer.setData('component-type', 'sources-inspector-panel');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Sources Inspector Panel',
      type: 'sources-inspector-panel',
      selectedSource
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      ref={formRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[650px] max-h-[80vh] overflow-y-auto pointer-events-auto absolute z-50"
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
          <Zap size={14} className="text-yellow-400" />
          <h2 className="text-white font-medium">Sources Inspector</h2>
          <span className="text-xs text-neutral-400">
            ({sources.length} sources)
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
                placeholder="Search sources..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sources List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium text-sm">Sources</h3>
            <button
              onClick={handleCreateNew}
              className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded flex items-center gap-1"
            >
              <Plus size={12} />
              New
            </button>
          </div>
          
          <div className="bg-neutral-700 rounded border border-neutral-600 max-h-64 overflow-y-auto">
            {filteredSources.length === 0 ? (
              <div className="p-4 text-neutral-400 text-xs text-center">
                {searchTerm || filterType !== 'all' 
                  ? 'No sources match the current filter' 
                  : 'No sources created yet'
                }
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-600 bg-neutral-750 sticky top-0">
                    <th className="text-left p-2 text-white">Name</th>
                    <th className="text-left p-2 text-white">Type</th>
                    <th className="text-left p-2 text-white">Energy</th>
                    <th className="text-left p-2 text-white">Activity</th>
                    <th className="text-left p-2 text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSources.map((source, index) => (
                    <tr
                      key={source.id || index}
                      onClick={() => handleSourceSelect(source)}
                      className={`cursor-pointer hover:bg-neutral-600 ${
                        selectedSource?.id === source.id ? 'bg-neutral-600' : ''
                      }`}
                    >
                      <td className="p-2 text-white font-medium">{source.name}</td>
                      <td className="p-2 text-white">
                        {source.type || 'Unknown'}
                      </td>
                      <td className="p-2 text-white">
                        {source.energy ? `${source.energy} keV` : 'N/A'}
                      </td>
                      <td className="p-2 text-white">
                        {source.activity ? `${source.activity} Bq` : 'N/A'}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          source.isActive !== false 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {source.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Selected Source Details */}
        {selectedSource && (
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">
              Source Details
            </h3>
            <div className="bg-neutral-700 rounded border border-neutral-600 p-3">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Name</label>
                  <div className="text-white text-sm font-medium">{selectedSource.name}</div>
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Type</label>
                  <div className="text-white text-sm">{selectedSource.type || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Energy</label>
                  <div className="text-white text-sm">
                    {selectedSource.energy ? `${selectedSource.energy} keV` : 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Activity</label>
                  <div className="text-white text-sm">
                    {selectedSource.activity ? `${selectedSource.activity} Bq` : 'Not specified'}
                  </div>
                </div>
              </div>
              
              {selectedSource.description && (
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Description</label>
                  <div className="text-white text-sm">{selectedSource.description}</div>
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
            onClick={handleToggleActive}
            disabled={!selectedSource}
            className={`px-3 py-1.5 text-white text-xs rounded flex items-center gap-1 ${
              selectedSource?.isActive !== false 
                ? 'bg-red-600 hover:bg-red-500' 
                : 'bg-green-600 hover:bg-green-500'
            } disabled:bg-neutral-600 disabled:cursor-not-allowed`}
          >
            {selectedSource?.isActive !== false ? <EyeOff size={12} /> : <Eye size={12} />}
            {selectedSource?.isActive !== false ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={handleDelete}
            disabled={!selectedSource}
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
            disabled={!selectedSource}
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
