/**
 * Base API Service Class
 * Contains common functionality for all API services
 */
export default class BaseApiService {
  constructor(baseURL = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
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

  // Helper method for GET requests
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // Helper method for POST requests
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Helper method for PUT requests
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Helper method for PATCH requests
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Helper method for DELETE requests
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
