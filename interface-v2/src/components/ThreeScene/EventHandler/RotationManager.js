import * as THREE from 'three';

export class RotationManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null;

    this.isRotating = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.rotationSensitivity = 0.005; // Reduced sensitivity for smoother rotation
    
    // Simple rotation tracking
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    // Add rotation speed tracking
    this.rotationSpeed = new THREE.Vector2();
    this.lastUpdateTime = 0;
  }

  setModules(modules) {
    this.modules = modules;
  }

  initialize() {
    this.cleanup(); // Ensure clean state
  }

  beginRotation(event) {
    console.log('beginRotation', {
      tool: this.state.selectedToolRef.current,
      geometry: this.refs.selectedGeometryRef.current,
      event: { clientX: event.clientX, clientY: event.clientY }
    });
    
    if (this.state.selectedToolRef.current !== 'rotate' || !this.refs.selectedGeometryRef.current) {
      return;
    }

    this.isRotating = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.lastUpdateTime = performance.now();
    this.rotationSpeed.set(0, 0);

    const object = this.refs.selectedGeometryRef.current;

    // Disable orbit controls during rotation
    const orbitControls = this.modules?.cameraController?.getOrbitControls();
    if (orbitControls) orbitControls.enabled = false;

    // Disable transform controls during rotation
    if (this.modules?.transformControlsManager?.transformControlsRef) {
      this.modules.transformControlsManager.transformControlsRef.enabled = false;
    }

    // Visual feedback
    if (object.material) {
      if (!object.userData.originalColor) {
        object.userData.originalColor = object.material.color.getHex();
      }
      object.material.color.setHex(0xff6b35); // orange while rotating
    }

    // Prevent default mouse behavior
    event.preventDefault();
  }

  updateRotation(event) {
    console.log('updateRotation', {
      isRotating: this.isRotating,
      tool: this.state.selectedToolRef.current,
      object: this.refs.selectedGeometryRef.current,
      delta: {
        x: event.clientX - this.lastMouseX,
        y: event.clientY - this.lastMouseY
      }
    });
    
    if (!this.isRotating || this.state.selectedToolRef.current !== 'rotate' || !this.refs.selectedGeometryRef.current) {
      return;
    }

    event.preventDefault();

    const object = this.refs.selectedGeometryRef.current;
    
    // Calculate mouse movement delta (recommended Three.js approach)
    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    // Get the camera for camera-relative rotation
    const camera = this.modules?.cameraController?.getActiveCamera();
    if (!camera) return;

    // Get current time for smooth rotation
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;

    // Calculate rotation speed
    this.rotationSpeed.x = deltaX * this.rotationSensitivity;
    this.rotationSpeed.y = deltaY * this.rotationSensitivity;

    // Get camera basis vectors
    const cameraUp = camera.up.clone();
    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    const cameraRight = new THREE.Vector3().crossVectors(cameraForward, cameraUp);

    // Create rotation quaternions
    const horizontalRotation = new THREE.Quaternion().setFromAxisAngle(
      cameraUp,
      -this.rotationSpeed.x
    );

    const verticalRotation = new THREE.Quaternion().setFromAxisAngle(
      cameraRight,
      -this.rotationSpeed.y
    );

    // Combine rotations
    const combinedRotation = new THREE.Quaternion()
      .multiply(horizontalRotation)
      .multiply(verticalRotation);

    // Apply the rotation
    object.quaternion.multiplyQuaternions(combinedRotation, object.quaternion);

    // Update matrices
    object.updateMatrix();
    object.updateMatrixWorld(true);

    // Request a render if needed
    if (this.modules?.rendererRef?.current) {
      this.modules.rendererRef.current.render(
        this.modules.sceneRef.current,
        camera
      );
    }
    
    // Enforce scene boundaries after rotation
    if (this.modules?.floorConstraintManager) {
      this.modules.floorConstraintManager.enforceFloorConstraint(object);
    }
    
    // Update the object's userData to reflect the new rotation
    if (object.userData) {
      object.userData.rotation = {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z
      };
    }

    // Update last mouse position
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  endRotation() {
    console.log('endRotation', {
      wasRotating: this.isRotating,
      object: this.refs.selectedGeometryRef.current
    });
    
    if (!this.isRotating) return;

    this.isRotating = false;

    const object = this.refs.selectedGeometryRef.current;
    if (!object) return;

    // re-enable orbit + transform controls
    const orbitControls = this.modules?.cameraController?.getOrbitControls();
    if (orbitControls) orbitControls.enabled = true;

    if (this.modules?.transformControlsManager?.transformControlsRef) {
      this.modules.transformControlsManager.transformControlsRef.enabled = true;
    }

    // restore color
    if (object?.material) {
      const originalColor = object.userData.originalColor;
      if (originalColor) object.material.color.setHex(originalColor);
    }

    // save history
    if (this.modules?.historyManager) this.modules.historyManager.saveToHistory();
    if (this.modules?.persistenceManager) this.modules.persistenceManager.saveScene();
  }

  handleToolChange(selectedTool) {
    if (selectedTool === 'rotate' && this.modules?.vertexHelpersManager) {
      this.modules.vertexHelpersManager.hideVertexHelpers();
    }
  }

  cleanup() {
    this.isRotating = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.rotationSpeed.set(0, 0);
    this.lastUpdateTime = 0;
  }
}
