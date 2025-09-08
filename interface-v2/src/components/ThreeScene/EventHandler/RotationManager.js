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
    this.rotationSensitivity = 0.005; // Reduced for smoother rotation
    
    // Trackball-style rotation variables
    this.rotationStart = new THREE.Vector2();
    this.rotationEnd = new THREE.Vector2();
    this.rotationDelta = new THREE.Vector2();
    this.objectStartRotation = new THREE.Euler();
    this.objectStartQuaternion = new THREE.Quaternion();
    
    // Rotation constraints
    this.maxRotationSpeed = 0.02;
    this.minRotationSpeed = 0.001;
  }

  setModules(modules) {
    this.modules = modules;
  }

  initialize() {}

  beginRotation(event) {
    if (this.state.selectedToolRef.current !== 'rotate' || !this.refs.selectedGeometryRef.current) {
      return;
    }

    this.isRotating = true;

    const object = this.refs.selectedGeometryRef.current;
    const renderer = this.refs.rendererRef.current;
    const rect = renderer.domElement.getBoundingClientRect();

    // Store normalized mouse position (-1 to 1)
    this.rotationStart.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // Store object's initial rotation state
    this.objectStartRotation.copy(object.rotation);
    this.objectStartQuaternion.copy(object.quaternion);

    // disable orbit controls
    const orbitControls = this.modules?.cameraController?.getOrbitControls();
    if (orbitControls) orbitControls.enabled = false;

    // disable transform controls
    if (this.modules?.transformControlsManager?.transformControlsRef) {
      this.modules.transformControlsManager.transformControlsRef.enabled = false;
    }

    // visual feedback
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
    if (!this.isRotating || this.state.selectedToolRef.current !== 'rotate' || !this.refs.selectedGeometryRef.current) {
      return;
    }

    event.preventDefault();

    const object = this.refs.selectedGeometryRef.current;
    const renderer = this.refs.rendererRef.current;
    const rect = renderer.domElement.getBoundingClientRect();

    // Get current normalized mouse position
    this.rotationEnd.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // Calculate rotation delta
    this.rotationDelta.subVectors(this.rotationEnd, this.rotationStart);

    // Apply rotation constraints
    const deltaLength = this.rotationDelta.length();
    if (deltaLength < this.minRotationSpeed) return;

    // Clamp rotation speed
    const clampedDelta = this.rotationDelta.clone().normalize().multiplyScalar(
      Math.min(deltaLength, this.maxRotationSpeed)
    );

    // Get camera for camera-relative rotation
    const camera = this.modules?.cameraController?.getActiveCamera();
    if (!camera) return;

    // Create rotation quaternions based on camera orientation
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Horizontal rotation (around camera's up vector)
    const horizontalAxis = camera.up.clone().normalize();
    const horizontalQuaternion = new THREE.Quaternion().setFromAxisAngle(
      horizontalAxis, 
      -clampedDelta.x * this.rotationSensitivity * 10
    );

    // Vertical rotation (around camera's right vector)
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, camera.up).normalize();
    const verticalQuaternion = new THREE.Quaternion().setFromAxisAngle(
      cameraRight, 
      clampedDelta.y * this.rotationSensitivity * 10
    );

    // Combine rotations
    const combinedQuaternion = new THREE.Quaternion()
      .multiplyQuaternions(horizontalQuaternion, verticalQuaternion);

    // Apply rotation to object
    object.quaternion.multiplyQuaternions(combinedQuaternion, object.quaternion);
    
    // Update rotation from quaternion to keep Euler angles in sync
    object.rotation.setFromQuaternion(object.quaternion);
    
    // Update the object's matrix
    object.updateMatrix();
    
    // Enforce scene boundaries after rotation (in case rotation moved object outside bounds)
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
    
    // Update start position for next frame
    this.rotationStart.copy(this.rotationEnd);
    
    // Force a re-render by updating the transform controls if they exist
    if (this.modules?.transformControlsManager?.transformControlsRef && this.modules.transformControlsManager.transformControlsRef.object === object) {
      this.modules.transformControlsManager.transformControlsRef.dispatchEvent({ type: 'change' });
    }
  }

  endRotation() {
    if (!this.isRotating) return;

    this.isRotating = false;

    const object = this.refs.selectedGeometryRef.current;

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
    this.mouseX = 0;
    this.mouseY = 0;
    
    // Reset trackball variables
    this.rotationStart.set(0, 0);
    this.rotationEnd.set(0, 0);
    this.rotationDelta.set(0, 0);
    this.objectStartRotation.set(0, 0, 0);
    this.objectStartQuaternion.set(0, 0, 0, 1);
  }
}
