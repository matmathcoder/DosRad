import apiService from '../services/api.js';

/**
 * Project Initialization Utility
 * Handles automatic project creation and URL-based project loading
 */

/**
 * Extract project ID from URL parameters
 * @returns {string|null} Project ID from URL or null if not found
 */
export function getProjectIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('projectId');
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
      is_public: false
    };
    
    console.log('Creating default project:', projectData);
    const project = await apiService.createProject(projectData);
    console.log('Default project created:', project);
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
    console.log('Loading project by ID:', projectId);
    const project = await apiService.getProject(projectId);
    console.log('Project loaded:', project);
    return project;
  } catch (error) {
    console.error('Failed to load project:', error);
    throw error;
  }
}

/**
 * Initialize project - either from URL or create default
 * @param {Function} setCurrentProjectId - Function to set the current project ID
 * @returns {Promise<Object>} Initialized project data
 */
export async function initializeProject(setCurrentProjectId) {
  try {
    // First, try to get project ID from URL
    const urlProjectId = getProjectIdFromURL();
    
    if (urlProjectId) {
      console.log('Project ID found in URL:', urlProjectId);
      try {
        const project = await loadProjectById(urlProjectId);
        setCurrentProjectId(project.id);
        return project;
      } catch (error) {
        console.warn('Failed to load project from URL, creating default project instead');
      }
    }
    
    // If no URL project ID or failed to load, create a default project
    console.log('No project ID in URL, creating default project');
    const project = await createDefaultProject();
    setCurrentProjectId(project.id);
    
    // Update URL to include the new project ID
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('projectId', project.id);
    window.history.replaceState({}, '', newUrl);
    
    return project;
  } catch (error) {
    console.error('Failed to initialize project:', error);
    throw error;
  }
}
