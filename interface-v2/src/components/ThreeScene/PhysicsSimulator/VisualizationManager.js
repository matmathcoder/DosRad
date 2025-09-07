import * as THREE from 'three';

/**
 * Visualization Manager
 * Handles simulation result visualization and rendering
 */
export default class VisualizationManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by main PhysicsSimulator
    
    // Visualization objects
    this.photonTrails = [];
    this.interactionMarkers = [];
    this.energyDepositionVisualization = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  /**
   * Create visualization of simulation results
   */
  createVisualization() {
    this.clearVisualization();
    
    if (!this.refs.sceneGroupRef.current) return;
    
    const simulationResults = this.modules.simulationEngine.getSimulationResults();
    
    // Create photon path visualization
    simulationResults.forEach(result => {
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
    const simulationResults = this.modules.simulationEngine.getSimulationResults();
    
    simulationResults.forEach(result => {
      result.interactions.forEach(interaction => {
        const geometry = new THREE.SphereGeometry(0.05, 8, 6);
        const color = this.getInteractionColor(interaction.type);
        const material = new THREE.MeshBasicMaterial({ color: color });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(interaction.position.x, interaction.position.y, interaction.position.z);
        
        this.refs.sceneGroupRef.current.add(marker);
        this.interactionMarkers.push(marker);
      });
    });
  }
  
  /**
   * Create energy deposition visualization
   */
  createEnergyDepositionVisualization() {
    const simulationResults = this.modules.simulationEngine.getSimulationResults();
    
    // Create heat map of energy deposition
    const energyMap = new Map();
    
    simulationResults.forEach(result => {
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
   * Create photon beam visualization
   */
  createPhotonBeamVisualization(sourcePosition, direction, energy, numberOfPhotons = 100) {
    this.clearVisualization();
    
    if (!this.refs.sceneGroupRef.current) return;
    
    // Create beam visualization
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: this.getEnergyColor(energy),
      transparent: true,
      opacity: 0.3
    });
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.copy(sourcePosition);
    beam.lookAt(
      sourcePosition.x + direction.x,
      sourcePosition.y + direction.y,
      sourcePosition.z + direction.z
    );
    
    this.refs.sceneGroupRef.current.add(beam);
    this.photonTrails.push(beam);
  }
  
  /**
   * Get color based on photon energy
   */
  getEnergyColor(energy) {
    // Map energy to color spectrum (low energy = red, high energy = blue)
    const normalizedEnergy = (energy - 0.015) / (10.0 - 0.015); // Normalize to 0-1
    const hue = (1 - normalizedEnergy) * 240; // Red to blue spectrum
    
    return new THREE.Color().setHSL(hue / 360, 1, 0.5);
  }
  
  /**
   * Create material visualization
   */
  createMaterialVisualization(materials) {
    materials.forEach((material, index) => {
      const materialData = this.modules.materialDatabaseManager.getMaterialData(material);
      if (!materialData) return;
      
      // Create material indicator
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const materialColor = this.getMaterialColor(material);
      const materialMesh = new THREE.MeshBasicMaterial({
        color: materialColor,
        transparent: true,
        opacity: 0.5
      });
      
      const materialBox = new THREE.Mesh(geometry, materialMesh);
      materialBox.position.set(index * 2, 0, 0);
      
      this.refs.sceneGroupRef.current.add(materialBox);
      this.interactionMarkers.push(materialBox);
    });
  }
  
  /**
   * Get color for material type
   */
  getMaterialColor(material) {
    const colors = {
      'Air': new THREE.Color(0x87CEEB),    // Sky blue
      'Water': new THREE.Color(0x4169E1), // Royal blue
      'Lead': new THREE.Color(0x2F4F4F),  // Dark slate gray
      'Iron': new THREE.Color(0x708090),  // Steel gray
      'Concrete': new THREE.Color(0x8B7355), // Concrete brown
      'Steel': new THREE.Color(0x708090)   // Steel gray
    };
    
    return colors[material] || new THREE.Color(0x404040);
  }
  
  /**
   * Create attenuation visualization
   */
  createAttenuationVisualization(materialName, energy, distance) {
    const attenuationCoeff = this.modules.materialDatabaseManager.calculateAttenuationCoefficient(materialName, energy);
    
    // Create visualization showing exponential decay
    const points = [];
    const colors = [];
    
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * distance;
      const intensity = Math.exp(-attenuationCoeff * x);
      
      points.push(x, 0, 0);
      colors.push(intensity, intensity, intensity);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 3
    });
    
    const line = new THREE.Line(geometry, lineMaterial);
    this.refs.sceneGroupRef.current.add(line);
    this.photonTrails.push(line);
  }
  
  /**
   * Update visualization based on simulation progress
   */
  updateVisualization(progress) {
    // Update visualization elements based on simulation progress
    this.photonTrails.forEach(trail => {
      if (trail.material && trail.material.opacity !== undefined) {
        trail.material.opacity = Math.min(0.8, progress * 0.8);
      }
    });
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
   * Export visualization data
   */
  exportVisualizationData() {
    return {
      photonTrails: this.photonTrails.length,
      interactionMarkers: this.interactionMarkers.length,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Set visualization opacity
   */
  setVisualizationOpacity(opacity) {
    this.photonTrails.forEach(trail => {
      if (trail.material && trail.material.opacity !== undefined) {
        trail.material.opacity = opacity;
      }
    });
    
    this.interactionMarkers.forEach(marker => {
      if (marker.material && marker.material.opacity !== undefined) {
        marker.material.opacity = opacity;
      }
    });
  }
  
  /**
   * Toggle visualization visibility
   */
  toggleVisualizationVisibility(visible) {
    this.photonTrails.forEach(trail => {
      trail.visible = visible;
    });
    
    this.interactionMarkers.forEach(marker => {
      marker.visible = visible;
    });
  }
}
