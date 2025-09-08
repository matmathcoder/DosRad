import BaseApiService from './BaseApiService.js';

/**
 * Geometry Service
 * Handles all geometry-related API calls
 */
export default class GeometryService extends BaseApiService {
  // Get all geometries for a project
  async getGeometries(projectId) {
    return this.get(`/projects/${projectId}/geometries/`);
  }

  // Create a new geometry
  async createGeometry(projectId, geometryData) {
    return this.post(`/projects/${projectId}/geometries/`, geometryData);
  }

  // Update an existing geometry
  async updateGeometry(projectId, geometryId, geometryData) {
    return this.put(`/projects/${projectId}/geometries/${geometryId}/`, geometryData);
  }

  // Delete a geometry
  async deleteGeometry(projectId, geometryId) {
    return this.delete(`/projects/${projectId}/geometries/${geometryId}/`);
  }
}
