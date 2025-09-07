/**
 * Material Database Manager
 * Handles material properties, cross-sections, and attenuation calculations
 */
export default class MaterialDatabaseManager {
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
        const alpha = E / this.modules.physicsConstants.constants.ELECTRON_MASS; // E/mc²
        
        // Klein-Nishina cross-section per electron (cm²)
        const sigma_0 = 2 * Math.PI * Math.pow(this.modules.physicsConstants.getClassicalElectronRadiusCm(), 2);
        
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
        const threshold = this.modules.physicsConstants.getPairProductionThreshold();
        
        if (E < threshold) return 0;
        
        // Approximate pair production cross-section
        const excess = E - threshold;
        return excess * 1e-25; // Simplified model
      }
    };
  }
  
  /**
   * Get material data by name
   */
  getMaterialData(materialName) {
    const materialDatabase = this.initializeMaterialDatabase();
    return materialDatabase[materialName] || null;
  }
  
  /**
   * Get all available materials
   */
  getAvailableMaterials() {
    const materialDatabase = this.initializeMaterialDatabase();
    return Object.keys(materialDatabase);
  }
  
  /**
   * Add new material to database
   */
  addMaterial(materialName, materialData) {
    // This would typically update a persistent database
    // For now, we'll just validate the data structure
    if (!materialData.density || !materialData.composition) {
      throw new Error('Invalid material data: missing density or composition');
    }
    
    if (!Array.isArray(materialData.composition)) {
      throw new Error('Invalid material data: composition must be an array');
    }
    
    // Validate composition fractions sum to 1
    const totalFraction = materialData.composition.reduce((sum, comp) => sum + comp.massFraction, 0);
    if (Math.abs(totalFraction - 1.0) > 0.01) {
      throw new Error('Invalid material data: mass fractions must sum to 1.0');
    }
    
    return true; // Material validated successfully
  }
  
  /**
   * Calculate total attenuation coefficient for a material
   */
  calculateAttenuationCoefficient(material, energy) {
    const materialData = this.getMaterialData(material);
    if (!materialData) return 0;
    
    const crossSections = this.initializeCrossSections();
    let totalCrossSection = 0;
    
    materialData.composition.forEach(component => {
      const atomicNumber = component.atomicNumber;
      const massFraction = component.massFraction;
      
      // Photoelectric absorption
      const sigma_pe = crossSections.photoelectric(energy, atomicNumber);
      
      // Compton scattering
      const sigma_compton = crossSections.compton(energy);
      
      // Rayleigh scattering
      const sigma_rayleigh = crossSections.rayleigh(energy, atomicNumber);
      
      // Pair production (only for high energies)
      const sigma_pair = crossSections.pairProduction(energy);
      
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
   * Calculate mean free path for a material and energy
   */
  calculateMeanFreePath(material, energy) {
    const attenuationCoeff = this.calculateAttenuationCoefficient(material, energy);
    return attenuationCoeff > 0 ? 1 / attenuationCoeff : Infinity;
  }
  
  /**
   * Calculate interaction probability over a distance
   */
  calculateInteractionProbability(material, energy, distance) {
    const attenuationCoeff = this.calculateAttenuationCoefficient(material, energy);
    return 1 - Math.exp(-attenuationCoeff * distance);
  }
  
  /**
   * Sample distance to next interaction
   */
  sampleInteractionDistance(material, energy) {
    const meanFreePath = this.calculateMeanFreePath(material, energy);
    if (meanFreePath === Infinity) return Infinity;
    
    // Sample from exponential distribution
    return -meanFreePath * Math.log(Math.random());
  }
  
  /**
   * Get material density
   */
  getMaterialDensity(material) {
    const materialData = this.getMaterialData(material);
    return materialData ? materialData.density : 0;
  }
  
  /**
   * Get K-edge energy for material
   */
  getMaterialKEdge(material) {
    const materialData = this.getMaterialData(material);
    return materialData ? materialData.kEdge : null;
  }
}
