import BaseApiService from './BaseApiService.js';
import AuthService from './AuthService.js';
import ProjectService from './ProjectService.js';
import GeometryService from './GeometryService.js';
import CompositionService from './CompositionService.js';
import SpectrumService from './SpectrumService.js';
import VolumeService from './VolumeService.js';
import SensorService from './SensorService.js';
import SceneService from './SceneService.js';
import { DataConverters } from './DataConverters.js';

/**
 * Main API Service
 * Orchestrates all API functionality through specialized service modules
 */
export default class ApiService extends BaseApiService {
  constructor(baseURL = 'http://localhost:8000/api') {
    super(baseURL);
    
    // Initialize specialized services
    this.auth = new AuthService(baseURL);
    this.projects = new ProjectService(baseURL);
    this.geometries = new GeometryService(baseURL);
    this.compositions = new CompositionService(baseURL);
    this.spectra = new SpectrumService(baseURL);
    this.volumes = new VolumeService(baseURL);
    this.sensors = new SensorService(baseURL);
    this.scenes = new SceneService(baseURL);
    
    // Sync token across all services
    this.syncToken();
  }

  // Sync authentication token across all services
  syncToken() {
    const token = this.token;
    this.auth.token = token;
    this.projects.token = token;
    this.geometries.token = token;
    this.compositions.token = token;
    this.spectra.token = token;
    this.volumes.token = token;
    this.sensors.token = token;
    this.scenes.token = token;
  }

  // Override setToken to sync across all services
  setToken(token) {
    super.setToken(token);
    this.syncToken();
  }

  // Override clearToken to sync across all services
  clearToken() {
    super.clearToken();
    this.syncToken();
  }

  // Authentication endpoints (delegated to AuthService)
  async register(userData) {
    return this.auth.register(userData);
  }

  async login(credentials) {
    const response = await this.auth.login(credentials);
    this.syncToken(); // Sync token after login
    return response;
  }

  async logout() {
    await this.auth.logout();
    this.syncToken(); // Sync token after logout
  }

  async getProfile() {
    return this.auth.getProfile();
  }

  async updateProfile(userData) {
    return this.auth.updateProfile(userData);
  }

  async changePassword(passwordData) {
    return this.auth.changePassword(passwordData);
  }

  async checkAuthStatus() {
    return this.auth.checkAuthStatus();
  }

  // Project endpoints (delegated to ProjectService)
  async getProjects() {
    return this.projects.getProjects();
  }

  async getPublicProjects() {
    return this.projects.getPublicProjects();
  }

  async getProject(projectId) {
    return this.projects.getProject(projectId);
  }

  async createProject(projectData) {
    return this.projects.createProject(projectData);
  }

  async updateProject(projectId, projectData) {
    return this.projects.updateProject(projectId, projectData);
  }

  async deleteProject(projectId) {
    return this.projects.deleteProject(projectId);
  }

  async duplicateProject(projectId) {
    return this.projects.duplicateProject(projectId);
  }

  async createCompleteProject(projectData) {
    return this.projects.createCompleteProject(projectData);
  }

  async getCompleteProject(projectId) {
    return this.projects.getCompleteProject(projectId);
  }

  async updateCompleteProject(projectId, projectData) {
    return this.projects.updateCompleteProject(projectId, projectData);
  }

  // Scene configuration endpoints (delegated to SceneService)
  async getSceneConfig(projectId) {
    return this.scenes.getSceneConfig(projectId);
  }

  async updateSceneConfig(projectId, configData) {
    return this.scenes.updateSceneConfig(projectId, configData);
  }

  // Geometry endpoints (delegated to GeometryService)
  async getGeometries(projectId) {
    return this.geometries.getGeometries(projectId);
  }

  async createGeometry(projectId, geometryData) {
    return this.geometries.createGeometry(projectId, geometryData);
  }

  async updateGeometry(projectId, geometryId, geometryData) {
    return this.geometries.updateGeometry(projectId, geometryId, geometryData);
  }

  async deleteGeometry(projectId, geometryId) {
    return this.geometries.deleteGeometry(projectId, geometryId);
  }

