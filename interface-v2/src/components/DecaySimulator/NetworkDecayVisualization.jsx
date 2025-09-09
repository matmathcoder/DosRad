import React, { useMemo, useRef } from 'react';
import { Target, Zap, ArrowRight, ArrowDown, Download, Camera } from 'lucide-react';

export default function NetworkDecayVisualization({
  isotopeNetwork,
  currentTime,
  timeEvolution
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const calculateCaptureRate = (isotope) => {
    if (!isotope.cross_section) return 0;
    // Simple probability calculation based on cross section
    // Higher cross section = higher probability
    return Math.min(isotope.cross_section / 1000, 1.0);
  };

  const { currentAmounts, initialAmounts } = useMemo(() => {
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

  const { nodes, edges, levels } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const elementGroups = {};

    // Create nodes
    isotopeNetwork.forEach((isotope, index) => {
      const id = `${isotope.isotope.element.symbol}-${isotope.isotope.mass_number}`;
      const element = isotope.isotope.element.symbol;
      
      const node = {
        id,
        isotope,
        level: 0, // Will be calculated later
        x: 0,
        y: 0,
        element,
        massNumber: isotope.isotope.mass_number,
        currentAmount: currentAmounts[id],
        initialAmount: initialAmounts[id]
      };

      nodes.push(node);

      if (!elementGroups[element]) {
        elementGroups[element] = [];
      }
      elementGroups[element].push(node);
    });

    // Create edges
    nodes.forEach(node => {
      // Decay edges
      node.isotope.decay_products.forEach(productId => {
        const targetNode = nodes.find(n => n.id === productId);
        if (targetNode) {
          edges.push({
            from: node.id,
            to: targetNode.id,
            type: 'decay',
            probability: 1.0, // Assume 100% for primary decay
            decayMode: node.isotope.isotope.decay_mode
          });
        }
      });

      // Neutron capture edges
      if (node.isotope.capture_product) {
        const targetNode = nodes.find(n => n.id === node.isotope.capture_product);
        if (targetNode) {
          edges.push({
            from: node.id,
            to: targetNode.id,
            type: 'capture',
            probability: calculateCaptureRate(node.isotope),
            crossSection: node.isotope.cross_section || 0
          });
        }
      }
    });

    // Calculate levels (atomic number groups)
    const elementLevels = Object.keys(elementGroups).sort((a, b) => {
      const aZ = elementGroups[a][0]?.isotope.isotope.element.atomic_number || 0;
      const bZ = elementGroups[b][0]?.isotope.isotope.element.atomic_number || 0;
      return aZ - bZ;
    });

    elementLevels.forEach((element, levelIndex) => {
      elementGroups[element].forEach((node, nodeIndex) => {
        node.level = levelIndex;
        node.x = levelIndex * 300 + 150; // Horizontal spacing
        node.y = nodeIndex * 120 + 100; // Vertical spacing within level
      });
    });

    return { nodes, edges, levels: elementLevels };
  }, [isotopeNetwork, currentAmounts, initialAmounts]);

  const formatAmount = (amount) => {
    if (amount === 0) return '0';
    if (amount < 1e3) return amount.toFixed(0);
    return amount.toExponential(1);
  };

  const formatCrossSection = (xs) => {
    if (xs === 0) return '0 b';
    if (xs < 1) return `${xs.toFixed(3)} b`;
    if (xs < 1000) return `${xs.toFixed(1)} b`;
    return `${xs.toExponential(2)} b`;
  };

  const getNodeColor = (node) => {
    const atomicNumber = node.isotope.isotope.element.atomic_number;
    
    // Color by atomic number ranges with better visibility
    if (atomicNumber <= 10) return { fill: '#dc2626', stroke: '#ef4444' }; // red
    if (atomicNumber <= 20) return { fill: '#ea580c', stroke: '#f97316' }; // orange
    if (atomicNumber <= 30) return { fill: '#ca8a04', stroke: '#eab308' }; // yellow
    if (atomicNumber <= 40) return { fill: '#16a34a', stroke: '#22c55e' }; // green
    if (atomicNumber <= 50) return { fill: '#2563eb', stroke: '#3b82f6' }; // blue
    if (atomicNumber <= 60) return { fill: '#4f46e5', stroke: '#6366f1' }; // indigo
    if (atomicNumber <= 80) return { fill: '#7c3aed', stroke: '#8b5cf6' }; // purple
    return { fill: '#ec4899', stroke: '#f472b6' }; // pink
  };

  const getEdgeColor = (edge) => {
    return edge.type === 'decay' ? '#eab308' : '#3b82f6';
  };

  const getEdgeWidth = (edge) => {
    return Math.max(1, edge.probability * 4);
  };

  const exportAsSVG = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `nuclear-decay-network-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  if (nodes.length === 0) {
    return (
      <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-12 text-center">
        <Target className="h-12 w-12 mx-auto mb-4 text-neutral-500" />
        <p className="text-neutral-400">No isotope network data available</p>
      </div>
    );
  }

  const svgWidth = Math.max(800, levels.length * 300 + 200);
  const svgHeight = Math.max(600, Math.max(...nodes.map(n => n.y)) + 200);

  return (
    <div ref={containerRef} className="bg-neutral-700 border border-neutral-600 rounded-lg">
      <div className="px-6 py-4 border-b border-neutral-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Nuclear Reaction Network</h2>
          </div>
          <div className="flex items-center space-x-4">
            {/* Export buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={exportAsSVG}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors border border-blue-600/30"
                title="Export as SVG"
              >
                <Download className="h-4 w-4" />
                <span>SVG</span>
              </button>
            </div>
            {currentTime !== undefined && currentTime !== null && (
              <div className="text-sm text-neutral-400">
                Time: {currentTime.toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Level Headers */}
        <div className="mb-4 flex space-x-4 overflow-x-auto">
          {levels.map((element, index) => {
            const atomicNumber = nodes.find(n => n.element === element)?.isotope.isotope.element.atomic_number;
            return (
              <div key={element} className="flex-shrink-0 text-center" style={{ width: '250px' }}>
                <div className="bg-neutral-600 rounded-lg p-2 mb-2">
                  <div className="font-bold text-white">{element}</div>
                  <div className="text-xs text-neutral-400">Z = {atomicNumber}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Network SVG */}
        <div className="overflow-auto border border-neutral-600 rounded-lg bg-neutral-800">
          <svg ref={svgRef} width={svgWidth} height={svgHeight} className="min-w-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="1"/>
              </pattern>
              <marker id="arrowhead-decay" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#eab308" />
              </marker>
              <marker id="arrowhead-capture" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const markerId = edge.type === 'decay' ? 'arrowhead-decay' : 'arrowhead-capture';
              
              return (
                <g key={index}>
                  <line
                    x1={fromNode.x + 60}
                    y1={fromNode.y + 30}
                    x2={toNode.x - 10}
                    y2={toNode.y + 30}
                    stroke={getEdgeColor(edge)}
                    strokeWidth={getEdgeWidth(edge)}
                    markerEnd={`url(#${markerId})`}
                    opacity={0.7}
                  />
                  
                  {/* Edge label */}
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 5}
                    textAnchor="middle"
                    className="text-xs fill-neutral-300"
                    fontSize="10"
                  >
                    {edge.type === 'decay' 
                      ? edge.decayMode || 'decay'
                      : `σ=${formatCrossSection(edge.crossSection || 0)}`
                    }
                  </text>
                  
                  {edge.type === 'capture' && edge.crossSection && (
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 + 10}
                      textAnchor="middle"
                      className="text-xs fill-blue-400"
                      fontSize="9"
                    >
                      P={Math.round(edge.probability * 100)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const percentage = node.initialAmount && node.initialAmount > 0 
                ? ((node.currentAmount || node.isotope.amount) / node.initialAmount) * 100 
                : 100;
              
              const nodeColors = getNodeColor(node);

              return (
                <g key={node.id}>
                  {/* Node shadow */}
                  <rect
                    x={node.x - 48}
                    y={node.y - 23}
                    width="100"
                    height="50"
                    fill="rgba(0,0,0,0.3)"
                    rx="8"
                  />
                  
                  {/* Node background */}
                  <rect
                    x={node.x - 50}
                    y={node.y - 25}
                    width="100"
                    height="50"
                    fill={nodeColors.fill}
                    stroke={nodeColors.stroke}
                    strokeWidth="2"
                    rx="8"
                  />
                  
                  {/* Progress indicator */}
                  {percentage < 100 && (
                    <rect
                      x={node.x - 48}
                      y={node.y + 20}
                      width={Math.max(4, (percentage / 100) * 96)}
                      height="3"
                      fill="#3b82f6"
                      rx="1.5"
                    />
                  )}

                  {/* Isotope label */}
                  <text
                    x={node.x}
                    y={node.y - 8}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {node.id}
                  </text>
                  
                  {/* Amount */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill="#e5e7eb"
                    fontSize="11"
                  >
                    {formatAmount(node.currentAmount || node.isotope.amount)}
                  </text>

                  {/* Cross-section or half-life */}
                  {node.isotope.cross_section && node.isotope.cross_section > 0 ? (
                    <text
                      x={node.x}
                      y={node.y + 16}
                      textAnchor="middle"
                      fill="#60a5fa"
                      fontSize="9"
                      fontWeight="600"
                    >
                      σ: {formatCrossSection(node.isotope.cross_section)}
                    </text>
                  ) : node.isotope.half_life_seconds && (
                    <text
                      x={node.x}
                      y={node.y + 16}
                      textAnchor="middle"
                      fill="#a78bfa"
                      fontSize="9"
                    >
                      T½: {node.isotope.half_life_seconds && node.isotope.half_life_seconds < 3600 
                        ? `${(node.isotope.half_life_seconds / 60).toFixed(1)}m`
                        : node.isotope.half_life_seconds 
                        ? `${(node.isotope.half_life_seconds / 3600).toFixed(1)}h`
                        : 'Stable'
                      }
                    </text>
                  )}

                  {/* Reaction indicators */}
                  {node.isotope.decay_constant > 0 && (
                    <g>
                      <circle
                        cx={node.x + 35}
                        cy={node.y - 15}
                        r="8"
                        fill="#fbbf24"
                        stroke="#d97706"
                        strokeWidth="1"
                      />
                      <text
                        x={node.x + 35}
                        y={node.y - 12}
                        textAnchor="middle"
                        fill="#92400e"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        α/β
                      </text>
                    </g>
                  )}
                  
                  {node.isotope.cross_section && node.isotope.cross_section > 0 && (
                    <g>
                      <circle
                        cx={node.x + 35}
                        cy={node.y + (node.isotope.decay_constant > 0 ? 5 : -15)}
                        r="8"
                        fill="#60a5fa"
                        stroke="#2563eb"
                        strokeWidth="1"
                      />
                      <text
                        x={node.x + 35}
                        y={node.y + (node.isotope.decay_constant > 0 ? 8 : -12)}
                        textAnchor="middle"
                        fill="#1d4ed8"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        n,γ
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend and Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legend */}
          <div className="bg-neutral-600 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-yellow-500 rounded"></div>
                <span className="text-neutral-300">Radioactive Decay</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-blue-500 rounded"></div>
                <span className="text-neutral-300">Neutron Capture (n,γ)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-neutral-300">Radioactive isotope</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-neutral-300">Neutron absorber</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-2 bg-blue-500 rounded"></div>
                <span className="text-neutral-300">Remaining amount</span>
              </div>
            </div>
          </div>

          {/* Network Statistics */}
          <div className="bg-neutral-600 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Network Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-lg font-bold text-indigo-400">{levels.length}</div>
                <div className="text-neutral-400">Elements</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-400">{nodes.length}</div>
                <div className="text-neutral-400">Isotopes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-400">
                  {edges.filter(e => e.type === 'decay').length}
                </div>
                <div className="text-neutral-400">Decay Paths</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">
                  {edges.filter(e => e.type === 'capture').length}
                </div>
                <div className="text-neutral-400">Capture Paths</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-section Details */}
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
          <h4 className="font-medium text-white mb-3">Neutron Cross-Sections</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes
              .filter(node => node.isotope.cross_section && node.isotope.cross_section > 0)
              .sort((a, b) => (b.isotope.cross_section || 0) - (a.isotope.cross_section || 0))
              .slice(0, 6)
              .map(node => (
                <div key={node.id} className="bg-neutral-600 rounded p-3">
                  <div className="font-medium text-white">{node.id}</div>
                  <div className="text-sm text-blue-400">
                    σ = {formatCrossSection(node.isotope.cross_section || 0)}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Capture probability: {Math.round(calculateCaptureRate(node.isotope) * 100)}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
