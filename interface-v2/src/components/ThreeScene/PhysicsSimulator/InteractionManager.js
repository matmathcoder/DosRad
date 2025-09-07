/**
 * Interaction Manager
 * Handles photon interaction calculations and execution
 */
export default class InteractionManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by main PhysicsSimulator
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  /**
   * Simulate photon interaction using Monte Carlo method
   */
  simulatePhotonInteraction(photon, material, distance) {
    const energy = photon.energy;
    const interactionProbability = this.modules.materialDatabaseManager.calculateInteractionProbability(material, energy, distance);
    
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
    const materialData = this.modules.materialDatabaseManager.getMaterialData(material);
    if (!materialData) return null;
    
    const crossSections = this.modules.materialDatabaseManager.initializeCrossSections();
    
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
      
      probabilities.photoelectric += crossSections.photoelectric(energy, Z) * massFraction;
      probabilities.compton += crossSections.compton(energy) * massFraction;
      probabilities.rayleigh += crossSections.rayleigh(energy, Z) * massFraction;
      probabilities.pairProduction += crossSections.pairProduction(energy) * massFraction;
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
      position: { x: 0, y: 0, z: 0 },
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
    const materialData = this.modules.materialDatabaseManager.getMaterialData(interaction.material);
    
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
          direction: this.modules.physicsConstants.generateRandomDirection()
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
    const alpha = this.modules.physicsConstants.calculateAlpha(energy);
    
    // Calculate scattered photon energy using Compton formula
    const cosTheta = this.generateComptonScatteringAngle(alpha);
    const scatteredEnergy = energy / (1 + alpha * (1 - cosTheta));
    
    // Calculate electron energy
    const electronEnergy = energy - scatteredEnergy;
    
    interaction.energyDeposited = electronEnergy;
    interaction.scatteredEnergy = scatteredEnergy;
    interaction.scatteringAngle = Math.acos(cosTheta);
    
    // Generate scattered photon direction
    interaction.scatteredDirection = this.modules.physicsConstants.generateRandomDirection();
    
    // Add secondary electron
    interaction.secondaryParticles.push({
      type: 'electron',
      energy: electronEnergy,
      direction: this.modules.physicsConstants.generateRandomDirection()
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
    interaction.scatteredDirection = this.modules.physicsConstants.generateRandomDirection();
    
    return interaction;
  }
  
  /**
   * Execute pair production
   */
  executePairProduction(interaction) {
    const energy = interaction.energy;
    const threshold = this.modules.physicsConstants.getPairProductionThreshold();
    
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
      direction: this.modules.physicsConstants.generateRandomDirection()
    });
    
    interaction.secondaryParticles.push({
      type: 'positron',
      energy: positronEnergy,
      direction: this.modules.physicsConstants.generateRandomDirection()
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
   * Calculate interaction cross-section for specific type
   */
  calculateInteractionCrossSection(interactionType, energy, material, atomicNumber = null) {
    const crossSections = this.modules.materialDatabaseManager.initializeCrossSections();
    
    switch (interactionType) {
      case 'photoelectric':
        return atomicNumber ? crossSections.photoelectric(energy, atomicNumber) : 0;
      case 'compton':
        return crossSections.compton(energy);
      case 'rayleigh':
        return atomicNumber ? crossSections.rayleigh(energy, atomicNumber) : 0;
      case 'pairProduction':
        return crossSections.pairProduction(energy);
      default:
        return 0;
    }
  }
  
  /**
   * Get interaction probability for specific type
   */
  getInteractionProbability(interactionType, energy, material) {
    const materialData = this.modules.materialDatabaseManager.getMaterialData(material);
    if (!materialData) return 0;
    
    let totalCrossSection = 0;
    
    materialData.composition.forEach(component => {
      const crossSection = this.calculateInteractionCrossSection(
        interactionType, 
        energy, 
        material, 
        component.atomicNumber
      );
      totalCrossSection += crossSection * component.massFraction;
    });
    
    const linearAttenuation = totalCrossSection * materialData.density;
    return linearAttenuation;
  }
  
  /**
   * Validate interaction result
   */
  validateInteraction(interaction) {
    if (!interaction || !interaction.type || !interaction.energy) {
      return false;
    }
    
    const validTypes = ['photoelectric', 'compton', 'rayleigh', 'pairProduction'];
    if (!validTypes.includes(interaction.type)) {
      return false;
    }
    
    if (interaction.energy < 0) {
      return false;
    }
    
    return true;
  }
}
