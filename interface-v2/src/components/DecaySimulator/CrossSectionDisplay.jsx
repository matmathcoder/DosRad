import React, { useState, useEffect } from 'react';
import { Target, Activity, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getIsotopeCrossSections } from '../../utils/decaySimulatorAPI';

export default function CrossSectionDisplay({ selectedIsotope }) {
  const [crossSections, setCrossSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCrossSections = async () => {
      if (!selectedIsotope) {
        setCrossSections([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await getIsotopeCrossSections(selectedIsotope.id);
        setCrossSections(data.cross_sections);
      } catch (err) {
        setError('Failed to fetch cross sections');
        console.error('Cross section fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCrossSections();
  }, [selectedIsotope]);

  if (!selectedIsotope) {
    return null;
  }

  const formatEnergy = (energy) => {
    if (energy < 1) {
      return `${(energy * 1000).toFixed(1)} meV`;
    } else if (energy < 1000) {
      return `${energy.toFixed(3)} eV`;
    } else if (energy < 1000000) {
      return `${(energy / 1000).toFixed(2)} keV`;
    } else {
      return `${(energy / 1000000).toFixed(2)} MeV`;
    }
  };

  const formatCrossSection = (xs) => {
    if (xs < 0.001) {
      return `${(xs * 1000).toFixed(1)} mb`;
    } else if (xs < 1000) {
      return `${xs.toFixed(3)} b`;
    } else {
      return `${(xs / 1000).toFixed(2)} kb`;
    }
  };

  const groupedSections = crossSections.reduce((acc, section) => {
    const key = section.reaction;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(section);
    return acc;
  }, {});

  return (
    <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Target className="h-5 w-5 text-purple-400" />
          <span>Neutron Cross Sections</span>
          {selectedIsotope && (
            <span className="text-purple-400 font-mono">
              {selectedIsotope.element.symbol}-{selectedIsotope.mass_number}
            </span>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          {crossSections.length > 0 && (
            <span className="text-sm text-neutral-400">
              {crossSections.length} data points
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <span className="ml-3 text-neutral-400">Loading cross sections...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && crossSections.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-neutral-500 mx-auto mb-3" />
              <p className="text-neutral-400">No cross section data available for this isotope</p>
            </div>
          )}

          {!loading && !error && crossSections.length > 0 && (
            <div className="space-y-6">
              {Object.entries(groupedSections).map(([reaction, sections]) => (
                <div key={reaction} className="border-l-4 border-purple-500/30 pl-4">
                  <h4 className="font-semibold text-white mb-3">
                    {reaction} Reaction
                    <span className="text-sm font-normal text-neutral-400 ml-2">
                      ({sections.length} data points)
                    </span>
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-600">
                      <thead className="bg-neutral-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                            Energy
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                            Cross Section
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                            Target
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                            Origin
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                            Links
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-neutral-700 divide-y divide-neutral-600">
                        {sections.slice(0, 10).map((section) => (
                          <tr key={section.id} className="hover:bg-neutral-600">
                            <td className="px-4 py-2 text-sm text-white font-mono">
                              {formatEnergy(section.energy)}
                            </td>
                            <td className="px-4 py-2 text-sm text-white font-mono">
                              {formatCrossSection(section.cross_section)}
                            </td>
                            <td className="px-4 py-2 text-sm text-neutral-300">
                              {section.target}
                            </td>
                            <td className="px-4 py-2 text-sm text-neutral-300">
                              {section.origin || 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <div className="flex space-x-2">
                                {section.range_url && (
                                  <a
                                    href={section.range_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300"
                                    title="Range URL"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                {section.isotope_url && (
                                  <a
                                    href={section.isotope_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-400 hover:text-green-300"
                                    title="Isotope URL"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sections.length > 10 && (
                      <div className="mt-3 text-sm text-neutral-400 text-center">
                        Showing first 10 of {sections.length} data points
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {crossSections.length > 0 && (
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
                  <h5 className="font-semibold text-blue-300 mb-2">Cross Section Summary</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-400 font-medium">Total Data Points:</span>
                      <span className="ml-2 text-blue-200">{crossSections.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-400 font-medium">Reaction Types:</span>
                      <span className="ml-2 text-blue-200">{Object.keys(groupedSections).length}</span>
                    </div>
                    <div>
                      <span className="text-blue-400 font-medium">Energy Range:</span>
                      <span className="ml-2 text-blue-200 font-mono">
                        {formatEnergy(Math.min(...crossSections.map(s => s.energy)))} - {formatEnergy(Math.max(...crossSections.map(s => s.energy)))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
