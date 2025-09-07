import PhysicsConstants from './PhysicsConstants.js';
import MaterialDatabaseManager from './MaterialDatabaseManager.js';
import InteractionManager from './InteractionManager.js';
import SimulationEngine from './SimulationEngine.js';
import VisualizationManager from './VisualizationManager.js';

/**
 * Advanced X-ray Physics Simulation Engine
 * Implements Monte Carlo simulation of X-ray interactions over 15 keV - 10 MeV energy range
 */
export default class PhysicsSimulator {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by ThreeScene
    
    // Initialize all sub-managers
    this.physicsConstants = new PhysicsConstants(refs, state, callbacks);
    this.materialDatabaseManager = new MaterialDatabaseManager(refs, state, callbacks);
    this.interactionManager = new InteractionManager(refs, state, callbacks);
    this.simulationEngine = new SimulationEngine(refs, state, callbacks);
    this.visualizationManager = new VisualizationManager(refs, state, callbacks);
  }
  
  setModules(modules) {
    this.modules = modules;
    
    // Create a modules object that includes all managers for cross-referencing
    const modulesWithManagers = {
      ...modules,
      physicsConstants: this.physicsConstants,
      materialDatabaseManager: this.materialDatabaseManager,
      interactionManager: this.interactionManager,
      simulationEngine: this.simulationEngine,
      visualizationManager: this.visualizationManager,
      physicsSimulator: this // Include self-reference
    };
    
    // Pass modules to all managers
    this.physicsConstants.setModules(modulesWithManagers);
    this.materialDatabaseManager.setModules(modulesWithManagers);
    this.interactionManager.setModules(modulesWithManagers);
    this.simulationEngine.setModules(modulesWithManagers);
    this.visualizationManager.setModules(modulesWithManagers);
  }
  
  // Physics Constants Methods
  get constants() {
    return this.physicsConstants.constants;
  }
  
  get energyRange() {
    return this.physicsConstants.energyRange;
  }
  
  keVToMeV(keV) {
    return this.physicsConstants.keVToMeV(keV);
  }
  
  meVToKeV(meV) {
    return this.physicsConstants.meVToKeV(meV);
  }
  
  energyToWavelength(energy) {
    return this.physicsConstants.energyToWavelength(energy);
  }
  
  wavelengthToEnergy(wavelength) {
    return this.physicsConstants.wavelengthToEnergy(wavelength);
  }
  
  // Material Database Methods
  getMaterialData(materialName) {
    return this.materialDatabaseManager.getMaterialData(materialName);
  }
  
  getAvailableMaterials() {
    return this.materialDatabaseManager.getAvailableMaterials();
  }
  
  addMaterial(materialName, materialData) {
    return this.materialDatabaseManager.addMaterial(materialName, materialData);
  }
  
  calculateAttenuationCoefficient(material, energy) {
    return this.materialDatabaseManager.calculateAttenuationCoefficient(material, energy);
  }
  
  calculateMeanFreePath(material, energy) {
    return this.materialDatabaseManager.calculateMeanFreePath(material, energy);
  }
  
  calculateInteractionProbability(material, energy, distance) {
    return this.materialDatabaseManager.calculateInteractionProbability(material, energy, distance);
  }
  
  sampleInteractionDistance(material, energy) {
    return this.materialDatabaseManager.sampleInteractionDistance(material, energy);
  }
  
  getMaterialDensity(material) {
    return this.materialDatabaseManager.getMaterialDensity(material);
  }
  
  getMaterialKEdge(material) {
    return this.materialDatabaseManager.getMaterialKEdge(material);
  }
  
  // Interaction Manager Methods
  simulatePhotonInteraction(photon, material, distance) {
    return this.interactionManager.simulatePhotonInteraction(photon, material, distance);
  }
  
  selectInteractionType(energy, material) {
    return this.interactionManager.selectInteractionType(energy, material);
  }
  
  executeInteraction(interactionType, energy, material) {
    return this.interactionManager.executeInteraction(interactionType, energy, material);
  }
  
  calculateInteractionCrossSection(interactionType, energy, material, atomicNumber = null) {
    return this.interactionManager.calculateInteractionCrossSection(interactionType, energy, material, atomicNumber);
  }
  
  getInteractionProbability(interactionType, energy, material) {
    return this.interactionManager.getInteractionProbability(interactionType, energy, material);
  }
  
  validateInteraction(interaction) {
    return this.interactionManager.validateInteraction(interaction);
  }
  
  // Simulation Engine Methods
  runSimulation(config) {
    return this.simulationEngine.runSimulation(config);
  }
  
  stopSimulation() {
    return this.simulationEngine.stopSimulation();
  }
  
  pauseSimulation() {
    return this.simulationEngine.pauseSimulation();
  }
  
  resumeSimulation() {
    return this.simulationEngine.resumeSimulation();
  }
  
  getSimulationStatus() {
    return this.simulationEngine.getSimulationStatus();
  }
  
  getSimulationResults() {
    return this.simulationEngine.getSimulationResults();
  }
  
  clearResults() {
    return this.simulationEngine.clearResults();
  }
  
  generateSummary() {
    return this.simulationEngine.generateSummary();
  }
  
  exportResults(format = 'json') {
    return this.simulationEngine.exportResults(format);
  }
  
  validateSimulationConfig(config) {
    return this.simulationEngine.validateSimulationConfig(config);
  }
  
  calculateStatistics() {
    return this.simulationEngine.calculateStatistics();
  }
  
  // Visualization Manager Methods
  createVisualization() {
    return this.visualizationManager.createVisualization();
  }
  
  createPhotonBeamVisualization(sourcePosition, direction, energy, numberOfPhotons = 100) {
    return this.visualizationManager.createPhotonBeamVisualization(sourcePosition, direction, energy, numberOfPhotons);
  }
  
  createMaterialVisualization(materials) {
    return this.visualizationManager.createMaterialVisualization(materials);
  }
  
  createAttenuationVisualization(materialName, energy, distance) {
    return this.visualizationManager.createAttenuationVisualization(materialName, energy, distance);
  }
  
  updateVisualization(progress) {
    return this.visualizationManager.updateVisualization(progress);
  }
  
  clearVisualization() {
    return this.visualizationManager.clearVisualization();
  }
  
  exportVisualizationData() {
    return this.visualizationManager.exportVisualizationData();
  }
  
  setVisualizationOpacity(opacity) {
    return this.visualizationManager.setVisualizationOpacity(opacity);
  }
  
  toggleVisualizationVisibility(visible) {
    return this.visualizationManager.toggleVisualizationVisibility(visible);
  }
  
  getInteractionColor(interactionType) {
    return this.visualizationManager.getInteractionColor(interactionType);
  }
  
  getEnergyColor(energy) {
    return this.visualizationManager.getEnergyColor(energy);
  }
  
  getMaterialColor(material) {
    return this.visualizationManager.getMaterialColor(material);
  }
  
  // Core Physics Simulator Methods
  /**
   * Run complete simulation with visualization
   */
  runCompleteSimulation(config) {
    // Validate configuration
    const validation = this.validateSimulationConfig(config);
    if (!validation.isValid) {
      console.error('Invalid simulation configuration:', validation.errors);
      return null;
    }
    
    // Run simulation
    const results = this.runSimulation(config);
    
    // Create visualization
    this.createVisualization();
    
    return results;
  }
  
  /**
   * Get comprehensive simulation report
   */
  getSimulationReport() {
    const status = this.getSimulationStatus();
    const summary = this.generateSummary();
    const statistics = this.calculateStatistics();
    const visualizationData = this.exportVisualizationData();
    
    return {
      status,
      summary,
      statistics,
      visualizationData,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Reset all simulation data
   */
  reset() {
    this.clearResults();
    this.clearVisualization();
  }
  
  /**
   * Cleanup
   */
  cleanup() {
    this.clearVisualization();
    this.clearResults();
  }
}
