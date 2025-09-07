/**
 * Directory Data Utilities
 * Handles data processing and structure building for the directory
 */

/**
 * Get sources (volumes with isSource: true)
 */
export function getSources(existingVolumes) {
  return existingVolumes.filter(volume => volume.userData?.isSource);
}

/**
 * Get compositions from volumes
 */
export function getCompositions(existingVolumes) {
  return existingVolumes
    .map(volume => volume.userData?.composition)
    .filter(Boolean)
    .filter((comp, index, arr) => 
      arr.findIndex(c => c.name === comp.name) === index
    );
}

/**
 * Example compound volumes and contaminated tube
 */
export const exampleVolumes = [
  {
    id: 'contaminated-tube',
    name: 'TUBTUTOT.PCS',
    type: 'compound',
    description: 'Contaminated Steel Tube with UO2 Layer',
    components: [
      { name: 'Outer Steel Tube', material: 'Stainless Steel', thickness: '0.5cm' },
      { name: 'UO2 Source Layer', material: 'Uranium Oxide', thickness: '0.5cm' },
      { name: 'Air Space', material: 'Air', thickness: 'Variable' }
    ],
    dimensions: { length: '0.5m', diameter: '0.2m' },
    source: 'U-235',
    visible: true
  },
  {
    id: 'reactor-vessel',
    name: 'REACTOR_VESSEL.PCS',
    type: 'compound',
    description: 'Nuclear Reactor Pressure Vessel',
    components: [
      { name: 'Steel Shell', material: 'Carbon Steel', thickness: '15cm' },
      { name: 'Stainless Steel Liner', material: 'SS304', thickness: '2cm' },
      { name: 'Concrete Shield', material: 'Heavy Concrete', thickness: '100cm' }
    ],
    dimensions: { height: '12m', diameter: '4.5m' },
    source: 'Mixed Fission Products',
    visible: true
  },
  {
    id: 'waste-container',
    name: 'WASTE_CONTAINER.PCS',
    type: 'compound',
    description: 'High-Level Waste Storage Container',
    components: [
      { name: 'Lead Shield', material: 'Lead', thickness: '20cm' },
      { name: 'Steel Container', material: 'Stainless Steel', thickness: '5cm' },
      { name: 'Concrete Overpack', material: 'Reinforced Concrete', thickness: '50cm' }
    ],
    dimensions: { height: '2m', diameter: '1.5m' },
    source: 'Cs-137, Sr-90',
    visible: true
  },
  {
    id: 'fuel-assembly',
    name: 'FUEL_ASSEMBLY.PCS',
    type: 'compound',
    description: 'Nuclear Fuel Assembly',
    components: [
      { name: 'Fuel Rods', material: 'UO2 Pellets', count: '264' },
      { name: 'Cladding', material: 'Zircaloy-4', thickness: '0.6mm' },
      { name: 'Assembly Structure', material: 'Zircaloy-4', thickness: '2mm' }
    ],
    dimensions: { height: '4.5m', width: '20cm', depth: '20cm' },
    source: 'U-235, Pu-239',
    visible: true
  }
];

/**
 * Build the directory structure
 */
export function buildDirectoryStructure({
  existingVolumes,
  existingSensors,
  existingSpectra
}) {
  const sources = getSources(existingVolumes);
  const compositions = getCompositions(existingVolumes);

  return [
    {
      id: 'scene',
      name: 'Scene',
      type: 'folder',
      children: [
        {
          id: 'objects',
          name: 'Objects',
          type: 'folder',
          children: existingVolumes.map(volume => ({
            id: volume.id,
            name: volume.userData?.volumeName || volume.name || 'Unnamed Volume',
            type: 'object',
            objectType: volume.type,
            visible: volume.visible !== false, // Use actual visibility state, default to true
            data: volume
          }))
        },
        {
          id: 'sources',
          name: 'Sources',
          type: 'folder',
          children: sources.map(source => ({
            id: source.id,
            name: source.userData?.volumeName || source.name || 'Unnamed Source',
            type: 'source',
            objectType: source.type,
            visible: source.visible !== false, // Use actual visibility state, default to true
            data: source
          }))
        },
        {
          id: 'compositions',
          name: 'Compositions',
          type: 'folder',
          children: compositions.map((comp, index) => ({
            id: `comp-${index}`,
            name: comp.name,
            type: 'composition',
            visible: true,
            data: comp
          }))
        },
        {
          id: 'sensors',
          name: 'Sensors',
          type: 'folder',
          children: existingSensors.map(sensor => ({
            id: sensor.id,
            name: sensor.name || 'Unnamed Sensor',
            type: 'sensor',
            visible: true,
            data: sensor
          }))
        },
        {
          id: 'spectra',
          name: 'Spectra',
          type: 'folder',
          children: existingSpectra.map((spectrum, index) => ({
            id: `spectrum-${index}`,
            name: spectrum.name,
            type: 'spectrum',
            visible: true,
            data: spectrum
          }))
        }
      ]
    },
    {
      id: 'examples',
      name: 'Examples',
      type: 'folder',
      children: [
        {
          id: 'compound-volumes',
          name: 'Compound Volumes',
          type: 'folder',
          children: exampleVolumes.map(example => ({
            id: example.id,
            name: example.name,
            type: 'example',
            objectType: 'compound',
            visible: example.visible,
            data: example,
            description: example.description
          }))
        },
        {
          id: 'contaminated-tube',
          name: 'TUBTUTOT.PCS',
          type: 'example',
          objectType: 'compound',
          visible: true,
          data: exampleVolumes[0], // The contaminated tube example
          description: 'Contaminated Steel Tube with UO2 Layer - Example from documentation'
        }
      ]
    }
  ];
}

/**
 * Calculate position style based on layout
 */
export function getPositionStyle(layoutPosition, isMinimized) {
  const baseStyle = {
    width: '350px',
    height: isMinimized ? '48px' : '80vh', // Similar height to sidebar (80vh)
    top: '72px', // Start with small gap below navbar
    zIndex: 25
  };

  switch (layoutPosition) {
    case 'right':
      return { ...baseStyle, right: '0px' }; // No gap from right edge
    case 'left':
      return { ...baseStyle, left: '0px' }; // No gap from left edge
    case 'top':
      return { 
        ...baseStyle, 
        top: '72px', // Small gap below navbar
        left: '50%',
        transform: 'translateX(-50%)',
        height: isMinimized ? '48px' : '60vh' // Shorter height for top position
      };
    case 'bottom':
      return { 
        ...baseStyle, 
        top: 'calc(100vh - 60vh - 72px)', // Position above bottom with margin
        left: '50%',
        transform: 'translateX(-50%)',
        height: isMinimized ? '48px' : '60vh' // Shorter height for bottom position
      };
    default:
      return { ...baseStyle, left: '0px' }; // No gap from left edge
  }
}
