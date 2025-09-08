import BaseApiService from './BaseApiService.js';

/**
 * Volume Service
 * Handles all volume-related API calls
 */
export default class VolumeService extends BaseApiService {
  // Get all volumes for a project
  async getVolumes(projectId) {
    return this.get(`/projects/${projectId}/volumes/`);
  }

  // Create a new volume
  async createVolume(projectId, volumeData) {
    return this.post(`/projects/${projectId}/volumes/create/`, volumeData);
  }

  // Update an existing volume
  async updateVolume(projectId, volumeId, volumeData) {
    return this.put(`/projects/${projectId}/volumes/${volumeId}/`, volumeData);
  }

  // Delete a volume
  async deleteVolume(projectId, volumeId) {
    return this.delete(`/projects/${projectId}/volumes/${volumeId}/`);
  }

  // Update volume name
  async updateVolumeName(projectId, volumeId, newName) {
    return this.patch(`/projects/${projectId}/volumes/${volumeId}/update-name/`, { name: newName });
  }
}
