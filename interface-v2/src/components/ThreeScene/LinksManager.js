/**
 * LinksManager - Handles coordinate relationships between geometries
 * Allows volumes to be positioned relative to other volumes
 */
export class LinksManager {
  constructor() {
    this.links = new Map(); // geometryId -> links data
    this.geometries = new Map(); // geometryId -> geometry object
    this.eventHandler = null;
  }

  setModules(modules) {
    this.eventHandler = modules.eventHandler;
  }

  /**
   * Set links data for a geometry
   * @param {string} geometryId - ID of the geometry
   * @param {Object} linksData - Links configuration
   */
  setLinks(geometryId, linksData) {
    this.links.set(geometryId, linksData);
  }

  /**
   * Get links data for a geometry
   * @param {string} geometryId - ID of the geometry
   * @returns {Object|null} Links data or null if not found
   */
  getLinks(geometryId) {
    return this.links.get(geometryId) || null;
  }

  /**
   * Register a geometry for linking
   * @param {string} geometryId - ID of the geometry
   * @param {Object} geometry - Three.js geometry object
   */
  registerGeometry(geometryId, geometry) {
    this.geometries.set(geometryId, geometry);
  }

  /**
   * Unregister a geometry
   * @param {string} geometryId - ID of the geometry
   */
  unregisterGeometry(geometryId) {
    this.geometries.delete(geometryId);
    this.links.delete(geometryId);
  }

  /**
   * Process links for a geometry and update its position
   * @param {string} geometryId - ID of the geometry to update
   * @param {Object} baseCoordinates - Base coordinates before linking
   * @returns {Object} Updated coordinates after applying links
   */
  processLinks(geometryId, baseCoordinates) {
    const linksData = this.getLinks(geometryId);
    if (!linksData) {
      return baseCoordinates;
    }

    const updatedCoordinates = { ...baseCoordinates };
    const geometry = this.geometries.get(geometryId);
    if (!geometry) {
      return updatedCoordinates;
    }

    // Process each coordinate field that has a link
    Object.keys(linksData).forEach(field => {
      const link = linksData[field];
      if (link.linked && link.volume && link.data) {
        const targetGeometry = this.findGeometryByVolumeId(link.volume);
        if (targetGeometry) {
          const targetValue = this.getTargetCoordinateValue(targetGeometry, link.data);
          if (targetValue !== null) {
            // Apply the linked value plus distance offset
            const linkedValue = targetValue + (link.distance || 0);
            updatedCoordinates[field] = linkedValue;
          }
        }
      }
    });

    return updatedCoordinates;
  }

  /**
   * Find geometry by volume ID
   * @param {string} volumeId - Volume ID to search for
   * @returns {Object|null} Geometry object or null if not found
   */
  findGeometryByVolumeId(volumeId) {
    for (const [geometryId, geometry] of this.geometries) {
      if (geometry.userData?.volumeId === volumeId || 
          geometry.userData?.id === volumeId ||
          geometry.userData?.name === volumeId) {
        return geometry;
      }
    }
    return null;
  }

  /**
   * Get coordinate value from target geometry
   * @param {Object} targetGeometry - Target geometry object
   * @param {string} coordinateField - Coordinate field to get (x1, y1, z1, etc.)
   * @returns {number|null} Coordinate value or null if not found
   */
  getTargetCoordinateValue(targetGeometry, coordinateField) {
    const position = targetGeometry.position;
    const scale = targetGeometry.scale;

    switch (coordinateField) {
      case 'x1':
        return position.x;
      case 'y1':
        return position.y;
      case 'z1':
        return position.z;
      case 'x2':
        return scale.x;
      case 'y2':
        return scale.y;
      case 'z2':
        return scale.z;
      case 'r1':
        return scale.x; // For radius, use x scale
      case 'r2':
        return scale.y; // For second radius, use y scale
      default:
        return null;
    }
  }

  /**
   * Update geometry position based on links
   * @param {string} geometryId - ID of the geometry to update
   */
  updateGeometryFromLinks(geometryId) {
    const geometry = this.geometries.get(geometryId);
    if (!geometry) return;

    const linksData = this.getLinks(geometryId);
    if (!linksData) return;

    // Get current coordinates
    const currentCoordinates = {
      x1: geometry.position.x,
      y1: geometry.position.y,
      z1: geometry.position.z,
      x2: geometry.scale.x,
      y2: geometry.scale.y,
      z2: geometry.scale.z,
      r1: geometry.scale.x,
      r2: geometry.scale.y
    };

    // Process links
    const updatedCoordinates = this.processLinks(geometryId, currentCoordinates);

    // Apply position changes
    if (updatedCoordinates.x1 !== currentCoordinates.x1 ||
        updatedCoordinates.y1 !== currentCoordinates.y1 ||
        updatedCoordinates.z1 !== currentCoordinates.z1) {
      geometry.position.set(
        updatedCoordinates.x1,
        updatedCoordinates.y1,
        updatedCoordinates.z1
      );
    }

    // Apply scale changes
    if (updatedCoordinates.x2 !== currentCoordinates.x2 ||
        updatedCoordinates.y2 !== currentCoordinates.y2 ||
        updatedCoordinates.z2 !== currentCoordinates.z2) {
      geometry.scale.set(
        updatedCoordinates.x2,
        updatedCoordinates.y2,
        updatedCoordinates.z2
      );
    }

    // Update matrix and vertex helpers
    geometry.updateMatrixWorld();
    if (this.eventHandler) {
      this.eventHandler.updateVertexHelpersPositions(geometry);
    }
  }

  /**
   * Update all geometries that are linked to a specific geometry
   * @param {string} sourceGeometryId - ID of the geometry that changed
   */
  updateLinkedGeometries(sourceGeometryId) {
    // Find all geometries that have links to the source geometry
    for (const [geometryId, linksData] of this.links) {
      if (geometryId === sourceGeometryId) continue;

      let hasLinkToSource = false;
      Object.values(linksData).forEach(link => {
        if (link.linked && link.volume === sourceGeometryId) {
          hasLinkToSource = true;
        }
      });

      if (hasLinkToSource) {
        this.updateGeometryFromLinks(geometryId);
      }
    }
  }

  /**
   * Get all available volumes for linking
   * @returns {Array} Array of volume objects with id, name, and type
   */
  getAvailableVolumes() {
    const volumes = [];
    for (const [geometryId, geometry] of this.geometries) {
      volumes.push({
        id: geometryId,
        name: geometry.userData?.name || `Geometry ${geometryId}`,
        type: geometry.userData?.type || 'unknown',
        position: geometry.position,
        scale: geometry.scale
      });
    }
    return volumes;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.links.clear();
    this.geometries.clear();
  }
}
