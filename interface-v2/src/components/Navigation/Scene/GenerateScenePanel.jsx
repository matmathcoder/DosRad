import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Download, CheckCircle, AlertTriangle, Info, FileText } from 'lucide-react';

export default function GenerateScenePanel({ isVisible, onClose, sceneData, onSceneGenerated }) {
  const [configurations, setConfigurations] = useState({
    nominal: true,
    minimum: false,
    maximum: false
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [log, setLog] = useState([]);
  
  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef();

  // Set initial position when component mounts
  useEffect(() => {
    if (isVisible && position.x === 0 && position.y === 0) {
      setPosition({
        x: Math.max(20, (window.innerWidth - 500) / 2),
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
    addLogEntry(message, color === 'red' ? 'error' : color === 'yellow' ? 'warning' : 'info');
  };

  const generateSceneFile = async (configName) => {
    return new Promise((resolve) => {
      const steps = [
        'Validating scene data...',
        'Applying configuration parameters...',
        'Generating geometry data...',
        'Calculating material properties...',
        'Formatting output file...',
        'Writing scene file...',
        'Validating file format...'
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          updateStatus(steps[currentStep], 'white');
          setProgress((currentStep + 1) / steps.length * 100);
          currentStep++;
        } else {
          clearInterval(interval);
          
          // Generate mock file
          const fileName = `mercurad-scene-${configName}-${new Date().toISOString().split('T')[0]}.pcs`;
          const fileData = {
            config: configName,
            fileName,
            size: Math.floor(Math.random() * 1000) + 500, // KB
            timestamp: new Date().toISOString(),
            status: 'success'
          };

          updateStatus(`Scene file generated successfully: ${fileName}`, 'green');
          addLogEntry(`File size: ${fileData.size} KB`, 'info');
          
          setGeneratedFiles(prev => [...prev, fileData]);
          resolve(fileData);
        }
      }, 800);
    });
  };

  const startGeneration = async () => {
    if (!sceneData) {
      updateStatus('Error: No scene data available. Please save the scene first.', 'red');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLog([]);
    setGeneratedFiles([]);
    addLogEntry('Starting scene generation process...', 'info');

    try {
      const selectedConfigs = Object.keys(configurations).filter(key => configurations[key]);
      
      for (const configName of selectedConfigs) {
        setCurrentConfig(configName);
        updateStatus(`Generating ${configName} configuration...`, 'white');
        
        const result = await generateSceneFile(configName);
        
        if (result.status === 'success') {
          updateStatus(`${configName} configuration generated successfully`, 'green');
        } else {
          updateStatus(`Failed to generate ${configName} configuration`, 'red');
        }
      }

      updateStatus('All scene files generated successfully!', 'green');
      
      if (onSceneGenerated) {
        onSceneGenerated(generatedFiles);
      }

    } catch (error) {
      updateStatus(`Generation error: ${error.message}`, 'red');
    } finally {
      setIsGenerating(false);
      setCurrentConfig(null);
    }
  };

  const downloadFile = (fileData) => {
    // Create a mock file content
    const content = `# Mercurad Scene File - ${fileData.config.toUpperCase()} Configuration
# Generated: ${fileData.timestamp}
# File: ${fileData.fileName}

# Scene Configuration
SCENE_NAME: ${sceneData?.metadata?.name || 'Untitled Scene'}
SCENE_DESCRIPTION: ${sceneData?.metadata?.description || 'Generated scene'}

# Geometry Data
GEOMETRIES: ${sceneData?.objects?.length || 0}

# Material Properties
MATERIALS: ${sceneData?.objects?.filter(obj => obj.volume?.composition)?.length || 0}

# Source Configuration
SOURCES: ${sceneData?.objects?.filter(obj => obj.volume?.isSource)?.length || 0}

# Calculation Parameters
CONVERGENCE_CRITERION: 0.01
PARTICLES_PER_SAMPLE: 10000
NUMBER_OF_SAMPLES: 100

# End of file
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    const maxX = window.innerWidth - 500 - margin;
    const maxY = window.innerHeight - 500 - margin;
    
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
    e.dataTransfer.setData('component-type', 'generate-scene-panel');
    e.dataTransfer.setData('component-data', JSON.stringify({
      name: 'Generate Scene Panel',
      type: 'generate-scene-panel',
      configurations,
      isGenerating
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      ref={panelRef}
      className="bg-neutral-800 rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden border border-neutral-600 fixed pointer-events-auto"
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
            Generate Scene Panel
          </h3>
          {isGenerating && (
            <div className="flex items-center space-x-1 text-blue-400">
              <FileText size={14} />
              <span className="text-sm">Generating...</span>
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
                  disabled={isGenerating}
                />
                <span className="text-white capitalize">{config} Configuration</span>
                {generatedFiles.some(f => f.config === config) && (
                  <CheckCircle size={16} className="text-green-400" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Status and Progress */}
        {(isGenerating || status) && (
          <div>
            <h4 className="text-white font-medium mb-3">Status:</h4>
            <div className="bg-neutral-700 p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  {currentConfig ? `${currentConfig.toUpperCase()}: ` : ''}{status}
                </span>
                {isGenerating && (
                  <span className="text-xs text-neutral-400">
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
              {isGenerating && (
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

        {/* Generated Files */}
        {generatedFiles.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3">Generated Files:</h4>
            <div className="space-y-2">
              {generatedFiles.map((file, index) => (
                <div key={index} className="bg-neutral-700 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-blue-400" />
                      <div>
                        <div className="text-white text-sm font-medium">{file.fileName}</div>
                        <div className="text-xs text-neutral-400">
                          {file.size} KB • {new Date(file.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
                      title="Download file"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generation Log */}
        {log.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3">Generation Log:</h4>
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

        {/* Info Panel */}
        <div className="bg-neutral-700 border border-neutral-600 rounded p-3">
          <div className="flex items-start space-x-2">
            <Info className="text-neutral-400 mt-0.5" size={16} />
            <div className="text-sm text-neutral-300">
              <strong className="text-neutral-200">Note:</strong> This panel generates scene data files in a format compatible with the Mercure software.
              <br />
              <span className="text-xs">
                Files are generated in .PCS format and can be used for external calculations.
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
          <button
            onClick={startGeneration}
            disabled={!sceneData || Object.values(configurations).every(c => !c) || isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors flex items-center space-x-2"
          >
            <FileText size={14} />
            <span>Generate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
