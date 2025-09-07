import React, { useState, useRef, useEffect } from 'react';
import { X, Move } from 'lucide-react';

export default function DockingConnector({ 
  layoutPosition = 'left',
  dockedComponents = [],
  onDockComponent,
  onUndockComponent
}) {
  const [showDockZones, setShowDockZones] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const connectorRef = useRef();

  // Use document-level event listeners to catch drag events
  useEffect(() => {
    const handleDragOver = (e) => {
      // Check if drag is over our area
      if (connectorRef.current && connectorRef.current.contains(e.target)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const types = e.dataTransfer.types;
        console.log('DockingConnector: Drag over, types:', types, 'docked:', dockedComponents.length);
        if (types && types.includes('component-type') && dockedComponents.length < 3) {
          setShowDockZones(true);
          setDraggedComponent('component');
          console.log('DockingConnector: Showing dock zones');
        }
      }
    };

    const handleDragEnter = (e) => {
      if (connectorRef.current && connectorRef.current.contains(e.target)) {
        e.preventDefault();
        console.log('DockingConnector: Drag enter');
        if (dockedComponents.length < 3) {
          setShowDockZones(true);
          console.log('DockingConnector: Showing dock zones on enter');
        }
      }
    };

    const handleDragLeave = (e) => {
      if (connectorRef.current && !connectorRef.current.contains(e.relatedTarget)) {
        e.preventDefault();
        setShowDockZones(false);
        setDraggedComponent(null);
      }
    };

    const handleDrop = (e) => {
      if (connectorRef.current && connectorRef.current.contains(e.target)) {
        e.preventDefault();
        const componentType = e.dataTransfer.getData('component-type');
        const componentData = e.dataTransfer.getData('component-data');
        console.log('DockingConnector: Drop event triggered, type:', componentType, 'data:', componentData);
        
        if (componentType && dockedComponents.length < 3 && onDockComponent) {
          try {
            const data = componentData ? JSON.parse(componentData) : {};
            console.log('DockingConnector: Docking component:', componentType, data);
            onDockComponent(componentType, data);
          } catch (error) {
            console.error('Error parsing component data:', error);
            onDockComponent(componentType, {});
          }
        } else {
          console.log('DockingConnector: Drop rejected - type:', componentType, 'docked:', dockedComponents.length, 'onDockComponent:', !!onDockComponent);
        }
        
        setShowDockZones(false);
        setDraggedComponent(null);
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [dockedComponents.length, onDockComponent]);


  const handleUndock = (componentId) => {
    if (onUndockComponent) {
      onUndockComponent(componentId);
    }
  };

  // Calculate position based on layout
  const getPositionStyle = () => {
    const baseStyle = {
      width: '350px',
      height: '80vh',
      top: '72px', // Start with small gap below navbar
      zIndex: 20 // Lower than Directory (25) but higher than other components
    };

    switch (layoutPosition) {
      case 'right':
        return { ...baseStyle, right: '0px' };
      case 'left':
        return { ...baseStyle, left: '0px' };
      case 'top':
        return { 
          ...baseStyle, 
          top: '72px',
          left: '50%',
          transform: 'translateX(-50%)',
          height: '60vh'
        };
      case 'bottom':
        return { 
          ...baseStyle, 
          top: 'calc(100vh - 60vh - 72px)',
          left: '50%',
          transform: 'translateX(-50%)',
          height: '60vh'
        };
      default:
        return { ...baseStyle, left: '0px' };
    }
  };

  return (
    <div 
      ref={connectorRef}
      className="fixed pointer-events-none"
      style={getPositionStyle()}
    >
      
      {/* Dock Zones - Show when dragging components */}
      {showDockZones && (
        <div className="absolute inset-0 bg-blue-600 bg-opacity-20 border-2 border-dashed border-blue-400 rounded-lg p-2 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-blue-300 text-sm">
              <Move size={24} className="mx-auto mb-2" />
              <div>Drop {draggedComponent} here to dock</div>
              <div className="text-xs mt-1">
                ({(3 - dockedComponents.length)} slots remaining)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Docked Components */}
      {dockedComponents.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-neutral-800 border-t border-neutral-600 rounded-b-lg">
          <div className="px-3 py-2 text-xs text-neutral-400 font-medium border-b border-neutral-600">
            Docked Components ({dockedComponents.length}/3)
          </div>
          <div className="space-y-1 px-3 pb-3 max-h-32 overflow-y-auto">
            {dockedComponents.map((component, index) => (
              <div
                key={component.id || index}
                className="flex items-center justify-between bg-neutral-700 rounded px-2 py-1 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white truncate">{component.name || component.type}</span>
                </div>
                <button
                  onClick={() => handleUndock(component.id || index)}
                  className="text-neutral-400 hover:text-white p-1 flex-shrink-0"
                  title="Undock"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
