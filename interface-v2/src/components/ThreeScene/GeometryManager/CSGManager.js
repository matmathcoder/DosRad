import * as THREE from 'three';

export default class CSGManager {
  constructor(refs, state, callbacks) {
    this.refs = refs;
    this.state = state;
    this.callbacks = callbacks;
    this.modules = null; // Will be set by main GeometryManager
    
    // CSG operation refs
    this.csgSelectedObjects = [];
    this.csgOperation = null;
  }
  
  setModules(modules) {
    this.modules = modules;
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
        this.modules.geometryManager.deleteGeometry(objectA);
        this.modules.geometryManager.deleteGeometry(objectB);
        
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
    this.modules.geometryManager.deleteGeometry(objectA);
    this.modules.geometryManager.deleteGeometry(objectB);
    
    // Invalidate shadow maps after CSG operation
    this.modules.geometryManager.invalidateShadowMaps();
    
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
    this.modules.geometryManager.invalidateShadowMaps();
    
    return reducedMesh;
  }
}
