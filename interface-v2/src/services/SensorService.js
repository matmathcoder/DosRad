import BaseApiService from './BaseApiService.js';

/**
 * Sensor Service
 * Handles all sensor-related API calls
 */
export default class SensorService extends BaseApiService {
  // Get all sensors for a project
  async getSensors(projectId) {
    return this.get(`/projects/${projectId}/sensors/`);
  }

  // Create a new sensor
  async createSensor(projectId, sensorData) {
    return this.post(`/projects/${projectId}/sensors/`, sensorData);
  }

  // Update an existing sensor
  async updateSensor(projectId, sensorId, sensorData) {
    return this.put(`/projects/${projectId}/sensors/${sensorId}/`, sensorData);
  }

  // Delete a sensor
  async deleteSensor(projectId, sensorId) {
    return this.delete(`/projects/${projectId}/sensors/${sensorId}/`);
  }

  // Update sensor name
  async updateSensorName(projectId, sensorId, newName) {
    return this.patch(`/projects/${projectId}/sensors/${sensorId}/update-name/`, { name: newName });
  }
}
