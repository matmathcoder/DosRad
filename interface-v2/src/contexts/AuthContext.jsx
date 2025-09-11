import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { migrateTemporaryProjectToPermanent } from '../utils/projectInitializer.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, onProjectMigration }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await apiService.checkAuthStatus();
        setUser(response.user);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      // Clear invalid token
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      setUser(response.user);
      
      // Migrate temporary project to permanent if callback is provided
      if (onProjectMigration) {
        try {
          await onProjectMigration();
        } catch (migrationError) {
          console.warn('Project migration failed:', migrationError);
          // Don't fail login if migration fails
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await apiService.register(userData);
      setUser(response.user);
      
      // Migrate temporary project to permanent if callback is provided
      if (onProjectMigration) {
        try {
          await onProjectMigration();
        } catch (migrationError) {
          console.warn('Project migration failed:', migrationError);
          // Don't fail signup if migration fails
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      setUser(response);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
