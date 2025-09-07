import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Zap, 
  Target, 
  Activity,
  BarChart3,
  Download,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';

export default function PhysicsControlPanel({ 
  isVisible, 
  onClose, 
  onStartSimulation,
  onStopSimulation,
  simulationResults,
  isSimulating,
  simulationProgress
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState({ x: 50, y: 100 });
  const panelRef = useRef();

  // Simulation parameters
  const [simulationConfig, setSimulationConfig] = useState({
    sourceEnergy: 0.1, // 100 keV
    numberOfPhotons: 1000,
    sourcePosition: { x: 0, y: 0, z: 0 },
    sourceDirection: { x: 1, y: 0, z: 0 },
    materials: ['Air'],
    maxDistance: 10.0,
    energyRange: { min: 0.015, max: 10.0 }
  });

  // Visualization settings
  const [visualizationSettings, setVisualizationSettings] = useState({
    showPhotonPaths: true,
    showInteractionPoints: true,
    showEnergyDeposition: true,
    pathOpacity: 0.6,
    markerSize: 0.05,
    colorByEnergy: true
  });

  // Available materials
  const availableMaterials = [
    'Air', 'Water', 'Lead', 'Iron', 'Concrete', 'Steel'
  ];

  // Handle clicks outside panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Don't close on outside click - keep panel open
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible]);

  // Dragging functions
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panelPosition.x,
        y: e.clientY - panelPosition.y
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
    const maxY = window.innerHeight - 600 - margin;
    
    const boundedX = Math.max(margin, Math.min(newX, maxX));
    const boundedY = Math.max(margin, Math.min(newY, maxY));
    
    setPanelPosition({ x: boundedX, y: boundedY });
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

  const handleStartSimulation = () => {
    if (onStartSimulation) {
      onStartSimulation(simulationConfig);
    }
  };

  const handleStopSimulation = () => {
    if (onStopSimulation) {
      onStopSimulation();
    }
  };

  const handleExportResults = () => {
    if (simulationResults && simulationResults.length > 0) {
      const dataStr = JSON.stringify(simulationResults, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `physics-simulation-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={panelRef}
      className="bg-neutral-800 rounded-lg shadow-2xl border border-neutral-600 w-96 pointer-events-auto fixed z-[100]"
      style={{
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-700 rounded-t-lg px-4 py-3 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Activity size={16} className="text-green-400" />
          <h3 className="text-white font-medium">Physics Simulation</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-red-600 rounded text-white"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Simulation Parameters */}
        <div className="space-y-3">
          <h4 className="text-white font-medium text-sm flex items-center space-x-2">
            <Settings size={14} className="text-blue-400" />
            <span>Simulation Parameters</span>
          </h4>
          
          <div className="bg-neutral-700 rounded p-3 space-y-3">
            {/* Source Energy */}
            <div>
              <label className="text-neutral-400 text-xs block mb-1">
                Source Energy (MeV)
              </label>
              <input
                type="number"
                value={simulationConfig.sourceEnergy}
                onChange={(e) => setSimulationConfig(prev => ({
                  ...prev,
                  sourceEnergy: parseFloat(e.target.value) || 0.1
                }))}
                min="0.015"
                max="10.0"
                step="0.001"
                className="w-full bg-neutral-600 text-white text-xs px-2 py-1 rounded border border-neutral-500 focus:outline-none focus:border-blue-400"
              />
              <div className="text-xs text-neutral-500 mt-1">
                {(simulationConfig.sourceEnergy * 1000).toFixed(1)} keV
              </div>
            </div>

            {/* Number of Photons */}
            <div>
              <label className="text-neutral-400 text-xs block mb-1">
                Number of Photons
              </label>
              <input
                type="number"
                value={simulationConfig.numberOfPhotons}
                onChange={(e) => setSimulationConfig(prev => ({
                  ...prev,
                  numberOfPhotons: parseInt(e.target.value) || 1000
                }))}
                min="100"
                max="100000"
                step="100"
                className="w-full bg-neutral-600 text-white text-xs px-2 py-1 rounded border border-neutral-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Materials */}
            <div>
              <label className="text-neutral-400 text-xs block mb-1">
                Materials
              </label>
              <div className="space-y-1">
                {availableMaterials.map(material => (
                  <label key={material} className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={simulationConfig.materials.includes(material)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSimulationConfig(prev => ({
                            ...prev,
                            materials: [...prev.materials, material]
                          }));
                        } else {
                          setSimulationConfig(prev => ({
                            ...prev,
                            materials: prev.materials.filter(m => m !== material)
                          }));
                        }
                      }}
                      className="rounded border-neutral-500"
                    />
                    <span className="text-white">{material}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Max Distance */}
            <div>
              <label className="text-neutral-400 text-xs block mb-1">
                Max Distance (cm)
              </label>
              <input
                type="number"
                value={simulationConfig.maxDistance}
                onChange={(e) => setSimulationConfig(prev => ({
                  ...prev,
                  maxDistance: parseFloat(e.target.value) || 10.0
                }))}
                min="1.0"
                max="100.0"
                step="0.1"
                className="w-full bg-neutral-600 text-white text-xs px-2 py-1 rounded border border-neutral-500 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Visualization Settings */}
        <div className="space-y-3">
          <h4 className="text-white font-medium text-sm flex items-center space-x-2">
            <Eye size={14} className="text-purple-400" />
            <span>Visualization</span>
          </h4>
          
          <div className="bg-neutral-700 rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-xs">Show Photon Paths</span>
              <button
                onClick={() => setVisualizationSettings(prev => ({
                  ...prev,
                  showPhotonPaths: !prev.showPhotonPaths
                }))}
                className={`w-8 h-4 rounded-full transition-colors ${
                  visualizationSettings.showPhotonPaths ? 'bg-blue-500' : 'bg-neutral-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  visualizationSettings.showPhotonPaths ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-xs">Show Interaction Points</span>
              <button
                onClick={() => setVisualizationSettings(prev => ({
                  ...prev,
                  showInteractionPoints: !prev.showInteractionPoints
                }))}
                className={`w-8 h-4 rounded-full transition-colors ${
                  visualizationSettings.showInteractionPoints ? 'bg-blue-500' : 'bg-neutral-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  visualizationSettings.showInteractionPoints ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-xs">Show Energy Deposition</span>
              <button
                onClick={() => setVisualizationSettings(prev => ({
                  ...prev,
                  showEnergyDeposition: !prev.showEnergyDeposition
                }))}
                className={`w-8 h-4 rounded-full transition-colors ${
                  visualizationSettings.showEnergyDeposition ? 'bg-blue-500' : 'bg-neutral-600'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                  visualizationSettings.showEnergyDeposition ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            {!isSimulating ? (
              <button
                onClick={handleStartSimulation}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-white text-xs transition-colors"
              >
                <Play size={14} />
                <span>Start Simulation</span>
              </button>
            ) : (
              <button
                onClick={handleStopSimulation}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-xs transition-colors"
              >
                <Square size={14} />
                <span>Stop Simulation</span>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isSimulating && (
            <div className="space-y-1">
              <div className="text-xs text-neutral-400">Progress</div>
              <div className="w-full bg-neutral-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(simulationProgress || 0) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Button */}
          {simulationResults && simulationResults.length > 0 && (
            <button
              onClick={handleExportResults}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs transition-colors"
            >
              <Download size={14} />
              <span>Export Results</span>
            </button>
          )}
        </div>

        {/* Simulation Summary */}
        {simulationResults && simulationResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm flex items-center space-x-2">
              <BarChart3 size={14} className="text-yellow-400" />
              <span>Results Summary</span>
            </h4>
            
            <div className="bg-neutral-700 rounded p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Total Photons:</span>
                <span className="text-white">{simulationResults.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Total Interactions:</span>
                <span className="text-white">
                  {simulationResults.reduce((sum, result) => sum + result.interactions.length, 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Average Energy:</span>
                <span className="text-white">
                  {(simulationResults.reduce((sum, result) => sum + result.finalEnergy, 0) / simulationResults.length).toFixed(3)} MeV
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
