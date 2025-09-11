import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

export default function ScalingFeedback({ isVisible, object, feedbackType = 'scaling', position = { x: 10, y: 10 }, onRotationChange }) {
  const [forceUpdate, setForceUpdate] = useState(0);
  const [rotationInputs, setRotationInputs] = useState({ x: 0, y: 0, z: 0 });
  const [isEditingRotation, setIsEditingRotation] = useState(false);
  
  // Force re-render when object changes - must be before early return
  useEffect(() => {
    if (object && isVisible) {
      const interval = setInterval(() => {
        setForceUpdate(prev => prev + 1);
      }, 16); // ~60fps
      
      return () => clearInterval(interval);
    }
  }, [object, isVisible]);

  // Update rotation inputs when object rotation changes (only when not editing)
  useEffect(() => {
    if (object && !isEditingRotation) {
      const rotation = getRotation();
      setRotationInputs({
        x: Math.round(rotation.x * 10) / 10, // Round to 1 decimal place
        y: Math.round(rotation.y * 10) / 10,
        z: Math.round(rotation.z * 10) / 10
      });
    }
  }, [object, isVisible, isEditingRotation]);

  // Handle rotation input changes
  const handleRotationInputChange = (axis, value) => {
    const numValue = parseFloat(value) || 0;
    setRotationInputs(prev => ({
      ...prev,
      [axis]: numValue
    }));
  };

  // Handle rotation input submission
  const handleRotationSubmit = (axis) => {
    if (!object || !onRotationChange) return;
    
    const degrees = rotationInputs[axis];
    const radians = (degrees * Math.PI) / 180;
    
    // Apply rotation to the object
    const newRotation = { ...object.rotation };
    newRotation[axis] = radians;
    
    onRotationChange(newRotation);
    setIsEditingRotation(false);
  };

  // Handle rotation input key press
  const handleRotationKeyPress = (e, axis) => {
    if (e.key === 'Enter') {
      handleRotationSubmit(axis);
    } else if (e.key === 'Escape') {
      // Reset to current object rotation
      const rotation = getRotation();
      setRotationInputs({
        x: Math.round(rotation.x * 10) / 10,
        y: Math.round(rotation.y * 10) / 10,
        z: Math.round(rotation.z * 10) / 10
      });
      setIsEditingRotation(false);
    }
  };
  
  if (!isVisible || !object) return null;

  // Create a key that changes when the object's transform changes to force re-render
  const transformKey = `${object.scale.x.toFixed(3)}-${object.scale.y.toFixed(3)}-${object.scale.z.toFixed(3)}-${object.position.x.toFixed(3)}-${object.position.y.toFixed(3)}-${object.position.z.toFixed(3)}-${object.rotation.x.toFixed(3)}-${object.rotation.y.toFixed(3)}-${object.rotation.z.toFixed(3)}-${forceUpdate}`;

  // Calculate dynamic position to avoid overlaps with other UI elements
  const getOptimalPosition = () => {
    const panelWidth = 280;
    const panelHeight = 120;
    const margin = 20;
    
    // Try top-right first
    let x = screen.width / 1.4 - panelWidth - margin;
    let y = 100; // Below navigation bar
    
    // If too close to right edge, move to top-center
    if (x < window.innerWidth / 2) {
      x = (window.innerWidth - panelWidth) / 2;
      y = 100;
    }
    
    // Ensure it doesn't go off screen
    x = Math.max(margin, Math.min(x, window.innerWidth - panelWidth - margin));
    y = Math.max(100, Math.min(y, window.innerHeight - panelHeight - margin));
    
    return { x, y };
  };

  const optimalPosition = getOptimalPosition();

  // Calculate actual dimensions based on geometry type and scale
  const getDimensions = () => {
    if (!object.geometry) return { x: 0, y: 0, z: 0, r: 0 };

    const geometryType = object.userData?.type || 'unknown';
    const scale = object.scale;
    
    // Get bounding box to calculate actual dimensions
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = boundingBox.getSize(new THREE.Vector3());
    
    // Apply scale to get actual dimensions
    const actualSize = {
      x: Math.abs(size.x * scale.x),
      y: Math.abs(size.y * scale.y),
      z: Math.abs(size.z * scale.z),
      r: Math.abs(Math.max(size.x * scale.x, size.z * scale.z)) / 2 // For spheres/cylinders
    };

    return actualSize;
  };

  const dimensions = getDimensions();
  const geometryType = object.userData?.type || 'unknown';

  // Get position data
  const getPosition = () => {
    return {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z
    };
  };

  // Get rotation data (convert to degrees)
  const getRotation = () => {
    return {
      x: (object.rotation.x * 180) / Math.PI,
      y: (object.rotation.y * 180) / Math.PI,
      z: (object.rotation.z * 180) / Math.PI
    };
  };

  // Format dimensions to 2 decimal places and add cm unit
  const formatDimension = (value) => `${value.toFixed(2)} cm`;
  
  // Format position to 2 decimal places and add cm unit
  const formatPosition = (value) => `${value.toFixed(2)} cm`;
  
  // Format rotation to 1 decimal place and add degree symbol
  const formatRotation = (value) => `${value.toFixed(1)}°`;

  // Get appropriate labels based on geometry type
  const getDimensionLabels = () => {
    switch (geometryType) {
      case 'sphere':
        return { 
          radius: formatDimension(dimensions.r),
          diameter: formatDimension(dimensions.r * 2)
        };
      case 'cylinder':
      case 'cone':
        return { 
          radius: formatDimension(dimensions.r), 
          height: formatDimension(dimensions.y),
          diameter: formatDimension(dimensions.r * 2)
        };
      case 'box':
      case 'cube':
      default:
        return {
          width: formatDimension(dimensions.x),
          height: formatDimension(dimensions.y),
          depth: formatDimension(dimensions.z)
        };
    }
  };

  const dimensionLabels = getDimensionLabels();
  const positionData = getPosition();
  const rotationData = getRotation();

  // Get feedback labels based on feedback type
  const getFeedbackLabels = () => {
    switch (feedbackType) {
      case 'scaling':
        return dimensionLabels;
      case 'position':
        return {
          x: formatPosition(positionData.x),
          y: formatPosition(positionData.y),
          z: formatPosition(positionData.z)
        };
      case 'rotation':
        return {
          x: formatRotation(rotationData.x),
          y: formatRotation(rotationData.y),
          z: formatRotation(rotationData.z)
        };
      case 'all':
        return {
          ...dimensionLabels,
          positionX: formatPosition(positionData.x),
          positionY: formatPosition(positionData.y),
          positionZ: formatPosition(positionData.z),
          rotationX: formatRotation(rotationData.x),
          rotationY: formatRotation(rotationData.y),
          rotationZ: formatRotation(rotationData.z)
        };
      default:
        return dimensionLabels;
    }
  };

  const feedbackLabels = getFeedbackLabels();

  // Get title based on feedback type
  const getTitle = () => {
    switch (feedbackType) {
      case 'scaling':
        return 'Scaling';
      case 'position':
        return 'Position';
      case 'rotation':
        return 'Rotation';
      case 'all':
        return 'Transform';
      default:
        return 'Scaling';
    }
  };

  return (
    <div
      key={transformKey} // Force re-render when transform changes
      className="bg-neutral-700 border border-neutral-600 rounded-md shadow-lg pointer-events-none animate-in fade-in-0 slide-in-from-top-2 duration-200 overflow-hidden"
      style={{
        position: 'absolute',
        left: `${optimalPosition.x}px`,
        top: `${optimalPosition.y}px`,
        fontFamily: 'monospace',
        fontSize: '13px',
        zIndex: 1000,
        minWidth: '280px'
      }}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-neutral-800 border-b border-neutral-600 rounded-t-md px-3 py-1">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            feedbackType === 'scaling' ? 'bg-blue-400' :
            feedbackType === 'position' ? 'bg-green-400' :
            feedbackType === 'rotation' ? 'bg-purple-400' :
            'bg-yellow-400'
          }`}></div>
          <span className="text-white text-xs font-medium">{getTitle()}: {object.userData?.volumeName || 'Object'}</span>
        </div>
      </div>
      
      {/* Feedback Data */}
      <div className="p-3 space-y-2">
        {Object.entries(feedbackLabels).map(([label, value]) => {
          // Check if this is a rotation field that should be editable
          const isRotationField = (feedbackType === 'rotation' || feedbackType === 'all') && 
                                 (label.toLowerCase().includes('rotation') || label.toLowerCase() === 'x' || label.toLowerCase() === 'y' || label.toLowerCase() === 'z');
          
          if (isRotationField && (feedbackType === 'rotation' || feedbackType === 'all')) {
            const axis = label.toLowerCase().replace('rotation', '').replace('x', 'x').replace('y', 'y').replace('z', 'z');
            const actualAxis = axis || label.toLowerCase();
            
            return (
              <div key={label} className="flex justify-between items-center">
                <span className="text-neutral-300 text-xs font-medium">
                  {label.charAt(0).toUpperCase() + label.slice(1)}:
                </span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={rotationInputs[actualAxis] || 0}
                    onChange={(e) => {
                      setIsEditingRotation(true);
                      handleRotationInputChange(actualAxis, e.target.value);
                    }}
                    onKeyPress={(e) => handleRotationKeyPress(e, actualAxis)}
                    onBlur={() => handleRotationSubmit(actualAxis)}
                    className="text-white text-sm font-mono bg-neutral-800 px-2 py-1 rounded border border-neutral-600 w-20 text-center focus:border-blue-400 focus:outline-none"
                    step="0.1"
                    min="-360"
                    max="360"
                  />
                  <span className="text-neutral-400 text-xs">°</span>
                </div>
              </div>
            );
          }
          
          // Regular display for non-rotation fields
          return (
            <div key={label} className="flex justify-between items-center">
              <span className="text-neutral-300 text-xs font-medium">
                {label.charAt(0).toUpperCase() + label.slice(1)}:
              </span>
              <span className="text-white text-sm font-mono bg-neutral-800 px-3 py-1 rounded border border-neutral-600 min-w-[80px] text-center">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
