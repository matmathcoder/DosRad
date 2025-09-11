import apiService from '../services/api.js';
import TemporaryProjectService from '../services/TemporaryProjectService.js';
import { saveProjectToLocalStorage, loadProjectFromLocalStorage, getProjectIdFromURL, updateURLWithProjectId, migrateLocalStorageData } from './projectPersistence';

const tempProjectService = new TemporaryProjectService();

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} Authentication status
 */
async function checkAuthenticationStatus() {
  try {
    const response = await apiService.checkAuthStatus();
    return response && response.user;
  } catch (error) {
    // If we get a 403 or any other error, user is not authenticated
    return false;
  }
}

/**
 * Create a default project for the current user
 * @returns {Promise<Object>} Created project data
 */
export async function createDefaultProject() {
  try {
    const projectData = {
      name: `Scene ${new Date().toLocaleDateString()}`,
      description: 'Auto-created scene project',
      is_public: false,
      geometries: [],
      compositions: [],
      sensors: []
    };
    // Check if user is authenticated
    const isAuthenticated = await checkAuthenticationStatus();
    let project;
    
    if (isAuthenticated) {
      // Create project in backend
      project = await apiService.createProject(projectData);
      // Use UUID if available, otherwise fall back to id
      if (project.uuid) {
        project.id = project.uuid;
      }
    } else {
      // Create temporary project in localStorage
      project = tempProjectService.createTemporaryProject(projectData);
    }

    // Save to localStorage for persistence
    saveProjectToLocalStorage(project);
    
    return project;
  } catch (error) {
    console.error('Failed to create default project:', error);
    throw error;
  }
}

/**
 * Load project by ID
 * @param {string|number} projectId - Project ID to load
 * @returns {Promise<Object>} Project data
 */
export async function loadProjectById(projectId) {
  try {
    // Check if it's a temporary project
    if (tempProjectService.isTemporaryProject(projectId)) {
      const project = tempProjectService.getTemporaryProject(projectId);
      if (project) {
        return project;
      }
      throw new Error('Temporary project not found');
    }
    
    // Load from backend
    const project = await apiService.getProject(projectId);
    // Use UUID if available, otherwise fall back to id
    if (project.uuid) {
      project.id = project.uuid;
    }
    
    return project;
  } catch (error) {
    console.error('Failed to load project:', error);
    throw error;
  }
}

/**
 * Initialize project - either from URL or localStorage
 * @param {Function} setCurrentProjectId - Function to set the current project ID
 * @returns {Promise<Object|null>} Initialized project data or null if no project found
 */
export async function initializeProject(setCurrentProjectId) {
  try {
    // Migrate old localStorage data (clear integer-based project IDs)
    migrateLocalStorageData();
    
    // Clean up old temporary projects
    tempProjectService.cleanupOldTemporaryProjects();
    
    // First, try to get project ID from URL
    const urlProjectId = getProjectIdFromURL();
    
    if (urlProjectId) {
      console.log('Project ID found in URL:', urlProjectId);
      try {
        const project = await loadProjectById(urlProjectId);
        console.log('Project loaded from URL:', project);
        console.log('Setting current project ID to:', project.id);
        setCurrentProjectId(project.id);
        
        // Save to localStorage for persistence
        saveProjectToLocalStorage(project);
        
        return project;
      } catch (error) {
        console.warn('Failed to load project from URL:', error);
      }
    }
    
    // Check if there's a current project in localStorage
    const savedProject = loadProjectFromLocalStorage();
    if (savedProject) {
      setCurrentProjectId(savedProject.id);
      
      // Update URL to include the project ID
      updateURLWithProjectId(savedProject.id);
      
      return savedProject;
    }
    
    // If no existing project, create a default project
    const project = await createDefaultProject();
    setCurrentProjectId(project.id);
    
    // Update URL to include the new project ID
    updateURLWithProjectId(project.id);
    
    return project;
  } catch (error) {
    console.error('Failed to initialize project:', error);
    throw error;
  }
}

/**
 * Check if a project is temporary
 * @param {string} projectId - Project ID to check
 * @returns {boolean} True if project is temporary
 */
export function isTemporaryProject(projectId) {
  return tempProjectService.isTemporaryProject(projectId);
}

/**
 * Migrate temporary project to permanent (when user logs in)
 * @param {string} projectId - Project ID to migrate
 * @returns {Promise<Object|null>} Migrated project data or null if no project found
 */
export async function migrateTemporaryProjectToPermanent(projectId) {
  try {
    const project = await tempProjectService.migrateTemporaryProjectToPermanent(projectId, apiService);
    if (project) {
      saveProjectToLocalStorage(project);
      updateURLWithProjectId(project.id);
    }
    return project;
  } catch (error) {
    console.error('Failed to migrate project:', error);
    throw error;
  }
}
