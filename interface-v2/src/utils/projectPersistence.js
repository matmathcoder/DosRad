/**
 * Project persistence utility functions for managing project state in localStorage
 */

// Storage keys
const STORAGE_KEYS = {
  CURRENT_PROJECT: 'currentProjectId',
  LAST_SAVED_PROJECT: 'lastSavedProject',
  TEMPORARY_PROJECTS: 'temporary_projects'
};

/**
 * Save project data to localStorage
 * @param {Object} project - The project data to save
 */
export function saveProjectToLocalStorage(project) {
  if (!project || !project.id) return;
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, project.id);
  localStorage.setItem(STORAGE_KEYS.LAST_SAVED_PROJECT, JSON.stringify(project));
}

/**
 * Load project data from localStorage
 * @returns {Object|null} The loaded project data or null if not found
 */
export function loadProjectFromLocalStorage() {
  const currentProjectId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
  if (!currentProjectId) return null;
  
  const projectData = localStorage.getItem(STORAGE_KEYS.LAST_SAVED_PROJECT);
  if (!projectData) return null;
  
  try {
    return JSON.parse(projectData);
  } catch (error) {
    console.error('Failed to parse project data from localStorage:', error);
    return null;
  }
}

/**
 * Clear project data from localStorage
 */
export function clearProjectFromLocalStorage() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
  localStorage.removeItem(STORAGE_KEYS.LAST_SAVED_PROJECT);
}

/**
 * Check if a project ID is a valid UUID format
 * @param {string} projectId - The project ID to check
 * @returns {boolean} True if the ID is a valid UUID format
 */
export function isValidUUID(projectId) {
  if (!projectId) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(projectId);
}

/**
 * Check if a project ID is a temporary project ID
 * @param {string} projectId - The project ID to check
 * @returns {boolean} True if the ID is a temporary project ID
 */
export function isTemporaryProjectId(projectId) {
  return projectId && projectId.startsWith('temp_');
}

/**
 * Migrate old localStorage data to new format
 * Clears old integer-based project IDs and invalid data
 */
export function migrateLocalStorageData() {
  const currentProjectId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
  
  // If current project ID is not a valid UUID or temporary project, clear it
  if (currentProjectId && !isValidUUID(currentProjectId) && !isTemporaryProjectId(currentProjectId)) {
    console.log('Clearing old integer-based project ID from localStorage:', currentProjectId);
    clearProjectFromLocalStorage();
  }
  
  // Check if the saved project data is valid
  const projectData = localStorage.getItem(STORAGE_KEYS.LAST_SAVED_PROJECT);
  if (projectData) {
    try {
      const project = JSON.parse(projectData);
      if (project.id && !isValidUUID(project.id) && !isTemporaryProjectId(project.id)) {
        console.log('Clearing old integer-based project data from localStorage:', project.id);
        clearProjectFromLocalStorage();
      }
    } catch (error) {
      console.log('Clearing invalid project data from localStorage');
      clearProjectFromLocalStorage();
    }
  }
}

/**
 * Get the current project ID from URL
 * @returns {string|null} The project ID from URL parameters or null if not found
 */
export function getProjectIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('projectId');
}

/**
 * Update URL with project ID without page reload
 * @param {string} projectId - The project ID to set in URL
 */
export function updateURLWithProjectId(projectId) {
  if (!projectId) return;
  
  const newUrl = new URL(window.location);
  newUrl.searchParams.set('projectId', projectId);
  window.history.replaceState({}, '', newUrl);
}
