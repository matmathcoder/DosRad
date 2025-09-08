import BaseApiService from './BaseApiService.js';

/**
 * Project Service
 * Handles all project-related API calls
 */
export default class ProjectService extends BaseApiService {
  // Get all projects for the authenticated user
  async getProjects() {
    return this.get('/projects/');
  }

  // Get public projects
  async getPublicProjects() {
    return this.get('/projects/public/');
  }

  // Get a specific project
  async getProject(projectId) {
    return this.get(`/projects/${projectId}/`);
  }

  // Create a new project
  async createProject(projectData) {
    return this.post('/projects/', projectData);
  }

  // Update an existing project
  async updateProject(projectId, projectData) {
    return this.put(`/projects/${projectId}/`, projectData);
  }

  // Delete a project
  async deleteProject(projectId) {
    return this.delete(`/projects/${projectId}/`);
  }

  // Duplicate a project
  async duplicateProject(projectId) {
    return this.post(`/projects/${projectId}/duplicate/`, {});
  }

  // Complete Project Management
  async createCompleteProject(projectData) {
    return this.post('/projects/complete/', projectData);
  }

  async getCompleteProject(projectId) {
    return this.get(`/projects/complete/${projectId}/`);
  }

  async updateCompleteProject(projectId, projectData) {
    return this.put(`/projects/complete/${projectId}/update/`, projectData);
  }
}
