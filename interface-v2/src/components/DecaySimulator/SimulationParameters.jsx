import React, { useState } from 'react';
import { Settings, Play, RotateCcw } from 'lucide-react';

export default function SimulationParameters({
  onSimulate,
  isSimulating,
  elementSymbol,
  massNumber
}) {
  const [params, setParams] = useState({
    element_symbol: elementSymbol || '',
    mass_number: massNumber || 0,
    neutron_flux: 1e14,
    initial_atoms: 1e20,
    time: 3600,
    time_step: 1.0,
    energy: 0.025
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update params when element/isotope changes
  React.useEffect(() => {
    if (elementSymbol && massNumber) {
      setParams(prev => ({
        ...prev,
        element_symbol: elementSymbol,
        mass_number: massNumber
      }));
    }
  }, [elementSymbol, massNumber]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (params.element_symbol && params.mass_number) {
      onSimulate(params);
    }
  };

  const resetToDefaults = () => {
    setParams(prev => ({
      ...prev,
      neutron_flux: 1e14,
      initial_atoms: 1e20,
      time: 3600,
      time_step: 1.0,
      energy: 0.025
    }));
  };

  const formatScientific = (value) => {
    return value.toExponential(2);
  };

  return (
    <div className="bg-neutral-700 border border-neutral-600 rounded-lg">
      <div className="px-6 py-4 border-b border-neutral-600">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Simulation Parameters</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Neutron Flux (n/cm²/s)
            </label>
            <input
              type="number"
              step="any"
              value={params.neutron_flux}
              onChange={(e) => handleParamChange('neutron_flux', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-neutral-400"
              placeholder="1e14"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Current: {formatScientific(params.neutron_flux)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Initial Atoms
            </label>
            <input
              type="number"
              step="any"
              value={params.initial_atoms}
              onChange={(e) => handleParamChange('initial_atoms', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-neutral-400"
              placeholder="1e20"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Current: {formatScientific(params.initial_atoms)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Simulation Time (seconds)
            </label>
            <input
              type="number"
              min="1"
              value={params.time}
              onChange={(e) => handleParamChange('time', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-neutral-400"
            />
            <p className="text-xs text-neutral-400 mt-1">
              {params.time / 3600 < 1 
                ? `${(params.time / 60).toFixed(1)} minutes`
                : `${(params.time / 3600).toFixed(1)} hours`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Time Step (seconds)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.001"
              value={params.time_step}
              onChange={(e) => handleParamChange('time_step', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Advanced Parameters Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Parameters</span>
          </button>
        </div>

        {/* Advanced Parameters */}
        {showAdvanced && (
          <div className="border-t border-neutral-600 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Neutron Energy (eV)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={params.energy}
                  onChange={(e) => handleParamChange('energy', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-neutral-400"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  0.025 eV = thermal neutrons
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preset Buttons */}
        <div className="border-t border-neutral-600 pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setParams(prev => ({ ...prev, neutron_flux: 1e13, time: 86400 }))}
              className="px-3 py-1 text-xs bg-neutral-600 hover:bg-neutral-500 text-neutral-300 rounded-full transition-colors"
            >
              Low Flux (24h)
            </button>
            <button
              type="button"
              onClick={() => setParams(prev => ({ ...prev, neutron_flux: 1e14, time: 3600 }))}
              className="px-3 py-1 text-xs bg-neutral-600 hover:bg-neutral-500 text-neutral-300 rounded-full transition-colors"
            >
              Medium Flux (1h)
            </button>
            <button
              type="button"
              onClick={() => setParams(prev => ({ ...prev, neutron_flux: 1e15, time: 600 }))}
              className="px-3 py-1 text-xs bg-neutral-600 hover:bg-neutral-500 text-neutral-300 rounded-full transition-colors"
            >
              High Flux (10min)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSimulating || !params.element_symbol || !params.mass_number}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isSimulating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Run Simulation</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-3 border border-neutral-500 hover:bg-neutral-600 text-neutral-300 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Validation Messages */}
        {(!params.element_symbol || !params.mass_number) && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
            <p className="text-sm text-yellow-300">
              Please select an element and isotope before running the simulation.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
