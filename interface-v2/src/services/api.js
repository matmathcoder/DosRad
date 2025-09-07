// API service for interacting with Django backend
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout/', {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }

  async getProfile() {
    return this.request('/auth/profile/');
  }

  async updateProfile(userData) {
    return this.request('/auth/update/', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async checkAuthStatus() {
    return this.request('/auth/status/');
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects/');
  }

  async getPublicProjects() {
    return this.request('/projects/public/');
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}/`);
  }

  async createProject(projectData) {
    return this.request('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId, projectData) {
    return this.request(`/projects/${projectId}/`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}/`, {
      method: 'DELETE',
    });
  }

  async duplicateProject(projectId) {
    return this.request(`/projects/${projectId}/duplicate/`, {
      method: 'POST',
    });
  }

  // Scene configuration endpoints
  async getSceneConfig(projectId) {
    return this.request(`/projects/${projectId}/scene-config/`);
  }

  async updateSceneConfig(projectId, configData) {
    return this.request(`/projects/${projectId}/scene-config/`, {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  }

  // Geometry endpoints
  async getGeometries(projectId) {
    return this.request(`/projects/${projectId}/geometries/`);
  }

  async createGeometry(projectId, geometryData) {
    return this.request(`/projects/${projectId}/geometries/`, {
      method: 'POST',
      body: JSON.stringify(geometryData),
    });
  }

  async updateGeometry(projectId, geometryId, geometryData) {
    return this.request(`/projects/${projectId}/geometries/${geometryId}/`, {
      method: 'PUT',
      body: JSON.stringify(geometryData),
    });
  }

  async deleteGeometry(projectId, geometryId) {
    return this.request(`/projects/${projectId}/geometries/${geometryId}/`, {
      method: 'DELETE',
    });
  }

  // Composition endpoints
  async getCompositions(projectId) {
    return this.request(`/projects/${projectId}/compositions/`);
  }

  async createComposition(projectId, compositionData) {
    return this.request(`/projects/${projectId}/compositions/`, {
      method: 'POST',
      body: JSON.stringify(compositionData),
    });
  }

  async updateComposition(projectId, compositionId, compositionData) {
    return this.request(`/projects/${projectId}/compositions/${compositionId}/`, {
      method: 'PUT',
      body: JSON.stringify(compositionData),
    });
  }

  async deleteComposition(projectId, compositionId) {
    return this.request(`/projects/${projectId}/compositions/${compositionId}/`, {
      method: 'DELETE',
    });
  }

  // Spectrum endpoints
  async getSpectra(projectId) {
    return this.request(`/projects/${projectId}/spectra/`);
  }

  async createSpectrum(projectId, spectrumData) {
    return this.request(`/projects/${projectId}/spectra/`, {
      method: 'POST',
      body: JSON.stringify(spectrumData),
    });
  }

  async updateSpectrum(projectId, spectrumId, spectrumData) {
    return this.request(`/projects/${projectId}/spectra/${spectrumId}/`, {
      method: 'PUT',
      body: JSON.stringify(spectrumData),
    });
  }

  async deleteSpectrum(projectId, spectrumId) {
    return this.request(`/projects/${projectId}/spectra/${spectrumId}/`, {
      method: 'DELETE',
    });
  }

  // Volume endpoints
  async getVolumes(projectId) {
    return this.request(`/projects/${projectId}/volumes/`);
  }

  async createVolume(projectId, volumeData) {
    return this.request(`/projects/${projectId}/volumes/create/`, {
      method: 'POST',
      body: JSON.stringify(volumeData),
    });
  }

  async updateVolume(projectId, volumeId, volumeData) {
    return this.request(`/projects/${projectId}/volumes/${volumeId}/`, {
      method: 'PUT',
      body: JSON.stringify(volumeData),
    });
  }

  async deleteVolume(projectId, volumeId) {
    return this.request(`/projects/${projectId}/volumes/${volumeId}/`, {
      method: 'DELETE',
    });
  }

  async updateVolumeName(projectId, volumeId, newName) {
    return this.request(`/projects/${projectId}/volumes/${volumeId}/update-name/`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    });
  }

  // Scene history endpoints
  async getSceneHistory(projectId) {
    return this.request(`/projects/${projectId}/history/`);
  }

  // CSG operation endpoints
  async getCSGOperations(projectId) {
    return this.request(`/projects/${projectId}/csg-operations/`);
  }

  async createCSGOperation(projectId, csgData) {
    return this.request(`/projects/${projectId}/csg-operations/`, {
      method: 'POST',
      body: JSON.stringify(csgData),
    });
  }

  // Complete scene save/load endpoints
  async saveCompleteScene(sceneData) {
    return this.request('/projects/save-complete-scene/', {
      method: 'POST',
      body: JSON.stringify(sceneData),
    });
  }

  async loadCompleteScene(projectId) {
    return this.request(`/projects/${projectId}/load-complete-scene/`);
  }

  // Utility methods for scene data conversion
  convertSceneToBackendFormat(sceneData) {
    // Convert frontend scene data to backend format
    const {
      project,
      sceneConfig,
      geometries,
      compositions,
      spectra,
      volumes,
      history,
      csgOperations
    } = sceneData;

    return {
      project: {
        name: project.name,
        description: project.description,
        is_public: project.isPublic || false,
      },
      scene_config: {
        camera_position: sceneConfig.cameraPosition,
        camera_rotation: sceneConfig.cameraRotation,
        camera_type: sceneConfig.cameraType,
        camera_fov: sceneConfig.cameraFov,
        camera_near: sceneConfig.cameraNear,
        camera_far: sceneConfig.cameraFar,
        background_color: sceneConfig.backgroundColor,
        ambient_light_intensity: sceneConfig.ambientLightIntensity,
        directional_light_intensity: sceneConfig.directionalLightIntensity,
        grid_size: sceneConfig.gridSize,
        grid_divisions: sceneConfig.gridDivisions,
        floor_constraint_enabled: sceneConfig.floorConstraintEnabled,
        floor_level: sceneConfig.floorLevel,
      },
      geometries: geometries.map(geom => ({
        name: geom.name,
        geometry_type: geom.type,
        position: geom.position,
        rotation: geom.rotation,
        scale: geom.scale,
        color: geom.color,
        opacity: geom.opacity,
        transparent: geom.transparent,
        geometry_parameters: geom.parameters,
        user_data: geom.userData,
        transform_controls_enabled: geom.transformControlsEnabled,
        transform_mode: geom.transformMode,
      })),
      compositions: compositions.map(comp => ({
        name: comp.name,
        density: comp.density,
        color: comp.color,
        elements: comp.elements,
      })),
      spectra: spectra.map(spec => ({
        name: spec.name,
        spectrum_type: spec.type,
        multiplier: spec.multiplier,
        lines: spec.lines,
        isotopes: spec.isotopes,
      })),
      volumes: volumes.map(vol => ({
        volume_name: vol.name,
        volume_type: vol.type,
        real_density: vol.realDensity,
        tolerance: vol.tolerance,
        is_source: vol.isSource,
        gamma_selection_mode: vol.gammaSelectionMode,
        calculation_mode: vol.calculationMode,
        geometry_id: vol.geometryId,
        composition_id: vol.compositionId,
        spectrum_id: vol.spectrumId,
      })),
      history: history.map(hist => ({
        action_name: hist.actionName,
        scene_state: hist.sceneState,
      })),
      csg_operations: csgOperations.map(csg => ({
        operation_type: csg.operationType,
        source_objects: csg.sourceObjects,
        result_object_id: csg.resultObjectId,
      })),
    };
  }

  convertBackendToSceneFormat(backendData) {
    // Convert backend data to frontend scene format
    const {
      project,
      scene_config,
      geometries,
      compositions,
      spectra,
      volumes,
      history,
      csg_operations
    } = backendData;

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        isPublic: project.is_public,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
      sceneConfig: {
        cameraPosition: scene_config.camera_position,
        cameraRotation: scene_config.camera_rotation,
        cameraType: scene_config.camera_type,
        cameraFov: scene_config.camera_fov,
        cameraNear: scene_config.camera_near,
        cameraFar: scene_config.camera_far,
        backgroundColor: scene_config.background_color,
        ambientLightIntensity: scene_config.ambient_light_intensity,
        directionalLightIntensity: scene_config.directional_light_intensity,
        gridSize: scene_config.grid_size,
        gridDivisions: scene_config.grid_divisions,
        floorConstraintEnabled: scene_config.floor_constraint_enabled,
        floorLevel: scene_config.floor_level,
      },
      geometries: geometries.map(geom => ({
        id: geom.id,
        name: geom.name,
        type: geom.geometry_type,
        position: geom.position,
        rotation: geom.rotation,
        scale: geom.scale,
        color: geom.color,
        opacity: geom.opacity,
        transparent: geom.transparent,
        parameters: geom.geometry_parameters,
        userData: geom.user_data,
        transformControlsEnabled: geom.transform_controls_enabled,
        transformMode: geom.transform_mode,
      })),
      compositions: compositions.map(comp => ({
        id: comp.id,
        name: comp.name,
        density: comp.density,
        color: comp.color,
        elements: comp.elements,
      })),
      spectra: spectra.map(spec => ({
        id: spec.id,
        name: spec.name,
        type: spec.spectrum_type,
        multiplier: spec.multiplier,
        lines: spec.lines,
        isotopes: spec.isotopes,
      })),
      volumes: volumes.map(vol => ({
        id: vol.id,
        name: vol.volume_name,
        type: vol.volume_type,
        realDensity: vol.real_density,
        tolerance: vol.tolerance,
        isSource: vol.is_source,
        gammaSelectionMode: vol.gamma_selection_mode,
        calculationMode: vol.calculation_mode,
        geometryId: vol.geometry?.id,
        compositionId: vol.composition?.id,
        spectrumId: vol.spectrum?.id,
      })),
      history: history.map(hist => ({
        id: hist.id,
        actionName: hist.action_name,
        sceneState: hist.scene_state,
        timestamp: hist.timestamp,
      })),
      csgOperations: csg_operations.map(csg => ({
        id: csg.id,
        operationType: csg.operation_type,
        sourceObjects: csg.source_objects,
        resultObjectId: csg.result_object?.id,
      })),
    };
  }

  // Complete Project Management
  async createCompleteProject(projectData) {
    return await this.request('/projects/complete/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getCompleteProject(projectId) {
    return await this.request(`/projects/complete/${projectId}/`);
  }

  async updateCompleteProject(projectId, projectData) {
    return await this.request(`/projects/complete/${projectId}/update/`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
