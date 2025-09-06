import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Play, Square, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export default function ComputationPanel({ isVisible, onClose, sceneData, onComputationComplete }) {
  const [configurations, setConfigurations] = useState({
    nominal: true,
    minimum: false,
    maximum: false
  });
  
  const [parameters, setParameters] = useState({
    convergenceCriterion: 0.01,
    particlesPerSample: 10000,
    numberOfSamples: 100
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [statusColor, setStatusColor] = useState('white');
  const [log, setLog] = useState([]);
  const [results, setResults] = useState({});
  
  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef();

  // Set initial position when component mounts
  useEffect(() => {
    if (isVisible && position.x === 0 && position.y === 0) {
      setPosition({
        x: Math.max(20, (window.innerWidth - 600) / 2),
        y: Math.max(20, (window.innerHeight - 600) / 2)
      });
    }
  }, [isVisible, position.x, position.y]);

  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'text-red-400' : type === 'warning' ? 'text-yellow-400' : 'text-white';
    
    setLog(prev => [...prev, {
      timestamp,
      message,
      type,
      color
    }]);
  };

  const updateStatus = (message, color = 'white') => {
    setStatus(message);
    setStatusColor(color);
    addLogEntry(message, color === 'red' ? 'error' : color === 'yellow' ? 'warning' : 'info');
  };

  const simulateComputation = async (configName) => {
    return new Promise((resolve) => {
      const steps = [
        'Initializing geometry...',
        'Loading material libraries...',
        'Calculating importance of meshes...',
        'Generating source points...',
        'Running Monte-Carlo simulation...',
        'Calculating build-up factors...',
        'Computing dose rates...',
        'Validating convergence...',
        'Storing results...'
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          updateStatus(steps[currentStep], 'white');
          setProgress((currentStep + 1) / steps.length * 100);
          currentStep++;
        } else {
          clearInterval(interval);
          
          // Simulate final result
          const result = {
            config: configName,
            doseRate: (Math.random() * 1e-3).toExponential(2),
            uncertainty: (Math.random() * 0.1).toFixed(3),
            computationTime: Math.floor(Math.random() * 300) + 60,
            converged: Math.random() > 0.1, // 90% success rate
            timestamp: new Date().toISOString()
          };

          if (result.converged) {
            updateStatus(`Computation completed successfully for ${configName} configuration`, 'green');
            addLogEntry(`Result: ${result.doseRate} μSv/h (±${result.uncertainty})`, 'info');
          } else {
            updateStatus(`Computation failed to converge for ${configName} configuration`, 'red');
            addLogEntry('Consider increasing mesh density or number of samples', 'warning');
          }

          setResults(prev => ({ ...prev, [configName]: result }));
          resolve(result);
        }
      }, 1000);
    });
  };

  const startComputation = async () => {
    if (!sceneData) {
      updateStatus('Error: No scene data available. Please save the scene first.', 'red');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setLog([]);
    setResults({});
    addLogEntry('Starting computation process...', 'info');

    try {
      const selectedConfigs = Object.keys(configurations).filter(key => configurations[key]);
      
      for (const configName of selectedConfigs) {
        setCurrentConfig(configName);
        updateStatus(`Starting ${configName} configuration...`, 'white');
        
        const result = await simulateComputation(configName);
        
        if (!result.converged) {
          updateStatus(`Computation failed for ${configName}. Continue with next configuration?`, 'yellow');
          // In real implementation, this would prompt user
          continue;
        }
      }

      updateStatus('All computations completed successfully!', 'green');
      
      if (onComputationComplete) {
        onComputationComplete(results);
      }

    } catch (error) {
      updateStatus(`Computation error: ${error.message}`, 'red');
    } finally {
      setIsRunning(false);
      setCurrentConfig(null);
    }
  };

  const stopComputation = () => {
    setIsRunning(false);
    setCurrentConfig(null);
    updateStatus('Computation stopped by user', 'yellow');
  };

  const handleParameterChange = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: parseFloat(value) || 0
    }));
  };

  const handleConfigurationChange = (config) => {
    setConfigurations(prev => ({
      ...prev,
      [config]: !prev[config]
    }));
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
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    const margin = 20;
    const maxX = window.innerWidth - 600 - margin;
    const maxY = window.innerHeight - 600 - margin;
    
    setPosition({
      x: Math.max(margin, Math.min(newX, maxX)),
      y: Math.max(margin, Math.min(newY, maxY))
    });
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
    e.dataTransfer.setData('component-type', 'computation-panel');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Computation Panel',
      type: 'computation-panel',
      configurations,
      parameters,
      isRunning
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      ref={panelRef}
      className="bg-neutral-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden border border-neutral-600 fixed pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 50
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      draggable="true"
      onDragStart={handleDragStart}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-600 bg-neutral-750 drag-handle cursor-grab">
        <div className="flex items-center space-x-2">
          <Move size={16} className="text-neutral-400" />
          <h3 className="text-lg font-semibold text-white">
            Computation Panel
          </h3>
          {isRunning && (
            <div className="flex items-center space-x-1 text-yellow-400">
              <Clock size={14} />
              <span className="text-sm">Running...</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-[50vh] overflow-y-auto">
        {/* Configuration Selection */}
        <div>
          <h4 className="text-white font-medium mb-3">Select Configurations to Generate:</h4>
          <div className="space-y-2">
            {Object.entries(configurations).map(([config, enabled]) => (
              <label key={config} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleConfigurationChange(config)}
                  className="rounded bg-neutral-600 border-neutral-500 text-neutral-400 focus:ring-neutral-400"
                  disabled={isRunning}
                />
                <span className="text-white capitalize">{config} Configuration</span>
                {results[config] && (
                  <CheckCircle 
                    size={16} 
                    className={results[config].converged ? 'text-green-400' : 'text-red-400'} 
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Calculation Parameters */}
        <div>
          <h4 className="text-white font-medium mb-3">Calculation Parameters:</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-1">
                Convergence Criterion
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="0.1"
                value={parameters.convergenceCriterion}
                onChange={(e) => handleParameterChange('convergenceCriterion', e.target.value)}
                className="w-full px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-sm focus:border-neutral-400 focus:outline-none"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1">
                Particles per Sample
              </label>
              <input
                type="number"
                min="1000"
                value={parameters.particlesPerSample}
                onChange={(e) => handleParameterChange('particlesPerSample', e.target.value)}
                className="w-full px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-sm focus:border-neutral-400 focus:outline-none"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-300 mb-1">
                Number of Samples
              </label>
              <input
                type="number"
                min="10"
                value={parameters.numberOfSamples}
                onChange={(e) => handleParameterChange('numberOfSamples', e.target.value)}
                className="w-full px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-sm focus:border-neutral-400 focus:outline-none"
                disabled={isRunning}
              />
            </div>
          </div>
        </div>

        {/* Status and Progress */}
        {(isRunning || status) && (
          <div>
            <h4 className="text-white font-medium mb-3">Status:</h4>
            <div className="bg-neutral-700 p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${statusColor === 'white' ? 'text-white' : statusColor === 'green' ? 'text-green-400' : statusColor === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {currentConfig ? `${currentConfig.toUpperCase()}: ` : ''}{status}
                </span>
                {isRunning && (
                  <span className="text-xs text-neutral-400">
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
              {isRunning && (
                <div className="w-full bg-neutral-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Computation Log */}
        {log.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3">Computation Log:</h4>
            <div className="bg-neutral-900 p-3 rounded max-h-32 overflow-y-auto">
              {log.map((entry, index) => (
                <div key={index} className="text-xs mb-1">
                  <span className="text-neutral-500">[{entry.timestamp}]</span>
                  <span className={`ml-2 ${entry.color}`}>{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {Object.keys(results).length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3">Results Summary:</h4>
            <div className="space-y-2">
              {Object.entries(results).map(([config, result]) => (
                <div key={config} className="bg-neutral-700 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium capitalize">{config} Configuration</span>
                    <div className="flex items-center space-x-2">
                      {result.converged ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <AlertTriangle size={16} className="text-red-400" />
                      )}
                      <span className="text-xs text-neutral-400">
                        {result.computationTime}s
                      </span>
                    </div>
                  </div>
                  {result.converged && (
                    <div className="mt-2 text-sm text-neutral-300">
                      <div>Dose Rate: {result.doseRate} μSv/h</div>
                      <div>Uncertainty: ±{result.uncertainty}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Panel */}
        <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
          <div className="flex items-start space-x-2">
            <Info className="text-neutral-400 mt-0.5" size={16} />
            <div className="text-sm text-neutral-300">
              <strong className="text-neutral-200">Note:</strong> The scene must be saved before starting computation.
              <br />
              <span className="text-xs">
                Default parameters generally give acceptable results and are usually left unchanged.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-4 border-t border-neutral-600 bg-neutral-750">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Close
        </button>
        <div className="flex space-x-2">
          {isRunning ? (
            <button
              onClick={stopComputation}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors flex items-center space-x-2"
            >
              <Square size={14} />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={startComputation}
              disabled={!sceneData || Object.values(configurations).every(c => !c)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors flex items-center space-x-2"
            >
              <Play size={14} />
              <span>Start</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
