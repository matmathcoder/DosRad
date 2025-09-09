import React, { useState, useEffect } from 'react';
import { X, Atom, Target, TrendingUp, Activity, Download, Camera } from 'lucide-react';
import ElementSelector from './ElementSelector';
import SimulationParameters from './SimulationParameters';
import CrossSectionDisplay from './CrossSectionDisplay';
import NetworkDecayVisualization from './NetworkDecayVisualization';
import DecayChainVisualization from './DecayChainVisualization';
import TimeEvolutionChart from './TimeEvolutionChart';
import { simulateDecayChain } from '../../utils/decaySimulatorAPI';

export default function DecaySimulator({ isVisible, onClose }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedIsotope, setSelectedIsotope] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [visualizationType, setVisualizationType] = useState('network');

  // Reset state when component opens
  useEffect(() => {
    if (isVisible) {
      setSelectedElement(null);
      setSelectedIsotope(null);
      setSimulationResult(null);
      setError(null);
      setSelectedTime(null);
    }
  }, [isVisible]);

  const handleSimulation = async (params) => {
    setIsSimulating(true);
    setError(null);
    
    try {
      const result = await simulateDecayChain(params);
      setSimulationResult(result);
      setSelectedTime(null);
    } catch (err) {
      setError(err.message || 'An error occurred during simulation');
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleElementSelect = (element) => {
    setSelectedElement(element);
    // Clear simulation when element changes
    if (selectedElement?.id !== element.id) {
      setSimulationResult(null);
      setSelectedTime(null);
    }
  };

  const handleIsotopeSelect = (isotope) => {
    setSelectedIsotope(isotope);
    // Clear simulation when isotope changes
    if (selectedIsotope?.id !== isotope.id) {
      setSimulationResult(null);
      setSelectedTime(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[85vh] flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-neutral-700 rounded-lg flex items-center justify-center">
              <Atom className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Nuclear Decay Simulator</h2>
              <p className="text-xs text-neutral-400">Visualize isotope decay chains and neutron capture reactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 p-4 overflow-auto">
            {/* Left Column - Controls */}
            <div className="xl:col-span-1 space-y-4">
              {/* Element Selector */}
              <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-4">
                <ElementSelector
                  onElementSelect={handleElementSelect}
                  onIsotopeSelect={handleIsotopeSelect}
                  selectedElement={selectedElement}
                  selectedIsotope={selectedIsotope}
                />
              </div>

              {/* Simulation Parameters */}
              <SimulationParameters
                onSimulate={handleSimulation}
                isSimulating={isSimulating}
                elementSymbol={selectedElement?.symbol}
                massNumber={selectedIsotope?.mass_number}
              />

              {/* Cross Section Display */}
              <CrossSectionDisplay selectedIsotope={selectedIsotope} />

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-red-400" />
                    <h3 className="text-sm font-medium text-red-300">
                      Simulation Error
                    </h3>
                  </div>
                  <p className="text-sm text-red-200 mt-2">{error}</p>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="xl:col-span-2 space-y-4">
              {simulationResult ? (
                <>
                  {/* Visualization Type Selector */}
                  <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">Visualization Type</h3>
                      <div className="flex bg-neutral-600 rounded-lg p-1">
                        <button
                          onClick={() => setVisualizationType('network')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            visualizationType === 'network'
                              ? 'bg-neutral-500 text-white shadow-sm'
                              : 'text-neutral-300 hover:text-white'
                          }`}
                        >
                          Network View
                        </button>
                        <button
                          onClick={() => setVisualizationType('cards')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            visualizationType === 'cards'
                              ? 'bg-neutral-500 text-white shadow-sm'
                              : 'text-neutral-300 hover:text-white'
                          }`}
                        >
                          Card View
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {visualizationType === 'network' 
                        ? 'Level-based network showing neutron cross-sections and decay probabilities'
                        : 'Horizontal chain layout with detailed isotope cards'
                      }
                    </p>
                  </div>

                  {/* Decay Chain Visualization */}
                  {visualizationType === 'network' ? (
                    <NetworkDecayVisualization
                      isotopeNetwork={simulationResult.isotope_network}
                      currentTime={selectedTime}
                      timeEvolution={simulationResult.time_evolution}
                    />
                  ) : (
                    <DecayChainVisualization
                      isotopeNetwork={simulationResult.isotope_network}
                      currentTime={selectedTime}
                      timeEvolution={simulationResult.time_evolution}
                    />
                  )}

                  {/* Time Evolution Chart */}
                  <TimeEvolutionChart
                    timeEvolution={simulationResult.time_evolution}
                    onTimeSelect={setSelectedTime}
                    selectedTime={selectedTime}
                  />

                  {/* Simulation Summary */}
                  <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Simulation Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600/30">
                        <div className="text-lg font-bold text-blue-400">
                          {simulationResult.isotope_network.length}
                        </div>
                        <div className="text-xs text-blue-300">Isotopes in Network</div>
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-3 border border-green-600/30">
                        <div className="text-lg font-bold text-green-400">
                          {simulationResult.time_points.length}
                        </div>
                        <div className="text-xs text-green-300">Time Points</div>
                      </div>
                      <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-600/30">
                        <div className="text-lg font-bold text-purple-400">
                          {(simulationResult.simulation_parameters.neutron_flux).toExponential(1)}
                        </div>
                        <div className="text-xs text-purple-300">Neutron Flux (n/cm²/s)</div>
                      </div>
                      <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-600/30">
                        <div className="text-lg font-bold text-orange-400">
                          {simulationResult.simulation_parameters.time / 3600 < 1 
                            ? `${(simulationResult.simulation_parameters.time / 60).toFixed(0)}m`
                            : `${(simulationResult.simulation_parameters.time / 3600).toFixed(1)}h`}
                        </div>
                        <div className="text-xs text-orange-300">Simulation Time</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Welcome Screen */
                <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-full flex items-center justify-center border border-blue-600/30">
                    <Atom className="h-8 w-8 text-blue-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-3">
                    Welcome to Nuclear Decay Simulator
                  </h2>
                  <p className="text-sm text-neutral-400 mb-6 max-w-2xl mx-auto">
                    Select an element and isotope from the sidebar, configure your simulation parameters, 
                    and run the simulation to visualize nuclear decay chains and neutron capture reactions 
                    in a reactor environment.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
                    <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                      <div className="w-8 h-8 bg-blue-800/30 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-blue-400 font-bold text-sm">1</span>
                      </div>
                      <h3 className="font-semibold text-white mb-2 text-sm">Select Isotope</h3>
                      <p className="text-xs text-neutral-400">
                        Choose an element and specific isotope to simulate from our comprehensive database.
                      </p>
                    </div>
                    <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
                      <div className="w-8 h-8 bg-green-800/30 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-green-400 font-bold text-sm">2</span>
                      </div>
                      <h3 className="font-semibold text-white mb-2 text-sm">Configure Parameters</h3>
                      <p className="text-xs text-neutral-400">
                        Set neutron flux, simulation time, and other reactor conditions.
                      </p>
                    </div>
                    <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-600/30">
                      <div className="w-8 h-8 bg-purple-800/30 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-purple-400 font-bold text-sm">3</span>
                      </div>
                      <h3 className="font-semibold text-white mb-2 text-sm">Visualize Results</h3>
                      <p className="text-xs text-neutral-400">
                        Explore decay chains, time evolution, and nuclear reaction networks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
