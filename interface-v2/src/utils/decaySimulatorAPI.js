/**
 * Decay Simulator API Utilities
 * Handles API calls to the Mercurad backend for decay simulation
 */

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

/**
 * Search for elements by query
 */
export const searchElements = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/elements/elements/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      if (response.status === 403) {
        return getMockElements(query);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching elements:', error);
    // Return mock data for development
    return getMockElements(query);
  }
};

/**
 * Get isotopes for a specific element
 */
export const getIsotopes = async (elementId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/elements/isotopes?element_id=${elementId}`);
    if (!response.ok) {
      if (response.status === 403) {
        return getMockIsotopes(elementId);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading isotopes:', error);
    // Return mock data for development
    return getMockIsotopes(elementId);
  }
};

/**
 * Get cross sections for a specific isotope
 */
export const getIsotopeCrossSections = async (isotopeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/elements/isotopes/${isotopeId}/cross-sections`);
    if (!response.ok) {
      if (response.status === 403) {
        return getMockCrossSections(isotopeId);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cross sections:', error);
    // Return mock data for development
    return getMockCrossSections(isotopeId);
  }
};

/**
 * Run decay simulation
 */
export const simulateDecayChain = async (params) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/elements/simulate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      if (response.status === 403) {
        return getMockSimulationResult(params);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error running simulation:', error);
    // Return mock data for development
    return getMockSimulationResult(params);
  }
};

// Mock data for development/testing
const getMockElements = (query) => {
  const mockElements = [
    { id: 1, atomic_number: 1, symbol: 'H', name: 'Hydrogen', atomic_mass: 1.008 },
    { id: 2, atomic_number: 2, symbol: 'He', name: 'Helium', atomic_mass: 4.003 },
    { id: 6, atomic_number: 6, symbol: 'C', name: 'Carbon', atomic_mass: 12.011 },
    { id: 7, atomic_number: 7, symbol: 'N', name: 'Nitrogen', atomic_mass: 14.007 },
    { id: 8, atomic_number: 8, symbol: 'O', name: 'Oxygen', atomic_mass: 15.999 },
    { id: 26, atomic_number: 26, symbol: 'Fe', name: 'Iron', atomic_mass: 55.845 },
    { id: 82, atomic_number: 82, symbol: 'Pb', name: 'Lead', atomic_mass: 207.2 },
    { id: 92, atomic_number: 92, symbol: 'U', name: 'Uranium', atomic_mass: 238.029 },
    { id: 94, atomic_number: 94, symbol: 'Pu', name: 'Plutonium', atomic_mass: 244.064 },
    { id: 95, atomic_number: 95, symbol: 'Am', name: 'Americium', atomic_mass: 243.061 },
  ];

  if (!query) return mockElements;

  const lowerQuery = query.toLowerCase();
  return mockElements.filter(element => 
    element.symbol.toLowerCase().includes(lowerQuery) ||
    element.name.toLowerCase().includes(lowerQuery) ||
    element.atomic_number.toString().includes(query)
  );
};

const getMockIsotopes = (elementId) => {
  const mockIsotopes = {
    1: [ // Hydrogen
      { id: 1, element: { id: 1, symbol: 'H', name: 'Hydrogen' }, mass_number: 1, half_life: 'Stable', decay_mode: '', is_stable: true },
      { id: 2, element: { id: 1, symbol: 'H', name: 'Hydrogen' }, mass_number: 2, half_life: 'Stable', decay_mode: '', is_stable: true },
      { id: 3, element: { id: 1, symbol: 'H', name: 'Hydrogen' }, mass_number: 3, half_life: '12.32 y', decay_mode: 'β-', is_stable: false },
    ],
    82: [ // Lead
      { id: 82, element: { id: 82, symbol: 'Pb', name: 'Lead' }, mass_number: 206, half_life: 'Stable', decay_mode: '', is_stable: true },
      { id: 83, element: { id: 82, symbol: 'Pb', name: 'Lead' }, mass_number: 207, half_life: 'Stable', decay_mode: '', is_stable: true },
      { id: 84, element: { id: 82, symbol: 'Pb', name: 'Lead' }, mass_number: 208, half_life: 'Stable', decay_mode: '', is_stable: true },
      { id: 85, element: { id: 82, symbol: 'Pb', name: 'Lead' }, mass_number: 210, half_life: '22.3 y', decay_mode: 'β-', is_stable: false },
    ],
    92: [ // Uranium
      { id: 92, element: { id: 92, symbol: 'U', name: 'Uranium' }, mass_number: 235, half_life: '7.04e8 y', decay_mode: 'α', is_stable: false },
      { id: 93, element: { id: 92, symbol: 'U', name: 'Uranium' }, mass_number: 238, half_life: '4.47e9 y', decay_mode: 'α', is_stable: false },
    ],
    94: [ // Plutonium
      { id: 94, element: { id: 94, symbol: 'Pu', name: 'Plutonium' }, mass_number: 239, half_life: '2.41e4 y', decay_mode: 'α', is_stable: false },
      { id: 95, element: { id: 94, symbol: 'Pu', name: 'Plutonium' }, mass_number: 240, half_life: '6.56e3 y', decay_mode: 'α', is_stable: false },
    ],
    95: [ // Americium
      { id: 96, element: { id: 95, symbol: 'Am', name: 'Americium' }, mass_number: 241, half_life: '432.2 y', decay_mode: 'α', is_stable: false },
      { id: 97, element: { id: 95, symbol: 'Am', name: 'Americium' }, mass_number: 243, half_life: '7.37e3 y', decay_mode: 'α', is_stable: false },
    ]
  };

  return mockIsotopes[elementId] || [];
};

