import BaseApiService from './BaseApiService.js';

/**
 * Composition Service
 * Handles all composition-related API calls
 */
export default class CompositionService extends BaseApiService {
  // Get all compositions for a project
  async getCompositions(projectId) {
    return this.get(`/projects/${projectId}/compositions/`);
  }

  // Create a new composition
  async createComposition(projectId, compositionData) {
    return this.post(`/projects/${projectId}/compositions/`, compositionData);
  }

  // Update an existing composition
  async updateComposition(projectId, compositionId, compositionData) {
    return this.put(`/projects/${projectId}/compositions/${compositionId}/`, compositionData);
  }

  // Delete a composition
  async deleteComposition(projectId, compositionId) {
    return this.delete(`/projects/${projectId}/compositions/${compositionId}/`);
  }
}
