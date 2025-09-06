import * as THREE from 'three';

// Utility for exporting Three.js geometries to OBJ format
export function exportGeometryToOBJ(geometry, material, name = 'object') {
  const vertices = geometry.attributes.position.array;
  const normals = geometry.attributes.normal ? geometry.attributes.normal.array : null;
  const uvs = geometry.attributes.uv ? geometry.attributes.uv.array : null;
  
  let objContent = `# Exported from Mercurad\n`;
  objContent += `# Object: ${name}\n`;
  objContent += `# Vertices: ${vertices.length / 3}\n\n`;
  
  // Write vertices
  for (let i = 0; i < vertices.length; i += 3) {
    objContent += `v ${vertices[i]} ${vertices[i + 1]} ${vertices[i + 2]}\n`;
  }
  
  // Write texture coordinates if available
  if (uvs) {
    objContent += `\n`;
    for (let i = 0; i < uvs.length; i += 2) {
      objContent += `vt ${uvs[i]} ${uvs[i + 1]}\n`;
    }
  }
  
  // Write normals if available
  if (normals) {
    objContent += `\n`;
    for (let i = 0; i < normals.length; i += 3) {
      objContent += `vn ${normals[i]} ${normals[i + 1]} ${normals[i + 2]}\n`;
    }
  }
  
  // Write faces
  objContent += `\n`;
  objContent += `g ${name}\n`;
  
  // Get index array
  let indices;
  if (geometry.index) {
    indices = geometry.index.array;
  } else {
    // Create indices if geometry doesn't have them
    indices = new Array(vertices.length / 3);
    for (let i = 0; i < indices.length; i++) {
      indices[i] = i;
    }
  }
  
  // Write faces
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] + 1; // OBJ indices start from 1
    const b = indices[i + 1] + 1;
    const c = indices[i + 2] + 1;
    
    if (uvs && normals) {
      objContent += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`;
    } else if (uvs) {
      objContent += `f ${a}/${a} ${b}/${b} ${c}/${c}\n`;
    } else if (normals) {
      objContent += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
    } else {
      objContent += `f ${a} ${b} ${c}\n`;
    }
  }
  
  return objContent;
}

// Export multiple objects as a single OBJ file
export function exportMultipleObjectsToOBJ(objects, filename = 'scene.obj') {
  let objContent = `# Exported from Mercurad\n`;
  objContent += `# Multiple Objects Export\n`;
  objContent += `# Objects: ${objects.length}\n\n`;
  
  let vertexOffset = 0;
  
  objects.forEach((obj, index) => {
    const geometry = obj.geometry;
    const material = obj.material;
    const name = obj.userData?.volumeName || obj.userData?.name || `object_${index + 1}`;
    
    // Apply object transformations
    const matrix = new THREE.Matrix4();
    matrix.compose(obj.position, obj.quaternion, obj.scale);
    
    const vertices = geometry.attributes.position.array;
    const normals = geometry.attributes.normal ? geometry.attributes.normal.array : null;
    const uvs = geometry.attributes.uv ? geometry.attributes.uv.array : null;
    
    // Transform vertices
    const transformedVertices = [];
    for (let i = 0; i < vertices.length; i += 3) {
      const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
      vertex.applyMatrix4(matrix);
      transformedVertices.push(vertex.x, vertex.y, vertex.z);
    }
    
    // Write vertices for this object
    objContent += `# Object: ${name}\n`;
    for (let i = 0; i < transformedVertices.length; i += 3) {
      objContent += `v ${transformedVertices[i]} ${transformedVertices[i + 1]} ${transformedVertices[i + 2]}\n`;
    }
    
    // Write texture coordinates if available
    if (uvs) {
      for (let i = 0; i < uvs.length; i += 2) {
        objContent += `vt ${uvs[i]} ${uvs[i + 1]}\n`;
      }
    }
    
    // Write normals if available (transformed)
    if (normals) {
      for (let i = 0; i < normals.length; i += 3) {
        const normal = new THREE.Vector3(normals[i], normals[i + 1], normals[i + 2]);
        normal.transformDirection(matrix);
        objContent += `vn ${normal.x} ${normal.y} ${normal.z}\n`;
      }
    }
    
    // Write faces for this object
    objContent += `\n`;
    objContent += `g ${name}\n`;
    
    // Get index array
    let indices;
    if (geometry.index) {
      indices = geometry.index.array;
    } else {
      indices = new Array(vertices.length / 3);
      for (let i = 0; i < indices.length; i++) {
        indices[i] = i;
      }
    }
    
    // Write faces with adjusted vertex indices
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] + vertexOffset + 1;
      const b = indices[i + 1] + vertexOffset + 1;
      const c = indices[i + 2] + vertexOffset + 1;
      
      if (uvs && normals) {
        objContent += `f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`;
      } else if (uvs) {
        objContent += `f ${a}/${a} ${b}/${b} ${c}/${c}\n`;
      } else if (normals) {
        objContent += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
      } else {
        objContent += `f ${a} ${b} ${c}\n`;
      }
    }
    
    // Update vertex offset for next object
    vertexOffset += vertices.length / 3;
    objContent += `\n`;
  });
  
  return objContent;
}

// Download OBJ content as a file
export function downloadOBJ(objContent, filename = 'export.obj') {
  const blob = new Blob([objContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
