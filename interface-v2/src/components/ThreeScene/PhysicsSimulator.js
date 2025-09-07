import * as THREE from 'three';

/**
 * Advanced X-ray Physics Simulation Engine
 * Implements Monte Carlo simulation of X-ray interactions over 15 keV - 10 MeV energy range
 */
export default class PhysicsSimulator {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
    
    // Physics constants
    this.constants = {
      ELECTRON_MASS: 0.511, // MeV
      PLANCK_CONSTANT: 6.626e-34, // J⋅s
      SPEED_OF_LIGHT: 2.998e8, // m/s
      AVOGADRO_NUMBER: 6.022e23,
      CLASSICAL_ELECTRON_RADIUS: 2.818e-15, // m
      FINE_STRUCTURE_CONSTANT: 7.297e-3
    };
    
    // Energy range for simulation
    this.energyRange = {
      min: 15e-3, // 15 keV in MeV
      max: 10.0   // 10 MeV
    };
    
    // Material database with atomic properties
    this.materialDatabase = this.initializeMaterialDatabase();
    
    // Cross-section data (simplified - in production, use NIST data)
    this.crossSections = this.initializeCrossSections();
    
    // Simulation state
    this.isSimulating = false;
    this.simulationResults = [];
    this.photonPaths = [];
    this.interactionPoints = [];
    
    // Visualization objects
    this.photonTrails = [];
    this.interactionMarkers = [];
    this.energyDepositionVisualization = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  /**
   * Initialize material database with atomic properties
   */
  initializeMaterialDatabase() {
    return {
      // Common materials in radiation physics
      'Air': {
        density: 0.001225, // g/cm³
        composition: [
          { element: 'N', atomicNumber: 7, massFraction: 0.7553 },
          { element: 'O', atomicNumber: 8, massFraction: 0.2314 },
          { element: 'Ar', atomicNumber: 18, massFraction: 0.0128 }
        ],
        kEdge: null
      },
      'Water': {
        density: 1.0,
        composition: [
          { element: 'H', atomicNumber: 1, massFraction: 0.1119 },
          { element: 'O', atomicNumber: 8, massFraction: 0.8881 }
        ],
        kEdge: null
      },
      'Lead': {
        density: 11.35,
        composition: [
          { element: 'Pb', atomicNumber: 82, massFraction: 1.0 }
        ],
        kEdge: 88.0e-3 // 88 keV
      },
      'Iron': {
        density: 7.87,
        composition: [
          { element: 'Fe', atomicNumber: 26, massFraction: 1.0 }
        ],
        kEdge: 7.11e-3 // 7.11 keV
      },
      'Concrete': {
        density: 2.3,
        composition: [
          { element: 'H', atomicNumber: 1, massFraction: 0.01 },
          { element: 'O', atomicNumber: 8, massFraction: 0.53 },
          { element: 'Si', atomicNumber: 14, massFraction: 0.33 },
          { element: 'Ca', atomicNumber: 20, massFraction: 0.13 }
        ],
        kEdge: null
      },
      'Steel': {
        density: 7.85,
        composition: [
          { element: 'Fe', atomicNumber: 26, massFraction: 0.95 },
          { element: 'C', atomicNumber: 6, massFraction: 0.05 }
        ],
        kEdge: 7.11e-3
      }
    };
  }
  
  /**
   * Initialize cross-section data for different interactions
   */
  initializeCrossSections() {
    return {
      // Photoelectric absorption cross-sections (simplified model)
      photoelectric: (energy, atomicNumber) => {
        const E = energy; // MeV
        const Z = atomicNumber;
        
        // Approximate photoelectric cross-section (cm²/g)
        // σ_pe ∝ Z^4 / E^3 for energies well above K-edge
        if (E < 0.1) { // Below 100 keV
          return Math.pow(Z, 4) * Math.pow(E, -3) * 1e-24;
        } else {
          return Math.pow(Z, 4) * Math.pow(E, -3) * 1e-25;
        }
      },
      
      // Compton scattering cross-section (Klein-Nishina formula)
      compton: (energy) => {
        const E = energy; // MeV
        const alpha = E / this.constants.ELECTRON_MASS; // E/mc²
        
        // Klein-Nishina cross-section per electron (cm²)
        const sigma_0 = 2 * Math.PI * Math.pow(this.constants.CLASSICAL_ELECTRON_RADIUS * 100, 2);
        
        const term1 = (1 + alpha) / Math.pow(alpha, 2);
        const term2 = (2 * (1 + alpha)) / (1 + 2 * alpha);
        const term3 = Math.log(1 + 2 * alpha) / alpha;
        
        return sigma_0 * (term1 * (2 + term2 - term3) - 1 / alpha);
      },
      
      // Rayleigh scattering cross-section (simplified)
      rayleigh: (energy, atomicNumber) => {
        const E = energy; // MeV
        const Z = atomicNumber;
        
        // Rayleigh scattering is significant only at low energies
        if (E > 0.01) return 0; // Negligible above 10 keV
        
        // Approximate Rayleigh cross-section
        return Math.pow(Z, 2) * Math.pow(E, -2) * 1e-28;
      },
      
      // Pair production cross-section (simplified)
      pairProduction: (energy) => {
        const E = energy; // MeV
        const threshold = 1.022; // 2 * electron mass
        
        if (E < threshold) return 0;
        
        // Approximate pair production cross-section
        const excess = E - threshold;
        return excess * 1e-25; // Simplified model
      }
    };
  }
  
