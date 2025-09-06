import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Save, RotateCcw, Move, AlertTriangle, Info } from 'lucide-react';

// Response function options
const RESPONSE_FUNCTIONS = [
  { value: 'ambient_dose', label: 'Ambient dose equivalent rate', unit: 'μSv/h', description: 'H*(10) ICRP74' },
  { value: 'effective_dose', label: 'Effective (anterior posterior) dose rate', unit: 'μSv/h', description: 'Anterior-posterior geometry' },
  { value: 'kerma_air', label: 'KERMA rate in Air', unit: 'μGy/h', description: 'Kinetic Energy Released in Matter' },
  { value: 'kerma_rad', label: 'KERMA rate in Air', unit: 'mrad/h', description: 'Kinetic Energy Released in Matter' },
  { value: 'exposure', label: 'Exposure', unit: 'mR/h', description: 'Ionization in air' },
  { value: 'energy_flux', label: 'Energy flux rate', unit: 'MeV/s', description: 'Energy flux' },
  { value: 'uncollided_flux', label: 'Uncollided flux', unit: 'gammas/cm²/s', description: 'Direct flux without scattering' }
];

// Build-up factor types
const BUILDUP_TYPES = [
  { value: 'automatic', label: 'Automatic', description: 'Use of the multi-layer formula' },
  { value: 'composition', label: 'For given composition', description: 'Build-up factor adopted for all media passed through' },
  { value: 'none', label: 'No build-up factor', description: 'Calculation without build-up factor (uncollided flux)' }
];