const getMockCrossSections = (isotopeId) => {
  const mockCrossSections = {
    1: [ // H-1
      { id: 1, isotope: { id: 1, symbol: 'H-1' }, target: 'H', reaction: 'N,G', energy: 0.025, cross_section: 0.332, origin: 'ENDF/B-VIII.0' },
      { id: 2, isotope: { id: 1, symbol: 'H-1' }, target: 'H', reaction: 'N,G', energy: 1.0, cross_section: 0.332, origin: 'ENDF/B-VIII.0' },
    ],
    82: [ // Pb-206
      { id: 82, isotope: { id: 82, symbol: 'Pb-206' }, target: 'Pb', reaction: 'N,G', energy: 0.025, cross_section: 0.17, origin: 'ENDF/B-VIII.0' },
      { id: 83, isotope: { id: 82, symbol: 'Pb-206' }, target: 'Pb', reaction: 'N,G', energy: 1.0, cross_section: 0.15, origin: 'ENDF/B-VIII.0' },
    ],
    92: [ // U-235
      { id: 92, isotope: { id: 92, symbol: 'U-235' }, target: 'U', reaction: 'N,G', energy: 0.025, cross_section: 98.8, origin: 'ENDF/B-VIII.0' },
      { id: 93, isotope: { id: 92, symbol: 'U-235' }, target: 'U', reaction: 'N,F', energy: 0.025, cross_section: 584.4, origin: 'ENDF/B-VIII.0' },
    ],
    94: [ // Pu-239
      { id: 94, isotope: { id: 94, symbol: 'Pu-239' }, target: 'Pu', reaction: 'N,G', energy: 0.025, cross_section: 270.0, origin: 'ENDF/B-VIII.0' },
      { id: 95, isotope: { id: 94, symbol: 'Pu-239' }, target: 'Pu', reaction: 'N,F', energy: 0.025, cross_section: 747.4, origin: 'ENDF/B-VIII.0' },
    ]
  };

  return { cross_sections: mockCrossSections[isotopeId] || [] };
};

const getMockSimulationResult = (params) => {
  // Generate mock simulation result
  const timePoints = [];
  const maxTime = params.time;
  const timeStep = params.time_step;
  
  for (let t = 0; t <= maxTime; t += timeStep) {
    timePoints.push(t);
  }

  const isotopeKey = `${params.element_symbol}-${params.mass_number}`;
  const timeEvolution = {};
  
  timePoints.forEach(time => {
    timeEvolution[time.toString()] = {
      [isotopeKey]: params.initial_atoms * Math.exp(-time * 0.001) // Simple exponential decay
    };
  });

  return {
    simulation_parameters: params,
    isotope_network: [
      {
        isotope: {
          id: 1,
          element: { symbol: params.element_symbol, name: 'Mock Element' },
          mass_number: params.mass_number
        },
        amount: params.initial_atoms,
        decay_constant: 0.001,
        cross_section: 1.0,
        half_life_seconds: 693.1,
        activity: params.initial_atoms * 0.001,
        decay_products: [],
        capture_product: null
      }
    ],
    time_evolution: timeEvolution,
    total_simulation_time: params.time,
    time_points: timePoints
  };
};
