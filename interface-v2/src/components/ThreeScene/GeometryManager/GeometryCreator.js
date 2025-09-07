import * as THREE from 'three';

export default class GeometryCreator {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by main GeometryManager
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
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'capsule':
        geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(0.5);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'extrude':
        // Create a simple star shape for extrude geometry
        const starShape = new THREE.Shape();
        starShape.moveTo(0, 0.5);
        starShape.lineTo(0.1, 0.1);
        starShape.lineTo(0.5, 0.1);
        starShape.lineTo(0.2, -0.1);
        starShape.lineTo(0.3, -0.5);
        starShape.lineTo(0, -0.2);
        starShape.lineTo(-0.3, -0.5);
        starShape.lineTo(-0.2, -0.1);
        starShape.lineTo(-0.5, 0.1);
        starShape.lineTo(-0.1, 0.1);
        starShape.lineTo(0, 0.5);
        geometry = new THREE.ExtrudeGeometry(starShape, {
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelOffset: 0,
          bevelSegments: 3
        });
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(0.5);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'lathe':
        // Create a vase-like shape for lathe geometry
        const points = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          const radius = 0.3 + Math.sin(angle * 3) * 0.1;
          points.push(new THREE.Vector2(radius, i * 0.1 - 0.5));
        }
        geometry = new THREE.LatheGeometry(points, 12);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(0.5);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(1, 1);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'ring':
        geometry = new THREE.RingGeometry(0.3, 0.5, 32);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'shape':
        // Create a heart shape
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0, -0.3, -0.3, -0.3, -0.3, 0);
        heartShape.bezierCurveTo(-0.3, 0.3, 0, 0.3, 0, 0.6);
        heartShape.bezierCurveTo(0, 0.3, 0.3, 0.3, 0.3, 0);
        heartShape.bezierCurveTo(0.3, -0.3, 0, -0.3, 0, 0);
        geometry = new THREE.ShapeGeometry(heartShape);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(0.5);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.4, 0.1, 16, 100);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'torusKnot':
        geometry = new THREE.TorusKnotGeometry(0.4, 0.1, 100, 16);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      case 'tube':
        // Create a curved tube path
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.5, 0, 0),
          new THREE.Vector3(-0.25, 0.25, 0),
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.25, -0.25, 0),
          new THREE.Vector3(0.5, 0, 0)
        ]);
        geometry = new THREE.TubeGeometry(curve, 64, 0.1, 8, false);
        material = this.modules.materialManager.createMaterial(geometryType, null);
        break;
      default:
        console.warn(`Unknown geometry type: ${geometryType}`);
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
    this.modules.viewManager.applyViewMode(mesh, this.state.viewMode);
    // Get current material mode from window to ensure we have the latest value
    const currentMaterialMode = window.getMaterialMode ? window.getMaterialMode() : this.state.materialMode;
    this.modules.viewManager.applyMaterialMode(mesh, currentMaterialMode);
    
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
    const material = this.modules.materialManager.createMaterial('sphere', null, false, true);
    
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
    this.modules.indicatorManager.addSensorLabel(sensor, sensorData.name);
    
    return sensor;
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
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'sphere':
        const sphereParams = objData.geometry?.parameters || {};
        geometry = new THREE.SphereGeometry(
          sphereParams.radius || 0.5,
          sphereParams.widthSegments || 32,
          sphereParams.heightSegments || 32
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'cylinder':
        const cylinderParams = objData.geometry?.parameters || {};
        geometry = new THREE.CylinderGeometry(
          cylinderParams.radiusTop || 0.5,
          cylinderParams.radiusBottom || 0.5,
          cylinderParams.height || 1,
          cylinderParams.radialSegments || 32
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'cone':
        const coneParams = objData.geometry?.parameters || {};
        geometry = new THREE.ConeGeometry(
          coneParams.radius || 0.5,
          coneParams.height || 1,
          coneParams.radialSegments || 32
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'capsule':
        const capsuleParams = objData.geometry?.parameters || {};
        geometry = new THREE.CapsuleGeometry(
          capsuleParams.radius || 0.5,
          capsuleParams.length || 1,
          capsuleParams.capSubdivisions || 4,
          capsuleParams.radialSegments || 8
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'dodecahedron':
        const dodecahedronParams = objData.geometry?.parameters || {};
        geometry = new THREE.DodecahedronGeometry(dodecahedronParams.radius || 0.5);
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'extrude':
        // For extrude geometry, we'll use a default star shape if no shape is provided
        const starShape = new THREE.Shape();
        starShape.moveTo(0, 0.5);
        starShape.lineTo(0.1, 0.1);
        starShape.lineTo(0.5, 0.1);
        starShape.lineTo(0.2, -0.1);
        starShape.lineTo(0.3, -0.5);
        starShape.lineTo(0, -0.2);
        starShape.lineTo(-0.3, -0.5);
        starShape.lineTo(-0.2, -0.1);
        starShape.lineTo(-0.5, 0.1);
        starShape.lineTo(-0.1, 0.1);
        starShape.lineTo(0, 0.5);
        const extrudeParams = objData.geometry?.parameters || {};
        geometry = new THREE.ExtrudeGeometry(starShape, {
          depth: extrudeParams.depth || 0.2,
          bevelEnabled: extrudeParams.bevelEnabled !== false,
          bevelThickness: extrudeParams.bevelThickness || 0.05,
          bevelSize: extrudeParams.bevelSize || 0.05,
          bevelOffset: extrudeParams.bevelOffset || 0,
          bevelSegments: extrudeParams.bevelSegments || 3
        });
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'icosahedron':
        const icosahedronParams = objData.geometry?.parameters || {};
        geometry = new THREE.IcosahedronGeometry(icosahedronParams.radius || 0.5);
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'lathe':
        // For lathe geometry, we'll create a default vase shape if no points are provided
        const points = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          const radius = 0.3 + Math.sin(angle * 3) * 0.1;
          points.push(new THREE.Vector2(radius, i * 0.1 - 0.5));
        }
        const latheParams = objData.geometry?.parameters || {};
        geometry = new THREE.LatheGeometry(points, latheParams.segments || 12);
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'octahedron':
        const octahedronParams = objData.geometry?.parameters || {};
        geometry = new THREE.OctahedronGeometry(octahedronParams.radius || 0.5);
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'plane':
        const planeParams = objData.geometry?.parameters || {};
        geometry = new THREE.PlaneGeometry(
          planeParams.width || 1,
          planeParams.height || 1,
          planeParams.widthSegments || 1,
          planeParams.heightSegments || 1
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'ring':
        const ringParams = objData.geometry?.parameters || {};
        geometry = new THREE.RingGeometry(
          ringParams.innerRadius || 0.3,
          ringParams.outerRadius || 0.5,
          ringParams.thetaSegments || 32,
          ringParams.phiSegments || 1,
          ringParams.thetaStart || 0,
          ringParams.thetaLength || Math.PI * 2
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'shape':
        // For shape geometry, we'll create a default heart shape if no shape is provided
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0, -0.3, -0.3, -0.3, -0.3, 0);
        heartShape.bezierCurveTo(-0.3, 0.3, 0, 0.3, 0, 0.6);
        heartShape.bezierCurveTo(0, 0.3, 0.3, 0.3, 0.3, 0);
        heartShape.bezierCurveTo(0.3, -0.3, 0, -0.3, 0, 0);
        geometry = new THREE.ShapeGeometry(heartShape);
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'tetrahedron':
        const tetrahedronParams = objData.geometry?.parameters || {};
        geometry = new THREE.TetrahedronGeometry(tetrahedronParams.radius || 0.5);
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'torus':
        const torusParams = objData.geometry?.parameters || {};
        geometry = new THREE.TorusGeometry(
          torusParams.radius || 0.4,
          torusParams.tube || 0.1,
          torusParams.radialSegments || 16,
          torusParams.tubularSegments || 100,
          torusParams.arc || Math.PI * 2
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'torusKnot':
        const torusKnotParams = objData.geometry?.parameters || {};
        geometry = new THREE.TorusKnotGeometry(
          torusKnotParams.radius || 0.4,
          torusKnotParams.tube || 0.1,
          torusKnotParams.tubularSegments || 100,
          torusKnotParams.radialSegments || 16,
          torusKnotParams.p || 2,
          torusKnotParams.q || 3
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
        break;
      case 'tube':
        // For tube geometry, we'll create a default curved path if no curve is provided
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.5, 0, 0),
          new THREE.Vector3(-0.25, 0.25, 0),
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.25, -0.25, 0),
          new THREE.Vector3(0.5, 0, 0)
        ]);
        const tubeParams = objData.geometry?.parameters || {};
        geometry = new THREE.TubeGeometry(
          curve,
          tubeParams.tubularSegments || 64,
          tubeParams.radius || 0.1,
          tubeParams.radialSegments || 8,
          tubeParams.closed || false
        );
        material = this.modules.materialManager.createMaterial(geometryType, objData.userData?.composition, objData.userData?.isSource, objData.userData?.isSensor);
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
    this.modules.viewManager.applyViewMode(mesh, this.state.viewMode);
    // Get current material mode from window to ensure we have the latest value
    const currentMaterialMode = window.getMaterialMode ? window.getMaterialMode() : this.state.materialMode;
    this.modules.viewManager.applyMaterialMode(mesh, currentMaterialMode);
    
    this.refs.sceneGroupRef.current.add(mesh);
    this.refs.geometriesRef.current.push(mesh);
    
    // Add solid angle line if enabled
    if (this.state.showSolidAngleLines) {
      this.addSolidAngleLine(mesh);
    }
    
    // Create visual indicator for the object (temporarily disabled for debugging)
    // this.modules.indicatorManager.createObjectIndicator(mesh);
    
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
      case 'capsule':
        geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(0.5);
        break;
      case 'extrude':
        const starShape = new THREE.Shape();
        starShape.moveTo(0, 0.5);
        starShape.lineTo(0.1, 0.1);
        starShape.lineTo(0.5, 0.1);
        starShape.lineTo(0.2, -0.1);
        starShape.lineTo(0.3, -0.5);
        starShape.lineTo(0, -0.2);
        starShape.lineTo(-0.3, -0.5);
        starShape.lineTo(-0.2, -0.1);
        starShape.lineTo(-0.5, 0.1);
        starShape.lineTo(-0.1, 0.1);
        starShape.lineTo(0, 0.5);
        geometry = new THREE.ExtrudeGeometry(starShape, {
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelOffset: 0,
          bevelSegments: 3
        });
        break;
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(0.5);
        break;
      case 'lathe':
        const points = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          const radius = 0.3 + Math.sin(angle * 3) * 0.1;
          points.push(new THREE.Vector2(radius, i * 0.1 - 0.5));
        }
        geometry = new THREE.LatheGeometry(points, 12);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(0.5);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(1, 1);
        break;
      case 'ring':
        geometry = new THREE.RingGeometry(0.3, 0.5, 32);
        break;
      case 'shape':
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0, -0.3, -0.3, -0.3, -0.3, 0);
        heartShape.bezierCurveTo(-0.3, 0.3, 0, 0.3, 0, 0.6);
        heartShape.bezierCurveTo(0, 0.3, 0.3, 0.3, 0.3, 0);
        heartShape.bezierCurveTo(0.3, -0.3, 0, -0.3, 0, 0);
        geometry = new THREE.ShapeGeometry(heartShape);
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(0.5);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.4, 0.1, 16, 100);
        break;
      case 'torusKnot':
        geometry = new THREE.TorusKnotGeometry(0.4, 0.1, 100, 16);
        break;
      case 'tube':
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.5, 0, 0),
          new THREE.Vector3(-0.25, 0.25, 0),
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.25, -0.25, 0),
          new THREE.Vector3(0.5, 0, 0)
        ]);
        geometry = new THREE.TubeGeometry(curve, 64, 0.1, 8, false);
        break;
      default:
        console.warn(`Unknown geometry type: ${geometryType}`);
        return null;
    }

    // Create material with proper colors like regular createGeometry method
    material = this.modules.materialManager.createMaterial(geometryType, null);
    
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

    // Apply current view mode and material mode to new object (same as createGeometry)
    this.modules.viewManager.applyViewMode(mesh, this.state.viewMode);
    // Get current material mode from window to ensure we have the latest value
    const currentMaterialMode = window.getMaterialMode ? window.getMaterialMode() : this.state.materialMode;
    this.modules.viewManager.applyMaterialMode(mesh, currentMaterialMode);

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
    this.modules.viewManager.applyViewMode(duplicatedMesh, this.state.viewMode);
    // Get current material mode from window to ensure we have the latest value
    const currentMaterialMode = window.getMaterialMode ? window.getMaterialMode() : this.state.materialMode;
    this.modules.viewManager.applyMaterialMode(duplicatedMesh, currentMaterialMode);
    
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
}
