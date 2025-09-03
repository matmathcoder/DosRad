import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class CameraController {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    
    // Camera refs
    this.pCameraRef = null;
    this.oCameraRef = null;
    this.activeCameraRef = null;
    this.orbitControlsRef = null;
    
    // Animation and view state
    this.homeViewState = null;
    this.cameraAnimation = null;
    this.baseDistance = 10;
    this.currentZoom = 100;
  }
  
  initialize() {
    this.setupCameras();
    this.setupControls();
    this.updateActiveCamera();
  }
  
  setupCameras() {
    const aspect = window.innerWidth / window.innerHeight;
    
    // Perspective camera
    this.pCameraRef = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.pCameraRef.position.set(5, 5, 5);
    this.pCameraRef.lookAt(0, 0, 0);
    
    // Orthographic camera
    this.oCameraRef = new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, 0.1, 1000);
    this.oCameraRef.position.set(5, 5, 5);
    this.oCameraRef.lookAt(0, 0, 0);
    
    // Set initial active camera
    this.activeCameraRef = this.pCameraRef;
    
    // Set base distance for zoom calculations
    const initialDistance = this.pCameraRef.position.distanceTo(new THREE.Vector3(0, 0, 0));
    this.baseDistance = initialDistance;
    
    console.log('Cameras initialized:', {
      perspective: this.pCameraRef,
      orthographic: this.oCameraRef,
      active: this.activeCameraRef
    });
  }
  
  setupControls() {
    const renderer = this.refs.rendererRef.current;
    
    this.orbitControlsRef = new OrbitControls(this.activeCameraRef, renderer.domElement);
    this.orbitControlsRef.enableDamping = true;
    this.orbitControlsRef.dampingFactor = 0.05;
    
    // Listen for zoom changes from orbit controls
    this.orbitControlsRef.addEventListener('change', () => {
      if (this.activeCameraRef && this.activeCameraRef.isPerspectiveCamera) {
        const currentDistance = this.activeCameraRef.position.distanceTo(this.orbitControlsRef.target);
        const zoomPercent = Math.round((this.baseDistance / currentDistance) * 100);
        this.currentZoom = zoomPercent;
        
        // Notify bottom bar of zoom change
        window.dispatchEvent(new CustomEvent('zoomUpdate', { 
          detail: { zoom: zoomPercent }
        }));
      }
    });
  }
  
  update() {
    if (this.orbitControlsRef) {
      this.orbitControlsRef.update();
    }
    
    // Handle camera animation
    if (this.cameraAnimation) {
      const anim = this.cameraAnimation;
      anim.alpha += 0.06;
      const t = Math.min(anim.alpha, 1);
      this.activeCameraRef.position.lerpVectors(anim.startPosition, anim.endPosition, t);
      this.orbitControlsRef.target.lerpVectors(anim.startTarget, anim.endTarget, t);
      this.activeCameraRef.lookAt(this.orbitControlsRef.target);
      if (t >= 1) this.cameraAnimation = null;
    }
  }
  
  updateActiveCamera() {
    // Store the previous camera for position/rotation transfer
    const previousCamera = this.activeCameraRef;
    
    // Switch to the appropriate camera
    this.activeCameraRef = this.state.isPerspective ? this.pCameraRef : this.oCameraRef;
    
    // Transfer camera position and rotation if we had a previous camera
    if (previousCamera && previousCamera !== this.activeCameraRef) {
      this.activeCameraRef.position.copy(previousCamera.position);
      this.activeCameraRef.rotation.copy(previousCamera.rotation);
      
      // Update projection matrix for orthographic camera
      if (this.activeCameraRef.isOrthographicCamera) {
        this.activeCameraRef.updateProjectionMatrix();
      }
    }
    
    // Update orbit controls
    if (this.orbitControlsRef) {
      this.orbitControlsRef.object = this.activeCameraRef;
      this.orbitControlsRef.update();
    }
  }
  
  getActiveCamera() {
    return this.activeCameraRef;
  }
  
  getOrbitControls() {
    return this.orbitControlsRef;
  }
  
  animateCameraTo(targetPosition, targetLookAt) {
    this.cameraAnimation = {
      startPosition: this.activeCameraRef.position.clone(),
      endPosition: targetPosition.clone(),
      startTarget: this.orbitControlsRef.target.clone(),
      endTarget: targetLookAt.clone(),
      alpha: 0,
    };
  }
  
  zoomToFit(objects) {
    if (!objects || objects.length === 0) return;

    const box = new THREE.Box3();
    objects.forEach(obj => box.expandByObject(obj));

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const cam = this.activeCameraRef;
    const renderer = this.refs.rendererRef.current;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir); // points from camera toward scene

    if (cam.isPerspectiveCamera) {
      const fov = cam.fov * (Math.PI / 180);
      let distance = maxDim / (2 * Math.tan(fov / 2));
      distance *= 1.5; // padding
      const newPos = center.clone().addScaledVector(dir, -distance);
      this.animateCameraTo(newPos, center);
    } else if (cam.isOrthographicCamera) {
      const sizeVec = new THREE.Vector2();
      renderer.getSize(sizeVec);
      const aspect = sizeVec.x / sizeVec.y;
      const halfHeight = (size.y / 2) * 1.2; // padding
      const halfWidth = Math.max(halfHeight * aspect, (size.x / 2) * 1.2);
      cam.left = -halfWidth;
      cam.right = halfWidth;
      cam.top = halfHeight;
      cam.bottom = -halfHeight;
      cam.updateProjectionMatrix();
      const dist = cam.position.distanceTo(center);
      const newPos = center.clone().addScaledVector(dir, -Math.max(dist, 0.001));
      this.animateCameraTo(newPos, center);
    }
  }
  
  setAxisView(axis) {
    const distance = 10;
    const center = new THREE.Vector3(0, 0, 0);
    let newPosition;

    switch (axis.toUpperCase()) {
      case 'X':
        newPosition = new THREE.Vector3(distance, 0, 0);
        break;
      case 'Y':
        newPosition = new THREE.Vector3(0, distance, 0);
        break;
      case 'Z':
        newPosition = new THREE.Vector3(0, 0, distance);
        break;
      default:
        return;
    }

    this.state.setCurrentAxis(axis.toUpperCase());
    this.animateCameraTo(newPosition, center);
  }
  
  setZoomLevel(zoomPercent) {
    if (!this.activeCameraRef || !this.orbitControlsRef) return;
    
    const zoomFactor = zoomPercent / 100;
    const camera = this.activeCameraRef;
    const controls = this.orbitControlsRef;
    
    this.currentZoom = zoomPercent;
    
    if (camera.isPerspectiveCamera) {
      // For perspective camera, adjust camera position relative to target
      const target = controls.target.clone();
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      // Calculate new distance based on zoom
      const newDistance = this.baseDistance / zoomFactor;
      
      // Position camera at new distance
      const newPosition = target.clone().addScaledVector(direction, -newDistance);
      camera.position.copy(newPosition);
      
      // Update controls
      controls.update();
      
    } else if (camera.isOrthographicCamera) {
      // For orthographic camera, adjust the viewing volume
      const baseSize = 5; // Base size when zoom is 100%
      const size = baseSize / zoomFactor;
      const aspect = this.refs.rendererRef.current ? 
        this.refs.rendererRef.current.domElement.clientWidth / this.refs.rendererRef.current.domElement.clientHeight : 
        window.innerWidth / window.innerHeight;
      
      camera.left = -size * aspect;
      camera.right = size * aspect;
      camera.top = size;
      camera.bottom = -size;
      camera.updateProjectionMatrix();
    }
  }
  
  setSceneRotation(rotation) {
    if (!this.refs.sceneGroupRef.current) return;
    
    const { horizontal, vertical } = rotation;
    
    // Convert degrees to radians
    const horizontalRad = (horizontal * Math.PI) / 180;
    const verticalRad = (vertical * Math.PI) / 180;
    
    // Apply rotations to the scene group
    this.refs.sceneGroupRef.current.rotation.y = horizontalRad; // Horizontal rotation around Y-axis
    this.refs.sceneGroupRef.current.rotation.x = verticalRad;   // Vertical rotation around X-axis
  }
  
  togglePerspective() {
    // Toggle the perspective state
    const newPerspectiveState = !this.state.isPerspective;
    this.state.setIsPerspective(newPerspectiveState);
    
    // Update the active camera
    this.updateActiveCamera();
    
    // Ensure the orbit controls are properly updated
    if (this.orbitControlsRef) {
      this.orbitControlsRef.object = this.activeCameraRef;
      this.orbitControlsRef.update();
    }
    
    // Log for debugging
  }
  
  saveHomeView() {
    this.homeViewState = {
      position: this.activeCameraRef.position.clone(),
      target: this.orbitControlsRef.target.clone(),
      perspective: this.state.isPerspective,
    };
  }
  
  goToHomeView() {
    if (this.homeViewState) {
      if (typeof this.homeViewState.perspective === 'boolean' && 
          this.homeViewState.perspective !== this.state.isPerspective) {
        this.state.setIsPerspective(this.homeViewState.perspective);
        this.updateActiveCamera();
      }
      this.animateCameraTo(this.homeViewState.position, this.homeViewState.target);
    }
  }
  
  handleResize(w = window.innerWidth, h = window.innerHeight) {
    const aspect = w / h;
    
    // Update perspective camera
    if (this.pCameraRef) {
      this.pCameraRef.aspect = aspect;
      this.pCameraRef.updateProjectionMatrix();
    }
    
    // Update orthographic camera
    if (this.oCameraRef) {
      const baseSize = 5; // Base size when zoom is 100%
      const zoomFactor = this.currentZoom / 100;
      const size = baseSize / zoomFactor;
      
      this.oCameraRef.left = -size * aspect;
      this.oCameraRef.right = size * aspect;
      this.oCameraRef.top = size;
      this.oCameraRef.bottom = -size;
      this.oCameraRef.updateProjectionMatrix();
    }
    
    // Update orbit controls
    if (this.orbitControlsRef) {
      this.orbitControlsRef.update();
    }
  }
  
  cleanup() {
    if (this.orbitControlsRef) {
      this.orbitControlsRef.dispose();
    }
  }
}
