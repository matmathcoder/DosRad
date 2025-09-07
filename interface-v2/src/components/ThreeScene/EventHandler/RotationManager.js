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
    this.rotationSensitivity = 0.01;
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

    // Store the initial mouse position
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    const object = this.refs.selectedGeometryRef.current;

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
    
    // Calculate delta movement
    const deltaX = event.clientX - this.mouseX;
    const deltaY = event.clientY - this.mouseY;
    
    // Update mouse position for next frame
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    
    // Apply rotation using StackOverflow approach
    object.rotation.y += deltaX * this.rotationSensitivity;
    object.rotation.x += deltaY * this.rotationSensitivity;
    
    // Update the object's matrix
    object.updateMatrix();
    
    // Update the object's userData to reflect the new rotation
    if (object.userData) {
      object.userData.rotation = {
        x: object.rotation.x,
        y: object.rotation.y,
        z: object.rotation.z
      };
    }
    
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
  }
}
