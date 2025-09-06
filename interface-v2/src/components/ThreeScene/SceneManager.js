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
    
    // Add grid helper to the rotatable group
    sceneGroup.add(new THREE.GridHelper(10, 10, 0x888888, 0x444444));
    
    // Add a ground plane for shadows to the rotatable group
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