  // Composition endpoints (delegated to CompositionService)
  async getCompositions(projectId) {
    return this.compositions.getCompositions(projectId);
  }

  async createComposition(projectId, compositionData) {
    return this.compositions.createComposition(projectId, compositionData);
  }

  async updateComposition(projectId, compositionId, compositionData) {
    return this.compositions.updateComposition(projectId, compositionId, compositionData);
  }

  async deleteComposition(projectId, compositionId) {
    return this.compositions.deleteComposition(projectId, compositionId);
  }

  // Spectrum endpoints (delegated to SpectrumService)
  async getSpectra(projectId) {
    return this.spectra.getSpectra(projectId);
  }

  async createSpectrum(projectId, spectrumData) {
    return this.spectra.createSpectrum(projectId, spectrumData);
  }

  async updateSpectrum(projectId, spectrumId, spectrumData) {
    return this.spectra.updateSpectrum(projectId, spectrumId, spectrumData);
  }

  async deleteSpectrum(projectId, spectrumId) {
    return this.spectra.deleteSpectrum(projectId, spectrumId);
  }

  // Volume endpoints (delegated to VolumeService)
  async getVolumes(projectId) {
    return this.volumes.getVolumes(projectId);
  }

  async createVolume(projectId, volumeData) {
    return this.volumes.createVolume(projectId, volumeData);
  }

  async updateVolume(projectId, volumeId, volumeData) {
    return this.volumes.updateVolume(projectId, volumeId, volumeData);
  }

  async deleteVolume(projectId, volumeId) {
    return this.volumes.deleteVolume(projectId, volumeId);
  }

  async updateVolumeName(projectId, volumeId, newName) {
    return this.volumes.updateVolumeName(projectId, volumeId, newName);
  }

  // Sensor endpoints (delegated to SensorService)
  async getSensors(projectId) {
    return this.sensors.getSensors(projectId);
  }

  async createSensor(projectId, sensorData) {
    return this.sensors.createSensor(projectId, sensorData);
  }

  async updateSensor(projectId, sensorId, sensorData) {
    return this.sensors.updateSensor(projectId, sensorId, sensorData);
  }

  async deleteSensor(projectId, sensorId) {
    return this.sensors.deleteSensor(projectId, sensorId);
  }

  async updateSensorName(projectId, sensorId, newName) {
    return this.sensors.updateSensorName(projectId, sensorId, newName);
  }

  // Compound Object endpoints (delegated to SceneService)
  async getCompoundObjects(projectId) {
    return this.scenes.getCompoundObjects(projectId);
  }

  async createCompoundObject(projectId, compoundObjectData) {
    return this.scenes.createCompoundObject(projectId, compoundObjectData);
  }

  async updateCompoundObject(projectId, compoundObjectId, compoundObjectData) {
    return this.scenes.updateCompoundObject(projectId, compoundObjectId, compoundObjectData);
  }

  async deleteCompoundObject(projectId, compoundObjectId) {
    return this.scenes.deleteCompoundObject(projectId, compoundObjectId);
  }

  // Scene history endpoints (delegated to SceneService)
  async getSceneHistory(projectId) {
    return this.scenes.getSceneHistory(projectId);
  }

  // CSG operation endpoints (delegated to SceneService)
  async getCSGOperations(projectId) {
    return this.scenes.getCSGOperations(projectId);
  }

  async createCSGOperation(projectId, csgData) {
    return this.scenes.createCSGOperation(projectId, csgData);
  }

  // Complete scene save/load endpoints (delegated to SceneService)
  async saveCompleteScene(sceneData) {
    return this.scenes.saveCompleteScene(sceneData);
  }

  async loadCompleteScene(projectId) {
    return this.scenes.loadCompleteScene(projectId);
  }

  // Data conversion methods (delegated to DataConverters)
  convertSceneToBackendFormat(sceneData) {
    return DataConverters.convertSceneToBackendFormat(sceneData);
  }

  convertBackendToSceneFormat(backendData) {
    return DataConverters.convertBackendToSceneFormat(backendData);
  }
}
