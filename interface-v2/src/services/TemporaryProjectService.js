/**
 * Temporary Project Service
 * Handles temporary project storage in localStorage for unauthenticated users
 */
export default class TemporaryProjectService {
  constructor() {
    this.storageKey = 'temporary_projects';
    this.currentProjectKey = 'current_temporary_project_id';
  }

  /**
   * Generate a unique temporary project ID using UUID v4
   */
  generateTempProjectId() {
    return `temp_${this.generateUUID()}`;
  }

  /**
   * Generate a UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Create a temporary project
   */
  createTemporaryProject(projectData) {
    const tempProjectId = this.generateTempProjectId();
    const tempProject = {
      id: tempProjectId,
      ...projectData,
      is_temporary: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to localStorage
    const projects = this.getAllTemporaryProjects();
    projects[tempProjectId] = tempProject;
    this.saveAllTemporaryProjects(projects);

    // Set as current project
    this.setCurrentTemporaryProjectId(tempProjectId);

    return tempProject;
  }

  /**
   * Get a temporary project by ID
   */
  getTemporaryProject(projectId) {
    const projects = this.getAllTemporaryProjects();
    return projects[projectId] || null;
  }

  /**
   * Update a temporary project
   */
  updateTemporaryProject(projectId, projectData) {
    const projects = this.getAllTemporaryProjects();
    if (projects[projectId]) {
      projects[projectId] = {
        ...projects[projectId],
        ...projectData,
        updated_at: new Date().toISOString()
      };
      this.saveAllTemporaryProjects(projects);
      return projects[projectId];
    }
    return null;
  }

  /**
   * Delete a temporary project
   */
  deleteTemporaryProject(projectId) {
    const projects = this.getAllTemporaryProjects();
    if (projects[projectId]) {
      delete projects[projectId];
      this.saveAllTemporaryProjects(projects);
      
      // If this was the current project, clear it
      if (this.getCurrentTemporaryProjectId() === projectId) {
        this.clearCurrentTemporaryProjectId();
      }
      
      return true;
    }
    return false;
  }

  /**
   * Get all temporary projects
   */
  getAllTemporaryProjects() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading temporary projects:', error);
      return {};
    }
  }

  /**
   * Save all temporary projects
   */
  saveAllTemporaryProjects(projects) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving temporary projects:', error);
    }
  }

  /**
   * Get current temporary project ID
   */
  getCurrentTemporaryProjectId() {
    return localStorage.getItem(this.currentProjectKey);
  }

  /**
   * Set current temporary project ID
   */
  setCurrentTemporaryProjectId(projectId) {
    localStorage.setItem(this.currentProjectKey, projectId);
  }

  /**
   * Clear current temporary project ID
   */
  clearCurrentTemporaryProjectId() {
    localStorage.removeItem(this.currentProjectKey);
  }

  /**
   * Get current temporary project
   */
  getCurrentTemporaryProject() {
    const projectId = this.getCurrentTemporaryProjectId();
    return projectId ? this.getTemporaryProject(projectId) : null;
  }

  /**
   * Check if a project ID is temporary
   */
  isTemporaryProject(projectId) {
    return projectId && projectId.startsWith('temp_');
  }

  /**
   * Clean up old temporary projects (older than 7 days)
   */
  cleanupOldTemporaryProjects() {
    const projects = this.getAllTemporaryProjects();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    let cleaned = false;
    Object.keys(projects).forEach(projectId => {
      const project = projects[projectId];
      const createdAt = new Date(project.created_at);
      if (createdAt < sevenDaysAgo) {
        delete projects[projectId];
        cleaned = true;
      }
    });

    if (cleaned) {
      this.saveAllTemporaryProjects(projects);
    }
  }

  /**
   * Migrate temporary project to permanent (when user logs in)
   */
  async migrateTemporaryProjectToPermanent(tempProjectId, apiService) {
    const tempProject = this.getTemporaryProject(tempProjectId);
    if (!tempProject) {
      throw new Error('Temporary project not found');
    }

    // Create permanent project
    const permanentProject = await apiService.createProject({
      name: tempProject.name,
      description: tempProject.description,
      is_public: tempProject.is_public || false
    });

    // Delete temporary project
    this.deleteTemporaryProject(tempProjectId);

    return permanentProject;
  }
}
