import BaseApiService from './BaseApiService.js';

/**
 * Spectrum Service
 * Handles all spectrum-related API calls
 */
export default class SpectrumService extends BaseApiService {
  // Get all spectra for a project
  async getSpectra(projectId) {
    return this.get(`/projects/${projectId}/spectra/`);
  }

  // Create a new spectrum
  async createSpectrum(projectId, spectrumData) {
    return this.post(`/projects/${projectId}/spectra/`, spectrumData);
  }

  // Update an existing spectrum
  async updateSpectrum(projectId, spectrumId, spectrumData) {
    return this.put(`/projects/${projectId}/spectra/${spectrumId}/`, spectrumData);
  }

  // Delete a spectrum
  async deleteSpectrum(projectId, spectrumId) {
    return this.delete(`/projects/${projectId}/spectra/${spectrumId}/`);
  }
}
