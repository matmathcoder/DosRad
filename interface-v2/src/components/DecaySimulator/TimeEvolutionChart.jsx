import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#EC4899', // pink
  '#6B7280', // gray
];

export default function TimeEvolutionChart({ 
  timeEvolution, 
  onTimeSelect,
  selectedTime 
}) {
  const [visibleIsotopes, setVisibleIsotopes] = useState(new Set());
  const [logScale, setLogScale] = useState(true);

  const { chartData, isotopeList } = useMemo(() => {
    const timePoints = Object.keys(timeEvolution).map(t => parseFloat(t)).sort((a, b) => a - b);
    const allIsotopes = new Set();
    
    // Collect all isotopes
    Object.values(timeEvolution).forEach(timePoint => {
      Object.keys(timePoint).forEach(isotope => allIsotopes.add(isotope));
    });

    const isotopeArray = Array.from(allIsotopes).sort();
    
    // Initialize visible isotopes with the top 5 most abundant
    if (visibleIsotopes.size === 0 && isotopeArray.length > 0) {
      const maxAmounts = {};
      isotopeArray.forEach(isotope => {
        maxAmounts[isotope] = Math.max(
          ...timePoints.map(time => timeEvolution[time.toString()]?.[isotope] || 0)
        );
      });
      
      const topIsotopes = isotopeArray
        .sort((a, b) => maxAmounts[b] - maxAmounts[a])
        .slice(0, 5);
      
      setVisibleIsotopes(new Set(topIsotopes));
    }

    const chartData = timePoints.map(time => {
      const dataPoint = { time };
      isotopeArray.forEach(isotope => {
        const amount = timeEvolution[time.toString()]?.[isotope] || 0;
        dataPoint[isotope] = amount > 0 ? amount : null;
      });
      return dataPoint;
    });

    return { chartData, isotopeList: isotopeArray };
  }, [timeEvolution, visibleIsotopes.size]);

  const toggleIsotope = (isotope) => {
    const newVisible = new Set(visibleIsotopes);
    if (newVisible.has(isotope)) {
      newVisible.delete(isotope);
    } else {
      newVisible.add(isotope);
    }
    setVisibleIsotopes(newVisible);
  };

  const formatTime = (time) => {
    if (time < 60) return `${time.toFixed(0)}s`;
    if (time < 3600) return `${(time / 60).toFixed(1)}m`;
    if (time < 86400) return `${(time / 3600).toFixed(1)}h`;
    return `${(time / 86400).toFixed(1)}d`;
  };

  const formatAmount = (value) => {
    if (value === 0) return '0';
    if (value < 1e3) return value.toFixed(0);
    return value.toExponential(2);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-700 p-3 border border-neutral-600 rounded-lg shadow-lg">
          <p className="font-medium text-white mb-2">
            Time: {formatTime(parseFloat(label))}
          </p>
          {payload
            .filter((entry) => entry.value !== null && entry.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.dataKey}: {formatAmount(entry.value)}
              </p>
            ))}
        </div>
      );
    }
    return null;
  };

  const handleChartClick = (data) => {
    if (data && data.activeLabel && onTimeSelect) {
      onTimeSelect(parseFloat(data.activeLabel));
    }
  };

  return (
    <div className="bg-neutral-700 border border-neutral-600 rounded-lg">
      <div className="px-6 py-4 border-b border-neutral-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Time Evolution</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLogScale(!logScale)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                logScale 
                  ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600/30' 
                  : 'bg-neutral-600 text-neutral-300 hover:bg-neutral-500 border border-neutral-500'
              }`}
            >
              {logScale ? 'Log Scale' : 'Linear Scale'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Chart */}
        <div className="h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              onClick={handleChartClick}
              className="cursor-pointer"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis 
                dataKey="time" 
                tickFormatter={formatTime}
                stroke="#9ca3af"
                tick={{ fill: '#d1d5db' }}
              />
              <YAxis 
                scale={logScale ? 'log' : 'linear'}
                domain={logScale ? ['auto', 'auto'] : [0, 'auto']}
                tickFormatter={formatAmount}
                stroke="#9ca3af"
                tick={{ fill: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {isotopeList.map((isotope, index) => {
                if (!visibleIsotopes.has(isotope)) return null;
                
                return (
                  <Line
                    key={isotope}
                    type="monotone"
                    dataKey={isotope}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                    name={isotope}
                  />
                );
              })}
              
              {/* Selected time indicator */}
              {selectedTime !== undefined && (
                <Line
                  dataKey={() => null}
                  stroke="#ff0000"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Isotope Toggle Controls */}
        <div className="border-t border-neutral-600 pt-4">
          <h3 className="text-sm font-medium text-neutral-300 mb-3">
            Isotopes ({visibleIsotopes.size}/{isotopeList.length} shown)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {isotopeList.map((isotope, index) => {
              const isVisible = visibleIsotopes.has(isotope);
              const color = COLORS[index % COLORS.length];
              
              return (
                <button
                  key={isotope}
                  onClick={() => toggleIsotope(isotope)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    isVisible
                      ? 'bg-neutral-600 border border-neutral-500 shadow-sm'
                      : 'bg-neutral-700 border border-neutral-600 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isVisible ? (
                      <Eye className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-neutral-500" />
                    )}
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: isVisible ? color : '#6b7280' }}
                    />
                  </div>
                  <span className={isVisible ? 'text-white font-medium' : 'text-neutral-500'}>
                    {isotope}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-neutral-600 pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVisibleIsotopes(new Set(isotopeList))}
              className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-full transition-colors border border-blue-600/30"
            >
              Show All
            </button>
            <button
              onClick={() => setVisibleIsotopes(new Set())}
              className="px-3 py-1 text-xs bg-neutral-600 hover:bg-neutral-500 text-neutral-300 rounded-full transition-colors border border-neutral-500"
            >
              Hide All
            </button>
            <button
              onClick={() => {
                // Show top 3 most abundant
                const maxAmounts = {};
                isotopeList.forEach(isotope => {
                  maxAmounts[isotope] = Math.max(
                    ...chartData.map(point => point[isotope] || 0)
                  );
                });
                
                const topIsotopes = isotopeList
                  .sort((a, b) => maxAmounts[b] - maxAmounts[a])
                  .slice(0, 3);
                
                setVisibleIsotopes(new Set(topIsotopes));
              }}
              className="px-3 py-1 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-full transition-colors border border-green-600/30"
            >
              Top 3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
