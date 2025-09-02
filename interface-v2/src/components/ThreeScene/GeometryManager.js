import * as THREE from 'three';

export default class GeometryManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by ThreeScene
    
    // CSG operation refs
    this.csgSelectedObjects = [];
    this.csgOperation = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  createGeometry(geometryType) {
    if (!this.refs.sceneRef.current) return null;
    
    // Save history state BEFORE creating new geometry
    if (this.modules?.historyManager) {
      this.modules.historyManager.saveToHistory();
    }
    
    let geometry, material, mesh;
    
    // Generate random position
    const randomPosition = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      Math.random() * 3 + 0.5,
      (Math.random() - 0.5) * 6
    );
    
    switch (geometryType) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshStandardMaterial({ color: 0x525252 });
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        material = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        material = new THREE.MeshStandardMaterial({ color: 0x7ed321 });
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        material = new THREE.MeshStandardMaterial({ color: 0xf5a623 });
        break;
      default:
        return null;
    }
    
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(randomPosition);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { 
      type: geometryType, 
      id: Date.now(),
      originalColor: material.color.getHex()
    };
    
    // Apply current view mode to new object
    this.applyViewMode(mesh, this.state.viewMode);
    this.applyMaterialMode(mesh, this.state.materialMode);
    
    this.refs.sceneGroupRef.current.add(mesh);
    this.refs.geometriesRef.current.push(mesh);
    
    // Add solid angle line if enabled
    if (this.state.showSolidAngleLines) {
      this.addSolidAngleLine(mesh);
    }
    
    // Auto-save scene after creating geometry
    if (this.modules?.persistenceManager) {
      this.modules.persistenceManager.saveScene();
    }
    
    return mesh;
  }
  
  createGeometryAtPosition(geometryType, position) {
    if (!this.refs.sceneRef.current) return null;
    
    // Save history state BEFORE creating new geometry
    if (this.modules?.historyManager) {
      this.modules.historyManager.saveToHistory();
    }
    
    let geometry, material, mesh;
    
    // Create geometry based on type
    switch (geometryType) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        break;
      default:
        console.warn(`Unknown geometry type: ${geometryType}`);
        return null;
    }

    // Create material based on current material mode
    material = this.createMaterialForMode(this.state.materialMode);
    
    if (!mesh) {
      mesh = new THREE.Mesh(geometry, material);
    }
    
    // Set position to drop location
    mesh.position.copy(position);
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      id: Date.now(),
      type: geometryType,
      originalColor: material.color.getHex(),
      volumeName: `${geometryType.charAt(0).toUpperCase() + geometryType.slice(1)}_${Date.now()}`
    };

    // Add to scene group instead of scene directly for rotation support
    this.refs.sceneGroupRef.current.add(mesh);
    this.refs.geometriesRef.current.push(mesh);

    // Add solid angle line if enabled
    if (this.state.showSolidAngleLines) {
      this.addSolidAngleLine(mesh);
    }
    
    // Auto-save scene after creating geometry
    if (this.modules?.persistenceManager) {
      this.modules.persistenceManager.saveScene();
    }
    
    return mesh;
  }
  
  createMaterialForMode(materialMode) {
    switch (materialMode) {
      case 'wireframe':
        return new THREE.MeshBasicMaterial({ 
          color: 0x00ff00, 
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
      case 'transparent':
        return new THREE.MeshStandardMaterial({ 
          color: 0x00ff00, 
          transparent: true, 
          opacity: 0.5,
          roughness: 0.3,
          metalness: 0.1
        });
      case 'points':
        return new THREE.PointsMaterial({ 
          color: 0x00ff00, 
          size: 0.05 
        });
      default: // solid
        return new THREE.MeshStandardMaterial({ 
          color: 0x00ff00,
          roughness: 0.3,
          metalness: 0.1
        });
    }
  }
  
  applyViewMode(mesh, mode) {
    if (!mesh.material) return;
    
    switch (mode) {
      case 'solid':
        mesh.material.wireframe = false;
        mesh.material.transparent = false;
        mesh.material.opacity = 1.0;
        break;
      case 'wireframe':
        mesh.material.wireframe = true;
        mesh.material.transparent = false;
        mesh.material.opacity = 1.0;
        break;
      case 'points':
        mesh.material.wireframe = false;
        mesh.material.transparent = true;
        mesh.material.opacity = 0.3;
        break;
    }
    mesh.material.needsUpdate = true;
  }
  
  applyMaterialMode(mesh, mode) {
    if (!mesh.material) return;
    
    // Reset to original state first
    mesh.material.wireframe = false;
    mesh.material.transparent = false;
    mesh.material.opacity = 1.0;
    mesh.material.side = THREE.FrontSide;
    
    switch (mode) {
      case 'solid':
        // Default solid material - already reset above
        break;
      case 'wireframe':
        mesh.material.wireframe = true;
        break;
      case 'transparent':
        mesh.material.transparent = true;
        mesh.material.opacity = 0.6;
        mesh.material.side = THREE.DoubleSide; // Show both sides for transparency
        break;
      case 'points':
        mesh.material.transparent = true;
        mesh.material.opacity = 0.8;
        break;
    }
    mesh.material.needsUpdate = true;
  }
  
  addSolidAngleLine(mesh) {
    const center = new THREE.Vector3(0, 0, 0);
    const points = [center, mesh.position.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    
    const line = new THREE.Line(geometry, material);
    line.userData = { type: 'solidAngleLine' };
    
    this.refs.sceneRef.current.add(line);
    // Note: solidAngleLinesRef should be managed by ViewManager
  }
  
  deleteGeometry(mesh) {
    const index = this.refs.geometriesRef.current.indexOf(mesh);
    if (index > -1) {
      this.refs.geometriesRef.current.splice(index, 1);
      this.refs.sceneGroupRef.current.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      return true;
    }
    return false;
  }
  
  // CSG Operations
  performCSGOperation(operation, objectA, objectB) {
    if (!objectA || !objectB) {
      console.warn('CSG operation requires two objects');
      return null;
    }
    
    // Create a simple combined geometry based on operation type
    let resultGeometry;
    let resultMaterial;
    
    // For now, we'll create a basic implementation
    // In a full implementation, you'd use a proper CSG library like THREE-CSGMesh
    switch (operation) {
      case 'union':
        // Simple union - create a group containing both objects
        resultGeometry = new THREE.BoxGeometry(
          Math.max(objectA.scale.x, objectB.scale.x) * 1.2,
          Math.max(objectA.scale.y, objectB.scale.y) * 1.2,
          Math.max(objectA.scale.z, objectB.scale.z) * 1.2
        );
        resultMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x888888,
          transparent: true,
          opacity: 0.8
        });
        break;
        
      case 'subtract':
        // Simple subtraction - create smaller geometry
        resultGeometry = new THREE.BoxGeometry(
          Math.abs(objectA.scale.x - objectB.scale.x * 0.5),
          Math.abs(objectA.scale.y - objectB.scale.y * 0.5),
          Math.abs(objectA.scale.z - objectB.scale.z * 0.5)
        );
        resultMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x666666,
          transparent: true,
          opacity: 0.9
        });
        break;
        
      case 'intersect':
        // Simple intersection - create geometry at intersection
        resultGeometry = new THREE.SphereGeometry(
          Math.min(objectA.scale.x, objectB.scale.x) * 0.8,
          32, 32
        );
        resultMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xaaaaaa,
          transparent: true,
          opacity: 0.7
        });
        break;
        
      default:
        console.warn('Unknown CSG operation:', operation);
        return null;
    }

    // Create the result mesh
    const resultMesh = new THREE.Mesh(resultGeometry, resultMaterial);
    
    // Position at midpoint between objects
    resultMesh.position.copy(
      new THREE.Vector3().addVectors(objectA.position, objectB.position).multiplyScalar(0.5)
    );
    
    resultMesh.castShadow = true;
    resultMesh.receiveShadow = true;
    resultMesh.userData = {
      type: `csg-${operation}`,
      id: Date.now(),
      originalColor: resultMaterial.color.getHex(),
      csgOperation: operation,
      sourceObjects: [objectA.userData.id, objectB.userData.id],
      volumeName: `${operation.toUpperCase()}_${objectA.userData.volumeName || 'A'}_${objectB.userData.volumeName || 'B'}`
    };

    // Add to scene
    this.refs.sceneGroupRef.current.add(resultMesh);
    this.refs.geometriesRef.current.push(resultMesh);

    // Remove original objects
    this.deleteGeometry(objectA);
    this.deleteGeometry(objectB);
    
    return resultMesh;
  }
  
  // Volume Reduction Function
  reduceVolume(targetMesh, reductionPoint) {
    if (!targetMesh) {
      console.warn('Volume reduction requires a target mesh');
      return null;
    }
    
    // Create a smaller geometry to represent the reduced volume
    let reducedGeometry;
    let reducedMaterial;
    
    // Calculate reduction based on original geometry
    const originalGeometry = targetMesh.geometry;
    const boundingBox = new THREE.Box3().setFromObject(targetMesh);
    const size = boundingBox.getSize(new THREE.Vector3());
    
    // Create a reduced version based on geometry type
    switch (targetMesh.userData.type) {
      case 'cube':
        reducedGeometry = new THREE.BoxGeometry(
          size.x * 0.7,  // Reduce by 30%
          size.y * 0.7,
          size.z * 0.7
        );
        break;
        
      case 'sphere':
        const radius = Math.max(size.x, size.y, size.z) / 2;
        reducedGeometry = new THREE.SphereGeometry(radius * 0.7, 32, 32);
        break;
        
      case 'cylinder':
        reducedGeometry = new THREE.CylinderGeometry(
          size.x * 0.35,  // Reduce radius
          size.x * 0.35,
          size.y * 0.7,   // Reduce height
          32
        );
        break;
        
      case 'cone':
        reducedGeometry = new THREE.ConeGeometry(
          size.x * 0.35,  // Reduce radius
          size.y * 0.7,   // Reduce height
          32
        );
        break;
        
      default:
        // For CSG or unknown types, create a generic reduced box
        reducedGeometry = new THREE.BoxGeometry(
          size.x * 0.7,
          size.y * 0.7,
          size.z * 0.7
        );
        break;
    }

    // Create material with slightly different appearance to show reduction
    reducedMaterial = new THREE.MeshStandardMaterial({ 
      color: targetMesh.material.color.getHex(),
      transparent: true,
      opacity: 0.9,
      roughness: 0.3,
      metalness: 0.1
    });

    // Create the reduced mesh
    const reducedMesh = new THREE.Mesh(reducedGeometry, reducedMaterial);
    
    // Keep same position and rotation
    reducedMesh.position.copy(targetMesh.position);
    reducedMesh.rotation.copy(targetMesh.rotation);
    reducedMesh.scale.copy(targetMesh.scale);
    
    reducedMesh.castShadow = true;
    reducedMesh.receiveShadow = true;
    reducedMesh.userData = {
      ...targetMesh.userData,
      id: Date.now(),
      originalColor: reducedMaterial.color.getHex(),
      volumeReduced: true,
      reductionHistory: [
        ...(targetMesh.userData.reductionHistory || []),
        {
          timestamp: Date.now(),
          reductionPoint: reductionPoint,
          reductionFactor: 0.7
        }
      ],
      volumeName: `${targetMesh.userData.volumeName || 'Volume'}_Reduced`
    };

    // Replace the original mesh
    this.refs.sceneGroupRef.current.remove(targetMesh);
    this.refs.sceneGroupRef.current.add(reducedMesh);
    
    // Update geometries array
    const index = this.refs.geometriesRef.current.indexOf(targetMesh);
    if (index !== -1) {
      this.refs.geometriesRef.current[index] = reducedMesh;
    }
    
    return reducedMesh;
  }
  
  cleanup() {
    // Cleanup is handled by SceneManager
  }
}
