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

  // Compound Object endpoints
  async getCompoundObjects(projectId) {
    return this.get(`/projects/${projectId}/compound-objects/`);
  }

  async createCompoundObject(projectId, compoundObjectData) {
    return this.post(`/projects/${projectId}/compound-objects/`, compoundObjectData);
  }

  async updateCompoundObject(projectId, compoundObjectId, compoundObjectData) {
    return this.put(`/projects/${projectId}/compound-objects/${compoundObjectId}/`, compoundObjectData);
  }

  async deleteCompoundObject(projectId, compoundObjectId) {
    return this.delete(`/projects/${projectId}/compound-objects/${compoundObjectId}/`);
  }
}
