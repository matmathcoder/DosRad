/**
 * Simulation Engine
 * Handles Monte Carlo simulation logic and photon tracking
 */
export default class SimulationEngine {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by main PhysicsSimulator
    
    // Simulation state
    this.isSimulating = false;
    this.simulationResults = [];
    this.photonPaths = [];
    this.interactionPoints = [];
  }
  
  setModules(modules) {
    this.modules = modules;
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
    
    // Validate energy is within simulation range
    if (!this.modules.physicsConstants.validateEnergy(sourceEnergy)) {
      console.error('Source energy outside simulation range:', sourceEnergy);
      return [];
    }
    
    // Convert plain objects to position/direction objects
    const startPosition = {
      x: sourcePosition?.x || 0, 
      y: sourcePosition?.y || 0, 
      z: sourcePosition?.z || 0
    };
    const startDirection = this.modules.physicsConstants.normalizeVector({
      x: sourceDirection?.x || 1, 
      y: sourceDirection?.y || 0, 
      z: sourceDirection?.z || 0
    });
    
    for (let i = 0; i < numberOfPhotons; i++) {
      const photon = {
        id: i,
        energy: sourceEnergy,
        position: { ...startPosition },
        direction: { ...startDirection },
        path: [{ ...startPosition }]
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
    
    let currentPosition = { ...photon.position };
    let currentDirection = { ...photon.direction };
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
      currentPosition.x += currentDirection.x * nextInteraction.distance;
      currentPosition.y += currentDirection.y * nextInteraction.distance;
      currentPosition.z += currentDirection.z * nextInteraction.distance;
      result.totalDistance += nextInteraction.distance;
      
      // Execute interaction
      const interaction = this.modules.interactionManager.simulatePhotonInteraction(
        { energy: currentEnergy },
        nextInteraction.material,
        nextInteraction.distance
      );
      
      if (interaction) {
        interaction.position = { ...currentPosition };
        result.interactions.push(interaction);
        
        // Update energy based on interaction
        if (interaction.scatteredEnergy > 0) {
          currentEnergy = interaction.scatteredEnergy;
          currentDirection = { ...interaction.scatteredDirection };
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
    const distance = this.modules.materialDatabaseManager.sampleInteractionDistance(material, energy);
    
    if (distance === Infinity) return null;
    
    return {
      material: material,
      distance: distance
    };
  }
  
  /**
   * Stop current simulation
   */
  stopSimulation() {
    this.isSimulating = false;
    this.callbacks?.onSimulationStopped?.();
  }
  
  /**
   * Pause simulation
   */
  pauseSimulation() {
    this.isSimulating = false;
    this.callbacks?.onSimulationPaused?.();
  }
  
  /**
   * Resume simulation
   */
  resumeSimulation() {
    this.isSimulating = true;
    this.callbacks?.onSimulationResumed?.();
  }
  
  /**
   * Get simulation status
   */
  getSimulationStatus() {
    return {
      isSimulating: this.isSimulating,
      resultsCount: this.simulationResults.length,
      hasResults: this.simulationResults.length > 0
    };
  }
  
  /**
   * Get simulation results
   */
  getSimulationResults() {
    return [...this.simulationResults];
  }
  
  /**
   * Clear simulation results
   */
  clearResults() {
    this.simulationResults = [];
    this.photonPaths = [];
    this.interactionPoints = [];
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
      energyDeposited: 0,
      absorbedPhotons: 0,
      transmittedPhotons: 0
    };
    
    this.simulationResults.forEach(result => {
      summary.totalInteractions += result.interactions.length;
      
      if (result.absorbed) {
        summary.absorbedPhotons++;
      } else {
        summary.transmittedPhotons++;
      }
      
      result.interactions.forEach(interaction => {
        const type = interaction.type;
        summary.interactionTypes[type] = (summary.interactionTypes[type] || 0) + 1;
        summary.energyDeposited += interaction.energyDeposited || 0;
      });
    });
    
    summary.averageEnergy = summary.totalInteractions > 0 ? 
      summary.energyDeposited / summary.totalInteractions : 0;
    
    return summary;
  }
  
  /**
   * Export simulation results
   */
  exportResults(format = 'json') {
    const exportData = {
      timestamp: new Date().toISOString(),
      energyRange: this.modules.physicsConstants.energyRange,
      simulationResults: this.simulationResults,
      summary: this.generateSummary()
    };
    
    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    return exportData;
  }
  
  /**
   * Validate simulation configuration
   */
  validateSimulationConfig(config) {
    const errors = [];
    
    if (!config.sourcePosition) {
      errors.push('Source position is required');
    }
    
    if (!config.sourceEnergy || config.sourceEnergy <= 0) {
      errors.push('Valid source energy is required');
    }
    
    if (!config.numberOfPhotons || config.numberOfPhotons <= 0) {
      errors.push('Valid number of photons is required');
    }
    
    if (!config.materials || config.materials.length === 0) {
      errors.push('At least one material is required');
    }
    
    if (config.maxDistance && config.maxDistance <= 0) {
      errors.push('Max distance must be positive');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Calculate simulation statistics
   */
  calculateStatistics() {
    if (this.simulationResults.length === 0) {
      return null;
    }
    
    const energies = this.simulationResults.map(r => r.finalEnergy);
    const distances = this.simulationResults.map(r => r.totalDistance);
    const interactionCounts = this.simulationResults.map(r => r.interactions.length);
    
    return {
      energy: {
        min: Math.min(...energies),
        max: Math.max(...energies),
        mean: energies.reduce((a, b) => a + b, 0) / energies.length,
        median: energies.sort((a, b) => a - b)[Math.floor(energies.length / 2)]
      },
      distance: {
        min: Math.min(...distances),
        max: Math.max(...distances),
        mean: distances.reduce((a, b) => a + b, 0) / distances.length,
        median: distances.sort((a, b) => a - b)[Math.floor(distances.length / 2)]
      },
      interactions: {
        min: Math.min(...interactionCounts),
        max: Math.max(...interactionCounts),
        mean: interactionCounts.reduce((a, b) => a + b, 0) / interactionCounts.length,
        median: interactionCounts.sort((a, b) => a - b)[Math.floor(interactionCounts.length / 2)]
      }
    };
  }
}
