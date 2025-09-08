import BaseApiService from './BaseApiService.js';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export default class AuthService extends BaseApiService {
  // Register a new user
  async register(userData) {
    return this.post('/auth/register/', userData);
  }

  // Login user
  async login(credentials) {
    const response = await this.post('/auth/login/', credentials);
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Logout user
  async logout() {
    try {
      await this.post('/auth/logout/', {});
    } finally {
      this.clearToken();
    }
  }

  // Get user profile
  async getProfile() {
    return this.get('/auth/profile/');
  }

  // Update user profile
  async updateProfile(userData) {
    return this.put('/auth/update/', userData);
  }

  // Change user password
  async changePassword(passwordData) {
    return this.post('/auth/change-password/', passwordData);
  }

  // Check authentication status
  async checkAuthStatus() {
    return this.get('/auth/status/');
  }
}
