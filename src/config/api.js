/**
 * API Configuration for e-Raksha-Setu
 * Central configuration for all API endpoints
 */

import { Platform } from 'react-native';

// Determine the correct base URL based on platform and environment
const getBaseURL = () => {
  // For development:
  // - Android Emulator: use 10.0.2.2
  // - iOS Simulator: use localhost
  // - Physical Device: use your computer's local IP (find with ipconfig or ifconfig)
  
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      // For Android emulator, use 10.0.2.2 to access host machine
      // For physical Android device, use your computer's local IP
      return 'http://10.7.19.29:4001'; // Server is running on port 4001
    } else {
      // For iOS simulator or physical device
      return 'http://10.7.19.29:4001'; // Server is running on port 4001
    }
  } else {
    // Production environment - replace with your production server URL
    return 'https://your-production-server.com';
  }
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 10000, // 10 seconds
  ENDPOINTS: {
    // User Management
    REGISTER: '/api/users/register',
    LOGIN: '/api/users/login',
    GET_USER: '/api/users/:address',
    LIST_USERS: '/api/users',
  }
};

// Helper function to build full URL
export const buildURL = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace URL parameters (e.g., :address)
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// API helper functions
export const apiCall = async (endpoint, options = {}) => {
  const url = buildURL(endpoint);
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    
    return { success: false, error: error.message || 'Network request failed' };
  }
};

// Test server connection
export const testConnection = async () => {
  try {
    const url = `${API_CONFIG.BASE_URL}/api/test`;
    console.log('Testing connection to:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✓ Server connection successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('✗ Server connection failed:', error.message);
    return { 
      success: false, 
      error: error.message || 'Cannot connect to server',
      url: `${API_CONFIG.BASE_URL}/api/test`
    };
  }
};

// Specific API functions
export const userAPI = {
  /**
   * Test server connection
   */
  testConnection: testConnection,

  /**
   * Register a new user
   * @param {Object} userData - { address, name, username, password, encryptedPrivateKey }
   */
  register: async (userData) => {
    return apiCall(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login user
   * @param {Object} credentials - { username, password }
   */
  login: async (credentials) => {
    return apiCall(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Get user by address
   * @param {string} address - Wallet address
   */
  getUser: async (address) => {
    const endpoint = API_CONFIG.ENDPOINTS.GET_USER.replace(':address', address);
    return apiCall(endpoint);
  },

  /**
   * List all users (for admin/testing)
   */
  listUsers: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.LIST_USERS);
  },
};

export default {
  API_CONFIG,
  buildURL,
  apiCall,
  userAPI,
};
