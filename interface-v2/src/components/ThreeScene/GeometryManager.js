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
  
  createObjectIndicator(mesh) {
    if (!mesh || !this.refs.sceneRef.current) return null;
    
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
        material = this.createMaterial(geometryType, null);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        material = this.createMaterial(geometryType, null);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        material = this.createMaterial(geometryType, null);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        material = this.createMaterial(geometryType, null);
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
      originalColor: material.color.getHex(),
      visible: true,
      volumeName: `${geometryType.charAt(0).toUpperCase() + geometryType.slice(1)}_${Date.now()}`
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

  createSensor(sensorData) {
    if (!this.refs.sceneRef.current) return null;
    
    // Create a small sphere to represent the sensor
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = this.createMaterial('sphere', null, false, true);
    
    const sensor = new THREE.Mesh(geometry, material);
    
    // Set position from sensor data
    sensor.position.set(
      sensorData.coordinates.x,
      sensorData.coordinates.y,
      sensorData.coordinates.z
    );
    
    // Add sensor-specific properties
    sensor.userData = {
      type: 'sensor',
      id: sensorData.id || Date.now(),
      name: sensorData.name,
      coordinates: sensorData.coordinates,
      buildupType: sensorData.buildupType,
      selectedComposition: sensorData.selectedComposition,
      equiImportance: sensorData.equiImportance,
      responseFunction: sensorData.responseFunction,
      originalColor: material.color.getHex()
    };
    
    // Add to scene
    this.refs.sceneGroupRef.current.add(sensor);
    this.refs.geometriesRef.current.push(sensor);
    
    // Add a label for the sensor
    this.addSensorLabel(sensor, sensorData.name);
    
    return sensor;
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
  
  createGeometryFromData(objData) {
    if (!this.refs.sceneRef.current) return null;
    
    // Save history state BEFORE creating new geometry
    if (this.modules?.historyManager) {
      this.modules.historyManager.saveToHistory();
    }
    
    let geometry, material, mesh;
    const geometryType = objData.geometry?.type || objData.type;
    
    // Create geometry based on type and parameters
    switch (geometryType) {
      case 'cube':
      case 'box':
        const boxParams = objData.geometry?.parameters || {};
        geometry = new THREE.BoxGeometry(
          boxParams.width || 1,
          boxParams.height || 1,
          boxParams.depth || 1
        );
        material = this.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'sphere':
        const sphereParams = objData.geometry?.parameters || {};
        geometry = new THREE.SphereGeometry(
          sphereParams.radius || 0.5,
          sphereParams.widthSegments || 32,
          sphereParams.heightSegments || 32
        );
        material = this.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'cylinder':
        const cylinderParams = objData.geometry?.parameters || {};
        geometry = new THREE.CylinderGeometry(
          cylinderParams.radiusTop || 0.5,
          cylinderParams.radiusBottom || 0.5,
          cylinderParams.height || 1,
          cylinderParams.radialSegments || 32
        );
        material = this.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'cone':
        const coneParams = objData.geometry?.parameters || {};
        geometry = new THREE.ConeGeometry(
          coneParams.radius || 0.5,
          coneParams.height || 1,
          coneParams.radialSegments || 32
        );
        material = this.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      default:
        console.warn(`Unknown geometry type: ${geometryType}`);
        return null;
    }
    
    mesh = new THREE.Mesh(geometry, material);
    
    // Set position from data
    if (objData.position) {
      mesh.position.set(objData.position.x || 0, objData.position.y || 0, objData.position.z || 0);
    }
    
    // Set rotation if available
    if (objData.rotation) {
      mesh.rotation.set(objData.rotation.x || 0, objData.rotation.y || 0, objData.rotation.z || 0);
    }
    
    // Set scale if available
    if (objData.scale) {
      mesh.scale.set(objData.scale.x || 1, objData.scale.y || 1, objData.scale.z || 1);
    }
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Set userData from the loaded data
    mesh.userData = {
      type: geometryType,
      id: objData.id || Date.now(),
      originalColor: material.color.getHex(),
      volumeName: objData.name || 'Unnamed Volume',
      volumeType: objData.volume?.type || 'Unknown',
      composition: objData.volume?.composition || null,
      realDensity: objData.volume?.realDensity || 0,
      tolerance: objData.volume?.tolerance || 0,
      isSource: objData.volume?.isSource || false,
      calculation: objData.volume?.calculation || null,
      gammaSelectionMode: objData.volume?.gammaSelectionMode || null,
      spectrum: objData.volume?.spectrum || null,
      geometryParameters: objData.geometry?.parameters || {},
      visible: objData.visible !== false, // Use loaded visibility or default to true
      ...objData.userData // Include any additional userData
    };
    
    // Apply current view mode to loaded object
    this.applyViewMode(mesh, this.state.viewMode);
    this.applyMaterialMode(mesh, this.state.materialMode);
    
    this.refs.sceneGroupRef.current.add(mesh);
    this.refs.geometriesRef.current.push(mesh);
    
    // Add solid angle line if enabled
    if (this.state.showSolidAngleLines) {
      this.addSolidAngleLine(mesh);
    }
    
    // Create visual indicator for the object
    this.createObjectIndicator(mesh);
    
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
      color: 0x737373, // Handler color
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
      // Store the geometry ID before deletion for callback
      const geometryId = mesh.userData?.id;
      
      this.refs.geometriesRef.current.splice(index, 1);
      this.refs.sceneGroupRef.current.remove(mesh);
      
      // Remove visual indicators
      this.removeObjectIndicators(mesh);
      
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      
      // Invalidate shadow maps to prevent shadow persistence
      this.invalidateShadowMaps();
      
      // Notify parent component about the deletion
      if (this.callbacks?.onGeometryDeleted && geometryId) {
        this.callbacks.onGeometryDeleted(geometryId);
      }
      
      return true;
    }
    return false;
  }
  
  duplicateGeometry(mesh) {
    if (!mesh || !this.refs.sceneRef.current) return null;
    
    // Save history state BEFORE duplicating
    if (this.modules?.historyManager) {
      this.modules.historyManager.saveToHistory();
    }
    
    // Clone the geometry
    const clonedGeometry = mesh.geometry.clone();
    
    // Clone the material
    const clonedMaterial = mesh.material.clone();
    
    // Create new mesh with cloned geometry and material
    const duplicatedMesh = new THREE.Mesh(clonedGeometry, clonedMaterial);
    
    // Copy position, rotation, and scale
    duplicatedMesh.position.copy(mesh.position);
    duplicatedMesh.rotation.copy(mesh.rotation);
    duplicatedMesh.scale.copy(mesh.scale);
    
    // Offset the duplicated mesh slightly to avoid overlap
    duplicatedMesh.position.x += 0.5;
    duplicatedMesh.position.z += 0.5;
    
    // Copy shadow properties
    duplicatedMesh.castShadow = mesh.castShadow;
    duplicatedMesh.receiveShadow = mesh.receiveShadow;
    
    // Copy userData
    duplicatedMesh.userData = {
      ...mesh.userData,
      id: Date.now(), // Generate new unique ID
      originalColor: clonedMaterial.color.getHex(),
      volumeName: `${mesh.userData.volumeName || 'Object'}_Copy`
    };
    
    // Apply current view mode to duplicated object
    this.applyViewMode(duplicatedMesh, this.state.viewMode);
    this.applyMaterialMode(duplicatedMesh, this.state.materialMode);
    
    // Add to scene
    this.refs.sceneGroupRef.current.add(duplicatedMesh);
    this.refs.geometriesRef.current.push(duplicatedMesh);
    
    // Add solid angle line if enabled
    if (this.state.showSolidAngleLines) {
      this.addSolidAngleLine(duplicatedMesh);
    }
    
    // Auto-save scene after duplicating geometry
    if (this.modules?.persistenceManager) {
      this.modules.persistenceManager.saveScene();
    }
    
    return duplicatedMesh;
  }
  
  // Method to invalidate shadow maps and force re-render
  invalidateShadowMaps() {
    if (this.refs.sceneRef.current) {
      // Force shadow map update by marking all shadow-casting lights as needing update
      this.refs.sceneRef.current.traverse((object) => {
        if (object.isDirectionalLight && object.castShadow) {
          object.shadow.needsUpdate = true;
        }
        if (object.isPointLight && object.castShadow) {
          object.shadow.needsUpdate = true;
        }
        if (object.isSpotLight && object.castShadow) {
          object.shadow.needsUpdate = true;
        }
      });
    }
  }
  
  // CSG Operations
  performCSGOperation(operation, objectA, objectB) {
    if (!objectA || !objectB) {
      console.warn('CSG operation requires two objects');
      return null;
    }
    
    // Save history state BEFORE performing CSG operation
    if (this.modules?.historyManager) {
      this.modules.historyManager.saveToHistory();
    }
    
    let resultGeometry;
    let resultMaterial;
    let resultPosition;
    
    // Get bounding boxes for both objects
    const boxA = new THREE.Box3().setFromObject(objectA);
    const boxB = new THREE.Box3().setFromObject(objectB);
    
    // Calculate combined bounding box
    const combinedBox = new THREE.Box3().union(boxA).union(boxB);
    const center = combinedBox.getCenter(new THREE.Vector3());
    const size = combinedBox.getSize(new THREE.Vector3());
    
    switch (operation) {
      case 'union':
        // Union - create geometry that encompasses both objects
        resultGeometry = new THREE.BoxGeometry(
          size.x * 1.1, // Slightly larger to encompass both
          size.y * 1.1,
          size.z * 1.1
        );
        resultMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x4CAF50, // Green for union
          transparent: true,
          opacity: 0.9
        });
        resultPosition = center;
        break;
        
      case 'subtract':
        // Subtraction - create geometry representing A minus B
        resultGeometry = new THREE.BoxGeometry(
          size.x * 0.8, // Smaller to represent subtraction
          size.y * 0.8,
          size.z * 0.8
        );
        resultMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xFF5722, // Orange for subtraction
          transparent: true,
          opacity: 0.9
        });
        resultPosition = objectA.position.clone();
        break;
        
      case 'intersect':
        // Intersection - create geometry at the overlap
        const intersectionSize = new THREE.Vector3(
          Math.min(boxA.max.x, boxB.max.x) - Math.max(boxA.min.x, boxB.min.x),
          Math.min(boxA.max.y, boxB.max.y) - Math.max(boxA.min.y, boxB.min.y),
          Math.min(boxA.max.z, boxB.max.z) - Math.max(boxA.min.z, boxB.min.z)
        );
        
        // Only create intersection if there's actual overlap
        if (intersectionSize.x > 0 && intersectionSize.y > 0 && intersectionSize.z > 0) {
          resultGeometry = new THREE.BoxGeometry(
            intersectionSize.x,
            intersectionSize.y,
            intersectionSize.z
          );
          resultMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2196F3, // Blue for intersection
            transparent: true,
            opacity: 0.9
          });
          resultPosition = new THREE.Vector3(
            (Math.max(boxA.min.x, boxB.min.x) + Math.min(boxA.max.x, boxB.max.x)) / 2,
            (Math.max(boxA.min.y, boxB.min.y) + Math.min(boxA.max.y, boxB.max.y)) / 2,
            (Math.max(boxA.min.z, boxB.min.z) + Math.min(boxA.max.z, boxB.max.z)) / 2
          );
        } else {
          // No intersection - create a small indicator
          resultGeometry = new THREE.SphereGeometry(0.1, 8, 8);
          resultMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000, // Red for no intersection
            transparent: true,
            opacity: 0.8
          });
          resultPosition = center;
        }
        break;
        
      case 'split':
        // Split - create two separate objects
        const splitResult1 = new THREE.Mesh(
          objectA.geometry.clone(),
          new THREE.MeshStandardMaterial({ 
            color: 0x9C27B0, // Purple for split
            transparent: true,
            opacity: 0.9
          })
        );
        const splitResult2 = new THREE.Mesh(
          objectB.geometry.clone(),
          new THREE.MeshStandardMaterial({ 
            color: 0x9C27B0, // Purple for split
            transparent: true,
            opacity: 0.9
          })
        );
        
        // Position the split objects
        splitResult1.position.copy(objectA.position);
        splitResult1.rotation.copy(objectA.rotation);
        splitResult1.scale.copy(objectA.scale);
        
        splitResult2.position.copy(objectB.position);
        splitResult2.rotation.copy(objectB.rotation);
        splitResult2.scale.copy(objectB.scale);
        
        // Set up userData for both objects
        splitResult1.userData = {
          type: 'csg-split',
          id: Date.now(),
          originalColor: splitResult1.material.color.getHex(),
          csgOperation: 'split',
          sourceObjects: [objectA.userData.id, objectB.userData.id],
          volumeName: `SPLIT_${objectA.userData.volumeName || 'A'}`
        };
        
        splitResult2.userData = {
          type: 'csg-split',
          id: Date.now() + 1,
          originalColor: splitResult2.material.color.getHex(),
          csgOperation: 'split',
          sourceObjects: [objectA.userData.id, objectB.userData.id],
          volumeName: `SPLIT_${objectB.userData.volumeName || 'B'}`
        };
        
        // Add both objects to scene
        this.refs.sceneGroupRef.current.add(splitResult1);
        this.refs.sceneGroupRef.current.add(splitResult2);
        this.refs.geometriesRef.current.push(splitResult1);
        this.refs.geometriesRef.current.push(splitResult2);
        
        // Remove original objects
        this.deleteGeometry(objectA);
        this.deleteGeometry(objectB);
        
        // Return the first split object (for selection)
        return splitResult1;
        
      default:
        console.warn('Unknown CSG operation:', operation);
        return null;
    }

    // Create the result mesh (only for non-split operations)
    const resultMesh = new THREE.Mesh(resultGeometry, resultMaterial);
    
    // Position the result mesh
    resultMesh.position.copy(resultPosition);
    
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
    
    // Invalidate shadow maps after CSG operation
    this.invalidateShadowMaps();
    
    // Auto-save scene after CSG operation
    if (this.modules?.persistenceManager) {
      this.modules.persistenceManager.saveScene();
    }
    
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
    
    // Invalidate shadow maps after volume reduction
    this.invalidateShadowMaps();
    
    return reducedMesh;
  }
  
  cleanup() {
    // Cleanup is handled by SceneManager
  }
}
