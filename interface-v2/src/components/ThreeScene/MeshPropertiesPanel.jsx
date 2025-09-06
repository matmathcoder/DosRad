import React, { useState, useRef, useEffect } from 'react';
import { X, Move, RotateCcw, Save } from 'lucide-react';

export default function MeshPropertiesPanel({ 
  isVisible, 
  onClose, 
  onSave, 
  selectedObject 
}) {
  const [position, setPosition] = useState({ x: 400, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  const [meshData, setMeshData] = useState({
    // Material properties
    color: '#404040',
    opacity: 1.0,
    transparent: false,
    wireframe: false,
    visible: true,
    
    // Geometry properties
    castShadow: true,
    receiveShadow: true,
    
    // User data
    volumeName: '',
    id: '',
    
    // Transform properties
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  });

  // Initialize with selected object data
  useEffect(() => {
    if (selectedObject && isVisible) {
      const material = selectedObject.material;
      const userData = selectedObject.userData || {};
      
      setMeshData({
        color: material?.color?.getHexString ? `#${material.color.getHexString()}` : '#404040',
        opacity: material?.opacity || 1.0,
        transparent: material?.transparent || false,
        wireframe: material?.wireframe || false,
        visible: selectedObject.visible,
        castShadow: selectedObject.castShadow,
        receiveShadow: selectedObject.receiveShadow,
        volumeName: userData.volumeName || '',
        id: userData.id || '',
        position: {
          x: selectedObject.position?.x || 0,
          y: selectedObject.position?.y || 0,
          z: selectedObject.position?.z || 0
        },
        rotation: {
          x: (selectedObject.rotation?.x || 0) * (180 / Math.PI), // Convert to degrees
          y: (selectedObject.rotation?.y || 0) * (180 / Math.PI),
          z: (selectedObject.rotation?.z || 0) * (180 / Math.PI)
        },
        scale: {
          x: selectedObject.scale?.x || 1,
          y: selectedObject.scale?.y || 1,
          z: selectedObject.scale?.z || 1
        }
      });
    }
  }, [selectedObject, isVisible]);

  const handleInputChange = (field, value) => {
    setMeshData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setMeshData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const handleSave = () => {
    if (selectedObject) {
      // Apply material changes
      if (selectedObject.material) {
        selectedObject.material.color.setHex(meshData.color.replace('#', '0x'));
        selectedObject.material.opacity = meshData.opacity;
        selectedObject.material.transparent = meshData.transparent;
        selectedObject.material.wireframe = meshData.wireframe;
        selectedObject.material.needsUpdate = true;
      }

      // Apply visibility and shadow changes
      selectedObject.visible = meshData.visible;
      selectedObject.castShadow = meshData.castShadow;
      selectedObject.receiveShadow = meshData.receiveShadow;

      // Apply transform changes
      selectedObject.position.set(meshData.position.x, meshData.position.y, meshData.position.z);
      selectedObject.rotation.set(
        meshData.rotation.x * (Math.PI / 180), // Convert to radians
        meshData.rotation.y * (Math.PI / 180),
        meshData.rotation.z * (Math.PI / 180)
      );
      selectedObject.scale.set(meshData.scale.x, meshData.scale.y, meshData.scale.z);

      // Apply user data changes
      selectedObject.userData.volumeName = meshData.volumeName;
      selectedObject.userData.id = meshData.id;

      onSave && onSave(meshData);
    }
    onClose();
  };

  const handleReset = () => {
    if (selectedObject) {
      // Reset to original values
      const material = selectedObject.material;
      const userData = selectedObject.userData || {};
      
      setMeshData({
        color: material?.color?.getHexString ? `#${material.color.getHexString()}` : '#404040',
        opacity: material?.opacity || 1.0,
        transparent: material?.transparent || false,
        wireframe: material?.wireframe || false,
        visible: selectedObject.visible,
        castShadow: selectedObject.castShadow,
        receiveShadow: selectedObject.receiveShadow,
        volumeName: userData.volumeName || '',
        id: userData.id || '',
        position: {
          x: selectedObject.position.x,
          y: selectedObject.position.y,
          z: selectedObject.position.z
        },
        rotation: {
          x: selectedObject.rotation.x * (180 / Math.PI),
          y: selectedObject.rotation.y * (180 / Math.PI),
          z: selectedObject.rotation.z * (180 / Math.PI)
        },
        scale: {
          x: selectedObject.scale.x,
          y: selectedObject.scale.y,
          z: selectedObject.scale.z
        }
      });
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
    const maxX = window.innerWidth - 400 - margin;
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

  if (!isVisible || !selectedObject) return null;

  return (
    <div 
      ref={formRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[400px] max-h-[80vh] overflow-y-auto pointer-events-auto absolute z-50"
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
          <h2 className="text-white font-medium">Mesh Properties</h2>
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
        {/* Material Properties */}
        <div className="mb-4">
          <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Material Properties</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={meshData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-12 h-8 bg-neutral-700 border border-neutral-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={meshData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Opacity
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={meshData.opacity}
                  onChange={(e) => handleInputChange('opacity', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                />
              </div>
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Scale
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={meshData.scale.x}
                  onChange={(e) => {
                    const scale = parseFloat(e.target.value) || 1;
                    handleInputChange('scale', { x: scale, y: scale, z: scale });
                  }}
                  className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meshData.transparent}
                  onChange={(e) => handleInputChange('transparent', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-white text-xs">Transparent</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meshData.wireframe}
                  onChange={(e) => handleInputChange('wireframe', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-white text-xs">Wireframe</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meshData.visible}
                  onChange={(e) => handleInputChange('visible', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-white text-xs">Visible</span>
              </label>
            </div>
          </div>
        </div>

        {/* Shadow Properties */}
        <div className="mb-4">
          <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Shadow Properties</h3>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={meshData.castShadow}
                onChange={(e) => handleInputChange('castShadow', e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-white text-xs">Cast Shadow</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={meshData.receiveShadow}
                onChange={(e) => handleInputChange('receiveShadow', e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-white text-xs">Receive Shadow</span>
            </label>
          </div>
        </div>

        {/* Transform Properties */}
        <div className="mb-4">
          <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Transform Properties</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Position (cm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">X</label>
                  <input
                    type="number"
                    step="0.1"
                    value={meshData.position.x}
                    onChange={(e) => handleNestedInputChange('position', 'x', e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Y</label>
                  <input
                    type="number"
                    step="0.1"
                    value={meshData.position.y}
                    onChange={(e) => handleNestedInputChange('position', 'y', e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Z</label>
                  <input
                    type="number"
                    step="0.1"
                    value={meshData.position.z}
                    onChange={(e) => handleNestedInputChange('position', 'z', e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Rotation (degrees)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">X</label>
                  <input
                    type="number"
                    step="1"
                    value={meshData.rotation.x}
                    onChange={(e) => handleNestedInputChange('rotation', 'x', e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Y</label>
                  <input
                    type="number"
                    step="1"
                    value={meshData.rotation.y}
                    onChange={(e) => handleNestedInputChange('rotation', 'y', e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Z</label>
                  <input
                    type="number"
                    step="1"
                    value={meshData.rotation.z}
                    onChange={(e) => handleNestedInputChange('rotation', 'z', e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Data */}
        <div className="mb-4">
          <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">User Data</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Volume Name
              </label>
              <input
                type="text"
                value={meshData.volumeName}
                onChange={(e) => handleInputChange('volumeName', e.target.value)}
                className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                placeholder="Enter volume name"
              />
            </div>
            
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                ID
              </label>
              <input
                type="text"
                value={meshData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                placeholder="Enter object ID"
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
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded flex items-center gap-1"
        >
          <Save size={12} />
          Save
        </button>
      </div>
    </div>
  );
}
