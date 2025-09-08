import * as THREE from 'three';

export default class SceneManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;
  }
  
  setModules(modules) {
    this.modules = modules;
  }
  
  initialize() {
    this.setupRenderer();
    this.setupLighting();
    this.setupScene();
    this.setupEventListeners();
  }
  
  setupRenderer() {
    const renderer = this.refs.rendererRef.current;
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x262626);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  
  setupLighting() {
    const scene = this.refs.sceneRef.current;
    
    // Main directional light (sun-like)
    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    scene.add(mainLight);

    // Secondary directional light from opposite side for fill lighting
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(-5, 5, -7.5);
    scene.add(fillLight);

    // Ambient light for overall brightness
    const ambientLight = new THREE.AmbientLight(0x606060, 1.2);
    scene.add(ambientLight);

    // Additional point lights for better object visibility
    const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1.5, 50);
    pointLight2.position.set(-10, 10, -10);
    scene.add(pointLight2);

    // Hemisphere light for natural sky/ground lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.8);
    scene.add(hemisphereLight);
  }
  
  // Method to force shadow map updates
  invalidateAllShadowMaps() {
    if (this.refs.sceneRef.current) {
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
  
  setupScene() {
    const sceneGroup = this.refs.sceneGroupRef.current;
    
    // Define scene boundaries
    this.sceneBounds = {
      minX: -10,
      maxX: 10,
      minY: -2,
      maxY: 15,
      minZ: -10,
      maxZ: 10
    };
    
    // Add grid helper to the rotatable group (larger grid to show boundaries)
    sceneGroup.add(new THREE.GridHelper(20, 20, 0x888888, 0x444444));
    
    // Add a ground plane for shadows
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333, 
      transparent: true, 
      opacity: 0.1 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -0.01; // Slightly below grid
    ground.receiveShadow = true;
    sceneGroup.add(ground);
    
    // Add scene boundary walls
    this.createSceneBoundaries(sceneGroup);
  }
  
  createSceneBoundaries(sceneGroup) {
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2a2a2a, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const bounds = this.sceneBounds;
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floor = new THREE.Mesh(floorGeometry, wallMaterial.clone());
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = bounds.minY;
    floor.receiveShadow = true;
    sceneGroup.add(floor);
    
    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
    const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial.clone());
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = bounds.maxY;
    sceneGroup.add(ceiling);
    
    // Left wall (negative X)
    const leftWallGeometry = new THREE.PlaneGeometry(20, bounds.maxY - bounds.minY);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial.clone());
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(bounds.minX, (bounds.maxY + bounds.minY) / 2, 0);
    sceneGroup.add(leftWall);
    
    // Right wall (positive X)
    const rightWallGeometry = new THREE.PlaneGeometry(20, bounds.maxY - bounds.minY);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial.clone());
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(bounds.maxX, (bounds.maxY + bounds.minY) / 2, 0);
    sceneGroup.add(rightWall);
    
    // Back wall (negative Z)
    const backWallGeometry = new THREE.PlaneGeometry(20, bounds.maxY - bounds.minY);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial.clone());
    backWall.position.set(0, (bounds.maxY + bounds.minY) / 2, bounds.minZ);
    sceneGroup.add(backWall);
    
    // Front wall (positive Z)
    const frontWallGeometry = new THREE.PlaneGeometry(20, bounds.maxY - bounds.minY);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial.clone());
    frontWall.rotation.y = Math.PI;
    frontWall.position.set(0, (bounds.maxY + bounds.minY) / 2, bounds.maxZ);
    sceneGroup.add(frontWall);
    
    // Store boundary references for collision detection
    this.boundaryWalls = [floor, ceiling, leftWall, rightWall, backWall, frontWall];
  }
  
  // Method to check if a position is within scene bounds
  isPositionWithinBounds(position) {
    const bounds = this.sceneBounds;
    return (
      position.x >= bounds.minX && position.x <= bounds.maxX &&
      position.y >= bounds.minY && position.y <= bounds.maxY &&
      position.z >= bounds.minZ && position.z <= bounds.maxZ
    );
  }
  
  // Method to clamp a position to scene bounds
  clampPositionToBounds(position) {
    const bounds = this.sceneBounds;
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
      z: Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z))
    };
  }
  
  // Method to get scene bounds for other modules
  getSceneBounds() {
    return { ...this.sceneBounds };
  }
  
  setupEventListeners() {
    this.onResize = () => {
      const renderer = this.refs.rendererRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Update renderer size
      renderer.setSize(w, h);
      
      // Update pixel ratio for high DPI displays
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Notify other modules about resize
      if (this.modules?.cameraController) {
        this.modules.cameraController.handleResize(w, h);
      }
    };
    
    window.addEventListener('resize', this.onResize);
    
    // Also handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.onResize(), 100);
    });
  }
  
  cleanup() {
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
    }
    
    // Dispose of boundary walls
    if (this.boundaryWalls) {
      this.boundaryWalls.forEach(wall => {
        if (wall.geometry) wall.geometry.dispose();
        if (wall.material) wall.material.dispose();
      });
    }
    
    // Dispose of geometries and materials
    this.refs.geometriesRef.current.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    
    // Dispose of renderer
    if (this.refs.rendererRef.current) {
      this.refs.rendererRef.current.dispose();
    }
  }
}
