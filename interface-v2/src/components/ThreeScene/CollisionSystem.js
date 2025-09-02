import * as THREE from 'three';

export default class CollisionSystem {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    
    this.collisionPairs = new Set();
    this.collisionCheckCounter = 0;
  }
  
  update() {
    this.collisionCheckCounter++;
    if (this.collisionCheckCounter % 3 === 0) {
      this.checkCollisions();
    }
  }
  
  // Helper function to calculate bounding sphere radius for different geometries
  getBoundingSphereRadius(mesh) {
    if (!mesh || !mesh.userData.type) return 0.5; // Default radius
    switch (mesh.userData.type) {
      case 'cube':
        return Math.sqrt(3) * 0.5; // Half diagonal of unit cube
      case 'sphere':
        return 0.5; // Sphere radius
      case 'cylinder':
        return Math.sqrt(0.5 * 0.5 + 0.5 * 0.5); // sqrt(radius^2 + half_height^2)
      case 'cone':
        return Math.sqrt(0.5 * 0.5 + 0.5 * 0.5); // Similar to cylinder
      default:
        return 0.5;
    }
  }
  
  // Collision detection function
  checkCollisions() {
    const allGeometries = [...this.refs.geometriesRef.current].filter(Boolean);
    const currentCollisions = new Set();
    
    for (let i = 0; i < allGeometries.length; i++) {
      for (let j = i + 1; j < allGeometries.length; j++) {
        const meshA = allGeometries[i];
        const meshB = allGeometries[j];
        
        if (!meshA.userData || !meshB.userData) continue;

        const distance = meshA.position.distanceTo(meshB.position);
        const radiusA = this.getBoundingSphereRadius(meshA);
        const radiusB = this.getBoundingSphereRadius(meshB);
        const collisionDistance = radiusA + radiusB;
        
        const pairKey = `${meshA.userData.id}-${meshB.userData.id}`;
        
        if (distance < collisionDistance) {
          currentCollisions.add(pairKey);
          
          // Check if this is a new collision
          if (!this.collisionPairs.has(pairKey)) {
            this.handleCollision(meshA, meshB, distance, collisionDistance);
          }
        }
      }
    }
    
    // Update collision pairs
    this.collisionPairs = currentCollisions;
  }
  
  // Handle collision response
  handleCollision(meshA, meshB, distance, collisionDistance) {
    // Calculate collision normal (direction from A to B)
    const normal = new THREE.Vector3()
      .subVectors(meshB.position, meshA.position)
      .normalize();
    
    // Calculate overlap amount
    const overlap = collisionDistance - distance;
    
    // Separate objects by moving them apart
    const separationA = normal.clone().multiplyScalar(-overlap * 0.5);
    const separationB = normal.clone().multiplyScalar(overlap * 0.5);
    
    meshA.position.add(separationA);
    meshB.position.add(separationB);
    
    // Visual feedback - flash colors
    const originalColorA = meshA.userData.originalColor;
    const originalColorB = meshB.userData.originalColor;
    
    // Flash to bright colors
    meshA.material.color.setHex(0xffff00); // Yellow
    meshB.material.color.setHex(0xffff00); // Yellow
    
    // Calculate collision intensity based on overlap
    const intensity = Math.min(overlap / 0.1, 1.0); // Normalize to 0-1
    
    // Create impact effect particles with intensity-based scaling
    this.createImpactEffect(meshA.position.clone().lerp(meshB.position, 0.5), intensity);
    
    // Reset colors after a short delay
    setTimeout(() => {
      if (this.refs.selectedGeometryRef.current !== meshA) {
        meshA.material.color.setHex(originalColorA);
      }
      if (this.refs.selectedGeometryRef.current !== meshB) {
        meshB.material.color.setHex(originalColorB);
      }
    }, 200);
    
    const intensityLevel = intensity > 0.7 ? "HARD" : intensity > 0.3 ? "MEDIUM" : "SOFT";
  }
  
  // Create impact effect at collision point
  createImpactEffect(position, intensity = 0.5) {
    if (!this.refs.sceneRef.current) return;
    
    const particleCount = Math.floor(8 * (0.5 + intensity * 0.5)); // 4-8 particles based on intensity
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      
      particle.position.copy(position);
      
      // Random velocity scaled by intensity
      const velocityScale = 0.05 + intensity * 0.1; // 0.05-0.15 based on intensity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * velocityScale,
        (Math.random() - 0.5) * velocityScale,
        (Math.random() - 0.5) * velocityScale
      );
      
      particle.userData = {
        velocity,
        life: 1.0,
        maxLife: 1.0
      };
      
      particles.push(particle);
      this.refs.sceneRef.current.add(particle);
    }
    
    // Animate particles
    const animateParticles = () => {
      particles.forEach((particle, index) => {
        if (particle.userData.life <= 0) {
          this.refs.sceneRef.current.remove(particle);
          particle.geometry.dispose();
          particle.material.dispose();
          particles.splice(index, 1);
          return;
        }
        
        // Update position
        particle.position.add(particle.userData.velocity);
        
        // Apply gravity
        particle.userData.velocity.y -= 0.005;
        
        // Fade out
        particle.userData.life -= 0.05;
        const alpha = particle.userData.life / particle.userData.maxLife;
        particle.material.opacity = alpha;
        particle.material.transparent = true;
        
        // Shrink
        const scale = alpha;
        particle.scale.setScalar(scale);
      });
      
      if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
      }
    };
    
    animateParticles();
  }
  
  cleanup() {
    // No specific cleanup needed for collision system
  }
}