  /**
   * Calculate total attenuation coefficient for a material
   */
  calculateAttenuationCoefficient(material, energy) {
    const materialData = this.materialDatabase[material];
    if (!materialData) return 0;
    
    let totalCrossSection = 0;
    
    materialData.composition.forEach(component => {
      const atomicNumber = component.atomicNumber;
      const massFraction = component.massFraction;
      
      // Photoelectric absorption
      const sigma_pe = this.crossSections.photoelectric(energy, atomicNumber);
      
      // Compton scattering
      const sigma_compton = this.crossSections.compton(energy);
      
      // Rayleigh scattering
      const sigma_rayleigh = this.crossSections.rayleigh(energy, atomicNumber);
      
      // Pair production (only for high energies)
      const sigma_pair = this.crossSections.pairProduction(energy);
      
      // Total cross-section for this element
      const elementCrossSection = sigma_pe + sigma_compton + sigma_rayleigh + sigma_pair;
      
      // Weight by mass fraction
      totalCrossSection += elementCrossSection * massFraction;
    });
    
    // Convert to linear attenuation coefficient (cm⁻¹)
    const linearAttenuation = totalCrossSection * materialData.density;
    
    return linearAttenuation;
  }
  
  /**
   * Simulate photon interaction using Monte Carlo method
   */
  simulatePhotonInteraction(photon, material, distance) {
    const energy = photon.energy;
    const attenuationCoeff = this.calculateAttenuationCoefficient(material, energy);
    
    // Calculate interaction probability
    const interactionProbability = 1 - Math.exp(-attenuationCoeff * distance);
    
    // Determine if interaction occurs
    if (Math.random() < interactionProbability) {
      return this.selectInteractionType(energy, material);
    }
    
    return null; // No interaction
  }
  
  /**
   * Select interaction type based on energy and material
   */
  selectInteractionType(energy, material) {
    const materialData = this.materialDatabase[material];
    if (!materialData) return null;
    
    // Calculate relative probabilities for each interaction type
    const probabilities = {
      photoelectric: 0,
      compton: 0,
      rayleigh: 0,
      pairProduction: 0
    };
    
    // Sum over all elements in material
    materialData.composition.forEach(component => {
      const Z = component.atomicNumber;
      const massFraction = component.massFraction;
      
      probabilities.photoelectric += this.crossSections.photoelectric(energy, Z) * massFraction;
      probabilities.compton += this.crossSections.compton(energy) * massFraction;
      probabilities.rayleigh += this.crossSections.rayleigh(energy, Z) * massFraction;
      probabilities.pairProduction += this.crossSections.pairProduction(energy) * massFraction;
    });
    
    // Normalize probabilities
    const total = Object.values(probabilities).reduce((sum, prob) => sum + prob, 0);
    if (total === 0) return null;
    
    Object.keys(probabilities).forEach(key => {
      probabilities[key] /= total;
    });
    
    // Select interaction type based on probabilities
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const [interactionType, probability] of Object.entries(probabilities)) {
      cumulativeProbability += probability;
      if (random <= cumulativeProbability) {
        return this.executeInteraction(interactionType, energy, material);
      }
    }
    