export default function SensorPanel({ 
  isVisible, 
  onClose, 
  onValidate, 
  onSaveAs, 
  initialSensor = null,
  existingSensors = [],
  existingCompositions = []
}) {
  const [position, setPosition] = useState({ x: 300, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const formRef = useRef();

  const [sensorData, setSensorData] = useState({
    name: '',
    coordinates: { x: 0, y: 0, z: 0 },
    buildupType: 'automatic',
    selectedComposition: '',
    equiImportance: false,
    responseFunction: 'ambient_dose'
  });

  const [selectedSensorIndex, setSelectedSensorIndex] = useState(-1);
  const [nameError, setNameError] = useState('');
  const [coordinateError, setCoordinateError] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Initialize with existing sensor if provided
  useEffect(() => {
    if (initialSensor) {
      setSensorData(initialSensor);
      setSelectedSensorIndex(existingSensors.findIndex(s => s.name === initialSensor.name));
    } else {
      setSensorData({
        name: '',
        coordinates: { x: 0, y: 0, z: 0 },
        buildupType: 'automatic',
        selectedComposition: '',
        equiImportance: false,
        responseFunction: 'ambient_dose'
      });
      setSelectedSensorIndex(-1);
    }
  }, [initialSensor, existingSensors]);

  // Validate sensor name
  const validateName = (name) => {
    if (!name.trim()) {
      setNameError('Sensor name is required');
      return false;
    }
    
    if (name.length > 8) {
      setNameError('Sensor name must be 8 characters or less');
      return false;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      setNameError('Sensor name must be alphanumeric only');
      return false;
    }
    
    const isDuplicate = existingSensors.some(sensor => 
      sensor.name.toLowerCase() === name.toLowerCase() && 
      sensor.name !== initialSensor?.name
    );
    
    if (isDuplicate) {
      setNameError('Sensor name must be unique');
      return false;
    }
    
    setNameError('');
    return true;
  };

  // Validate coordinates
  const validateCoordinates = (coords) => {
    if (coords.x === 0 && coords.y === 0 && coords.z === 0) {
      setCoordinateError('Coordinates cannot all be zero');
      return false;
    }
    
    // Check minimum distance from volumes (0.1 cm)
    // This would be implemented with actual volume checking in the real app
    setCoordinateError('');
    return true;
  };

  const handleInputChange = (field, value) => {
    setSensorData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'name') {
      validateName(value);
    }
  };

  const handleCoordinateChange = (axis, value) => {
    const newCoordinates = {
      ...sensorData.coordinates,
      [axis]: parseFloat(value) || 0
    };
    
    setSensorData(prev => ({
      ...prev,
      coordinates: newCoordinates
    }));
    
    validateCoordinates(newCoordinates);
  };

  const handleSensorSelect = (index) => {
    setSelectedSensorIndex(index);
    if (index >= 0) {
      const selectedSensor = existingSensors[index];
      setSensorData(selectedSensor);
    } else {
      setSensorData({
        name: '',
        coordinates: { x: 0, y: 0, z: 0 },
        buildupType: 'automatic',
        selectedComposition: '',
        equiImportance: false,
        responseFunction: 'ambient_dose'
      });
    }
  };

  const handleAdd = () => {
    if (!validateName(sensorData.name)) return;
    if (!validateCoordinates(sensorData.coordinates)) return;
    
    if (sensorData.buildupType === 'composition' && !sensorData.selectedComposition) {
      alert('Please select a composition for build-up factor calculation');
      return;
    }

    // Check if we're editing an existing sensor
    if (selectedSensorIndex >= 0) {
      setWarningMessage(`Sensor "${sensorData.name}" data has been changed. Do you want to update it?`);
      setShowWarning(true);
    } else {
      // Add new sensor
      const newSensor = {
        ...sensorData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      onSaveAs(newSensor);
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (selectedSensorIndex < 0) {
      alert('Please select a sensor to delete');
      return;
    }
    
    const sensorToDelete = existingSensors[selectedSensorIndex];
    if (confirm(`Are you sure you want to delete sensor "${sensorToDelete.name}"?`)) {
      // Remove from existing sensors
      const updatedSensors = existingSensors.filter((_, index) => index !== selectedSensorIndex);
      onSaveAs(updatedSensors);
      handleCancel();
    }
  };

  const handleValidate = () => {
    if (existingSensors.length === 0) {
      alert('No sensors to validate');
      return;
    }
    
    // Validate all sensors
    const validationResults = existingSensors.map(sensor => {
      const errors = [];
      
      if (!sensor.name || sensor.name.length > 8) {
        errors.push('Invalid name');
      }
      
      if (sensor.coordinates.x === 0 && sensor.coordinates.y === 0 && sensor.coordinates.z === 0) {
        errors.push('Invalid coordinates');
      }
      
      if (sensor.buildupType === 'composition' && !sensor.selectedComposition) {
        errors.push('Missing composition selection');
      }
      
      return { sensor: sensor.name, errors };
    });
    
    const failedValidations = validationResults.filter(result => result.errors.length > 0);
    
    if (failedValidations.length > 0) {
      const errorMessage = failedValidations.map(result => 
        `${result.sensor}: ${result.errors.join(', ')}`
      ).join('\n');
      alert(`Validation failed:\n${errorMessage}`);
    } else {
      alert('All sensors validated successfully!');
      onValidate(existingSensors);
    }
  };

  const handleCancel = () => {
    setSensorData({
      name: '',
      coordinates: { x: 0, y: 0, z: 0 },
      buildupType: 'automatic',
      selectedComposition: '',
      equiImportance: false,
      responseFunction: 'ambient_dose'
    });
    setSelectedSensorIndex(-1);
    setNameError('');
    setCoordinateError('');
    setShowWarning(false);
    onClose();
  };

  const handleWarningConfirm = () => {
    setShowWarning(false);
    const updatedSensor = {
      ...sensorData,
      id: existingSensors[selectedSensorIndex].id,
      updatedAt: new Date().toISOString()
    };
    
    const updatedSensors = [...existingSensors];
    updatedSensors[selectedSensorIndex] = updatedSensor;
    
    onSaveAs(updatedSensors);
    handleCancel();
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

  return (
    <>
      <div 
        ref={formRef}
        className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-[650px] max-h-[80vh] overflow-y-auto pointer-events-auto absolute z-50"
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
            <h2 className="text-white font-medium">Sensor Panel</h2>
            <span className="text-xs text-neutral-400">
              ({existingSensors.length} sensors in scene)
            </span>
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
          {/* Sensor Selection */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Sensor Selection</h3>
            <div className="flex gap-2 mb-3">
              <select
                value={selectedSensorIndex}
                onChange={(e) => handleSensorSelect(parseInt(e.target.value))}
                className="flex-1 px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
              >
                <option value={-1}>Create new sensor</option>
                {existingSensors.map((sensor, index) => (
                  <option key={index} value={index}>{sensor.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sensor Properties */}
          <div className="mb-4">
            <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Sensor Properties</h3>
            
            {/* Name */}
            <div className="mb-3">
              <label className="block text-white text-xs font-medium mb-1">
                Sensor Name *
              </label>
              <input
                type="text"
                maxLength={8}
                value={sensorData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-2 py-1.5 bg-neutral-700 border rounded text-white text-xs focus:outline-none ${
                  nameError ? 'border-red-500 focus:border-red-400' : 'border-neutral-600 focus:border-neutral-400'
                }`}
                placeholder="Enter sensor name (max 8 chars)"
              />
              {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
              <p className="text-neutral-400 text-xs mt-1">Maximum 8 alphanumeric characters</p>
            </div>

            {/* Coordinates */}
            <div className="mb-3">
              <label className="block text-white text-xs font-medium mb-1">
                Coordinates (cm) *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">X</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sensorData.coordinates.x}
                    onChange={(e) => handleCoordinateChange('x', e.target.value)}
                    className={`w-full px-2 py-1.5 bg-neutral-700 border rounded text-white text-xs focus:outline-none ${
                      coordinateError ? 'border-red-500 focus:border-red-400' : 'border-neutral-600 focus:border-neutral-400'
                    }`}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Y</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sensorData.coordinates.y}
                    onChange={(e) => handleCoordinateChange('y', e.target.value)}
                    className={`w-full px-2 py-1.5 bg-neutral-700 border rounded text-white text-xs focus:outline-none ${
                      coordinateError ? 'border-red-500 focus:border-red-400' : 'border-neutral-600 focus:border-neutral-400'
                    }`}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-xs mb-1">Z</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sensorData.coordinates.z}
                    onChange={(e) => handleCoordinateChange('z', e.target.value)}
                    className={`w-full px-2 py-1.5 bg-neutral-700 border rounded text-white text-xs focus:outline-none ${
                      coordinateError ? 'border-red-500 focus:border-red-400' : 'border-neutral-600 focus:border-neutral-400'
                    }`}
                    placeholder="0.0"
                  />
                </div>
              </div>
              {coordinateError && <p className="text-red-400 text-xs mt-1">{coordinateError}</p>}
              <p className="text-neutral-400 text-xs mt-1">
                <AlertTriangle size={12} className="inline mr-1" />
                Sensor should not be placed on volume surfaces or less than 0.1 cm from source edges
              </p>
            </div>

            {/* Build-up Factor */}
            <div className="mb-3">
              <label className="block text-white text-xs font-medium mb-1">
                Build-up Factor Type
              </label>
              <div className="space-y-2">
                {BUILDUP_TYPES.map((type) => (
                  <label key={type.value} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="buildupType"
                      value={type.value}
                      checked={sensorData.buildupType === type.value}
                      onChange={(e) => handleInputChange('buildupType', e.target.value)}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="flex-1">
                      <div className="text-white text-xs font-medium">{type.label}</div>
                      <div className="text-neutral-400 text-xs">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Composition Selection (only if composition type is selected) */}
              {sensorData.buildupType === 'composition' && (
                <div className="mt-2">
                  <label className="block text-white text-xs font-medium mb-1">
                    Composition *
                  </label>
                  <select
                    value={sensorData.selectedComposition}
                    onChange={(e) => handleInputChange('selectedComposition', e.target.value)}
                    className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
                  >
                    <option value="">Select composition...</option>
                    {existingCompositions.map(comp => (
                      <option key={comp.name} value={comp.name}>{comp.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Energy Equi-importance */}
            <div className="mb-3">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sensorData.equiImportance}
                  onChange={(e) => handleInputChange('equiImportance', e.target.checked)}
                  className="mt-1 accent-blue-600"
                />
                <div className="flex-1">
                  <div className="text-white text-xs font-medium">Energy Equi-importance</div>
                  <div className="text-neutral-400 text-xs">
                    Apply convergence criterion to each energy (increases calculation time)
                  </div>
                </div>
              </label>
            </div>

            {/* Response Function */}
            <div className="mb-3">
              <label className="block text-white text-xs font-medium mb-1">
                Response Function
              </label>
              <select
                value={sensorData.responseFunction}
                onChange={(e) => handleInputChange('responseFunction', e.target.value)}
                className="w-full px-2 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-xs focus:outline-none focus:border-neutral-400"
              >
                {RESPONSE_FUNCTIONS.map(func => (
                  <option key={func.value} value={func.value}>
                    {func.label} ({func.unit})
                  </option>
                ))}
              </select>
              <p className="text-neutral-400 text-xs mt-1">
                {RESPONSE_FUNCTIONS.find(f => f.value === sensorData.responseFunction)?.description}
              </p>
            </div>
          </div>

          {/* Existing Sensors List */}
          {existingSensors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-white font-medium text-sm mb-3 border-b border-neutral-600 pb-1">Existing Sensors</h3>
              <div className="bg-neutral-700 rounded border border-neutral-600 max-h-32 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-600 bg-neutral-750 sticky top-0">
                      <th className="text-left p-2 text-white">Name</th>
                      <th className="text-left p-2 text-white">Coordinates</th>
                      <th className="text-left p-2 text-white">Response</th>
                      <th className="text-left p-2 text-white">Buildup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingSensors.map((sensor, index) => (
                      <tr
                        key={index}
                        onClick={() => handleSensorSelect(index)}
                        className={`cursor-pointer hover:bg-neutral-600 ${
                          selectedSensorIndex === index ? 'bg-neutral-600' : ''
                        }`}
                      >
                        <td className="p-2 text-white font-mono">{sensor.name}</td>
                        <td className="p-2 text-white text-xs">
                          ({sensor.coordinates.x}, {sensor.coordinates.y}, {sensor.coordinates.z})
                        </td>
                        <td className="p-2 text-white text-xs">
                          {RESPONSE_FUNCTIONS.find(f => f.value === sensor.responseFunction)?.label}
                        </td>
                        <td className="p-2 text-white text-xs">
                          {BUILDUP_TYPES.find(b => b.value === sensor.buildupType)?.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between p-3 bg-neutral-750 rounded-b-lg border-t border-neutral-600">
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={selectedSensorIndex < 0}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
            >
              <Trash2 size={12} />
              Delete
            </button>
            <button
              onClick={handleValidate}
              disabled={existingSensors.length === 0}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded"
            >
              Validate
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!sensorData.name || nameError || coordinateError}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs rounded flex items-center gap-1"
            >
              <Plus size={12} />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-neutral-800 rounded-lg p-4 max-w-md mx-4 border border-neutral-600">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="text-yellow-400 mt-0.5" size={20} />
              <div>
                <h3 className="text-white font-medium mb-2">Confirm Changes</h3>
                <p className="text-neutral-300 text-sm">{warningMessage}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowWarning(false)}
                className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded"
              >
                No
              </button>
              <button
                onClick={handleWarningConfirm}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
