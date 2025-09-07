import * as THREE from 'three';

export default class MaterialManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by main GeometryManager
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  createMaterial(geometryType, composition = null, isSource = false, isSensor = false) {
    // Default material properties
    let color = 0x404040; // Default gray
    let metalness = 0.1;
    let roughness = 0.8;
    let emissive = 0x000000;
    let emissiveIntensity = 0;
    let wireframe = false;
    let transparent = false;
    let opacity = 1.0;
    
    // Determine material type and properties
    if (isSource) {
      // Source volumes - bright, emissive, pulsing effect
      color = 0xFF6B35; // Bright orange-red
      metalness = 0.2;
      roughness = 0.3;
      emissive = 0xFF4500; // Orange glow
      emissiveIntensity = 0.3;
      transparent = true;
      opacity = 0.9;
    } else if (isSensor) {
      // Sensor volumes - bright blue, wireframe
      color = 0x00BFFF; // Deep sky blue
      metalness = 0.8;
      roughness = 0.2;
      emissive = 0x0080FF; // Blue glow
      emissiveIntensity = 0.2;
      wireframe = true;
    } else if (composition) {
      // Apply composition-based colors and properties
      const compName = composition.name.toLowerCase();
      
      if (compName.includes('steel') || compName.includes('iron')) {
        color = 0x708090; // Steel gray
        metalness = 0.9;
        roughness = 0.3;
      } else if (compName.includes('lead')) {
        color = 0x2F4F4F; // Dark slate gray
        metalness = 0.8;
        roughness = 0.4;
      } else if (compName.includes('concrete')) {
        color = 0x8B7355; // Concrete brown
        metalness = 0.1;
        roughness = 0.9;
      } else if (compName.includes('uranium') || compName.includes('uo2')) {
        color = 0xFFD700; // Gold
        metalness = 0.3;
        roughness = 0.6;
        emissive = 0xFFA500; // Orange glow
        emissiveIntensity = 0.1;
      } else if (compName.includes('air')) {
        color = 0x87CEEB; // Sky blue
        metalness = 0.0;
        roughness = 0.1;
        transparent = true;
        opacity = 0.3;
      } else if (compName.includes('zircaloy') || compName.includes('zirconium')) {
        color = 0xC0C0C0; // Silver
        metalness = 0.7;
        roughness = 0.4;
      } else if (compName.includes('water')) {
        color = 0x4169E1; // Royal blue
        metalness = 0.0;
        roughness = 0.1;
        transparent = true;
        opacity = 0.6;
      } else {
        // Default material color based on composition name hash
        const hash = this.hashString(compName);
        color = 0x400000 + (hash % 0xFFFFFF);
        metalness = 0.3;
        roughness = 0.6;
      }
    } else {
      // Default geometry-based colors
      switch (geometryType) {
        case 'cube':
          color = 0x4A90E2; // Blue
          break;
        case 'sphere':
          color = 0x7ED321; // Green
          break;
        case 'cylinder':
          color = 0xF5A623; // Orange
          break;
        case 'cone':
          color = 0xBD10E0; // Purple
          break;
        case 'capsule':
          color = 0xFF6B6B; // Red
          break;
        case 'dodecahedron':
          color = 0x4ECDC4; // Teal
          break;
        case 'extrude':
          color = 0x45B7D1; // Light Blue
          break;
        case 'icosahedron':
          color = 0x96CEB4; // Mint
          break;
        case 'lathe':
          color = 0xFFEAA7; // Yellow
          break;
        case 'octahedron':
          color = 0xDDA0DD; // Plum
          break;
        case 'plane':
          color = 0x98D8C8; // Light Green
          break;
        case 'ring':
          color = 0xF7DC6F; // Gold
          break;
        case 'shape':
          color = 0xBB8FCE; // Light Purple
          break;
        case 'tetrahedron':
          color = 0x85C1E9; // Sky Blue
          break;
        case 'torus':
          color = 0xF8C471; // Peach
          break;
        case 'torusKnot':
          color = 0x82E0AA; // Light Green
          break;
        case 'tube':
          color = 0xF1948A; // Salmon
          break;
        default:
          color = 0x404040; // Default gray
      }
    }
    
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
      emissive: emissive,
      emissiveIntensity: emissiveIntensity,
      wireframe: wireframe,
      transparent: transparent,
      opacity: opacity
    });
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  updateObjectMaterial(mesh, composition = null, isSource = false, isSensor = false) {
    if (!mesh || !mesh.material) return;
    
    // Dispose old material
    mesh.material.dispose();
    
    // Create new material with updated properties
    const newMaterial = this.createMaterial(
      mesh.userData?.type || 'cube',
      composition,
      isSource,
      isSensor
    );
    
    // Apply new material
    mesh.material = newMaterial;
    
    // Update userData
    if (mesh.userData) {
      mesh.userData.composition = composition;
      mesh.userData.isSource = isSource;
      mesh.userData.isSensor = isSensor;
      mesh.userData.originalColor = newMaterial.color.getHex();
    }
  }
  
  createMaterialForMode(materialMode) {
    switch (materialMode) {
      case 'wireframe':
        return new THREE.MeshBasicMaterial({ 
          color: 0x404040, 
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
      case 'transparent':
        return new THREE.MeshStandardMaterial({ 
          color: 0x404040, 
          transparent: true, 
          opacity: 0.5,
          roughness: 0.3,
          metalness: 0.1
        });
      case 'points':
        return new THREE.PointsMaterial({ 
          color: 0x404040, 
          size: 0.05 
        });
      default: // solid
        return new THREE.MeshStandardMaterial({ 
          color: 0x404040,
          roughness: 0.3,
          metalness: 0.1
        });
    }
  }
}