    return null;
  }
  
  /**
   * Execute specific interaction type
   */
  executeInteraction(interactionType, energy, material) {
    const interaction = {
      type: interactionType,
      energy: energy,
      material: material,
      timestamp: Date.now(),
      position: new THREE.Vector3(),
      secondaryParticles: []
    };
    
    switch (interactionType) {
      case 'photoelectric':
        return this.executePhotoelectricAbsorption(interaction);
      case 'compton':
        return this.executeComptonScattering(interaction);
      case 'rayleigh':
        return this.executeRayleighScattering(interaction);
      case 'pairProduction':
        return this.executePairProduction(interaction);
      default:
        return null;
    }
  }
  
  /**
   * Execute photoelectric absorption
   */
  executePhotoelectricAbsorption(interaction) {
    const energy = interaction.energy;
    const materialData = this.materialDatabase[interaction.material];
    
    // Photoelectric absorption results in complete energy absorption
    // and potential fluorescence emission
    interaction.energyDeposited = energy;
    interaction.scatteredEnergy = 0;
    
    // Check for fluorescence (simplified)
    if (energy > 0.01) { // Above 10 keV
      const fluorescenceEnergy = this.calculateFluorescenceEnergy(materialData);
      if (fluorescenceEnergy > 0) {
        interaction.secondaryParticles.push({
          type: 'fluorescence',
          energy: fluorescenceEnergy,
          direction: this.generateRandomDirection()
        });
      }
    }
    
    return interaction;
  }
  
  /**
   * Execute Compton scattering
   */
  executeComptonScattering(interaction) {
    const energy = interaction.energy;
    const alpha = energy / this.constants.ELECTRON_MASS;
    
    // Calculate scattered photon energy using Compton formula
    const cosTheta = this.generateComptonScatteringAngle(alpha);
    const scatteredEnergy = energy / (1 + alpha * (1 - cosTheta));
    
    // Calculate electron energy
    const electronEnergy = energy - scatteredEnergy;
    
    interaction.energyDeposited = electronEnergy;
    interaction.scatteredEnergy = scatteredEnergy;
    interaction.scatteringAngle = Math.acos(cosTheta);
    
    // Generate scattered photon direction
    interaction.scatteredDirection = this.generateRandomDirection();
    
    // Add secondary electron
    interaction.secondaryParticles.push({
      type: 'electron',
      energy: electronEnergy,
      direction: this.generateRandomDirection()
    });
    
    return interaction;
  }
  
  /**
   * Execute Rayleigh scattering
   */
  executeRayleighScattering(interaction) {
    // Rayleigh scattering: no energy loss, only direction change
    interaction.energyDeposited = 0;
    interaction.scatteredEnergy = interaction.energy;
    interaction.scatteringAngle = this.generateRayleighScatteringAngle();
    interaction.scatteredDirection = this.generateRandomDirection();
    
    return interaction;
  }
  
  /**
   * Execute pair production
   */
  executePairProduction(interaction) {
    const energy = interaction.energy;
    const threshold = 1.022; // MeV
    
    if (energy < threshold) return null;
    
    // Pair production: photon → electron + positron
    const excessEnergy = energy - threshold;
    
    // Distribute excess energy between electron and positron
    const electronEnergy = threshold / 2 + excessEnergy * Math.random();
    const positronEnergy = energy - electronEnergy;
    
    interaction.energyDeposited = electronEnergy + positronEnergy;
    interaction.scatteredEnergy = 0; // No scattered photon
    
    // Add secondary particles
    interaction.secondaryParticles.push({
      type: 'electron',
      energy: electronEnergy,
      direction: this.generateRandomDirection()
    });
    
    interaction.secondaryParticles.push({
      type: 'positron',
      energy: positronEnergy,
      direction: this.generateRandomDirection()
    });
    
    return interaction;
  }
  
  /**
   * Generate Compton scattering angle
   */
  generateComptonScatteringAngle(alpha) {
    // Use Klein-Nishina differential cross-section
    const random = Math.random();
    
    // Simplified sampling (in production, use proper rejection sampling)
    const cosTheta = 1 - (2 * random) / (1 + 2 * alpha);
    return Math.max(-1, Math.min(1, cosTheta));
  }
  
  /**
   * Generate Rayleigh scattering angle
   */
  generateRayleighScatteringAngle() {
    // Rayleigh scattering favors forward scattering
    return Math.random() * Math.PI * 0.1; // Small angles
  }
  
  /**
   * Generate random direction vector
   */
  generateRandomDirection() {
    const phi = Math.random() * 2 * Math.PI;
    const cosTheta = 2 * Math.random() - 1;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    
    return new THREE.Vector3(
      sinTheta * Math.cos(phi),
      sinTheta * Math.sin(phi),
      cosTheta
    );
  }
  
  /**
   * Calculate fluorescence energy
   */
  calculateFluorescenceEnergy(materialData) {
    // Simplified fluorescence calculation
    if (materialData.kEdge && materialData.kEdge > 0) {
      return materialData.kEdge * 0.8; // Approximate K-alpha energy
    }
    return 0;
  }
  
  /**
   * Run Monte Carlo simulation
   */
  runSimulation(config) {
    const {
      sourcePosition,
      sourceEnergy,
      sourceDirection,
      numberOfPhotons,
      materials,
      maxDistance
    } = config;
    
    this.isSimulating = true;
    this.simulationResults = [];
    this.photonPaths = [];
    
    
    // Validate simulation parameters
    if (!numberOfPhotons || numberOfPhotons <= 0) {
      console.error('Invalid number of photons:', numberOfPhotons);
      return [];
    }
    
    if (!sourceEnergy || sourceEnergy <= 0) {
      console.error('Invalid source energy:', sourceEnergy);
      return [];
    }
    
    // Convert plain objects to Three.js Vector3 instances
    const startPosition = new THREE.Vector3(
      sourcePosition?.x || 0, 
      sourcePosition?.y || 0, 
      sourcePosition?.z || 0
    );
    const startDirection = new THREE.Vector3(
      sourceDirection?.x || 1, 
      sourceDirection?.y || 0, 
      sourceDirection?.z || 0
    ).normalize();
    
    for (let i = 0; i < numberOfPhotons; i++) {
      const photon = {
        id: i,
        energy: sourceEnergy,
        position: startPosition.clone(),
        direction: startDirection.clone(),
        path: [startPosition.clone()]
      };
      
      const photonResult = this.trackPhoton(photon, materials, maxDistance);
      this.simulationResults.push(photonResult);
      
      // Update progress
      if (i % 100 === 0) {
        this.callbacks?.onSimulationProgress?.(i / numberOfPhotons);
      }
    }
    
    this.isSimulating = false;
    this.callbacks?.onSimulationComplete?.(this.simulationResults);
    
    return this.simulationResults;
  }
  
  /**
   * Track individual photon through materials
   */
  trackPhoton(photon, materials, maxDistance) {
    const result = {
      photonId: photon.id,
      interactions: [],
      finalEnergy: photon.energy,
      totalDistance: 0,
      absorbed: false
    };
    
    let currentPosition = photon.position.clone();
    let currentDirection = photon.direction.clone();
    let currentEnergy = photon.energy;
    
    while (currentEnergy > 0.001 && result.totalDistance < maxDistance) { // 1 keV threshold
      // Find next material boundary
      const nextInteraction = this.findNextInteraction(
        currentPosition,
        currentDirection,
        materials,
        currentEnergy
      );
      
      if (!nextInteraction) break;
      
      // Update position
      currentPosition.add(
        currentDirection.clone().multiplyScalar(nextInteraction.distance)
      );
      result.totalDistance += nextInteraction.distance;
      
      // Execute interaction
      const interaction = this.simulatePhotonInteraction(
        { energy: currentEnergy },
        nextInteraction.material,
        nextInteraction.distance
      );
      
      if (interaction) {
        interaction.position = currentPosition.clone();
        result.interactions.push(interaction);
        
        // Update energy based on interaction
        if (interaction.scatteredEnergy > 0) {
          currentEnergy = interaction.scatteredEnergy;
          currentDirection = interaction.scatteredDirection;
        } else {
          // Photoelectric absorption or pair production
          result.absorbed = true;
          break;
        }
      }
    }
    
    result.finalEnergy = currentEnergy;
    return result;
  }
  
  /**
   * Find next interaction point
   */
  findNextInteraction(position, direction, materials, energy) {
    // Simplified: assume uniform material
    // In production, implement proper ray-marching through heterogeneous materials
    
    const material = materials[0] || 'Air'; // Default material
    const attenuationCoeff = this.calculateAttenuationCoefficient(material, energy);
    
    if (attenuationCoeff <= 0) return null;
    
    // Mean free path
    const meanFreePath = 1 / attenuationCoeff;
    
    // Sample distance to next interaction
    const distance = -meanFreePath * Math.log(Math.random());
    
    return {
      material: material,
      distance: distance
    };
  }
  
  /**
   * Create visualization of simulation results
   */
  createVisualization() {
    this.clearVisualization();
    
    if (!this.refs.sceneGroupRef.current) return;
    
    // Create photon path visualization
    this.simulationResults.forEach(result => {
      if (result.interactions.length > 0) {
        this.createPhotonPathVisualization(result);
      }
    });
    
    // Create interaction point markers
    this.createInteractionMarkers();
    
    // Create energy deposition visualization
    this.createEnergyDepositionVisualization();
  }
  
  /**
   * Create photon path visualization
   */
  createPhotonPathVisualization(result) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    // Add path points
    result.interactions.forEach((interaction, index) => {
      positions.push(interaction.position.x, interaction.position.y, interaction.position.z);
      
      // Color based on interaction type
      const color = this.getInteractionColor(interaction.type);
      colors.push(color.r, color.g, color.b);
    });
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });
    
    const line = new THREE.Line(geometry, material);
    this.refs.sceneGroupRef.current.add(line);
    this.photonTrails.push(line);
  }
  
  /**
   * Create interaction markers
   */
  createInteractionMarkers() {
    this.simulationResults.forEach(result => {
      result.interactions.forEach(interaction => {
        const geometry = new THREE.SphereGeometry(0.05, 8, 6);
        const color = this.getInteractionColor(interaction.type);
        const material = new THREE.MeshBasicMaterial({ color: color });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(interaction.position);
        
        this.refs.sceneGroupRef.current.add(marker);
        this.interactionMarkers.push(marker);
      });
    });
  }
  
  /**
   * Create energy deposition visualization
   */
  createEnergyDepositionVisualization() {
    // Create heat map of energy deposition
    const energyMap = new Map();
    
    this.simulationResults.forEach(result => {
      result.interactions.forEach(interaction => {
        const key = `${Math.floor(interaction.position.x)},${Math.floor(interaction.position.y)},${Math.floor(interaction.position.z)}`;
        const currentEnergy = energyMap.get(key) || 0;
        energyMap.set(key, currentEnergy + interaction.energyDeposited);
      });
    });
    
    // Create visualization cubes for high energy deposition areas
    energyMap.forEach((energy, key) => {
      if (energy > 0.1) { // Threshold for visualization
        const [x, y, z] = key.split(',').map(Number);
        
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const intensity = Math.min(energy / 1.0, 1.0); // Normalize to 1 MeV
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(intensity, 0, 1 - intensity),
          transparent: true,
          opacity: 0.7
        });
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        
        this.refs.sceneGroupRef.current.add(cube);
        this.interactionMarkers.push(cube);
      }
    });
  }
  
  /**
   * Get color for interaction type
   */
  getInteractionColor(interactionType) {
    const colors = {
      photoelectric: new THREE.Color(0xff0000), // Red
      compton: new THREE.Color(0x00ff00),       // Green
      rayleigh: new THREE.Color(0x0000ff),      // Blue
      pairProduction: new THREE.Color(0xffff00), // Yellow
      fluorescence: new THREE.Color(0xff00ff)    // Magenta
    };
    
    return colors[interactionType] || new THREE.Color(0xffffff);
  }
  
  /**
   * Clear visualization
   */
  clearVisualization() {
    // Remove photon trails
    this.photonTrails.forEach(trail => {
      this.refs.sceneGroupRef.current.remove(trail);
      trail.geometry.dispose();
      trail.material.dispose();
    });
    this.photonTrails = [];
    
    // Remove interaction markers
    this.interactionMarkers.forEach(marker => {
      this.refs.sceneGroupRef.current.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
    });
    this.interactionMarkers = [];
  }
  
  /**
   * Export simulation results
   */
  exportResults(format = 'json') {
    const exportData = {
      timestamp: new Date().toISOString(),
      energyRange: this.energyRange,
      simulationResults: this.simulationResults,
      summary: this.generateSummary()
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    return exportData;
  }
  
  /**
   * Generate simulation summary
   */
  generateSummary() {
    const summary = {
      totalPhotons: this.simulationResults.length,
      totalInteractions: 0,
      interactionTypes: {},
      averageEnergy: 0,
      energyDeposited: 0
    };
    
    this.simulationResults.forEach(result => {
      summary.totalInteractions += result.interactions.length;
      
      result.interactions.forEach(interaction => {
        const type = interaction.type;
        summary.interactionTypes[type] = (summary.interactionTypes[type] || 0) + 1;
        summary.energyDeposited += interaction.energyDeposited || 0;
      });
    });
    
    summary.averageEnergy = summary.energyDeposited / summary.totalInteractions;
    
    return summary;
  }
  
  /**
   * Cleanup
   */
  cleanup() {
    this.clearVisualization();
    this.isSimulating = false;
    this.simulationResults = [];
    this.photonPaths = [];
  }
}
