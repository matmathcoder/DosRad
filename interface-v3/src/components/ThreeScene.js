import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class ThreeScene {
  constructor(container, selectedTool = null) {
    this.container = container;
    this.selectedTool = selectedTool;
    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.orbitControls = null;
    this.cube = null;
    this.arrowHelpers = [];
    this.isDragging = false;
    this.dragData = null;
    this.keyState = {};
    this.moveSpeed = 0.1;

    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createControls();
    this.createCube();
    this.createArrowHelpers();
    this.createLights();
    this.setupEventListeners();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.GridHelper(10, 10, 0x888888, 0x444444));
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }

  createRenderer() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      display: block;
      width: 100%;
      height: 100%;
      outline: none;
    `;
    
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x262626);
    
    this.container.appendChild(this.canvas);
  }

  createControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
  }

  createCube() {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x525252 });
    this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.scene.add(this.cube);
  }

  createArrowHelpers() {
    const arrowLength = 1.5;
    const arrowOffset = 0.7;
    
    // X-axis arrow (red) - positive direction
    const xArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(arrowOffset, 0, 0), arrowLength, 0xff0000);
    xArrow.userData = { axis: 'x', direction: 1 };
    this.cube.add(xArrow);
    this.arrowHelpers.push(xArrow);
    
    // X-axis negative arrow (dark red)
    const xNegArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-arrowOffset, 0, 0), arrowLength, 0x880000);
    xNegArrow.userData = { axis: 'x', direction: -1 };
    this.cube.add(xNegArrow);
    this.arrowHelpers.push(xNegArrow);
    
    // Y-axis arrow (green) - positive direction
    const yArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, arrowOffset, 0), arrowLength, 0x00ff00);
    yArrow.userData = { axis: 'y', direction: 1 };
    this.cube.add(yArrow);
    this.arrowHelpers.push(yArrow);
    
    // Y-axis negative arrow (dark green)
    const yNegArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -arrowOffset, 0), arrowLength, 0x008800);
    yNegArrow.userData = { axis: 'y', direction: -1 };
    this.cube.add(yNegArrow);
    this.arrowHelpers.push(yNegArrow);
    
    // Z-axis arrow (blue) - positive direction
    const zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, arrowOffset), arrowLength, 0x0000ff);
    zArrow.userData = { axis: 'z', direction: 1 };
    this.cube.add(zArrow);
    this.arrowHelpers.push(zArrow);
    
    // Z-axis negative arrow (dark blue)
    const zNegArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, -arrowOffset), arrowLength, 0x000088);
    zNegArrow.userData = { axis: 'z', direction: -1 };
    this.cube.add(zNegArrow);
    this.arrowHelpers.push(zNegArrow);
  }

  createLights() {
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 10, 7.5);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
  }

  setupEventListeners() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.onWindowResize);
  }

  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    
    // Check for arrow helper intersections first
    const arrowIntersects = this.raycaster.intersectObjects(this.arrowHelpers, true);
    if (arrowIntersects.length > 0) {
      const clickedArrow = arrowIntersects[0].object;
      
      // Find the parent ArrowHelper
      let arrowHelper = clickedArrow;
      while (arrowHelper && !arrowHelper.userData.axis) {
        arrowHelper = arrowHelper.parent;
      }
      
      if (arrowHelper && arrowHelper.userData) {
        this.isDragging = true;
        this.dragData = {
          arrowHelper,
          axis: arrowHelper.userData.axis,
          direction: arrowHelper.userData.direction,
          startCubePosition: this.cube.position.clone(),
          startPointer: this.pointer.clone()
        };
        
        // Disable orbit controls while dragging
        this.orbitControls.enabled = false;
        
        // Visual feedback - change arrow color
        arrowHelper.line.material.color.setHex(0xffffff);
        arrowHelper.cone.material.color.setHex(0xffffff);
        
        return;
      }
    }

    // Check for cube intersection (original behavior)
    const cubeIntersects = this.raycaster.intersectObject(this.cube);
    if (cubeIntersects.length > 0) {
      // Check if position is valid before doing anything
      if (!isFinite(this.cube.position.x) || !isFinite(this.cube.position.y) || !isFinite(this.cube.position.z)) {
        this.cube.position.set(0, 0, 0);
      }
      
      // Change color to indicate selection
      this.cube.material.color.set(0x00ff00);
      
      // Ensure cube is visible and in scene
      this.cube.visible = true;
      if (!this.scene.children.includes(this.cube)) {
        this.scene.add(this.cube);
      }
    }
  }

  onPointerMove(event) {
    if (!this.isDragging || !this.dragData) return;
    
    // Calculate current pointer position
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const { axis, direction, startCubePosition, startPointer } = this.dragData;
    
    // Calculate movement delta based on pointer movement
    let delta = 0;
    if (axis === 'x') {
      delta = (this.pointer.x - startPointer.x) * direction * 5;
    } else if (axis === 'y') {
      delta = (this.pointer.y - startPointer.y) * direction * 5;
    } else if (axis === 'z') {
      // For Z-axis, use both X and Y movement (whichever is larger)
      const deltaX = Math.abs(this.pointer.x - startPointer.x);
      const deltaY = Math.abs(this.pointer.y - startPointer.y);
      if (deltaX > deltaY) {
        delta = (this.pointer.x - startPointer.x) * direction * 5;
      } else {
        delta = (this.pointer.y - startPointer.y) * direction * 5;
      }
    }
    
    // Update cube position
    const newPosition = startCubePosition.clone();
    if (axis === 'x') {
      newPosition.x += delta;
    } else if (axis === 'y') {
      newPosition.y += delta;
    } else if (axis === 'z') {
      newPosition.z += delta;
    }
    
    // Check if position is valid before setting
    if (isFinite(newPosition.x) && isFinite(newPosition.y) && isFinite(newPosition.z)) {
      this.cube.position.copy(newPosition);
    }
  }

  onPointerUp(event) {
    if (this.isDragging && this.dragData) {
      const { arrowHelper } = this.dragData;
      
      // Restore original arrow color
      const originalColor = arrowHelper.userData.axis === 'x' ? 
        (arrowHelper.userData.direction > 0 ? 0xff0000 : 0x880000) :
        arrowHelper.userData.axis === 'y' ?
        (arrowHelper.userData.direction > 0 ? 0x00ff00 : 0x008800) :
        (arrowHelper.userData.direction > 0 ? 0x0000ff : 0x000088);
        
      arrowHelper.line.material.color.setHex(originalColor);
      arrowHelper.cone.material.color.setHex(originalColor);
      
      // Re-enable orbit controls
      this.orbitControls.enabled = true;
    }
    
    this.isDragging = false;
    this.dragData = null;
  }

  handleKeyDown(event) {
    this.keyState[event.code] = true;
    
    // Prevent arrow keys from scrolling the page
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    this.keyState[event.code] = false;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    // Check for corrupted position before updating
    if (!isFinite(this.cube.position.x) || !isFinite(this.cube.position.y) || !isFinite(this.cube.position.z)) {
      this.cube.position.set(0, 0, 0);
    }
    
    // Update cube position based on keyState
    if (this.keyState['ArrowUp']) {
      this.cube.position.z -= this.moveSpeed;
    }
    if (this.keyState['ArrowDown']) {
      this.cube.position.z += this.moveSpeed;
    }
    if (this.keyState['ArrowLeft']) {
      this.cube.position.x -= this.moveSpeed;
    }
    if (this.keyState['ArrowRight']) {
      this.cube.position.x += this.moveSpeed;
    }
    if (this.keyState['KeyQ']) {
      this.cube.position.y += this.moveSpeed;
    }
    if (this.keyState['KeyE']) {
      this.cube.position.y -= this.moveSpeed;
    }
    
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
    
    requestAnimationFrame(() => this.animate());
  }

  setSelectedTool(toolId) {
    this.selectedTool = toolId;
  }

  dispose() {
    // Clean up event listeners
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.onWindowResize);
    
    // Clean up Three.js resources
    this.renderer.dispose();
    this.cube.geometry.dispose();
    this.cube.material.dispose();
  }
}
