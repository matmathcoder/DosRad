import BaseApiService from './BaseApiService.js';

/**
 * Scene Service
 * Handles all scene-related API calls
 */
export default class SceneService extends BaseApiService {
  // Get scene configuration for a project
  async getSceneConfig(projectId) {
    return this.get(`/projects/${projectId}/scene-config/`);
  }

  // Update scene configuration for a project
  async updateSceneConfig(projectId, configData) {
    return this.put(`/projects/${projectId}/scene-config/`, configData);
  }

  // Get scene history for a project
  async getSceneHistory(projectId) {
    return this.get(`/projects/${projectId}/history/`);
  }

  // Get CSG operations for a project
  async getCSGOperations(projectId) {
    return this.get(`/projects/${projectId}/csg-operations/`);
  }

  // Create a new CSG operation
  async createCSGOperation(projectId, csgData) {
    return this.post(`/projects/${projectId}/csg-operations/`, csgData);
  }

  // Save complete scene
  async saveCompleteScene(sceneData) {
    return this.post('/projects/save-complete-scene/', sceneData);
  }

  // Load complete scene
  async loadCompleteScene(projectId) {
    return this.get(`/projects/${projectId}/load-complete-scene/`);
  }
}
