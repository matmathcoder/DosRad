import * as THREE from 'three';

export default class IndicatorManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by main GeometryManager
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  createObjectIndicator(mesh) {
    if (!mesh || !this.refs.sceneRef.current) return null;
    
    console.log(`Creating indicator for mesh:`, {
      id: mesh.userData?.id,
      name: mesh.userData?.volumeName,
      type: mesh.userData?.type,
      position: mesh.position
    });
    
    // Create a small indicator sphere above the object
    const indicatorGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    let indicatorMaterial;
    
    if (mesh.userData?.isSource) {
      // Source indicator - pulsing red
      indicatorMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF0000,
        emissive: 0x330000,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
        metalness: 0.2,
        roughness: 0.3
      });
    } else if (mesh.userData?.isSensor) {
      // Sensor indicator - pulsing blue
      indicatorMaterial = new THREE.MeshStandardMaterial({
        color: 0x0080FF,
        emissive: 0x003366,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.8,
        metalness: 0.8,
        roughness: 0.2
      });
    } else {
      // Composition indicator - small colored dot
      const compName = mesh.userData?.composition?.name?.toLowerCase() || '';
      let indicatorColor = 0xFFFFFF; // Default white
      let metalness = 0.3;
      let roughness = 0.6;
      
      if (compName.includes('steel')) {
        indicatorColor = 0x708090;
        metalness = 0.9;
        roughness = 0.3;
      } else if (compName.includes('lead')) {
        indicatorColor = 0x2F4F4F;
        metalness = 0.8;
        roughness = 0.4;
      } else if (compName.includes('concrete')) {
        indicatorColor = 0x8B7355;
        metalness = 0.1;
        roughness = 0.9;
      } else if (compName.includes('uranium')) {
        indicatorColor = 0xFFD700;
        metalness = 0.3;
        roughness = 0.6;
      } else if (compName.includes('air')) {
        indicatorColor = 0x87CEEB;
        metalness = 0.0;
        roughness = 0.1;
      } else if (compName.includes('zircaloy')) {
        indicatorColor = 0xC0C0C0;
        metalness = 0.7;
        roughness = 0.4;
      }
      
      indicatorMaterial = new THREE.MeshStandardMaterial({
        color: indicatorColor,
        metalness: metalness,
        roughness: roughness,
        transparent: true,
        opacity: 0.6
      });
    }
    
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    
    // Mark this as an indicator for cleanup purposes
    indicator.userData.isIndicator = true;
    indicator.userData.parentMeshId = mesh.userData?.id;
    
    // Position indicator above the object
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const size = boundingBox.getSize(new THREE.Vector3());
    indicator.position.copy(mesh.position);
    indicator.position.y += size.y / 2 + 0.1;
    
    // Add to scene
    this.refs.sceneGroupRef.current.add(indicator);
    
    // Store reference for cleanup
    if (!mesh.userData.indicators) {
      mesh.userData.indicators = [];
    }
    mesh.userData.indicators.push(indicator);
    
    console.log(`Indicator created and added to scene. Total indicators for this mesh: ${mesh.userData.indicators.length}`);
    
    return indicator;
  }
  
  removeObjectIndicators(mesh) {
    if (!mesh.userData?.indicators) return;
    
    mesh.userData.indicators.forEach(indicator => {
      this.refs.sceneGroupRef.current.remove(indicator);
      if (indicator.geometry) indicator.geometry.dispose();
      if (indicator.material) indicator.material.dispose();
    });
    
    mesh.userData.indicators = [];
  }
  
  // Clean up all indicators from the scene (useful for initialization)
  cleanupAllIndicators() {
    if (!this.refs.sceneGroupRef.current) return;
    
    const sceneChildren = this.refs.sceneGroupRef.current.children.slice();
    let removedCount = 0;
    
    console.log(`Checking ${sceneChildren.length} scene children for indicators...`);
    
    sceneChildren.forEach((child, index) => {
      console.log(`Child ${index}:`, {
        type: child.type,
        isIndicator: child.userData?.isIndicator,
        userData: child.userData
      });
      
      if (child.userData?.isIndicator) {
        console.log(`Removing indicator:`, child);
        this.refs.sceneGroupRef.current.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} orphaned indicators from scene`);
    } else {
      console.log('No indicators found to clean up');
    }
  }
  
  addSensorLabel(sensor, name) {
    // Create a simple text label for the sensor
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(name, canvas.width / 2, canvas.height / 2 + 8);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    sprite.position.set(0, 0.2, 0);
    sprite.scale.set(0.5, 0.125, 1);
    sensor.add(sprite);
    
    // Store reference to sprite for later removal
    sensor.userData.labelSprite = sprite;
  }
}
