/**
 * Physics Constants and Energy Calculations
 * Contains physical constants and utility functions for X-ray physics
 */
export default class PhysicsConstants {
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
   * Physical constants for X-ray physics calculations
   */
  get constants() {
    return {
      ELECTRON_MASS: 0.511, // MeV
      PLANCK_CONSTANT: 6.626e-34, // J⋅s
      SPEED_OF_LIGHT: 2.998e8, // m/s
      AVOGADRO_NUMBER: 6.022e23,
      CLASSICAL_ELECTRON_RADIUS: 2.818e-15, // m
      FINE_STRUCTURE_CONSTANT: 7.297e-3
    };
  }
  
  /**
   * Energy range for simulation
   */
  get energyRange() {
    return {
      min: 15e-3, // 15 keV in MeV
      max: 10.0   // 10 MeV
    };
  }
  
  /**
   * Convert keV to MeV
   */
  keVToMeV(keV) {
    return keV / 1000;
  }
  
  /**
   * Convert MeV to keV
   */
  meVToKeV(meV) {
    return meV * 1000;
  }
  
  /**
   * Calculate photon wavelength from energy
   */
  energyToWavelength(energy) {
    // E = hc/λ, so λ = hc/E
    const hc = this.constants.PLANCK_CONSTANT * this.constants.SPEED_OF_LIGHT;
    const energyJoules = energy * 1.602e-13; // Convert MeV to Joules
    return hc / energyJoules;
  }
  
  /**
   * Calculate photon energy from wavelength
   */
  wavelengthToEnergy(wavelength) {
    // E = hc/λ
    const hc = this.constants.PLANCK_CONSTANT * this.constants.SPEED_OF_LIGHT;
    const energyJoules = hc / wavelength;
    return energyJoules / 1.602e-13; // Convert Joules to MeV
  }
  
  /**
   * Calculate Klein-Nishina parameter α = E/mc²
   */
  calculateAlpha(energy) {
    return energy / this.constants.ELECTRON_MASS;
  }
  
  /**
   * Calculate classical electron radius in cm
   */
  getClassicalElectronRadiusCm() {
    return this.constants.CLASSICAL_ELECTRON_RADIUS * 100; // Convert m to cm
  }
  
  /**
   * Calculate pair production threshold energy
   */
  getPairProductionThreshold() {
    return 2 * this.constants.ELECTRON_MASS; // 1.022 MeV
  }
  
  /**
   * Validate energy is within simulation range
   */
  validateEnergy(energy) {
    return energy >= this.energyRange.min && energy <= this.energyRange.max;
  }
  
  /**
   * Generate random direction vector
   */
  generateRandomDirection() {
    const phi = Math.random() * 2 * Math.PI;
    const cosTheta = 2 * Math.random() - 1;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    
    return {
      x: sinTheta * Math.cos(phi),
      y: sinTheta * Math.sin(phi),
      z: cosTheta
    };
  }
  
  /**
   * Calculate distance between two points
   */
  calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Normalize vector
   */
  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    if (magnitude === 0) return vector;
    
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude,
      z: vector.z / magnitude
    };
  }
  
  /**
   * Calculate dot product of two vectors
   */
  dotProduct(vector1, vector2) {
    return vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
  }
  
  /**
   * Calculate cross product of two vectors
   */
  crossProduct(vector1, vector2) {
    return {
      x: vector1.y * vector2.z - vector1.z * vector2.y,
      y: vector1.z * vector2.x - vector1.x * vector2.z,
      z: vector1.x * vector2.y - vector1.y * vector2.x
    };
  }
}
