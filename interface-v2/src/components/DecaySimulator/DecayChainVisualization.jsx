import React, { useMemo, useRef } from 'react';
import { ArrowRight, Zap, Target, Activity, Download, Camera } from 'lucide-react';

export default function DecayChainVisualization({
  isotopeNetwork,
  currentTime,
  timeEvolution
}) {
  const containerRef = useRef(null);

  const { initialAmounts, currentAmounts } = useMemo(() => {
    if (!timeEvolution) {
      return { initialAmounts: {}, currentAmounts: {} };
    }

    const timePoints = Object.keys(timeEvolution).map(t => parseFloat(t)).sort((a, b) => a - b);
    const initialTime = timePoints[0];
    const targetTime = currentTime !== undefined ? currentTime : timePoints[timePoints.length - 1];

    const initialAmounts = {};
    const currentAmounts = {};

    if (timeEvolution[initialTime.toString()]) {
      Object.entries(timeEvolution[initialTime.toString()]).forEach(([isotope, amount]) => {
        initialAmounts[isotope] = amount;
      });
    }

    // Find closest time point
    const closestTime = timePoints.reduce((prev, curr) => 
      Math.abs(curr - targetTime) < Math.abs(prev - targetTime) ? curr : prev
    );

    if (timeEvolution[closestTime.toString()]) {
      Object.entries(timeEvolution[closestTime.toString()]).forEach(([isotope, amount]) => {
        currentAmounts[isotope] = amount;
      });
    }

    return { initialAmounts, currentAmounts };
  }, [timeEvolution, currentTime]);

  const buildDecayNetwork = () => {
    if (isotopeNetwork.length === 0) return { chains: [], isolatedNodes: [] };

    // Create a map of isotope connections
    const connections = {};
    const allIsotopes = new Set();
    
    isotopeNetwork.forEach(isotope => {
      const key = `${isotope.isotope.element.symbol}-${isotope.isotope.mass_number}`;
      allIsotopes.add(key);
      connections[key] = {
        decay: isotope.decay_products,
        capture: isotope.capture_product
      };
    });

    // Find root nodes (isotopes that are not products of others)
    const products = new Set();
    Object.values(connections).forEach(conn => {
      conn.decay.forEach(p => products.add(p));
      if (conn.capture) products.add(conn.capture);
    });

    const roots = Array.from(allIsotopes).filter(isotope => !products.has(isotope));
    
    // Build chains from each root
    const chains = [];
    const visited = new Set();

    const buildChain = (start, chain = []) => {
      if (visited.has(start) || chain.includes(start)) return chain;
      
      const newChain = [...chain, start];
      visited.add(start);
      
      const conn = connections[start];
      if (!conn) return newChain;
      
      // Follow the primary decay product (first one)
      if (conn.decay.length > 0) {
        return buildChain(conn.decay[0], newChain);
      }
      
      // Follow neutron capture if no decay
      if (conn.capture) {
        return buildChain(conn.capture, newChain);
      }
      
      return newChain;
    };

    roots.forEach(root => {
      if (!visited.has(root)) {
        const chain = buildChain(root);
        if (chain.length > 1) {
          chains.push(chain);
        }
      }
    });

    // Find isolated nodes
    const chainIsotopes = new Set(chains.flat());
    const isolatedNodes = Array.from(allIsotopes).filter(isotope => !chainIsotopes.has(isotope));

    return { chains, isolatedNodes };
  };

  const IsotopeNode = ({ isotope, currentAmount, initialAmount }) => {
    const percentageRemaining = initialAmount && initialAmount > 0 
      ? ((currentAmount || isotope.amount) / initialAmount) * 100 
      : 100;

    const getNodeColor = () => {
      if (isotope.decay_constant > 0 && isotope.cross_section) {
        return 'bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/50';
      } else if (isotope.decay_constant > 0) {
        return 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/50';
      } else if (isotope.cross_section) {
        return 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/50';
      } else {
        return 'bg-gradient-to-br from-neutral-600 to-neutral-700 border-neutral-500';
      }
    };

    const formatAmount = (amount) => {
      if (amount === 0) return '0';
      if (amount < 1e3) return amount.toFixed(0);
      return amount.toExponential(2);
    };

    const formatHalfLife = (seconds) => {
      if (!seconds) return 'Stable';
      
      if (seconds < 60) return `${seconds.toFixed(2)} s`;
      if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
      if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`;
      if (seconds < 31536000) return `${(seconds / 86400).toFixed(1)} d`;
      return `${(seconds / 31536000).toFixed(1)} y`;
    };

    return (
      <div className={`relative p-4 rounded-xl border-2 shadow-lg min-w-[200px] ${getNodeColor()}`}>
        {/* Isotope Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center shadow-sm border border-neutral-600">
              <span className="text-xs font-bold text-neutral-300">
                {isotope.isotope.element.atomic_number}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {isotope.isotope.element.symbol}-{isotope.isotope.mass_number}
              </h3>
              <p className="text-xs text-neutral-400">
                {isotope.isotope.element.name}
              </p>
            </div>
          </div>
        </div>

        {/* Amount and Activity */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-400">Amount:</span>
            <span className="text-sm font-medium text-white">
              {formatAmount(currentAmount || isotope.amount)}
            </span>
          </div>
          
          {percentageRemaining < 100 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400">Remaining:</span>
              <span className="text-sm font-medium text-blue-400">
                {percentageRemaining.toFixed(1)}%
              </span>
            </div>
          )}

          {isotope.activity > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400">Activity:</span>
              <span className="text-sm font-medium text-red-400">
                {formatAmount(isotope.activity)} Bq
              </span>
            </div>
          )}
        </div>

        {/* Nuclear Properties */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-400">Half-life:</span>
            <span className="font-medium text-white">
              {formatHalfLife(isotope.half_life_seconds)}
            </span>
          </div>
          
          {isotope.cross_section && (
            <div className="flex justify-between">
              <span className="text-neutral-400">σ (n,γ):</span>
              <span className="font-medium text-white">
                {isotope.cross_section.toExponential(2)} b
              </span>
            </div>
          )}
        </div>

        {/* Reaction Indicators */}
        <div className="flex justify-center space-x-2 mt-3">
          {isotope.decay_constant > 0 && (
            <div className="flex items-center space-x-1 bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-600/30">
              <Zap className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-yellow-300">Decay</span>
            </div>
          )}
          
          {isotope.cross_section && (
            <div className="flex items-center space-x-1 bg-blue-900/30 px-2 py-1 rounded-full border border-blue-600/30">
              <Target className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-300">Capture</span>
            </div>
          )}
          
          {isotope.activity > 0 && (
            <div className="flex items-center space-x-1 bg-red-900/30 px-2 py-1 rounded-full border border-red-600/30">
              <Activity className="h-3 w-3 text-red-400" />
              <span className="text-xs text-red-300">Active</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {percentageRemaining < 100 && (
          <div className="mt-3">
            <div className="w-full bg-neutral-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentageRemaining}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ConnectionArrow = ({ type, label, direction = 'horizontal' }) => {
    const arrowColor = type === 'decay' ? 'text-yellow-400' : 'text-blue-400';
    const bgColor = type === 'decay' ? 'bg-yellow-900/30' : 'bg-blue-900/30';
    const borderColor = type === 'decay' ? 'border-yellow-600/30' : 'border-blue-600/30';
    
    if (direction === 'horizontal') {
      return (
        <div className="flex items-center mx-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${bgColor} border ${borderColor}`}>
            <ArrowRight className={`h-3 w-3 ${arrowColor}`} />
            {label && (
              <span className={`text-xs font-medium ${arrowColor}`}>
                {label}
              </span>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center my-2">
        <div className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-full ${bgColor} border ${borderColor}`}>
          <ArrowRight className={`h-3 w-3 ${arrowColor} rotate-90`} />
          {label && (
            <span className={`text-xs font-medium ${arrowColor}`}>
              {label}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderNetwork = () => {
    if (isotopeNetwork.length === 0) {
      return (
        <div className="text-center text-neutral-400 py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-600 rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-neutral-500" />
          </div>
          <p>No isotope data available</p>
        </div>
      );
    }

    const { chains, isolatedNodes } = buildDecayNetwork();
    const isotopeMap = new Map(
      isotopeNetwork.map(iso => [
        `${iso.isotope.element.symbol}-${iso.isotope.mass_number}`,
        iso
      ])
    );

    return (
      <div className="space-y-8">
        {/* Render decay chains horizontally */}
        {chains.map((chain, chainIndex) => (
          <div key={chainIndex} className="bg-neutral-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-300 mb-3">
              Decay Chain {chainIndex + 1}
            </h4>
            <div className="flex items-center overflow-x-auto pb-2">
              {chain.map((isotopeKey, index) => {
                const isotope = isotopeMap.get(isotopeKey);
                if (!isotope) return null;

                const currentAmount = currentAmounts[isotopeKey];
                const initialAmount = initialAmounts[isotopeKey];

                return (
                  <React.Fragment key={isotopeKey}>
                    <div className="flex-shrink-0">
                      <IsotopeNode
                        isotope={isotope}
                        currentAmount={currentAmount}
                        initialAmount={initialAmount}
                      />
                    </div>
                    
                    {index < chain.length - 1 && (
                      <div className="flex-shrink-0">
                        {/* Determine arrow type based on actual connection */}
                        {isotope.decay_products.includes(chain[index + 1]) ? (
                          <ConnectionArrow 
                            type="decay" 
                            label={isotope.isotope.decay_mode || "decay"}
                            direction="horizontal"
                          />
                        ) : (
                          <ConnectionArrow 
                            type="capture" 
                            label="(n,γ)"
                            direction="horizontal"
                          />
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}

        {/* Render isolated nodes */}
        {isolatedNodes.length > 0 && (
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
            <h4 className="text-sm font-medium text-neutral-300 mb-3">
              Individual Isotopes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isolatedNodes.map(isotopeKey => {
                const isotope = isotopeMap.get(isotopeKey);
                if (!isotope) return null;

                const currentAmount = currentAmounts[isotopeKey];
                const initialAmount = initialAmounts[isotopeKey];

                return (
                  <div key={isotopeKey} className="flex flex-col items-center">
                    <IsotopeNode
                      isotope={isotope}
                      currentAmount={currentAmount}
                      initialAmount={initialAmount}
                    />
                    
                    {/* Show all possible reactions */}
                    {(isotope.decay_products.length > 0 || isotope.capture_product) && (
                      <div className="mt-2 space-y-1">
                        {isotope.decay_products.map((product, idx) => (
                          <div key={idx} className="text-xs text-center">
                            <ConnectionArrow type="decay" direction="vertical" />
                            <div className="text-yellow-300 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-600/30">
                              {product}
                            </div>
                          </div>
                        ))}
                        
                        {isotope.capture_product && (
                          <div className="text-xs text-center">
                            <ConnectionArrow type="capture" direction="vertical" />
                            <div className="text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-600/30">
                              {isotope.capture_product}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
          <h4 className="text-sm font-medium text-neutral-300 mb-2">Network Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{chains.length}</div>
              <div className="text-green-300">Decay Chains</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{isolatedNodes.length}</div>
              <div className="text-blue-300">Isolated Isotopes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">{isotopeNetwork.length}</div>
              <div className="text-purple-300">Total Isotopes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">
                {isotopeNetwork.reduce((sum, iso) => sum + iso.decay_products.length + (iso.capture_product ? 1 : 0), 0)}
              </div>
              <div className="text-orange-300">Total Reactions</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="bg-neutral-700 border border-neutral-600 rounded-lg">
      <div className="px-6 py-4 border-b border-neutral-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Decay Chain Network</h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* Export button */}
            <button
              onClick={() => {
                // TODO: Implement export functionality
              }}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors border border-green-600/30"
              title="Export Decay Chains as PNG"
            >
              <Camera className="h-4 w-4" />
              <span>Export</span>
            </button>
            {currentTime !== undefined && currentTime !== null && (
              <div className="text-sm text-neutral-400">
                Time: {currentTime.toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {renderNetwork()}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-neutral-600 bg-neutral-600">
        <h3 className="text-sm font-medium text-neutral-300 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-neutral-400">Radioactive decay</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-neutral-400">Neutron capture</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-neutral-400">High activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-neutral-500 rounded-full"></div>
            <span className="text-neutral-400">Stable isotope</span>
          </div>
        </div>
      </div>
    </div>
  );
}
